'use strict';

// Markdown is parsed locally; raw HTML stays text and the result is sanitized.
const ReportReader = (() => {
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const slug = text => String(text).normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,'-').replace(/^-|-$/g,'');
  let current = null;

  function resolve(target, source, sources) {
    const value=String(target || '').trim();
    if (/^https?:\/\//i.test(value)) {
      try { const url=new URL(value); return ['http:','https:'].includes(url.protocol)?{url:url.href}:null; } catch { return null; }
    }
    if (value.startsWith('#')) {
      try { return {fragment:decodeURIComponent(value.slice(1))}; } catch { return null; }
    }
    if (/^[a-z][a-z\d+.-]*:/i.test(value) || value.startsWith('//') || /[\u0000-\u001f]/.test(value)) return null;
    try {
      const url=new URL(value,'https://archive.invalid/'+source.repo_path);
      if(url.origin!=='https://archive.invalid')return null;
      const path=decodeURIComponent(url.pathname).slice(1);
      const found=sources.find(item=>item.repo_path===path);
      return found?{source:found}:null;
    } catch { return null; }
  }

  function render(text, source, sources) {
    const toc=[];
    const renderer=new marked.Renderer();
    renderer.html = token => safe(token.text);
    renderer.heading = function(token) {
      const inline=this.parser.parseInline(token.tokens);
      const scratch=document.createElement('div');
      scratch.innerHTML=DOMPurify.sanitize(inline);
      const label=scratch.textContent;
      const id='report-heading-'+toc.length;
      toc.push({id,label,depth:token.depth,slug:slug(label)});
      return `<h${token.depth} id="${id}">${inline}</h${token.depth}>`;
    };
    renderer.link = function(token) {
      const label=this.parser.parseInline(token.tokens);
      const resolved=resolve(token.href,source,sources);
      if(resolved?.source)return `<button type="button" class="report-source-link" data-source="${safe(resolved.source.id)}">${label}</button>`;
      if(resolved?.fragment)return `<button type="button" class="report-source-link" data-report-fragment="${safe(resolved.fragment)}">${label}</button>`;
      if(resolved?.url)return `<a href="${safe(resolved.url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      return `${label} <span class="report-unlinked">(${safe(token.href)})</span>`;
    };
    renderer.image = function(token) {
      const resolved=resolve(token.href,source,sources);
      const item=resolved?.source;
      if(item && ['png','jpg','jpeg','webp','gif'].includes(item.format) && (!window.NEUROGRAPH_PUBLIC || item.public_url)) {
        const url=window.NEUROGRAPH_PUBLIC?item.public_url:'/api/source/'+encodeURIComponent(item.id);
        return `<figure><img src="${safe(url)}" alt="${safe(token.text)}" loading="lazy"><figcaption>${safe(token.text)}</figcaption></figure>`;
      }
      if(resolved?.url)return `<a href="${safe(resolved.url)}" target="_blank" rel="noopener noreferrer">查看图片：${safe(token.text || token.href)}</a>`;
      return `<span class="report-unlinked">图片：${safe(token.text)} (${safe(token.href)})</span>`;
    };
    const table=renderer.table;
    renderer.table = function(token) { return `<div class="report-table" role="region" tabindex="0" aria-label="报告表格，可左右滚动">${table.call(this,token)}</div>`; };
    const parser=new marked.Marked({renderer,gfm:true,breaks:false});
    const html=DOMPurify.sanitize(parser.parse(String(text || '')),{
      ALLOWED_TAGS:['h1','h2','h3','h4','h5','h6','p','br','hr','strong','em','del','blockquote','ul','ol','li','pre','code','table','thead','tbody','tr','th','td','a','button','span','div','figure','figcaption','img','input'],
      ALLOWED_ATTR:['id','class','href','target','rel','type','disabled','checked','start','align','scope','role','tabindex','aria-label','alt','src','loading','data-source','data-report-fragment'],
      ALLOW_DATA_ATTR:false
    });
    return {html,toc};
  }

  function mount(source, preview) {
    const root=document.querySelector('#source-content');
    if(!root)return;
    if(!['md','markdown'].includes(String(source.format).toLowerCase())) {
      root.innerHTML=linkedReport(preview.content,source)+(preview.truncated?'<p class="notice">仅预览前200 KB，请下载原文件查看完整内容。</p>':'');
      return;
    }
    let parsed;
    try { parsed=render(preview.content,source,data.sources); }
    catch(error) {
      console.error('Report rendering failed:',error.message);
      root.textContent='正文排版未能完成，以下保留原文。\n\n'+preview.content;
      return;
    }
    current={root,source,text:preview.content,toc:parsed.toc};
    document.querySelector('#detail-dialog').classList.add('report-dialog');
    root.className='source-content report-preview';
    root.innerHTML=`<div class="report-preview-tools"><div class="reader-modes" role="group" aria-label="报告显示方式"><button type="button" data-report-mode="reading" aria-pressed="true">阅读正文</button><button type="button" data-report-mode="original" aria-pressed="false">查看原文</button></div><span>${preview.truncated?'仅预览前200 KB，完整内容请下载原文件。':'按原报告排版，数值、结论与限制保持原文。'}</span></div><div class="report-reader"><nav class="report-toc" aria-label="报告目录"><strong>本文目录</strong>${parsed.toc.length?parsed.toc.map(item=>`<button type="button" class="toc-level-${item.depth}" data-report-anchor="${item.id}">${safe(item.label)}</button>`).join(''):'<p>本文没有分节标题。</p>'}</nav><article class="report-prose" tabindex="0" aria-label="报告正文">${parsed.html}</article></div><pre class="report-original" tabindex="0" aria-label="报告原文" hidden></pre>`;
    root.querySelector('.report-original').textContent=preview.content;
    root.dataset.readerReady='true';
  }

  function mode(value) {
    if(!current?.root.isConnected)return;
    const original=value==='original';
    current.root.querySelector('.report-reader').hidden=original;
    current.root.querySelector('.report-original').hidden=!original;
    current.root.querySelectorAll('[data-report-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.reportMode===value)));
  }

  document.addEventListener('click',event=>{
    const button=event.target.closest('button');
    if(!button || !current?.root.isConnected)return;
    if(button.dataset.reportMode)mode(button.dataset.reportMode);
    let id=button.dataset.reportAnchor;
    if(button.dataset.reportFragment)id=current.toc.find(item=>item.slug===slug(button.dataset.reportFragment))?.id;
    if(id && current.root.contains(button)) {
      const heading=current.root.querySelector('#'+id);
      heading?.scrollIntoView({block:'start',behavior:'instant'});
      current.root.querySelectorAll('[data-report-anchor]').forEach(link=>{
        if(link.dataset.reportAnchor===id)link.setAttribute('aria-current','location');
        else link.removeAttribute('aria-current');
      });
    }
  });
  return {render,mount,resolve};
})();

(() => {
  'use strict';
  const base = new URL('.', document.currentScript.src);
  const kinds = {meeting:'会议', classroom:'课堂'};
  const scopes = {summary:'依据已有总结', transcript_and_summary:'原文与总结已归档', reviewed_transcript_summary:'依据本地转写核查'};
  let loaded, sequence = 0;
  const esc = value => String(value??'').replace(/[&<>"']/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function load() {
    if(!loaded)loaded=fetch(new URL('guidance.json',base)).then(response=>{
      if(!response.ok)throw new Error(`建议记录读取失败（${response.status}）`);
      return response.json();
    }).catch(error=>{loaded=undefined;throw error;});
    return loaded;
  }
  async function show(project) {
    const token=++sequence, host=document.querySelector('#view-guidance');
    host.innerHTML='<p role="status">正在读取会议与课堂建议…</p>';
    try {
      const library=await load();
      if(token!==sequence || !location.hash.startsWith('#guidance'))return;
      const records=library.records, requested=new URLSearchParams(location.hash.split('?')[1]||'').get('node');
      if(requested && !records.some(item=>item.id===requested))throw new Error('未找到该建议节点，请从历史记录中选择。');
      host.innerHTML=`<header class="page-heading"><div><span class="eyebrow">MEETINGS & DIRECTION</span><h1>导师建议</h1><p>按记录日期回看方向要求，点击节点查看详细说明。</p></div><a class="button" href="#evidence?section=meetings">会议原文与总结 ↗</a></header>
        <section class="guidance-workspace" aria-label="方向建议时间线">
        <div class="guidance-scroll" tabindex="0" role="region" aria-label="可拖动、滑动或使用方向键浏览的建议流程图"><ol class="guidance-flow">${records.map((item,index)=>`<li data-guidance-position="${index}"><button type="button" class="guidance-node" data-guidance-id="${esc(item.id)}" aria-controls="guidance-detail" aria-expanded="false"><span class="guidance-date"><time datetime="${esc(item.date)}">${esc(item.date)}</time><small>${kinds[item.kind]}</small></span><strong>${esc(item.title)}</strong><ul>${item.preview.map(text=>`<li>${esc(text)}</li>`).join('')}</ul><span class="guidance-node-foot">${esc(scopes[item.sourceScope])}<span aria-hidden="true">展开 ↓</span></span></button>${index<records.length-1?'<span class="guidance-arrow" aria-hidden="true">→</span>':''}</li>`).join('')}</ol></div>
        ${records.length?'':'<p>尚未登记已核查的会议或课堂建议。</p>'}</section>
        <section id="guidance-detail" class="guidance-detail" role="region" aria-labelledby="guidance-detail-title" hidden></section>`;
      const scroll=host.querySelector('.guidance-scroll'), detail=host.querySelector('#guidance-detail');
      const buttons=[...host.querySelectorAll('[data-guidance-id]')];
      const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
      const behavior=reduced?'instant':'smooth';
      let pan, suppressClick=false;
      scroll.addEventListener('pointerdown',event=>{
        if(event.pointerType!=='mouse'||event.button!==0)return;
        suppressClick=false;pan={id:event.pointerId,x:event.clientX,y:event.clientY,left:scroll.scrollLeft,active:false};
      });
      scroll.addEventListener('pointermove',event=>{
        if(!pan||pan.id!==event.pointerId)return;
        const dx=event.clientX-pan.x,dy=event.clientY-pan.y;
        if(!pan.active && Math.abs(dx)>6 && Math.abs(dx)>Math.abs(dy)){pan.active=true;scroll.setPointerCapture(event.pointerId);scroll.classList.add('is-panning');}
        if(pan.active){event.preventDefault();scroll.scrollLeft=pan.left-dx;}
      });
      const finishPan=event=>{
        if(!pan||pan.id!==event.pointerId)return;
        suppressClick=pan.active;pan=undefined;scroll.classList.remove('is-panning');
        if(scroll.hasPointerCapture(event.pointerId))scroll.releasePointerCapture(event.pointerId);
      };
      scroll.addEventListener('pointerup',finishPan);scroll.addEventListener('pointercancel',finishPan);
      scroll.addEventListener('pointerleave',event=>{if(pan&&!pan.active)finishPan(event);});
      scroll.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();suppressClick=false;}},true);
      scroll.addEventListener('wheel',event=>{
        if(event.ctrlKey||Math.abs(event.deltaX)>=Math.abs(event.deltaY))return;
        const scale=event.deltaMode===1?16:event.deltaMode===2?scroll.clientWidth:1;
        const next=Math.max(0,Math.min(scroll.scrollWidth-scroll.clientWidth,scroll.scrollLeft+event.deltaY*scale));
        if(Math.abs(next-scroll.scrollLeft)>1){event.preventDefault();scroll.scrollLeft=next;}
      },{passive:false});
      const select=(id,focus=false)=>{
        const item=records.find(entry=>entry.id===id);
        if(!item)throw new Error('未登记的建议节点');
        for(const button of buttons){const selected=button.dataset.guidanceId===id;button.setAttribute('aria-expanded',String(selected));button.classList.toggle('is-selected',selected);button.querySelector('.guidance-node-foot>span').textContent=selected?'收起 ↑':'展开 ↓';}
        detail.hidden=false;
        detail.innerHTML=`<header><div><span class="guidance-label">详细说明 · ${esc(item.date)} · ${kinds[item.kind]}</span><h2 id="guidance-detail-title">${esc(item.title)}</h2></div><button type="button" data-guidance-close aria-label="收起详细说明">收起 ×</button></header><p class="guidance-detail-text">${esc(item.detail)}</p><details class="guidance-sources"><summary>整理依据 · ${esc(scopes[item.sourceScope])}</summary><ul>${item.sources.map(source=>{
          const found=project.sources.find(entry=>entry.repo_path===source.file);
          const name=source.file.split('/').at(-1);
          return `<li>${found?`<a href="#evidence?source=${encodeURIComponent(found.id)}">${esc(name)} ↗</a>`:`<span>${esc(name)}（归档摘要）</span>`}<small>${esc(source.locator)}</small></li>`;
        }).join('')}</ul></details>`;
        history.replaceState(null,'','#guidance?node='+encodeURIComponent(id));
        const button=buttons.find(entry=>entry.dataset.guidanceId===id);
        button.scrollIntoView({behavior,inline:'center',block:'nearest'});
        if(matchMedia('(max-width:700px)').matches)detail.scrollIntoView({behavior,block:'nearest'});
        if(focus)button.focus({preventScroll:true});
      };
      const close=()=>{
        detail.hidden=true;
        for(const button of buttons){button.setAttribute('aria-expanded','false');button.classList.remove('is-selected');button.querySelector('.guidance-node-foot>span').textContent='展开 ↓';}
        history.replaceState(null,'','#guidance');
      };
      host.onclick=event=>{
        const node=event.target.closest('[data-guidance-id]');
        if(node){if(node.getAttribute('aria-expanded')==='true')close();else select(node.dataset.guidanceId);}
        if(event.target.closest('[data-guidance-close]')){const selected=buttons.find(button=>button.getAttribute('aria-expanded')==='true');close();selected?.focus({preventScroll:true});}
      };
      host.onkeydown=event=>{
        if(event.target===scroll && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
          event.preventDefault();
          if(event.key==='Home'||event.key==='End')scroll.scrollTo({left:event.key==='Home'?0:scroll.scrollWidth,behavior});
          else scroll.scrollBy({left:(event.key==='ArrowLeft'?-1:1)*scroll.clientWidth*.7,behavior});
        }
        const node=event.target.closest('[data-guidance-id]');
        if(event.key==='Escape' && !detail.hidden){const selected=buttons.find(button=>button.getAttribute('aria-expanded')==='true');close();selected?.focus({preventScroll:true});}
        if(node && ['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
          event.preventDefault();const position=buttons.indexOf(node), next=event.key==='Home'?0:event.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,position+(event.key==='ArrowLeft'?-1:1)));
          buttons[next].focus({preventScroll:true});buttons[next].scrollIntoView({inline:'center',block:'nearest',behavior});
        }
      };
      if(requested)select(requested);
      else scroll.scrollLeft=scroll.scrollWidth;
    } catch(error) {
      if(token!==sequence)return;
      host.innerHTML=`<h1>导师建议</h1><p role="alert">${esc(error.message)}</p><a href="#guidance">浏览全部建议</a> <button type="button" id="guidance-retry">重新读取</button>`;
      host.querySelector('#guidance-retry').onclick=()=>show(project);
    }
  }
  window.GuidanceTimeline={show};
})();

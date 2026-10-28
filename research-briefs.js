'use strict';

/* This layer changes reading order only. Original metrics, statuses and sources stay intact. */
const ResearchBriefs = (() => {
  const copy = researchBriefCopy;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const recordKey = record => record.id || `${record.date || ''}|${record.title || ''}`;
  const snapshot = () => typeof data === 'undefined' ? null : data;
  const normal = text => String(text || '').replace(/\s+/g, ' ').trim();
  const textIndex = new Map(Object.entries(copy.texts).map(([text, b]) => [normal(text), b]));
  const sourceKeys = Object.keys(copy.source_map).sort((a,b) => b.length-a.length);

  function fromSource(id) {
    if (!id) return null;
    const exact = copy.source_map[id];
    const ids = exact || copy.source_map[sourceKeys.find(key => id.startsWith(key + '-'))];
    return ids?.length ? copy.history[ids[ids.length-1]] : null;
  }

  function fields(b, showDate=false) {
    const rows = [...(showDate ? [['日期',b.date]] : []), ['模型',b.model], ['数据',b.dataset], ['工作',b.action], ['性能变化',b.impact], ['修改板块',b.module]];
    return `<dl class="research-brief">${rows.map(([label,value])=>`<div class="brief-${label==='性能变化'?'impact':label==='工作'?'action':'field'}"><dt>${label}</dt><dd>${esc(value)}${label==='性能变化'?baselineNotes(b.paper_baseline_ids):''}</dd></div>`).join('')}</dl>${b.scope?`<p class="brief-scope">${esc(b.scope)}</p>`:''}`;
  }

  function baselineNotes(ids=[]) {
    if(!ids.length)return '';
    return `<aside class="paper-baseline-note" aria-label="原论文baseline">${ids.map(id=>{
      const item=copy.paper_baselines.entries[id];
      const label=item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">${esc(item.label)} ↗</a>`:esc(item.label);
      return `<div><strong>原论文 baseline · ${label}</strong><p>${esc(item.reference)}</p><small>${esc(item.conditions)}</small></div>`;
    }).join('')}</aside>`;
  }

  function annotateRemainingAuc(root) {
    for(const node of root.querySelectorAll('p, td')) {
      if(node.dataset.paperBaseline || node.closest('details, [data-research-brief], .research-brief, .paper-baseline-note, .source-content, #research-inspector'))continue;
      const text=node.textContent;
      if(!/(?:AUC|AUROC)[^。；]*\d|百分点/i.test(text))continue;
      const context=text+' '+(node.closest('section, article')?.querySelector('h2, h3')?.textContent || '');
      const ids=[...new Set(copy.paper_baselines.rules.filter(rule=>new RegExp(rule.pattern,'i').test(context)).flatMap(rule=>rule.ids))];
      if(!ids.length)ids.push('own_experiment');
      node.dataset.paperBaseline='true';
      node.insertAdjacentHTML(node.tagName==='TD'?'beforeend':'afterend',baselineNotes(ids));
    }
  }

  function historyCard(m) {
    const b = copy.history[recordKey(m)]||copy.legacy[`${m.date}|${m.title}`]||{};
    const item=ResearchWorkbench.forRecord(m);
    const modelIds=item?.executionModelIds?.length?item.executionModelIds:item?.modelIds;
    const models=modelIds?.map(id=>{const model=ResearchWorkbench.index.models.find(row=>row.id===id);return `<a href="${esc(ResearchWorkbench.href(item,id))}">${esc(model.name)}</a>`;}).join(' · ')||esc(b.model||'数据与资料整理');
    const datasets=item?.datasetIds.map(id=>ResearchWorkbench.datasetLink(id,item)).join(' · ')||esc(b.dataset||'数据编号待核定');
    const numeric=item?.resultRows.some(row=>Number.isFinite(row.auc)||Object.keys(row.otherMetrics).length);
    const links = (m.sources || []).map((id,i)=>evidenceLink(id,`依据 ${i+1} ↗`)).join(' ');
    return `<article data-research-brief="history"><time>${esc(m.date)}</time><div><h3 class="history-models">${models}</h3><div class="history-dataset-ids">${datasets}</div>${numeric?ResearchWorkbench.resultTable(item):`<p class="history-result-text">${esc(b.impact||m.result||m.summary||m.detail||'结果见原记录')}</p>`}${numeric&&m.label?`<p class="history-result-verdict">${esc(m.label)}</p>`:''}${item?.resultRows.some(row=>Number.isFinite(row.auc))?ResearchWorkbench.baselineHTML(item.baselineIds):''}<details class="brief-notes"><summary>工作、完整结果与依据</summary><h4>${esc(m.title)}</h4>${b.action?`<p>工作：${esc(b.action)}</p>`:''}${b.dataset?`<p>数据口径：${esc(b.dataset)}</p>`:''}${b.impact?`<p>${esc(b.impact)}</p>`:''}<dl class="brief-original">${m.summary&&m.summary!==m.result?`<dt>原摘要</dt><dd>${esc(m.summary)}</dd>`:''}<dt>原结果</dt><dd>${esc(m.result||m.detail)}</dd><dt>具体方法</dt><dd>${esc(m.method)}</dd><dt>限制</dt><dd>${esc(m.boundary||b.scope)}</dd><dt>下一步</dt><dd>${esc(m.next)}</dd></dl><div class="history-sources">${links}</div></details></div></article>`;
  }

  function sectionBrief(node) {
    for (const p of node.querySelectorAll(':scope > p, :scope > div > p')) {
      if (p.closest('details') || p.closest('[data-research-brief]')) continue;
      const b = textIndex.get(normal(p.textContent));
      if (b) return b;
    }
    const sources = [...node.querySelectorAll(':scope > .ds-foot [data-source], :scope > .conclusion-actions [data-source]')];
    for (const source of sources) {
      const b = fromSource(source.dataset.source);
      if (b) return b;
    }
    for (const link of node.querySelectorAll(':scope > a[href*="#evidence?source="]')) {
      const b = fromSource(new URL(link.href).hash.split('source=')[1]?.split('&')[0]);
      if (b) return b;
    }
    return null;
  }

  function notesBlock(label) {
    const details = document.createElement('details');
    details.className = 'brief-notes';
    const summary = document.createElement('summary');
    summary.textContent = label;
    details.append(summary);
    return details;
  }

  function convertSection(node, b) {
    if (!b || node.dataset.researchBrief) return;
    const heading = node.querySelector(':scope > h2, :scope > h3, :scope > strong, :scope > header h2, :scope > div h2');
    if (!heading) return;
    node.dataset.researchBrief = 'section';
    const details = notesBlock('参数、完整比较与依据');
    let headingContainer=heading;
    while(headingContainer.parentElement!==node)headingContainer=headingContainer.parentElement;
    const keep = new Set([headingContainer]);
    if(b.title)heading.textContent=b.title;
    for (const child of [...node.children]) {
      if (child.matches('.eyebrow, .ds-foot, .conclusion-actions, .conclusion-meta')) keep.add(child);
    }
    for (const child of [...node.childNodes]) {
      if (!keep.has(child)) details.append(child);
    }
    // Method pages start with the same concise description. Parameters stay opt-in.
    for (const nested of details.querySelectorAll('details[open]')) nested.open = false;
    heading.insertAdjacentHTML('afterend', fields(b, true));
    node.append(details);
  }

  function shortenParagraph(p) {
    if (p.closest('details, [data-research-brief], pre, .report-reader, .source-preview') || p.dataset.briefShort) return;
    const text = normal(p.textContent);
    if (text.length < 180 || p.querySelector('button, a, input, select')) return;
    if (p.matches('.workspace-boundary, .latest-boundary, .brief-scope, [role="alert"]')) return;
    const b = textIndex.get(text);
    if (b) {
      p.dataset.briefShort='true';
      const details=notesBlock('展开原说明与具体设置');
      p.before(details);details.append(p);
      details.insertAdjacentHTML('beforebegin',`<div class="brief-inline" data-research-brief="inline">${fields(b,true)}</div>`);
      return;
    }
    const sentences=text.split(/(?<=[。！？])/u).filter(Boolean);
    const outcome=sentences.filter(s=>/未.*(?:改善|增量|证明|训练)|没有.*(?:改善|增量)|不能.*(?:验证|临床)|尚未|AUC|MAE|F1|MSE/.test(s) && s.length<=190);
    const selected=outcome.slice(0,2);
    if (!selected.length || selected.join('').length>=text.length*.85) return;
    p.dataset.briefShort='true';
    const details=notesBlock('展开原说明与具体设置');
    p.before(details);details.append(p);
    const summary=document.createElement('p');summary.className='brief-paragraph';summary.textContent=selected.join('');details.before(summary);
  }

  function present(root=document.querySelector('main')) {
    if (!root) return;
    // Innermost study components are handled first, so a parent cannot swallow their summaries.
    const nodes=[...root.querySelectorAll('.panel, .reading-guide, .reading-guide article, .callout, .fmm-result, .fewshot-geometry, [aria-label^="预训练输入审查"], [aria-label^="疼痛模型复现"], .conclusion-card, .archive-featured')].reverse();
    for (const node of nodes) {
      if (node.dataset.researchBrief || node.matches('.table-panel, .archive-tree, .month-panel, .board-column')) continue;
      convertSection(node, node.matches('.reading-guide')?copy.sections.reading_guide:sectionBrief(node));
    }
    for (const p of root.querySelectorAll('p')) shortenParagraph(p);
    annotateRemainingAuc(root);
    for(const card of root.querySelectorAll('.goal-card[data-goal], .board-card[data-goal]')) {
      const b=copy.goals[card.dataset.goal],p=card.querySelector('p');
      if(!b||!p||p.dataset.briefTask)continue;
      p.dataset.briefTask='true';p.textContent=`${b.model} · ${b.dataset}。${b.action}`;
    }
    // Preserve the historical sample-flow and original reports, but give each old node the same reading fields.
    for (const article of root.querySelectorAll('.ds-timeline > article')) {
      if (article.dataset.researchBrief) continue;
      const title=article.querySelector('h3')?.textContent;
      const date=article.querySelector('time')?.textContent;
      const record=snapshot()?.ds005713_history.milestones.find(item=>item.date===date&&item.title===title);
      if(record)article.outerHTML=historyCard(record);
    }
    const link=root.querySelector('a[download="RECENT_RESEARCH_HISTORY.md"]');
    if (link) {
      const source=snapshot()?.sources.find(s=>s.id==='daily-research-briefs');
      if(source && link.textContent!=='下载每日研究摘要'){link.href=source.public_url || '/api/source/daily-research-briefs';link.download='DAILY_RESEARCH_BRIEFS.md';link.textContent='下载每日研究摘要';}
    }
  }

  function goalDetails(id) {
    const body=document.querySelector('#dialog-body');const b=copy.goals[id];
    if (!body || !b || body.querySelector('.research-brief')) return;
    body.dataset.researchBrief=id;
    const heading=body.querySelector(':scope > h2');
    if (!heading) return;
    const details=notesBlock('执行步骤、完成标准与原始备注');
    for(const child of [...body.children])if(child!==heading && !child.matches('.badge'))details.append(child);
    heading.insertAdjacentHTML('afterend',fields(b));body.append(details);
  }

  function sourceDetails(id) {
    const body=document.querySelector('#dialog-body');
    if(!body || !document.querySelector('#detail-dialog')?.open)return;
    const b=fromSource(id);
    if(body.querySelector('[data-research-brief="report"]'))return;
    if(b){
      const holder=document.createElement('section');holder.className='report-brief';holder.dataset.researchBrief='report';
      holder.innerHTML=`<h3>这份报告记录了什么</h3>${fields(b,true)}`;
      const heading=body.querySelector(':scope > h2');
      if(heading)heading.after(holder);else body.prepend(holder);
    }
    const content=body.querySelector(':scope > .source-content');
    if(content){const notes=notesBlock('展开原报告、参数与完整数据表');notes.classList.add('report-notes');content.before(notes);notes.append(content);}
  }

  function install() {
    if(typeof historyRecord==='function')historyRecord=historyCard;
    if(typeof updateHistoryRecords==='function') {
      updateHistoryRecords=function(){
        const all=data.research_history.milestones,needle=historyBrowse.query.trim().toLowerCase();
        const records=all.map((item,index)=>({item,index})).filter(({item:m})=>(historyBrowse.month==='all'||historyDay(m).startsWith(historyBrowse.month)) && [...Object.values(copy.history[recordKey(m)]||{}),m.title,m.label,m.summary,m.result,m.method,m.boundary,m.next].join(' ').toLowerCase().includes(needle));
        records.sort((a,b)=>historyBrowse.order==='newest'?historyDay(b.item).localeCompare(historyDay(a.item))||b.index-a.index:historyDay(a.item).localeCompare(historyDay(b.item))||a.index-b.index);
        const shown=records.slice(0,historyBrowse.limit);
        document.querySelector('#history-results-count').textContent=`已显示 ${shown.length} 条 · 符合 ${records.length} 条 · 共 ${all.length} 条`;
        document.querySelector('#history-records').innerHTML=shown.length?shown.map(({item})=>historyCard(item)).join(''):'<div class="empty panel"><h3>没有匹配的研究记录</h3><p>换一个模型、数据集或修改板块。</p></div>';
        document.querySelector('#history-more').hidden=shown.length>=records.length;
      };
    }
    if(typeof eventCard==='function') {
      const original=eventCard;
      eventCard=function(event){const html=original(event),b=copy.events[event.id] || copy.history[copy.history_lookup[`${String(event.date || '').slice(0,10)}|${event.title}`]];return b?html.replace('<details>',`${fields(b)}<details class="brief-notes">`):html;};
    }
    if(typeof openGoal==='function') {const original=openGoal;openGoal=function(id){original(id);goalDetails(id);};}
    if(typeof goalCard==='function') {
      const original=goalCard;
      goalCard=function(goal){const b=copy.goals[goal.id];return b?original(goal).replace(/<p>[\s\S]*?<\/p>/,`<p>${esc(b.model)} · ${esc(b.dataset)}。${esc(b.action)}</p>`):original(goal);};
    }
    if(typeof openSource==='function') {const original=openSource;openSource=async function(id){await original(id);sourceDetails(id);};}
    if(typeof renderView==='function') {const original=renderView;renderView=function(){original();present();};}
    for(const name of ['renderConclusions','renderTaskBoard','renderCalendarResults']) {
      if(typeof window[name]==='function'){const original=window[name];window[name]=function(...args){const result=original(...args);present();return result;};}
    }
    if(snapshot())renderView();
    if(!snapshot()){
      for(const [index,article] of [...document.querySelectorAll('article.card')].entries())convertSection(article,copy.papers?.[index]);
      present();
    }
    let queued=false;
    const main=document.querySelector('main');
    if(main)new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{present(main);queued=false;});}).observe(main,{childList:true,subtree:true});
  }
  document.addEventListener('DOMContentLoaded', install, {once:true});
  return {fields,fromSource,present,recordKey};
})();

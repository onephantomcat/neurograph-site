'use strict';

const taskBoardUI={query:'',phase:'all'};
const conclusionUI={query:''};
const conclusionTopics={
  diagnosis:{name:'辅助诊断',note:'患者／对照的开发比较与独立诊断验证分开阅读。不同队列和预算的AUC不放在同一排名中。'},
  severity:{name:'疼痛程度',note:'访谈VAS、实验热痛和近扫描评分分别保留原时点。访谈评分结果不升级为MRI扫描同期疼痛分级。'},
  response:{name:'治疗反应',note:'给定治疗后的变化、治疗前预测疗效和用药决策是不同问题。以下输入准备记录尚不能证明疗效预测有效。'}
};
const conclusionEntries=[
  {key:'cortexmae_pca8',topic:'diagnosis',title:'CortexMAE固定PCA8容量消融',scope:'SRPBS99 · 支持内开发比较'},
  {key:'spd_liebn',topic:'diagnosis',title:'SPDNet＋LieBN支持内比较',scope:'SRPBS99 · 支持内开发比较'},
  {key:'spd_small_sample',topic:'diagnosis',title:'SPD小样本：每类5／10／20人',scope:'SRPBS99 · 支持内开发比较'},
  {key:'spd_transfer',topic:'diagnosis',title:'固定SPD跨队列评估',scope:'ZAN54与Emo53 · 已开发队列探索'},
  {key:'oa_spd',topic:'diagnosis',title:'OA旧GSR小样本分类',scope:'OA37人 · 病例／对照开发比较'},
  {key:'prt_classification',topic:'diagnosis',title:'慢性背痛任务特征分类',scope:'PRT192人 · 人级开发比较'},
  {key:'emo27_vas',topic:'severity',title:'Emo27访谈VAS连续预测',scope:'Emo27 · 访谈VAS，非扫描同期痛'},
  {key:'pain_grading',topic:'severity',title:'访谈疼痛分级',scope:'Emo27 · 研究分箱，非临床等级'},
  {key:'pain_multimodel',topic:'severity',title:'疼痛分级多模型比较',scope:'Emo27 · 多模型探索'},
  {key:'pain_targeted',topic:'severity',title:'疼痛分级：过拟合与论文方法',scope:'Emo27 · 开发性方法比较',source:'pain-targeted-20261018'},
  {key:'music_nearscan',topic:'severity',title:'音乐镇痛扫描与评分对应',scope:'17人 · 输入准备，患者模型比较未启动'},
  {key:'oa_readiness_audit',topic:'response',title:'OA治疗反应输入与QC核查',scope:'输入准备 · 未形成疗效预测验证'},
  {key:'public_pain_processing',topic:'response',title:'OA治疗标签与影像交集（历史记录）',scope:'2026年9月历史快照 · 非当前实时进度'}
];

function goalViewTabs(board) {
  return `<nav class="workspace-view-tabs" aria-label="目标浏览方式"><a href="#goals" ${board?'':'aria-current="page"'}>阶段清单</a><a href="#goals?mode=board" ${board?'aria-current="page"':''}>状态看板</a></nav>`;
}

function goalsPage() {
  const board=routeParams().get('mode')==='board';
  if(!board) {
    goalsListPage();
    document.querySelector('#view-goals .page-heading').insertAdjacentHTML('afterend',goalViewTabs(false));
    return;
  }
  const phases=taskPhases();
  $('#view-goals').innerHTML=`<div class="page-heading"><div><h1>计划与目标</h1><p class="muted">按现有任务状态查看正在推进的工作与阻碍。</p></div><span class="overview-date">记录整理于 ${escapeHTML(data.reviewed_at)}</span></div>${goalViewTabs(true)}<p class="workspace-boundary">看板只读，任务沿用原清单状态。完成项包含阴性实验；任务完成不代表三个临床终点或独立验证已完成。</p><div class="board-toolbar"><label>搜索任务<input id="board-search" type="search" placeholder="目标编号、任务、缺口或交付物" value="${escapeHTML(taskBoardUI.query)}"></label><label>研究阶段<select id="board-phase"><option value="all">全部阶段</option>${phases.map(phase=>`<option value="${escapeHTML(phase.id)}">${escapeHTML(phaseTitle(phase))}</option>`).join('')}</select></label><button class="button" id="board-reset">清除筛选</button><span id="board-count" role="status"></span></div><div class="task-board" tabindex="0" role="region" aria-label="任务状态看板，宽度不足时可左右滚动"></div>`;
  $('#board-phase').value=taskBoardUI.phase;
  $('#board-search').addEventListener('input',event=>{taskBoardUI.query=event.target.value;renderTaskBoard();});
  $('#board-phase').addEventListener('change',event=>{taskBoardUI.phase=event.target.value;renderTaskBoard();});
  $('#board-reset').addEventListener('click',()=>{taskBoardUI.query='';taskBoardUI.phase='all';$('#board-search').value='';$('#board-phase').value='all';renderTaskBoard();});
  renderTaskBoard();
}

function boardGoals() {
  const needle=taskBoardUI.query.trim().toLocaleLowerCase();
  return orderedGoals(data.goals.filter(goal=>(taskBoardUI.phase==='all'||goal.phase===taskBoardUI.phase) && [goal.id,goal.title,goal.summary,goal.next,goal.criteria,goalTitle(goal),goalPurpose(goal),...(goal.student_guide?.steps||[]),goal.student_guide?.deliverable].join(' ').toLocaleLowerCase().includes(needle)));
}

function renderTaskBoard() {
  const visible=boardGoals();
  $('#board-count').textContent=`显示 ${visible.length} / ${data.goals.length} 项任务`;
  $('.task-board').innerHTML=['active','blocked','planned','deferred','done'].map(status=>{
    const items=visible.filter(goal=>goal.status===status);
    return `<section class="board-column board-${status}" aria-label="${escapeHTML(statusNames[status])}"><header><h2><i aria-hidden="true"></i>${escapeHTML(statusNames[status])}</h2><span>${items.length}</span></header><div class="board-cards" tabindex="0" aria-label="${escapeHTML(statusNames[status])}任务列表">${items.length?items.map(goal=>`<button type="button" class="board-card" data-goal="${escapeHTML(goal.id)}"><span class="board-card-id">${escapeHTML(goal.id)}<small>${escapeHTML(phaseTitle(data.phases.find(phase=>phase.id===goal.phase)))}</small></span><h3>${escapeHTML(goalTitle(goal))}</h3><p>${escapeHTML(taskPreview(goalPurpose(goal),90))}</p><span class="board-card-foot">查看任务、步骤与依据 ↗</span></button>`).join(''):'<p class="board-empty">当前筛选下没有任务。</p>'}</div></section>`;
  }).join('');
}

function conclusionRecords(snapshot=data) {
  return conclusionEntries.flatMap(entry=>{
    const record=snapshot[entry.key];
    if(!record)return [];
    const id=entry.source||record.id||record.report_source||record.source;
    const source=snapshot.sources.find(item=>item.id===id);
    return source?[{...entry,record,source}]:[];
  });
}

function conclusionDate(record) {
  if(record.date)return record.date;
  const value=record.observed_at;
  if(value && /^\d{4}-\d{2}-\d{2}T/.test(value) && !Number.isNaN(Date.parse(value))) {
    return new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(value));
  }
  return value || '日期见原报告';
}

function conclusionsPage() {
  const topic=routeParams().get('topic');
  const selected=conclusionTopics[topic]?topic:'all';
  const records=conclusionRecords();
  $('#view-conclusions').innerHTML=`<div class="page-heading"><div><span class="eyebrow">RESEARCH FINDINGS</span><h1>研究结论索引</h1><p class="muted">按三个临床问题查找已有发现、阴性结果和仍缺的证据。</p></div><a class="button" href="#datasets?tab=results">全部实验结果 ↗</a></div><p class="workspace-boundary">这里选取有来源的代表性记录，不替代全部实验目录。各项保留原队列、时间点和验证范围；当前三个临床终点的独立验证均未完成。</p><nav class="conclusion-topics" aria-label="按研究问题浏览"><a href="#conclusions" ${selected==='all'?'aria-current="page"':''}>全部 <span>${records.length}</span></a>${Object.entries(conclusionTopics).map(([key,value])=>`<a href="#conclusions?topic=${key}" ${selected===key?'aria-current="page"':''}>${value.name} <span>${records.filter(entry=>entry.topic===key).length}</span></a>`).join('')}</nav><div class="conclusion-toolbar"><label>搜索结论<input id="conclusion-search" type="search" placeholder="方法、队列、阴性结果或限制" value="${escapeHTML(conclusionUI.query)}"></label><button class="button" id="conclusion-reset">清除关键词</button><span id="conclusion-count" role="status"></span></div><div id="conclusion-results"></div>`;
  $('#conclusion-search').addEventListener('input',event=>{conclusionUI.query=event.target.value;renderConclusions(selected);});
  $('#conclusion-reset').addEventListener('click',()=>{conclusionUI.query='';$('#conclusion-search').value='';renderConclusions(selected);});
  renderConclusions(selected);
}

function renderConclusions(topic) {
  const all=conclusionRecords();
  const needle=conclusionUI.query.trim().toLocaleLowerCase();
  const records=all.filter(entry=>(topic==='all'||entry.topic===topic) && [entry.title,entry.scope,entry.source.label,entry.record.summary,entry.record.interpretation,entry.record.boundary,entry.record.note,entry.record.next].join(' ').toLocaleLowerCase().includes(needle));
  $('#conclusion-count').textContent=`显示 ${records.length} / ${all.length} 条代表性记录`;
  $('#conclusion-results').innerHTML=records.length?Object.entries(conclusionTopics).map(([key,value])=>{
    const entries=records.filter(entry=>entry.topic===key);
    if(!entries.length)return '';
    return `<section class="conclusion-group" aria-labelledby="conclusion-${key}"><div class="conclusion-group-heading"><h2 id="conclusion-${key}">${value.name}</h2><p>${value.note}</p></div><div class="conclusion-grid">${entries.map(({record:r,...entry})=>`<article class="conclusion-card"><div class="conclusion-meta"><span>${escapeHTML(entry.scope)}</span><time>${escapeHTML(conclusionDate(r))}</time></div><h3>${escapeHTML(entry.title)}</h3><p class="conclusion-result">${escapeHTML(r.interpretation||r.summary)}</p>${r.interpretation&&r.summary?`<details><summary>比较范围与主要指标</summary><p>${escapeHTML(r.summary)}</p></details>`:''}<div class="conclusion-limit"><strong>适用范围与限制</strong><p>${escapeHTML(r.boundary||r.note||'按原报告范围解释；独立临床验证尚未完成。')}</p></div>${r.next?`<details><summary>原报告记录的下一步</summary><p>${escapeHTML(r.next)}</p></details>`:''}<div class="conclusion-actions">${evidenceLink(entry.source.id,'阅读完整报告 ↗')}<a class="text-link" href="#evidence?source=${encodeURIComponent(entry.source.id)}">报告固定链接</a></div></article>`).join('')}</div></section>`;
  }).join(''):'<div class="empty panel"><h2>没有匹配的研究记录</h2><p>换一个关键词，或切换到全部研究问题。</p></div>';
}

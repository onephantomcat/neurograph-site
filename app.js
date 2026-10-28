/* Read existing aggregates; this view does not alter experiment or QC state. */
function researchReadingGuide(snapshot, detailed = false) {
  const study = snapshot.pretrained_pain || {};
  const transfer = study.fc_transfer_conditions;
  const scaling = study.fc_target_scaling;
  if (!transfer && !scaling) return '';
  const names = {srpbs79: 'SRPBS79', emo53: 'Emo53'};
  const number = value => Number.isFinite(value) ? value.toFixed(4) : '—';
  const interval = values => Array.isArray(values) ? `[${values.map(number).join(', ')}]` : '—';
  const source = (id, label) => snapshot.sources.some(item => item.id === id) ? evidenceLink(id, label) : '';
  const targets = [...new Set((transfer?.rows || []).map(row => row.target))];
  const transferRows = targets.map(target => {
    const rows = transfer.rows.filter(row => row.target === target && row.representation === 'fc');
    const get = method => rows.find(row => row.method === method && (method === 'source_only' || (row.k === 5 && row.reference === 'target')));
    return `<tr><th scope="row">${escapeHTML(names[target] || target)}</th>${['source_only', 'target_only', 'adaptive'].map(method => `<td>${number(get(method)?.auc)}</td>`).join('')}</tr>`;
  }).join('');
  const comparisons = (transfer?.comparisons || []).filter(row => row.primary && row.k === 5 && row.reference === 'target' && row.representation === 'fc');
  const contrastRows = comparisons.map(row => `<tr><th scope="row">${escapeHTML(names[row.target] || row.target)}</th><td>${row.comparison === 'adaptive - target_only' ? '来源借用 − 目标单独' : '来源借用 − 来源单独'}</td><td>${number(row.delta_auc)}</td><td>${interval(row.ci)}</td></tr>`).join('');
  const scalingRows = (scaling?.primary_rows || []).filter(row => row.primary && row.k === 5 && row.reference === 'target' && row.representation === 'fc').map(row => `<tr><th scope="row">${escapeHTML(names[row.target] || row.target)}</th><td>${number(row.target_scaling_auc)}</td><td>${number(row.delta_auc)}</td><td>${interval(row.ci)}</td></tr>`).join('');
  const scrollTable = (label, headings, rows) => `<div class="reading-table" role="region" tabindex="0" aria-label="${label}，窄屏可左右滑动"><table><caption>${label}</caption><thead><tr>${headings.map(title => `<th scope="col">${title}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table></div><p class="reading-scroll-hint">左右滑动表格，查看完整指标与区间。</p>`;
  return `<section class="reading-guide" aria-label="核心研究结果导读">
    <div class="reading-heading"><div><span class="eyebrow">按研究问题阅读</span><h2>已有证据说明了什么？</h2><p>比较脑影像相对临床资料与强功能连接（FC）的预测增量，解释来源借用和负迁移。</p></div>${source('research-reading-guide-20261004', '阅读成果导读 ↗')}</div>
    <div class="reading-grid">
      ${transfer ? `<article class="panel reading-result"><span class="reading-label">来源借用</span><h3>增加来源数据，收益因目标队列而异</h3>${scrollTable('强FC原策略 · AUC', ['目标队列', '来源单独', '目标单独', '来源借用'], transferRows)}<p class="reading-limit">目标单独与来源借用均为每类5人（K5）、目标参考；来源单独不使用目标监督标签。Emo方向的来源借用低于来源单独，两个方向分别解释。</p>${detailed ? scrollTable('原策略的四项主要配对比较', ['目标队列', '比较', 'ΔAUC', '描述性配对95%区间'], contrastRows) : ''}<div class="reading-actions">${source('fc-transfer-conditions-20261002', '完整迁移报告 ↗')}</div></article>` : ''}
      ${scaling ? `<article class="panel reading-result"><span class="reading-label">标准化敏感性</span><h3>固定目标标准化后，未形成稳定改善</h3>${scrollTable('K5目标参考 · 新策略与原策略', ['目标队列', '新AUC', 'ΔAUC', '描述性配对95%区间'], scalingRows)}<p class="reading-limit">两项差值区间均包含0，不能主张稳定改善、显著恶化或等效。这是已开发队列上的事后分析。</p><div class="reading-actions">${source('fc-target-scaling-20261004', '完整敏感性报告 ↗')}</div></article>` : ''}
    </div>
    <p class="reading-boundary">以上属于SRPBS79与Emo53的开发研究。区间不覆盖全部训练分布、外层划分及研究选择；不能据此声称独立临床验证或影像临床增量。</p>
    <nav class="reading-routes" aria-label="继续阅读"><a href="#datasets?tab=results"><strong>完整实验结果</strong><span>全部方法、参照与限制</span></a><a href="#datasets?tab=methods"><strong>方法说明</strong><span>输入、训练与评价方案</span></a><a href="#datasets?tab=data"><strong>数据概况</strong><span>队列、用途与缺口</span></a><a href="#evidence"><strong>报告与证据</strong><span>查阅原报告和下载材料</span></a></nav>
  </section>`;
}

'use strict';

const $ = (selector) => document.querySelector(selector);
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
let refreshTimer;
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const statusNames = {done:'已完成', active:'进行中', blocked:'受阻', planned:'计划中', deferred:'暂缓'};
const stateNames = {PASS:'数值通过', FAILED:'技术失败', EXCLUDED:'质控排除', REPAIR_PENDING:'待复核', RUNNING:'运行中', COMPLETE:'批次结束', COMPLETE_WITH_FAILURES:'批次结束 · 有未通过', HALTED_GLOBAL_FAULT:'全局暂停', PENDING:'待处理'};
const viewNames = {overview:'项目总览', calendar:'项目日历', history:'研究历程', guidance:'导师建议', workflow:'项目流程', goals:'计划与目标', datasets:'数据与结果', evidence:'报告与证据', conclusions:'研究结论索引', architectures:'模型架构'};
const resolveView = value => { const name=value.split('?')[0]; return name === 'ds005713' ? 'history' : name === 'methods' ? 'datasets' : (viewNames[name] ? name : 'overview'); };
let data = null;
let loading = false;
let view = resolveView(location.hash.slice(1));
let filter = 'all';
let query = '';
let phaseFilter = 'all';
let renderKey = '';
let lastSuccess = 0;
let sourceRequest = 0;

function timeText(value, compact = false) {
  if (!value) return '尚无记录';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('zh-CN', {timeZone:'Asia/Shanghai', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', ...(compact ? {} : {second:'2-digit'}), hour12:false}).format(date);
}
function badge(status) { return `<span class="badge ${escapeHTML(status)}">${escapeHTML(statusNames[status] || stateNames[status] || status)}</span>`; }
function ratioPercent(value, total) {
  const n = Number(value);
  const d = Number(total);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((n / d) * 100)));
}
function progressTrack(value, total, label = '进度', tone = '') {
  const percent = ratioPercent(value, total);
  return `<span class="progress-track${tone ? ' ' + tone : ''}" role="img" aria-label="${escapeHTML(label)} ${percent}%"><i style="width:${percent}%"></i></span>`;
}
function evidenceLink(id, label='查看依据 ↗') { return `<button class="text-link" data-source="${escapeHTML(id)}">${escapeHTML(label)}</button>`; }
function sectionTitle(title, meta='', link='') { return `<div class="section-heading"><h2>${title}</h2><div>${meta}${link}</div></div>`; }
function goalCounts() { return Object.fromEntries(Object.keys(statusNames).map(s => [s, data.goals.filter(g => g.status === s).length])); }
function goalTitle(goal) { return goal.student_guide?.title || goal.title; }
function goalPurpose(goal) { return goal.student_guide?.purpose || goal.summary; }
function phaseTitle(phase) { return data.student_workflow?.phase_names?.[phase.id] || phase.name; }
function taskPhases() {
  const order = data.student_workflow?.phase_order || data.phases.map(p => p.id);
  return [...data.phases].sort((a,b) => order.indexOf(a.id)-order.indexOf(b.id));
}
function orderedGoals(goals) {
  const order = data.student_workflow?.goal_order || data.goals.map(g => g.id);
  return [...goals].sort((a,b) => order.indexOf(a.id)-order.indexOf(b.id));
}
function studentWorkflowPanel(showTerms = false) {
  const guide = data.student_workflow;
  if (!guide) return '';
  return `<section class="panel student-workflow" aria-label="任务执行顺序"><h2>从这里开始</h2><p>${escapeHTML(guide.objective)}</p><div class="student-route-grid">${guide.routes.map((route,i) => `<article><span class="student-step-number">${i+1}</span><h3>${escapeHTML(route.title)}</h3><p>${escapeHTML(route.text)}</p><div class="student-task-links">${route.goals.map(id => { const goal=data.goals.find(g=>g.id===id); return `<button class="text-link" data-goal="${escapeHTML(id)}">${escapeHTML(id+' '+goalTitle(goal))} ↗</button>`; }).join('')}</div></article>`).join('')}</div><p class="data-note">${escapeHTML(guide.pause_note)}</p><p class="data-note">${escapeHTML(guide.note)}</p>${showTerms ? `<details class="student-terms"><summary>缩写看不懂时，查这里</summary><dl>${guide.glossary.map(([term,meaning])=>`<dt>${escapeHTML(term)}</dt><dd>${escapeHTML(meaning)}</dd>`).join('')}</dl></details>` : ''}</section>`;
}
// Cards preview the task; the existing dialog retains the full record.
function taskPreview(text, limit=150) {
  const value=String(text || '').trim();
  if(value.length<=limit) return value;
  const sentences=value.match(/[^。！？]+[。！？]?/g) || [value];
  let result='';
  for(const sentence of sentences) {
    if((result+sentence).length>limit) break;
    result+=sentence;
  }
  return (result || value.slice(0,limit))+'…';
}
function goalCard(goal) {
  return `<button class="goal-card" data-goal="${escapeHTML(goal.id)}"><div class="goal-card-top"><span class="mono">${escapeHTML(goal.id)}</span>${badge(goal.status)}</div><h3>${escapeHTML(goalTitle(goal))}</h3><p>${escapeHTML(taskPreview(goalPurpose(goal)))}</p><div class="goal-bottom"><span>${escapeHTML(phaseTitle(data.phases.find(p => p.id === goal.phase)))}</span><span>查看步骤与交付 ↗</span></div></button>`;
}
function queuePanel() {
  const remote = data.remote;
  const snapshot = remote.snapshot;
  const checked = data.execution_snapshot?.srpbs;
  if (!remote.enabled && checked) return `<div class="panel queue-panel">${sectionTitle('SRPBS 最近核查', '<span class="badge deferred">按需快照</span>')}<div class="queue-header"><div><span class="eyebrow">非临床来源续批</span><h3>队列暂停 · 无活动任务</h3><p>本轮范围 ${checked.total} 人，独立于99人临床训练集。</p></div></div><div class="queue-counts"><div><span>数值通过</span><strong>${checked.pass}</strong></div><div><span>QC排除</span><strong>${checked.excluded}</strong></div><div><span>待处理</span><strong>${checked.pending}</strong></div></div><p class="data-note">${escapeHTML(checked.note || '按用户安排决定是否恢复；新结果单独审核，不能直接计入训练。')}</p><div class="queue-foot"><span>核查 ${timeText(checked.observed_at)}</span>${evidenceLink(data.execution_snapshot.source)}</div><p class="data-note">远端自动采集关闭；以上为按需核查记录。</p></div>`;
  if (!snapshot) return `<div class="panel queue-panel">${sectionTitle('远端采集', '<span class="badge deferred">按需查看</span>')}<div class="empty"><h3>${remote.enabled ? '正在连接处理端' : '远端自动采集已关闭'}</h3><p>${escapeHTML(remote.error || (remote.enabled ? '首次连接需几秒，可先查看已完成内容。' : '最近核查结果见上方执行状态；刷新仅读取本地记录。'))}</p></div></div>`;
  const batch = snapshot.batch;
  const counts = batch.counts || {};
  const stale = remote.stale;
  const runningMarker = batch.state === 'RUNNING';
  const actualState = runningMarker && batch.worker_alive && batch.worker_paused ? '暂停派发 · 当前子任务继续' : (runningMarker && !batch.worker_alive ? '运行标记存在 · 进程已退出' : (stateNames[batch.state] || batch.state));
  const categories = [{key:'pass',name:'数值通过',css:'pass'}, {key:'failed',name:'技术失败',css:'failed'}, {key:'excluded',name:'质控排除',css:'excluded'}, {key:'running',name:'运行中',css:'running'}, {key:'pending',name:'待处理',css:'pending'}, {key:'repair_pending',name:'待复核',css:'review'}];
  const total = batch.scope_total || 0;
  const nonclinical = batch.run_id.includes('nonclinical-');
  const continuation = !nonclinical && batch.run_id.includes('clinical-remaining');
  const batchTitle = nonclinical ? `非临床续批 ${total} 例` : (continuation ? `临床续批 ${total} 例` : (batch.run_id.includes('clinical-') ? `临床首批 ${total} 例` : '采集变体代表样本'));
  const counted = categories.reduce((sum, c) => sum + (counts[c.key] || 0), 0);
  const finished = (counts.pass || 0) + (counts.failed || 0) + (counts.excluded || 0) + (counts.repair_pending || 0);
  const segments = categories.filter(c => counts[c.key]).map(c => `<span class="segment ${c.css}" style="flex:${counts[c.key]}" title="${c.name} ${counts[c.key]}例">${counts[c.key]}</span>`).join('');
  const stages = {extract_subject:'解压数据', stage_workdir:'准备数据与目录', make_configs:'生成处理配置', stage1:'影像处理 1', stage1_compute:'影像处理 1 计算', stage1_qc:'处理 1 质控', stage2:'影像处理 2', stage2_compute:'影像处理 2 计算', stage2_qc:'处理 2 质控', extract_aal90:'提取脑区指标', aal90_extract:'提取脑区指标', complete:'处理完成'};
  const stageCode = (snapshot.stage || '').split(':')[0];
  const stage = stages[stageCode] || snapshot.stage || '等待阶段信息';
  const repairStates = {RECONCILED_PASS:'独立修复已通过，原失败保留', UNVERIFIED:'修复证据待核对', WAITING_PRIOR_BATCH:'修复续作等待当前批次结束', BATCH_RUNNING:'修复续作处理中', BATCH_COMPLETE:'修复续作已结束', BATCH_COMPLETE_WITH_FAILURES:'修复续作已结束，仍有未通过', BATCH_HALTED_GLOBAL_FAULT:'修复续作因故障暂停'};
  const repairText = snapshot.repairs?.length ? snapshot.repairs.map(r => `${r.subject_id}：${r.state === 'RECONCILED_PASS' ? '修复已通过，原失败保留' : r.state === 'RECONCILED_EXCLUDED' ? '修复完成，质控排除' : '修复证据待核对'}`).join('；') : (repairStates[snapshot.repair?.state] || (snapshot.repair?.state ? `修复流程：${snapshot.repair.state}` : ''));
  return `<div class="panel queue-panel">
    ${sectionTitle('处理批次', `<span class="live-label ${stale ? 'stale' : ''}"><i></i>${stale ? '历史数据' : '已连接'}</span>`)}
    <div class="queue-header"><div><span class="eyebrow">SRPBS1600 / ${nonclinical ? '非临床来源' : batch.run_id.includes('clinical-') ? '临床队列' : '采集验证'}</span><h3>${batchTitle}</h3><p>${escapeHTML(batch.run_id)} · 共 ${total} 例</p></div><div class="queue-total"><strong>${finished}</strong><span>/ ${total}</span><small>已到终态 ${ratioPercent(finished, total)}%</small></div></div>
    ${snapshot.cohort?.timing_holds?.length ? `<div class="notice">${snapshot.cohort.timing_holds.map(r => escapeHTML(r.subject_id)).join('、')} 因扫描时点差异暂缓；其余 ${total} 例继续。</div>` : ''}
    <div class="data-note">终态计数含数值通过、失败、排除和待复核，不代表通过率。</div>
    <div class="segmented-bar" role="img" aria-label="${categories.map(c => `${c.name}${counts[c.key] || 0}例`).join('，')}">${segments}</div>
    <div class="queue-counts">${categories.filter(c => (counts[c.key] || 0) > 0 || ['pass','failed','excluded','running'].includes(c.key)).map(c => `<div><span class="dot ${c.css}"></span><span>${c.name}</span><strong>${counts[c.key] || 0}</strong></div>`).join('')}</div>
    ${counted !== total ? '<div class="notice">计数暂未闭合，等待下次采集。</div>' : ''}
    <div class="running-box"><span class="running-icon" aria-hidden="true">↗</span><div><strong>${escapeHTML(batch.current_subject || '当前无活动样本')}</strong><span>${escapeHTML(batch.current_subject ? stage : actualState)}</span></div><span class="process-state">${escapeHTML(actualState)}${runningMarker ? `<small>队列进程${batch.worker_alive ? '存在' : '不存在'}</small>` : ''}</span></div>
    ${repairText ? `<div class="repair-note">${escapeHTML(repairText)}${snapshot.repair?.worker_alive === false && snapshot.repair?.state === 'WAITING_PRIOR_BATCH' ? ' · 等待进程已退出，需复查' : ''}</div>` : ''}
    <div class="queue-foot"><span>人工确认 <b>${counts.visual_accepted ?? '未知'}</b> · 待确认 <b>${counts.visual_review_pending ?? '未知'}</b></span><button class="text-link" data-action="queue">逐例状态 ↗</button></div>
    <div class="data-note">数据采集 ${timeText(snapshot.observed_at)} · 状态更新 ${timeText(batch.updated_at)}${stale ? ' · 已过期，仅作历史参考' : ' · 进程存在不等于处理步骤正在推进'}</div>
    ${remote.error ? `<div class="notice error">${escapeHTML(remote.error)}</div>` : ''}
  </div>`;
}
function dsSampleFlow() {
  return `<div class="ds-samples">${data.ds005713_history.samples.map(s => `<div><strong>${escapeHTML(s.value)}</strong><span>${escapeHTML(s.label)}</span><small>${escapeHTML(s.note)}</small></div>`).join('')}</div>`;
}
function dsSpotlight() {
  if (!data.ds005713_history) return '';
  return `${data.matched_analysis ? `<div class="matched-teaser panel"><div><strong>双向站点留出分析已完成</strong><p>大阪大学 ↔ CiNet · 150个拟合模型 · 预训练与训练均未见测试站点</p></div><a class="button primary" href="#datasets">查看本轮结果 ↗</a></div>` : ''}<article class="ds-spotlight" aria-labelledby="ds-spotlight-title"><div class="ds-intro"><div><span class="eyebrow">阶段汇报 · 已完成工作</span><h2 id="ds-spotlight-title">DS005713：从预处理到迁移实验</h2><p>已完成来源包与真实训练；OA 内部结果正向，SRPBS 外部主要检验未通过。</p></div><a class="button primary" href="#history">查看近期研究历程 ↗</a></div>${dsSampleFlow()}<div class="ds-foot"><span>历史记录截至 ${escapeHTML(data.ds005713_history.as_of)} · 扫描数与人数分开统计</span>${evidenceLink('ds-stage-report', '汇报摘要 ↗')}</div></article>`;
}
const historyBrowse={query:'',month:'all',order:'newest',limit:24};
function historyDay(record) {
  const text=String(record.date || '');
  if(/^\d{4}-\d{2}-\d{2}/.test(text)) return text.slice(0,10);
  const short=text.match(/^\d{2}-\d{2}/);
  // Earlier records omit the year; the enclosing archive supplies it.
  return short?data.research_history.as_of.slice(0,4)+'-'+short[0]:'';
}
function historyRecord(m) {
  const sources=(m.sources || []).map((id,i)=>evidenceLink(id,m.sources.length===1?'查看依据 ↗':`依据 ${i+1} ↗`)).join(' ');
  return `<article><time>${escapeHTML(m.date)}</time><div><span class="badge ${escapeHTML(m.status)}">${escapeHTML(m.label)}</span><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.summary || m.result)}</p>${m.result && m.summary && !m.summary.includes(m.result)?`<p class="history-outcome">${escapeHTML(m.result)}</p>`:''}<details><summary>详情与依据</summary><dl><dt>结果</dt><dd>${escapeHTML(m.result)}</dd><dt>方法</dt><dd>${escapeHTML(m.method)}</dd><dt>限制</dt><dd>${escapeHTML(m.boundary)}</dd><dt>下一步</dt><dd>${escapeHTML(m.next)}</dd></dl><div class="history-sources">${sources}</div></details></div></article>`;
}
function updateHistoryRecords() {
  const all=data.research_history.milestones;
  const records=all.map((item,index)=>({item,index})).filter(({item:m})=>(historyBrowse.month==='all'||historyDay(m).startsWith(historyBrowse.month)) && [m.title,m.label,m.summary,m.result,m.method,m.boundary,m.next].join(' ').toLowerCase().includes(historyBrowse.query.trim().toLowerCase()));
  records.sort((a,b)=>historyBrowse.order==='newest'?historyDay(b.item).localeCompare(historyDay(a.item))||b.index-a.index:historyDay(a.item).localeCompare(historyDay(b.item))||a.index-b.index);
  const shown=records.slice(0,historyBrowse.limit);
  $('#history-results-count').textContent=`已显示 ${shown.length} 条 · 符合 ${records.length} 条 · 共 ${all.length} 条`;
  $('#history-records').innerHTML=shown.length?shown.map(({item})=>historyRecord(item)).join(''):'<div class="empty panel"><h3>没有匹配的研究记录</h3><p>换一个关键词，或选择全部月份。</p></div>';
  $('#history-more').hidden=shown.length>=records.length;
}
function researchHistoryPage() {
  const history = data.ds005713_history;
  const recent = data.research_history;
  if (!history || !recent) { $('#view-history').innerHTML = '<div class="empty">暂无研究历程。</div>'; return; }
  const sources = ids => ids.map((id, i) => evidenceLink(id, ids.length === 1 ? '查看依据 ↗' : `依据 ${i + 1} ↗`)).join(' ');
  $('#view-history').innerHTML = `<div class="page-heading"><div><h1>近期研究历程</h1></div><a class="button primary" href="/api/source/research-history-report" download="RECENT_RESEARCH_HISTORY.md">下载近期历程</a></div>
    <div class="history-meta">截至 ${escapeHTML(recent.as_of)} · 以下为历史记录，最近执行核查见总览。</div>
    <details class="history-focus archived-focus"><summary>此前阶段摘要（历史记录）</summary><h2>${escapeHTML(recent.focus)}</h2><p>${escapeHTML(recent.summary)}</p><div class="ds-foot"><a class="text-link" href="/qc">QC 审核 ↗</a><a class="text-link" href="#overview">执行状态 ↗</a></div></details>
    ${sectionTitle('模型与结果')}
    <details class="history-search-drawer"><summary>搜索与筛选 <span id="history-results-count" class="data-note" role="status"></span></summary><div class="history-toolbar"><label class="search">搜索历程<input id="history-search" type="search" placeholder="模型、数据集或结果" value="${escapeHTML(historyBrowse.query)}"></label><label>月份<select id="history-month"><option value="all">全部月份</option>${[...new Set(recent.milestones.map(m=>historyDay(m).slice(0,7)).filter(Boolean))].sort().reverse().map(month=>`<option value="${escapeHTML(month)}">${escapeHTML(month)}</option>`).join('')}</select></label><label>顺序<select id="history-order"><option value="newest">最近在前</option><option value="oldest">最早在前</option></select></label></div></details>
    <div id="history-records" class="timeline research-timeline"></div><button id="history-more" class="button history-more">再显示24条记录</button>
    <details class="panel research-disclosure"><summary><strong>DS005713 前期成果</strong><span>样本处置、早期指标与关键节点</span></summary><div class="research-disclosure-body"><div class="history-chapter"><h2>DS005713 前期成果</h2><a class="text-link" href="/api/source/ds-stage-report" download="DS005713_STAGE_REPORT.md">下载 DS005713 摘要</a></div>
    <div class="history-meta">记录截至 ${escapeHTML(history.as_of)} · 扫描数与人数分别统计。</div>
    <article class="ds-spotlight">${dsSampleFlow()}<details class="history-detail"><summary>样本处置与依据</summary><p class="ds-disposition">${escapeHTML(history.disposition)}</p><div class="ds-foot">${evidenceLink('record', '原始记录 ↗')}<button class="text-link" data-goal="G02">来源包目标 ↗</button></div></details></article>
    ${sectionTitle('实验结果', '<span class="muted">AUC：DS005713 / Raw FC</span>')}
    <div class="result-grid">${data.results.filter(r => ['oa-report','external-report'].includes(r.source)).map(r => `<article class="panel result-card ${r.source === 'external-report' && r.title.includes('外部') ? 'negative' : ''}"><h3>${escapeHTML(r.title)}</h3><div class="result-value">${escapeHTML(r.value)}</div><span class="muted">${escapeHTML(r.metric)}</span><p>${escapeHTML(r.interpretation)}</p>${evidenceLink(r.source, '打开实验报告 ↗')}</article>`).join('')}</div>
    <div class="notice ds-conclusion"><strong>内部结果正向，外部检验未通过。</strong><p>尚不能确认外部泛化或临床有效性。</p></div>
    ${sectionTitle('关键节点')}
    <div class="timeline ds-timeline">${history.milestones.map(m => `<article><time>${escapeHTML(m.date)}</time><div><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.summary || m.detail)}</p><details class="history-detail"><summary>详情与依据</summary><p>${escapeHTML(m.detail)}</p><div class="history-sources">${sources(m.sources)}</div></details></div></article>`).join('')}</div>
    <div class="ds-foot"><a class="text-link" href="#goals">研究计划 ↗</a>${evidenceLink('ds-stage-report', '汇报摘要 ↗')}<a class="text-link" href="#overview">返回总览 ↗</a></div></div></details>`;
  $('#history-month').value=historyBrowse.month;
  $('#history-order').value=historyBrowse.order;
  $('#history-search').addEventListener('input',event=>{historyBrowse.query=event.target.value;historyBrowse.limit=24;updateHistoryRecords();});
  $('#history-month').addEventListener('change',event=>{historyBrowse.month=event.target.value;historyBrowse.limit=24;updateHistoryRecords();});
  $('#history-order').addEventListener('change',event=>{historyBrowse.order=event.target.value;updateHistoryRecords();});
  $('#history-more').addEventListener('click',()=>{historyBrowse.limit+=24;updateHistoryRecords();});
  updateHistoryRecords();
}
function publicPainSection(mode='summary') {
  const r=data.public_pain_update;
  if (!r) return '';
  const f=value=>Number(value).toFixed(2);
  const row=method=>r.metrics.find(item=>item.method===method);
  const sources=`${evidenceLink(r.report_source,'阅读训练报告 ↗')}${evidenceLink(r.metrics_source,'查看全部指标 ↗')}${evidenceLink(r.plan_source,'公开数据与下一步 ↗')}`;
  const score=`<div class="public-pain-score"><h3>这里的“分数”是什么？</h3><p><strong>VAS是患者报告的疼痛强度。</strong>本轮用访谈时的0—100分VAS，33人的实际记录为7—76分，分数越高表示报告的疼痛越强。任务中另有0—10评分，本轮未使用。</p><p><strong>MAE是预测误差，越低越好。</strong>例如真实60分、预测43分，误差为17分；把每位留出患者的绝对误差取平均，就是MAE。17.24表示平均相差约17.24分，不是17级疼痛，也不是17.24%的准确率。</p></div>`;
  const boundary=`<p class="data-note">${escapeHTML(r.boundary)}</p>`;
  const processing=data.public_pain_processing;
  const progress=processing?`<div class="notice"><strong>9月23日：原始影像处理已启动</strong><p>${escapeHTML(processing.summary)}</p><p>${escapeHTML(processing.note)}</p>${evidenceLink(processing.source,'查看OA交集与处理记录 ↗')}</div>`:'';
  const heading=`<span class="eyebrow">9月22日完成 · Emo-Fibro / ds004144</span><h2>33名患者的公开FC评分训练</h2><p>${escapeHTML(r.summary)}</p>${progress}`;
  if (mode==='methods') return `<section class="panel public-pain-panel">${heading}${score}<h3>本次具体训练什么</h3><ol><li>输入：ImageNomer公开的Power264静息Pearson FC，每人34,716条连接。原临床表只取33名患者，不给健康人补0分。</li><li>输出：访谈疼痛强度字段 <code>1_vas_pain_iv</code>。它与评分至静息扫描的精确时间关系尚待核对，不能称扫描当时的疼痛。</li><li>比较：训练均值、中位数、临床信息、连接强度、全部FC和临床＋FC。临床变量为年龄、受教育年数、确诊年数；连接强度指所有边的平均相关和平均绝对相关。</li><li>评价：按患者分开，5次重复×5外折×3内折。标准化、选参仅在训练侧完成；100个最终Ridge模型、1,500次内层拟合另加50个常量参照，独立人数仍是33。</li><li>核验：100个模型保存重放，最大预测差0；独立Ridge拟合核对的最大差为1.14×10⁻¹³。配对区间按33名患者重采样，只描述当前固定留出预测的条件不确定性。</li></ol>${boundary}<div class="ds-foot">${sources}</div></section>`;
  if (mode==='data') return `<section class="panel public-pain-panel">${heading}<p><strong>原始队列：</strong>33名纤维肌痛女性患者＋33名健康对照；本次只训练其中33名患者。<strong>实际输入：</strong>公开Power264连接特征，不是本项目重处理后的AAL90。</p>${score}<p><strong>原始影像另行处理：</strong>${escapeHTML(r.raw_images.note)}</p>${boundary}<div class="ds-foot">${sources}</div></section>`;
  if (mode==='results') {
    const paired=r.paired.find(item=>item.method==='clinical_plus_fc');
    return `<section class="panel public-pain-panel" aria-label="Emo-Fibro公开FC训练结果">${heading}${score}<div class="public-pain-stats">${['train_mean','global_fc','whole_fc'].map(method=>`<article><span>${escapeHTML(r.method_names[method])}</span><strong>${f(row(method).mae)}<small>分</small></strong><p>留出预测MAE</p></article>`).join('')}</div><p>临床信息MAE ${f(row('clinical').mae)}分，加入FC后为${f(row('clinical_plus_fc').mae)}分。误差差值为+${f(paired.delta_mae)}分，条件95%区间[${f(paired.ci95_low)}, ${f(paired.ci95_high)}]，仍跨0；未观察到可靠影像增量。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="Emo-Fibro六种方法的完整指标"><table><thead><tr><th>方法</th><th>MAE ↓（VAS分）</th><th>RMSE ↓（VAS分）</th><th>R² ↑</th><th>Spearman</th></tr></thead><tbody>${r.metrics.map(item=>`<tr><th>${escapeHTML(r.method_names[item.method])}</th>${['mae','rmse','r2','spearman'].map(k=>`<td>${Number(item[k]).toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="data-note">指标为5次重复的平均；每次都汇总33人的留出预测。全部方法R²小于0。常量参照在不同测试折使用不同训练均值，其非零相关不代表个体排序能力；此处没有可直接用于轻中重分级的成绩。</p>${boundary}<details><summary>完成了哪些核验，接下来做什么</summary><p>100个模型重放与独立拟合核对通过。先完成原始影像处理和QC，再在同一纳入人群中复验；继续核对评分时点和头动，分级阈值须有对应病种和量表依据。</p><p>${escapeHTML(r.raw_images.note)}</p></details><div class="ds-foot">${sources}</div></section>`;
  }
  return `<section class="panel public-pain-panel public-pain-summary">${heading}<p><strong>MAE是模型平均预测错了多少分：</strong>均值预测${f(row('train_mean').mae)}分，连接强度${f(row('global_fc').mae)}分，全部FC ${f(row('whole_fc').mae)}分。单位是0—100分VAS上的分数，越低越好。</p>${boundary}<div class="ds-foot"><a class="button primary" href="#datasets?tab=results">查看新结果与分数解释</a>${evidenceLink(r.report_source,'完整报告 ↗')}</div></section>`;
}
function paperSource(stem, label) { return evidenceLink('paper-methods-20260915-'+stem, label); }

function pooledExternalSection(mode='summary') {
  const r=data.pooled_external_preparation;
  if(!r) return '';
  if(r.result) {
    const x=r.result;
    const names={srpbs:'SRPBS99',zan:'ZAN54',pooled:'合并153'},methods={tangent:'切空间',raw_fc:'原始FC',nuisance:'年龄/性别/头动/站点',site_only:'仅站点'};
    const table=mode==='results' ? `<div class="paper-table-scroll" role="region" aria-label="Emo合并源外推指标" tabindex="0"><table><thead><tr><th>来源</th><th>方法</th><th>AUC</th><th>平衡准确率</th><th>患者召回</th><th>对照召回</th><th>Brier</th></tr></thead><tbody>${x.results.map(a=>`<tr><td>${names[a.source]}</td><td>${methods[a.method]}</td>${['auc','ba','sensitivity','specificity','brier'].map(k=>`<td>${Number(a[k]).toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '';
    return `<section class="panel paper-evaluation recent-research" aria-label="Emo合并源外推${mode}"><span class="eyebrow">${escapeHTML(x.date)} · 固定模型外推完成</span><h2>增加来源未改善Emo外推</h2><p>${escapeHTML(x.summary)}</p>${table}${mode==='methods'?'<p>沿用9月24日已拟合并复核的12份模型，C仅由各源内部选择，阈值0.5；目标无拟合或调参。所有方法采用同一53人，完整报告影像、协变量与仅站点对照。</p>':''}<p class="data-note">${escapeHTML(x.boundary)}</p><p>${escapeHTML(x.next)}</p><div class="ds-foot">${evidenceLink(x.report_source,'阅读完整外推报告 ↗')}${evidenceLink(x.summary_source,'下载聚合指标 ↗')}</div></section>`;
  }

  const t=r.target;
  const details=mode==='methods' ? `<ol>${r.methods.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol>` : `<p>Emo数值候选：${t.fm_numeric_pass}名患者、${t.hc_numeric_pass}名对照；新增训练纳入为0。其余对照队列完成${t.hc_batch_completed}/${t.hc_batch_total}，这是记录时的处理快照。</p>`;
  return `<section class="panel paper-evaluation recent-research" aria-label="Emo外推验证准备"><span class="eyebrow">${escapeHTML(r.date)} · 源模型已复核 · 目标评价待完成</span><h2>合并模型准备好了，下一步检验Emo队列</h2><p>${escapeHTML(r.summary)}</p>${details}<p class="data-note">${escapeHTML(r.boundary)}</p><p class="muted">快照：${escapeHTML(r.observed_at)}。${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.report_source,'阅读外推准备报告 ↗')}${evidenceLink(r.models_source,'查看源模型选参 ↗')}${evidenceLink(r.summary_source,'阶段汇总 ↗')}</div></section>`;
}

function fmmResultsSection(mode) {
  const r=data.pretrained_pain?.fmm_result;if(!r)return '';
  const names={fc_only:'仅连接分支',fc_pretrained:'连接＋预训练表示',fc_random:'连接＋随机表示',aal90_reference:'原AAL90切空间参照'};
  const table=mode==='results'?`<div class="paper-table-scroll" tabindex="0" role="region" aria-label="FMM开发指标"><table><thead><tr><th>方法</th><th>AUC</th><th>准确率</th><th>平衡准确率</th><th>Brier</th></tr></thead><tbody>${r.results.map(x=>`<tr><th>${escapeHTML(names[x.method]||x.method)}</th><td>${x.auc.toFixed(4)}</td><td>${x.accuracy.toFixed(4)}</td><td>${x.balanced_accuracy.toFixed(4)}</td><td>${x.brier.toFixed(4)}</td></tr>`).join('')}</tbody></table></div>`:'';
  return `<div class="fmm-result"><h3>9月25日：FMM连接分支比较</h3><p>${escapeHTML(r.summary)}</p>${table}<p>${escapeHTML(r.comparison)}</p>${mode==='methods'?`<p>${escapeHTML(r.method)}</p>`:''}<p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.source,'阅读FMM结果 ↗')}${evidenceLink(r.summary_source,'聚合复核 ↗')}${evidenceLink(r.aggregate_source,'下载指标表 ↗')}</div></div>`;
}

function pretrainedPainSection(mode='summary') {
  const p=data.pretrained_pain;if(!p) return '';
  const names={aal90_tangent:'原AAL90切空间',fc419:'419区FC',pretrained_dnn67:'预训练DNN67',random_dnn67:'单种子随机DNN67',meta458:'混合Meta458',aal90_plus_pretrained_dnn67:'原方法＋DNN67',aal90_plus_meta458:'原方法＋Meta458'};
  const link=`<div class="ds-foot">${evidenceLink(p.report_source,'阅读预训练完整报告 ↗')}${evidenceLink(p.summary_source,'聚合核验摘要 ↗')}</div>`;
  const header=`<span class="eyebrow">${escapeHTML(p.date)} · 预训练与小样本</span><h2>预训练表示尚未带来稳定整体改善</h2><p>${escapeHTML(p.summary)}</p>`;
  let body=`<p>79人开发AUC：原方法0.7175，DNN67为0.5978，融合0.7149。每类1人时有局部线索，更大支持集和双向站点未保持优势；五随机种子及128维探索均完整保留。</p>`;
  if(mode==='results') body+=`<div class="paper-table-scroll" tabindex="0" role="region" aria-label="预训练开发指标"><table><thead><tr><th>方法</th><th>AUC</th><th>平衡准确率</th><th>Brier</th></tr></thead><tbody>${p.results.map(r=>`<tr><th>${escapeHTML(names[r.method]||r.method)}</th><td>${Number(r.roc_auc).toFixed(4)}</td><td>${Number(r.balanced_accuracy).toFixed(4)}</td><td>${Number(r.brier).toFixed(4)}</td></tr>`).join('')}</tbody></table></div><p>融合相对原方法ΔAUC −0.0026，条件95%区间[−0.0412, 0.0367]。共同尺度改善极端概率，但未证明稳定排序增量；完整学习曲线、站点方向和随机对照见报告。</p>`;
  if(mode==='methods') body=`<ol>${p.methods.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol>`;
  if(mode==='data') body='<p>Emo患者恢复分支33人中27人数值通过，5人保留原QC失败，1人AAL覆盖不足。33名对照的66份原始文件已读回，首例数值通过，剩余32人复用现有处理队列。新增视觉批准与训练纳入均为0。</p><p>首例419区输入及67维官方冻结编码完成独立数值核对，尚未生成目标疾病分数。</p>';
  if(mode==='data' && p.queue_update) body=`<p>${escapeHTML(p.queue_update)}</p><p>53人已完成输入数值核验、用户批量确认和固定源模型评价；未逐人专家阅片，目标参与训练0人。</p>`;
  return `<section class="panel paper-evaluation recent-research" aria-label="预训练研究${mode}">${header}${body}${p.intake ? `<p><strong>Emo固定外推：</strong>${escapeHTML(p.intake.summary)} ${escapeHTML(p.intake.boundary)} ${evidenceLink(p.intake.source,'查看外推报告 ↗')}</p>` : ''}${fmmResultsSection(mode)}${fewshotGeometrySection(mode)}${pretrainingInputAuditSection(mode)}${painTaskModelSection(mode)}${rpnCalibrationSection(mode)}${neufomAuditSection(mode)}${representationControlsSection(mode)}${inputInventorySection(mode)}${p.preparation ? `<p><strong>前期技术准备：</strong>${escapeHTML(p.preparation.summary)} ${evidenceLink(p.preparation.source,'阅读准备报告 ↗')}</p>` : ''}<p class="data-note">${escapeHTML(p.boundary)}</p><p>${escapeHTML(p.next)}</p>${link}</section>`;
}

function prtImageSection(mode='summary') {
  const r=data.prt_images;
  if(!r) return '';
  return `<section class="panel paper-evaluation recent-research" aria-label="PRT影像整理"><span class="eyebrow">2026-09-25 · 技术处理 · 新增训练纳入0</span><h2>PRT：2254张对比图已整理，原192人四条件完整</h2><p>${escapeHTML(r.summary)}</p>${mode==='methods'?`<p>${escapeHTML(r.method)}</p>`:''}<p class="data-note">${escapeHTML(r.boundary)}</p><p class="muted">${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.report_source,'阅读影像处理报告 ↗')}${evidenceLink(r.summary_source,'影像聚合摘要 ↗')}</div></section>`;
}

function prtModalitySection(mode='summary') {
  const r=data.prt_modality;
  if(!r) return '';
  const table=(mode==='results'||mode==='summary') ? `<div class="table-panel"><table style="min-width:0;table-layout:fixed"><colgroup><col style="width:46%"><col style="width:24%"><col style="width:30%"></colgroup><thead><tr><th>输入</th><th>AUC</th><th>平衡准确率</th></tr></thead><tbody>${r.rows.map(x=>`<tr><td>${escapeHTML(x.label)}</td><td>${x.auc.toFixed(3)}</td><td>${(100*x.balanced_accuracy).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div>` : '';
  return `${prtImageSection(mode)}<section class="panel paper-evaluation recent-research" aria-label="PRT声音压力增量比较"><span class="eyebrow">2026-09-24 · 原192人 · 补充探索</span><h2>PRT：声音有区分信号，脑影像未改善评分模型</h2><p>${escapeHTML(r.summary)}</p>${table}${mode==='methods'?`<p>${escapeHTML(r.method)}</p>`:''}<p class="data-note">${escapeHTML(r.boundary)}</p><p class="muted">${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.report_source,'阅读PRT补充报告 ↗')}${evidenceLink(r.summary_source,'聚合结果 ↗')}${evidenceLink(r.csv_source,'完整指标 ↗')}</div></section>`;
}

function prtClassificationSection(mode='summary') {
  const r=data.prt_classification;
  if(!r) return '';
  const table=(mode==='results' || mode==='summary') ? `<div class="table-panel"><table style="min-width:0;table-layout:fixed"><colgroup><col style="width:46%"><col style="width:24%"><col style="width:30%"></colgroup><thead><tr><th>输入</th><th>AUC</th><th>平衡准确率</th></tr></thead><tbody>${r.rows.map(x=>`<tr><td>${escapeHTML(x.label)}</td><td>${x.auc.toFixed(3)}</td><td>${(100*x.balanced_accuracy).toFixed(1)}%</td></tr>`).join('')}</tbody></table></div>` : '';
  const method=mode==='methods' ? `<p>${escapeHTML(r.method)}</p>` : '';
  return `<section class="panel paper-evaluation recent-research" aria-label="PRT现有数据分类"><span class="eyebrow">2026-09-24 · 192人 · 队列内探索</span><h2>PRT慢性背痛：现有特征能做分类，区分能力有限</h2><p>${escapeHTML(r.summary)}</p>${table}${method}<p class="data-note">${escapeHTML(r.boundary)}</p><p class="muted">${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.report_source,'阅读PRT分类报告 ↗')}${evidenceLink(r.summary_source,'聚合结果 ↗')}${evidenceLink(r.csv_source,'指标表 ↗')}</div></section>`;
}

function pooledPainSection(mode='summary') {
  const r=data.pooled_pain;
  if (!r) return '';
  const f=v=>Number(v).toFixed(4);
  const row=(context,method='tangent')=>r.results.find(q=>q.context===context&&q.method===method);
  const names={tangent:'切空间＋Logistic',raw_fc:'原始FC＋Logistic',nuisance:'年龄、性别、头动及站点',site_only:'仅站点'};
  const contexts={single_srpbs:'SRPBS单独训练',pooled_srpbs:'合并训练 → SRPBS',single_zan:'ZAN单独训练',pooled_zan:'合并训练 → ZAN',single_macro:'单队列平均',pooled_macro:'合并后队列平均',pooled_all:'合并总体（补充）',srpbs_to_zan:'SRPBS → ZAN',zan_to_srpbs:'ZAN → SRPBS'};
  const heading=`<span class="eyebrow">${escapeHTML(r.date)} · 合并监督分类 · 已核验</span><h2>153人合并训练能否改善疼痛患者识别</h2><p>${escapeHTML(r.summary)}</p>`;
  const boundary=`<p class="data-note">${escapeHTML(r.boundary)}</p>`;
  const links=`<div class="ds-foot">${evidenceLink(r.report_source,'阅读合并验证报告 ↗')}${evidenceLink(r.metrics_source,'全部方法与指标 ↗')}${evidenceLink(r.paired_source,'合并前后差值与区间 ↗')}</div>`;
  if(mode==='methods') return `<section class="panel paper-evaluation recent-research" aria-label="153人合并监督分类方法">${heading}<ol>${r.method_steps.map(x=>`<li>${escapeHTML(x)}</li>`).join('')}</ol>${boundary}${links}</section>`;
  if(mode==='data') return `<section class="panel paper-evaluation recent-research" aria-label="153人合并训练样本"><h2>本轮实际训练：153名既有受试者</h2><p>SRPBS99：46患者、53对照；ZAN54：25患者、29对照。合计71患者、82对照，原病种、标签、质控与审核记录保留。</p><p>这是现有两队列的联合使用，没有新增153人。Emo、OA、音乐镇痛的候选人数不计入本轮；旧N82及重复扫描也未追加。</p>${boundary}${links}</section>`;
  if(mode==='results') {
    const primary=['single_srpbs','pooled_srpbs','single_zan','pooled_zan','single_macro','pooled_macro','srpbs_to_zan','zan_to_srpbs'].map(c=>row(c));
    const table=values=>`<div class="paper-table-scroll" tabindex="0" role="region" aria-label="合并监督分类指标"><table><thead><tr><th>评估 / 方法</th><th>AUC</th><th>BA</th><th>患者召回</th><th>对照召回</th><th>AUC条件95%区间</th></tr></thead><tbody>${values.map(q=>`<tr><th>${escapeHTML(contexts[q.context])}<small>${escapeHTML(names[q.method])}</small></th>${['auc','ba','sensitivity','specificity'].map(k=>`<td>${f(q[k])}</td>`).join('')}<td>[${f(q.auc_ci_low)}, ${f(q.auc_ci_high)}]</td></tr>`).join('')}</tbody></table></div>`;
    const changes=r.comparisons.filter(q=>q.method==='tangent'&&q.reference_method==='tangent'&&q.metric==='auc');
    return `<section class="panel paper-evaluation recent-research" aria-label="153人合并监督分类结果">${heading}<h3>同一批留出受试者上的切空间比较</h3>${table(primary)}<p>两个队列的平均按各占一半计算。AUC衡量患者与对照的排序区分能力，0.5为随机水平；它不是准确率。BA是患者识别率与对照识别率的平均。</p><ul>${changes.map(q=>`<li>${escapeHTML(contexts[q.context])} − 对应单队列：ΔAUC ${f(q.delta)}，条件95%区间 [${f(q.ci_low)}, ${f(q.ci_high)}]。</li>`).join('')}</ul><details><summary>查看四种方法的完整结果</summary>${table(r.results)}</details><p class="data-note">区间按受试者重采样，同一人的5次预测一起保留；不包含重新训练及新中心的不确定性，未校正多重比较。跨队列5次使用同一批目标受试者，仅源侧内层划分不同。</p>${boundary}${links}</section>`;
  }
  return `<section class="panel paper-evaluation recent-research" aria-label="153人合并监督分类摘要">${heading}<p>切空间AUC：SRPBS ${f(row('single_srpbs').auc)} → ${f(row('pooled_srpbs').auc)}；ZAN ${f(row('single_zan').auc)} → ${f(row('pooled_zan').auc)}。整队列留出：SRPBS → ZAN ${f(row('srpbs_to_zan').auc)}；ZAN → SRPBS ${f(row('zan_to_srpbs').auc)}。</p>${boundary}<div class="ds-foot"><a class="button primary" href="#datasets?tab=results">查看合并验证结果 ↗</a>${evidenceLink(r.report_source,'完整报告 ↗')}</div></section>`;
}

function recentResearchTeaser() {
  if (!data.recent_research) return '';
  return `<article class="panel paper-teaser recent-research"><span class="eyebrow">2026-09-20 · SRPBS与ZAN历史批次</span><h2>头动与临床表已整理，影像增量仍待证据</h2><p>153 人、36,504 帧头动已核对；44 名评分患者是 SRPBS99 的子集。低维连接、动态状态及临床联合比较已完成，原切空间仍为开发参照。</p><p class="paper-caution">sup7 临床模型 MAE 16.18，加入动态影像后为 17.64；sup8 的联合改善区间跨零。评分时点仍待确认，不能据此发布临床分级。</p><div class="ds-foot"><a class="button primary" href="#datasets?tab=results">查看各批次比较 ↗</a>${evidenceLink('research-20260920-motion','头动与临床完整报告 ↗')}${evidenceLink('research-20260920-index','9月16—20日成果目录 ↗')}</div></article>`;
}
function previousRecentResearchSection(methods=false) {
  const r=data.recent_research;if(!r)return '';
  const reports=r.report_sources.map(s=>evidenceLink(s.id,s.date.slice(5)+' · '+s.label+' ↗')).join('<br>');
  if(methods)return `<section class="panel recent-research"><span class="eyebrow">9月20日新增方法</span><h2>低维连接、动态状态与临床增量</h2><ol><li><strong>解剖汇总与CPM：</strong>4005条连接汇总为45个解剖组内外均值；CPM仅在训练折内选正负相关边。分段稳定性提高不等于预测能力提高。</li><li><strong>动态状态：</strong>100秒窗口、20秒步长、4个状态。训练折学习标准化和聚类，每人的聚类总权重为1；测试窗口只分配状态。</li><li><strong>头动敏感性：</strong>沿用既有异常帧标记，在原时间窗内排除对应帧，仅保留至少80%帧数的窗口。原时序的spike回归标记不等于已物理删除这些行；本轮未重做BOLD预处理。</li><li><strong>临床增量：</strong>两张VAS表分开比较人口学与头动、加临床字段、再加状态占比。病程缺失仅在训练折填补；SF-MPQ2本身是疼痛问卷，其收益不能归于影像。</li></ol><p class="data-note">窗口占比不保留顺序，不是转移概率或精确驻留时间；这些状态尚无已证实的疼痛机制含义。</p><details><summary>报告与完整指标</summary><div class="ds-foot">${reports}</div></details></section>`;
  const f=v=>typeof v==='number'?v.toFixed(4):'—';
  const labels={primary99:'SRPBS99',sensitivity96:'SRPBS96', 'OSU-to-CIN':'OSU → CIN', 'CIN-to-OSU':'CIN → OSU',zan54:'ZAN54'};
  const names={tangent:'原切空间',anatomical45:'解剖汇总45维',cpm_p01:'CPM',state_occupancy4:'原动态占比',motion_screened_state4:'头动敏感性占比'};
  const classRows=r.results.filter(q=>q.task==='classification' && names[q.method]);
  const regNames={train_mean:'训练均值',train_median:'训练中位数',demographic_motion:'人口学＋头动',clinical:'加临床字段',clinical_plus_states:'临床＋动态影像'};
  const pair=(d,m,ref,metric)=>{const q=r.comparisons.find(q=>q.design===d&&q.method===m&&q.reference===ref&&q.metric===metric);return q?`${f(q.delta)} [${f(q.ci_low)}, ${f(q.ci_high)}]`:'—';};
  return `<section class="recent-research" aria-labelledby="recent-results-title"><span class="eyebrow">2026-09-20 · 已独立核验</span><h2 id="recent-results-title">9月20日实验：头动与临床信息能否改善预测</h2><p>分类与程度量化并行，原项目目标优先，v5作后续补充。没有新增独立临床人数；99/96人与29/15评分子集重叠，不能相加。</p>
  <details class="panel research-disclosure" open><summary>分类及双向站点比较</summary><p>每项为5次重复的均值；站点留出的5次使用同一个目标站点。患者召回与健康召回需一起判断。横向滚动可查看全部指标。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="近期分类全部指标"><table><thead><tr><th>评估 / 方法</th><th>AUC</th><th>BA</th><th>患者召回</th><th>HC召回</th><th>Brier</th></tr></thead><tbody>${classRows.map(q=>`<tr class="${q.method==='tangent'?'paper-reference':''}"><th>${labels[q.design]}<small>${names[q.method]}</small></th>${['roc_auc','balanced_accuracy','sensitivity','specificity','brier'].map(k=>`<td>${f(q[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>头动敏感性相对原切空间的跨站点 ΔAUC [条件95%区间]：OSU → CIN ${pair('OSU-to-CIN','motion_screened_state4','tangent','roc_auc')}；CIN → OSU ${pair('CIN-to-OSU','motion_screened_state4','tangent','roc_auc')}。两方向均不足以支持可靠替换。</p></details>
  <details class="panel research-disclosure" open><summary>患者评分与临床增量</summary><p>sup7为29人，sup8为15人，均保持原表单位。sup7临床模型包含SF-MPQ2、侧别和部位；sup8包含BDI-II和病程，3个缺失病程只由训练折填补。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="近期回归全部指标"><table><thead><tr><th>评分表 / 方法</th><th>MAE ↓</th><th>RMSE ↓</th><th>R² ↑</th><th>Spearman</th></tr></thead><tbody>${r.results.filter(q=>q.task==='regression'&&regNames[q.method]).map(q=>`<tr><th>${q.design==='severity_sup7'?'sup7 · 29人':'sup8 · 15人'}<small>${regNames[q.method]}</small></th>${['mae','rmse','r2','spearman'].map(k=>`<td>${f(q[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p>联合影像相对临床模型的 ΔMAE [条件95%区间]：sup7 ${pair('severity_sup7','clinical_plus_states','clinical','mae')}；sup8 ${pair('severity_sup8','clinical_plus_states','clinical','mae')}。MAE差值为正表示误差增加，未显示可靠影像增益。</p></details>
  <p class="paper-caution">${escapeHTML(r.limitations)} SF-MPQ2与VAS同属疼痛表型；评分时点、回顾窗和量程端点仍待确认。本轮未重做原始预处理或影像视觉审核。</p><details class="panel research-disclosure"><summary>数据整理、核验范围与近期报告</summary><p>153人36504帧的FD、6列运动参数及异常帧索引已核对。新460个状态模型、205个最终预测头及2820个内层候选完整重拟合，最大预测差0。KMeans重拟合使用同一求解器；旧参照未重训。</p><div class="ds-foot">${reports}</div>${evidenceLink('research-20260920-index','下载指标与图表 ↗')}</details></section>`;
}
function paperMethodsTeaser() {
  if (!data.paper_methods) return '';
  const p=data.paper_methods;
  const auc=id=>p.latest.find(r=>r.design==='primary99' && r.method===id)?.roc_auc.toFixed(4) ?? '—';
  return `<article class="panel paper-teaser"><span class="eyebrow">2026-09-15 · 本轮360个最终模型</span><h2>论文方法实验完成，原切空间仍为开发参照</h2><p>99人AUC：原切空间 <strong>${auc('tangent_original')}</strong> · 训练内选择 STAGIN ${auc('stagin_selected')} · 冻结 BrainLM ${auc('brainlm_frozen')} · 切空间＋BrainLM ${auc('tangent_brainlm')}。四种评估未显示稳定整体提升。</p><p class="paper-caution">STAGIN严格重训不稳定；现有结果仅属开发性探索，未新增临床外部验证。</p><div class="ds-foot"><a class="button primary" href="#datasets?tab=results">查看结果与方法实现 ↗</a>${paperSource('STAGIN_BRAINLM_RESULTS_2026-09-15','阅读本轮完整报告 ↗')}</div></article>`;
}
const researchFilters = {batch:'latest', metric:'roc_auc', threshold:'fixed'};
function paperMethodsPage(section='results') {
  const p=data.paper_methods;
  if (!p) { $('#research-content').innerHTML='<div class="empty">尚无论文方法结果</div>'; return; }
  const labels={'primary99':'99人内部','sensitivity96':'96人敏感性','OSU-to-CIN':'OSU → CIN · 测试50人','CIN-to-OSU':'CIN → OSU · 测试46人'};
  const metricOptions={roc_auc:'AUC ↑',balanced_accuracy:'BA（平衡准确率）↑',accuracy:'准确率 ↑',sensitivity:'灵敏度 ↑',specificity:'特异度 ↑',brier:'Brier ↓'};
  const reportLinks=`${paperSource('STAGIN_BRAINLM_RESULTS_2026-09-15','本轮完整报告 ↗')}${paperSource('GRAPH_TEMPORAL_RESULTS_2026-09-15','第一轮完整报告 ↗')}${paperSource('MODEL_IMPLEMENTATION_GUIDE_2026-09-15','实现说明文档 ↗')}<a class="text-link" href="/api/source/paper-methods-20260915-aggregate_metrics?download=1" download>本轮64行指标 TSV ↓</a>`;
  if (section==='methods') {
    $('#research-content').innerHTML=`${recentResearchSection(true)}<section aria-labelledby="paper-methods-title"><h2 id="paper-methods-title">前期方法说明</h2><p>原方法已经属于机器学习：统计连接表示＋监督分类器。GNN、TCN、GRU和Transformer属于深度学习。FC在这里指功能连接，不是全连接层。</p><div class="paper-method-list">${p.methods.map(m=>`<details class="panel paper-method"><summary><span><strong>${escapeHTML(m.name)}</strong><small>${escapeHTML(m.group)}</small></span></summary><p class="paper-method-idea">${escapeHTML(m.idea)}</p><ol class="paper-flow">${m.flow.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol><h3>代码如何实现</h3><p>${escapeHTML(m.implementation)}</p><h3>适配与限制</h3><p>${escapeHTML(m.boundary)}</p>${m.source?`<a class="text-link" href="${escapeHTML(m.source)}" target="_blank" rel="noopener">论文或作者文档 ↗</a>`:''}</details>`).join('')}</div></section>
    <article class="panel paper-evaluation"><h2>所有方法共用的评估规则</h2><p>以人为单位：5次重复 × 5折外层 × 3折内层。站点留出只在来源站点做内层选择。训练侧拟合切空间参考、缩放、超参数、轮数与阈值，测试人只做变换和预测；同一人的所有窗口保持在同一侧。</p><p>本次任务是既有异质 Pain/HC 分类，尚不等同 TN/PHN/HC 三分类、疼痛评分回归或药物反应预测。各论文任务、输入与优化预算差异详见上方方法说明。</p><div class="ds-foot">${reportLinks}</div></article>`;
    return;
  }
  $('#research-content').innerHTML=`${recentResearchSection()}<article class="research-conclusion"><span class="eyebrow">前期比较 · ${escapeHTML(p.date)}</span><h2>论文方法历史结果</h2><p>内部99/96人与双向站点均属开发性比较；STAGIN严格重训不稳定，尚无新增临床外部验证。</p></article>

    <section class="paper-results" aria-labelledby="paper-results-title"><h2 id="paper-results-title">近期实验比较</h2><p>每格为5次重复／来源内层种子的均值。99与96人重叠；5次种子不会增加站点测试人数。数据已反复用于开发，不能视为新中心临床验证。</p>
    <div class="paper-controls"><label>实验批次 <select id="paper-batch"><option value="latest">第二轮 · STAGIN / BrainLM</option><option value="previous">第一轮 · 图网络 / 时序 / DCSTN</option></select></label><label>指标 <select id="paper-metric">${Object.entries(metricOptions).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><label>分类阈值 <select id="paper-threshold"><option value="fixed">固定0.5</option><option value="inner">训练内选择</option></select></label></div>
    <p id="paper-metric-note" class="data-note" aria-live="polite"></p><p class="data-note">窄屏可左右滑动表格，查看全部方法与站点列。</p><div id="paper-comparison" class="panel paper-table-scroll" tabindex="0" role="region" aria-label="四种评估的指标比较，窄屏可横向滚动"></div>
    <p class="paper-caution"><strong>如何解读：</strong>原切空间为参照。随机特征融合在两个站点方向AUC略升，但内部AUC下降；不能把它归因于预训练。阈值变化不改变AUC；灵敏度与特异度需一起看。BA是两类召回率的平均，Brier是概率误差，越低越好。</p></section>
    <details class="panel paper-uncertainty"><summary>配对区间与训练／留出差距</summary><p>本轮按人、按类别进行2000次重采样，保留每人的5次固定预测。区间不包含重新训练、随机编码器初始化、多重比较或新中心差异；不能作为临床显著性证明。</p><p>99人 STAGIN 128维训练AUC均值0.9995，逐外折均值0.5547，明显过拟合。逐外折均值与主表按每次重复汇总OOF预测的AUC口径不同。</p>${paperSource('paired_comparisons','查看全部配对区间 ↗')}${paperSource('generalization_summary','查看训练／内层／外层汇总 ↗')}</details>
    <details class="panel research-disclosure paper-validation"><summary>完成状态与验证范围</summary><div class="paper-validation-grid"><article class="panel"><h3>冻结特征线性模型：回算通过</h3><p>240个最终模型独立回算概率最大差2.82×10⁻¹⁴；48个已选内层重训最大差7.88×10⁻¹⁵。其余内层候选未全部重训。</p></article><article class="panel"><h3>STAGIN：存在严格重训限制</h3><p>120个保存检查点重放，分类判定变化0，逐折AUC变化0；但完全匹配原调用顺序的24次内层重训仍有10个模型-样本判定变化，最大逐内折AUC差0.02727。未放宽原数值条件，也未替换原始预测挑分。</p></article></div><p class="data-note">A424时序99/99数值就绪，部分ROI仅1—3体素；空间覆盖仍需研究者审核，没有新增视觉批准或临床训练纳入。</p></details>
    <details class="panel research-disclosure"><summary>完整报告与指标下载</summary><p>第一轮480个最终模型；第二轮STAGIN 120个、冻结特征分类器240个。容量与阈值选择分支复用预测，不重复计数。</p><div class="ds-foot">${reportLinks}</div></details>`;
  function updateTable() {
    const batch=$('#paper-batch').value, metric=$('#paper-metric').value, threshold=$('#paper-threshold').value;
    Object.assign(researchFilters,{batch,metric,threshold});
    const rows=p[batch].filter(r=>r.method.endsWith('_threshold')===(threshold==='inner'));
    let names=[...new Set(rows.map(r=>r.method.replace(/_threshold$/,'')))];
    names=['tangent_original',...names.filter(n=>n!=='tangent_original')];
    const metrics=Object.fromEntries(rows.map(r=>[r.design+'|'+r.method,r]));
    const suffix=threshold==='inner'?'_threshold':'';
    $('#paper-metric-note').textContent=`${batch==='latest'?'第二轮':'第一轮'} · ${metricOptions[metric]} · ${threshold==='inner'?'阈值只由训练内OOF选取':'分类阈值0.5'}；数字为均值，不表示统计显著性。`;
    $('#paper-comparison').innerHTML=`<table><caption class="sr-only">${escapeHTML($('#paper-metric-note').textContent)}</caption><thead><tr><th scope="col">方法</th>${p.designs.map(d=>`<th scope="col">${escapeHTML(labels[d])}</th>`).join('')}</tr></thead><tbody>${names.map(name=>`<tr class="${name==='tangent_original'?'paper-reference':''}"><th scope="row">${escapeHTML(p.names[name]||name)}${name==='tangent_original'?'<small>同划分开发参照</small>':''}</th>${p.designs.map(d=>{const v=metrics[d+'|'+name+suffix]?.[metric];return `<td>${typeof v==='number'?v.toFixed(4):'—'}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`;
  }
  $('#paper-batch').value=researchFilters.batch;
  $('#paper-metric').value=researchFilters.metric;
  $('#paper-threshold').value=researchFilters.threshold;
  ['paper-batch','paper-metric','paper-threshold'].forEach(id=>$('#'+id).addEventListener('change',updateTable));
  updateTable();
}
function connectivityFollowupPanel() {
  const report = data.sources.find(s => s.repo_path === 'docs/CONNECTIVITY_REFINEMENT_RESULTS_2026-09-14.md');
  const diagnosis = data.sources.find(s => s.repo_path === 'docs/SITE_DIAGNOSIS_RESULTS_2026-09-15.md');
  if (!report || !diagnosis) return '';
  return `${recentResearchTeaser()}<details class="panel execution-panel"><summary>9月13—15日：论文方法、连接改进与站点诊断</summary>${paperMethodsTeaser()}<h2>连接改进已核验，站点诊断已完成</h2><p>切空间第二轮 240 个模型未获得稳定提升，原切空间仍为内部开发参考。145 个诊断模型中，连接特征识别站点 AUC 0.986，提示明显站点相关差异；这不是疾病预测成绩。</p><div class="ds-foot">${evidenceLink(report.id,'阅读第二轮结果 ↗')}${evidenceLink(diagnosis.id,'阅读站点诊断与下一步 ↗')}</div></details>`;
}
function executionPanel() {
  const execution = data.execution_snapshot;
  if (!execution) return '';
  return `<article class="panel execution-panel" aria-labelledby="execution-title">
    <div class="execution-heading"><div><span class="eyebrow">远端处理历史快照</span><h2 id="execution-title">${escapeHTML(execution.title)}</h2></div><span class="badge deferred">按需核查快照 · 非实时</span></div>
    <p class="execution-time">远端核查 ${timeText(execution.remote_observed_at)} · 下载核查 ${timeText(execution.download_observed_at)}（北京时间）</p>
    <ol class="execution-steps">${execution.steps.map((step, index) => `<li><div class="execution-step-head"><span class="mono">0${index + 1}</span>${badge(step.status)}</div><h3>${escapeHTML(step.title)}</h3><strong class="execution-value">${escapeHTML(step.value)}</strong><p>${escapeHTML(step.note)}</p>${step.progress ? progressTrack(step.progress.value, step.progress.total, step.title + '文件完成比例') : ''}</li>`).join('')}</ol>
    <p class="execution-next"><strong>下一步</strong> ${escapeHTML(execution.next)}</p>
    <details class="execution-details"><summary>旧轮次与审核边界</summary>${execution.notes.map(note => `<p>${escapeHTML(note)}</p>`).join('')}</details>
    <div class="ds-foot">${evidenceLink(execution.source, '核查记录 ↗')}<a class="text-link" href="#history">研究历程 ↗</a><span>自动监控关闭；此处数字不会随页面刷新自动变更。</span></div>
  </article>`;
}
function overview() {
  const counts=goalCounts(), c=data.clinical;
  const donePercent=ratioPercent(counts.done,data.goals.length);
  const inventory=data.pretrained_pain?.input_inventory;
  const focusStudy=Object.values(data).find(item => item && typeof item==='object' && item.focus_summary===data.focus_description);
  const focusSummary=taskPreview(focusStudy?.summary || data.focus_description, 200);
  const focusBoundary=focusStudy?.interpretation || '当前记录用于研究进度说明；独立临床验证尚未完成。';
  const priorities=inventory?.priorities || [];
  const resultCards=[
    ['来源外推',data.pooled_external_preparation?.result?.summary || data.pooled_external_preparation?.summary],
    ['预训练与小样本',data.pretrained_pain?.summary],
    ['疼痛任务',data.prt_classification?.summary || data.prt_modality?.summary]
  ].filter(([,summary])=>summary);
  $('#view-overview').innerHTML=`
    <div class="page-heading overview-hero"><div><span class="eyebrow">NEUROGRAPH · 疼痛 fMRI 研究</span><h1>项目总览</h1><p class="muted">当前工作、最近结论与尚待完成的验证。</p></div><span class="overview-date">记录整理于 ${escapeHTML(data.reviewed_at)}</span></div>
    <div class="overview-lead">
      <section class="panel current-focus"><span class="eyebrow">当前工作 · 已记录的阶段状态</span><h2>${escapeHTML(data.focus_title)}</h2><p class="reading-current-note">${escapeHTML(focusSummary)}</p>${focusStudy?.observed_at_local?`<p class="focus-observed">本项核查 ${escapeHTML(focusStudy.observed_at_local)}</p>`:''}<p class="focus-boundary">${escapeHTML(focusBoundary)}</p><div class="ds-foot"><a class="button primary" href="#goals">查看计划</a><a class="button" href="#datasets?tab=results">查看全部结果</a>${focusStudy?.id ? evidenceLink(focusStudy.id,'处理报告 ↗') : ''}</div><details class="stage-record"><summary>完整处理记录与限制</summary><p>${escapeHTML(data.focus_description)}</p>${focusStudy?.boundary?`<p class="data-note">${escapeHTML(focusStudy.boundary)}</p>`:''}</details><details><summary>此前训练阶段与审核边界</summary><p>${escapeHTML(inventory?.summary || data.focus_description)}</p><p class="data-note">${escapeHTML(inventory?.boundary || '内部开发结果与独立验证分别记录。')}</p>${inventory?.normalization_block_diagnostic?.manuscript_integration?evidenceLink('migraine-normalization-20261007-manuscript-appendix','训练完整表 ↗'):''}</details></section>
      <aside class="panel clinical-endpoints" aria-label="三个临床终点的验证状态"><span class="eyebrow">研究总目标</span><h2>独立临床验证尚未完成</h2><p>阶段实验完成与临床有效性分别判断。</p><dl><div><dt>辅助诊断</dt><dd>已有开发比较，独立患者验证待完成。</dd></div><div><dt>扫描同期疼痛</dt><dd>需核实评分含义、时点与扫描对应。</dd></div><div><dt>治疗反应</dt><dd>需真实治疗、随访与结局标签。</dd></div></dl><a class="text-link" href="#goals">查看目标与缺口 ↗</a></aside>
    </div>
    <div class="work-summary" aria-label="任务清单状态"><div class="work-ring" style="--value:${donePercent}" role="img" aria-label="任务完成度 ${donePercent}%"><span><strong>${donePercent}%</strong><small>完成度</small></span></div><div class="work-metrics"><div class="work-metric"><span class="work-metric-label">已完成</span><span class="work-metric-value">${counts.done}<small>/ ${data.goals.length}</small></span></div><div class="work-metric"><span class="work-metric-label">进行中</span><span class="work-metric-value">${counts.active}</span></div><div class="work-metric"><span class="work-metric-label">受阻</span><span class="work-metric-value">${counts.blocked}</span></div></div><small class="work-note">完成项包含阴性实验，不代表临床验证完成。</small></div>
    ${sectionTitle('最近研究结论','<a class="text-link" href="#history">全部研究历程 ↗</a>')}
    <div class="latest-studies">${brainhgtK10PilotOverview()}
    ${brainhgtSmallSampleReadinessOverview()}
    ${brainhgtTangentTargetOverview()}
    ${networkPairCenteringOverview()}
    ${networkPairAttributionOverview()}
    ${networkPairBilinearOverview()}
    ${diagnosticSourceFollowupOverview()}
    ${siteScoreOffsetOverview()}
    ${censorErrorAuditOverview()}
    ${staticCensorAucOverview()}
    ${staticCensorInputOverview()}
    ${motionSupportOverview()}
    ${srpbsTaskAuditOverview()}
    ${geometryCrosscohortOverview()}
    ${brainhgtGeometryRegularizationOverview()}
    ${brainhgtStageAttributionOverview()}
    ${fcSpdMatchedOverview()}
    ${mixupCrosscohortOverview()}
    ${newSourceDownloadOverview()}
    ${dsRemainingAuditOverview()}
    ${dsPersonAuditOverview()}
    ${independentReadinessOverview()}
    ${mixupRobustnessOverview()}
    ${supervisedMixupOverview()}
    ${linearProbeOverview()}
    ${sampleSizeOverview()}
    ${failureAttributionOverview()}
    ${painRegionalReadoutOverview()}
    ${boundedTuningOverview()}
    ${trainSideSSLOverview()}
    ${temporalReliabilityOverview()}
    ${communityPriorOverview()}
    ${cortexPCAOverview()}${spdLieBNOverview()}</div>
    <p class="latest-boundary">以上为既有开发队列上的支持内比较。诊断 AUC 不替代扫描同期疼痛、治疗反应或独立临床验证。</p>
    ${sectionTitle('下一步','<a href="#goals" class="text-link">全部目标 ↗</a>')}<div class="next-grid">${(data.student_workflow?.next_goal_ids || data.next_goal_ids).slice(0,3).map(id=>goalCard(data.goals.find(g=>g.id===id))).join('')}</div>
    ${sectionTitle('按内容查阅')}
    <div class="reading-routes overview-routes"><a href="#datasets?tab=results"><strong>实验结果</strong><span>完整比较、阴性结果与限制</span></a><a href="#datasets?tab=data"><strong>数据概况</strong><span>队列、用途与标签缺口</span></a><a href="#datasets?tab=methods"><strong>方法说明</strong><span>输入、训练与评价方案</span></a><a href="#evidence"><strong>报告与证据</strong><span>检索、预览和下载原报告</span></a></div>
    ${sectionTitle('已有研究结论','<a class="text-link" href="#datasets?tab=results">完整比较与限制 ↗</a>')}
    <div class="overview-results">${resultCards.map(([title,summary])=>`<article class="panel"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(summary)}</p></article>`).join('')}</div>
    ${researchDisclosure('来源借用与标准化：详细导读','原比较表、配对区间与适用范围',researchReadingGuide(data))}
    ${researchDisclosure('此前阶段研究重点','按原阶段和结果日期阅读',priorities.length?`<div class="priority-grid">${priorities.map(p=>`<article class="panel"><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p></article>`).join('')}</div>`:'')}
    <article class="workflow-teaser"><div><span class="eyebrow">研究流程</span><h2>从影像处理到模型评价</h2><p>查看当前路线、历史流程与后续扩展。</p></div><a class="button" href="#workflow">查看流程图 ↗</a></article>
    ${researchDisclosure('历史执行与样本口径','按各自核查时间阅读；页面刷新不代表重新核查远端',executionPanel()+queuePanel()+`<div class="panel clinical-strip"><h2>候选样本与训练接入</h2><p>${c.inventory} 人元数据；候选上限 ${c.classification_candidates} 人，数值通过 ${c.numeric_pass} 人，人工确认 ${c.visual_accepted} 人，训练接入 ${c.training_ready} 人。</p><p class="data-note">快照 ${timeText(c.progress_as_of)}，不计为本轮新增人数。${escapeHTML(c.note)}</p></div>`)}
    ${researchDisclosure('前期成果','DS005713 来源包与早期迁移实验',dsSpotlight())}`;
}

function workflowFigure(name, title, description, transcript) {
  return `<article class="workflow-figure" aria-labelledby="${name}-title"><div class="workflow-figure-heading"><div><h2 id="${name}-title">${title}</h2><p>${description}</p></div><div class="workflow-actions"><a class="button" href="./${name}.svg" target="_blank" rel="noopener" aria-label="放大查看${title}（新标签页）">放大查看 ↗</a><a class="button" href="./${name}.png" download>下载 PNG</a><a class="text-link" href="./${name}.svg" download>SVG</a></div></div><div class="workflow-image-scroll" tabindex="0" role="region" aria-label="${title}，窄屏可横向滚动"><img src="./${name}.svg" alt="${description}" width="1440" height="${name === 'workflow-execution' ? 1060 : 1200}" aria-describedby="${name}-text"></div><details class="workflow-transcript" id="${name}-text"><summary>阅读流程文字</summary>${transcript}</details></article>`;
}
function workflowPage() {
  $('#view-workflow').innerHTML = `<div class="page-heading"><div><h1>项目流程</h1><p class="muted">从当前研究主线，到多模态与 Agent 扩展。</p></div><a class="button" href="#overview">← 返回总览</a></div>
    ${publicPainSection()}
    <section class="panel"><h2>当前公开数据路线</h2><p>Emo-Fibro：连续VAS预测与统一预处理复验 → 有量表依据的疼痛分级 → 独立患者验证。音乐镇痛与OA分别研究短期变化和给定治疗下的改善；用于医生诊断或用药之前，还需目标人群的前瞻评价。</p>${data.public_pain_processing?`<p>${escapeHTML(data.public_pain_processing.note)}</p>${evidenceLink(data.public_pain_processing.source,'查看当前处理记录 ↗')}`:''}<p class="data-note">下面两张图保留9月9日的历史流程；本次Power264公开特征是单独的探索分支，不并入旧AAL90训练人数。</p></section>
    <div class="workflow-context"><span>历史流程图 · 2026-09-09</span><span>手机可左右滑动图片，也可放大或下载。</span></div>
    ${workflowFigure('workflow-execution', '研究执行流程', '沿箭头 01 → 06 阅读。来源预训练与99/96开发性分类完成；置换完成，增益未确立，医院准备并行，新的独立验证待完成。', '<ol><li>影像与标签接入：无标签来源与临床目标分别管理，量表口径继续核对。</li><li>预处理与质量审核：本批处理及人工确认完成，科学排除与时点暂缓保留。</li><li>共同表示：AAL90 脑区时序与 90×90 功能连接。</li><li>迁移学习：源域预训练与目标训练折适配，五条来源训练与99/96开发性分类已完成，完整置换完成，增益未确立。</li><li>疼痛任务：研究侧首选PTN及七日日最严重NRS均值回归；公开分类已比较，再评估 masked-loss 双任务。</li><li>独立验证：医院病种、标签、协议与现场准备并行，不等待模型完成；需取得新的独立队列，历史 SRPBS 外部主要检验未通过。</li></ol>')}
    ${workflowFigure('workflow-roadmap', '多模态与 Agent 规划', '多模态融合和 Agent 系统尚未实现；图中虚线表示后续扩展。Agent 分工为此前建议方案；瞳孔需先论证，三维场景重建列远期。', '<ol><li>多模态输入：既有 T1 / 静息态 fMRI 与临床量表基础，瞳孔信号和病历文本为扩展规划。</li><li>融合：核对匿名 ID、采集时点和缺失模态，再比较单模态、简单融合与复杂模型。</li><li>Agent 协作：数据 Agent 整理库存；质控 Agent 提交异常；实验 Agent 执行既定比较；证据 Agent 汇总有出处的结果。</li><li>工具：复用预处理脚本、QC 网页、训练程序和项目记录；既有脚本不等同于 Agent 系统。</li><li>人工决策：研究者负责视觉审核、标签定义、实验方案和结论确认。</li><li>输出与应用：分类、连续严重度、脑连接解释及研究报告；独立验证支持后再评估复杂 GNN、LLM 与 EMR/PACS。</li></ol>')}
    <div class="workflow-sources"><span>图示依据</span>${evidenceLink('meeting-20260908', '会议核对与行动 ↗')}${evidenceLink('hospital-requirements', '医院需求草案 ↗')}${evidenceLink('original-plan', '实施路线 ↗')}${evidenceLink('record', '最新研究记录 ↗')}<button class="text-link" data-goal="G19">扩展目标 G19 ↗</button><a class="text-link" href="#goals">完整计划 ↗</a></div>`;
}

function goalsListPage() {
  const counts = goalCounts();
  $('#view-goals').innerHTML = `<div class="page-heading"><div><h1>计划与目标</h1></div><div class="muted">整理于 ${escapeHTML(data.reviewed_at)}</div></div>${studentWorkflowPanel(true)}<details class="objective student-technical"><summary>查看完整研究目标与拟议指标</summary><p>${escapeHTML(data.objective)}</p></details><div class="filter-toolbar"><div class="filter-chips" aria-label="按状态筛选"><button data-filter="all">全部 <b>${data.goals.length}</b></button>${Object.entries(statusNames).map(([s,label])=>`<button data-filter="${s}">${label} <b>${counts[s]}</b></button>`).join('')}</div><div class="search-row"><label class="search"><span aria-hidden="true">⌕</span><input id="goal-search" type="search" placeholder="搜索目标或关键词" value="${escapeHTML(query)}" aria-label="搜索目标"></label><select id="phase-filter" aria-label="按阶段筛选"><option value="all">全部阶段</option>${taskPhases().map(p=>`<option value="${p.id}">${escapeHTML(phaseTitle(p))}</option>`).join('')}</select></div></div><div id="goal-results"></div>`;
  $('#goal-search').addEventListener('input', event => {query=event.target.value; goalResults();});
  $('#phase-filter').value = phaseFilter;
  $('#phase-filter').addEventListener('change', event => {phaseFilter=event.target.value; goalResults();});
  goalResults();
}
function goalResults() {
  document.querySelectorAll('[data-filter]').forEach(el => {el.classList.toggle('selected', el.dataset.filter===filter);el.setAttribute('aria-pressed',String(el.dataset.filter===filter));});
  const filtered = data.goals.filter(g => (filter==='all'||g.status===filter) && (phaseFilter==='all'||g.phase===phaseFilter) && [g.id,g.title,g.summary,g.next,g.criteria,goalTitle(g),goalPurpose(g),...(g.student_guide?.steps || []),g.student_guide?.deliverable || ''].join(' ').toLowerCase().includes(query.toLowerCase()));
  $('#goal-results').innerHTML = filtered.length ? taskPhases().map(p => {const goals=orderedGoals(filtered.filter(g=>g.phase===p.id));const phaseGoals=data.goals.filter(g=>g.phase===p.id);const phaseDone=phaseGoals.filter(g=>g.status==='done').length;return goals.length ? `<div class="goal-phase">${sectionTitle(escapeHTML(phaseTitle(p)), `<span class="muted">${goals.length} 项目标</span>`)}<div class="goal-phase-bar"><span class="goal-phase-count"><b>${phaseDone}/${phaseGoals.length}</b><small> 已完成</small></span>${progressTrack(phaseDone, phaseGoals.length, escapeHTML(p.name) + '完成度')}</div><div class="goal-grid">${goals.map(goalCard).join('')}</div></div>` : '';}).join('') : '<div class="empty panel"><h3>没有匹配的目标</h3><p>调整关键词或筛选条件，再试一次。</p><button class="button" data-action="reset">清除筛选</button></div>';
}

let matchedDesign = 'primary99';
let siteDirection = 'OSU_to_CIN';
function siteTransferRows() {
  return (data.site_transfer?.directions[siteDirection]?.rows || []).map(r=>`<tr><th scope="row">${escapeHTML(r.label)}</th><td>${(r.accuracy*100).toFixed(2)}%</td><td>${(r.balanced_accuracy*100).toFixed(2)}%</td><td>${r.auc.toFixed(3)}</td><td>${(r.sensitivity*100).toFixed(1)}%</td><td>${(r.specificity*100).toFixed(1)}%</td></tr>`).join('');
}
function siteTransferPanel() {
  const a=data.site_transfer;
  if (!a) return '';
  const directions=Object.values(a.directions);
  return `<article class="panel matched-analysis site-transfer-analysis" aria-labelledby="site-transfer-title"><div class="matched-heading"><div><span class="eyebrow">双向站点留出 · ${timeText(a.as_of,true)}</span><h2 id="site-transfer-title">换一个采集站点，模型还能工作吗？</h2><p>${escapeHTML(a.conclusion)}</p></div><a class="button" href="/api/source/site-transfer-report" download="SITE_TRANSFER.md">下载跨站点报告</a></div>
  <div class="matched-source-flow"><div><strong>大阪大学46人 → CiNet50人</strong><span>在大阪训练和选参，CiNet只用于测试</span></div><div><strong>CiNet50人 → 大阪大学46人</strong><span>反方向独立拟合；预训练来源也不含两站点</span></div></div>
  <div class="matched-table" tabindex="0" role="region" aria-label="双向跨站点主要结果"><table><thead><tr><th>未调整方法及训练先验对照</th>${directions.map(d=>`<th>${escapeHTML(d.title)}<br>准确率 / AUC</th>`).join('')}</tr></thead><tbody id="site-transfer-highlights">${a.highlights.map(method=>{const rows=directions.map(d=>d.rows.find(r=>r.method===method));return `<tr><th scope="row">${escapeHTML(rows[0].label)}</th>${rows.map(r=>`<td>${(r.accuracy*100).toFixed(2)}% / ${r.auc.toFixed(3)}</td>`).join('')}</tr>`;}).join('')}</tbody></table></div><small class="matched-scroll-hint">左右滑动可查看另一个迁移方向。</small>
  <p class="table-note">9人／7人冻结Logistic相对Raw的AUC差值区间在两个方向均包含0。7人Logistic在大阪→CiNet准确率66.4%，疼痛灵敏度仅30.6%。相同测试人群重复5组种子，不是5批独立测试。</p>
  <details class="matched-details"><summary>查看两个方向的全部32项结果</summary><div class="matched-controls"><label>训练 → 测试<select id="site-transfer-direction">${Object.entries(a.directions).map(([key,d])=>`<option value="${key}">${escapeHTML(d.title)}</option>`).join('')}</select></label><span>每方向16种配置 · 同时展示调整前后及对照</span></div><div class="matched-table" tabindex="0" role="region" aria-label="跨站点完整结果"><table><thead><tr><th>配置</th><th>准确率</th><th>平衡准确率</th><th>AUC</th><th>疼痛灵敏度</th><th>特异度</th></tr></thead><tbody id="site-transfer-results">${siteTransferRows()}</tbody></table></div><p class="table-note">全部条件区间见报告。70个Logistic、80个神经模型和10个训练先验对照独立回读通过；70个残差调整器已重算。</p></details>
  <details class="matched-details"><summary>这次与上次分站点汇总有什么区别？</summary><p>这次整个测试站点不参与预训练、内折选参、变换拟合或监督训练；上次混合站点训练中，每个测试站点也有其他人参与训练。NKN只有3人，本轮不参与。</p><p>单个训练站点无法估计站点效应；调整版只处理年龄和头动，不使用测试数据做标准化或站点谐调。来源Logistic在表示层调整，神经模型在原始FC上调整，分布偏移限制仍保留。</p><p>本轮是已探索队列上的站点留出开发实验，不等于全新医院独立确认。继续扩大SRPBS1600来源时，需要保持测试站点排除规则，才能与本轮未见站点条件比较。</p></details></article>`;
}
function bindSiteTransfer() {
  if (!data.site_transfer) return;
  $('#site-transfer-direction').value=siteDirection;
  $('#site-transfer-direction').addEventListener('change',e=>{siteDirection=e.target.value;$('#site-transfer-results').innerHTML=siteTransferRows();});
}
let finetuningDesign = 'primary99';
let finetuningAdjustment = 'none';
function finetuningRows() {
  return (data.matched_finetuning?.designs[finetuningDesign] || []).filter(r=>r.adjustment===finetuningAdjustment).map(r=>`<tr><th scope="row">${escapeHTML(r.source)}</th><td>${escapeHTML(r.method)}</td><td>${(r.accuracy*100).toFixed(2)}%</td><td>${(r.balanced_accuracy*100).toFixed(2)}%</td><td>${r.auc.toFixed(3)}</td><td>${(r.sensitivity*100).toFixed(1)}%</td><td>${(r.specificity*100).toFixed(1)}%</td></tr>`).join('');
}
function finetuningContrasts() {
  return (data.matched_finetuning?.contrasts[finetuningDesign] || []).filter(r=>r.adjustment===finetuningAdjustment).map(r=>`${escapeHTML(r.source)}：[${r.auc_difference_conditional_95ci.map(v=>v.toFixed(3)).join(', ')}]`).join('；');
}
function finetuningPanel() {
  const a=data.matched_finetuning;
  if (!a) return '';
  return `<article class="panel matched-analysis finetuning-analysis" aria-labelledby="finetuning-title"><div class="matched-heading"><div><span class="eyebrow">后续实验 · ${timeText(a.as_of,true)}</span><h2 id="finetuning-title">冻结还是部分微调？</h2><p>${escapeHTML(a.conclusion)}</p></div><a class="button" href="/api/source/matched-finetuning-report" download="MATCHED_FINETUNING.md">下载微调报告</a></div>
  <div class="matched-source-flow"><div><strong>同一来源 · 同一分类头</strong><span>冻结编码器 vs 仅更新最后一层；沿用9人／低头动7人来源</span></div><div><strong>400模型 · 1800次内折拟合</strong><span>200个调整器重算、全部模型独立回读通过</span></div></div>
  <div class="matched-controls"><label>微调分析队列<select id="finetuning-design"><option value="primary99">99人主分析</option><option value="sensitivity96">96人敏感性分析</option></select></label><label>原始FC折内调整<select id="finetuning-adjustment"><option value="none">未调整</option><option value="age_site_motion">年龄＋站点＋头动</option></select></label><span>相同BCE线性头 · 内折选择学习率和轮数</span></div>
  <div class="matched-table" tabindex="0" role="region" aria-label="部分微调比较结果，可横向滚动"><table><thead><tr><th>来源</th><th>方法</th><th>准确率</th><th>平衡准确率</th><th>AUC</th><th>灵敏度</th><th>特异度</th></tr></thead><tbody id="finetuning-results">${finetuningRows()}</tbody></table></div><small class="matched-scroll-hint">窄屏可左右滑动表格查看全部指标。</small>
  <p class="table-note">最后层减冻结头的AUC差值条件95%区间：<span id="finetuning-contrasts">${finetuningContrasts()}</span>。区间基于固定OOF预测，不含重拟合及多重校正。</p>
  <details class="matched-details"><summary>这次微调改变了什么？</summary><p>前5轮只训练分类头，再允许最后一层更新；三内折验证BCE选择学习率和轮数，外折测试只预测。200个最后层模型中，${a.verification.last_layer_selected_encoder_changed}个最终模型实际更新编码器，${a.verification.last_layer_selected_warmup_only}个选中热身阶段。</p><p>调整在原始FC上、每个训练折内拟合，再送入固定来源缩放器和编码器。上轮在表示层调整，且使用另一种Logistic分类器，因此两轮设置分别展示。调整也可能带来输入分布偏移，不能把性能变化全归因于去除混杂。</p><p>99人与96人高度重叠，均不是新医院验证；7人来源同时改变了样本量和疾病构成。未更改临床名单，也未重新纳入处理规则不同的来源。</p></details></article>`;
}
function bindFinetuning() {
  if (!data.matched_finetuning) return;
  $('#finetuning-design').value=finetuningDesign;$('#finetuning-adjustment').value=finetuningAdjustment;
  const update=()=>{$('#finetuning-results').innerHTML=finetuningRows();$('#finetuning-contrasts').innerHTML=finetuningContrasts();};
  $('#finetuning-design').addEventListener('change',e=>{finetuningDesign=e.target.value;update();});
  $('#finetuning-adjustment').addEventListener('change',e=>{finetuningAdjustment=e.target.value;update();});
}
let matchedAdjustment = 'none';
const matchedAdjustments = {none:'未调整',age:'年龄',age_site:'年龄＋站点',age_site_motion:'年龄＋站点＋头动'};
function matchedRows() {
  const rows = data.matched_analysis?.designs[matchedDesign] || [];
  return rows.filter(r => r.adjustment === matchedAdjustment || (matchedAdjustment === 'none' && r.source === '仅混杂信息' && r.adjustment === 'age')).map(r => `<tr><th scope="row">${escapeHTML(r.source)}</th><td>${(r.accuracy*100).toFixed(2)}%</td><td>${(r.balanced_accuracy*100).toFixed(2)}%</td><td>${r.auc.toFixed(3)}</td><td>${(r.sensitivity*100).toFixed(1)}%</td><td>${(r.specificity*100).toFixed(1)}%</td></tr>`).join('');
}
function matchedAnalysisPanel() {
  const a=data.matched_analysis;
  if (!a) return '';
  return `<article class="panel matched-analysis" aria-labelledby="matched-title"><div class="matched-heading"><div><span class="eyebrow">本轮分析 · ${timeText(a.as_of, true)}</span><h2 id="matched-title">同规则来源与混杂检查</h2><p>${escapeHTML(a.conclusion)}</p></div><a class="button" href="/api/source/matched-source-report" download="MATCHED_SOURCE_ANALYSIS.md">下载完整分析</a></div>
  <div class="matched-source-flow"><div><strong>预训练 9人 → 低头动 7人</strong><span>同一SRPBS流程；低头动来源额外要求平均FD≤0.2毫米</span></div><div><strong>临床 99人 / 敏感性 96人</strong><span>目标被试保持原划分；每人只由未训练过他的模型预测</span></div></div>
  <div class="matched-controls"><label>分析队列<select id="matched-design"><option value="primary99">99人主分析</option><option value="sensitivity96">96人敏感性分析</option></select></label><label>训练折内调整<select id="matched-adjustment">${Object.entries(matchedAdjustments).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label><span>5次重复 × 5外折 × 3内折 · 阈值0.5</span></div>
  <div class="matched-table" tabindex="0" role="region" aria-label="来源比较结果，可横向滚动"><table><thead><tr><th>分类输入</th><th>准确率</th><th>平衡准确率</th><th>AUC</th><th>灵敏度</th><th>特异度</th></tr></thead><tbody id="matched-results">${matchedRows()}</tbody></table></div><small class="matched-scroll-hint">窄屏可左右滑动表格，查看AUC、灵敏度与特异度。</small><p class="table-note" id="matched-note">${matchedAdjustment==='none'?'仅混杂信息一行使用年龄；其他行未调整。':'影像特征在训练折内去除所选协变量的线性关联；仅混杂信息一行直接使用这些协变量分类。'} 所有结果均为开发性比较，不能解释为独立验证或因果效应。</p>
  <details class="matched-details"><summary>本轮保留、排除与仍可执行的训练</summary><ul>${a.roles.map(r=>`<li><strong>${escapeHTML(r.name)} · ${escapeHTML(r.role)}</strong><p>${escapeHTML(r.reason)}</p></li>`).join('')}</ul></details>
  <div class="matched-sites"><h3>站点是什么？</h3><p>站点是MRI数据采集机构或中心，不是脑区，也不是网站。设备、扫描协议和招募人群都可能随站点变化。</p><div>${a.sites.map(r=>`<section><strong>${escapeHTML(r.code)}</strong><span>${escapeHTML(r.name)}</span><small>健康 ${r.healthy} · 疼痛 ${r.pain}</small></section>`).join('')}</div><p class="table-note">站点调整和96人敏感性分析不等于未见医院测试；NKN仅3人，不据其单站点成绩作稳定结论。</p></div>
  <details class="matched-details"><summary>如何防止训练和测试混用？</summary><p>每个内折仅用训练者拟合协变量缺失值处理、站点编码、线性调整、特征缩放/筛选和分类器；验证者只用于选参数。选定后用外折训练者重拟合，外折测试者只预测。</p><p>来源由9人变为7人，同时改变了人数和疾病构成，不能把成绩差异只归因于头动。年龄/站点调整也可能移除真实疾病相关差异，所以作为敏感性检查报告。</p></details>
  </article>`;
}
function bindMatchedAnalysis() {
  if (!data.matched_analysis) return;
  $('#matched-design').value=matchedDesign;$('#matched-adjustment').value=matchedAdjustment;
  $('#matched-design').addEventListener('change', e=>{matchedDesign=e.target.value;$('#matched-results').innerHTML=matchedRows();});
  $('#matched-adjustment').addEventListener('change', e=>{matchedAdjustment=e.target.value;$('#matched-results').innerHTML=matchedRows();$('#matched-note').textContent=(matchedAdjustment==='none'?'仅混杂信息一行使用年龄；其他行未调整。':'影像特征在训练折内去除所选协变量的线性关联；仅混杂信息一行直接使用这些协变量分类。')+' 所有结果均为开发性比较，不能解释为独立验证或因果效应。';});
}

function researchSection() {
  const tab = new URLSearchParams(location.hash.split('?')[1] || '').get('tab');
  return ['results','data','methods'].includes(tab) ? tab : 'results';
}
function researchDisclosure(title, summary, content) {
  return `<details class="panel research-disclosure"><summary><strong>${escapeHTML(title)}</strong><span>${escapeHTML(summary)}</span></summary><div class="research-disclosure-body">${content}</div></details>`;
}
function datasetRegistryStatusClass(status) {
  return ({'已整理':'done','已评估':'done','部分可用':'active','待补文件':'blocked'}[status] || 'planned');
}
function datasetRegistryRows(rows) {
  return rows.map(row => `<tr data-dataset="${escapeHTML(row.id)}">
    <th scope="row"><strong>${escapeHTML(row.name)}</strong><small>${escapeHTML(row.id)} · ${escapeHTML(row.source)}</small></th>
    <td data-label="疾病或对象">${escapeHTML(row.disease)}</td>
    <td data-label="样本量（当前口径）">${escapeHTML(row.samples)}</td>
    <td data-label="支持任务">${row.tasks.map(task => `<span class="registry-chip">${escapeHTML(task)}</span>`).join('')}</td>
    <td data-label="已有材料 / 角色"><strong class="registry-materials">${escapeHTML(row.materials)}</strong><small>${escapeHTML(row.role)}</small></td>
    <td data-label="状态、缺口与依据"><div class="registry-status"><span class="badge ${datasetRegistryStatusClass(row.status)}">${escapeHTML(row.status)}</span><span class="registry-role">${escapeHTML(row.role)}</span></div><p class="registry-gap">${escapeHTML(row.gaps)}</p><div class="registry-source-links">${row.sources.map(sourceId => { const source=data.sources.find(s=>s.id===sourceId); return source ? evidenceLink(sourceId, source.label.split(' · ')[0]+' ↗') : ''; }).join('')}</div></td>
  </tr>`).join('');
}
function bindDatasetRegistry() {
  const registry=data.dataset_registry;
  if (!registry) return;
  const tableBody=$('#dataset-registry-body');
  const search=$('#dataset-registry-search');
  const filterSelect=$('#dataset-registry-filter');
  const download=$('#dataset-registry-download');
  const render=()=>{
    const query=(search?.value || '').trim().toLowerCase();
    const role=filterSelect?.value || 'all';
    const rows=registry.rows.filter(row => (role==='all' || row.role===role) && (!query || [row.id,row.name,row.source,row.disease,row.samples,row.materials,row.role,row.status,row.gaps,...row.tasks].join(' ').toLowerCase().includes(query)));
    if (tableBody) tableBody.innerHTML=rows.length ? datasetRegistryRows(rows) : '<tr><td colspan="6" class="registry-empty">没有符合条件的数据集。</td></tr>';
    const count=$('#dataset-registry-count');
    if (count) count.textContent=`显示 ${rows.length} / ${registry.rows.length} 个数据集`;
  };
  search?.addEventListener('input', render);
  filterSelect?.addEventListener('change', render);
  download?.addEventListener('click',()=>{
    const header=['编号','数据集','来源','疾病/对象','当前样本口径','可做任务','已有材料','角色','状态','缺口'];
    const lines=[header,...registry.rows.map(row=>[row.id,row.name,row.source,row.disease,row.samples,row.tasks.join('；'),row.materials,row.role,row.status,row.gaps])].map(row=>row.map(value=>`"${String(value ?? '').replace(/"/g,'""')}"`).join(','));
    const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='历史数据集清单_2026-09-22.csv'; a.click(); URL.revokeObjectURL(url);
  });
  render();
}
function datasetRegistryPanel() {
  const registry=data.dataset_registry;
  if (!registry) return '';
  const roles=[...new Set(registry.rows.map(row=>row.role))];
  const counts={ready:registry.rows.filter(row=>['已整理','已评估'].includes(row.status)).length,partial:registry.rows.filter(row=>row.status==='部分可用').length,pending:registry.rows.filter(row=>row.status==='待补文件').length};
  return musicNearscanSection(false)+painLabelInventorySection(false)+`<section class="panel dataset-registry" aria-labelledby="dataset-registry-title">
    <div class="dataset-registry-heading"><div><span class="eyebrow">会议要求 · ${escapeHTML(registry.as_of)}</span><h2 id="dataset-registry-title">历史数据集清单</h2><p>${escapeHTML(registry.note)}</p></div><button id="dataset-registry-download" class="button">下载清单 CSV ↗</button></div>
    <div class="dataset-registry-summary" aria-label="数据集登记摘要"><div><strong>${registry.rows.length}</strong><span>已登记数据集</span></div><div><strong>${counts.ready}</strong><span>已有核对口径</span></div><div><strong>${counts.partial}</strong><span>部分可用</span></div><div><strong>${counts.pending}</strong><span>等待补齐文件</span></div></div>
    <div class="dataset-registry-controls"><label class="search registry-search"><span>⌕</span><input id="dataset-registry-search" type="search" placeholder="搜索数据集、疾病、任务或缺口" /></label><label>按角色筛选<select id="dataset-registry-filter"><option value="all">全部角色</option>${roles.map(role=>`<option value="${escapeHTML(role)}">${escapeHTML(role)}</option>`).join('')}</select></label><span id="dataset-registry-count" class="data-note"></span></div>
    <div class="table-panel dataset-registry-table-wrap"><table class="dataset-registry-table"><caption class="sr-only">历史数据集、疾病对象、样本量、支持任务、材料和当前边界</caption><thead><tr><th colspan="3">数据集信息</th><th colspan="3">研究用途与边界</th></tr><tr><th>数据集 / 来源</th><th>疾病或对象</th><th>样本量（当前口径）</th><th>支持任务</th><th>已有材料 / 角色</th><th>状态、缺口与依据</th></tr></thead><tbody id="dataset-registry-body"></tbody></table></div>
    <p class="table-note">表内“样本量”指当前已核对、可用于本项目说明的口径；它不等同于公开数据集的理论总人数。模型 AUC、准确率等表现仍放在“实验结果”分区，不在此表用颜色暗示优劣。</p>
  </section>`;
}
function datasetsPage() {
  const section=researchSection();
  const sections={results:'实验结果',data:'数据概况',methods:'方法说明'};
  $('#view-datasets').innerHTML=`<div class="page-heading"><div><h1>数据与结果</h1><p class="data-note">从实验结论到数据来源，再到方法细节。</p></div></div>
    <nav class="research-sections" aria-label="数据与结果分区">${Object.entries(sections).map(([key,label])=>`<a href="#datasets?tab=${key}" ${section===key?'aria-current="page"':''}>${label}</a>`).join('')}</nav>
    <div id="research-content" class="research-workspace"></div>`;
  if (section==='data') {
    $('#research-content').innerHTML=`${diagnosticSourceFollowupData()}${datasetRegistryPanel()}<h2>原有数据概况</h2><p class="data-note">以下折叠项保留原有归档口径；上方清单按照会议要求，把数据集、任务、材料和缺口放在同一张可筛选表中。</p><div class="research-dataset-list">${data.datasets.map(d=>researchDisclosure(d.name,d.tag,`<h3>已有证据</h3><p>${escapeHTML(d.summary)}</p><h3>用途与限制</h3><p>${escapeHTML(d.boundary)}</p><div class="ds-foot">${d.sources.map(s=>evidenceLink(s, data.sources.find(x=>x.id===s).label.split(' · ')[0]+' ↗')).join(' ')}</div>`)).join('')}</div><details class="panel research-disclosure"><summary>临床标签与历史口径</summary><p class="data-note">9月3日说明：临床表可按匿名编号连接影像；旧编号不可再匹配，两项需分别处理。</p>${sectionTitle('临床标签', `<span class="muted">审计 ${escapeHTML(data.clinical.as_of)}</span>`)}<div class="panel table-panel"><table><thead><tr><th>组别</th><th>疼痛</th><th>健康</th><th>卒中</th><th>疼痛评分</th><th>疼痛问卷</th></tr></thead><tbody>${data.clinical.groups.map(g=>`<tr><td><strong>${escapeHTML(g.name)}</strong></td><td>${g.pain}</td><td>${g.healthy}</td><td>${g.stroke}</td><td>${escapeHTML(g.vas)}</td><td>${escapeHTML(g.sfmpq)}</td></tr>`).join('')}</tbody></table><p class="table-note">${escapeHTML(data.clinical.note)} 卒中不归入无痛对照；数字不代替量表定义。</p></div></details>`;
    $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('合并疼痛开发队列','查看同队列分类比较与适用边界',pooledPainSection('data')));
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('PRT 分类实验','查看分类任务与完整指标',prtClassificationSection('data')));
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('PRT 模态与标签','查看影像、行为标签和处理方法',prtModalitySection('data')));
    $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('预训练与小样本研究','查看表示、分类头、随机对照与结构输入',pretrainedPainSection('data')));
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('Emo 来源外推','查看固定模型外推结果与目标数据边界',pooledExternalSection('data')));
  $('#research-content').insertAdjacentHTML('afterbegin',(data.public_pain_update ? researchDisclosure('公开疼痛评分回归','查看VAS标签、预测误差与适用范围',publicPainSection('data')) : ''));
    bindDatasetRegistry();
  
    return;
  }
  paperMethodsPage(section);
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('合并疼痛开发队列','查看同队列分类比较与适用边界',pooledPainSection(section)));
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('PRT 分类实验','查看分类任务与完整指标',prtClassificationSection(section)));
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('PRT 模态与标签','查看影像、行为标签和处理方法',prtModalitySection(section)));
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('预训练与小样本研究','查看表示、分类头、随机对照与结构输入',pretrainedPainSection(section)));
  $('#research-content').insertAdjacentHTML('afterbegin',researchDisclosure('Emo 来源外推','查看固定模型外推结果与目标数据边界',pooledExternalSection(section)));
  $('#research-content').insertAdjacentHTML('afterbegin',(data.public_pain_update ? researchDisclosure('公开疼痛评分回归','查看VAS标签、预测误差与适用范围',publicPainSection(section)) : ''));
  if (section==='results') $('#research-content').insertAdjacentHTML('afterbegin', researchReadingGuide(data, true));
  if (section==='methods') return;
  const recentReports = [
    ['连接第二轮','240个最终模型，未见稳定整体优势。','docs/CONNECTIVITY_REFINEMENT_RESULTS_2026-09-14.md'],
    ['站点诊断','站点识别AUC约0.986；这不是疾病预测成绩。','docs/SITE_DIAGNOSIS_RESULTS_2026-09-15.md'],
    ['年龄校正','120个最终模型，未获稳定双向迁移收益。','docs/AGE_CORRECTION_RESULTS_2026-09-15.md']
  ];
  const recent=recentReports.map(([title,summary,path])=>{
    const source=data.sources.find(s=>s.repo_path===path);
    return `<div class="research-report-row"><div><h3>${escapeHTML(title)}</h3><p>${escapeHTML(summary)}</p></div>${source?evidenceLink(source.id,'查看报告 ↗'):'<span>报告尚未归档</span>'}</div>`;
  }).join('');
  $('#research-content').insertAdjacentHTML('beforeend',
    researchDisclosure('连接与混杂诊断','同一开发队列上的后续对照',recent) +
    researchDisclosure('来源与迁移实验','保留双向站点、冻结/微调和混杂调整的完整结果',siteTransferPanel()+finetuningPanel()+matchedAnalysisPanel()) +
    researchDisclosure('早期实验','内部探索与外部检验分开解读',`${sectionTitle('早期实验结果', '<span class="muted">指标仅限同类比较</span>')}<div class="result-grid">${data.results.map((r,i)=>`<article class="panel result-card ${i===2?'negative':''}"><span class="eyebrow">${escapeHTML(r.title)}</span><div class="result-value">${escapeHTML(r.value)}</div><span class="muted">${escapeHTML(r.metric)}</span><p>${escapeHTML(r.interpretation)}</p>${evidenceLink(r.source)}</article>`).join('')}</div><div class="objective"><span>分析边界</span><p>数据预处理与参数选择只在训练部分完成；预训练前排除测试个体；已消耗的验证集不可重复用于独立确认。</p></div>`));
  bindMatchedAnalysis();
  bindFinetuning();
  bindSiteTransfer();
}

function evidencePage() {
  archiveEvidencePage();
}
function showView(next) {
  view = resolveView(next);
  document.querySelectorAll('.view').forEach(el=>el.hidden=el.id!=='view-'+view);
  document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===view);if(el.dataset.view===view)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');});
  $('#view-name').textContent = viewNames[view];
  document.title = viewNames[view] + ' · fMRI 研究进度';
  if (data) renderView();
}

function renderView() {
  if(['calendar','datasets','architectures','history'].includes(view)&&!ResearchWorkbench.ready){
    const requested=view;$('#view-'+view).innerHTML='<p role="status">正在读取模型与数据集索引…</p>';
    ResearchWorkbench.load().then(()=>{if(view===requested)renderView();}).catch(error=>{$('#view-'+requested).textContent=error.message;});
    return;
  }
  if(view!=='architectures')ResearchWorkbench.close();
  ({overview,calendar:calendarPage,history:researchHistoryPage,guidance:()=>GuidanceTimeline.show(data),workflow:workflowPage,goals:goalsPage,datasets:datasetsPage,evidence:evidencePage,conclusions:conclusionsPage,architectures:()=>ArchitectureLibrary.show()})[view]();
  archiveRoute();
  if(view==='datasets')ResearchWorkbench.routeDataset().catch(error=>{$('#research-content').insertAdjacentHTML('afterbegin',`<p role="alert">${escapeHTML(error.message)}</p>`);});
}
function openDialog(eyebrow, content) {
  $('#detail-dialog').classList.remove('report-dialog');
  $('#dialog-eyebrow').textContent=eyebrow;
  $('#dialog-body').innerHTML=content;
  if (!$('#detail-dialog').open) $('#detail-dialog').showModal();
}
function openGoal(id) {
  const g = data.goals.find(item=>item.id===id);
  if (!g) return;
  const guide = g.student_guide;
  const steps = guide ? `<div class="detail-block"><h3>${g.status === 'done' ? '查看或交接这项工作' : '按这几步做'}</h3><ol class="student-task-steps">${guide.steps.map(step=>`<li>${escapeHTML(step)}</li>`).join('')}</ol></div><div class="detail-block"><h3>交付什么</h3><p>${escapeHTML(guide.deliverable)}</p></div>` : '';
  const original = `<h3>${escapeHTML(g.title)}</h3><p>${escapeHTML(g.summary)}</p><h4>原定下一步</h4><p>${escapeHTML(g.next)}</p><h4>原定完成标准</h4><p>${escapeHTML(g.criteria)}</p>`;
  openDialog(g.id+' / '+phaseTitle(data.phases.find(p=>p.id===g.phase)), `${badge(g.status)}<h2>${escapeHTML(goalTitle(g))}</h2><p class="dialog-summary">${escapeHTML(goalPurpose(g))}</p>${steps}<div class="detail-block"><h3>开始前先确认</h3>${g.depends_on.length ? g.depends_on.map(id=>`<button class="dependency" data-goal="${id}">${escapeHTML(id+' '+goalTitle(data.goals.find(x=>x.id===id)))} ↗</button>`).join(''):'<p>没有登记前置任务；按本项步骤和当前状态安排。</p>'}</div><div class="detail-block"><h3>从这些资料开始</h3>${g.sources.map(s=>evidenceLink(s,data.sources.find(x=>x.id===s).label+' ↗')).join('<br>')}</div>${guide ? `<details class="detail-block student-technical"><summary>方法细节与原定验收要求</summary>${original}</details>` : original}<div class="data-note">任务状态依据 ${escapeHTML(data.reviewed_at)} 的整理记录${guide ? '；通俗说明改写于 '+escapeHTML(data.student_workflow.edited_at) : ''}。</div>`);
}
async function openSource(id) {
  const source=data.sources.find(s=>s.id===id);
  if(!source)return;
  const requestId=++sourceRequest;
  if (window.NEUROGRAPH_PUBLIC && !source.public_url) {
    openDialog('项目证据', `<h2>${escapeHTML(source.label)}</h2><p>此材料保留在本机研究工作区。公开网站展示其研究结论与聚合结果。</p>`);
    return;
  }
  const url=window.NEUROGRAPH_PUBLIC ? source.public_url : '/api/source/'+encodeURIComponent(id);
  const controls=`<div class="report-actions"><a class="button" href="${url}?download=1" download>下载公开文件</a><a class="button" href="#evidence?source=${encodeURIComponent(id)}">报告固定链接</a></div>`;
  if (['pdf','png','jpg','jpeg'].includes(source.format)) {
    openDialog('项目证据', `<h2>${escapeHTML(source.label)}</h2><p>${escapeHTML(source.description)}</p>${controls}<a class="button primary" href="${url}" target="_blank" rel="noopener">打开 ${escapeHTML(source.format.toUpperCase())} 原件 ↗</a>`);
    return;
  }
  if (['npz','sqlite'].includes(source.format)) {
    openDialog('项目证据', `<h2>${escapeHTML(source.label)}</h2><p>这是 ${escapeHTML(source.format.toUpperCase())} 二进制文件，请下载后使用对应的数据工具打开。</p>${controls}`);
    return;
  }
  openDialog('项目证据', `<h2>${escapeHTML(source.label)}</h2>${controls}<div id="source-content" class="source-content">正在读取…</div>`);
  try {
    const response=await fetch(window.NEUROGRAPH_PUBLIC ? source.preview_url : url+'?preview=1');
    if(!response.ok)throw new Error();
    const preview=await response.json();
    if(requestId===sourceRequest && $('#source-content')) {
      ReportReader.mount(source,preview);
    }
  } catch {if(requestId===sourceRequest && $('#source-content'))$('#source-content').textContent='无法读取该文件。';}
}
function openQueue() {
  const snapshot=data.remote.snapshot;
  if(!snapshot)return;
  const batch=snapshot.batch;
  const rows=[...snapshot.subjects];
  if(batch.current_subject&&!rows.some(r=>r.subject_id===batch.current_subject))rows.push({subject_id:batch.current_subject,state:'RUNNING',visual_review:'NOT_APPLICABLE',reason:snapshot.stage});
  const visualName = value => ({ACCEPTED_BY_USER:'人工已确认',PENDING:'待人工确认',UNKNOWN:'未确认',NOT_APPLICABLE:'不适用'}[value] || value || '未确认');
  openDialog('批次 / '+batch.run_id, `<h2>逐例状态</h2><p class="dialog-summary">数据采集 ${timeText(snapshot.observed_at)}${data.remote.stale?' · 历史数据已过期':''}；修复按同一被试替换，人工确认只对应有效目录。</p><div class="table-panel"><table><thead><tr><th>编号</th><th>处理状态</th><th>人工状态</th><th>依据</th></tr></thead><tbody>${rows.map(r=>`<tr><td class="mono">${escapeHTML(r.subject_id)}</td><td>${badge(r.state)}</td><td>${escapeHTML(visualName(r.visual_review))}</td><td>${r.action==='INDEPENDENT_REPAIR'?'<span class="badge done">修复已归并</span>':''}<details><summary>记录</summary><p class="break">${escapeHTML(r.reason || '无')}</p></details></td></tr>`).join('')}</tbody></table></div><div class="detail-block"><h3>证据路径</h3><p class="mono break">${escapeHTML(batch.source)}</p><p>当前阶段：${escapeHTML(snapshot.stage||'无')}</p><p>本批 ${batch.scope_total} 人，待处理 ${batch.counts.pending||0} 例。</p>${snapshot.reconciliation?.repair_applied ? `<p>修复后仍有 ${batch.counts.failed} 例技术失败；原账本未修改。</p>` : ''}</div>`);
}

document.addEventListener('click', event=>{
  const target=event.target.closest('button');
  if(!target)return;
  if(target.dataset.goal)openGoal(target.dataset.goal);
  if(target.dataset.source)openSource(target.dataset.source);
  if(target.dataset.filter){filter=target.dataset.filter;goalResults();}
  if(target.dataset.phase){phaseFilter=target.dataset.phase;filter='all';query='';location.hash='goals';}
  if(target.dataset.action==='queue')openQueue();
  if(target.dataset.action==='reset'){filter='all';phaseFilter='all';query='';goalsPage();}
});
$('#close-dialog').addEventListener('click',()=>$('#detail-dialog').close());
$('#detail-dialog').addEventListener('click',event=>{if(event.target===$('#detail-dialog')){const rect=event.target.getBoundingClientRect();if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom)event.target.close();}});
window.addEventListener('hashchange',()=>{showView(location.hash.slice(1));window.scrollTo({top:0,behavior:'instant'});});

async function refresh() {
  if(loading)return;
  loading=true;
  $('#refresh-button').disabled=true;
  try {
    const response=await fetch(window.NEUROGRAPH_PUBLIC ? './data/dashboard.json' : '/api/dashboard?wait_remote=1', {cache:'no-store',signal:AbortSignal.timeout(60000)});
    if(!response.ok)throw new Error();
    const next=await response.json();
    lastSuccess=Date.now();
    const key=JSON.stringify({...next,served_at:null,remote:{...next.remote,age_seconds:null,refreshing:null}});
    data=next;
    $('#error-banner').hidden=true;
    $('#record-banner').hidden=!data.record_changed;
    $('#goal-nav-count').textContent=data.goals.filter(g=>g.status==='done').length+'/'+data.goals.length;
    $('#sync-state').textContent=window.NEUROGRAPH_PUBLIC ? '公开快照 · '+data.reviewed_at : !data.remote.enabled ? '本地记录 · 按需核查' : (data.remote.stale ? (data.remote.refreshing?'连接中…':'数据待更新') : '● 已同步');
    $('#sync-state').className=data.remote.stale?'sync-stale':'sync-live';
    // Do not rebuild the search box while typing; its data refreshes on input or navigation.
    if(key!==renderKey && !$('#detail-dialog').open && !document.activeElement?.matches('input,select,textarea')){
      renderView();renderKey=key;
    }
  } catch {
    $('#error-banner').textContent='连接失败，显示上次数据'+(lastSuccess?'（'+timeText(new Date(lastSuccess).toISOString())+'）':'')+'；恢复后自动重连。';
    $('#error-banner').hidden=false;
    $('#sync-state').textContent='连接中断';
    $('#sync-state').className='sync-stale';
    if(data){data.remote.stale=true;data.clinical.progress_stale=true;renderKey='';if(view==='overview')overview();}
  } finally {
    loading=false;$('#refresh-button').disabled=false;
    clearTimeout(refreshTimer);
    refreshTimer=setTimeout(()=>{if(!document.hidden)refresh();},REFRESH_INTERVAL_MS);
  }
}
$('#refresh-button').addEventListener('click', refresh);
showView(view);
refresh();
/* 阅读进度条：纯观感元素，不参与数据渲染。 */
(()=>{const bar=document.createElement('div');bar.id='scroll-progress';bar.setAttribute('aria-hidden','true');document.body.append(bar);let frame=0;const paint=()=>{const span=document.documentElement.scrollHeight-window.innerHeight;const ratio=span>0?Math.min(1,Math.max(0,window.scrollY/span)):0;bar.style.width=(ratio*100).toFixed(2)+'%';frame=0;};const queue=()=>{if(!frame)frame=requestAnimationFrame(paint);};addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});paint();})();
document.addEventListener('visibilitychange',()=>{if(!document.hidden && Date.now()-lastSuccess>=REFRESH_INTERVAL_MS)refresh();});

function fewshotGeometrySection(mode) {
  const g=data.pretrained_pain?.geometry_result;if(!g)return '';
  const table=mode==='results'?`<p>以下为训练内部任务平均AUC，不能与旧折外成绩直接排名；窄屏可横向查看。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="小样本分类头指标"><table><thead><tr><th>表示 / 分类头</th><th>每类1人</th><th>每类5人</th><th>每类10人</th></tr></thead><tbody>${g.compact_results.map(r=>`<tr><th>${escapeHTML(r.representation)}<small>${escapeHTML(r.head)}</small></th>${r.auc_by_k.map(v=>`<td>${Number(v).toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
  return `<div class="fewshot-geometry" aria-label="小样本分类头${mode}"><h3>9月25日：分类头几何比较</h3><p>${escapeHTML(g.summary)}</p>${table}<p class="data-note">${escapeHTML(g.boundary)}</p>${evidenceLink(g.source,'阅读分类头实验 ↗')}</div>`;
}

function pretrainingInputAuditSection(mode) {
  const g=data.pretrained_pain?.input_audit;if(!g)return '';
  const table=mode==='results'||mode==='methods'?`<p>此前采样检查：合成帧编号输入，固定起点0，不是患者预测成绩。窄屏可左右滑动表格。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="预训练采样检查"><table><thead><tr><th>原始帧数</th><th>输出位置</th><th>不同帧数</th><th>末帧次数</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${r.input_frames}</td><td>${r.output_frames}</td><td>${r.unique_frames}</td><td>${r.last_frame_occurrences}</td></tr>`).join('')}</tbody></table></div>`:'';
  const studyTable=g.study&&(mode==='results'||mode==='methods')?`<p>内部任务平均AUC；全支持与少样本使用不同的训练内规则，不能直接当成同一学习曲线。窄屏可左右滑动。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="Brain-JEPA内部表示比较"><table><thead><tr><th>表示</th><th>全支持</th><th>每类1人</th><th>每类5人</th><th>每类10人</th></tr></thead><tbody>${g.study.rows.map(r=>`<tr><td>${escapeHTML(r.label)}</td>${['full','k1','k5','k10'].map(k=>`<td>${r[k]===null?'—':r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
  return `<div aria-label="预训练输入审查${mode}"><h3>9月26日：Brain-JEPA时间适配与源内比较</h3><p>${escapeHTML(g.summary)}</p>${studyTable}${table}<p class="data-note">${escapeHTML(g.boundary)}</p><p>${escapeHTML(g.next)}</p>${evidenceLink(g.source,'阅读Brain-JEPA研究报告 ↗')}</div>`;
}

function painTaskModelSection(mode) {
  const g=data.pretrained_pain?.pain_task_model;if(!g)return '';
  const table=(mode==='results'||mode==='methods')?`<p>作者样例复算，MSE越低越好；目标去均值需要目标标签，不能当成未知患者校准。窄屏可左右滑动。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="RPN作者样例复算"><table style="min-width:1080px"><thead><tr><th>中心</th><th>人数</th><th>目标口径</th><th>MSE</th><th>来源均值MSE</th><th>R²</th><th>解释方差</th><th>相关系数</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${escapeHTML(r.label)}</td><td>${r.n}</td><td>${escapeHTML(r.mode)}</td>${['mse','source_mean_mse','r2','explained_variance','pearson_r'].map(k=>`<td>${r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
  return `<div aria-label="疼痛模型复现${mode}"><h3>9月26日：RPN作者模型复现与适用范围</h3><p>${escapeHTML(g.summary)}</p>${table}<p class="data-note">${escapeHTML(g.boundary)}</p><p>${escapeHTML(g.next)}</p>${evidenceLink(g.source,'阅读疼痛模型复现报告 ↗')}</div>`;
}

function rpnCalibrationSection(mode) {
  const g=data.pretrained_pain?.rpn_calibration;if(!g)return '';
  const table=(mode==='results'||mode==='methods')?`<p>支持人数为总人数，不是每类人数。MSE越低越好；窄屏可左右滑动。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="RPN少样本校准比较"><table style="min-width:1080px"><thead><tr><th>中心</th><th>支持人数</th><th>评价人数</th><th>原模型MSE</th><th>偏移校准MSE</th><th>支持均值MSE</th><th>来源均值MSE</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${escapeHTML(r.center)}</td><td>${r.k}</td><td>${r.query_n}</td>${['raw','offset','support_mean','source_mean'].map(k=>`<td>${r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
  return `<div aria-label="RPN少样本校准${mode}"><h3>9月28日：RPN校准未同时改善两个中心</h3><p>${escapeHTML(g.summary)}</p>${table}<p class="data-note">${escapeHTML(g.boundary)}</p><p>${escapeHTML(g.next)}</p>${evidenceLink(g.source,'阅读RPN少样本校准报告 ↗')}</div>`;
}

function neufomAuditSection(mode) {
 const g=data.pretrained_pain?.neufom_audit;if(!g)return '';
 const table=(mode==='results'||mode==='methods')?`<div class="paper-table-scroll" role="region" tabindex="0" aria-label="NeuFoM合成复核"><table style="min-width:850px"><thead><tr><th>核对项</th><th>实测</th><th>含义</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${escapeHTML(r.item)}</td><td>${escapeHTML(r.observed)}</td><td>${escapeHTML(r.effect)}</td></tr>`).join('')}</tbody></table></div>`:'';
 return `<div aria-label="NeuFoM公开实现${mode}"><h3>9月28日：NeuFoM公开代码需修正评价实现</h3><p>${escapeHTML(g.summary)}</p>${table}<p class="data-note">${escapeHTML(g.boundary)}</p><p>${escapeHTML(g.next)}</p>${evidenceLink(g.source,'阅读现成模型核对报告 ↗')}</div>`;
}

function representationControlsSection(mode) {
 const g=data.pretrained_pain?.representation_controls;if(!g)return '';
 const table=(mode==='results'||mode==='methods')?`<p>年龄误差和Brier越低越好；性别AUC和平衡准确率越高越好。窄屏可左右滑动。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="年龄性别辅助对照"><table style="min-width:1080px"><thead><tr><th>表示／对照</th><th>年龄MAE（岁）</th><th>年龄MSE（岁²）</th><th>性别AUC</th><th>性别平衡准确率</th><th>性别Brier</th></tr></thead><tbody>${g.rows.map(r=>`<tr><td>${escapeHTML(r.label)}</td>${['age_mae','age_mse','sex_auc','sex_ba','sex_brier'].map(k=>`<td>${r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
 return `<div aria-label="年龄性别迁移${mode}"><h3>9月28日：辅助任务中官方表示仍未超过FC</h3><p>${escapeHTML(g.summary)}</p>${table}<p class="data-note">${escapeHTML(g.boundary)}</p><p>${escapeHTML(g.next)}</p>${evidenceLink(g.source,'阅读年龄性别辅助对照报告 ↗')}</div>`;
}

function inputInventorySection(mode) {
 const g=data.pretrained_pain?.input_inventory;if(!g)return '';
 const study=data.pretrained_pain?.structural_uniform79;
 const studyTable=study&&(mode==='results'||mode==='methods')?`<p>原79人开发池9任务均值，任务互有重叠；条件区间与分组差见完整报告。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="原79人结构与FC全部方法"><table style="min-width:720px"><thead><tr><th>方法</th><th>AUC</th><th>平衡准确率</th><th>Brier</th></tr></thead><tbody>${study.rows.map(r=>`<tr><td>${escapeHTML(r.label)}</td>${['auc','ba','brier'].map(k=>`<td>${r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
 const clip=data.pretrained_pain?.clip_comparison;
 const clipTable=clip&&(mode==='results'||mode==='methods')?`<p>CLIP原79开发比较：同9任务、同人口学，324次拟合已独立复读。AUC越高越好，Brier越低越好；按人条件区间见完整报告。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="CLIP原79四分支比较"><table style="min-width:720px"><thead><tr><th>方法</th><th>AUC</th><th>平衡准确率</th><th>Brier</th></tr></thead><tbody>${clip.rows.map(r=>`<tr><td>${escapeHTML(r.label)}</td>${['auc','ba','brier'].map(k=>`<td>${r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
 const volume=data.pretrained_pain?.volume_comparison;
 const volumeTable=volume&&(mode==='results'||mode==='methods')?`<p>NeuroMamba原79人开发比较：同9任务、同人口学，243个保存模型已复算。全部配对区间和三组差见报告。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="NeuroMamba原79三分支比较"><table style="min-width:720px"><thead><tr><th>方法</th><th>AUC</th><th>平衡准确率</th><th>Brier</th></tr></thead><tbody>${volume.rows.map(r=>`<tr><td>${escapeHTML(r.label)}</td>${['auc','ba','brier'].map(k=>`<td>${r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
 const multi=data.pretrained_pain?.multidataset_fewshot;
 const multiLabels={pretrained67:'官方预训练67维',aal90:'强AAL90切空间',fc419:'同输入419区FC',nuisance:'年龄/性别/头动',random_mean:'五随机表示指标均值'};
 const multiRows=multi?[...multi.rows,...multi.random_mean_rows].filter(r=>r.k===5&&r.mode!=='source_only'&&multiLabels[r.representation]):[];
 const multiTable=multi&&(mode==='results'||mode==='methods')?`<p>两队列少样本主比较：每类5名目标支持者，3次嵌套支持抽样；源与目标联合或目标单独，均在训练内选C。以下为开发结果，完整预算、方向、随机种子和配对区间见报告。</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="两队列每类5人全部主要方法"><table style="min-width:820px"><thead><tr><th>目标</th><th>训练方式</th><th>表示</th><th>AUC</th><th>平衡准确率</th><th>Brier</th></tr></thead><tbody>${multiRows.map(r=>`<tr><td>${escapeHTML(r.target)}</td><td>${r.mode==='joint'?'源＋目标':'目标单独'}</td><td>${escapeHTML(multiLabels[r.representation])}</td>${['auc','ba','brier'].map(k=>`<td>${r[k].toFixed(4)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'';
 const transfer=data.pretrained_pain?.fc_transfer_conditions;
 const transferRows=transfer?transfer.rows.filter(r=>r.representation==='fc'&&(r.k===0||(r.k===5&&r.reference==='target'))):[];
 const transferNames={source_only:'来源单独',target_only:'目标单独','alpha0.25':'来源权重0.25','alpha0.5':'来源权重0.5',adaptive:'内层选择来源权重'};
 const transferTable=transfer&&(mode==='results'||mode==='methods')?`<p>${escapeHTML(transfer.summary)}</p><p class="data-note">${escapeHTML(transfer.boundary)}</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="强FC迁移条件主要比较"><table style="min-width:740px"><thead><tr><th>目标</th><th>训练方法</th><th>AUC</th><th>经验95%区间</th><th>平衡准确率</th><th>支持抽样范围</th></tr></thead><tbody>${transferRows.map(r=>`<tr><td>${escapeHTML(r.target)}</td><td>${escapeHTML(transferNames[r.method])}</td><td>${r.auc.toFixed(4)}</td><td>${r.auc_ci.map(v=>v.toFixed(4)).join('—')}</td><td>${r.ba.toFixed(4)}</td><td>${r.support_draw_range.map(v=>v.toFixed(4)).join('—')}</td></tr>`).join('')}</tbody></table></div><p>${evidenceLink(transfer.id,'阅读完整强FC迁移条件结果 ↗')}</p>`:'';
 const targetScaling=data.pretrained_pain?.fc_target_scaling;
 const targetScalingTable=targetScaling&&(mode==='results'||mode==='methods')?`<h4>固定目标标准化：未形成稳定改善</h4><p>${escapeHTML(targetScaling.summary)}</p><p class="data-note">${escapeHTML(targetScaling.boundary)}</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="固定目标标准化两方向主要新旧差值"><table style="min-width:700px"><thead><tr><th>目标</th><th>原自适应AUC</th><th>目标标准化AUC</th><th>配对差值</th><th>描述性95%区间</th></tr></thead><tbody>${targetScaling.primary_rows.map(r=>`<tr><td>${escapeHTML(r.target)}</td><td>${r.original_auc.toFixed(4)}</td><td>${r.target_scaling_auc.toFixed(4)}</td><td>${r.delta_auc.toFixed(4)}</td><td>${r.ci.map(v=>v.toFixed(4)).join('—')}</td></tr>`).join('')}</tbody></table></div><p>${escapeHTML(targetScaling.method)}</p><p>${evidenceLink(targetScaling.id,'阅读固定目标标准化全部结果 ↗')} ${evidenceLink(targetScaling.id+'-plan','阅读首次新拟合前方案 ↗')}</p>`:'';
 const identityVisitAudit=data.pretrained_pain?.identity_visit_audit;
 const identityVisitTable=identityVisitAudit&&(mode==='results'||mode==='methods')?`<h4>132人候选：文件与访视对应已核对</h4><p>${escapeHTML(identityVisitAudit.summary)}</p><p class="data-note">${escapeHTML(identityVisitAudit.boundary)}</p><p>${escapeHTML(identityVisitAudit.method)}</p><p>${escapeHTML(identityVisitAudit.next)}</p><p>${evidenceLink(identityVisitAudit.id,'阅读文件与访视复核报告 ↗')}</p>`:'';
 const graphResult=g.static_graph_result;const graph=graphResult?`<section class="panel"><h3>静态图模型：未形成一致开发增量</h3><p>${escapeHTML(graphResult.summary)}</p><p class="data-note">${escapeHTML(graphResult.boundary)}</p><p>${evidenceLink(graphResult.source,'阅读全部36次比较 ↗')} ${evidenceLink(graphResult.figure_source,'查看全部成对AUC ↗')}</p></section>`:'';
 const officialEmoResult=g.official_emo_result;const officialEmo=officialEmoResult?`<section class="panel"><h3>Emo53官方模型与传统对照</h3><p>${escapeHTML(officialEmoResult.summary)}</p><p class="data-note">${escapeHTML(officialEmoResult.boundary)}</p><p class="data-note">表格可左右滑动查看全部指标。</p><div style="overflow:auto" tabindex="0" aria-label="模型对照表"><table><thead><tr><th>实现</th><th>seed</th><th>AUROC</th><th>BA</th><th>Brier</th></tr></thead><tbody>${officialEmoResult.rows.map(r=>`<tr><td>${escapeHTML(r.implementation)}</td><td>${r.seed??'—'}</td><td>${Number(r.auc).toFixed(4)}</td><td>${Number(r.balanced_accuracy).toFixed(4)}</td><td>${Number(r.brier).toFixed(4)}</td></tr>`).join('')}</tbody></table></div><p>${escapeHTML(officialEmoResult.next)}</p><p>${evidenceLink(officialEmoResult.source,'查看划分、适配和全部对照 ↗')} ${evidenceLink(officialEmoResult.figure_source,'查看条件区间图 ↗')}</p></section>`:'';
 const abideOriginalResult=g.abide_original_protocol;const abideOriginal=abideOriginalResult?`<section class="panel"><h3>ABIDE原任务协议与复现状态</h3><p>${escapeHTML(abideOriginalResult.summary)}</p><p class="data-note">${escapeHTML(abideOriginalResult.boundary)}</p><div style="overflow:auto"><table><thead><tr><th>模型／协议</th><th>原文AUROC</th><th>本地AUROC ± 样本SD</th><th>差距（百分点）</th><th>实际拟合</th></tr></thead><tbody>${abideOriginalResult.rows.map(r=>`<tr><td>${escapeHTML(r.model==='BrainNetCNN'?'BrainNetCNN（BNT框架）':r.model)}<br>${escapeHTML(r.protocol_label||'')}</td><td>${Number(r.original_auc).toFixed(4)} ± ${Number(r.original_auc_sd).toFixed(4)}</td><td>${r.local_original_task_auc===null?'未测':`${Number(r.local_original_task_auc).toFixed(4)} ± ${Number(r.local_auc_sample_sd).toFixed(4)}`}</td><td>${r.delta_auc_pp===null?'—':Number(r.delta_auc_pp).toFixed(2)}</td><td>${Number(r.fits||0)}</td></tr>`).join('')}</tbody></table></div><p>${escapeHTML(abideOriginalResult.next)}</p><p>${evidenceLink(abideOriginalResult.source,'查看原任务复算与协议差异 ↗')} ${abideOriginalResult.controls_source?evidenceLink(abideOriginalResult.controls_source,'查看同数据对照与全部种子 ↗'):''} ${abideOriginalResult.input_audit_source?evidenceLink(abideOriginalResult.input_audit_source,'查看OMST与原数据缺项 ↗'):''}</p></section>`:'';
 const painReadoutResult=g.five_person_readout_result;const painReadout=painReadoutResult?`<section class="panel"><h3>五人疼痛读出未超过协变量</h3><p>${escapeHTML(painReadoutResult.summary)}</p><p class="data-note">${escapeHTML(painReadoutResult.boundary)}</p><p>${evidenceLink(painReadoutResult.source,'查看有限疼痛读出报告 ↗')}</p></section>`:'';
 const threePersonResult=g.three_person_nonlinear_result;const threePersonNonlinear=threePersonResult?`<section class="panel"><h3>3人非线性映射与真实编码</h3><p>${escapeHTML(threePersonResult.summary)}</p><p class="data-note">${escapeHTML(threePersonResult.boundary)}</p><p>${evidenceLink(threePersonResult.source,'查看空间与真实编码报告 ↗')}</p></section>`:'';
 const developmentBbrResult=g.development_bbr_result;const developmentBBR=developmentBbrResult?`<section class="panel"><h3>开发输入BBR与Omni官方权重核查</h3><p>${escapeHTML(developmentBbrResult.summary)}</p><p class="data-note">${escapeHTML(developmentBbrResult.boundary)}</p><p>${evidenceLink(developmentBbrResult.source,'查看BBR与权重报告 ↗')}</p></section>`:'';
 const omniResult=g.omni_runtime_result;const omniRuntime=omniResult?`<section class="panel"><h3>Omni-fMRI：实际运行准备与输入扩展</h3><p>${escapeHTML(omniResult.summary)}</p><p class="data-note">${escapeHTML(omniResult.boundary)}</p><p>${evidenceLink(omniResult.source,'查看模型运行报告 ↗')}</p></section>`:'';
 const crossResult=g.development_real_tokens_result;const developmentReal=crossResult?`<section class="panel"><h3>真实表示：新增编码与两人比较</h3><p>${escapeHTML(crossResult.summary)}</p><p class="data-note">${escapeHTML(crossResult.boundary)}</p><p>${evidenceLink(crossResult.source,'查看真实表示报告 ↗')}</p></section>`:'';
 const developmentResult=g.development_space_result;const developmentSpace=developmentResult?`<section class="panel"><h3>新增开发输入：空间步骤与复核</h3><p>${escapeHTML(developmentResult.summary)}</p><p class="data-note">${escapeHTML(developmentResult.boundary)}</p><p>${evidenceLink(developmentResult.source,'查看新增开发输入报告 ↗')}</p></section>`:'';
 const dynamicsResult=g.token_dynamics_result;const tokenDynamics=dynamicsResult?`<section class="panel"><h3>时序对照与跨人输入</h3><p>${escapeHTML(dynamicsResult.summary)}</p><p class="data-note">${escapeHTML(dynamicsResult.boundary)}</p><p>${evidenceLink(dynamicsResult.source,'查看时序对照与开发输入报告 ↗')}</p></section>`:'';
 const realResult=g.real_token_result;const realTokens=realResult?`<section class="panel"><h3>真实任务窗口与时空特征</h3><p>${escapeHTML(realResult.summary)}</p><p class="data-note">${escapeHTML(realResult.boundary)}</p><p>${evidenceLink(realResult.source,'查看真实窗口与时空特征报告 ↗')}</p></section>`:'';
 const nonlinResult=g.nonlinear_result;const nonlinearInput=nonlinResult?`<section class="panel"><h3>非线性空间映射与任务窗口</h3><p>${escapeHTML(nonlinResult.summary)}</p><p class="data-note">${escapeHTML(nonlinResult.boundary)}</p><p>${evidenceLink(nonlinResult.source,'查看非线性与任务窗口报告 ↗')}</p></section>`:'';
 const bbrResult=g.bias_bbr_result;const biasBBR=bbrResult?`<section class="panel"><h3>偏置校正与白质边界配准</h3><p>${escapeHTML(bbrResult.summary)}</p><p class="data-note">${escapeHTML(bbrResult.boundary)}</p><p>${evidenceLink(bbrResult.source,'查看偏置校正与BBR报告 ↗')}</p></section>`:'';
 const repairResult=g.brain_repair_result;const brainRepair=repairResult?`<section class="panel"><h3>脑提取修复后的空间输入</h3><p>${escapeHTML(repairResult.summary)}</p><p class="data-note">${escapeHTML(repairResult.boundary)}</p><p>${evidenceLink(repairResult.source,'查看脑提取修复报告 ↗')}</p></section>`:'';
 const taskResult=g.task_adaptation_result;const taskAdapt=taskResult?`<section class="panel"><h3>NeuroSTORM任务适配与CoSpine空间输入</h3><p>${escapeHTML(taskResult.summary)}</p><p class="data-note">${escapeHTML(taskResult.boundary)}</p><p>${evidenceLink(taskResult.source,'查看输入与适配器报告 ↗')}</p></section>`:'';
 const modernResult=g.modern_result;const modern=modernResult?`<section class="panel"><h3>分层图Transformer：拓扑偏置消融</h3><p>${escapeHTML(modernResult.summary)}</p><p class="data-note">${escapeHTML(modernResult.boundary)}</p><p>${evidenceLink(modernResult.source,'查看54模型消融 ↗')} ${evidenceLink(modernResult.figure_source,'查看全部模型与注意力变化 ↗')}</p></section>`:'';
 const expansionResult=g.expansion_result;const expansion=expansionResult?`<section class="panel"><h3>多算法比较与CoSpine输入</h3><p>${escapeHTML(expansionResult.summary)}</p><p class="data-note">${escapeHTML(expansionResult.boundary)}</p><p>${evidenceLink(expansionResult.source,'查看60模型与输入核对 ↗')} ${evidenceLink(expansionResult.figure_source,'查看全部配对AUC差 ↗')}</p></section>`:'';
 const items=(mode==='results'||mode==='methods')?`<ul>${g.rows.map(r=>`<li><strong>${escapeHTML(r.input)}：</strong>${escapeHTML(r.finding)} ${escapeHTML(r.action)}</li>`).join('')}</ul>`:'';
 return `<div aria-label="新输入核查${mode}"><h3>${g.normalization_block_diagnostic?.manuscript_integration ? '132人训练完成，后续诊断没有一致预训练优势' : '10月3日：偏头痛候选队列输入逐人处理中'}</h3><p>${escapeHTML(g.summary)}</p>${g.clip_summary && g.clip_summary!==g.summary?`<p class="data-note">${escapeHTML(g.clip_summary)} ${escapeHTML(g.clip_boundary)}</p>`:''}${abideOriginal}${officialEmo}${painReadout}${threePersonNonlinear}${developmentBBR}${omniRuntime}${developmentReal}${developmentSpace}${tokenDynamics}${realTokens}${nonlinearInput}${biasBBR}${brainRepair}${taskAdapt}${modern}${expansion}${graph}${items}${identityVisitTable}${transferTable}${targetScalingTable}${multiTable}${studyTable}${clipTable}${volumeTable}${volume?.boundary?`<p class="data-note">${escapeHTML(volume.boundary)}</p>`:''}<p class="data-note">${escapeHTML(g.boundary)}</p><p>${escapeHTML(g.next)}</p>${g.clip_next && g.clip_next!==g.next?`<p>${escapeHTML(g.clip_next)}</p>`:''}${g.priorities?.length?`<ol aria-label="当前三项优先投入">${g.priorities.map(r=>`<li><strong>${escapeHTML(r.title)}：</strong>${escapeHTML(r.summary)}</li>`).join('')}</ol>`:''}${g.clip_source?evidenceLink(g.clip_source,'阅读CLIP完整比较 ↗'):''} ${g.multidataset_source?evidenceLink(g.multidataset_source,'阅读两队列完整结果 ↗'):''} ${g.multidataset_figure_source?evidenceLink(g.multidataset_figure_source,'查看学习曲线 ↗'):''} ${g.volume_source?evidenceLink(g.volume_source,'阅读体积表示完整比较 ↗'):''} ${g.result_source?evidenceLink(g.result_source,'阅读79人完整比较结果 ↗'):''} ${g.validation_source?evidenceLink(g.validation_source,'阅读新验证数据需求 ↗'):''} ${evidenceLink(g.source,'阅读结构提取启动报告 ↗')} ${g.goal_source?evidenceLink(g.goal_source,'阅读整合后的研究目标 ↗'):''} ${g.audit_source?evidenceLink(g.audit_source,'阅读SPM输入复核报告 ↗'):''} ${g.batch_source?evidenceLink(g.batch_source,'阅读偏头痛批量输入阶段记录 ↗'):''}</div>`;
}

function recentResearchSection(methods=false){return brainhgtK10PilotSection(methods)+brainhgtSmallSampleReadinessSection(methods)+brainhgtTangentTargetSection(methods)+networkPairCenteringSection(methods)+networkPairAttributionSection(methods)+networkPairBilinearSection(methods)+diagnosticSourceFollowupSection(methods)+siteScoreOffsetSection(methods)+censorErrorAuditSection(methods)+staticCensorAucSection(methods)+staticCensorInputSection(methods)+motionSupportSection(methods)+srpbsTaskAuditSection(methods)+geometryCrosscohortSection(methods)+brainhgtGeometryRegularizationSection(methods)+brainhgtStageAttributionSection(methods)+fcSpdMatchedSection(methods)+mixupCrosscohortSection(methods)+newSourceDownloadSection(methods)+dsRemainingAuditSection(methods)+dsPersonAuditSection(methods)+independentReadinessSection(methods)+mixupRobustnessSection(methods)+supervisedMixupSection(methods)+linearProbeSection(methods)+sampleSizeSection(methods)+failureAttributionSection(methods)+painRegionalReadoutSection(methods)+boundedTuningSection(methods)+trainSideSSLSection(methods)+temporalReliabilitySection(methods)+communityPriorSection(methods)+cortexPCASection(methods)+spdLieBNSection(methods)+cortexRankSection(methods)+painRangeSection(methods)+cortexmaeSupportSection(methods)+cortexmaeTransferSection(methods)+musicNearscanSection(methods)+brainlmScalingSection(methods)+painLabelInventorySection(methods)+brainlmCompatibleSection(methods)+painTargetedSection(methods)+brainlmFCAuditSection(methods)+spdTemporalFusionSection(methods)+painMultiSection(methods)+spdBoundedSection(methods)+painGradingSection(methods)+spdNonlinearSection(methods)+spdDeepSection(methods)+spdFixedshrinkSection(methods)+spdVolumescaleSection(methods)+spdConditionalshiftSection(methods)+spdSiteholdoutSection(methods)+spdTaskprotoSection(methods)+spdSourcegeoSection(methods)+spdMomentumSection(methods)+spdCrossridgeSection(methods)+spdLogfirstSection(methods)+spdCosineSection(methods)+spdProximalSection(methods)+oaEarlySection(methods)+oaConfoundsSection(methods)+oaSpdSection(methods)+spdAdaptSection(methods)+spdTransferSection(methods)+spdExternalReadinessSection(methods)+spdOuterSection(methods)+spdEnsembleBudgetSection(methods)+spdEnsembleSection(methods)+spdCompactSection(methods)+spdRdropSection(methods)+spdSmallSampleSection(methods)+spdGeometrySection(methods)+fcStabilitySection(methods)+fbNetGenResidualSection(methods)+fbNetGenNeighborSection(methods)+fbNetGenSection(methods)+oaReadinessSection(methods)+brainHgtSharedEncoderSection(methods)+brainHgtSelectionSection(methods)+brainHgtGeneralizationSection(methods)+brainHgtOmstSection(methods)+emoNetworkSection(methods)+networkLagSection(methods)+cospineCommonPhysioSection(methods)+cospineNoisePilotSection(methods)+cospineRawWindowSection(methods)+cospineTimeReadinessSection(methods)+painPriorSection(methods)+compactPainSection(methods)+painModelAdaptationSection(methods)+emo27VASSection(methods)+painReadinessSection(methods)+previousRecentResearchSection(methods);}
function painReadinessSection(methods=false){
 const r=data.pain_readiness;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.name)}<br><small>${escapeHTML(q.people)}</small></th><td>${escapeHTML(q.endpoint)}<br>${escapeHTML(q.identity)}<br>${escapeHTML(q.time)}</td><td>${escapeHTML(q.FC)}<br>${escapeHTML(q.covariates)}</td><td>${escapeHTML(q.validation)}<br>${escapeHTML(q.next)}</td></tr>`).join('');
 const method=methods?'<p>按原人员键连接；临床量表、单位和时点按字典保留。准备的27患者小输入使用原AAL90时序/FC、4项混杂和6项临床历史字段，本轮未拟合缩放、填补或切空间参考，模型拟合0。</p>':'';
 return `<section class="panel pain-readiness-panel"><h2>2026-10-12疼痛数据核查</h2><p class="data-note">这是拟合前的准备记录。Emo27后续结果见上方2026-10-13同人对照；其他队列缺项分别保留。</p><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<p>${escapeHTML(r.next)}</p><details><summary>查看13条队列与分支的对应、缺项和下一步</summary><p class="data-note">窄屏可在表内横向查看；各病种、量表和任务分别解释。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="疼痛数据人员时点与对照表"><table><thead><tr><th>队列与人数</th><th>终点、人员和时点</th><th>FC及协变量</th><th>独立性与下一步</th></tr></thead><tbody>${rows}</tbody></table></div><p>来源冲突：${r.unresolved.map(escapeHTML).join(' ')}</p></details><div class="ds-foot">${evidenceLink(r.id,'查看完整核查与实验决定 ↗')} ${evidenceLink(r.id+'-cohorts','查看全部队列准备情况 ↗')}</div></section>`;
}

function emo27VASSection(methods=false){
 const r=data.emo27_vas;if(!r)return '';
 const rows=r.models.map(q=>`<tr><th>${escapeHTML(q.name)}</th><td>${q.mae.toFixed(4)}</td><td>${q.rmse.toFixed(4)}</td><td>${q.r2.toFixed(4)}</td></tr>`).join('');
 const d=r.clinical_fc_increment;
 const method=methods?'<p>同27人、原三外折/三内折；训练侧Ledoit-Wolf切空间及标准化，四个固定Ridge强度，内层MAE选参。BNT单连续输出/临床接口已通过合成梯度和重载检查，患者训练0；原作者文件未覆盖。</p>':'';
 return `<section class="panel emo27-vas-panel"><h2>Emo27访谈VAS：临床与强FC</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="Emo27访谈VAS同人对照表"><table><thead><tr><th>方法</th><th>MAE，VAS点</th><th>RMSE，VAS点</th><th>R²</th></tr></thead><tbody>${rows}</tbody></table></div><p class="data-note">MAE和RMSE越低越好；窄屏可在表内横向查看全部指标。</p><p>加入FC的MAE改善${d.improvement.toFixed(4)}点，条件95%区间[${d.interval.lower.toFixed(4)},${d.interval.upper.toFixed(4)}]，正值才是改善。区间包含0，三折没有一致改善；临床模型较均值预测的改善区间也包含0。</p><p>${escapeHTML(r.next)}</p><details><summary>查看框架准备和其他队列范围</summary><p>偏头痛132人（111患者/21对照）的AAL90 FC及原3外层/6内层人员关系已接入，新增拟合0。SRPBS、ZAN、CoSpine、DEIPP、OA等按各自终点/时点处理，不混用量表或把重复访视当独立患者。旧标签、QC、失败及停止记录保留。</p><p>${escapeHTML(r.failure)}</p></details><div class="ds-foot">${evidenceLink(r.id,'查看结果与适配决定 ↗')} ${evidenceLink(r.id+'-metrics','查看六路指标 ↗')} ${evidenceLink(r.id+'-cohorts','查看历史队列用途 ↗')}</div></section>`;
}

function painModelAdaptationSection(methods=false){
 const r=data.pain_model_adaptation;if(!r)return '';
 const rowsFor=(cohort)=>r.metric_rows.filter(q=>q.cohort===cohort).map(q=>`<tr><th>${escapeHTML(q.name)}</th><td>${q.auc.toFixed(4)}</td><td>${q.balanced_accuracy.toFixed(4)}</td><td>${q.auprc.toFixed(4)}</td><td>${q.brier.toFixed(4)}</td><td>${q.logloss.toFixed(4)}</td><td>${q.delta_auc_vs_tangent.toFixed(4)}${q.delta_lower===null?'':` [${q.delta_lower.toFixed(4)},${q.delta_upper.toFixed(4)}]`}</td></tr>`).join('');
 const tables=['zan','srpbs'].map(c=>`<details data-cohort="${c}"><summary>${c==='zan'?'ZAN54：25患者／29对照':'SRPBS99：46患者／53对照'}，查看全部九项结果</summary><p class="data-note">AUROC和BA越高越好，Brier和Logloss越低越好。AP需结合病例先验；窄屏可在表内横向查看全部指标。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="${c}多模型适配对照表"><table><thead><tr><th>模型</th><th>AUROC</th><th>BA</th><th>AP</th><th>Brier</th><th>Logloss</th><th>ΔAUROC对切空间／条件95%区间</th></tr></thead><tbody>${rowsFor(c)}</tbody></table></div></details>`).join('');
 const method=methods?`<p>${escapeHTML(r.method)}</p><p>训练仅用当前训练类别计数；内层均衡logloss选轮次，外层不选seed/配置。协变量是原四项混杂，不能当充分临床参照。</p>`:'';
 return `<section class="panel pain-model-adaptation-panel"><h2>疼痛模型适配：ZAN54与SRPBS99</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}${tables}<p>完成60最终/180内层神经拟合，30最终/360内层Logistic及40训练侧参考；630份保存模型回放12393个预测，最大误差0，复核重拟合0。</p><p>${escapeHTML(r.uncertainty)}</p><p>SRPBS神经外折训练AUROC平均0.9131–1.0000，留出明显较弱；高训练分数不等于泛化改善。ZAN正向差值区间跨0，绝对AUROC最高0.4993。</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整结果与适配决定 ↗')} ${evidenceLink(r.id+'-metrics','查看全部固定种子指标 ↗')} ${evidenceLink(r.id+'-figure','查看AUROC和条件区间图 ↗')}</div></section>`;
}

function compactPainSection(methods=false){
 const r=data.compact_pain_adaptation;if(!r)return '';
 const labels={zan:'ZAN54：25患者／29对照',srpbs:'SRPBS99：46患者／53对照',emo:'Emo53：27患者／26对照',migraine:'偏头痛132：111患者／21对照'};
 const tables=Object.keys(labels).map(c=>`<details data-cohort="${c}"><summary>${labels[c]}，查看全部十三项结果</summary><p class="data-note">AUROC和BA越高越好，Brier和Logloss越低越好。AP结合病例先验阅读；窄屏可在表内横向查看。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="${c}紧凑模型对照表"><table><thead><tr><th>模型</th><th>AUROC</th><th>BA</th><th>AP</th><th>Brier</th><th>Logloss</th><th>ΔAUROC对切空间／条件95%区间</th></tr></thead><tbody>${r.metric_rows.filter(q=>q.cohort===c).map(q=>`<tr><th>${escapeHTML(q.name)}</th><td>${q.auc.toFixed(4)}</td><td>${q.balanced_accuracy.toFixed(4)}</td><td>${q.auprc.toFixed(4)}</td><td>${q.brier.toFixed(4)}</td><td>${q.logloss.toFixed(4)}</td><td>${q.delta_auc_vs_tangent.toFixed(4)}${q.delta_lower===null?'':` [${q.delta_lower.toFixed(4)},${q.delta_upper.toFixed(4)}]`}</td></tr>`).join('')}</tbody></table></div></details>`).join('');
 const method=methods?`<p>${escapeHTML(r.method)}</p><p>全部从随机初始化训练；作者源码另存修改版本，BrainNetCNN评估dropout修正单列。原源码、权重、标签、QC及停止分支保留。</p>`:'';
 return `<section class="panel compact-pain-panel"><h2>疼痛模型紧凑适配：四队列五模型</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}${tables}<p>完成160最终/450内层神经拟合，18最终/180内层新增Logistic；复用30最终/360内层旧匹配对照。${r.verification.neural_models+r.verification.classical_models}份模型回放${r.verification.probabilities}个预测，最大误差${Math.max(r.verification.neural_max_error,r.verification.classical_max_error)}，复核重拟合0。</p><p>${escapeHTML(r.uncertainty)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整结果与源码改动 ↗')} ${evidenceLink(r.id+'-metrics','查看全部固定种子指标 ↗')} ${evidenceLink(r.id+'-figure','查看四队列AUROC区间图 ↗')}</div></section>`;
}

function painPriorSection(methods=false){
 const r=data.pain_prior_transfer;if(!r)return '';
 const labels={emo:'Emo27：访谈VAS0–100',sup7:'SRPBS sup7：29患者，原VAS端点/时点未确认',sup8:'SRPBS sup8：15患者，原VAS端点/时点未确认'};
 const tables=Object.keys(labels).map(c=>`<details data-cohort="${c}"><summary>${labels[c]}，查看全部25项结果</summary><p class="data-note">MAE/RMSE越低越好，R²需结合常量参照。原量表单位分别保留，不做跨组排名；窄屏可在表内横向查看。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="${c}冻结先验回归对照表"><table><thead><tr><th>模型</th><th>MAE↓</th><th>RMSE↓</th><th>R²</th><th>相对临床Ridge的MAE改善／条件95%区间</th></tr></thead><tbody>${r.metric_rows.filter(q=>q.cohort===c).map(q=>`<tr><th>${escapeHTML(q.name)}</th><td>${q.mae.toFixed(4)}</td><td>${q.rmse.toFixed(4)}</td><td>${q.r2.toFixed(4)}</td><td>${q.improvement_MAE_vs_clinical.toFixed(4)}${q.lower===null?'':` [${q.lower.toFixed(4)},${q.upper.toFixed(4)}]`}</td></tr>`).join('')}</tbody></table></div></details>`).join('');
 const method=methods?`<p>${escapeHTML(r.method)}</p><p>SVR与Ridge不宣称RPN预训练。原官方分类权重没有换头冒充回归；随机权重对照保留相同输出分布buffer，只检验神经权重。</p>`:'';
 return `<section class="panel pain-prior-panel"><h2>小样本疼痛回归：冻结先验适配</h2><p>Built with PriorLabs-TabPFN</p><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}${tables}<p>432个冻结先验上下文任务，270份SVR、780份新增Ridge；复用156份旧Emo Ridge及6份常量，另12份新常量。患者神经梯度步骤0；${r.verification.prior_contexts+r.verification.traditional_models}份模型/上下文回放${r.verification.predictions}个预测，最大误差${Math.max(r.verification.prior_max_error,r.verification.traditional_max_error).toExponential(2)}。</p><p>${escapeHTML(r.uncertainty)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看结果与继续/停止决定 ↗')} ${evidenceLink(r.id+'-metrics','查看全部种子指标 ↗')} ${evidenceLink(r.id+'-adapter','查看自有适配代码 ↗')} ${evidenceLink(r.id+'-license','查看TabPFN许可证 ↗')}</div></section>`;
}

function cospineTimeReadinessSection(methods=false){
 const r=data.cospine_pain_readiness;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.item)}</th><td>${escapeHTML(q.result)}</td><td>${escapeHTML(q.limit)}</td></tr>`).join('');
 const method=methods?'<p>真实时空前缀保留288通道、2×2×2空间单元和20个位置。5504参数残差接口通过真实缓存梯度检查；其自身的时间限制不代表冻结encoder或上游滤波因果。限定窗口归一化候选未部署到本批次，新疼痛监督拟合0。</p>':'';
 const v=r.verification;
 return `<section class="panel cospine-time-readiness-panel"><h2>CoSpine：输入与时序适配准备</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="CoSpine时序适配准备表"><table><thead><tr><th>项目</th><th>实际结果</th><th>适用范围与缺项</th></tr></thead><tbody>${rows}</tbody></table></div><p>独立读回${v.full_BOLD_values_checked}个BOLD值及${v.token_values_checked}个缓存值；新增监督拟合${v.pain_supervised_fits}，研究留出MRI读取${v.holdout_MRI_reads}。</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整报告 ↗')} ${evidenceLink(r.id+'-readiness','查看准备情况 ↗')} ${evidenceLink(r.id+'-adapter','查看适配接口 ↗')}</div></section>`;
}

function cospineRawWindowSection(methods=false){
 const r=data.cospine_raw_window;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.item)}</th><td>${escapeHTML(q.result)}</td><td>${escapeHTML(q.limit)}</td></tr>`).join('');
 const method=methods?'<p>按实测SliceTiming对齐原始短段，统计来自单独的完整刺激前采集帧；固定空间处理后只运行一次官方冻结encoder。内部token按完整报告前窗口解释；未做场图或生理噪声校正，短窗FC不能冒充原静息强FC。</p>':'';
 return `<section class="panel cospine-raw-window-panel"><h2>CoSpine：原始报告前输入试验</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="原始报告前输入试验表"><table><thead><tr><th>项目</th><th>实际结果</th><th>缺项和限制</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整报告 ↗')} ${evidenceLink(r.id+'-readiness','查看缺项 ↗')} ${evidenceLink(r.id+'-code','查看输入接口 ↗')}</div></section>`;
}

function cospineNoisePilotSection(methods=false){
 const r=data.cospine_noise_pilot;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.item)}</th><td>${escapeHTML(q.result)}</td><td>${escapeHTML(q.limit)}</td></tr>`).join('');
 const method=methods?'<p>固定TOPUP校正同一报告前原始prefix，复用官方冻结模型；32项设计只作实测可辨识性诊断，未运行BOLD生理回归。8帧不能直接套32项生理去噪；实际TTL、整段采样长度和校准到BOLD姿态仍待核实。</p>':'';
 return `<section class="panel cospine-noise-pilot-panel"><h2>CoSpine：畸变与短窗生理诊断</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="畸变与生理诊断表"><table><thead><tr><th>项目</th><th>实际结果</th><th>缺项和限制</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整报告 ↗')} ${evidenceLink(r.id+'-readiness','查看诊断与缺项 ↗')} ${evidenceLink(r.id+'-code','查看设计接口 ↗')}</div></section>`;
}

function cospineCommonPhysioSection(methods=false){
 const r=data.cospine_common_physio;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.item)}</th><td>${escapeHTML(q.result)}</td><td>${escapeHTML(q.limit)}</td></tr>`).join('');
 const method=methods?'<p>4折留一人。共同生理、温度及运动协变量共享；FC来自真实AAL90采集帧。训练人内插补、归一化、FC参考与alpha选取；官方模型冻结，小残差5480参数，另有同预算读出对照。全部种子和失败保留。</p>':'';
 return `<section class="panel cospine-common-physio-panel"><h2>CoSpine：共同生理协变量与多人对照</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="共同生理协变量模型对照表"><table><thead><tr><th>方法</th><th>同人误差</th><th>对强FC变化</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整报告 ↗')} ${evidenceLink(r.id+'-readiness','查看全部对照 ↗')} ${evidenceLink(r.id+'-code','查看计算接口 ↗')}</div></section>`;
}

function networkLagSection(methods=false){
 const r=data.network_lag;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.item)}</th><td>${escapeHTML(q.result)}</td><td>${escapeHTML(q.limit)}</td></tr>`).join('');
 const method=methods?'<p>固定感觉—岛叶/扣带24边的反对称时滞投影；每窗两真实刺激前帧作基线，尺度与能量收缩仅训练估计。1–3训练人、每人5/10/15个连续评分标签；α固定10，同人员、同预算10路比较。最近时滞方法、去收缩、对称项和FC消融保留；这是既有机制的短窗适配。</p>':'';
 return `<section class="panel network-lag-panel"><h2>短窗网络时序指标：未获稳定疼痛关联</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="短窗网络指标同预算对照"><table><thead><tr><th>方法</th><th>人均MAE，PR点</th><th>对共同协变量变化</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看关联与稳定性报告 ↗')} ${evidenceLink(r.id+'-novelty','查看最近原论文 ↗')} ${evidenceLink(r.id+'-comparison','查看同数据对照 ↗')} ${evidenceLink(r.id+'-learning','下载完整学习曲线 ↗')} ${evidenceLink(r.id+'-curve','查看曲线图 ↗')} ${evidenceLink(r.id+'-code','查看计算代码 ↗')}</div></section>`;
}

function emoNetworkSection(methods=false){
 const r=data.emo_network;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.item)}</th><td>${escapeHTML(q.result)}</td><td>${escapeHTML(q.limit)}</td></tr>`).join('');
 const method=methods?'<p>固定36个组内/组间关系，16次连续块采样估计个人噪声；群体均值、尺度和收缩先验只用训练人员。原三折18/9，6/12/18个人标签、75/150/300处理位置、全部固定种子与消融保留。核心经验Bayes已有先例，本轮是患者小样本适配。</p>':'';
 return `<section class="panel emo-network-panel"><h2>Emo27：估计一致性改善，疼痛关联不足</h2><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="患者网络表征同预算对照"><table><thead><tr><th>方法（均含临床和心理项）</th><th>MAE，VAS点</th><th>对临床变化与关联</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整报告 ↗')} ${evidenceLink(r.id+'-novelty','查看最近原论文 ↗')} ${evidenceLink(r.id+'-comparison','查看同数据对照 ↗')} ${evidenceLink(r.id+'-learning','下载完整学习曲线 ↗')} ${evidenceLink(r.id+'-curve','查看学习曲线图 ↗')} ${evidenceLink(r.id+'-stability','查看稳定性图 ↗')} ${evidenceLink(r.id+'-confounds','查看心理与临床相关 ↗')} ${evidenceLink(r.id+'-code','查看计算代码 ↗')}</div></section>`;
}

function brainHgtOmstSection(methods=false){
 const r=data.brainhgt_omst;if(!r)return '';
 const rows=r.metric_rows.map(q=>`<tr><th>${escapeHTML(q.dataset)}</th><td>${escapeHTML(q.model)}</td><td>${q.seed===null?'不适用':q.seed}</td><td>${q.auc.toFixed(4)}</td><td>${q.balanced_accuracy.toFixed(4)}</td><td>${q.ap.toFixed(4)}</td><td>${q.brier.toFixed(4)}</td></tr>`).join('');
 const method=methods?'<p>完整作者模型：256维、8头、1层、FF1024、社区编码器32。signed Pearson FC为节点特征，论文定义OMST选边后非负邻接进入作者最短路径；不缩小模型、不用正FC代替OMST、不加协变量logit支路。seed0/1、100轮上限、batch32，内层AUC选轮，外层只评固定查询。未说明的构图细节及与原论文协议差异见报告。</p>':'';
 return `<section class="panel brainhgt-omst-panel"><h2>完整BrainHGT与论文OMST疼痛对照</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="完整BrainHGT与传统对照全部结果"><table><thead><tr><th>队列</th><th>方法</th><th>seed</th><th>OOF AUROC</th><th>BA</th><th>AP</th><th>Brier↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.uncertainty)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整结果 ↗')} ${evidenceLink(r.id+'-comparison','查看老师汇报对照表 ↗')} ${evidenceLink(r.id+'-metrics','下载全部指标 ↗')} ${evidenceLink(r.id+'-graphs','查看OMST选边聚合 ↗')} ${evidenceLink(r.id+'-plan','查看拟合前方案 ↗')} ${evidenceLink(r.id+'-code','查看论文OMST代码 ↗')}</div></section>`;
}

function brainHgtGeneralizationSection(methods=false){
 const r=data.brainhgt_generalization;if(!r)return '';
 const rows=r.mean_rows.map(q=>`<tr><th>${escapeHTML(q.dataset)}</th><td>${escapeHTML(q.model)}</td><td>${q.auc_mean.toFixed(4)} ± ${q.auc_sd.toFixed(4)}</td><td>${q.balanced_accuracy_mean.toFixed(4)}</td><td>${q.sensitivity_mean.toFixed(4)}</td><td>${q.specificity_mean.toFixed(4)}</td><td>${q.brier_mean.toFixed(4)}</td><td>${q.logloss_mean.toFixed(4)}</td></tr>`).join('');
 const method=methods?'<p>完整作者BrainHGT与已保存OMST保持；AdamW仅改优化器，偏头痛均衡CE仅改训练类别权重，不组合。各项只有一个非默认配置，全部训练内结果决定是否进行新外折评价。原模型seed0/1复用、seed2/3/4补齐；平均AUC为各seed完整OOF AUC的算术均值，SD为初始化差异，不平均概率。</p>':'';
 return `<section class="panel brainhgt-generalization-panel"><h2>BrainHGT泛化诊断与五种子训练比较</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="五种子平均AUC与完整训练条件"><table><thead><tr><th>队列</th><th>条件</th><th>平均OOF AUC ± SD</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.uncertainty)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看诊断与全部结果 ↗')} ${evidenceLink(r.id+'-comparison','查看老师对照表 ↗')} ${evidenceLink(r.id+'-metrics','查看五个seed单值 ↗')} ${evidenceLink(r.id+'-inner','查看未保留的训练配置 ↗')} ${evidenceLink(r.id+'-selection','查看选轮诊断 ↗')} ${evidenceLink(r.id+'-plan','查看执行预算 ↗')}</div></section>`;
}

function brainHgtSelectionSection(methods=false){
 const r=data.brainhgt_selection;if(!r)return '';
 const rows=r.mean_rows.map(q=>`<tr><th>${escapeHTML(q.dataset)}</th><td>${q.selector==='auc'?'最高验证AUC':'最低验证logloss'}</td><td>${q.auc_mean.toFixed(4)} ± ${q.auc_sd.toFixed(4)}</td><td>${q.ba_mean.toFixed(4)}</td><td>${q.sensitivity_mean.toFixed(4)}</td><td>${q.specificity_mean.toFixed(4)}</td><td>${q.brier_mean.toFixed(4)}</td><td>${q.logloss_mean.toFixed(4)}</td></tr>`).join('');
 const method=methods?'<p>完整作者BrainHGT和原OMST保持，Adam与普通交叉熵保持；每条内层训练轨迹分别保存最高AUC和最低logloss检查点，精确并列取最早，各自内层轮数中位数向下取整重训外层。原AUC内层权重完全复现后复用原外层；两规则轮数相同共用权重。seed0–4全部保留，没有阈值或温度调节。</p>':'';
 return `<section class="panel brainhgt-selection-panel"><h2>BrainHGT五种子选轮对照</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll" tabindex="0" role="region" aria-label="五种子平均AUC与两种选轮规则"><table><thead><tr><th>队列</th><th>选轮规则</th><th>平均OOF AUC ± SD</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.uncertainty)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看选轮对照报告 ↗')} ${evidenceLink(r.id+'-comparison','查看老师对照表 ↗')} ${evidenceLink(r.id+'-metrics','查看五个seed单值 ↗')} ${evidenceLink(r.id+'-inner','查看训练内指标 ↗')} ${evidenceLink(r.id+'-selection','查看选轮及重训轮数 ↗')} ${evidenceLink(r.id+'-plan','查看执行方案 ↗')}</div></section>`;
}

function brainHgtSharedEncoderSection(methods=false){
 const r=data.brainhgt_shared_encoder;if(!r)return '';
 const rows=r.mean_rows.map(q=>`<tr><th>${escapeHTML(q.dataset)}</th><td>${escapeHTML(q.condition)}</td><td>${q.auc_mean.toFixed(4)} ± ${q.auc_sd.toFixed(4)}</td><td>${q.ba_mean.toFixed(4)}</td><td>${q.sensitivity_mean.toFixed(4)}</td><td>${q.specificity_mean.toFixed(4)}</td><td>${q.brier_mean.toFixed(4)}</td><td>${q.logloss_mean.toFixed(4)}</td></tr>`).join('');
 const choices=r.decisions.map(q=>`<tr><th>${q.cohort==='srpbs'?'SRPBS99':'偏头痛132'}</th><td>${q.variant==='shared32'?'ROI共享32':'ROI共享994'}</td><td>${q.mean_deltas.auc.toFixed(4)}</td><td>${q.seed_deltas.filter(x=>x.auc>0).length}/5</td><td>${q.mean_deltas.logloss.toFixed(4)}</td><td>${q.retained?'已评估外层':'未通过内层标准，未算外层AUC'}</td></tr>`).join('');
 const method=methods?'<p>只把全90×256展平encoder替换为每ROI共用的256→32→32→256或256→994→994→256三层MLP，其余原始tensor/OMST/先验/冻结原型/注意力/分类头保持。Adam、普通CE、最高内层AUC选轮与原人级划分保持。共享994 encoder为1,499,208参数，原为1,498,688；接近参数量不等于表达能力相同。共享机制已有通用研究，本轮未证明疼痛特异性。</p>':'';
 return `<section class="panel brainhgt-shared-encoder-panel"><h2>BrainHGT五种子共享encoder结构对照</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p>${method}<div class="paper-table-scroll main-results" tabindex="0" role="region" aria-label="五种子平均AUC与共享结构"><table style="min-width:920px"><thead><tr><th>队列</th><th>结构</th><th>平均OOF AUC ± SD</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><h3>全部候选的保留决定</h3><p>先完成全部内层比较，再按拟合前标准保留；未通过的外层AUC不填0。最高AUC选轮后的验证指标仅用于有限可行性判断。</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="候选保留与未执行项"><table style="min-width:860px"><thead><tr><th>队列</th><th>候选</th><th>内层ΔAUC</th><th>种子正方向</th><th>内层Δlogloss</th><th>实际状态</th></tr></thead><tbody>${choices}</tbody></table></div><p>${escapeHTML(r.uncertainty)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看结构对照报告 ↗')} ${evidenceLink(r.id+'-comparison','查看老师对照表 ↗')} ${evidenceLink(r.id+'-metrics','查看全部种子 ↗')} ${evidenceLink(r.id+'-decisions','查看保留决定 ↗')} ${evidenceLink(r.id+'-clinical','查看临床字段盘点 ↗')} ${evidenceLink(r.id+'-plan','查看执行方案 ↗')}</div></section>`;
}

function oaReadinessSection(methods=false){
 const r=data.oa_readiness_audit;if(!r)return '';
 const rows=r.groups.map(q=>`<tr><th>${escapeHTML(q.endpoint)}</th><td>${q.original_patients}</td><td>${q.motion_excluded}</td><td>${q.processed}</td><td>${q.numeric_pass}</td><td>${q.pass_responders}/${q.pass_nonresponders}</td><td>${q.stage1_not_pass}</td><td>${q.aal90_not_pass}</td><td>${q.training_included}</td></tr>`).join('');
 const failures=r.failures.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.people}</td></tr>`).join('');
 return `<section class="panel oa-readiness-panel"><h2>OA治疗反应队列：失败原因与临床对应核查</h2><p>10月14日开始核查，10月15日整理交付；原处理与标签日期保持。</p><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll oa-groups" tabindex="0" role="region" aria-label="OA分治疗组人数"><table style="min-width:1050px"><thead><tr><th>研究/药物终点</th><th>原患者</th><th>原头动排除</th><th>已处理</th><th>数值通过</th><th>通过者应答/不应答</th><th>阶段1未通过</th><th>AAL90未通过</th><th>训练纳入</th></tr></thead><tbody>${rows}</tbody></table></div><p>三组分别解释。数值通过8例仍待审核；三个月安慰剂交集2例均应答，不能计算该交集的二分类判别性能。新增拟合0。</p><details ${methods?'open':''}><summary>原检查项和重叠</summary><div class="paper-table-scroll" tabindex="0" role="region" aria-label="原检查项人数"><table style="min-width:650px"><thead><tr><th>原检查项</th><th>涉及人数</th></tr></thead><tbody>${failures}</tbody></table></div><p>各项可重叠：25次失败标记来自19人。9人停在第一阶段QC，10人停在AAL90；不能把所有未通过归为程序崩溃。</p></details><p>逐人MRI、治疗开始和随访日期，以及基线VAS仍未取得；治疗前MRI仅有队列层面的来源说明。改善百分比是结局，不能充当基线疼痛或治疗前预测输入。</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看核查报告 ↗')} ${evidenceLink(r.id+'-groups','查看分组人数 ↗')} ${evidenceLink(r.id+'-failures','查看失败项 ↗')} ${evidenceLink(r.id+'-clinical','查看临床对应缺项 ↗')}</div></section>`;
}

function fbNetGenSection(methods=false){
 const r=data.fbnetgen_srpbs;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.mean.auc.toFixed(4)} ± ${q.sample_sd.auc.toFixed(4)}</td><td>${q.mean.ap.toFixed(4)}</td><td>${q.mean.ba.toFixed(4)}</td><td>${q.mean.sensitivity.toFixed(4)}</td><td>${q.mean.specificity.toFixed(4)}</td><td>${q.mean.brier.toFixed(4)}</td><td>${q.mean.logloss.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel fbnetgen-panel"><h2>FBNetGen作者实现：SRPBS五种子对照</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll fbnetgen-table" tabindex="0" role="region" aria-label="FBNetGen五种子指标"><table style="min-width:1100px"><thead><tr><th>方法</th><th>AUC均值±样本SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier</th><th>logloss</th></tr></thead><tbody>${rows}</tbody></table></div><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>作者行为、输入与本地适配</summary><p>作者三个einsum按邻接行和缩放本节点特征；同度不同拓扑的合成反例得到相同logits。本轮保留这一行为。</p><p>AAL90、240时间点、原人员划分；节点输入保留signed FC，固定邻接取绝对Pearson，learned采用GRU生成图。两条件同预测器、批次、mixup、优化器和监督预算，无协变量头。既有强FC参考包含4协变量，另作背景参照。</p><p>内层最多100轮，最高验证AUC、最早并列选轮，外层按中位轮数重训。缩放仅用训练人员。与作者原数据/500轮/全队列缩放不同，固定图CE倍数也作匹配调整。</p><p>200份检查点读回；全部seed先分别计算完整OOF AUC，再取均值±样本SD。条件bootstrap不覆盖重训或历次研究选择。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整报告 ↗')} ${evidenceLink(r.id+'-metrics','全部seed指标 ↗')} ${evidenceLink(r.id+'-comparison','同条件对照表 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function fbNetGenNeighborSection(methods=false){
 const r=data.fbnetgen_neighbor;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.mean.auc.toFixed(4)} ± ${q.sample_sd.auc.toFixed(4)}</td><td>${q.mean.ap.toFixed(4)}</td><td>${q.mean.ba.toFixed(4)}</td><td>${q.mean.sensitivity.toFixed(4)}</td><td>${q.mean.specificity.toFixed(4)}</td><td>${q.mean.brier.toFixed(4)}</td><td>${q.mean.logloss.toFixed(4)}</td></tr>`).join('');
 const contrasts=r.contrasts.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.mean_auc_difference.toFixed(4)}</td><td>[${q.conditional_person_bootstrap_95.map(v=>v.toFixed(4)).join(', ')}]</td><td>${q.positive_seeds}/5</td></tr>`).join('');
 return `<section class="panel fbnetgen-neighbor-panel"><h2>FBNetGen邻居聚合：四条件五种子对照</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll fbnetgen-neighbor-table" tabindex="0" role="region" aria-label="FBNetGen四条件指标"><table style="min-width:1100px"><thead><tr><th>方法</th><th>AUC均值±样本SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier</th><th>logloss</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="预指定四项比较"><table style="min-width:800px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>同人条件95%区间</th><th>正方向种子</th></tr></thead><tbody>${contrasts}</tbody></table></div><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>修改内容、固定设置与验证范围</summary><p>仅将三个einsum由行和缩放改为真正邻居聚合。合成同度异拓扑反例中，旧输出差0，新logits差0.013021；实际五种子判别成绩没有提高。</p><p>AAL90、240时间点、原99人和人员划分。固定图取绝对Pearson，节点输入保留signed FC；图生成、原图尺度、模型层、初始化、批次、mixup、损失、优化器和训练内缩放保持。未针对新聚合重新调参。</p><p>新增150次内层、50次外层训练；旧行和版本200次拟合只读复用。内层最多100轮，最高验证AUC并列取最早轮，外层按中位轮数重训。200份新检查点读回最大概率误差0。</p><p>五种子各自计算完整OOF AUC再取均值与样本SD；20项种子指标独立核算，四项条件区间独立核算。区间未作多重比较校正，不覆盖重训和历次开发选择。既有切空间FC＋4协变量参考AUC0.7527，输入与模型选择设置不同，本轮未重训。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'查看完整报告 ↗')} ${evidenceLink(r.id+'-comparison','四条件与全部种子表 ↗')} ${evidenceLink(r.id+'-contrasts','四项比较 ↗')} ${evidenceLink(r.id+'-metrics','全部种子指标 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function fbNetGenResidualSection(methods=false){
 const r=data.fbnetgen_residual;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.mean.auc.toFixed(4)} ± ${q.sample_sd.auc.toFixed(4)}</td><td>${q.mean.ap.toFixed(4)}</td><td>${q.mean.ba.toFixed(4)}</td><td>${q.mean.sensitivity.toFixed(4)}</td><td>${q.mean.specificity.toFixed(4)}</td><td>${q.mean.brier.toFixed(4)}</td><td>${q.mean.logloss.toFixed(4)}</td></tr>`).join('');
 const contrasts=r.contrasts.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.mean_auc_difference.toFixed(4)}</td><td>[${q.conditional_person_bootstrap_95.map(v=>v.toFixed(4)).join(', ')}]</td><td>${q.positive_seeds}/5</td></tr>`).join('');
 return `<section class="panel fbnetgen-residual-panel"><h2>FBNetGen归一化与残差传播：五种子对照</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll fbnetgen-residual-table" tabindex="0" role="region" aria-label="归一化、残差、不传播及历史参照"><table style="min-width:1100px"><thead><tr><th>方法</th><th>AUC均值±样本SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="预指定四项比较"><table style="min-width:800px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>同人条件95%区间</th><th>正方向种子</th></tr></thead><tbody>${contrasts}</tbody></table></div><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>方法、预算与核验范围</summary><p>只在预测传播中将非负学习图M按行归一化为P。残差用 H+tanh(a)(PH−H)，三个a初值0；不传播条件直接用H。原图正则仍计算M，signed FC节点特征、原自环和ROI顺序保持。新增3标量，总参数225647，仍是完整模型训练，尚未验证K5收益。</p><p>原99人、AAL90/240帧、5外折各3内折、seed0–4，225内层加75外层训练。原GRU、损失、mixup、优化器、训练内标量缩放与选轮保持；全部300份模型严格读回最大概率差0。旧两批400拟合只读复用。</p><p>每seed完整OOF AUC再取五seed均值和样本SD；全部25项种子条件指标及四项条件区间已独立核算。残差减归一化仅3/5种子正向且区间跨0，不达到预先标准。归一化不是稳定改善，残差也没有超过不传播。既有切空间FC加4协变量0.7527只作背景，输入/选择设置不同。</p><p>结果2026-10-15 23:08完成，2026-10-16复核。阴性结果保留，不根据外层分数延长搜索。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','全部五种子表 ↗')} ${evidenceLink(r.id+'-contrasts','四项比较 ↗')} ${evidenceLink(r.id+'-metrics','全部指标 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')} ${evidenceLink(r.id+'-code','传播实现 ↗')}</div></section>`;
}

function fcStabilitySection(methods=false){
 const r=data.fc_stability;if(!r)return '';
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.mean.auc.toFixed(4)}</td><td>${q.mean.panel_auc_sample_sd.toFixed(4)}</td><td>${q.mean.auprc.toFixed(4)}</td><td>${q.mean.balanced_accuracy.toFixed(4)}</td><td>${q.mean.sensitivity.toFixed(4)}</td><td>${q.mean.specificity.toFixed(4)}</td><td>${q.mean.brier.toFixed(4)}</td><td>${q.mean.logloss.toFixed(4)}</td></tr>`).join('');
 const contrasts=Object.entries(r.contrasts).map(([name,q])=>`<tr><th>一致性加权减${name==='uniform'?'普通L2':'打乱权重'}</th><td>${q.delta_mean_auc.toFixed(4)}</td><td>[${q.conditional_person_interval.map(v=>v.toFixed(4)).join(', ')}]</td><td>${q.positive_panels}/15</td></tr>`).join('');
 return `<section class="panel fc-stability-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll fc-stability-table" tabindex="0" role="region" aria-label="三条件内验证指标"><table style="min-width:1100px"><thead><tr><th>正则条件</th><th>平均内验证AUC</th><th>相关分区SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="预定两项配对比较"><table style="min-width:800px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向分区</th></tr></thead><tbody>${contrasts}</tbody></table></div><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>方法、预算与复核</summary><p>训练人员的前后两个不重叠120帧时间块，共用训练全段拟合的切空间参考；按跨人的边对应估计一致性。对较不一致的边施加更大L2惩罚，打乱条件保持权重分布。四协变量相同，先标准化再施加惩罚。C=1固定，不选参、不早停。</p><p>原5个外训练组各3内分区；只在内训练/内验证运行，共45个4010系数的逻辑分类器和15份切空间参考。确定性分类器，不把重复初始化称作多seed。全部训练AUC为1，本轮仍需警惕高维强拟合。45个模型读回概率差0，全部指标及两项区间另算通过，复核重拟合0；外层最终拟合与查询评分均为0。</p><p>两项比较没有达到预先平均差至少0.01、12/15分区正向、五组均正及条件区间下界大于0的标准。15分区人员重叠；不能与历史外层OOF的0.7527或图模型五seed均值直接排名。固定映射停止，不追加K5或参数搜索。CPU批处理约18秒，未占GPU。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','全部15分区对照表 ↗')} ${evidenceLink(r.id+'-metrics','45项指标 ↗')} ${evidenceLink(r.id+'-contrasts','两项比较 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')} ${evidenceLink(r.id+'-code','正则实现 ↗')}</div></section>`;
}

function spdGeometrySection(methods=false){
 const r=data.spd_geometry;if(!r)return '';
 const labels=Object.fromEntries(r.rows.map(q=>[q.condition,q.label]));
 const rows=r.rows.map(q=>`<tr><th>${escapeHTML(q.label)}</th><td>${q.mean.auc.toFixed(4)}</td><td>${q.mean.seed_auc_sample_sd===undefined?'不适用':q.mean.seed_auc_sample_sd.toFixed(4)}</td><td>${q.mean.auprc.toFixed(4)}</td><td>${q.mean.balanced_accuracy.toFixed(4)}</td><td>${q.mean.sensitivity.toFixed(4)}</td><td>${q.mean.specificity.toFixed(4)}</td><td>${q.mean.brier.toFixed(4)}</td><td>${q.mean.logloss.toFixed(4)}</td></tr>`).join('');
 const contrasts=Object.entries(r.contrasts).map(([name,q])=>`<tr><th>SPD减${escapeHTML(labels[name])}</th><td>${q.delta_mean_auc.toFixed(4)}</td><td>[${q.conditional_person_interval.map(v=>v.toFixed(4)).join(', ')}]</td><td>${q.positive_seeds}/5</td></tr>`).join('');
 return `<section class="panel spd-geometry-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll spd-geometry-table" tabindex="0" role="region" aria-label="四条件内验证指标"><table style="min-width:1100px"><thead><tr><th>条件</th><th>平均内验证AUC</th><th>五种子SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三项配对比较"><table style="min-width:850px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向种子</th></tr></thead><tbody>${contrasts}</tbody></table></div><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>作者方法、固定训练与复核</summary><p>完整协方差用当前训练人参考白化。90→16正交BiMap、特征值截断后，对比取矩阵对数和不取对数的两个1581参数网络；输入、初始化、四协变量、缩放规则和优化预算相同。固定200轮、全批float64、无验证选轮；完整切空间和协变量线性参照固定C=1。</p><p>这是作者SPDNet算子的自写单层诊断适配。原作者为三层AFEW视觉任务，本轮不称原任务复现。MATLAB实际作者算子一般谱前后向与正交更新对照通过；重复谱采用导数极限。150网络状态严格读回、NumPy独立谱前向、30线性读回及全部指标/三项区间独立核算通过，没有重拟合。</p><p>只用原15个内分区，不做外层最终拟合或评分；CPU两线程，无GPU进程操作。五种子SD不是相关分区SD，不能与历史外层OOF的0.7527直接排名；原标签、QC和临床证据缺口保持。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','五种子与分区对照表 ↗')} ${evidenceLink(r.id+'-metrics','全部180项指标 ↗')} ${evidenceLink(r.id+'-contrasts','三项比较 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')} ${evidenceLink(r.id+'-code','本地适配实现 ↗')}</div></section>`;
}

function spdSmallSampleSection(methods=false){
 const r=data.spd_small_sample;if(!r)return '';
 const names={spd_log:'SPD矩阵对数网络',rectified_linear:'同参数无对数网络'};
 const rows=[5,10,20].map(k=>Object.entries(r.means[k]).map(([c,m])=>`<tr><th>每类${k}人／共${2*k}人</th><td>${names[c]}</td><td>${m.auc.toFixed(4)}</td><td>${m.joint_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.auprc.toFixed(4)}</td><td>${m.balanced_accuracy.toFixed(4)}</td><td>${m.brier.toFixed(4)}</td></tr>`).join('')).join('');
 const contrasts=Object.entries(r.contrasts).map(([k,c])=>`<tr><th>每类${k}人：SPD减无对数</th><td>${c.delta_mean_auc.toFixed(4)}</td><td>${c.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${c.positive_repeats}/5</td></tr>`).join('');
 return `<section class="panel spd-small-sample-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-small-sample-table" tabindex="0" role="region" aria-label="三个预算和两个神经网络"><table style="min-width:1150px"><thead><tr><th>监督预算</th><th>网络</th><th>平均内验证AUC</th><th>支持＋初始化SD</th><th>条件人员95%区间</th><th>AP</th><th>BA</th><th>Brier↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三预算的神经消融"><table style="min-width:850px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向联合重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>支持抽取、训练与核算</summary><p>原15个内分区各做五次固定人级支持抽取。每类5、10、20人嵌套；参考矩阵、协变量标准化、初始特征均值及全局RMS只用当次支持人，不借大样本阶段的参考或权重。五次重复同时改变支持抽取与初始化，SD包含两者变化。</p><p>两个1581参数神经网络只改变投影后的谱函数。沿用90→16正交BiMap、完整协方差及四协变量；固定200轮、全批float64、lr0.01及头L2 0.001，不选轮、不调参。450个模型严格保存读回，独立NumPy谱前向、全部指标及条件人员区间核算；225份支持侧参考已核对。</p><p>本轮按用户修订继续神经小样本探索，新增传统机器学习拟合0，历史结果保留；不是对上一阶段标准的追溯性通过。仅原内验证人员，外层最终拟合和评分0，没有新增患者、独立来源或临床终点。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三个预算及五次重复表 ↗')} ${evidenceLink(r.id+'-metrics','全部450项指标 ↗')} ${evidenceLink(r.id+'-plan','本轮方案 ↗')} ${evidenceLink('spd-geometry-20261016-plan','前阶段方案修订 ↗')}</div></section>`;
}

function spdRdropSection(methods=false){
 const r=data.spd_rdrop;if(!r)return '';
 const names={spd_original:'原SPD（已有结果）',dropout:'SPD＋普通Dropout',rdrop:'SPD＋Dropout＋预测一致性'};
 const pairs={rdrop_minus_dropout:'一致性减普通Dropout',dropout_minus_original:'普通Dropout减原SPD',rdrop_minus_original:'一致性减原SPD'};
 const rows=Object.entries(r.means).map(([c,m])=>`<tr><th>${names[c]}</th><td>${m.auc.toFixed(4)}</td><td>${m.joint_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.auprc.toFixed(4)}</td><td>${m.balanced_accuracy.toFixed(4)}</td><td>${m.brier.toFixed(4)}</td></tr>`).join('');
 const contrasts=Object.entries(r.contrasts).map(([k,c])=>`<tr><th>${pairs[k]}</th><td>${c.delta_mean_auc.toFixed(4)}</td><td>${c.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${c.positive_repeats}/5</td></tr>`).join('');
 return `<section class="panel spd-rdrop-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-rdrop-table" tabindex="0" role="region" aria-label="K5三个神经训练条件"><table style="min-width:1100px"><thead><tr><th>每类5人／共10人</th><th>平均内验证AUC</th><th>支持＋初始化SD</th><th>条件人员95%区间</th><th>AP</th><th>BA</th><th>Brier↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三个训练条件的配对比较"><table style="min-width:850px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向联合重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>训练正则化与核算</summary><p>沿用原15内分区及五次联合支持/初始化重复，每类5人。75份支持侧参考与原SPD预测直接复用；两新条件从同一参数和屏蔽随机流开始，p=0.10，双前向分类损失平均；一致性条件另加lambda=1.0的双向Bernoulli KL。只屏蔽136维神经特征，四协变量不屏蔽。</p><p>1581参数、200轮、float64与原投影更新保持。评估关闭Dropout；150个新模型严格保存读回、独立NumPy谱前向及225项指标/条件区间核算。新增参考拟合、传统模型及外层最终训练评分均为0。R-Drop为论文方法的本地适配，不是原创算法或原任务完整复现。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三条件扩展表 ↗')} ${evidenceLink(r.id+'-metrics','225项指标（150新＋75历史）↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdCompactSection(methods=false){
 const r=data.spd_compact;if(!r)return '';
 const names={spd_log:'原16维SPD（已有结果）',compact_log:'紧凑4维SPD'};
 const rows=[5,10,20].map(k=>['spd_log','compact_log'].map(c=>{const m=r.means[k][c];return `<tr><th>每类${k}人／共${2*k}人</th><td>${names[c]}</td><td>${r.neural_parameters[c]}</td><td>${m.auc.toFixed(4)}</td><td>${m.joint_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.brier.toFixed(4)}</td>`}).join('')).join('');
 const contrasts=Object.entries(r.contrasts).map(([k,c])=>`<tr><th>每类${k}人：紧凑减原SPD</th><td>${c.delta_mean_auc.toFixed(4)}</td><td>${c.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${c.positive_repeats}/5</td></tr>`).join('');
 return `<section class="panel spd-compact-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-compact-table" tabindex="0" role="region" aria-label="三个预算的四维与十六维SPD"><table style="min-width:1150px"><thead><tr><th>监督预算</th><th>结构</th><th>参数数</th><th>平均内验证AUC</th><th>支持＋初始化SD</th><th>条件人员95%区间</th><th>Brier↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三预算的容量比较"><table style="min-width:850px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向联合重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>固定容量因素与核算</summary><p>BiMap输出维度16→4，ReEig和LogEig保持；神经特征136→10，加四协变量。登记参数1581→375。四维初始W和头坐标嵌套于同seed的原16维模型，只取初始化、不借训练后权重；新特征均值/全局RMS仅用当次支持。</p><p>沿用225份支持参考与原模型预测，各新模型固定200轮、float64和原Stiefel/QR更新。未用Dropout/一致性/早停，未扫描维度。225新模型保存读回，独立NumPy谱前向及全部450项比较指标/条件区间核算；新增参考、传统模型及外层最终训练评分均为0。参数减少不自动证明小样本鲁棒性。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三个预算及五次重复表 ↗')} ${evidenceLink(r.id+'-metrics','450项指标（225新＋225历史）↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdEnsembleSection(methods=false){
 const r=data.spd_ensemble;if(!r)return '';
 const names={member_mean:'单成员指标均值（375项）',ensemble5:'同十人五成员概率平均',historical_diagonal:'原对角单成员（75项）'};
 const pairs={ensemble_minus_member_mean:'集成减成员指标均值（主要）',ensemble_minus_diagonal:'集成减原对角单成员（副比较）'};
 const rows=Object.entries(r.means).map(([c,m])=>`<tr><th>${names[c]}</th><td>${m.auc.toFixed(4)}</td><td>${m.support_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.auprc.toFixed(4)}</td><td>${m.balanced_accuracy.toFixed(4)}</td><td>${m.brier.toFixed(4)}</td><td>${m.logloss.toFixed(4)}</td></tr>`).join('');
 const contrasts=Object.entries(r.contrasts).map(([k,c])=>`<tr><th>${pairs[k]}</th><td>${c.delta_mean_auc.toFixed(4)}</td><td>${c.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${c.positive_support_repeats}/5</td></tr>`).join('');
 return `<section class="panel spd-ensemble-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-ensemble-table" tabindex="0" role="region" aria-label="同十人五初始化与历史单成员"><table style="min-width:1150px"><thead><tr><th>条件／统计量</th><th>平均内验证AUC</th><th>重复均值SD</th><th>条件人员95%区间</th><th>AP</th><th>BA</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="集成主要与副比较"><table style="min-width:850px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>同支持交叉、计算成本与核算</summary><p>原15内分区、五次支持重复，每类5人；每支持固定五个初始化seed0–4。复用75原模型、补300新成员。五成员只用同一10人，概率等权平均，不平均logit、不挑seed/成员/权重。主要参照是375个成员的指标均值，它不是另一个拟合模型。</p><p>每成员1581参数、原16维SPD和200轮训练保持；集成7905参数、五次推理，计算成本增加。75旧参考复用、375成员和75集成共450项实际预测指标独立核算；新增参考/传统模型/外层最终训练评分均为0。Brier/logloss对成员指标均值的下降部分来自凸性，不当临床校准证明。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','支持与初始化扩展表 ↗')} ${evidenceLink(r.id+'-metrics','450项实际预测指标 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdEnsembleBudgetSection(methods=false){
 const r=data.spd_ensemble_budget;if(!r)return '';
 const names={member_mean:'单成员指标均值',ensemble5:'同支持五成员概率平均',historical_diagonal:'原对角单成员'};
 const pairs={ensemble_minus_member_mean:'集成减成员指标均值（主要）',ensemble_minus_diagonal:'集成减原对角单成员（副比较）'};
 const rows=[5,10,20].map(k=>Object.entries(r.means[k]).map(([c,m])=>`<tr><th>每类${k}人／共${2*k}人${k===5?'（历史复用）':''}</th><td>${names[c]}</td><td>${m.auc.toFixed(4)}</td><td>${m.support_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.brier.toFixed(4)}</td><td>${m.logloss.toFixed(4)}</td></tr>`).join('')).join('');
 const contrasts=Object.entries(r.contrasts).map(([k,cc])=>Object.entries(cc).map(([key,c])=>`<tr><th>每类${k}人：${pairs[key]}</th><td>${c.delta_mean_auc.toFixed(4)}</td><td>${c.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${c.positive_support_repeats}/5</td></tr>`).join('')).join('');
 return `<section class="panel spd-ensemble-budget-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-ensemble-budget-table" tabindex="0" role="region" aria-label="三个标签预算与三个统计口径"><table style="min-width:1150px"><thead><tr><th>监督预算</th><th>条件／统计量</th><th>平均内验证AUC</th><th>重复均值SD</th><th>条件人员95%区间</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三个预算主要与副比较"><table style="min-width:1000px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>固定M5与预算复用</summary><p>保持五个初始化seed0–4、原16维SPD和200轮训练，只补每类10/20人。新增600训练，引用150个原K10/K20成员；K5的375成员、75集成450条评价只读复用。整体1125成员、225集成、1350评价，不能写成新增1350训练。</p><p>每集成五个成员使用相同2K支持、各自支持侧特征缩放和原参考。单成员1581参数，集成7905参数、五次推理；概率等权平均、不选成员/seed/权重，无新参考/传统模型/外层最终拟合及评分。全部1350实际预测指标和条件人员区间独立核算，K5证据精确不变。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三预算扩展表 ↗')} ${evidenceLink(r.id+'-metrics','1350项实际预测指标 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdOuterSection(methods=false){
 const r=data.spd_outer;if(!r)return '';
 const names={member_mean:'单成员指标均值',ensemble5:'同支持五成员概率平均',diagonal_single:'本轮对角单成员'};
 const pairs={ensemble_minus_member_mean:'集成减成员指标均值（主要）',ensemble_minus_diagonal:'集成减本轮对角单成员（副比较）'};
 const rows=[5,10,20].map(k=>Object.entries(r.means[k]).map(([c,m])=>`<tr><th>每类${k}人／共${2*k}人</th><td>${names[c]}</td><td>${m.auc.toFixed(4)}</td><td>${m.support_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.brier.toFixed(4)}</td><td>${m.logloss.toFixed(4)}</td></tr>`).join('')).join('');
 const contrasts=Object.entries(r.contrasts).map(([k,cc])=>Object.entries(cc).map(([key,c])=>`<tr><th>每类${k}人：${pairs[key]}</th><td>${c.delta_mean_auc.toFixed(4)}</td><td>${c.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${c.positive_support_repeats}/5</td></tr>`).join('')).join('');
 return `<section class="panel spd-outer-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-outer-table" tabindex="0" role="region" aria-label="三个标签预算与三个统计口径"><table style="min-width:1150px"><thead><tr><th>监督预算</th><th>条件／统计量</th><th>平均外折AUC</th><th>重复均值SD</th><th>条件人员95%区间</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三个预算主要与副比较"><table style="min-width:1000px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>原外层划分与固定训练</summary><p>原五外折、每类5/10/20人、五支持重复和五个初始化。新增75份训练侧参考、375神经训练、75集成，450项实际外测试评价。每集成只有同一批2K人；历史内层结果只作背景，不充当本轮参照。</p><p>保持16维SPD、200轮训练与固定概率等权平均；每成员1581参数，集成7905参数和五次推理。全部seed、支持与外折保留，不选最佳K。该队列已参与开发，外层复核仍属同来源；全部指标、人员区间和75参考另行核算。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三预算扩展表 ↗')} ${evidenceLink(r.id+'-metrics','450项外测试指标 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdExternalReadinessSection(methods=false){
 const r=data.spd_external_readiness;if(!r)return '';
 const rows=r.cohorts.map(c=>`<tr><th>${escapeHTML(c.name)}</th><td>${escapeHTML(c.people)}</td><td>${escapeHTML(c.endpoint)}</td><td>${escapeHTML(c.decision)}</td><td>${escapeHTML(c.limitations)}</td></tr>`).join('');
 return `<section class="panel spd-external-readiness-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-external-readiness-table" tabindex="0" role="region" aria-label="其他来源队列可用性判断"><table style="min-width:1450px"><thead><tr><th>队列／来源</th><th>人数</th><th>实际终点</th><th>当前判断</th><th>限制</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>实际缓存与未执行方案</summary><p>本机和服务器核对SRPBS99、ZAN54、Emo53和偏头痛132的原缓存。前三者的协变量为年龄、男性指示、FD和删帧比例；偏头痛为男性指示、性别缺失、FD和删帧比例，不能因都是四列就直接替换。</p><p>若后续开展ZAN/Emo跨病因探索，保持原75支持面板与375个来源成员，所有白化和Scaler取自来源；每个M5仍只用同2K名来源训练者，不跨支持平均概率。最多900项拟议外部预测，本轮没有执行。音乐队列先补输入、QC和与Emo去重，CoSpine13人留出继续保留其原任务。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整核查报告 ↗')} ${evidenceLink(r.id+'-comparison','队列判断表 ↗')} ${evidenceLink(r.id+'-inputs','四份缓存检查 ↗')} ${evidenceLink(r.id+'-plan','后续方案（未执行） ↗')}</div></section>`;
}

function spdTransferSection(methods=false){
 const r=data.spd_transfer;if(!r)return '';
 const names={member_mean:'单成员指标均值',ensemble5:'同支持五成员概率平均',diagonal_single:'来源对角单成员'};
 const targets={zan:'ZAN54（主要）',emo:'Emo53（次要）'};
 const pairnames={ensemble_minus_member_mean:'集成减成员指标均值（主要）',ensemble_minus_diagonal:'集成减来源对角单成员（副比较）'};
 const rows=['zan','emo'].map(c=>[5,10,20].map(k=>Object.entries(r.means[c][k]).map(([condition,m])=>`<tr><th>${targets[c]}／来源每类${k}人</th><td>${names[condition]}</td><td>${m.auc.toFixed(4)}</td><td>${m.support_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.brier.toFixed(4)}</td><td>${m.logloss.toFixed(4)}</td></tr>`).join('')).join('')).join('');
 const contrasts=['zan','emo'].map(c=>[5,10,20].map(k=>Object.entries(r.contrasts[c][k]).map(([key,x])=>`<tr><th>${targets[c]}／K${k}：${pairnames[key]}</th><td>${x.delta_mean_auc.toFixed(4)}</td><td>${x.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${x.positive_support_repeats}/5</td></tr>`).join('')).join('')).join('');
 return `<section class="panel spd-transfer-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-transfer-table" tabindex="0" role="region" aria-label="两队列三预算全部固定SPD统计口径"><table style="min-width:1250px"><thead><tr><th>目标与来源监督预算</th><th>条件／统计量</th><th>平均目标AUC</th><th>支持重复SD</th><th>条件人员95%区间</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="六主要与六副比较"><table style="min-width:1150px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>固定来源权重与完整目标评分</summary><p>保留五seed0–4、来源75支持面板和375成员。107份目标逐人收缩协方差是输入特征，不是目标总体白化参考。原来源参考、Scaler及特征均值/RMS固定，每个M5仍同2K人来源监督，不跨支持平均概率。</p><p>750成员与150集成共900评价，新增分类、来源/目标总体参考及校准拟合0。来源五折组不是目标外折；原来源训练AUC只引用旧结果，不重算来源预测。两队列全部预算/种子保留，不反转低AUC概率，不用目标成绩选模型。原参考/权重未变，全部指标与条件区间另行核算。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','跨队列对比表 ↗')} ${evidenceLink(r.id+'-metrics','900项实际指标 ↗')} ${evidenceLink(r.id+'-diagnostics','全部种子与支持 ↗')} ${evidenceLink(r.id+'-plan','预测前方案 ↗')}</div></section>`;
}

function spdAdaptSection(methods=false){
 const r=data.spd_adapt;if(!r)return '';
 const names={fixed_member_mean:'固定：单成员指标均值',fixed_ensemble5:'固定：五成员概率平均',adapted_member_mean:'适配：单成员指标均值',adapted_ensemble5:'适配：五成员概率平均'};
 const targets={zan:'ZAN54（主要）',emo:'Emo53（次要）'};
 const rows=['zan','emo'].map(c=>[5,10].map(k=>Object.entries(r.means[c][k]).map(([condition,m])=>`<tr><th>${targets[c]}／目标每类${k}人</th><td>${names[condition]}</td><td>${m.auc.toFixed(4)}</td><td>${m.support_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.brier.toFixed(4)}</td><td>${m.logloss.toFixed(4)}</td></tr>`).join('')).join('')).join('');
 const contrasts=['zan','emo'].map(c=>[5,10].map(k=>Object.entries(r.contrasts[c][k]).map(([key,x])=>`<tr><th>${targets[c]}／K${k}：${key==='ensemble5'?'五成员集成':'成员指标均值'}适配减固定</th><td>${x.delta_mean_auc.toFixed(4)}</td><td>${x.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${x.positive_support_repeats}/5</td></tr>`).join('')).join('')).join('');
 return `<section class="panel spd-adapt-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-adapt-table" tabindex="0" role="region" aria-label="目标每类5人和10人固定与适配对比"><table style="min-width:1250px"><thead><tr><th>目标与标签预算</th><th>条件／统计量</th><th>平均折外AUC</th><th>支持重复SD</th><th>条件人员95%区间</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="全部八个适配比较"><table style="min-width:1150px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>支持集适配与OA原版输入</summary><p>来源每类20人；五seed0–4、五次支持重复和五来源组全部保留。目标原按人外折中，每类5/10人的支持集更新141参数分类头200轮；测试人不参与训练、归一化、校准或选择。固定参考用上一轮保存概率按同一测试人计分；目标头额外消耗10/20个标签。</p><p>OA历史62人含44患者/18对照，64人含46患者/18对照，重叠62人；全部ROI源文件在盘。原包含GSR流程且缺meanFD/删帧比例，需要补齐输入并单列历史流程，不能与当前8份新处理数值通过混为同一分母。完整76人原始MRI在盘；另一重处理版本14数值通过（8患者/6对照）、62未通过，全76待审、纳入0。本轮OA新增训练0，原失败与待审核保持。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','固定与适配对比表 ↗')} ${evidenceLink(r.id+'-metrics','1200项折外指标 ↗')} ${evidenceLink(r.id+'-folds','4800项折级指标 ↗')} ${evidenceLink(r.id+'-diagnostics','全部种子与支持 ↗')} ${evidenceLink(r.id+'-oa','OA原版输入核查 ↗')} ${evidenceLink(r.id+'-plan','执行前方案 ↗')}</div></section>`;
}

function oaSpdSection(methods=false){
 const r=data.oa_spd;if(!r)return '';
 const names={spd_member_mean:'SPD：成员指标均值',spd_ensemble5:'SPD：五成员概率平均',frozen_random_geometry_member_mean:'随机冻结几何：成员指标均值',frozen_random_geometry_ensemble5:'随机冻结几何：五成员概率平均',covariates_member_mean:'仅协变量：成员指标均值',covariates_ensemble5:'仅协变量：五成员概率平均'};
 const rows=[5,10].map(k=>Object.entries(r.means[k]).map(([condition,m])=>`<tr><th>OA37／每类${k}人</th><td>${names[condition]}</td><td>${m.auc.toFixed(4)}</td><td>${m.support_repeat_auc_sample_sd.toFixed(4)}</td><td>${m.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${m.brier.toFixed(4)}</td><td>${m.logloss.toFixed(4)}</td></tr>`).join('')).join('');
 const contrasts=[5,10].map(k=>Object.entries(r.contrasts[k]).map(([key,x])=>`<tr><th>K${k}：SPD减${key.includes('frozen_random_geometry')?'随机冻结几何':'仅协变量'}／${key.endsWith('ensemble5')?'五成员集成':'成员均值'}</th><td>${x.delta_mean_auc.toFixed(4)}</td><td>${x.conditional_person_interval.map(v=>v.toFixed(4)).join(' ～ ')}</td><td>${x.positive_support_repeats}/5</td></tr>`).join('')).join('');
 return `<section class="panel oa-spd-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll oa-spd-table" tabindex="0" role="region" aria-label="OA37两预算三方法全部结果"><table style="min-width:1250px"><thead><tr><th>目标与标签预算</th><th>条件／统计量</th><th>平均折外AUC</th><th>支持重复SD</th><th>条件人员95%区间</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><div class="paper-table-scroll" tabindex="0" role="region" aria-label="OA全部八个预设比较"><table style="min-width:1150px"><thead><tr><th>比较</th><th>平均ΔAUC</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${contrasts}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>原62人头动、旧GSR与数值失败接续</summary><p>原62人ROI、六参数头动和FD全部读回，修复版18人也保留GSR。既有29头动排除与62人交叉21人，旧记录20人扩展标记超过20%，两项并集排25，实际开发37人22患者/15对照。原排除、QC和专家状态保持；扩展FD是运动风险标记，未额外删ROI帧。</p><p>原首重复五外折不重分配人员；每类5/10人、五seed0–4、五次支持。支持内拟合50参考/Scaler，250初始几何缩放。完整SPD、随机冻结几何、仅协变量同支持750拟合，无来源预训练、早停或查询选参。第一批第19个参考30步未收敛，保持原1e-7容差只改数值求解步数上限；前270模型回放保留，只接续480，原失败完整留存。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','同预算对比表 ↗')} ${evidenceLink(r.id+'-metrics','180项折外指标 ↗')} ${evidenceLink(r.id+'-folds','900项折级指标 ↗')} ${evidenceLink(r.id+'-diagnostics','全部种子与支持 ↗')} ${evidenceLink(r.id+'-inputs','62人头动与37人输入 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案与修复补记 ↗')}</div></section>`;
}

function oaConfoundsSection(methods=false){
 const r=data.oa_confounds;if(!r)return '';
 const rows=r.common_support.map(x=>`<tr><th>${escapeHTML(x.pipeline)}</th><td>${x.raw_frames} → ${x.processed_frames}</td><td>${x.patients}</td><td>${x.controls}</td><td>已测采集／处理重叠；真实批次仍缺</td></tr>`).join('');
 return `<section class="panel oa-confounds-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll oa-confounds-table" tabindex="0" role="region" aria-label="OA37人采集与处理共同支持"><table style="min-width:920px"><thead><tr><th>处理版本</th><th>原始 → 处理帧数</th><th>病例</th><th>对照</th><th>可比范围</th></tr></thead><tbody>${rows}</tbody></table></div><p>共同支持31人（21病例／10对照）；另6人所在层只有一类。31人未重新训练或评分，不能直接沿用原K10五折预算。原五seed、五支持、750模型及全部阴性结果保留。</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>采集头、旧GSR证据及资料矛盾</summary><p>76份BOLD头均64×64×36、标称3.4375×3.4375×3mm、TR2.5s。HC原始均300帧，37人中5名HC处理后275帧；具体原始帧到输出帧对应尚缺。原论文40层与实际36层不一致；T1的共享JSON为0.0025s，3D头pixdim[4]约2.3s，论文为2.5s；3D头字段不能确认真实序列TR，暂缺原始协议。</p><p>两处理版均有病例和对照，未完全绑定诊断。旧global分支路径、双分支配置及76组29/28列回归矩阵支持旧GSR标识，但完整逐人执行日志仍缺。研究编号HC为空；不能把含诊断定义的HC/Study1/Study2当设备批次做去混杂。</p><p>${escapeHTML(r.intermediate_stage_note)}</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'核查报告 ↗')} ${evidenceLink(r.id+'-comparison','扩展对比表 ↗')} ${evidenceLink(r.id+'-strata','全部来源分层 ↗')} ${evidenceLink(r.id+'-overlap','重叠与单类别层 ↗')} ${evidenceLink(r.id+'-processing','旧流程核查 ↗')} ${evidenceLink(r.id+'-plan','核查前方案 ↗')}</div></section>`;
}

function oaEarlySection(methods=false){
 const r=data.oa_early;if(!r)return '';
 const rows=r.provenance.frames.map(x=>`<tr><th>${x.label}</th><td>${x.people}</td><td>${x.raw_frames}</td><td>${x.FunRaw_frames}</td><td>${x.FunImg_frames}</td><td>${x.time_mapping==='continuous_prefix'?'连续前缀10 → 20':'中段偏移减5／重复'}</td></tr>`).join('');
 return `<section class="panel oa-early-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll oa-early-table" tabindex="0" role="region" aria-label="OA76人全部时间轴对应聚合"><table style="min-width:980px"><thead><tr><th>分组</th><th>人数</th><th>原始帧</th><th>FunRaw帧</th><th>FunImg帧</th><th>原始时间对应</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>中段回跳、混合边界与未启动原因</summary><p>8名HC在FunRaw前段对应原始零基i+15，后段却对应i+10；FunImg为i+25→i+20。3例切换边界的五个体素中，部分来自较早帧、部分来自较晚帧。全部8例FunImg与FunRaw去前10帧完全相同，异常在进入work2之前已存在。</p><p>原始旧库存与重获取库在这8人的五点全时序一致。公开DPARSF代码裁前缀后写回同名输入；与不完整写回相符，具体哪次执行仍缺日志。原协议只计划对照第二阶段同期采集，不能将归档20人的实际批次直接补为Study2。</p><p>267帧方案要求连续原始时间对应，准备在新协方差写入前停止；计划500新拟合和250回放均未执行。原37中5名HC受影响，没有删人、重分折或制造新AUC，原全部750模型/seed/阴性保持。</p></details><p>原70多AUC候选来自SRPBS99原外层：K5／K10／K20为${[5,10,20].map(k=>r.source70_outer_ensemble_auc[k].toFixed(4)).join('／')}。近端约束本次已完成375拟合，结果见同人同预算比较；跨来源推广限制与ZAN/Emo负结果保持。</p><p>${escapeHTML(data.spd_proximal?"OA旧时序问题及原750模型保持；SRPBS99近端约束375拟合已完成，未改善M5 AUC，该配置结束。详见上方同人同预算结果。":r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'溯源报告 ↗')} ${evidenceLink(r.id+'-comparison','扩展对比表 ↗')} ${evidenceLink(r.id+'-frames','全部帧对应聚合 ↗')} ${evidenceLink(r.id+'-diagnostics','回跳与混合边界 ↗')} ${evidenceLink(r.id+'-readiness','未启动原因 ↗')} ${evidenceLink(r.id+'-plan','原方案与后续改进 ↗')}</div></section>`;
}

function spdProximalSection(methods=false){
 const r=data.spd_proximal;if(!r)return '';
 const rows=[5,10,20].map(k=>{const o=r.means[k].original.ensemble5,n=r.means[k].proximal.ensemble5,d=r.contrasts[k].ensemble5;return `<tr><th>K${k}${k===5?'（主要）':'（次要）'}</th><td>${o.auc.toFixed(4)}</td><td>${n.auc.toFixed(4)}</td><td>${d.delta_mean_auc.toFixed(4)}</td><td>[${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]</td><td>${d.positive_support_repeats}/5</td><td>${d.positive_outer_folds}/5</td><td>${o.support_repeat_auc_sample_sd.toFixed(4)} → ${n.support_repeat_auc_sample_sd.toFixed(4)}</td></tr>`}).join('');
 return `<section class="panel spd-proximal-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-proximal-table" tabindex="0" role="region" aria-label="SPD近端约束三个预算全部配对结果"><table style="min-width:980px"><thead><tr><th>每类支持人数</th><th>原M5 AUC</th><th>近端M5 AUC</th><th>ΔAUC</th><th>条件人员95%区间</th><th>正向支持重复</th><th>正向外折</th><th>支持重复SD</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>损失、全部种子、核验与计算成本</summary><p>唯一改动：balanced BCE加0.01×||WWᵀ−W₀W₀ᵀ||²_F/(2×16)。W₀为每个成员原始初始化，保持16维、200轮、五成员等权和同75支持。全部375新模型严格重载及NumPy独立谱前向通过，原375模型和75参考复用。原模型不重训。</p><p>新增拟合耗时${r.runtime.elapsed_seconds.toFixed(1)}秒，CPU两线程，GPU不占用；原批次含75参考${r.runtime.original_elapsed_seconds_including_75_reference_fits.toFixed(1)}秒。计时含核验和I/O，不能视为纯训练速度对比。单成员1581参数、M5为7905参数。</p><p>全部900项新旧指标、75支持配对、五初始化和几何偏移诊断均保留。区间为共同99人员2000次重抽样，有效1999次，固定预测重加权，不包含重训及开发选择。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','扩展对比表 ↗')} ${evidenceLink(r.id+'-contrasts','全部配对比较 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdCosineSection(methods=false){
 const r=data.spd_cosine;if(!r)return '';
 const rows=[5,10,20].map(k=>{const o=r.means[k].original.ensemble5,n=r.means[k].cosine.ensemble5,d=r.contrasts[k].ensemble5,p=r.prior_proximal.means[k].ensemble5;return `<tr><th>K${k}${k===5?'（主要）':'（次要）'}</th><td>${o.auc.toFixed(4)}</td><td>${p.auc.toFixed(4)}</td><td>${n.auc.toFixed(4)}</td><td>${d.delta_mean_auc.toFixed(4)}</td><td>[${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]</td><td>${d.positive_support_repeats}/5</td><td>${o.support_repeat_auc_sample_sd.toFixed(4)} → ${n.support_repeat_auc_sample_sd.toFixed(4)}</td></tr>`}).join('');
 return `<section class="panel spd-cosine-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-cosine-table" tabindex="0" role="region" aria-label="原SPD近端约束余弦头全部预算"><table style="min-width:1020px"><thead><tr><th>每类人数</th><th>原M5 AUC</th><th>旧近端M5</th><th>余弦M5</th><th>余弦减原</th><th>条件人员95%区间</th><th>正向支持重复</th><th>支持重复SD</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>余弦头、全部种子与核验</summary><p>保留16维SPD编码器，仅将分类头改为2×cos(z,w)+偏置，样本与权重按L2范数归一化。固定温度2、200轮、1581参数/成员、同75支持及五初始化。原375与近端375模型均保持，本轮新增375，复用75参考。全部重载与独立NumPy前向通过。</p><p>参考ICLR2019少样本余弦读出思路；作者实现默认类权重范数可学习，本地二分类方向固定单位范数并保留偏置。属于本地适配，未运行作者视觉原任务或预训练。</p><p>CPU两线程${r.runtime.elapsed_seconds.toFixed(1)}秒，未占GPU。原批次含75参考${r.runtime.original_elapsed_seconds_including_75_reference_fits.toFixed(1)}秒，时间含核验及I/O。新旧900指标、18行三模型均值、全部seed/支持及损失诊断可下载。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三模型扩展表 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-contrasts','全部配对比较 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdLogfirstSection(methods=false){
 const r=data.spd_logfirst;if(!r)return '';
 const rows=[5,10,20].map(k=>{const o=r.means[k].original.ensemble5,n=r.means[k].logfirst.ensemble5,d=r.contrasts[k].ensemble5,p=r.prior_models.prior_proximal.means[k].ensemble5,c=r.prior_models.prior_cosine.means[k].ensemble5;return `<tr><th>K${k}${k===5?'（主要）':'（次要）'}</th><td>${o.auc.toFixed(4)}</td><td>${p.auc.toFixed(4)}</td><td>${c.auc.toFixed(4)}</td><td>${n.auc.toFixed(4)}</td><td>${d.delta_mean_auc.toFixed(4)}</td><td>[${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]</td><td>${d.positive_support_repeats}/5</td></tr>`}).join('');
 return `<section class="panel spd-logfirst-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-logfirst-table" tabindex="0" role="region" aria-label="四模型全部预算配对结果"><table style="min-width:1060px"><thead><tr><th>每类人数</th><th>原M5 AUC</th><th>旧近端</th><th>旧余弦</th><th>对数先行</th><th>新减原</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>算子顺序、全部种子与成本</summary><p>原先90→16投影后取矩阵对数；本轮先在完整90维取对数，再学习90→16投影，保留136特征及四协变量、原线性头和幅度。对数矩阵允许负特征值，投影后不再截为SPD或再log。参数1581/成员、200轮不变；不叠加近端或余弦头。</p><p>新特征均值和单一RMS仅在同支持人重新估计；75原参考及协变量尺度复用。全部375检查点、7425份完整log和独立概率核验通过。原1125模型保持，新375模型及75000损失留私有；公开1800面板指标、24行均值、60行全部种子。</p><p>CPU两线程${r.runtime.elapsed_seconds.toFixed(1)}秒，其中完整log缓存${r.runtime.matrix_log_seconds.toFixed(1)}秒，计时包含核验与I/O，GPU不占用。该模块为本地切空间双线性适配，未运行官方SPDNet视觉任务。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','四模型扩展表 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-contrasts','全部配对 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdCrossridgeSection(methods=false){
 const r=data.spd_crossridge;if(!r)return '';
 const rows=[5,10,20].map(k=>{const o=r.means[k].original.ensemble5,n=r.means[k].crossridge.ensemble5,d=r.contrasts[k].ensemble5;return `<tr><th>K${k}${k===5?'（主要）':'（次要）'}</th><td>${o.auc.toFixed(4)}</td><td>${r.prior_models.prior_proximal.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_cosine.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_logfirst.means[k].ensemble5.auc.toFixed(4)}</td><td>${n.auc.toFixed(4)}</td><td>${d.delta_mean_auc.toFixed(4)}</td><td>[${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]</td><td>${d.positive_support_repeats}/5</td></tr>`}).join('');
 return `<section class="panel spd-crossridge-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><p>训练侧依据：K5仅10人对应140维特征和141原头系数，中心秩9、有效秩约7.65，原支持训练AUC为1.0。这是需要检验条件头的依据，不是过拟合因果证明或验证成绩。</p><div class="paper-table-scroll spd-crossridge-table" tabindex="0" role="region" aria-label="五模型同人同预算全部结果"><table style="min-width:1190px"><thead><tr><th>每类人数</th><th>原M5 AUC</th><th>近端</th><th>余弦</th><th>对数先行</th><th>自排除条件头</th><th>新减原</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>条件头、自排除训练与参数</summary><p>保留原先投影后log的SPD编码器与特征幅度，替换自由SGD头为可微ridge条件头，lambda固定1、归一化Gram按140维缩放。当前人的标签贡献从其训练头预测中排除，BCE反向穿过求解器更新W与两个校准参数。最终只用同一批2K支持拟合完整头，外test不参与。</p><p>自排除只是训练损失；编码器、尺度和校准用过所有支持者，不能当诚实LOOCV。训练参数1442，条件头系数由支持计算，吸收校准后1581部署系数/成员。参考R2D2思路，属于本地二分类适配，未运行官方视觉原任务或未见类元训练。</p><p>375严格重载、独立NumPy前向、141维原始方程及70次显式删一核验通过；原1500模型与375新模型、75000损失保留。CPU两线程${r.runtime.elapsed_seconds.toFixed(1)}秒，GPU不占用。公开2250面板指标、30均值、75全seed及支持侧诊断。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','五模型对比表 ↗')} ${evidenceLink(r.id+'-diagnostics','训练侧依据与诊断 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdMomentumSection(methods=false){
 const r=data.spd_momentum;if(!r)return '';
 const rows=[5,10,20].map(k=>{const o=r.means[k].original.ensemble5,n=r.means[k].momentum.ensemble5,d=r.contrasts[k].ensemble5;return `<tr><th>K${k}${k===5?'（主要）':'（次要）'}</th><td>${o.auc.toFixed(4)}</td><td>${r.prior_models.prior_proximal.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_cosine.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_logfirst.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_crossridge.means[k].ensemble5.auc.toFixed(4)}</td><td>${n.auc.toFixed(4)}</td><td>${d.delta_mean_auc.toFixed(4)}</td><td>[${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]</td><td>${d.positive_support_repeats}/5</td></tr>`}).join('');
 return `<section class="panel spd-momentum-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><p>先核查训练：原谱梯度、SGD单步与实际支持方向导数一致；原SPD没有谱截断。15条支持续训能继续降低损失，说明目标尚可优化，不能证明泛化受限于轮数。原支持训练AUC已全1。</p><div class="paper-table-scroll spd-momentum-table" tabindex="0" role="region" aria-label="六模型同人同预算全部结果"><table style="min-width:1290px"><thead><tr><th>每类人数</th><th>原M5 AUC</th><th>近端</th><th>余弦</th><th>对数先行</th><th>条件头</th><th>动量</th><th>新减原</th><th>条件人员95%区间</th><th>正向支持重复</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>训练核查、同预算动量与额外诊断</summary><p>1875个旧模型逐面板只用支持行检查；原375个另外核对原生谱梯度和Torch SGD。15条诊断固定outer0/repeat0、全部五初始化，原200轮后续800步，不预测查询或选轮。不同外折人员角色重叠，本来源已用于开发。</p><p>正式对照只改无动量SGD为动量0.9，lr .01、200轮不变。W采用切向梯度、速度投影运输和正QR；原SPD编码器、线性头、幅度、1581参数与全部尺度/支持/初始化保持。不是新架构或Cayley-SGD论文完整复现。</p><p>375严格重载、NumPy前向与375实际动量下一步独立核验通过。新375正式训练耗时${r.runtime.elapsed_seconds.toFixed(1)}秒，另15条续训单列；390新优化运行共87000步，2250配对模型加15诊断权重保留。公开2700面板指标、36均值、90种子及3135行训练诊断，MRI/FC/权重保持私有。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','六模型对比表 ↗')} ${evidenceLink(r.id+'-diagnostics','训练核查与诊断 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdSourcegeoSection(methods=false){
 const r=data.spd_sourcegeo;if(!r)return '';
 const rows=[5,10,20].map(k=>{const o=r.means[k].original.ensemble5,f=r.means[k].frozen_random.ensemble5,n=r.means[k].sourcegeo.ensemble5,d=r.contrasts.sourcegeo_minus_frozen_random[k].ensemble5,p=r.contrasts.sourcegeo_minus_original[k].ensemble5;return `<tr><th>K${k}${k===5?'（主要）':'（次要）'}</th><td>${o.auc.toFixed(4)}</td><td>${r.prior_models.prior_proximal.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_cosine.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_logfirst.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_crossridge.means[k].ensemble5.auc.toFixed(4)}</td><td>${r.prior_models.prior_momentum.means[k].ensemble5.auc.toFixed(4)}</td><td>${f.auc.toFixed(4)}</td><td>${n.auc.toFixed(4)}</td><td>${d.delta_mean_auc.toFixed(4)}</td><td>[${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]</td><td>${p.delta_mean_auc.toFixed(4)}</td><td>${d.positive_support_repeats}/5</td></tr>`}).join('');
 return `<section class="panel spd-sourcegeo-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><p>来源核查：SRPBS50与临床145人、当前99人按同一全局人员键交集0，原50份用户QC授权可对应。实际时序长度107／177／240帧全部保留。旧MLP32权重与SPD16不兼容；本轮新训练五个SPD编码器，未复用来源名单或输入不匹配的权重。</p><div class="paper-table-scroll spd-sourcegeo-table" tabindex="0" role="region" aria-label="八模型与无标签几何预训练全部结果"><table style="min-width:1690px"><thead><tr><th>每类人数</th><th>旧原M5</th><th>近端</th><th>余弦</th><th>对数先行</th><th>条件头</th><th>动量</th><th>随机冻结</th><th>预训练冻结</th><th>预训−随机</th><th>主效应条件95%区间</th><th>预训−旧原</th><th>主效应正向支持重复</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>来源资格、无标签几何训练与公平比较</summary><p>源50使用自己的几何均值白化；完整90维logSPD的人际距离作为teacher，16维student学习保留相对距离，200步、五seed。1225对仍是50个人，群体距离只用共同均值归一化，没有逐人丢弃幅度。源预训练先完成，再加载目标缓存。</p><p>两新臂同源白化、同支持标签、同141参数线性头、同200步SGD；预训练臂与随机臂均冻结W。旧端到端原SPD用支持白化且不读取这50人，不能把旧原比较称同总信息或同预训练预算。是否有预训练效应、是否替换旧原分别判断。</p><p>人员键互斥是登记证据，不是生物身份鉴定；跨库命名空间不同也不证明无重叠。ABIDE／DS旧权重和官方模型的输入、人员及已开发限制继续保留，CoSpine13留出和TN14停止不动。</p><p>科学训练755次优化运行，151000步；独立核验另重放750头的150000次数值更新。五源与750目标权重/全部损失保留，MRI、时序、FC与逐人预测保持私有。CPU两线程${r.runtime.elapsed_seconds.toFixed(1)}秒，GPU不占用。公开3600面板指标、48均值、120种子及来源诊断。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','八模型与来源表 ↗')} ${evidenceLink(r.id+'-diagnostics','来源与全部训练诊断 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdTaskprotoSection(methods=false){
 const original=data.spd_taskproto;if(!original)return '';const r={...original,interpretation:original.display_interpretation,boundary:original.display_boundary};
 const rows=[5,10,20].map(k=>{const m=r.means[k],d=r.contrasts.taskproto_minus_original[k].ensemble5,g=r.contrasts.strong_frozen_minus_sourcegeo[k].ensemble5;return `<tr><th>K${k}${k===5?'（主要）':'（次要）'}</th><td>${m.original.ensemble5.auc.toFixed(4)}</td><td>${m.frozen_random.ensemble5.auc.toFixed(4)}</td><td>${m.sourcegeo.ensemble5.auc.toFixed(4)}</td><td>${m.strong_frozen.ensemble5.auc.toFixed(4)}</td><td>${m.taskproto.ensemble5.auc.toFixed(4)}</td><td>${d.delta_mean_auc.toFixed(4)}</td><td>[${d.ci_lower.toFixed(4)}, ${d.ci_upper.toFixed(4)}]</td><td>${d.positive_support_repeats}/5</td><td>${g.delta_mean_auc.toFixed(4)}</td></tr>`}).join('');
 return `<section class="panel spd-taskproto-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.diagnostic_summary)}</p><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-taskproto-table" tabindex="0" role="region" aria-label="原型SPD与几何优化比较"><table style="min-width:1410px"><thead><tr><th>每类人数</th><th>旧原M5</th><th>随机冻结</th><th>源200步冻结</th><th>源2000步冻结</th><th>原型约束SPD</th><th>原型−旧原</th><th>主比较条件95%区间</th><th>主比较正向重复</th><th>加强源−旧200步</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>来源训练是否充分，以及新模型改变了什么</summary><p>源50无标签续训与固定40/10人留出都显示原200步未充分优化。加强后几何误差降低，支持集疼痛关联却下降、站点关联升高；来源没有疼痛标签，几何保持不能等同疼痛判别。去全局log幅度的诊断没有带来更好的疼痛关联，正式模型保留幅度和符号。</p><p>原型约束臂从旧原SPD出发，沿用支持白化、初始化、四协变量和200步SGD，只增加0.1倍跨人原型辅助损失；同类原型排除本人，不用查询人，也不使用加强源权重。可训练及部署仍1581参数，M5为7905。排除自身的原型是训练约束，编码器/尺度仍用所有支持，不能当独立留一验证。</p><p>源2000步冻结另训练375个141参数头，与旧200步/随机冻结使用相同源白化和目标预算，额外源训练成本单列。两臂共750拟合、150M5，五seed0..4、五支持重复全保留。来源15次诊断29000更新，目标150000更新，独立冻结头核验另75000更新；CPU两线程目标${r.runtime.elapsed_seconds.toFixed(1)}秒，来源诊断${r.source_diagnostic_seconds.toFixed(1)}秒。GPU与他人进程未动。</p><p>十模型完整对比表保留旧近端、余弦、对数先行、条件头、动量和来源阴性，4500面板指标、60均值、150行种子、24比较及全部来源轨迹可下载；逐人预测、模型和输入保持私有。</p><p>${escapeHTML(original.interpretation)}</p><p class="data-note">${escapeHTML(original.boundary)}</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','十模型与诊断表 ↗')} ${evidenceLink(r.id+'-diagnostics','全部训练与关联诊断 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdSiteholdoutSection(methods=false){
 const r=data.spd_siteholdout;if(!r)return '';const labels={spd:'原SPD',image_component:'SPD去协变量分量',covariates:'仅四协变量',site_prior:'仅站点训练比例'};
 const rows=[10,20].flatMap(k=>Object.entries(labels).map(([method,label])=>{const condition=method==='site_prior'?'deterministic':'ensemble5',a=r.means[k][method].person_matched[condition],b=r.means[k][method].site[condition],d=r.contrasts.find(x=>x.k===k&&x.method===method&&x.comparison==='person_matched_minus_site');return `<tr><th>K${k}${k===20&&method==='spd'?'（主要）':''}</th><td>${label}</td><td>${a.auc.toFixed(4)}</td><td>${b.auc.toFixed(4)}</td><td>${d.delta_auc.toFixed(4)}</td><td>${d.positive_support_repeats}/5</td><td>${d.conditional_lower==null?'有效抽样不足':`[${d.conditional_lower.toFixed(4)}, ${d.conditional_upper.toFixed(4)}]`}</td></tr>`})).join('');
 return `<section class="panel spd-siteholdout-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.diagnostic_summary)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-siteholdout-table" tabindex="0" role="region" aria-label="训练内站点与同类数留人诊断"><table style="min-width:1080px"><thead><tr><th>原每类预算</th><th>诊断方法</th><th>随机留人AUC</th><th>留站点AUC</th><th>随机−站点</th><th>正向支持重复</th><th>条件人员区间</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.decision_text)}</p><p class="data-note">留站点与随机参照训练/测试两类人数相同，留出人员不同。内部训练人数K10为6–14、K20为16–26，不能与旧外层十模型分数直接排行。当前仍为开发诊断，未形成独立临床验证。</p><details ${methods?'open':''}><summary>人员隔离、混杂参照与全部种子</summary><p>${escapeHTML(r.scope_note)}</p><p>每个内训练重新拟合白化、协变量及SPD特征尺度。保留五seed0..4、200步类平衡SGD，930个SPD权重及930个必要协变量头；固定权重去协变量仅为分量消融，影像混杂仍可能存在。新站点的站点比例规则退回训练总体比例，其0.5 AUC不能说明不存在站点混杂。</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.boundary)}</p><p>公开3534内层指标、28均值、60行seed、16比较、372预算匹配块及覆盖/混杂/140重复。矩阵、权重和逐人预测保持私有；CPU两线程耗时${r.runtime.elapsed_seconds.toFixed(1)}秒，GPU和他人进程未动。旧十模型外层表完整保留，站点稳健训练状态：${escapeHTML(r.robust_training_state)}。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','内层与旧外层分开比较 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-coverage','不适用原因 ↗')} ${evidenceLink(r.id+'-diagnostics','混杂汇总 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdConditionalshiftSection(methods=false){
 const r=data.spd_conditionalshift;if(!r)return '';const labels={spd:'原SPD固定权重',amplitude_fixed:'幅度置训练均值',amplitude_only:'只保留幅度变化'};
 const rows=[10,20].flatMap(k=>Object.entries(labels).map(([method,label])=>{const a=r.means[k][method].person_matched.ensemble5,b=r.means[k][method].site.ensemble5;return `<tr><th>K${k}</th><td>${label}</td><td>${a.auc.toFixed(4)}</td><td>${b.auc.toFixed(4)}</td><td>${b.support_repeat_auc_sample_sd.toFixed(4)}</td></tr>`})).join('');
 const shifts=[10,20].map(k=>{const a=r.shift_means[k].projected_shape;return `<tr><th>K${k}</th><td>${a.distance_ratio.toFixed(4)}</td><td>${a.class_shift_cosine.toFixed(4)}</td><td>${a.eligible_support_panels}/25</td></tr>`}).join('');
 return `<section class="panel spd-conditionalshift-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.diagnostic_summary)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-conditionalshift-table" tabindex="0" role="region" aria-label="固定SPD总体幅度敏感性"><table style="min-width:880px"><thead><tr><th>原每类预算</th><th>固定权重诊断</th><th>随机留人AUC</th><th>留站点AUC</th><th>站点重复SD</th></tr></thead><tbody>${rows}</tbody></table></div><p class="data-note">三个诊断均保留原四协变量。“只保留幅度变化”还包含内训练形状均值截距，未重训新模型。不能把固定权重干预称为独立验证或因果调整。</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="去总体幅度后的同类影像站点偏移"><table style="min-width:760px"><thead><tr><th>预算</th><th>同类距离²/置换均值</th><th>病例/对照偏移余弦</th><th>支持面板</th></tr></thead><tbody>${shifts}</tbody></table></div><p>${escapeHTML(r.decision_text)}</p><details ${methods?'open':''}><summary>类别内置换、幅度分解与全部种子</summary><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.boundary)}</p><p>930模型原概率逐项核对，幅度分解与显式缩放矩阵前向一致；全部3348指标和558个M5独立复核。K10共同人员抽样不足100次，未给区间；K20主差值区间低于0仅描述当前固定预测。</p><p>${escapeHTML(r.next)}</p></details><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','内外层分开对比 ↗')} ${evidenceLink(r.id+'-seeds','全部内层种子 ↗')} ${evidenceLink(r.id+'-shift-seeds','全部偏移种子 ↗')} ${evidenceLink(r.id+'-coverage','不适用原因 ↗')} ${evidenceLink(r.id+'-plan','计算前方案 ↗')}</div></section>`;
}

function spdVolumescaleSection(methods=false){
 const r=data.spd_volumescale;if(!r)return '';const rows=[10,20].flatMap(k=>['original','volume_shape'].map(method=>{const a=r.model.means[k][method].member_mean,b=r.model.means[k][method].ensemble5;return `<tr><th>K${k}</th><td>${method==='original'?'原SPD':'几何体积/形状分别正则'}</td><td>${a.auc.toFixed(4)}</td><td>${b.auc.toFixed(4)}</td><td>${b.brier.toFixed(4)}</td><td>${b.logloss.toFixed(4)}</td></tr>`})).join('');
 const diag=[10,20].map(k=>{const a=r.results[k],v=a.relations;return `<tr><th>K${k}</th><td>${v.raw_log_geomean_variance.pearson.toFixed(3)}</td><td>${v.shrinkage.pearson.toFixed(3)}</td><td>${v.mean_fd.workflow_residual_pearson.toFixed(3)}</td><td>${a.adjusted.standardized_case_coefficient.toFixed(3)}</td></tr>`}).join('');
 return `<section class="panel spd-volumescale-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>${escapeHTML(r.correction)}</strong></p><p>${escapeHTML(r.diagnostic_summary)}</p><div class="paper-table-scroll" role="region" tabindex="0" aria-label="支持内几何体积与方差头动关系"><table style="min-width:850px"><thead><tr><th>预算</th><th>原ROI对数方差r</th><th>收缩率r</th><th>流程残差FD r</th><th>调整病例系数/SD</th></tr></thead><tbody>${diag}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-volumescale-table" tabindex="0" role="region" aria-label="几何体积与形状分支同人同预算比较"><table style="min-width:1000px"><thead><tr><th>原每类预算</th><th>模型</th><th>五seed平均AUC</th><th>M5 AUC</th><th>M5 Brier</th><th>M5 logloss</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.decision_text)}</p><p class="data-note">诊断只用支持人员。原始物理幅度分支未启动；实际新模型是标准化后相关谱的几何体积分支，多1个参数。旧数值和全部阴性保留，当前仍属开发研究。</p><details ${methods?'open':''}><summary>原ROI来源、流程混杂、全部种子与训练预算</summary><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.boundary)}</p><p>同站点/同处理层的标签置换seed0..4各999次；不挑最小p值，不以重叠面板或置换次数增添受试人数。250权重严格重载，初始logit等价、分支梯度和正则更新及全部新旧指标已复核。</p><p>${escapeHTML(r.next)}</p></details><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','同口径对比 ↗')} ${evidenceLink(r.id+'-model-seeds','全部模型种子 ↗')} ${evidenceLink(r.id+'-seeds','全部置换种子 ↗')} ${evidenceLink(r.id+'-coverage','不适用原因 ↗')} ${evidenceLink(r.id+'-plan','计算前方案 ↗')}</div></section>`;
}

function spdFixedshrinkSection(methods=false){
 const r=data.spd_fixedshrink;if(!r)return '';const rows=[10,20].flatMap(k=>['original','fixed_shrink'].map(method=>{const a=r.model.means[k][method].member_mean,b=r.model.means[k][method].ensemble5;return `<tr><th>K${k}</th><td>${method==='original'?'原本地SPDNet':'固定支持收缩率SPDNet'}</td><td>${a.auc.toFixed(4)}</td><td>${b.auc.toFixed(4)}</td><td>${b.brier.toFixed(4)}</td><td>${b.logloss.toFixed(4)}</td></tr>`})).join('');
 return `<section class="panel spd-fixedshrink-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}</p><p class="data-note">代码整理工具：${escapeHTML(r.code_assistant)}。历史工作的作者模型未核实，未补填。</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-fixedshrink-table" tabindex="0" role="region" aria-label="固定支持收缩率同人同预算对照"><table style="min-width:980px"><thead><tr><th>每类预算</th><th>模型</th><th>五seed平均AUC</th><th>M5 AUC</th><th>M5 Brier</th><th>M5 logloss</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.boundary)}</p><details ${methods?'open':''}><summary>训练预算、诊断及全部种子</summary><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.diagnostic_summary)}</p><p>250模型、50个新支持侧参考，CPU双线程训练约221秒。成员均值与M5概率集成分别报告；本次配置停止，不按最好seed或查询AUC扫描收缩率。</p><p>${escapeHTML(r.next)}</p></details><div class="ds-foot">${evidenceLink(r.id+'-recent','组员近期工作表：21项模型与改动 ↗')} ${evidenceLink(r.id+'-recent-metrics','近期全部模型均值 ↗')} ${evidenceLink(r.id+'-recent-seeds','近期全部170项种子 ↗')} ${evidenceLink(r.id,'本轮完整报告 ↗')} ${evidenceLink(r.id+'-comparison','本轮同口径比较 ↗')} ${evidenceLink(r.id+'-model-seeds','本轮全部种子 ↗')} ${evidenceLink(r.id+'-plan','训练前方案 ↗')}</div></section>`;
}

function spdDeepSection(methods=false){
 const r=data.spd_deep;if(!r)return '';const labels={original:'单层200步（原本地参照）',deep200:'三层200步（本地主比较）',light500:'单层500轮（作者训练参考适配）',deep500:'三层500轮（作者结构/训练参考适配）'};
 const rows=[10,20].flatMap(k=>Object.entries(r.model.means[k]).map(([m,v])=>`<tr><th>K${k}</th><td>${labels[m]}</td><td>${v.member_mean.auc.toFixed(4)}</td><td>${v.ensemble5.auc.toFixed(4)}</td><td>${v.ensemble5.brier.toFixed(4)}</td><td>${v.ensemble5.logloss.toFixed(4)}</td><td>${m.startsWith('deep')?'5997':'1581'}</td></tr>`)).join('');
 return `<section class="panel spd-deep-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}。本轮未改BrainHGT。</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-deep-table" tabindex="0" role="region" aria-label="三层与轻量SPD分训练预算比较"><table style="min-width:1160px"><thead><tr><th>每类预算</th><th>模型与训练</th><th>五seed平均AUC</th><th>M5 AUC</th><th>M5 Brier</th><th>M5 logloss</th><th>单成员参数</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">200步组：深浅同更新数。500轮组仅K20，深浅均1000更新。两组之间预算、批次和L2不同；深浅参数和计算量也不相等。</p><details ${methods?'open':''}><summary>哪些来自官方，哪些是本地适配</summary><p>官方参考：三BiMap＋前两ReEig＋LogEig、阈值1e-4、Stiefel梯度与QR；补充组参考500轮、shuffle、batch30、lr0.01。作者实际更新未使用配置中声明的weight decay。</p><p>本地适配：90→48→24→16、嵌套初始化、支持白化/特征缩放、上三角136维、四协变量、二分类头、五种子按人评价。不是AFEW官方原任务复现。</p><p>${escapeHTML(r.diagnostic_summary)}</p><p>${escapeHTML(r.scope_note)}</p><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','同人分预算比较 ↗')} ${evidenceLink(r.id+'-origins','官方与本地适配逐项表 ↗')} ${evidenceLink(r.id+'-budgets','模型与实际预算 ↗')} ${evidenceLink(r.id+'-model-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-recent','近期组员工作表 ↗')} ${evidenceLink(r.id+'-geometry','全部三层几何检查 ↗')} ${evidenceLink(r.id+'-deep-code','三层模型代码 ↗')} ${evidenceLink(r.id+'-light-code','轻量模型代码 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function spdNonlinearSection(methods=false){
 const r=data.spd_nonlinear;if(!r)return '';
 const rows=r.support_budget_summary.map(v=>`<tr><th>K${v.k}</th><td>${v.checks}</td><td>${v.passed}</td><td>${v.failed}</td><td>${v.maximum_layer2_relative_change.toFixed(4)}</td><td>未训练／未计算</td></tr>`).join('');
 return `<section class="panel spd-nonlinear-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}。未修改BrainHGT。</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-nonlinear-table" tabindex="0" role="region" aria-label="非线性SPD支持验证与训练状态"><table style="min-width:980px"><thead><tr><th>每类预算</th><th>支持组合</th><th>全部条件满足</th><th>尺度超界</th><th>第二层最大相对变化</th><th>新模型／AUC</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">新增训练0、查询前向0。支持检查通过不等于性能改善；本轮也没有测得性能下降。原轻量模型和全部旧结果保留。</p><details ${methods?'open':''}><summary>哪些来自官方，哪些是本地适配</summary><p>官方参考：SPDNet的BiMap、LogEig及Stiefel/QR优化。2026年文献已讨论ReEig的局限和正系数Hadamard激活。</p><p>本地适配：三次残差F(A)=A+0.25 A⊙A⊙A/s²；支持初始化对角下中位数s；脑连接二分类、协变量与人级评价。官方原任务复现0，不能把换激活直接称为原创。</p><p>${escapeHTML(r.diagnostic_summary)}</p><p>${escapeHTML(r.scope_note)}</p><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><h3>项目与论文下一步</h3><p>${escapeHTML(r.next)}</p><p>现有材料可整理方法开发稿；稳定的新方法增量、未参与开发的同终点验证、扫描同期疼痛和治疗反应证据仍缺。11项缺口与具体交付已单列。</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','支持验证与比较状态 ↗')} ${evidenceLink(r.id+'-support','全部250支持组合 ↗')} ${evidenceLink(r.id+'-support-seeds','全部种子检查 ↗')} ${evidenceLink(r.id+'-geometry','750层几何记录 ↗')} ${evidenceLink(r.id+'-origins','官方与本地适配 ↗')} ${evidenceLink(r.id+'-recent','近期组员工作表 ↗')} ${evidenceLink(r.id+'-paper','项目与论文缺口 ↗')} ${evidenceLink(r.id+'-nonlinear-code','本地模型代码 ↗')} ${evidenceLink(r.id+'-plan','计算前方案 ↗')}</div></section>`;
}

function painGradingSection(methods=false){
 const r=data.pain_grading;if(!r)return '';
 const fmt=v=>v===null?'不适用':Number(v).toFixed(3);
 const rows=r.metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${fmt(v.ordinal_mae)}</td><td>${fmt(v.macro_f1)}</td><td>${fmt(v.balanced_accuracy)}</td><td>${fmt(v.quadratic_kappa)}</td><td>${fmt(v.high_recall)}</td><td>${fmt(v.vas_mae)}</td></tr>`).join('');
 return `<section class="panel pain-grading-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll pain-grading-table" tabindex="0" role="region" aria-label="27人访谈疼痛分级同人比较"><table style="min-width:960px"><thead><tr><th>方法：新模型为五成员集成</th><th>等级误差↓</th><th>宏F1↑</th><th>三类平均召回↑</th><th>加权Kappa↑</th><th>高区间召回↑</th><th>连续VAS误差↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>低/中/高研究区间5/16/6人；固定界限35/65。原文切点依据功能干扰，不能称本队列经验证的轻/中/重临床标准。十路集成/旧参照的高区间召回均为0；总体准确率不足以说明分级有效。</p><details ${methods?'open':''}><summary>人员划分、模型和验证范围</summary><p>${escapeHTML(r.diagnostic_summary)}</p><p>本地单BiMap SPDNet改为两个严格有序阈值的累计链接头；连续回归后固定分箱另列。BiMap/LogEig及几何优化沿已有实现；疼痛有序任务、13列临床与研究分箱为本地适配，未做官方原任务复现或新预训练。</p><p>60权重重载误差0；独立NumPy前向误差小于1e-12；12000次有限训练损失。每人仅在本折训练或测试一侧，全部五seed保留。2000次分层人级条件抽样不覆盖重训、开发选择或外部人群。</p><p>本机CPU2运行，使用已有小ROI输入；服务器认证未成功，本轮没有向服务器派发或操作研究任务。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整分级报告 ↗')} ${evidenceLink(r.id+'-comparison','同人比较表 ↗')} ${evidenceLink(r.id+'-metrics','全部五seed ↗')} ${evidenceLink(r.id+'-means','成员均值 ↗')} ${evidenceLink(r.id+'-confusion','混淆矩阵 ↗')} ${evidenceLink(r.id+'-paired','条件区间 ↗')} ${evidenceLink(r.id+'-plan','执行前方案 ↗')} ${evidenceLink(r.id+'-model-code','模型代码 ↗')}</div></section>`;
}

function spdBoundedSection(methods=false){
 const r=data.spd_bounded;if(!r)return '';const labels={original:'原轻量单BiMap200步',deep200:'原三BiMap ReEig200步',bounded200:'本地有界非线性三BiMap200步'};
 const rows=[10,20].flatMap(k=>Object.entries(r.model.means[k]).map(([m,v])=>`<tr><th>K${k}</th><td>${labels[m]}</td><td>${v.member_mean.auc.toFixed(4)}</td><td>${v.ensemble5.auc.toFixed(4)}</td><td>${v.ensemble5.brier.toFixed(4)}</td><td>${v.ensemble5.logloss.toFixed(4)}</td><td>${m==='original'?'1581':'5997'}</td></tr>`)).join('');
 return `<section class="panel spd-bounded-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}。未修改BrainHGT。</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-bounded-table" tabindex="0" role="region" aria-label="有界SPD同人标签更新预算比较"><table style="min-width:1160px"><thead><tr><th>每类预算</th><th>模型</th><th>五seed平均AUC</th><th>M5 AUC</th><th>M5 Brier</th><th>M5 logloss</th><th>单成员参数</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.diagnostic_summary)} 同人、同标签和同200更新；参数、FLOPs及诊断成本不等。</p><details ${methods?'open':''}><summary>哪些来自官方，哪些是本地适配</summary><p>官方参考：SPDNet的BiMap、LogEig、Stiefel梯度与QR。原作者示例为AFEW七分类、500轮、batch30。</p><p>本地适配：相关形状上的固定0.25三次激活、90→48→24→16、脑连接二分类、四协变量及200步训练。官方原任务复现0，激活替换不直接构成原创。</p><p>对角相对误差最大${r.geometry.maximum_snapshot_diagonal_relative_error.toExponential(2)}；元素相对变化最大${(r.geometry.maximum_snapshot_element_relative_change*100).toFixed(6)}%。每步检查尺度边界；完整谱和曲率在六个固定步检查。</p><p>${escapeHTML(r.scope_note)}</p><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','同人同预算比较 ↗')} ${evidenceLink(r.id+'-model-seeds','全部种子结果 ↗')} ${evidenceLink(r.id+'-support','支持验证 ↗')} ${evidenceLink(r.id+'-geometry','4500层记录 ↗')} ${evidenceLink(r.id+'-origins','官方与本地适配 ↗')} ${evidenceLink(r.id+'-recent','近期组员工作表 ↗')} ${evidenceLink(r.id+'-paper','项目论文缺口更新 ↗')} ${evidenceLink(r.id+'-bounded-code','有界激活代码 ↗')} ${evidenceLink(r.id+'-plan','计算前方案 ↗')}</div></section>`;
}

function painMultiSection(methods=false){
 const r=data.pain_multimodel;if(!r)return '';
 const fmt=v=>v===null?'不适用':Number(v).toFixed(3);
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${fmt(v.ordinal_mae)}</td><td>${fmt(v.macro_f1)}</td><td>${fmt(v.balanced_accuracy)}</td><td>${fmt(v.high_recall)}</td><td>${fmt(v.high_to_low_rate)}</td><td>${fmt(v.vas_mae)}</td></tr>`).join('');
 return `<section class="panel pain-multi-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><p>原人级三折、同一目标和临床输入。旧SPD用SGD，本轮用AdamW，不能把差值全归因架构；新临床头匹配AdamW。新神经网络均列五成员集成，全部种子和成员均值另附。</p><div class="paper-table-scroll pain-multi-table" tabindex="0" role="region" aria-label="多模型疼痛分级同人比较"><table style="min-width:1100px"><thead><tr><th>模型与目标：五成员集成或旧OOF</th><th>等级误差↓</th><th>宏F1↑</th><th>三类平均召回↑</th><th>高区间召回↑</th><th>高→低误判↓</th><th>连续VAS误差↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>低/中/高研究区间5/16/6人，固定35/65。新有序模型高区间召回有改善，同时其他区间可能变差；不能凭单项指标或最高一组分数认定临床有效。全部20组比较在完整报告，全部五seed及集成共90行指标。</p><details ${methods?'open':''}><summary>本地模型、训练与验证范围</summary><p>${escapeHTML(r.diagnostic_summary)}</p><p>NodeMLP/GCN共享90→16→16层；GCN只用正边传播，signed FC保留在特征。时间CNN为1×1通道、逐通道长度5时间卷积和均值。ROI Transformer为16维、2头、一层注意力与FFN。这些都是本地小模型，不是BrainHGT、BNT或其他作者原任务复现。</p><p>参数有序/连续：临床15/14，MLP和GCN各1759/1758，CNN1855/1854，Transformer5151/5150。相同步数不等于相同参数、FLOPs或输入信息。</p><p>150权重严格重载误差0，独立NumPy前向小于1e-12，30000有限训练损失；复用训练侧Scaler独立复算误差0。2000次等级分层人级条件抽样不覆盖重训、模型选择或独立临床泛化。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整多模型报告 ↗')} ${evidenceLink(r.id+'-comparison','全部20组比较 ↗')} ${evidenceLink(r.id+'-metrics','全部五seed ↗')} ${evidenceLink(r.id+'-means','成员均值 ↗')} ${evidenceLink(r.id+'-confusion','混淆矩阵 ↗')} ${evidenceLink(r.id+'-paired','30项条件比较 ↗')} ${evidenceLink(r.id+'-budgets','参数与预算 ↗')} ${evidenceLink(r.id+'-plan','执行前方案 ↗')} ${evidenceLink(r.id+'-model-code','本地模型代码 ↗')}</div></section>`;
}

function spdTemporalFusionSection(methods=false){
 const r=data.spd_temporal_fusion;if(!r)return '';const labels={original:'原SPD五专家（背景）',extra_spd:'新增SPD五专家，seed5..9',temporal:'本地时序网络五专家',same_spd_pair:'同构十SPD专家',heterogeneous_pair:'异构5SPD＋5时序'};
 const rows=[10,20].flatMap(k=>Object.entries(r.model.means[k]).map(([m,v])=>`<tr><th>K${k}</th><td>${labels[m]}</td><td>${v.member_mean.auc.toFixed(4)}</td><td>${v.ensemble5.auc.toFixed(4)}</td><td>${v.ensemble5.brier.toFixed(4)}</td><td>${v.ensemble5.logloss.toFixed(4)}</td><td>${m.includes('pair')?'10／2000':'5／1000'}</td></tr>`)).join('');
 return `<section class="panel spd-temporal-fusion-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}</p><p>${escapeHTML(r.summary)}</p><div class="paper-table-scroll spd-temporal-fusion-table" tabindex="0" role="region" aria-label="SPD时序异构与同构十专家比较"><table style="min-width:1160px"><thead><tr><th>每类预算</th><th>模型</th><th>单网络或配对均值AUC</th><th>最终集成AUC</th><th>Brier</th><th>logloss</th><th>专家数／总更新</th></tr></thead><tbody>${rows}</tbody></table></div><p>${escapeHTML(r.interpretation)}</p><p class="data-note">配对均值是五个双专家配对分别算AUC后平均；最终集成实际十专家。原五专家仅作背景，不能把新增成员收益都归于异构性。</p><details ${methods?'open':''}><summary>哪些来自官方，哪些是本地适配</summary><p>官方参考：SPDNet算子及几何SGD/QR；早期时间与FC双视角融合思路。官方原任务复现0。</p><p>本地适配：LagProfileNet的四lag摘要、共享4→8 tanh、765参数神经网络、支持内尺度、200步Adam；固定50%概率融合。它不是FBNetGen、BrainLM或FMM原模型，未改BrainHGT。</p><p>${escapeHTML(r.diagnostic_summary)}</p><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','同人同预算比较 ↗')} ${evidenceLink(r.id+'-model-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-budgets','训练预算 ↗')} ${evidenceLink(r.id+'-confounds','支持混杂 ↗')} ${evidenceLink(r.id+'-recent','近期组员表 ↗')} ${evidenceLink(r.id+'-origins','官方与本地 ↗')} ${evidenceLink(r.id+'-paper','论文缺口 ↗')} ${evidenceLink(r.id+'-plan','计算前方案 ↗')}</div></section>`;
}

function brainlmFCAuditSection(methods=false){
 const r=data.brainlm_fc_audit;if(!r)return '';
 const rows=r.checks.map(z=>`<tr><th>${escapeHTML(z.component)}</th><td>${escapeHTML(z.state)}</td><td>${escapeHTML(z.evidence)}</td><td>${escapeHTML(z.missing)}</td></tr>`).join('');
 return `<section class="panel brainlm-fc-audit-panel"><p>上一轮核查记录。2026-10-18后续已完成独立环境、严格加载及五seed合成前向，当前状态见上方BrainLM256兼容验证；下列失败为历史记录。</p><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}</p><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><div class="paper-table-scroll brainlm-fc-audit-table" tabindex="0" role="region" aria-label="BrainLM官方接入九项检查"><table style="min-width:1160px"><thead><tr><th>核查项目</th><th>实际状态</th><th>已确认</th><th>仍缺</th></tr></thead><tbody>${rows}</tbody></table></div><details ${methods?'open':''}><summary>哪些来自官方，哪些是本地适配</summary><p>官方BrainLM256候选已安全读入124张量；配置相符仍未确认是FMM论文使用的同一权重。作者模型前向因现存依赖不兼容尚未执行，官方原任务复现0。</p><p>本地适配：旧512维BrainLM＋ResNet18与三个固定窗口、逐人zscore，已在79人运行且阴性；与当前K10/20分列，不冒充新结果。A424真实数据已有99人，不由AAL90补零。</p><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','核查对照 ↗')} ${evidenceLink(r.id+'-technical','实际技术检查 ↗')} ${evidenceLink(r.id+'-inputs','真实A424资产 ↗')} ${evidenceLink(r.id+'-history','旧79人完整阴性 ↗')} ${evidenceLink(r.id+'-recent','近期组员表 ↗')} ${evidenceLink(r.id+'-plan','条件性方案 ↗')} ${evidenceLink(r.id+'-paper','论文缺口 ↗')}</div></section>`;
}

function painTargetedSection(methods=false){
 const r=data.pain_targeted;if(!r)return '';
 const fmt=v=>Number(v).toFixed(3);
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${fmt(v.macro_f1)}</td><td>${fmt(v.balanced_accuracy)}</td><td>${fmt(v.ordinal_mae)}</td><td>${[v.low_recall,v.middle_recall,v.high_recall].map(fmt).join(' / ')}</td><td>${fmt(v.high_to_low_rate)}</td><td>${fmt(v.rps)}</td><td>${fmt(v.nll)}</td></tr>`).join('');
 return `<section class="panel pain-targeted-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.diagnostic_summary)}</p><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><p>同27人、原三外折18训练/9查询，五seed先调整后等权平均。下面为预定argmax分类，全部24组及有序中位数见完整表。低/中/高区间5/16/6人。</p><div class="paper-table-scroll pain-targeted-table" tabindex="0" role="region" aria-label="疼痛分级论文方法同人比较"><table style="min-width:1250px"><thead><tr><th>输入／后验／解码：五成员集成</th><th>宏F1↑</th><th>三类平均召回↑</th><th>等级误差↓</th><th>低/中/高区间召回↑</th><th>高→低误判↓</th><th>RPS↓</th><th>NLL↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>主要影像增量：联合FC相对同方法临床，宏F1差−0.138，条件95%区间[−0.281, +0.031]。联合FC相对训练侧FC打乱差−0.111，区间[−0.261, 0]；没有可靠正向证据。</p><p>强先验平衡的权衡：临床高区间召回由0升至5/6，但等级误差由0.407增至0.667；联合FC的平衡方案把2/6高区间判为低区间。提高单级召回不等于整体改善。</p><details ${methods?'open':''}><summary>采用的论文方法、全部结果与限制</summary><p><a href="https://www.nature.com/articles/s41586-024-08328-6?error=cookies_not_supported" target="_blank" rel="noopener">TabPFN v2（Nature 2025）</a>使用官方冻结分类权重：7,244,554参数、患者可训练参数0。Built with PriorLabs-TabPFN。通用合成表格先验没有疼痛临床验证。</p><p><a href="https://arxiv.org/html/2605.04363v2" target="_blank" rel="noopener">DistPFN论文</a>式4单样本调整为normalize(p²/训练先验)，另列原始概率和官方normalize(p/训练先验)。每个查询独立，固定4个估计器，不按查询成绩选配置；这不是论文完整OpenML实验复现。调整后概率也不自动成为已校准临床风险。</p><p>FC8PC沿原训练侧变换，另有仅打乱训练FC关系的消融。60上下文全部重建回放，最大误差0；144行seed/集成、72折、24组混淆矩阵及35项配对比较保留。配对区间只覆盖固定预测上的人员波动。8PC可能损失信号，不能把本轮阴性扩大为所有影像方法无效；访谈与MRI时点不一致、分箱未临床验证仍是限制。</p><p>${evidenceLink('pain-targeted-20261018','完整诊断与结果')}${evidenceLink('pain-targeted-20261018-comparison','全部24组比较')}${evidenceLink('pain-targeted-20261018-plan','执行前方案')}${evidenceLink('pain-targeted-20261018-paired','35项配对区间')}${evidenceLink('pain-targeted-20261018-overfit-summary','过拟合复核')}${evidenceLink('pain-targeted-20261018-adapter','官方模型适配代码')}</p></details><p>${escapeHTML(r.next)}</p></section>`;
}

function brainlmCompatibleSection(methods=false){
 const r=data.brainlm_compatible;if(!r)return '';
 const rows=r.checks.map(z=>`<tr><th>${escapeHTML(z.component)}</th><td>${escapeHTML(z.state)}</td><td>${escapeHTML(z.evidence)}</td><td>${escapeHTML(z.missing)}</td></tr>`).join('');
 return `<section class="panel brainlm-compatible-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}</p><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><div class="paper-table-scroll brainlm-compatible-table" tabindex="0" role="region" aria-label="BrainLM官方接入九项检查"><table style="min-width:1160px"><thead><tr><th>核查项目</th><th>实际状态</th><th>已确认</th><th>仍缺</th></tr></thead><tbody>${rows}</tbody></table></div><details ${methods?'open':''}><summary>哪些来自官方，哪些是本地适配</summary><p>官方256维检查点已以strict=True加载FMM作者模块；缺失键和额外键均为0。合成seed0—4全部前向通过，输出1×256；重复误差0。论文具体权重身份与预训练处理尚未明确，官方原任务复现0。</p><p>本地适配：旧512维BrainLM＋ResNet18与三个固定窗口、逐人zscore，已在79人运行且阴性；与当前K10/20分列，不冒充新结果。A424真实数据已有99人，不由AAL90补零。</p><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','核查对照 ↗')} ${evidenceLink(r.id+'-technical','实际技术检查 ↗')} ${evidenceLink(r.id+'-inputs','真实A424资产 ↗')} ${evidenceLink(r.id+'-history','旧79人完整阴性 ↗')} ${evidenceLink(r.id+'-recent','近期组员表 ↗')} ${evidenceLink(r.id+'-plan','条件性方案 ↗')} ${evidenceLink(r.id+'-paper','论文缺口 ↗')}</div></section>`;
}

function painLabelInventorySection(methods=false){
 const r=data.pain_label_inventory;if(!r)return '';
 const rows=r.display_rows.map(v=>`<tr><th>${escapeHTML(v.cohort)}</th><td>${escapeHTML(v.independent_people)}<br>${escapeHTML(v.label)}</td><td>${escapeHTML(v.timing)}<br>${escapeHTML(v.tail_coverage)}</td><td>${escapeHTML(v.readiness)}<br>${escapeHTML(v.next)}</td></tr>`).join('');
 return `<section class="panel pain-inventory-panel"><h2>${escapeHTML(r.title)}</h2><p class="data-note">此为影像处理前的标签库存核查；后续执行状态见本页音乐镇痛报告，原队列计数与阴性记录保留。</p><p><strong>${escapeHTML(r.diagnostic_summary)}</strong></p><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll pain-inventory-table" tabindex="0" role="region" aria-label="现有队列疼痛标签与扫描时点"><table style="min-width:1350px"><thead><tr><th>队列／分支</th><th>人数与实际标签</th><th>时点与低高覆盖</th><th>准备状态与决定</th></tr></thead><tbody>${rows}</tbody></table></div><p>新版DS005713有98平均痛评分，其中95精确对应rest路径；旧33人来源现连接16个评分。同一人级口径由8增至16，原8个值未改。旧报告6指扫描ID直接连接，不能混用分母。评分与MRI时点仍缺，TN14停止。</p><details ${methods?'open':''}><summary>下一轮方案与字段核对</summary><p>当前不启动训练。优先准备音乐17人四条件近扫描连续VRS；仅2人同时有0–3和7–10状态，不能以68行充当68人，也不移植Emo35/65分级。</p><p>准备完成后按人留一、五seed，复用官方冻结TabPFN v2回归；临床、临床＋FC、训练FC按人打乱三条件，最多255上下文，患者梯度更新0。该预算尚未执行；精确评分位置、统一处理和原QC需按真实资料落实。所有旧阴性和停止保持。</p><p>Emo任务论文报告扫描区块当前痛，但实读69个MAT仅含names/onsets/durations/taskduration，无实际回答；访谈VAS不能代填。DEIPP连续同期标签限定个体内研究，不将3人63访视当作人级扩样。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整标签核查 ↗')} ${evidenceLink(r.id+'-cohorts','15条队列CSV ↗')} ${evidenceLink(r.id+'-tails','低高数值计数 ↗')} ${evidenceLink(r.id+'-fields','原始字段与时点 ↗')} ${evidenceLink(r.id+'-plan','下一轮方案 ↗')} ${evidenceLink(r.id+'-metadata','当前来源版本 ↗')}</div></section>`;
}

function brainlmScalingSection(methods=false){
 const r=data.brainlm_scaling;if(!r)return '';
 const rows=r.checks.map(z=>`<tr><th>${escapeHTML(z.component)}</th><td>${escapeHTML(z.state)}</td><td>${escapeHTML(z.evidence)}</td><td>${escapeHTML(z.missing)}</td></tr>`).join('');
 return `<section class="panel brainlm-scaling-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}</p><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><div class="paper-table-scroll brainlm-scaling-table" tabindex="0" role="region" aria-label="BrainLM官方接入九项检查"><table style="min-width:1160px"><thead><tr><th>核查项目</th><th>实际状态</th><th>已确认</th><th>仍缺</th></tr></thead><tbody>${rows}</tbody></table></div><details ${methods?'open':''}><summary>哪些来自官方，哪些是本地适配</summary><p>官方256维检查点已以strict=True加载FMM作者模块；缺失键和额外键均为0。合成seed0—4全部前向通过，输出1×256；重复误差0。论文具体权重身份与预训练处理尚未明确，官方原任务复现0。</p><p>${escapeHTML(r.scaling)}</p><p>本地适配：旧512维BrainLM＋ResNet18与三个固定窗口、逐人zscore，已在79人运行且阴性；与当前K10/20分列，不冒充新结果。A424真实数据已有99人，不由AAL90补零。</p><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-scaling-seeds','五seed缩放实测 ↗')} ${evidenceLink(r.id+'-scaling-failures','失效样例 ↗')} ${evidenceLink(r.id+'-source-evidence','来源证据表 ↗')} ${evidenceLink(r.id+'-comparison','核查对照 ↗')} ${evidenceLink(r.id+'-technical','实际技术检查 ↗')} ${evidenceLink(r.id+'-inputs','真实A424资产 ↗')} ${evidenceLink(r.id+'-history','旧79人完整阴性 ↗')} ${evidenceLink(r.id+'-recent','近期组员表 ↗')} ${evidenceLink(r.id+'-plan','条件性方案 ↗')} ${evidenceLink(r.id+'-paper','论文缺口 ↗')}</div></section>`;
}

function musicNearscanSection(methods=false){
 const r=data.music_nearscan;if(!r)return '';
 const rows=r.display_rows.map(x=>`<tr><th>${escapeHTML(x.stage)}</th><td>${escapeHTML(x.result)}</td><td>${escapeHTML(x.limit)}</td></tr>`).join('');
 const metrics=(r.comparison_rows||[]).map(x=>`<tr><th>${escapeHTML(x.method)}</th><td>${escapeHTML(x.MAE)}</td><td>${escapeHTML(x.RMSE)}</td><td>${escapeHTML(x.R2)}</td></tr>`).join('');
 const paired=(r.paired_rows||[]).map(x=>`<tr><th>${escapeHTML(x.comparison)}</th><td>${escapeHTML(x.difference)}</td><td>${escapeHTML(x.interval)}</td></tr>`).join('');
 const comparison=metrics?`<h3>全部五种子比较</h3><p>同一共同人集、按人留一。C：临床/条件/头动；I：C加影像；S：训练影像按整人打乱。MAE为主要指标，显示五种子均值与种子标准差。</p><div class="paper-table-scroll music-comparison-table" tabindex="0" role="region" aria-label="音乐队列官方五种子比较"><table><thead><tr><th>条件</th><th>MAE</th><th>RMSE均值</th><th>R²均值</th></tr></thead><tbody>${metrics}</tbody></table></div><div class="paper-table-scroll music-paired-table" tabindex="0" role="region" aria-label="音乐影像增量的人级配对区间"><table><thead><tr><th>配对</th><th>MAE差</th><th>95%人级区间</th></tr></thead><tbody>${paired}</tbody></table></div><p class="data-note">负值表示影像误差较小。按人重采样，四状态和全部五种子保留在一起；区间不覆盖重新选参或独立临床验证。上下文自查询含自身标签，仅作乐观记忆诊断，详见报告。</p><p>${evidenceLink(r.id+'-comparison','五种子汇总 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-paired','配对区间 ↗')}</p>`:'';
 return `<section class="panel music-nearscan-panel"><h2>${escapeHTML(r.title)}</h2><p class="data-note">状态观测：${escapeHTML(r.observed_at_local)}。${escapeHTML(r.status_note)}</p><p><strong>${escapeHTML(r.diagnostic_summary)}</strong></p><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll music-nearscan-table" tabindex="0" role="region" aria-label="音乐队列真实处理与QC进度"><table style="min-width:900px"><thead><tr><th>阶段</th><th>已核实结果</th><th>仍需保留的限制</th></tr></thead><tbody>${rows}</tbody></table></div>${comparison}<details ${methods?'open':''}><summary>处理方法、官方模型与比较预算</summary><p>复用原DPABI10.0、MNI统一分割、AAL90、noGSR、无平滑与0.01–0.10Hz；预定输入100帧/TR3秒，实际帧数逐文件检查；97帧源扫描保持排除，原QC阈值全部保留。每扫描独立记成功、失败和待查看。</p><p>官方TabPFN v2回归接口已用合成数据核实：11,081,864参数冻结，同配置重建与单查询隔离误差0。该检查不等于患者比较完成。共同人集形成后按人留一、五seed0–4；C临床/条件/头动，I加训练侧FC最多8PC，S训练FC按人四条件整组打乱；最多255上下文和同配置回放，患者梯度更新0，保留所有阴性。</p><p>原音乐研究在听觉期间没有采集影像；当前是近扫描连续VRS，评分精确钟点缺失，1例结构像次序与论文流程不同。不把68状态当68人，不移植Emo35/65等级。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-alignment','评分与扫描核查 ↗')} ${evidenceLink(r.id+'-qc','QC计数 ↗')} ${evidenceLink(r.id+'-processing','原流程与阈值 ↗')} ${evidenceLink(r.id+'-official','官方回归接口实测 ↗')} ${r.QC_failure_reasons?.length?evidenceLink(r.id+'-failures',r.latest_status_source?'历史QC原因（2026-10-19） ↗':'QC失败原因 ↗'):''} ${r.source_readback?evidenceLink(r.id+'-readback','源数组读回与排除 ↗'):''} ${r.latest_status_source?evidenceLink(r.latest_status_source,'最新终态与人员核查 ↗'):''}</div></section>`;
}

function cortexmaeTransferSection(methods=false){
 const r=data.cortexmae_transfer;if(!r)return '';
 const label={pretrained:'官方预训练＋本地头',random:'冻结随机＋相同头',original_spd:'原轻量SPD（复用）'};
 const rows=r.means.filter(z=>z.condition!=='diagonal_single').map(z=>`<tr><th>${escapeHTML(label[z.method])}</th><td>${z.k}</td><td>${z.condition==='ensemble5'?'五成员集成':'五seed成员均值'}</td><td>${z.auc.toFixed(4)}</td><td>${z.auprc.toFixed(4)}</td><td>${z.balanced_accuracy.toFixed(4)}</td><td>${z.brier.toFixed(4)}</td><td>${z.support_repeat_auc_sample_sd.toFixed(4)}</td></tr>`).join('');
 const checks=r.checks.map(z=>`<li><strong>${escapeHTML(z.component)}</strong>：${escapeHTML(z.evidence)} ${escapeHTML(z.missing)}</li>`).join('');
 return `<section class="panel cortexmae-transfer-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}</p><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><div class="paper-table-scroll cortexmae-transfer-table" tabindex="0" role="region" aria-label="CortexMAE同人同预算比较"><table style="min-width:1100px"><thead><tr><th>模型</th><th>每类K</th><th>口径</th><th>AUC</th><th>AP</th><th>BA</th><th>Brier</th><th>支持重复SD</th></tr></thead><tbody>${rows}</tbody></table></div><details ${methods?'open':''}><summary>官方方法、本地适配和来源核查</summary><p>${escapeHTML(r.method)}</p><p>官方编码器85389312参数冻结，本地头773参数。选用作者A424消融变体；完整官方原任务复现0。服务器Python3.10/Torch2.5.1低于作者当前依赖，已做五seed CPU/GPU交叉核查，算子未改。五个头seed不能替代五个预训练模型。</p><ul>${checks}</ul><p>代码整理工具：${escapeHTML(r.code_assistant)}</p></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','完整对比 ↗')} ${evidenceLink(r.id+'-pairs','配对区间 ↗')} ${evidenceLink(r.id+'-seeds','全部seed ↗')} ${evidenceLink(r.id+'-supports','全部支持指标 ↗')} ${evidenceLink(r.id+'-failures','失败记录 ↗')} ${evidenceLink(r.id+'-technical','技术核查 ↗')} ${evidenceLink(r.id+'-recent','近期组员表 ↗')} ${evidenceLink(r.id+'-plan','预定方案 ↗')} ${evidenceLink(r.id+'-paper','论文缺口 ↗')}</div></section>`;
}

function cortexmaeSupportSection(methods=false){
 const r=data.cortexmae_support;if(!r)return '';
 const label={pretrained_l2_001:'Cortex头 L2=0.001',pretrained_l2_01:'Cortex头 L2=0.1',pretrained_l2_10:'Cortex头 L2=10',random_l2_10:'固定随机头 L2=10',spd:'原轻量SPD，内折重训',fixed_residual_025:'固定75%SPD＋25%Cortex'};
 const rows=r.means.filter(z=>z.condition==='ensemble5').map(z=>`<tr><th>${escapeHTML(label[z.method])}</th><td>${z.k}</td><td>${z.k/2}</td><td>${z.train_auc.toFixed(4)}</td><td>${z.auc.toFixed(4)}</td><td>${z.auprc.toFixed(4)}</td><td>${z.balanced_accuracy.toFixed(4)}</td><td>${z.brier.toFixed(4)}</td><td>${z.logloss.toFixed(4)}</td></tr>`).join('');
 const checks=r.checks.map(z=>`<li><strong>${escapeHTML(z.component)}</strong>：${escapeHTML(z.evidence)} ${escapeHTML(z.missing)}</li>`).join('');
 return `<section class="panel cortexmae-support-panel"><h2>${escapeHTML(r.title)}</h2><p><strong>基于模型：${escapeHTML(r.base_model)}</strong></p><p>本轮改动：${escapeHTML(r.changed_component)}</p><p>${escapeHTML(r.scope_note)}</p><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p>${escapeHTML(r.fit_diagnostic)}</p><div class="paper-table-scroll cortexmae-support-table" tabindex="0" role="region" aria-label="CortexMAE支持内按人留出诊断"><table style="min-width:1100px"><thead><tr><th>模型（五成员）</th><th>完整支持每类K</th><th>实际内训练每类K</th><th>训练AUC</th><th>留出AUC</th><th>AP</th><th>BA</th><th>Brier</th><th>logloss</th></tr></thead><tbody>${rows}</tbody></table></div><details ${methods?'open':''}><summary>官方方法、本地适配与继续决定</summary><p>${escapeHTML(r.method)}</p><p>本轮融合是固定概率平均，不声称学习了条件残差。官方原任务复现0，原作者编码器未改。代码整理：${escapeHTML(r.code_assistant)}</p><ul>${checks}</ul></details><p>${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id+'-comparison','完整对比 ↗')} ${evidenceLink(r.id+'-seeds','全部seed ↗')} ${evidenceLink(r.id+'-supports','全部内折 ↗')} ${evidenceLink(r.id+'-trajectories','训练轨迹 ↗')} ${evidenceLink(r.id+'-complement','互补性分解 ↗')} ${evidenceLink(r.id+'-failures','阴性与停止 ↗')} ${evidenceLink(r.id+'-recent','近期组员表 ↗')} ${evidenceLink(r.id+'-plan','预定方案 ↗')} ${evidenceLink(r.id+'-paper','论文缺口 ↗')}</div></section>`;
}

function painRangeSection(methods=false){
 const r=data.literature_diagnostics;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.mae.toFixed(4)}</td><td>${v.sd_ratio.toFixed(3)}</td><td>${v.low_bias.toFixed(2)}</td><td>${v.high_bias.toFixed(2)}</td></tr>`).join('');
 return `<section class="panel pain-range-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="连续疼痛预测范围及两端误差"><table style="min-width:760px"><thead><tr><th>模型：神经列为五成员集成</th><th>VAS误差↓</th><th>预测SD/真实SD</th><th>低区间偏差</th><th>高区间偏差</th></tr></thead><tbody>${rows}</tbody></table></div><p>偏差=预测−真实，VAS 0—100。预测SD/真实SD小于1描述分布收缩，不能单独判断模型无信息。低/高区间只有5/6人。</p><details ${methods?'open':''}><summary>日期差、阅读范围与未完成事项</summary><p>日期差与绝对误差的相关在模型间不一致；没有按日期或成绩筛人重训。复用原27人、三折和保存预测，新增拟合及模型前向均为0。</p><p>五篇中取得三篇预印本正文，McLain与Gianola仍只有正式摘要；当时CortexMAE冻结特征读取遇SSH认证失败；2026-10-20已取得完整特征并完成有效秩与站点诊断，见本页新报告。音乐四状态共同样本需完成原数值和真实视觉QC。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整诊断报告 ↗')} ${evidenceLink(r.id+'-metrics','42项全部诊断 ↗')} ${evidenceLink(r.id+'-members','五seed汇总 ↗')} ${evidenceLink(r.id+'-folds','36项原折误差 ↗')}</div></section>`;
}

function cortexRankSection(methods=false){
 const r=data.cortexmae_rank;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>K${v.k}／${v.encoder==='pretrained'?'官方预训练':'固定随机'}</th><td>${v.effective_rank.toFixed(3)}</td><td>${v.rank_bound}</td><td>${(100*v.top8).toFixed(2)}%</td><td>${(100*v.site_r2).toFixed(2)}%</td><td>${(100*v.site_adj).toFixed(2)}%</td><td>${(100*v.joint_adj).toFixed(2)}%</td><td>${(100*v.pca8_site).toFixed(2)}%</td></tr>`).join('');
 return `<section class="panel cortex-rank-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="有效秩与站点关联同人比较"><table style="min-width:1050px"><thead><tr><th>支持预算／编码器</th><th>熵有效秩</th><th>代数秩上界</th><th>PCA8方差</th><th>站点R²</th><th>站点调整R²</th><th>联合调整R²</th><th>PCA8站点R²</th></tr></thead><tbody>${rows}</tbody></table></div><p>K10/20为完整支持每类人数；内训练实际每类5/10人，总10/20人。每预算50个重叠分区，不能当50队列。</p><details ${methods?'open':''}><summary>计算口径、验证与会议依据</summary><p>只在内训练人拟合尺度、PCA和描述性投影；199次人员行置换用于观察小样本偶然解释方差，没有新增预测器或外查询评价。独立SVD、直接最小二乘与原统计最大差小于1e-13。</p><p>SSH已通过原授权通道验证，完整冻结特征已取得；没有修改服务器认证配置。低秩不等于疼痛有效，降维不等于去站点。音乐仍等原数值与真实视觉QC。</p><p>会议依据已核对ICML 2026 CortexMAE、MICCAI 2025 FMM_TC、NeurIPS 2025 DiffeoCFM、MICCAI 2026 Brain-DiT及NeurIPS 2024 Brain-JEPA；AAAI 2026 BrainHGT作既有结构出处。正式接收、本地适配、疼痛验证分别说明。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整诊断报告 ↗')} ${evidenceLink(r.id+'-figure','汇报图 ↗')} ${evidenceLink(r.id+'-partitions','200行全部分区 ↗')} ${evidenceLink(r.id+'-pcs','1600行PC统计 ↗')} ${evidenceLink(r.id+'-conference','会议论文汇报提纲 ↗')}</div></section>`;
}

function spdLieBNOverview(){
 const r=data.spd_liebn;if(!r)return '';
 return `<section class="panel latest-study spd-liebn-overview"><div class="study-meta"><time>${escapeHTML(r.date || '')}</time><span>支持内开发比较</span></div><h2>SPDNet＋LieBN支持内比较</h2><p class="study-conclusion">${escapeHTML(r.interpretation)}</p><details><summary>查看指标与适用范围</summary><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p></details><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-recent','组员工作表 ↗')}</div></section>`;
}
function spdLieBNSection(methods=false){
 const r=data.spd_liebn;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>K${v.k}／${v.method==='spd'?'轻量SPD（原保存）':'SPD＋官方AIM LieBN'}</th><td>${v.parameters}</td><td>${v.auc.toFixed(4)}</td><td>${v.delta_auc.toFixed(4)}</td><td>${v.auprc.toFixed(4)}</td><td>${v.balanced_accuracy.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel spd-liebn-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="SPDNet与LieBN同人同预算比较"><table style="min-width:920px"><thead><tr><th>完整支持预算／模型</th><th>参数数</th><th>AUC</th><th>ΔAUC</th><th>AP</th><th>BA</th><th>Brier</th><th>logloss</th></tr></thead><tbody>${rows}</tbody></table></div><p>表内均为五成员概率平均后的支持内留出指标。K10/20指完整支持每类人数；内训练实际每类5/10人，总10/20人。每预算50个重叠分区。</p><details ${methods?'open':''}><summary>官方结构与本地训练适配</summary><p>${escapeHTML(r.method)}</p><p>官方ICLR2024代码中的AIM LieBN层直接导入，theta=1、alpha=1、beta=0、momentum=0.1。官方原实验用Radar/HDM05和200个epoch；本轮用SRPBS诊断、200次全批更新、均衡BCE和本地SGD配方，属于任务适配。</p><p>${escapeHTML(r.verification_summary)}</p><p>全部种子、轨迹、数值检查和停止记录可下载。保存的均值与方差只来自内训练人，测试批次不更新统计量；完整MRI和个人预测未公开。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','对比表 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-recent','组员工作表 ↗')} ${evidenceLink(r.id+'-plan','计算前方案 ↗')}</div></section>`;
}

function cortexPCAOverview(){
 const r=data.cortexmae_pca8;if(!r)return '';
 return `<section class="panel latest-study cortexmae-pca8-overview"><div class="study-meta"><time>${escapeHTML(r.date || '')}</time><span>支持内开发比较</span></div><h2>CortexMAE固定PCA8容量消融</h2><p class="study-conclusion">${escapeHTML(r.interpretation)}</p><details><summary>查看指标与适用范围</summary><p>${escapeHTML(r.summary)}</p><p class="data-note">${escapeHTML(r.boundary)}</p></details><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-recent','组员工作表 ↗')}</div></section>`;
}
function cortexPCASection(methods=false){
 const r=data.cortexmae_pca8;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>K${v.k}／${escapeHTML(v.name)}</th><td>${v.parameters}</td><td>${v.auc.toFixed(4)}</td><td>${v.delta_auc.toFixed(4)}</td><td>${v.auprc.toFixed(4)}</td><td>${v.balanced_accuracy.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel cortexmae-pca8-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="PCA8与原分类头及SPD支持内比较"><table style="min-width:960px"><thead><tr><th>完整支持预算／模型</th><th>可训练参数</th><th>AUC</th><th>ΔAUC相对SPD</th><th>AP</th><th>BA</th><th>Brier</th><th>logloss</th></tr></thead><tbody>${rows}</tbody></table></div><p>表为五成员概率平均后的支持内留出指标；K10/20内训练实际每类5/10人，总10/20人，每预算50个重叠分区。原弱正则及随机头、全部成员均值和种子在完整对比表中保留。</p><details ${methods?'open':''}><summary>官方编码器与本地PCA8训练适配</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>标准化、PCA和初始化投影均仅由内训练人决定，验证人不参与拟合。保留全部500头及2500轨迹，没有重新编码、原头重训或外查询评分。PCA保留总方差，未被证明能去站点或保留全部疾病信息。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','全部模型对比 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-recent','组员工作表 ↗')} ${evidenceLink(r.id+'-plan','计算前方案 ↗')}</div></section>`;
}

function communityPriorOverview(){
 const r=data.community_prior;if(!r)return '';
 return `<section class="panel latest-study community-prior-overview"><div class="study-meta"><span>支持内开发比较</span></div><h2>BrainHGT社区先验适配</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三组对比 ↗')}</div></section>`;
}
function communityPriorSection(methods=false){
 const r=data.community_prior;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.parameters}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.delta_auc.toFixed(4)}</td><td>${v.ba.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel community-prior-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="BrainHGT社区先验适配同条件比较"><table style="min-width:900px"><thead><tr><th>同人同预算方法</th><th>总参数</th><th>内层AUC均值 ± SD</th><th>相对原模型ΔAUC</th><th>BA</th><th>Brier</th><th>logloss</th></tr></thead><tbody>${rows}</tbody></table></div><p>先计算每个seed的三个内折均值，再对五seed计算均值及样本SD。三个内折覆盖原外训练79人，训练52/53、验证27/26；不是99人OOF，也不是K-shot。验证参与选轮，分数有乐观偏差。</p><details ${methods?'open':''}><summary>与原模型和旧失败方案的区别</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>保留原展平encoder、OMST、长短程注意力、先验乘法和Entmax。乱序组只打乱新增适配方向的ROI对应，原Dice不打乱；少参数是新增适配量，完整主干仍训练。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','对比表 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-literature','查新与区别 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function temporalReliabilityOverview(){
 const r=data.temporal_reliability;if(!r)return '';
 return `<section class="panel latest-study temporal-reliability-overview"><div class="study-meta"><span>支持内开发比较</span></div><h2>报告前时间可靠性与疼痛读出</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','同条件对比 ↗')}</div></section>`;
}
function temporalReliabilitySection(methods=false){
 const r=data.temporal_reliability;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.parameters}</td><td>${v.mae.toFixed(6)} ± ${v.mae_sd.toFixed(6)}</td><td>${v.rmse.toFixed(6)}</td><td>${v.r.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel temporal-reliability-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="报告前疼痛读出同条件比较"><table style="min-width:800px"><thead><tr><th>满预算方法</th><th>监督系数含截距</th><th>PR人均MAE ± seed SD↓</th><th>RMSE↓</th><th>平均人内r</th></tr></thead><tbody>${rows}</tbody></table></div><p>每次三人训练、每人15标签、一人验证。五seed先在每人计算误差再等权汇总；等权、FD、共同及FC的满标签分区相同，SD为0来自确定性重复引用，不是五次独立确认。5/10标签和全部种子见完整对比表。</p><details ${methods?'open':''}><summary>实际方法、旧失败区别与复核</summary><p>${escapeHTML(r.method)}</p><p>STAGIN是动态图诊断网络，旧时序融合是静态/lag专家概率融合；本轮为真实事件对齐后的固定HRF响应估计，不训练BrainHGT，也不重开反对称时滞指标。加权估计已有文献先例。</p><p>${escapeHTML(r.verification_summary)}</p><p>完整删帧包含其基线成员，训练尺度及协变量保持。等权/FD最大预测变化中位数0.577962/0.578296点，最坏4.382738/4.295353点。没有重复扫描，不能报告重测信度或逐时刻临床疼痛。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三预算对比 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-timing','真实时点 ↗')} ${evidenceLink(r.id+'-literature','查新与区别 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function trainSideSSLOverview(){
 const r=data.train_side_ssl;if(!r)return '';
 return `<section class="panel latest-study train-side-ssl-overview"><div class="study-meta"><span>支持内开发比较</span></div><h2>训练侧自监督与有限适配</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','八路对比 ↗')}</div></section>`;
}
function trainSideSSLSection(methods=false){
 const r=data.train_side_ssl;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.parameters}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.ap.toFixed(4)}</td><td>${v.ba.toFixed(4)}</td><td>${v.sensitivity.toFixed(4)}</td><td>${v.specificity.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel train-side-ssl-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p><strong>${escapeHTML(r.interpretation)}</strong></p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="训练侧自监督同人同预算比较"><table style="min-width:1250px"><thead><tr><th>训练来源／读出</th><th>下游训练参数</th><th>内层AUC均值 ± SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>45个自监督模型＋120个下游模型；另15个随机源状态没有训练。三个自监督目标同训练人、同60步；两个读出同200步但参数不同。随机参照无自监督成本，不把少参数适配当成整条管线只有12650参数。每seed先平均三内折，再汇总五seed；不是预测集成或独立队列。</p><p>另复用9个旧权重，人员与标签完全相同，固定C=1且未重训：协变量/Pearson FC/切空间FC的AUC为0.4867/0.6662/0.7605。它们是含四协变量的均衡Logistic，优化和计算预算不同，作为补充参照；当前跨半适配未达到同人FC参照。</p><details ${methods?'open':''}><summary>训练人范围、旧失败区别和复核</summary><p>${escapeHTML(r.method)}</p><p>仅原outer0训练79人的半程输入，各折只让当前52/53训练人参加学习；当前内验证的无标签数据也不加入，20外查询没有新评分。旧重叠裁剪自重建/NT-Xent、外部冻结模型和社区先验适配各自阴性继续保留。</p><p>${escapeHTML(r.verification_summary)}</p><p>不重叠的已处理半程仍可能受全程滤波或回归影响；自监督loss降低不等于去混杂、重测可靠性或临床疼痛效度。跨半恢复及小残差已有相近机制，本轮不主张原创。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','八路对比 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-budgets','真实预算 ↗')} ${evidenceLink(r.id+'-controls','复用FC对照 ↗')} ${evidenceLink(r.id+'-literature','查新与区别 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function boundedTuningOverview(){
 const r=data.brainhgt_bounded_tuning;if(!r)return '';
 return `<section class="panel latest-study bounded-tuning-overview"><div class="study-meta"><span>支持内开发比较</span></div><h2>BrainHGT标签平滑与社区原型调优</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三组对比 ↗')}</div></section>`;
}
function boundedTuningSection(methods=false){
 const r=data.brainhgt_bounded_tuning;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.parameters}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.ap.toFixed(4)}</td><td>${v.ba.toFixed(4)}</td><td>${v.sensitivity.toFixed(4)}</td><td>${v.specificity.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel bounded-tuning-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="BrainHGT有限调优同人同预算比较"><table style="min-width:1150px"><thead><tr><th>方法</th><th>可训练参数</th><th>内层AUC均值 ± SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>30个新模型，15个原CPU参照直接复用；没有重训参照。两项改动分别训练，不叠加。每个模型同100轮、同人员和同种子，参数自由度与实际耗时分别报告，不声称FLOPs完全相同。</p><details ${methods?'open':''}><summary>改动位置与复核</summary><p>${escapeHTML(r.method)}</p><p>原q_proj本来可训练，冻结原型不等于社区完全不可学习。解冻原型同时改变注意力查询输入与社区残差；它不是医学预训练。标签平滑只影响当前训练损失，不修改原始标签。</p><p>${escapeHTML(r.verification_summary)}</p><p>既有Dice系数适配、固定HRF/FD和跨半程自监督的阴性结论保留。这里是两项普通训练策略调优，不主张新算法或独立临床效度。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-metrics','全部模型 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')} ${evidenceLink(r.id+'-literature','方法依据 ↗')}</div></section>`;
}

function painRegionalReadoutOverview(){
 const r=data.pain_regional_readout;if(!r)return '';
 return `<section class="panel pain-regional-readout-overview"><h2>疼痛相关区域读出与排序适配</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','四路对比 ↗')}</div></section>`;
}
function painRegionalReadoutSection(methods=false){
 const r=data.pain_regional_readout;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.parameters}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.ap.toFixed(4)}</td><td>${v.ba.toFixed(4)}</td><td>${v.sensitivity.toFixed(4)}</td><td>${v.specificity.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel pain-regional-readout-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="区域读出同人对比"><table style="min-width:1150px"><thead><tr><th>方法</th><th>本轮新增可训练参数</th><th>内层AUC均值 ± SD</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>45个新读出头，15个已训练来源直接复用。三路读出同2064参数、同200步；原模型本轮新增0步，来源的约331万参数监督训练成本仍存在，不能称四路同额外计算。</p><p>疼痛相关先验取双侧岛叶、前扣带、丘脑6个AAL90区；对照为拟合前固定的双侧额上回内侧、枕上回和壳核。它们不是疼痛特异与无关区域的划界。LSRA已整合全脑信息，区域表征也不是纯局部活动。</p><details ${methods?'open':''}><summary>结构、训练范围与复核</summary><p>${escapeHTML(r.method)}</p><p>新头固定200步，不用验证选新轮次、区域或超参数；来源检查点曾由同内验证选轮，因此仍是累计开发结果。排序目标与区域先验已有方法背景，不能称原创损失、NPS或已验证临床标志物。</p><p>${escapeHTML(r.verification_summary)}</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-regions','区域与列号 ↗')} ${evidenceLink(r.id+'-code','新增模型代码 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function failureAttributionOverview(){
 const r=data.brainhgt_failure_attribution;if(!r)return '';
 return `<section class="panel failure-attribution-overview"><h2>BrainHGT失败归因</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'归因报告 ↗')} ${evidenceLink(r.id+'-plan','两档人数原方案与执行状态 ↗')}</div></section>`;
}
function failureAttributionSection(methods=false){
 const r=data.brainhgt_failure_attribution;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.train_auc.toFixed(4)}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.auc_gap.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td><td>${v.within_pair_auc.toFixed(4)}</td><td>${v.cross_pair_auc.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel failure-attribution-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="八方法训练与验证比较"><table style="min-width:1040px"><thead><tr><th>方法</th><th>训练AUC</th><th>验证AUC ± 初始化SD</th><th>训练与验证差距</th><th>Brier↓</th><th>同站点配对AUC</th><th>跨站点配对AUC</th></tr></thead><tbody>${rows}</tbody></table></div><p>本轮复用120份保存模型记录，没有新增训练或模型前向。原模型22/79人五初始化均误分，名单保留私有，人员和标签未调整。站点配对接近不等于留站点泛化；头动与误差相关也不能证明因果。</p><details ${methods?'open':''}><summary>错误分解、人员不确定性与局限</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>原AUC人员条件区间约[0.5790,0.7930]；标签平滑ΔAUC约[-0.0155,0.0224]，疼痛残差约[-0.0867,0.0277]。区间条件于已选保存模型，未覆盖重训、选轮与反复开发，不是独立临床验证。现有逐轮曲线不能当训练人数学习曲线。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-plan','两档人数原方案与执行状态 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-overlap','错误重合 ↗')} ${evidenceLink(r.id+'-sites','站点分解 ↗')}</div></section>`;
}

function sampleSizeOverview(){
 const r=data.brainhgt_sample_size;if(!r)return '';
 return `<section class="panel sample-size-overview"><h2>BrainHGT两档训练人数响应</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','两档及全部种子对比 ↗')}</div></section>`;
}
function sampleSizeSection(methods=false){
 const r=data.brainhgt_sample_size;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${escapeHTML(v.people)}</td><td>${v.new_fits} / ${v.reused_models}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.sensitivity.toFixed(4)}</td><td>${v.specificity.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel sample-size-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="两档人数同验证比较"><table style="min-width:1120px"><thead><tr><th>条件</th><th>训练人数</th><th>新增 / 复用</th><th>验证AUC ± SD</th><th>训练AUC</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>只新增15个半量模型，原15个全量模型直接复用。两档各200更新和100次验证机会；有效epoch、随机轨迹、批次大小及计算量并不完全相同。每折只取一个固定半量子集，全部初始化共用，不根据成绩换人。</p><details ${methods?'open':''}><summary>人数、训练范围与复核</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>全部选中和末次指标、30模型、10种子及3000条检查轨迹保留。区间条件于已选保存模型，未覆盖重训、子集抽样和研究选择，不证明临床泛化。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-budgets','实际预算 ↗')} ${evidenceLink(r.id+'-curves','全部曲线 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function linearProbeOverview(){
 const r=data.brainhgt_linear_probe;if(!r)return '';
 return `<section class="panel linear-probe-overview"><h2>BrainHGT固定线性读出</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','三路及全部种子对比 ↗')}</div></section>`;
}
function linearProbeSection(methods=false){
 const r=data.brainhgt_linear_probe;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.parameters}</td><td>${v.new_fits}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.sensitivity.toFixed(4)}</td><td>${v.specificity.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel linear-probe-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="固定线性读出同人比较"><table style="min-width:1120px"><thead><tr><th>读出</th><th>拟合参数/头</th><th>新拟合</th><th>验证AUC ± SD</th><th>训练AUC</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>15个监督主干直接复用，新增30个257参数线性读出，主干重训0次。小读出仍依赖原331万参数主干的历史监督训练。两种新头使用相同求解设置，不与旧Adam训练宣称相同更新数或计算量。</p><details ${methods?'open':''}><summary>两个位置、固定预算与复核</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>聚合后是拟合前唯一主候选；聚合前只作诊断，不按验证成绩换层。全部15源种子汇总、45组指标、30头及求解轨迹保留。区间不覆盖来源选轮和累积开发，不能证明临床泛化或唯一定位社区作用。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部源种子 ↗')} ${evidenceLink(r.id+'-budgets','实际预算 ↗')} ${evidenceLink(r.id+'-curves','全部求解轨迹 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function supervisedMixupOverview(){
 const r=data.brainhgt_supervised_mixup;if(!r)return '';
 return `<section class="panel supervised-mixup-overview"><h2>BrainHGT监督表征混合</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','同人及全部种子对比 ↗')}</div></section>`;
}
function supervisedMixupSection(methods=false){
 const r=data.brainhgt_supervised_mixup;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.new_fits} / ${v.reused_models}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.ap.toFixed(4)}</td><td>${v.ba.toFixed(4)}</td><td>${v.sensitivity.toFixed(4)}</td><td>${v.specificity.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel supervised-mixup-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="监督表征混合同人比较"><table style="min-width:1200px"><thead><tr><th>训练条件</th><th>新增 / 复用</th><th>验证AUC ± SD</th><th>训练AUC</th><th>AP</th><th>BA</th><th>敏感性</th><th>特异性</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>15个原模型直接复用，只新增15个固定alpha1、固定社区均值位置的混合训练模型。两路都是完整作者架构，总参数3309738，无新增参数；每模型200更新/100次验证机会。混合和双CE有额外算术，不宣称完全同FLOPs。</p><details ${methods?'open':''}><summary>训练混合、人员与复核</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>全部五初始化、30模型、3000检查轨迹和15混合诊断保留。原标签不重写，混合向量不是新增独立人员。旧参照末次只有原曲线，15新末次权重已保存并回放；末次指标不替换预定主结果。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-budgets','实际预算 ↗')} ${evidenceLink(r.id+'-curves','全部曲线 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')}</div></section>`;
}

function mixupRobustnessOverview(){
 const r=data.mixup_robustness;if(!r)return '';
 return `<section class="panel mixup-robustness-overview"><h2>监督混合收益的稳健性复核</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整复核 ↗')} ${evidenceLink(r.id+'-comparison','结果对比 ↗')}</div></section>`;
}
function mixupRobustnessSection(methods=false){
 const r=data.mixup_robustness;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.reused_models}</td><td>${v.auc.toFixed(4)} ± ${v.auc_sd.toFixed(4)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel mixup-robustness-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="保存模型原结果"><table style="min-width:650px"><thead><tr><th>原选中模型</th><th>复用模型数</th><th>原验证AUC ± SD</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>上表复述上一批结果。本轮复用30模型预测，新增训练0、前向0、外查询评分0。79次省略一人检查均为固定预测重算，不是留一法重训。</p><details ${methods?'open':''}><summary>站点、人员贡献和选轮检查</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>同站点Δ配对AUC +0.0167，跨站点+0.0234。固定200步ΔAUC +0.0074，100检查点均值差+0.0053，后者只是轨迹描述。OSU仅2/5初始化改善，NKN三人仅一折的两人形成一个有效配对，不能认定站点稳定性。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-sites','站点结果 ↗')} ${evidenceLink(r.id+'-trajectory','全部轨迹 ↗')} ${evidenceLink(r.id+'-plan','复核前方案 ↗')}</div></section>`;
}

function independentReadinessOverview(){
 const r=data.independent_readiness;if(!r)return '';
 return `<section class="panel independent-readiness-overview"><h2>现有人员能否支持独立诊断验证</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整核查 ↗')} ${evidenceLink(r.id+'-plan','有限方案（未执行） ↗')}</div></section>`;
}
function independentReadinessSection(methods=false){
 const r=data.independent_readiness;if(!r)return '';
 const rows=r.candidate_metrics.map(v=>`<tr><th>${escapeHTML(v.name)}</th><td>${v.people}</td><td>${v.patient} / ${v.control}</td><td>${v.ready}</td></tr>`).join('');
 return `<section class="panel independent-readiness-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="待确认条目与可验证人数"><table style="min-width:650px"><thead><tr><th>候选范围</th><th>条目数</th><th>原patient / HC</th><th>当前可直接独立验证</th></tr></thead><tbody>${rows}</tbody></table></div><p>33条包含于135条，不能相加。路径存在不等于影像已取得，未在旧来源键中不等于从未参与开发。当前33条全部PENDING、训练纳入0。${r.current33_disposition?' 后续原报告核对已明确33人均因AAL90覆盖失败排除，结束本33准备。':''}</p><details ${methods?'open':''}><summary>历史使用证据与有限预算</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>原20人均已有历史预测，不能重新留出。候选身份/使用史/QC未对齐前，训练和预测均0。待真实双类名单与输入就绪，最多复用15原模型＋15混合权重、30×N个模型—人评分，全部seed0–4/三源内折，无目标侧选参或校准。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-cohorts','全部15条来源 ↗')} ${evidenceLink(r.id+'-usage','原人员使用证据 ↗')} ${evidenceLink(r.id+'-plan','有限方案（未执行） ↗')}</div></section>`;
}

function dsPersonAuditOverview(){
 const r=data.ds005713_person_audit;if(!r)return '';
 return `<section class="panel ds-person-audit-overview"><h2>DS005713原33候选：可用0，按原QC排除33</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整核查 ↗')} ${evidenceLink(r.id+'-comparison','最终对比 ↗')}</div></section>`;
}
function dsPersonAuditSection(methods=false){
 const r=data.ds005713_person_audit;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.group)}</th><td>${v.people}</td><td>${v.eligible}</td><td>${v.excluded}</td><td>${escapeHTML(v.reason)}</td></tr>`).join('');
 return `<section class="panel ds-person-audit-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="原33人最终人数与排除原因"><table style="min-width:650px"><thead><tr><th>原分组</th><th>候选人数</th><th>可用</th><th>按原QC排除</th><th>原因</th></tr></thead><tbody>${rows}</tbody></table></div><p>Stage1/2通过、旧研究者确认、AAL90覆盖与当前SQLite决定分别记录。当前PENDING不撤销旧确认，也不覆盖原33人AAL90覆盖失败。</p><details ${methods?'open':''}><summary>人员、访视、使用史与原证据</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>33基线另有14关联随访，共47扫描，仍是33人；随访3次覆盖失败、11次自动QC排除。七份已核对成员清单未命中，不证明全部历史任务与跨库真实身份无重叠；本轮未读取MRI/FC数组或运行模型。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-reasons','排除原因 ↗')} ${evidenceLink(r.id+'-usage','成员使用证据 ↗')} ${evidenceLink(r.id+'-qc-layers','QC来源层次 ↗')} ${evidenceLink(r.id+'-next','本33方案不执行 ↗')}</div></section>`;
}

function dsRemainingAuditOverview(){
 const r=data.ds005713_remaining_audit;if(!r)return '';
 return `<section class="panel ds-remaining-audit-overview"><h2>DS005713剩余102：100原QC排除、2身份HOLD</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整核查 ↗')} ${evidenceLink(r.id+'-comparison','原135终态对比 ↗')}</div></section>`;
}
function dsRemainingAuditSection(methods=false){
 const r=data.ds005713_remaining_audit;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.group)}</th><td>${v.people}</td><td>${v.eligible}</td><td>${v.excluded}</td><td>${v.identity_hold}</td></tr>`).join('');
 return `<section class="panel ds-remaining-audit-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="剩余102互斥终态"><table style="min-width:650px"><thead><tr><th>原分组</th><th>候选登记键</th><th>可直接验证</th><th>原QC排除</th><th>身份HOLD</th></tr></thead><tbody>${rows}</tbody></table></div><p>100条原QC排除为99自动排除、1旧恢复后排除。2身份HOLD均为patient，涉及同一跨人员BOLD对象，不能报为2名独立验证人；当前没有合格HC。</p><details ${methods?'open':''}><summary>人员、访视、影像存在与原失败依据</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>36随访中31原自动QC排除、3原AAL90覆盖排除、2重复访视HOLD。原始BOLD/T1文件存在不等于数组本轮已读或QC通过，当前138访视仍属原102登记键；七份成员清单未命中不证明全历史未开发。</p></details><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-reasons','排除与HOLD原因 ↗')} ${evidenceLink(r.id+'-usage','保存成员证据 ↗')} ${evidenceLink(r.id+'-cohorts','原135计数 ↗')} ${evidenceLink(r.id+'-decision','当前池不执行评估 ↗')}</div></section>`;
}

function newSourceDownloadOverview(){
 const r=data.new_source_download_review;if(!r)return '';
 return `<section class="panel new-source-download-overview"><h2>新数据候选：腰痛队列影像访问受阻</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整核查 ↗')} ${evidenceLink(r.id+'-comparison','三个来源对比 ↗')}</div></section>`;
}
function newSourceDownloadSection(methods=false){
 const r=data.new_source_download_review;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.dataset)}</th><td>${escapeHTML(v.people)}</td><td>${escapeHTML(v.input)}</td><td>${escapeHTML(v.decision)}</td></tr>`).join('');
 return `<section class="panel new-source-download-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三个新来源的任务适用性"><table style="min-width:650px"><thead><tr><th>来源</th><th>参与者表</th><th>输入</th><th>本轮判断</th></tr></thead><tbody>${rows}</tbody></table></div><details ${methods?'open':''}><summary>实际下载、人员与处理限制</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>51名基线配对候选尚未读取影像头或通过QC。148份BOLD含重复访视；现有参与者表没有扫描同期疼痛评分或治疗结局。示例BOLD侧车缺少标准SliceTiming字段，需核对README和真实采集信息。</p></details><p class="data-note">${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-download','下载状态 ↗')} ${evidenceLink(r.id+'-plan','有限范围 ↗')}</div></section>`;
}

function mixupCrosscohortOverview(){
 const r=data.mixup_crosscohort;if(!r)return '';
 return `<section class="panel mixup-crosscohort-overview"><h2>监督混合：跨队列AUC改善未一致保持</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整复核 ↗')} ${evidenceLink(r.id+'-comparison','三个队列对比 ↗')}</div></section>`;
}
function mixupCrosscohortSection(methods=false){
 const r=data.mixup_crosscohort;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.patient}/${v.HC}</td><td>${v.original_auc.toFixed(4)}</td><td>${v.mixup_auc.toFixed(4)}</td><td>${v.delta_auc>0?'+':''}${v.delta_auc.toFixed(4)}</td><td>[${v.delta_auc_lower95.toFixed(4)}, ${v.delta_auc_upper95.toFixed(4)}]</td><td>${v.positive_auc_seeds}/5</td></tr>`).join('');
 return `<section class="panel mixup-crosscohort-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三个已开发队列的原模型与混合模型比较"><table style="min-width:800px"><thead><tr><th>队列</th><th>患者/HC</th><th>原AUC</th><th>混合AUC</th><th>ΔAUC</th><th>条件95%区间</th><th>正向种子</th></tr></thead><tbody>${rows}</tbody></table></div><p>三个队列平均Brier与logloss均降低；Emo的AUC下降，三个队列的AUC增益区间均跨0。概率误差下降不能替代排序改善，也不能按ZAN低于0.5事后翻转预测方向。</p><details ${methods?'open':''}><summary>固定权重、全部种子与不确定性</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>每个seed先平均3个源内折指标，再汇总5seed；没有先集成概率、目标选轮、校准或微调。各队列2000次人员配对区间条件于固定权重，不覆盖重训或累计研究选择，三个边际区间未作联合多重校正。</p></details><p class="data-note">${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-cohorts','完整指标 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-decision','本轮决定 ↗')}</div></section>`;
}

function fcSpdMatchedOverview(){
 const r=data.fc_spd_matched;if(!r)return '';
 return `<section class="panel fc-spd-matched-overview"><h2>相同FC比较：SPD点估计较好，AUC区间仍跨0</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整比较 ↗')} ${evidenceLink(r.id+'-comparison','全部种子 ↗')} ${evidenceLink(r.id+'-papers','与论文怎样比较 ↗')}</div></section>`;
}
function fcSpdMatchedSection(methods=false){
 const r=data.fc_spd_matched;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.models}</td><td>${v.parameters}</td><td>${v.auc.toFixed(4)}${v.auc_sd===null?'':'±'+v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td><td>${v.logloss.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel fc-spd-matched-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p>${escapeHTML(r.details)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="相同FC与79人划分下的三方法比较"><table style="min-width:800px"><thead><tr><th>方法</th><th>模型数</th><th>参数</th><th>验证AUC±种子SD</th><th>训练AUC</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>主要比较SPD−固定线性FC：ΔAUC +0.0326，条件95% [−0.0667,+0.1309]，4/5种子提高。副比较SPD−BrainHGT：+0.0609，[−0.0475,+0.1708]，5/5提高。确定性线性只有3个拟合，没有五个随机种子。</p><details ${methods?'open':''}><summary>输入、预算、选轮与论文比较限制</summary><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>本轮SPD以同一相关FC代替历史协方差，移除4协变量，并对齐普通损失、小批更新及选轮机会；优化器、精度和谱变换仍不同，不是纯容量消融。历史0.7756、99人OOF和本轮79人内验证不能直接排名。BrainHGT作者原论文评估ABIDE/ADNI，没有本项目SRPBS99人的官方AUC。</p></details><p class="data-note">${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','所有种子 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-papers','论文比较 ↗')} ${evidenceLink(r.id+'-decision','本轮决定 ↗')}</div></section>`;
}

function brainhgtStageAttributionOverview(){
 const r=data.brainhgt_stage_attribution;if(!r)return '';
 return `<section class="panel brainhgt-stage-attribution-overview"><h2>BrainHGT归因：先约束第一32维压缩，下一轮尚未训练</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'归因报告 ↗')} ${evidenceLink(r.id+'-comparison','完整对比 ↗')} ${evidenceLink(r.id+'-next','下一轮有限方案 ↗')}</div></section>`;
}
function brainhgtStageAttributionSection(methods=false){
 const r=data.brainhgt_stage_attribution;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.dimensions}</td><td>${v.train_loo_auc.toFixed(4)}</td><td>${v.validation_auc.toFixed(4)}</td><td>${v.train_effective_rank.toFixed(2)}</td><td>${v.validation_train_variance_ratio.toFixed(3)}</td></tr>`).join('');
 const names={original:'原模型',training_template_topology:'训练人多数拓扑',identity_community_encoder:'encoder直接恒等旁路'};
 const interventions=r.intervention_means.map(v=>`<tr><th>${names[v.variant]}</th><td>${v.train_auc.toFixed(4)}</td><td>${v.auc.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel brainhgt-stage-attribution-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="11阶段固定诊断统计"><table style="min-width:800px"><thead><tr><th>实际阶段</th><th>维数</th><th>训练留一诊断AUC</th><th>验证诊断AUC</th><th>训练有效秩</th><th>验证/训练变异比</th></tr></thead><tbody>${rows}</tbody></table></div><p>这些阶段AUC是固定类均值统计；没有优化探针，不与原模型或强FC直接排名。训练表示已用过该人的标签，留一只排除均值的自身贡献。</p><details ${methods?'open':''}><summary>两个无训练干预及归因限制</summary><p>${escapeHTML(r.details)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="冻结干预原分类器指标"><table style="min-width:650px"><thead><tr><th>冻结前向条件</th><th>训练AUC</th><th>验证AUC</th><th>Brier↓</th></tr></thead><tbody>${interventions}</tbody></table></div><p>恒等旁路引起下游分布改变，下降不证明原encoder最优。统一拓扑保持了本次排序，不证明训练期间或其他图设计没有作用。</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-next','唯一后续方案 ↗')}</div></section>`;
}

function brainhgtGeometryRegularizationOverview(){
 const r=data.brainhgt_geometry_regularization;if(!r)return '';
 return `<section class="panel brainhgt-geometry-overview"><h2>BrainHGT第一压缩层几何保持：固定配置已完成</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整结果 ↗')} ${evidenceLink(r.id+'-comparison','同条件对比 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')}</div></section>`;
}
function brainhgtGeometryRegularizationSection(methods=false){
 const r=data.brainhgt_geometry_regularization;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.models}</td><td>3309738</td><td>${v.auc.toFixed(4)}±${v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.ba.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td><td>${v.logloss.toFixed(4)}</td></tr>`).join('');
 const c=r.comparison,ci=c.conditional_delta_auc_interval;
 return `<section class="panel brainhgt-geometry-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="原模型与固定几何保持同人比较"><table style="min-width:850px"><thead><tr><th>方法</th><th>模型数</th><th>参数总数</th><th>验证AUC±种子SD</th><th>训练AUC</th><th>BA</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>主要比较：ΔAUC ${c.delta_auc>=0?'+':''}${c.delta_auc.toFixed(4)}，人员条件95% [${ci[0].toFixed(4)}, ${ci[1].toFixed(4)}]；${c.auc_positive_seeds}/5种子正向。末次、几何相似度和有效秩变化均为辅助读回，不替换主要结果。</p><details ${methods?'open':''}><summary>唯一变化、全部预算与独立核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>辅助目标只用当前训练批次，并分离上游梯度；没有新增模块、参数、协变量或目标适配。额外第一层及Gram计算有成本，同更新不等于同FLOPs。</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','所有种子 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-losses','全部损失 ↗')} ${evidenceLink(r.id+'-code','损失代码 ↗')}</div></section>`;
}

function geometryCrosscohortOverview(){
 const r=data.geometry_crosscohort;if(!r)return '';
 return `<section class="panel geometry-crosscohort-overview"><h2>几何保持跨队列：AUC方向不一致，结束迁移推广</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'复核报告 ↗')} ${evidenceLink(r.id+'-comparison','完整对比 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')}</div></section>`;
}
function geometryCrosscohortSection(methods=false){
 const r=data.geometry_crosscohort;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.original_auc.toFixed(4)}</td><td>${v.geometry_auc.toFixed(4)}</td><td>${v.delta_auc>=0?'+':''}${v.delta_auc.toFixed(4)}</td><td>[${v.delta_auc_lower95.toFixed(4)}, ${v.delta_auc_upper95.toFixed(4)}]</td><td>${v.positive_auc_seeds}/5</td><td>${v.original_brier.toFixed(4)}→${v.geometry_brier.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel geometry-crosscohort-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三个开发队列固定权重比较"><table style="min-width:850px"><thead><tr><th>队列</th><th>原AUC</th><th>几何保持AUC</th><th>ΔAUC</th><th>人员条件95%</th><th>正向seed</th><th>Brier↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>ZAN虽相对提高，平均AUC仍低于0.5，不翻转预测方向。偏头痛排序下降的条件区间低于0；概率误差改善不能代替排序收益。</p><details ${methods?'open':''}><summary>固定来源、复用范围和独立核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','所有种子 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-decision','迁移决定 ↗')}</div></section>`;
}

function srpbsTaskAuditOverview(){
 const r=data.srpbs_task_audit;if(!r)return '';
 return `<section class="panel srpbs-task-audit-overview"><h2>SRPBS来源链未见冲突，收益集中于较高头动配对</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'核对报告 ↗')} ${evidenceLink(r.id+'-comparison','完整对比 ↗')}</div></section>`;
}
function srpbsTaskAuditSection(methods=false){
 const r=data.srpbs_task_audit;if(!r)return '';
 const labels={both_low:'双方较低头动',mixed:'一高一低',both_high:'双方较高头动'};
 const rows=r.display_metrics.map(v=>`<tr><th>${labels[v.group]}</th><td>${v.original_pair_auc.toFixed(4)}</td><td>${v.geometry_pair_auc.toFixed(4)}</td><td>${v.rescued_full}/${v.lost_full}</td><td>${v.delta_auc_contribution>=0?'+':''}${v.delta_auc_contribution.toFixed(6)}</td><td>${v.positive_seeds}/5</td></tr>`).join('');
 return `<section class="panel srpbs-task-audit-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="训练中位数分组的排序变化"><table style="min-width:740px"><thead><tr><th>头动配对</th><th>原组内胜出率</th><th>几何保持胜出率</th><th>挽救/损伤</th><th>对整体ΔAUC贡献</th><th>正向种子</th></tr></thead><tbody>${rows}</tbody></table></div><p>高低仅按各训练折meanFD中位数划分，较高组仍符合原QC。组内胜出率按配对合并，与完整三折宏AUC不同；贡献可加回原ΔAUC+0.025702。CIN内部贡献−0.005128，保留该阴性。</p><details ${methods?'open':''}><summary>标签、来源与审批核对</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>37位Pain中36位有VAS，但两表的端点和MRI相对时点均未确认。疾病诊断、MRI同期痛和疗效仍是不同任务；不把HC补零。</p><p>${escapeHTML(r.verification_summary)}</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-clinical','分表量表 ↗')} ${evidenceLink(r.id+'-pairs','全部配对分组 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')}</div></section>`;
}

function motionSupportOverview(){
 const r=data.motion_support;if(!r)return '';
 return `<section class="panel motion-support-overview"><h2>不追加头动均衡训练，先测静态FC输入是否改变</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整核对 ↗')} ${evidenceLink(r.id+'-next','唯一后续有限方案 ↗')}</div></section>`;
}
function motionSupportSection(methods=false){
 const r=data.motion_support;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>内折${v.inner}</th><td>${v.people}</td><td>${v.raw_smd.toFixed(4)}</td><td>${v.raw_rank_auc.toFixed(4)}</td><td>${v.weight_min.toFixed(4)}—${v.weight_max.toFixed(4)}</td><td>${v.weighted_smd.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel motion-support-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="原三训练分区头动与拟议权重"><table style="min-width:750px"><thead><tr><th>分区</th><th>训练人</th><th>原meanFD SMD</th><th>FD直接秩胜出率</th><th>拟议权重范围</th><th>加权后连续FD SMD</th></tr></thead><tbody>${rows}</tbody></table></div><p>第一折权重全1，第三折SMD由0.0328扩大至0.1926。以上只是元数据算术，没有训练分类器；二档配平不能证明连续头动已平衡。</p><details ${methods?'open':''}><summary>旧方案、站点支持与未执行预算</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>既有动态窗内去帧、可靠性边L2和试次FD加权的阴性保持；当前静态FC仍用全部240帧。52人已有spike回归，27人无标记，先测去帧是否产生实际改变。</p><p>${escapeHTML(r.verification_summary)}</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','全分区对比 ↗')} ${evidenceLink(r.id+'-old','与旧方案的区别 ↗')} ${evidenceLink(r.id+'-next','有限候选方案 ↗')}</div></section>`;
}

function staticCensorInputOverview(){
 const r=data.static_censor_input;if(!r)return '';
 return `<section class="panel static-censor-input-overview"><h2>阶段A：静态输入改变，未见一致QC–FC下降</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(data.static_censor_auc ? "阶段A只测输入，未训练模型；后续AUC对照现已完成，结果见本页最新对比。" : r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整测量 ↗')} ${evidenceLink(r.id+'-comparison','全组对比 ↗')} ${evidenceLink(r.id+'-next','AUC对照方案与执行状态 ↗')}</div></section>`;
}
function staticCensorInputSection(methods=false){
 const r=data.static_censor_input;if(!r)return '';
 const label={all:'原79人',flagged:'52位有标记者',reused:'27位原样复用'};
 const rows=r.display_metrics.map(v=>`<tr><th>${label[v.group]}</th><td>${v.computed_fc}/${v.computed_omst}</td><td>${v.fc_max_abs_median.toFixed(5)}</td><td>${(100*v.fc_relative_frobenius_median).toFixed(3)}%</td><td>${v.binary_graph_changed}/${v.people}</td><td>${(100*v.hop_changed_fraction_median).toFixed(3)}%</td></tr>`).join('');
 return `<section class="panel static-censor-input-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(data.static_censor_auc ? "阶段A只测输入，未训练模型；后续AUC对照现已完成，结果见本页最新对比。" : r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="静态FC和对应OMST输入变化"><table style="min-width:800px"><thead><tr><th>范围</th><th>新FC/图</th><th>最大边差中位</th><th>相对Frobenius中位</th><th>二值图改变</th><th>hop变化比例中位</th></tr></thead><tbody>${rows}</tbody></table></div><p>训练FC—头动关联六项三降三升，没有一致降低。边秩仍接近原输入，二值hop变化也不代表模型输出或AUC改善；本轮模型训练与预测均0。</p><details ${methods?'open':''}><summary>固定去帧、独立核验与实际成本</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-edges','全部全边关联 ↗')} ${evidenceLink(r.id+'-verification','独立核验 ↗')} ${evidenceLink(r.id+'-next','AUC对照方案与执行状态 ↗')}</div></section>`;
}

function staticCensorAucOverview(){
 const r=data.static_censor_auc;if(!r)return '';
 return `<section class="panel static-censor-auc-overview"><h2>固定去帧输入的AUC对照已完成</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整结果 ↗')} ${evidenceLink(r.id+'-comparison','全部种子对比 ↗')} ${evidenceLink(r.id+'-decision','继续或停止依据 ↗')}</div></section>`;
}
function staticCensorAucSection(methods=false){
 const r=data.static_censor_auc;if(!r)return '';
 const name={original:'原输入（复用）',censor:'固定去帧输入'};
 const rows=r.display_metrics.map(v=>`<tr><th>${name[v.variant]}</th><td>${v.models}</td><td>${v.auc.toFixed(6)}</td><td>${v.auc_sd.toFixed(6)}</td><td>${v.ap.toFixed(6)}</td><td>${v.ba.toFixed(6)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td><td>${v.train_auc.toFixed(6)}</td><td>${v.final_auc.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel static-censor-auc-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="完整BrainHGT固定输入AUC对比"><table style="min-width:1000px"><thead><tr><th>输入</th><th>模型数</th><th>选中AUC</th><th>跨seed SD</th><th>AP</th><th>BA</th><th>Brier</th><th>logloss</th><th>训练AUC</th><th>末轮AUC</th></tr></thead><tbody>${rows}</tbody></table></div><p>15新模型、3000更新、1500次原规则选轮；全部五种子均保留。原15参照直接复用，不追加参照训练或前向。</p><details ${methods?'open':''}><summary>输入、训练预算与独立核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>阶段A训练FC—头动关联六项三降三升的阴性保持；本轮差异不能单独归因FC或OMST，也不能称头动已去除。</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','五种子指标 ↗')} ${evidenceLink(r.id+'-curves','完整曲线 ↗')} ${evidenceLink(r.id+'-verification','独立核验 ↗')}</div></section>`;
}

function censorErrorAuditOverview(){
 const r=data.censor_error_audit;if(!r)return '';
 return `<section class="panel censor-error-audit-overview"><h2>固定去帧为何没有提高AUC</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整归因 ↗')} ${evidenceLink(r.id+'-comparison','全部分组 ↗')} ${evidenceLink(r.id+'-next','站点常数方案与执行结果 ↗')}</div></section>`;
}
function censorErrorAuditSection(methods=false){
 const r=data.censor_error_audit;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${v.case_group==='same'?'同站配对':'跨站配对'}</th><td>${v.distinct_pairs}</td><td>${(100*v.macro_pair_mass).toFixed(2)}%</td><td>${v.original_auc.toFixed(6)}</td><td>${v.censor_auc.toFixed(6)}</td><td>${v.delta_auc_contribution.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel censor-error-audit-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="保存预测同站与跨站AUC差值贡献"><table style="min-width:800px"><thead><tr><th>配对</th><th>不同配对数</th><th>原宏权重</th><th>原条件AUC</th><th>新条件AUC</th><th>对总体差值贡献</th></tr></thead><tbody>${rows}</tbody></table></div><p>贡献按原三折及五seed权重相加，精确还原−0.002289；条件AUC使用配对权重归一化，不能与旧“分组AUC再三折等权平均”混用。全部31配对单元和79次少一人检查保留。</p><details ${methods?'open':''}><summary>分组、少一人及独立核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>原始终错/始终对人数22/36，去帧12/26，两类都减少；不能单凭始终错减少称鲁棒性提高。NKN仅3人，不能作可靠站点性能估计。</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-pairs','全部配对贡献 ↗')} ${evidenceLink(r.id+'-concentration','人员敏感性范围 ↗')} ${evidenceLink(r.id+'-verification','独立核验 ↗')}</div></section>`;
}

function siteScoreOffsetOverview(){
 const r=data.site_score_offset;if(!r)return '';
 return `<section class="panel site-score-offset-overview"><h2>训练侧站点常数未提高AUC，固定配置停止</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整结果 ↗')} ${evidenceLink(r.id+'-comparison','全部种子对比 ↗')} ${evidenceLink(r.id+'-decision','停止依据 ↗')}</div></section>`;
}
function siteScoreOffsetSection(methods=false){
 const r=data.site_score_offset;if(!r)return '';
 const name={original:'原模型（复用）',site_offset:'训练侧站点常数校正'};
 const rows=r.display_metrics.map(v=>`<tr><th>${name[v.variant]}</th><td>${v.models}</td><td>${v.auc.toFixed(6)}</td><td>${v.auc_sd.toFixed(6)}</td><td>${v.ap.toFixed(6)}</td><td>${v.ba.toFixed(6)}</td><td>${v.brier.toFixed(6)}</td><td>${v.logloss.toFixed(6)}</td></tr>`).join('');
 return `<section class="panel site-score-offset-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="固定模型训练侧站点常数同条件对比"><table style="min-width:900px"><thead><tr><th>条件</th><th>复用模型</th><th>AUC</th><th>跨seed SD</th><th>AP</th><th>BA</th><th>Brier</th><th>logloss</th></tr></thead><tbody>${rows}</tbody></table></div><p>同站配对变化0；跨站挽救6、损伤90个重复排序观测，不能把重复配对当新增患者。实际30训练人前向批次、790训练输出、395个算术校正验证分数；新神经训练与验证网络前向均0。</p><details ${methods?'open':''}><summary>训练侧常数、实际成本与独立核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>全部五seed负向，NKN常数按原案固定0且人员全部保留。训练侧估计未使用验证标签，小单元统计不公开个人分数。</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-offsets','全部训练常数 ↗')} ${evidenceLink(r.id+'-seeds','五种子指标 ↗')} ${evidenceLink(r.id+'-verification','独立核验 ↗')}</div></section>`;
}

function diagnosticSourceFollowupOverview(){
 const r=data.diagnostic_source_followup;if(!r)return '';
 return `<section class="panel diagnostic-source-followup-overview"><h2>来源补查完成，独立诊断就绪人数仍为0</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整补查报告 ↗')} ${evidenceLink(r.id+'-comparison','来源与评分对比 ↗')} ${evidenceLink(r.id+'-questions','来源缺项清单 ↗')}</div></section>`;
}
function diagnosticSourceFollowupData(){
 const r=data.diagnostic_source_followup;if(!r)return '';
 return `<section class="panel diagnostic-source-followup-data"><h2>独立来源与评分时点：当前0人就绪</h2><p>${escapeHTML(r.summary)}</p><p>DS005713原133QC排除、2身份HOLD保持。DS008919原MRI访问问题未解决；问卷与MRI同访视及计划先后已有来源，实际逐人评分和间隔仍缺。</p><div class="ds-foot">${evidenceLink(r.id+'-cohorts','队列与排除原因 ↗')} ${evidenceLink(r.id+'-timing','评分时点依据 ↗')} ${evidenceLink(r.id+'-questions','来源缺项清单 ↗')}</div></section>`;
}
function diagnosticSourceFollowupSection(methods=false){
 const r=data.diagnostic_source_followup;if(!r)return '';
 const rows=r.display_rows.map(v=>`<tr><th>${escapeHTML(v.item)}</th><td>${escapeHTML(v.evidence)}</td><td>${escapeHTML(v.supports)}</td><td>${escapeHTML(v.missing)}</td></tr>`).join('');
 return `<section class="panel diagnostic-source-followup-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="独立来源与真实评分时点证据对比"><table style="min-width:900px"><thead><tr><th>问题</th><th>本次证据</th><th>能支持什么</th><th>仍缺什么</th></tr></thead><tbody>${rows}</tbody></table></div><details ${methods?'open':''}><summary>公开目录、协议与失败请求</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-cohorts','已有队列与排除 ↗')} ${evidenceLink(r.id+'-gaps','临床字段缺项 ↗')} ${evidenceLink(r.id+'-requests','全部访问状态 ↗')} ${evidenceLink(r.id+'-questions','来源方问题清单 ↗')}</div></section>`;
}

function networkPairBilinearOverview(){
 const r=data.network_pair_bilinear;if(!r)return '';
 return `<section class="panel network-pair-bilinear-overview"><h2>网络对FC编码未改善AUC</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-comparison','同条件比较 ↗')}</div></section>`;
}
function networkPairBilinearSection(methods=false){
 const r=data.network_pair_bilinear;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.models}</td><td>${v.parameters}</td><td>${v.auc.toFixed(4)}${v.auc_sd===null?'':'±'+v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td><td>${v.logloss.toFixed(4)}</td></tr>`).join('');
 const comparisons=r.comparisons.map(v=>`<li>真实分组−${escapeHTML(r.display_metrics.find(x=>x.variant===v.right).label)}：ΔAUC ${v.delta_auc.toFixed(4)}，条件95% [${v.delta_auc_lower95.toFixed(4)}, ${v.delta_auc_upper95.toFixed(4)}]，${v.positive_auc_seeds}/5种子正向${v.primary?'（主要比较）':'（辅助比较）'}。</li>`).join('');
 return `<section class="panel network-pair-bilinear-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="原79人网络对编码与既有参照"><table style="min-width:800px"><thead><tr><th>方法</th><th>模型数</th><th>参数</th><th>验证AUC±种子SD</th><th>训练AUC</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><ul>${comparisons}</ul><details ${methods?'open':''}><summary>本地实现、预算与核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>这是NERVE网络对算子启发的本地监督适配。全部模型和种子均保留；固定乱序只有一次，不把5个训练种子算作5次网络分区重复。</p></details><p class="data-note">${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-curves','训练验证曲线 ↗')} ${evidenceLink(r.id+'-plan','拟合前方案 ↗')} ${evidenceLink(r.id+'-decision','停止决定 ↗')}</div></section>`;
}

function networkPairAttributionOverview(){
 const r=data.network_pair_attribution;if(!r)return '';
 return `<section class="panel network-pair-attribution-overview"><h2>网络对编码归因：先检验训练侧中心化</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整归因 ↗')} ${evidenceLink(r.id+'-next','原方案与执行结果 ↗')}</div></section>`;
}
function networkPairAttributionSection(methods=false){
 const r=data.network_pair_attribution;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.effective_rank.toFixed(2)}</td><td>${v.mean_to_person_rms.toFixed(2)}</td><td>${v.std_ratio_q90_q10.toFixed(2)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.validation_auc.toFixed(4)}</td><td>${v.contrast_to_variance_retention_ratio.toFixed(3)}</td></tr>`).join('');
 return `<section class="panel network-pair-attribution-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="网络对编码90个权重状态的归因"><table style="min-width:850px"><thead><tr><th>条件／快照</th><th>有效秩</th><th>均值／跨人RMS</th><th>std P90/P10</th><th>训练AUC</th><th>验证AUC</th><th>类差／方差保留比</th></tr></thead><tbody>${rows}</tbody></table></div><p>90/90训练特征矩阵为满中心化样本秩51/52，说明存在能分开当前训练标签的仿射读出；没有拟合这个头，也不代表验证可分。现有选轮成绩与阴性停止决定保持。</p><details ${methods?'open':''}><summary>尺度、优化、压缩与核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>本地网络对编码在固定权重下仍是受约束线性FC读出。训练类均值差保留量不能替代全部诊断信息；解析导数也不是历史Adam更新。</p></details><p>${escapeHTML(r.next)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整归因 ↗')} ${evidenceLink(r.id+'-snapshots','90个状态 ↗')} ${evidenceLink(r.id+'-seeds','全部种子 ↗')} ${evidenceLink(r.id+'-curves','末段曲线 ↗')} ${evidenceLink(r.id+'-next','原方案与执行结果 ↗')} ${evidenceLink(r.id+'-verification','独立核验 ↗')}</div></section>`;
}

function networkPairCenteringOverview(){
 const r=data.network_pair_centering;if(!r)return '';
 return `<section class="panel network-pair-centering-overview"><h2>训练侧FC中心化：自身AUC提高，仍未追上强参照</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整结果 ↗')} ${evidenceLink(r.id+'-comparison','全部比较 ↗')} ${evidenceLink(r.id+'-optimization','优化是否改善 ↗')}</div></section>`;
}
function networkPairCenteringSection(methods=false){
 const r=data.network_pair_centering;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.models}</td><td>${v.parameters}</td><td>${v.auc.toFixed(4)}${v.auc_sd===null?'':'±'+v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td><td>${v.logloss.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel network-pair-centering-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="FC中心化与原五项参照"><table style="min-width:850px"><thead><tr><th>方法</th><th>模型数</th><th>参数</th><th>验证AUC±种子SD</th><th>选轮训练AUC</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>主要比较自身旧版：ΔAUC +0.0344，条件95% [+0.0037,+0.0639]，4/5种子正向。相对固定线性FC：−0.0855，条件95% [−0.1755,+0.0084]，0/5正向。seed1的AUC与概率误差小幅恶化，seed3的概率误差微增；全部保留。</p><p>固定末轮训练AUC 0.8630→0.8970，logloss 0.6183→0.5867，五seed均改善。初始头背景/差异梯度比4.78→约1.3e-8；末轮P变化3.08%→4.00%。这支持优化改善，不等于超越强参照或独立泛化。</p><details ${methods?'open':''}><summary>唯一变更、预算与核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>旧乱序没有中心化重训，不能把与它的差异单独归因真实解剖分组。完整BrainHGT未被修改或重训，本轮增益属于此轻量网络对版本。</p></details><p class="data-note">${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','所有种子 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-optimization','全部优化状态 ↗')} ${evidenceLink(r.id+'-plan','执行前方案 ↗')} ${evidenceLink(r.id+'-decision','停止决定 ↗')}</div></section>`;
}

function brainhgtTangentTargetOverview(){
 const r=data.brainhgt_tangent_target;if(!r)return '';
 return `<section class="panel brainhgt-tangent-target-overview"><h2>BrainHGT固定切空间目标：AUC 0.7304，稳定增益未确认</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整结果 ↗')} ${evidenceLink(r.id+'-comparison','全部比较 ↗')} ${evidenceLink(r.id+'-seeds','所有种子 ↗')}</div></section>`;
}
function brainhgtTangentTargetSection(methods=false){
 const r=data.brainhgt_tangent_target;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.models}</td><td>${v.parameters}</td><td>${v.auc.toFixed(4)}${v.auc_sd===null?'':'±'+v.auc_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td><td>${v.logloss.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel brainhgt-tangent-target-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="固定切空间目标与原三项参照"><table style="min-width:850px"><thead><tr><th>方法</th><th>模型数</th><th>参数</th><th>验证AUC±种子SD</th><th>选轮训练AUC</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>主要比较旧几何版：ΔAUC +0.0146，条件95% [−0.0322,+0.0606]，4/5种子正向。相对线性FC：+0.0120，条件95% [−0.0968,+0.1248]，3/5正向。Brier与logloss均未优于这两项参照；seed0的AUC下降，全部保留。</p><p>末轮训练AUC 1.0000、验证AUC 0.6734，低于选轮0.7304。训练CKA选轮0.5113、末轮0.7250；更高几何对齐不能替代泛化证据，也不支持直接延长预算。</p><details ${methods?'open':''}><summary>唯一变更、预算与核验</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>参照零重训；线性FC保留原求解器与一次验证机会，其计算及选轮成本与神经模型不同。本轮修改完整BrainHGT的辅助损失，原FC入口、网络层和头保持。</p></details><p class="data-note">${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-seeds','所有种子 ↗')} ${evidenceLink(r.id+'-intervals','人员区间 ↗')} ${evidenceLink(r.id+'-curves','全部曲线 ↗')} ${evidenceLink(r.id+'-plan','执行前方案 ↗')} ${evidenceLink(r.id+'-decision','本配置结束 ↗')}</div></section>`;
}

function brainhgtSmallSampleReadinessOverview(){
 const r=data.brainhgt_small_sample_readiness;if(!r)return '';
 return `<section class="panel brainhgt-small-sample-readiness-overview"><h2>BrainHGT小样本准备与归因（K10已另行执行）</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整复核 ↗')} ${evidenceLink(r.id+'-comparison','固定轮次比较 ↗')} ${evidenceLink(r.id+'-next','K10原方案与执行结果 ↗')}</div></section>`;
}
function brainhgtSmallSampleReadinessSection(methods=false){
 const r=data.brainhgt_small_sample_readiness;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.auc25.toFixed(4)}</td><td>${v.auc100.toFixed(4)}</td><td>${v.delta_auc.toFixed(4)}</td><td>${v.logloss25.toFixed(4)}</td><td>${v.logloss100.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel brainhgt-small-sample-readiness-panel"><h2>BrainHGT小样本准备与归因（10月28日；K10已另行执行）</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="三方法固定25到100轮比较"><table style="min-width:780px"><thead><tr><th>方法</th><th>25轮验证AUC</th><th>100轮验证AUC</th><th>ΔAUC</th><th>25轮logloss↓</th><th>100轮logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>这是固定轮次描述，原选轮0.7304成绩保持。新目标25→100轮验证AUC仅−0.0026、五初始化3负2正，logloss五个均恶化。不能把选轮到末轮全部差距都归因训练导致的AUC下降，也不据本表重选epoch。</p><p>末轮第一Linear处辅助与CE负余弦15/15，0.1辅助/CE梯度范数比中位5.52；这是整训练集eval快照，不是历史Adam更新，负夹角可能属于正常正则行为，未证明辅助项导致泛化恶化。</p><details ${methods?'open':''}><summary>零更新范围、旧研究与K10预算</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>旧SPD的K5/K10/K20结果支持研究几何结构；原型头与跨队列预训练阴性保持。拟议K10为3折×3支持组×2初始化×2条件=36模型，每模型200更新。9份几何参考/scaler必须只用各20支持人，不能复用全52/53人统计；该准备阶段仅生成成员；36模型已另行执行，见新结果。</p></details><p class="data-note">${escapeHTML(r.boundary)}</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整复核 ↗')} ${evidenceLink(r.id+'-seeds','全部初始化 ↗')} ${evidenceLink(r.id+'-gradients','梯度快照 ↗')} ${evidenceLink(r.id+'-prior','旧研究 ↗')} ${evidenceLink(r.id+'-literature','方法来源 ↗')} ${evidenceLink(r.id+'-next','K10原方案与执行结果 ↗')}</div></section>`;
}

function brainhgtK10PilotOverview(){
 const r=data.brainhgt_k10_pilot;if(!r)return '';
 return `<section class="panel brainhgt-k10-pilot-overview"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="ds-foot">${evidenceLink(r.id,'完整结果 ↗')} ${evidenceLink(r.id+'-comparison','全部对比 ↗')} ${evidenceLink(r.id+'-technical','数值准备记录 ↗')}</div></section>`;
}
function brainhgtK10PilotSection(methods=false){
 const r=data.brainhgt_k10_pilot;if(!r)return '';
 const rows=r.display_metrics.map(v=>`<tr><th>${escapeHTML(v.label)}</th><td>${v.models}</td><td>${v.parameters}</td><td>${v.auc.toFixed(4)}±${v.auc_joint_sd.toFixed(4)}</td><td>${v.train_auc.toFixed(4)}</td><td>${v.ba.toFixed(4)}</td><td>${v.brier.toFixed(4)}</td><td>${v.logloss.toFixed(4)}</td></tr>`).join('');
 return `<section class="panel brainhgt-k10-pilot-panel"><h2>${escapeHTML(r.title)}</h2><p>${escapeHTML(r.summary)}</p><p>${escapeHTML(r.interpretation)}</p><p class="data-note">${escapeHTML(r.boundary)}</p><div class="paper-table-scroll" tabindex="0" role="region" aria-label="K10同监督预算两方法对比"><table style="min-width:920px"><thead><tr><th>方法</th><th>模型数</th><th>参数</th><th>验证AUC±支持/初始化联合SD</th><th>选轮训练AUC</th><th>BA</th><th>Brier↓</th><th>logloss↓</th></tr></thead><tbody>${rows}</tbody></table></div><p>SD来自三支持组×两初始化的六个三折均值，不能称六个独立队列或纯初始化SD。全部组和seed分列保留；K10只表示每类10名训练支持人，另有26/27标签验证人参与100次选轮。</p><details ${methods?'open':''}><summary>唯一变更、预算及数值修复</summary><p>${escapeHTML(r.details)}</p><p>${escapeHTML(r.method)}</p><p>${escapeHTML(r.verification_summary)}</p><p>首次参考准备在0模型、0更新时失败；保持算法与1e-7阈值，只将几何迭代上限30改200，失败组32次即达标。复用两个完成参考后估计余七组，共九不同支持参考、十次求解尝试；神经模型仍36个、每个200更新。未换支持人员或放宽误差。</p></details><p>原全量0.7304及不同SPD/线性FC预算只作背景，不作为K10同条件对照；原模型停止分支保持，本轮不运行K5/K20。</p><p>${escapeHTML(r.next)}</p><div class="ds-foot">${evidenceLink(r.id,'完整报告 ↗')} ${evidenceLink(r.id+'-joint','六个联合重复 ↗')} ${evidenceLink(r.id+'-initializations','两个初始化 ↗')} ${evidenceLink(r.id+'-supports','三个支持组 ↗')} ${evidenceLink(r.id+'-interval','人员区间 ↗')} ${evidenceLink(r.id+'-decision','本轮决定 ↗')}</div></section>`;
}

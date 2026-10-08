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

'use strict';



const $ = (selector) => document.querySelector(selector);

const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

let refreshTimer;

const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const statusNames = {done:'已完成', active:'进行中', blocked:'受阻', planned:'计划中', deferred:'暂缓'};

const stateNames = {PASS:'数值通过', FAILED:'技术失败', EXCLUDED:'质控排除', REPAIR_PENDING:'待复核', RUNNING:'运行中', COMPLETE:'批次结束', COMPLETE_WITH_FAILURES:'批次结束 · 有未通过', HALTED_GLOBAL_FAULT:'全局暂停', PENDING:'待处理'};

const viewNames = {overview:'项目总览', calendar:'项目日历', history:'研究历程', workflow:'项目流程', goals:'计划与目标', datasets:'数据与结果', evidence:'报告与证据'};

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

function goalCard(goal) {

  return `<button class="goal-card" data-goal="${escapeHTML(goal.id)}"><div class="goal-card-top"><span class="mono">${escapeHTML(goal.id)}</span>${badge(goal.status)}</div><h3>${escapeHTML(goalTitle(goal))}</h3><p>${escapeHTML(goalPurpose(goal))}</p><div class="goal-bottom"><span>${escapeHTML(phaseTitle(data.phases.find(p => p.id === goal.phase)))}</span><span>查看步骤与交付 ↗</span></div></button>`;

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

function researchHistoryPage() {

  const history = data.ds005713_history;

  const recent = data.research_history;

  if (!history || !recent) { $('#view-history').innerHTML = '<div class="empty">暂无研究历程。</div>'; return; }

  const sources = ids => ids.map((id, i) => evidenceLink(id, ids.length === 1 ? '查看依据 ↗' : `依据 ${i + 1} ↗`)).join(' ');

  $('#view-history').innerHTML = `<div class="page-heading"><div><h1>近期研究历程</h1></div><a class="button primary" href="/api/source/research-history-report" download="RECENT_RESEARCH_HISTORY.md">下载近期历程</a></div>

    <div class="history-meta">截至 ${escapeHTML(recent.as_of)} · 以下为历史记录，最近执行核查见总览。</div>

    <div class="history-focus"><h2>${escapeHTML(recent.focus)}</h2><p>${escapeHTML(recent.summary)}</p><div class="ds-foot"><a class="text-link" href="/qc">QC 审核 ↗</a><a class="text-link" href="#overview">执行状态 ↗</a></div></div>

    ${sectionTitle('近期进展')}

    <div class="timeline research-timeline">${recent.milestones.map(m => `<article><time>${escapeHTML(m.date)}</time><div><span class="badge ${escapeHTML(m.status)}">${escapeHTML(m.label)}</span><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.summary || m.result)}</p><details><summary>详情与依据</summary><dl><dt>结果</dt><dd>${escapeHTML(m.result)}</dd><dt>方法</dt><dd>${escapeHTML(m.method)}</dd><dt>限制</dt><dd>${escapeHTML(m.boundary)}</dd><dt>下一步</dt><dd>${escapeHTML(m.next)}</dd></dl><div class="history-sources">${sources(m.sources)}</div></details></div></article>`).join('')}</div>

    <details class="panel research-disclosure"><summary><strong>DS005713 前期成果</strong><span>样本处置、早期指标与关键节点</span></summary><div class="research-disclosure-body"><div class="history-chapter"><h2>DS005713 前期成果</h2><a class="text-link" href="/api/source/ds-stage-report" download="DS005713_STAGE_REPORT.md">下载 DS005713 摘要</a></div>

    <div class="history-meta">记录截至 ${escapeHTML(history.as_of)} · 扫描数与人数分别统计。</div>

    <article class="ds-spotlight">${dsSampleFlow()}<details class="history-detail"><summary>样本处置与依据</summary><p class="ds-disposition">${escapeHTML(history.disposition)}</p><div class="ds-foot">${evidenceLink('record', '原始记录 ↗')}<button class="text-link" data-goal="G02">来源包目标 ↗</button></div></details></article>

    ${sectionTitle('实验结果', '<span class="muted">AUC：DS005713 / Raw FC</span>')}

    <div class="result-grid">${data.results.filter(r => ['oa-report','external-report'].includes(r.source)).map(r => `<article class="panel result-card ${r.source === 'external-report' && r.title.includes('外部') ? 'negative' : ''}"><h3>${escapeHTML(r.title)}</h3><div class="result-value">${escapeHTML(r.value)}</div><span class="muted">${escapeHTML(r.metric)}</span><p>${escapeHTML(r.interpretation)}</p>${evidenceLink(r.source, '打开实验报告 ↗')}</article>`).join('')}</div>

    <div class="notice ds-conclusion"><strong>内部结果正向，外部检验未通过。</strong><p>尚不能确认外部泛化或临床有效性。</p></div>

    ${sectionTitle('关键节点')}

    <div class="timeline ds-timeline">${history.milestones.map(m => `<article><time>${escapeHTML(m.date)}</time><div><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.summary || m.detail)}</p><details class="history-detail"><summary>详情与依据</summary><p>${escapeHTML(m.detail)}</p><div class="history-sources">${sources(m.sources)}</div></details></div></article>`).join('')}</div>

    <div class="ds-foot"><a class="text-link" href="#goals">研究计划 ↗</a>${evidenceLink('ds-stage-report', '汇报摘要 ↗')}<a class="text-link" href="#overview">返回总览 ↗</a></div></div></details>`;

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

  return `<article class="panel paper-teaser recent-research"><span class="eyebrow">2026-09-20 · 历史研究记录</span><h2>头动与临床表已整理，影像增量仍待证据</h2><p>153 人、36,504 帧头动已核对；44 名评分患者是 SRPBS99 的子集。低维连接、动态状态及临床联合比较已完成，原切空间仍为开发参照。</p><p class="paper-caution">sup7 临床模型 MAE 16.18，加入动态影像后为 17.64；sup8 的联合改善区间跨零。评分时点仍待确认，不能据此发布临床分级。</p><div class="ds-foot"><a class="button primary" href="#datasets?tab=results">查看最新比较 ↗</a>${evidenceLink('research-20260920-motion','头动与临床完整报告 ↗')}${evidenceLink('research-20260920-index','9月16—20日成果目录 ↗')}</div></article>`;

}

function recentResearchSection(methods=false) {

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

  const counts = goalCounts();

  const c = data.clinical;

  const inventory = data.pretrained_pain?.input_inventory;

  const priorities = inventory?.priorities || [];

  const resultCards = [

    ['来源外推', data.pooled_external_preparation?.result?.summary || data.pooled_external_preparation?.summary],

    ['预训练与小样本', data.pretrained_pain?.summary],

    ['疼痛任务', data.prt_classification?.summary || data.prt_modality?.summary]

  ].filter(([, summary]) => summary);

  $('#view-overview').innerHTML = `

    <div class="page-heading"><div><span class="eyebrow">NEUROGRAPH · RESEARCH</span><h1>项目总览</h1><p class="muted">研究进度、主要结论与下一步安排。</p></div><span class="overview-date">记录整理于 ${escapeHTML(data.reviewed_at)}</span></div>

    <section class="panel current-focus"><span class="eyebrow">当前任务</span><h2>${escapeHTML(data.focus_title)}</h2><p class="reading-current-note">${escapeHTML(data.focus_description)}</p><div class="ds-foot"><a class="button primary" href="#goals">查看计划</a><a class="button" href="#datasets?tab=results">查看全部结果</a>${inventory?.normalization_block_diagnostic?.manuscript_integration ? evidenceLink('migraine-normalization-20261007-manuscript-appendix','训练完整表 ↗') : inventory?.source ? evidenceLink(inventory.source,'处理记录 ↗') : ''}</div><details class="stage-record"><summary>展开完整阶段记录与历史截点</summary><p>${escapeHTML(inventory?.summary || data.focus_description)}</p></details><details><summary>研究重点与审核边界</summary><p>${escapeHTML(data.focus_description)}</p><p class="data-note">${escapeHTML(inventory?.boundary || '内部开发结果与独立验证分别记录。')}</p></details></section>

    ${researchReadingGuide(data)}
    ${priorities.length ? `<div class="priority-grid">${priorities.map((p,i)=>`<article class="panel"><span class="priority-number">0${i+1}</span><h3>${escapeHTML(p.title)}</h3><p>${escapeHTML(p.summary)}</p></article>`).join('')}</div>` : ''}

    <div class="metrics compact-metrics"><div class="metric"><span>研究目标完成</span><div><strong>${counts.done}</strong><small>/ ${data.goals.length} 项</small></div>${progressTrack(counts.done,data.goals.length,'目标完成度')}<p>完成实验包含阴性结果</p></div><div class="metric"><span>正在推进</span><div><strong>${counts.active}</strong><small>项</small></div><p>${counts.blocked} 项受阻 · ${counts.planned} 项待开展</p></div><div class="metric"><span>已归档临床数值通过</span><div><strong>${c.numeric_pass}</strong><small>/ ${c.inventory} 人</small></div><p>快照 ${timeText(c.progress_as_of)} · 不是本轮新增人数</p></div><div class="metric"><span>已归档训练接入</span><div><strong>${c.training_ready}</strong><small>人</small></div><p>${c.training_evidence_status === 'REAL_DATA_SMOKE_ONLY' ? '仅流程测试，正式性能待评估' : '以各实验记录和划分为准'}</p></div></div>

    ${sectionTitle('主要研究结论','<a class="text-link" href="#datasets?tab=results">完整比较与限制 ↗</a>')}

    <div class="overview-results">${resultCards.map(([title,summary])=>`<article class="panel"><h3>${escapeHTML(title)}</h3><p>${escapeHTML(summary)}</p></article>`).join('')}</div>

    <article class="workflow-teaser"><a href="#workflow" tabindex="-1" aria-hidden="true"><img src="./workflow-execution.svg" alt="" width="210" height="154"></a><div><span class="eyebrow">研究流程与后续扩展</span><h2>查看项目如何执行</h2><p>影像处理、迁移学习、多模态与 Agent 规划。</p></div><a class="button" href="#workflow">打开流程图 ↗</a></article>

    ${sectionTitle('下一步','<a href="#goals" class="text-link">全部目标 ↗</a>')}<div class="next-grid">${(data.student_workflow?.next_goal_ids || data.next_goal_ids).slice(0,3).map(id => goalCard(data.goals.find(g => g.id === id))).join('')}</div>

    ${researchDisclosure('历史执行与样本口径','按各自核查时间阅读；页面刷新不代表重新核查远端',executionPanel()+queuePanel()+`<div class="panel clinical-strip"><h2>候选样本与训练接入</h2><p>${c.inventory} 人元数据；候选上限 ${c.classification_candidates} 人，数值通过 ${c.numeric_pass} 人，人工确认 ${c.visual_accepted} 人，训练接入 ${c.training_ready} 人。</p><p class="data-note">${escapeHTML(c.note)}</p></div>`)}

    ${researchDisclosure('前期成果','DS005713 来源包与早期迁移实验',dsSpotlight())}`;

}



function workflowFigure(name, title, description, transcript) {

  return `<article class="workflow-figure" aria-labelledby="${name}-title"><div class="workflow-figure-heading"><div><h2 id="${name}-title">${title}</h2><p>${description}</p></div><div class="workflow-actions"><a class="button" href="./${name}.svg" target="_blank" rel="noopener" aria-label="放大查看${title}（新标签页）">放大查看 ↗</a><a class="button" href="./${name}.png" download>下载 PNG</a><a class="text-link" href="./${name}.svg" download>SVG</a></div></div><div class="workflow-image-scroll" tabindex="0" role="region" aria-label="${title}，窄屏可横向滚动"><img src="./${name}.svg" alt="${description}" width="1440" height="${name === 'workflow-execution' ? 1060 : 1200}" aria-describedby="${name}-text"></div><details class="workflow-transcript" id="${name}-text"><summary>阅读流程文字</summary>${transcript}</details></article>`;

}

function workflowPage() {

  $('#view-workflow').innerHTML = `<div class="page-heading"><div><h1>项目流程</h1><p class="muted">从当前研究主线，到多模态与 Agent 扩展。</p></div><a class="button" href="#overview">← 返回总览</a></div>

    <div class="workflow-context"><span>流程快照 · 2026-09-09</span><span>手机可左右滑动图片，也可放大或下载。</span></div>

    ${workflowFigure('workflow-execution', '研究执行流程', '沿箭头 01 → 06 阅读。来源预训练与99/96开发性分类完成；置换完成，增益未确立，医院准备并行，新的独立验证待完成。', '<ol><li>影像与标签接入：无标签来源与临床目标分别管理，量表口径继续核对。</li><li>预处理与质量审核：本批处理及人工确认完成，科学排除与时点暂缓保留。</li><li>共同表示：AAL90 脑区时序与 90×90 功能连接。</li><li>迁移学习：源域预训练与目标训练折适配，五条来源训练与99/96开发性分类已完成，完整置换完成，增益未确立。</li><li>疼痛任务：研究侧首选PTN及七日日最严重NRS均值回归；公开分类已比较，再评估 masked-loss 双任务。</li><li>独立验证：医院病种、标签、协议与现场准备并行，不等待模型完成；需取得新的独立队列，历史 SRPBS 外部主要检验未通过。</li></ol>')}

    ${workflowFigure('workflow-roadmap', '多模态与 Agent 规划', '多模态融合和 Agent 系统尚未实现；图中虚线表示后续扩展。Agent 分工为此前建议方案；瞳孔需先论证，三维场景重建列远期。', '<ol><li>多模态输入：既有 T1 / 静息态 fMRI 与临床量表基础，瞳孔信号和病历文本为扩展规划。</li><li>融合：核对匿名 ID、采集时点和缺失模态，再比较单模态、简单融合与复杂模型。</li><li>Agent 协作：数据 Agent 整理库存；质控 Agent 提交异常；实验 Agent 执行既定比较；证据 Agent 汇总有出处的结果。</li><li>工具：复用预处理脚本、QC 网页、训练程序和项目记录；既有脚本不等同于 Agent 系统。</li><li>人工决策：研究者负责视觉审核、标签定义、实验方案和结论确认。</li><li>输出与应用：分类、连续严重度、脑连接解释及研究报告；独立验证支持后再评估复杂 GNN、LLM 与 EMR/PACS。</li></ol>')}

    <div class="workflow-sources"><span>图示依据</span>${evidenceLink('meeting-20260908', '会议核对与行动 ↗')}${evidenceLink('hospital-requirements', '医院需求草案 ↗')}${evidenceLink('original-plan', '实施路线 ↗')}${evidenceLink('record', '最新研究记录 ↗')}<button class="text-link" data-goal="G19">扩展目标 G19 ↗</button><a class="text-link" href="#goals">完整计划 ↗</a></div>`;

}



function goalsPage() {

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

  return rows.map(row => `<tr>

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

  return `<section class="panel dataset-registry" aria-labelledby="dataset-registry-title">

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

    $('#research-content').innerHTML=`${datasetRegistryPanel()}<h2>原有数据概况</h2><p class="data-note">以下折叠项保留原有归档口径；上方清单按照会议要求，把数据集、任务、材料和缺口放在同一张可筛选表中。</p><div class="research-dataset-list">${data.datasets.map(d=>researchDisclosure(d.name,d.tag,`<h3>已有证据</h3><p>${escapeHTML(d.summary)}</p><h3>用途与限制</h3><p>${escapeHTML(d.boundary)}</p><div class="ds-foot">${d.sources.map(s=>evidenceLink(s, data.sources.find(x=>x.id===s).label.split(' · ')[0]+' ↗')).join(' ')}</div>`)).join('')}</div><details class="panel research-disclosure"><summary>临床标签与历史口径</summary><p class="data-note">9月3日说明：临床表可按匿名编号连接影像；旧编号不可再匹配，两项需分别处理。</p>${sectionTitle('临床标签', `<span class="muted">审计 ${escapeHTML(data.clinical.as_of)}</span>`)}<div class="panel table-panel"><table><thead><tr><th>组别</th><th>疼痛</th><th>健康</th><th>卒中</th><th>疼痛评分</th><th>疼痛问卷</th></tr></thead><tbody>${data.clinical.groups.map(g=>`<tr><td><strong>${escapeHTML(g.name)}</strong></td><td>${g.pain}</td><td>${g.healthy}</td><td>${g.stroke}</td><td>${escapeHTML(g.vas)}</td><td>${escapeHTML(g.sfmpq)}</td></tr>`).join('')}</tbody></table><p class="table-note">${escapeHTML(data.clinical.note)} 卒中不归入无痛对照；数字不代替量表定义。</p></div></details>`;

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

function renderView() { ({overview,calendar:calendarPage,history:researchHistoryPage,workflow:workflowPage,goals:goalsPage,datasets:datasetsPage,evidence:evidencePage})[view](); archiveRoute(); }

function openDialog(eyebrow, content) {

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

      $('#source-content').innerHTML=linkedReport(preview.content,source)+(preview.truncated ? '<p class="notice">仅预览前200 KB。请下载公开文件查看完整数据。</p>' : '');

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

    $('#footer-time').textContent=(window.NEUROGRAPH_PUBLIC ? '公开版本生成 ' : '本地读取 ')+timeText(data.served_at);

    $('#collection-policy').textContent=window.NEUROGRAPH_PUBLIC ? '各结果按报告日期阅读 · 此站不运行训练或远端采集' : data.remote.enabled ? '本地记录 30 分钟刷新 · 远端队列 30 分钟采集' : '本地记录 30 分钟刷新 · 远端自动采集关闭';

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

 return `<div aria-label="新输入核查${mode}"><h3>${g.normalization_block_diagnostic?.manuscript_integration ? '132人训练完成，后续诊断没有一致预训练优势' : '10月3日：偏头痛候选队列输入逐人处理中'}</h3><p>${escapeHTML(g.summary)}</p>${developmentBBR}${omniRuntime}${developmentReal}${developmentSpace}${tokenDynamics}${realTokens}${nonlinearInput}${biasBBR}${brainRepair}${taskAdapt}${modern}${expansion}${graph}${items}${identityVisitTable}${transferTable}${targetScalingTable}${multiTable}${studyTable}${volumeTable}${volume?.boundary?`<p class="data-note">${escapeHTML(volume.boundary)}</p>`:''}<p class="data-note">${escapeHTML(g.boundary)}</p><p>${escapeHTML(g.next)}</p>${g.priorities?.length?`<ol aria-label="当前三项优先投入">${g.priorities.map(r=>`<li><strong>${escapeHTML(r.title)}：</strong>${escapeHTML(r.summary)}</li>`).join('')}</ol>`:''}${g.volume_source?evidenceLink(g.volume_source,'阅读体积表示完整比较 ↗'):''} ${g.result_source?evidenceLink(g.result_source,'阅读79人完整比较结果 ↗'):''} ${g.validation_source?evidenceLink(g.validation_source,'阅读新验证数据需求 ↗'):''} ${evidenceLink(g.source,'阅读结构提取启动报告 ↗')} ${g.goal_source?evidenceLink(g.goal_source,'阅读整合后的研究目标 ↗'):''} ${g.audit_source?evidenceLink(g.audit_source,'阅读SPM输入复核报告 ↗'):''} ${g.batch_source?evidenceLink(g.batch_source,'阅读偏头痛批量输入阶段记录 ↗'):''}</div>`;

}


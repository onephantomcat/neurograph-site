'use strict';
window.ResearchGoals = (() => {
  const state = {query: '', group: 'all', status: 'all', ready: false};
  let context;
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const names = {done: '已完成', planned: '拟开展', blocked: '等待条件', conditional: '条件任务'};
  const label = task => `<span class="research-task-state state-${html(task.status)}">${names[task.status]}</span>`;
  function selectTasks(catalog) {
    const needle = state.query.trim().toLocaleLowerCase();
    return catalog.tasks.filter(task => (state.group === 'all' || task.parent === state.group) &&
      (state.status === 'all' || task.status === state.status) && (!state.ready || task.ready) &&
      [task.id, task.title, task.scope, task.deliverable, task.criteria, task.role, task.blocker, ...(task.detailed_ids || []),
        catalog.groups.find(group => group.id === task.parent).title].join(' ').toLocaleLowerCase().includes(needle));
  }
  function renderResults() {
    const {catalog} = context;
    const tasks = selectTasks(catalog);
    document.getElementById('research-goal-count').textContent = `显示 ${tasks.length} / ${catalog.tasks.length} 项二级任务`;
    document.getElementById('research-goal-results').innerHTML = catalog.groups.map(group => {
      const visible = tasks.filter(task => task.parent === group.id);
      if (!visible.length) return '';
      const completed = catalog.tasks.filter(task => task.parent === group.id && task.status === 'done').length;
      return `<details class="research-goal-group" ${state.group !== 'all' || state.query ? 'open' : ''}>
        <summary><span><small>${html(group.id)}</small> ${html(group.title)}</span><span class="research-goal-meta">${completed}项已有产物 · 一级目标${html(group.status)} · 展开${visible.length}项任务</span></summary>
        <div class="research-goal-body"><p>${html(group.scope)}</p><p><strong>一级验收标准：</strong>${html(group.criteria)}</p>
        <div class="research-goal-table" tabindex="0" role="region" aria-label="${html(group.title)}二级任务，窄屏可横向滚动"><table>
          <thead><tr><th>二级目标</th><th>状态</th><th>交付物</th><th>前置条件</th></tr></thead>
          <tbody>${visible.map(task => `<tr><th scope="row"><button class="text-link" data-research-task="${html(task.id)}">${html(task.id)} ${html(task.title)}</button></th><td>${label(task)}</td><td>${html(task.deliverable)}</td><td>${task.depends_on.length ? task.depends_on.map(id => `<button class="text-link" data-research-task="${html(id)}">${html(id)}</button>`).join('、') : '按本项输入要求'}${task.ready ? '<small class="research-task-ready">含可先开展的详细步骤</small>' : ''}</td></tr>`).join('')}</tbody>
        </table></div></div></details>`;
    }).join('') || '<p class="panel">没有符合当前筛选条件的任务。</p>';
  }
  function show(catalog, sources, present) {
    if (!catalog?.tasks?.length) throw new Error('Research goal catalog is missing');
    context = {catalog, sources, present};
    const root = document.getElementById('view-goals');
    root.innerHTML = `<div class="page-heading"><div><h1>计划与目标</h1><p>以申请书交付为目标，按研究记录安排后续任务。</p></div><a class="button primary" href="./PROJECT_GOALS.csv" download>下载100项目标CSV</a></div>
      <p><a href="./PROJECT_GOALS_DETAILED_2026-11-04.csv" download>下载360项详细档案</a> · 每项保留源详细任务编号及逐步骤状态。</p>
      <p class="research-goal-boundary">${html(catalog.note)} 整理于${html(catalog.reviewed_at)}；进度依据按任务分别注明日期，未进行服务器实时检查。</p>
      <div class="research-goal-toolbar"><label>搜索任务<input id="research-goal-search" type="search" placeholder="任务、队列、模型或交付物" value="${html(state.query)}"></label>
      <label>一级目标<select id="research-goal-group"><option value="all">全部${catalog.groups.length}个目标</option>${catalog.groups.map(group => `<option value="${html(group.id)}">${html(group.id)} ${html(group.title)}</option>`).join('')}</select></label>
      <label>任务状态<select id="research-goal-status"><option value="all">全部状态</option>${Object.entries(names).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}</select></label>
      <label class="research-ready-filter"><input id="research-goal-ready" type="checkbox" ${state.ready ? 'checked' : ''}>仅看含可开展步骤的任务</label>
      <button class="button" id="research-goal-reset">清除筛选</button><span id="research-goal-count" role="status"></span></div>
      <p class="research-goal-boundary">任务之间通过编号引用依赖，可跨一级目标协同推进。前置条件用于整项验收，详细步骤可以按各自依赖先行。负责人和目标日期留在CSV中填写；可开展步骤不代替研究审批。</p><div id="research-goal-results"></div>`;
    root.querySelector('#research-goal-group').value = state.group;
    root.querySelector('#research-goal-status').value = state.status;
    root.querySelector('#research-goal-search').addEventListener('input', event => {state.query = event.target.value; renderResults();});
    root.querySelector('#research-goal-group').addEventListener('change', event => {state.group = event.target.value; renderResults();});
    root.querySelector('#research-goal-status').addEventListener('change', event => {state.status = event.target.value; renderResults();});
    root.querySelector('#research-goal-ready').addEventListener('change', event => {state.ready = event.target.checked; renderResults();});
    root.querySelector('#research-goal-reset').addEventListener('click', () => {Object.assign(state, {query: '', group: 'all', status: 'all', ready: false}); show(catalog, sources, present);});
    renderResults();
  }
  function openTask(id) {
    if (!context) return false;
    const {catalog, sources, present} = context;
    const task = catalog.tasks.find(item => item.id === id);
    if (!task) return false;
    const group = catalog.groups.find(item => item.id === task.parent);
    const evidence = [...new Map(task.steps.map(step => [step.evidence, step])).values()].map(step => {
      const source = sources.find(item => item.repo_path === step.evidence);
      return source ? `<p><button class="text-link" data-source="${html(source.id)}">${html(step.evidence)}</button></p>` : `<p><a href="${html(step.evidence_url)}" target="_blank" rel="noopener">${html(step.evidence)}</a></p>`;
    }).join('');
    present(`${html(group.id)} ${html(group.title)}`, `${label(task)}<h2>${html(task.id)} ${html(task.title)}</h2>
      <p>${html(task.scope)}</p><div class="detail-block"><h3>交付物</h3><p>${html(task.deliverable)}</p><h3>验收标准</h3><p>${html(task.criteria)}</p><h3>详细步骤</h3>${task.steps.map(step => `<details><summary>${html(step.id)} ${html(step.title)} ${label(step)}</summary><p>交付物：${html(step.deliverable)}</p><p>验收标准：${html(step.criteria)}</p><p>详细前置任务：${html(step.depends_on.join('、') || '无')}</p><p>${html(step.next_action)}</p></details>`).join('')}</div>
      <div class="detail-block"><h3>前置任务</h3>${task.depends_on.length ? task.depends_on.map(dep => {
        const item = catalog.tasks.find(candidate => candidate.id === dep);
        return `<p><button class="text-link" data-research-task="${html(dep)}">${html(dep)} ${html(item.title)}</button> ${label(item)}</p>`;
      }).join('') : '<p>无已登记任务依赖，仍须满足本项输入要求。</p>'}<p>${html(task.blocker)}</p><h3>下一步行动</h3><p>${html(task.next_action)}</p></div>
      <div class="detail-block"><h3>${html(task.evidence_kind)}</h3><p>${html(task.progress)}</p><p>证据日期：${html(task.evidence_date)}；任务整理日期：${html(task.reviewed_at)}。</p>${evidence}<p>${html(task.decision)}</p></div>
      <div class="detail-block"><h3>一级验收标准</h3><p>${html(group.criteria)}</p><p>建议角色：${html(task.role)}。负责人及目标日期由团队在CSV中指定。</p></div>`);
    return true;
  }
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-research-task]');
    if (target) openTask(target.dataset.researchTask);
  });
  return {show, openTask, selectTasks};
})();

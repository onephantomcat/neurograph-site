'use strict';
window.WorkflowTasks = (() => {
  const state = {query: '', group: 'all', status: 'all', ready: false};
  const pinKey = 'ng.workflow.tasks.pinned.v1';
  let pinned = new Set();
  try {
    const saved = JSON.parse(localStorage.getItem(pinKey) || '[]');
    if (Array.isArray(saved)) pinned = new Set(saved);
  } catch {}
  let context;
  const html = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const names = {done: '已完成', planned: '拟开展', blocked: '等待条件', conditional: '条件任务'};
  const label = task => `<span class="research-task-state state-${html(task.status)}">${names[task.status]}</span>`;
  function selectTasks(catalog) {
    const needle = state.query.trim().toLocaleLowerCase();
    const exactId = catalog.tasks.some(task => task.id.toLocaleLowerCase() === needle);
    return catalog.tasks.filter(task => (state.group === 'all' || task.parent === state.group) &&
      (state.status === 'all' || task.status === state.status) && (!state.ready || task.ready) &&
      (!exactId || task.id.toLocaleLowerCase() === needle) &&
      [task.id, task.title, task.scope, task.action, task.deliverable, task.criteria, task.role, task.blocker,
        ...(task.detailed_ids || []), ...(task.legacy_ids || []), ...(task.conditions || []),
        catalog.groups.find(group => group.id === task.parent).title].join(' ').toLocaleLowerCase().includes(needle));
  }
  function renderResults() {
    const {catalog} = context;
    const tasks = selectTasks(catalog);
    document.getElementById('research-goal-count').textContent = `显示 ${tasks.length} / ${catalog.tasks.length} 项Agent任务`;
    document.getElementById('research-goal-results').innerHTML = catalog.groups.map(group => {
      const visible = tasks.filter(task => task.parent === group.id)
        .sort((a, b) => Number(pinned.has(b.id)) - Number(pinned.has(a.id)));
      if (!visible.length) return '';
      const completed = catalog.tasks.filter(task => task.parent === group.id && task.status === 'done').length;
      return `<details class="research-goal-group" ${state.group !== 'all' || state.query ? 'open' : ''}>
        <summary><span><small>${html(group.id)}</small> ${html(group.title)}</span><span class="research-goal-meta">原研究${group.history_done}个步骤完成 · 新交付${completed}项验收 · 展开${visible.length}项任务</span></summary>
        <div class="research-goal-body"><p>${html(group.scope)}</p><p><strong>一级验收标准：</strong>${html(group.criteria)}</p>
        <div class="research-goal-table" tabindex="0" role="region" aria-label="${html(group.title)}二级任务，窄屏可横向滚动"><table>
          <thead><tr><th>Agent任务</th><th>状态</th><th>交付物</th><th>前置条件</th></tr></thead>
          <tbody>${visible.map(task => `<tr><th scope="row"><button class="text-link" data-research-task="${html(task.id)}">${html(task.id)} ${html(task.title)}</button><small class="research-task-ready">${task.effort.total}工作点 · ${html(task.role)}</small><button type="button" class="text-link" data-wf-pin="${html(task.id)}" aria-pressed="${pinned.has(task.id)}">${pinned.has(task.id) ? '取消置顶' : '置顶'}</button></th><td>${label(task)}</td><td>${html(task.deliverable)}</td><td>${task.depends_on.map(id => `<button class="text-link" data-research-task="${html(id)}">${html(id)}</button>`).join('、')}${task.conditions.length ? `<p>外部条件：${html(task.conditions.join('、'))}</p>` : ''}${!task.depends_on.length && !task.conditions.length ? '可读取公开输入开始' : ''}${task.ready ? '<small class="research-task-ready">当前可分派</small>' : ''}</td></tr>`).join('')}</tbody>
        </table></div></div></details>`;
    }).join('') || '<p class="panel">没有符合当前筛选条件的任务。</p>';
  }
  function setContext(catalog, sources, present) {
    if (!catalog?.tasks?.length) throw new Error('Research goal catalog is missing');
    context = {catalog, sources, present};
  }
  function show(root, group, ready) {
    const {catalog} = context;
    Object.assign(state, {query: '', group, status: 'all', ready});
    root.innerHTML = `
      <p class="research-goal-downloads"><a href="./AGENT_TASK_REVIEW.csv" download>原100项逐项审查</a><a href="./AGENT_CONDITIONS.csv" download>外部条件清单</a><a href="./PROJECT_GOALS_100_2026-11-04.csv" download>原100项档案</a><a href="./PROJECT_GOALS_DETAILED_2026-11-04.csv" download>360项详细档案</a></p>
      <details class="research-goal-boundary"><summary>工作点与档案说明</summary><p>${html(catalog.note)} 整理于${html(catalog.reviewed_at)}。</p><p>${html(catalog.workload_policy)} 既有研究成果${catalog.history.completed_steps}项。</p></details>
      <div class="research-goal-toolbar"><label>搜索任务<input id="research-goal-search" type="search" placeholder="任务、队列、模型或交付物" value="${html(state.query)}"></label>
      <label>一级目标<select id="research-goal-group"><option value="all">全部${catalog.groups.length}个目标</option>${catalog.groups.map(group => `<option value="${html(group.id)}">${html(group.id)} ${html(group.title)}</option>`).join('')}</select></label>
      <label>任务状态<select id="research-goal-status"><option value="all">全部状态</option>${Object.entries(names).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')}</select></label>
      <label class="research-ready-filter"><input id="research-goal-ready" type="checkbox" ${state.ready ? 'checked' : ''}>仅看当前可分派任务</label>
      <button class="button" id="research-goal-reset">清除筛选</button><span id="research-goal-count" role="status"></span></div>
      <div id="research-goal-results"></div>`;
    root.querySelector('#research-goal-group').value = state.group;
    root.querySelector('#research-goal-status').value = state.status;
    root.querySelector('#research-goal-search').addEventListener('input', event => {state.query = event.target.value; renderResults();});
    root.querySelector('#research-goal-group').addEventListener('change', event => {state.group = event.target.value; renderResults();});
    root.querySelector('#research-goal-status').addEventListener('change', event => {state.status = event.target.value; renderResults();});
    root.querySelector('#research-goal-ready').addEventListener('change', event => {state.ready = event.target.checked; renderResults();});
    root.querySelector('#research-goal-reset').addEventListener('click', () => show(root, 'all', false));
    renderResults();
  }
  function openTask(id) {
    if (!context) return false;
    const {catalog, sources, present} = context;
    const task = catalog.tasks.find(item => item.id === id);
    if (!task) return false;
    const group = catalog.groups.find(item => item.id === task.parent);
    const evidence = task.inputs.map(path => {
      const source = sources.find(item => item.repo_path === path);
      const url = `https://github.com/onephantomcat/Fmri/blob/${catalog.source_revision}/${path}`;
      return source ? `<p><button class="text-link" data-source="${html(source.id)}">${html(path)}</button></p>` : `<p><a href="${html(url)}" target="_blank" rel="noopener">${html(path)}</a></p>`;
    }).join('');
    present(`${html(group.id)} ${html(group.title)}`, `${label(task)}<h2>${html(task.id)} ${html(task.title)}</h2>
      <a class="button" href="#workflow?task=${encodeURIComponent(task.id)}" data-wf-jump>查看任务依赖图</a>
      <p>${html(task.scope)}</p><div class="detail-block"><h3>执行动作</h3><p>${html(task.action)}</p><h3>交付物</h3><p>${html(task.deliverable)}</p><h3>验收方法</h3><p>${html(task.criteria)}</p><h3>单次执行范围</h3><p>${html(task.limit)}</p></div>
      <div class="detail-block"><h3>工作量估计</h3><p>准备${task.effort.preparation}点 + 执行${task.effort.execution}点 + 验证${task.effort.verification}点 = ${task.effort.total}工作点。</p><p>${html(task.effort_basis)}</p><p>${html(task.compute)}</p><p>点数用于相对分派，尚无本任务实际耗时。Agent有效时间、人工有效时间、工具调用和返工在CSV中另行记录。</p></div>
      <div class="detail-block"><h3>前置任务</h3>${task.depends_on.length ? task.depends_on.map(dep => {
        const item = catalog.tasks.find(candidate => candidate.id === dep);
        return `<p><button class="text-link" data-research-task="${html(dep)}">${html(dep)} ${html(item.title)}</button> ${label(item)}</p>`;
      }).join('') : '<p>无前置Agent交付。</p>'}<h3>外部条件</h3>${task.conditions.map(id => {
        const item = catalog.conditions.find(condition => condition.id === id);
        return `<p><strong>${html(item.id)} ${html(item.title)}</strong> · ${html(item.status)}</p><p>${html(item.provider)}：${html(item.criteria)}</p>`;
      }).join('') || '<p>可读取公开输入准备；科研交付仍需组内复核。</p>'}<p>${html(task.blocker)}</p><h3>下一步行动</h3><p>${html(task.next_action)}</p></div>
      <div class="detail-block"><h3>${html(task.evidence_kind)}</h3><p>${html(task.progress)}</p><p>证据日期：${html(task.evidence_date)}；任务整理日期：${html(task.reviewed_at)}。</p>${evidence}<p>${html(task.decision)}</p></div>
      <div class="detail-block"><h3>可交给Agent的执行说明</h3><textarea class="research-task-prompt" readonly aria-label="Agent执行说明">${html(task.prompt)}</textarea><p>上游输入、真实执行及验收均完成后才登记本任务完成。</p><h3>原研究步骤映射</h3><p>${html(task.detailed_ids.join('、'))}</p><p>来源旧任务：${html(task.legacy_ids.join('、'))}。</p></div>
      <div class="detail-block"><h3>一级验收标准</h3><p>${html(group.criteria)}</p><p>建议能力：${html(task.role)}。负责人及目标日期由团队在CSV中指定。</p></div>`);
    return true;
  }
  document.addEventListener('click', event => {
    const pin = event.target.closest('[data-wf-pin]');
    if (pin) {
      const id = pin.dataset.wfPin;
      const openGroups = [...document.querySelectorAll('.research-goal-group')].map(item => item.open);
      if (pinned.has(id)) pinned.delete(id);
      else pinned.add(id);
      try { localStorage.setItem(pinKey, JSON.stringify([...pinned])); } catch {}
      renderResults();
      document.querySelectorAll('.research-goal-group').forEach((item, index) => { item.open = openGroups[index]; });
      document.querySelector(`[data-wf-pin="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
    }
    const target = event.target.closest('[data-research-task]');
    if (target) openTask(target.dataset.researchTask);
    const link = event.target.closest('[data-wf-jump]');
    if (link) {
      document.getElementById('detail-dialog').close();
      document.getElementById('workflow-taskbook')?.close();
    }
  });
  return {setContext, show, openTask};
})();

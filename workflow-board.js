'use strict';

window.WorkflowBoard = (() => {
  const lanes = [
    ['研究输入', ['P01', 'P02', 'P03', 'P04', 'P10', 'P11']],
    ['模型研究', ['P05', 'P06', 'P07', 'P18', 'P14']],
    ['临床终点与融合', ['P08', 'P09', 'P12', 'P13']],
    ['验证与交付', ['P15', 'P16', 'P17']],
  ];
  const width = 238;
  const height = 120;
  const columnGap = 64;
  const rowGap = 28;
  const margin = 26;
  const top = 58;
  const storeKey = 'ng.workflow.board.v1';
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));

  function makeGraph(catalog) {
    const tasks = new Map(catalog.tasks.map(task => [task.id, task]));
    const groups = new Map(catalog.groups.map(group => [group.id, { ...group, tasks: [] }]));
    const conditions = new Map(catalog.conditions.map(condition => [condition.id, condition]));
    const edges = [];
    const groupEdges = new Map();
    for (const task of tasks.values()) {
      groups.get(task.parent).tasks.push(task);
      for (const id of task.depends_on) {
        const previous = tasks.get(id);
        edges.push({ from: id, to: task.id });
        if (previous.parent === task.parent) continue;
        const key = previous.parent + ':' + task.parent;
        if (!groupEdges.has(key)) groupEdges.set(key, { from: previous.parent, to: task.parent, pairs: [] });
        groupEdges.get(key).pairs.push({ from: id, to: task.id });
      }
      for (const id of task.conditions) edges.push({ from: id, to: task.id, external: true });
    }
    return { tasks, groups, conditions, edges, groupEdges: [...groupEdges.values()] };
  }

  function groupNode(group) {
    const ready = group.tasks.filter(task => task.ready).length;
    const accepted = group.tasks.filter(task => task.status === 'done').length;
    return {
      id: group.id, title: group.title, group: true,
      badge: ready ? ready + '项可分派' : '等待前置',
      note: group.tasks.length + '项任务 · 新交付验收' + accepted + '项',
      foot: '已有研究步骤 ' + group.history_done + '项',
      waiting: !ready,
    };
  }

  function taskNode(task, selected) {
    return {
      id: task.id, title: task.title, selected,
      badge: task.ready ? '可分派' : ({done: '已验收', conditional: '条件任务', blocked: '等待条件', planned: '待执行'})[task.status],
      note: task.deliverable, foot: task.effort.total + '工作点',
      waiting: !task.ready && task.status !== 'done',
    };
  }

  function taskColumns(graph, task) {
    const upstream = task.depends_on.map(id => taskNode(graph.tasks.get(id)));
    const external = task.conditions.map(id => {
      const item = graph.conditions.get(id);
      return { id, title: item.title, badge: item.status, note: item.provider, foot: '外部条件', waiting: true, external: true };
    });
    const downstream = graph.edges.filter(edge => edge.from === task.id).map(edge => taskNode(graph.tasks.get(edge.to)));
    return [
      ['前置交付与外部条件', [...upstream, ...external]],
      ['当前任务', [taskNode(task, true)]],
      ['直接后续任务', downstream],
    ];
  }

  function readOffsets() {
    try {
      return new Map(Object.entries(JSON.parse(localStorage.getItem(storeKey) || '{}') || {}));
    } catch {
      return new Map();
    }
  }

  const offsets = readOffsets();

  function saveOffsets() {
    try { localStorage.setItem(storeKey, JSON.stringify(Object.fromEntries(offsets))); } catch {}
  }

  function draw(canvas, columns, edges, focus) {
    const bases = new Map();
    const rects = new Map();
    const sceneWidth = margin * 2 + width * columns.length + columnGap * (columns.length - 1);
    const sceneHeight = top + Math.max(...columns.map(([, nodes]) => nodes.length)) * (height + rowGap) + 18;
    const cards = columns.map(([title, nodes], col) => {
      const x = margin + col * (width + columnGap);
      const heading = `<h2 class="wf-lane" style="left:${x}px">${esc(title)}</h2>`;
      return heading + nodes.map((node, row) => {
        const y = top + row * (height + rowGap);
        bases.set(node.id, { x, y });
        const attr = node.group ? 'data-wf-group' : node.external ? 'data-wf-condition' : node.selected ? 'data-research-task' : 'data-wf-task';
        return `<button type="button" class="wf-node${node.waiting ? ' is-planned' : ''}${node.id === focus || node.selected ? ' is-selected' : ''}" ${attr}="${esc(node.id)}" data-wf-node="${esc(node.id)}" style="width:${width}px;height:${height}px">
          <span class="wf-node-top"><b class="wf-no">${esc(node.id)}</b><span class="wf-status">${esc(node.badge)}</span></span>
          <strong class="wf-card-title">${esc(node.title)}</strong><span class="wf-card-note">${esc(node.note)}</span>
          <span class="wf-node-foot">${esc(node.foot)}</span></button>`;
      }).join('');
    }).join('');
    canvas.style.width = sceneWidth + 'px';
    canvas.style.height = sceneHeight + 'px';
    canvas.innerHTML = cards;
    const drawLinks = CardConnections.layer(canvas, 'wf-links', 'wf-link-layer');
    const connections = edges.map(edge => ({ ...edge, future: edge.external }));
    const nodes = [...canvas.querySelectorAll('[data-wf-node]')];

    function place(node, dx, dy) {
      const id = node.dataset.wfNode;
      const base = bases.get(id);
      const x = clamp(base.x + dx, 12, sceneWidth - width - 12);
      const y = clamp(base.y + dy, top, sceneHeight - height - 12);
      node.style.left = x + 'px';
      node.style.top = y + 'px';
      rects.set(id, { x, y, w: width, h: height });
    }

    const redraw = () => drawLinks(connections, rects);
    function restorePositions() {
      for (const node of nodes) {
        const saved = offsets.get(node.dataset.wfNode);
        const valid = Number.isFinite(saved?.dx) && Number.isFinite(saved?.dy);
        place(node, valid ? saved.dx : 0, valid ? saved.dy : 0);
      }
      redraw();
    }

    let dragging = false;
    for (const node of nodes) {
      let suppressClick = false;
      node.addEventListener('pointerdown', event => {
        if (!event.isPrimary || event.button !== 0 || dragging) return;
        dragging = true;
        suppressClick = false;
        const id = node.dataset.wfNode;
        const original = rects.get(id);
        const base = bases.get(id);
        const scale = canvas.getBoundingClientRect().width / sceneWidth;
        let frame = 0;
        CardConnections.drag(node, event, {
          move(dx, dy) {
            node.classList.add('is-dragging');
            place(node, original.x - base.x + dx / scale, original.y - base.y + dy / scale);
            if (!frame) frame = requestAnimationFrame(() => { frame = 0; redraw(); });
          },
          finish(moved, canceled) {
            dragging = false;
            cancelAnimationFrame(frame);
            node.classList.remove('is-dragging');
            suppressClick = moved;
            if (!moved || !node.isConnected) return;
            if (canceled) {
              place(node, original.x - base.x, original.y - base.y);
            } else {
              const { x, y } = rects.get(id);
              offsets.set(id, { dx: x - base.x, dy: y - base.y });
              saveOffsets();
            }
            redraw();
          },
        });
      });
      node.addEventListener('click', event => {
        if (!suppressClick || !event.detail) return;
        event.stopPropagation();
        suppressClick = false;
      });
    }
    restorePositions();
    return {
      width: sceneWidth, height: sceneHeight,
      reset() {
        for (const id of bases.keys()) offsets.delete(id);
        saveOffsets();
        restorePositions();
      },
    };
  }

  function controls(board, canvas) {
    let scale = 1, x = 0, y = 0;
    const apply = () => { canvas.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; };
    function fit(scene, target) {
      scale = clamp(Math.min((board.clientWidth - 20) / scene.width, (board.clientHeight - 48) / scene.height), .57, 1);
      x = Math.max(10, (board.clientWidth - scene.width * scale) / 2);
      y = Math.max(8, (board.clientHeight - 38 - scene.height * scale) / 2);
      if (target) {
        const viewWidth = board.clientWidth;
        const viewHeight = board.clientHeight - 44;
        if (scene.width * scale > viewWidth) x = clamp(viewWidth / 2 - (target.offsetLeft + width / 2) * scale, viewWidth - scene.width * scale - 10, 10);
        if (scene.height * scale > viewHeight) y = clamp(viewHeight / 2 - (target.offsetTop + height / 2) * scale, viewHeight - scene.height * scale - 8, 8);
      }
      apply();
    }
    function zoom(factor, px, py) {
      const next = clamp(scale * factor, .25, 2.4);
      x = px - (px - x) * next / scale;
      y = py - (py - y) * next / scale;
      scale = next;
      apply();
    }
    board.addEventListener('wheel', event => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      const rect = board.getBoundingClientRect();
      zoom(Math.exp(-event.deltaY * .002), event.clientX - rect.left, event.clientY - rect.top);
    }, { passive: false });
    board.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0 || event.target.closest('button, a')) return;
      const startX = x, startY = y;
      CardConnections.drag(board, event, {
        move(dx, dy) {
          board.classList.add('is-panning');
          x = startX + dx;
          y = startY + dy;
          apply();
        },
        finish() { board.classList.remove('is-panning'); },
      });
    });
    board.addEventListener('keydown', event => {
      if (event.target !== board) return;
      const shift = { ArrowLeft: [48, 0], ArrowRight: [-48, 0], ArrowUp: [0, 48], ArrowDown: [0, -48] }[event.key];
      if (!shift) return;
      event.preventDefault();
      x += shift[0];
      y += shift[1];
      apply();
    });
    return { fit, zoom };
  }

  let focus = 'P04';
  let resizeObserver;
  function mount(root, catalog, sources, present, params) {
    const graph = makeGraph(catalog);
    const task = graph.tasks.get(params.get('task'));
    const ready = catalog.tasks.filter(item => item.ready).length;
    const groupOptions = catalog.groups.map(group => `<option value="${esc(group.id)}">${esc(group.id)} ${esc(group.title)}</option>`).join('');
    root.innerHTML = `<div class="page-heading"><div><span class="wf-eyebrow">NEUROGRAPH / WORKFLOW</span>
      <h1>项目流程</h1><p>${catalog.groups.length}个研究目标 · ${catalog.tasks.length}项Agent任务 · ${catalog.conditions.length}项外部条件 · ${ready}项可分派</p></div>
      <button type="button" class="button primary" data-wf-book>打开任务书</button></div>
      <div class="wf-toolbar">${task ? '<a class="button" href="#workflow">返回目标全图</a>' : `<label>查看目标连线<select id="wf-focus">${groupOptions}<option value="all">全部跨目标连接</option></select></label>`}
      ${task ? `<button type="button" class="button" data-research-task="${esc(task.id)}">查看 ${esc(task.id)} 详情</button>` : '<button type="button" class="button" data-wf-ready>查看可分派任务</button>'}
      <a class="button" href="./PROJECT_GOALS.csv" download>下载任务 CSV</a></div>
      <div class="workflow-board" tabindex="0" aria-label="${task ? '任务依赖画布' : '研究目标画布'}"><div class="workflow-canvas"></div>
      <div class="wf-legend"><span><i></i>前置交付 → 后续任务</span>${task ? '<span><i class="is-future"></i>外部条件</span>' : ''}</div>
      <div class="wf-zoom"><button type="button" data-zoom="in" aria-label="放大">+</button><button type="button" data-zoom="out" aria-label="缩小">−</button><button type="button" data-zoom="reset" class="is-reset">复位</button></div></div>
      <p class="wf-caption">${task ? '显示本任务的全部直接前置、外部条件及直接后续。点击相邻任务可继续追踪。' : '主题分栏用于浏览。箭头表示目标下具体任务的依赖，连接依据可展开核对。点击目标打开任务书。'} 拖动卡片调整位置，拖动空白处平移画布。</p>
      <details class="wf-connection-list"><summary>查看连线依据</summary><div></div></details>
      <dialog id="workflow-taskbook" class="wf-taskbook-dialog" aria-labelledby="wf-book-title"><div class="wf-sheet-head"><h2 id="wf-book-title">任务书</h2><button type="button" class="wf-sheet-close" aria-label="关闭任务书">×</button></div><div class="wf-book-content"></div></dialog>`;
    const board = root.querySelector('.workflow-board');
    const canvas = root.querySelector('.workflow-canvas');
    const book = root.querySelector('#workflow-taskbook');
    const nav = controls(board, canvas);
    const selector = root.querySelector('#wf-focus');
    const details = root.querySelector('.wf-connection-list div');
    const taskLink = id => graph.tasks.has(id)
      ? `<a href="#workflow?task=${encodeURIComponent(id)}">${esc(id)} ${esc(graph.tasks.get(id).title)}</a>`
      : `${esc(id)} ${esc(graph.conditions.get(id).title)}`;
    WorkflowTasks.setContext(catalog, sources, present);
    let scene;
    function fit(center = false) {
      if (!board.clientWidth) return;
      const id = task?.id || (center && focus !== 'all' ? focus : '');
      const node = id && canvas.querySelector(`[data-research-task="${CSS.escape(id)}"], [data-wf-group="${CSS.escape(id)}"]`);
      nav.fit(scene, node);
    }
    function render(center = false) {
      const columns = task ? taskColumns(graph, task) : lanes.map(([name, ids]) => [name, ids.map(id => groupNode(graph.groups.get(id)))]);
      const edges = task ? graph.edges.filter(edge => edge.from === task.id || edge.to === task.id) :
        graph.groupEdges.filter(edge => focus === 'all' || edge.from === focus || edge.to === focus);
      scene = draw(canvas, columns, edges, task?.id || focus);
      fit(center);
      details.innerHTML = edges.map(edge => {
        if (task) return `<p>${taskLink(edge.from)} → ${taskLink(edge.to)}</p>`;
        return `<details><summary>${esc(graph.groups.get(edge.from).title)} → ${esc(graph.groups.get(edge.to).title)}（${edge.pairs.length}条任务依赖）</summary>
          ${edge.pairs.map(pair => `<p>${taskLink(pair.from)} → ${taskLink(pair.to)}</p>`).join('')}</details>`;
      }).join('') || '<p>当前没有直接连线。</p>';
    }
    if (selector) {
      selector.value = focus;
      selector.addEventListener('change', () => { focus = selector.value; render(true); });
    }
    function showBook(group = 'all', onlyReady = false) {
      book.querySelector('h2').textContent = group === 'all' ? 'Agent任务书' : graph.groups.get(group).title + ' · 任务书';
      WorkflowTasks.show(book.querySelector('.wf-book-content'), group, onlyReady);
      if (!book.open) book.showModal();
    }
    book.querySelector('.wf-sheet-close').addEventListener('click', () => book.close());
    book.addEventListener('close', () => {
      if (location.hash === '#workflow?list=1') history.replaceState(null, '', '#workflow');
    });
    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!button) return;
      if (button.hasAttribute('data-wf-book')) showBook(task?.parent || 'all');
      if (button.hasAttribute('data-wf-ready')) showBook('all', true);
      if (button.dataset.wfGroup) {
        focus = button.dataset.wfGroup;
        selector.value = focus;
        render(true);
        canvas.querySelector(`[data-wf-group="${CSS.escape(focus)}"]`).focus({ preventScroll: true });
        showBook(focus);
      }
      if (button.dataset.wfTask) location.hash = 'workflow?task=' + encodeURIComponent(button.dataset.wfTask);
      if (button.dataset.wfCondition) {
        const item = graph.conditions.get(button.dataset.wfCondition);
        present('外部条件', `<h2>${esc(item.id)} ${esc(item.title)}</h2><p>${esc(item.status)} · ${esc(item.provider)}</p><p>${esc(item.criteria)}</p>`);
      }
      if (button.dataset.zoom === 'reset') {
        scene.reset();
        fit();
      }
      if (button.dataset.zoom === 'in') nav.zoom(1.2, board.clientWidth / 2, board.clientHeight / 2);
      if (button.dataset.zoom === 'out') nav.zoom(1 / 1.2, board.clientWidth / 2, board.clientHeight / 2);
    }, { signal: resetMountListener() });
    board.addEventListener('dblclick', event => { if (!event.target.closest('button')) fit(); });
    render();
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(() => fit());
    resizeObserver.observe(board);
    if (params.get('list') === '1') showBook();
  }

  let mountListener;
  function resetMountListener() {
    mountListener?.abort();
    mountListener = new AbortController();
    return mountListener.signal;
  }

  return { mount };
})();

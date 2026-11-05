/* ==========================================================================
   项目流程 · 主题浏览画布
   布局顺序（按需求固定）：
     1. 每个模块只有逻辑位置（分区 / 行 / 列 / 跨列），没有像素坐标
     2. 由逻辑位置生成矩形形状
     3. 由矩形得到四角 + 四边中点共 8 个锚点
     4. 内容在矩形内排版，行高由该行最高内容决定
     5. 连线只走锚点，方向由相对位置决定（水平 / 垂直 / 正交折线）
   ========================================================================== */
(() => {
  'use strict';

  const scriptBase = new URL('.', document.currentScript.src);
  const MAP_URL = new URL('workflow-map.json', scriptBase);
  const DATA_URL = new URL('data/dashboard.json', scriptBase);
  const VIEW = '#view-workflow';

  /* ---- 1. 逻辑位置 ------------------------------------------------------ */
  const MODULES = [
    { id: '01', zone: 'main', row: 0, col: 0, title: '影像与标签接入', status: '已建立', tone: 'done',
      points: ['ABIDE / DS005713 无标签来源', 'SRPBS 影像与匿名临床表', '量表定义与尺度仍需核对'] },
    { id: '02', zone: 'main', row: 0, col: 1, title: '预处理与质量审核', status: '本批已完成', tone: 'done',
      points: ['T1 配准 · 功能像处理', '数值 QC → 研究者视觉确认', '保留科学排除与时点暂缓'] },
    { id: '03', zone: 'main', row: 0, col: 2, title: '共同脑连接表示', status: '已跑通', tone: 'done',
      points: ['AAL90：90 脑区时序', '90×90 FC / Fisher-z', '来源与目标角色分别管理'] },
    { id: '04', zone: 'main', row: 0, col: 3, title: '表征学习与迁移', status: '来源训练完成', tone: 'done',
      points: ['源域预训练 → 目标训练折适配', 'Raw FC / SSL / 固定来源对照', '五条来源训练完成，比较已执行'] },
    { id: '05', zone: 'main', row: 0, col: 4, title: '分类与严重度预测', status: '分类已比较', tone: 'done',
      points: ['分类已比较，置换完成，增益未确立', '量表定义明确后再做连续回归', '分级与双任务依单任务证据推进'] },
    { id: '06', zone: 'main', row: 0, col: 5, title: '新的独立队列验证', status: '队列待取得', tone: 'future',
      points: ['检验泛化、误差与不确定性', 'PTN / NRS，院方待确认', '历史 SRPBS 外部检验未通过'] },

    { id: 'in-brain', zone: 'plan', row: 0, col: 0, no: 'IN·1', title: '脑影像', status: '既有影像流程', tone: 'plan',
      points: ['T1 / 静息态 fMRI'] },
    { id: 'in-scale', zone: 'plan', row: 0, col: 1, no: 'IN·2', title: '临床量表', status: '已审计 · 口径待核', tone: 'plan',
      points: ['VAS / SF-MPQ2'] },
    { id: 'in-pupil', zone: 'plan', row: 0, col: 2, no: 'IN·3', title: '瞳孔信号', status: '待论证 · 尚未采集', tone: 'plan',
      points: ['设备 / 光照 / 采样 / 同步'] },
    { id: 'in-text', zone: 'plan', row: 0, col: 3, no: 'IN·4', title: '病历文本', status: '待论证 · 尚未采集', tone: 'plan',
      points: ['脱敏文本与临床定义'] },

    { id: 'fusion', zone: 'plan', row: 1, col: 0, span: 4, no: 'P·1', title: '多模态对齐与融合', status: '规划', tone: 'plan',
      points: ['匿名 ID 与采集时点对齐 → 缺失模态处理 → 各模态编码 → 融合表示',
               '对比单模态、简单融合与复杂模型，只有可验证的增益才进入后续方案。'] },
    { id: 'agent', zone: 'plan', row: 2, col: 0, span: 4, no: 'P·2', title: 'Agent 协作层', status: '建议架构 · 未实现', tone: 'plan',
      points: ['数据 Agent · 质控 Agent · 实验 Agent · 证据 Agent',
               '编排任务 → 调用工具 → 读取结果 → 记录证据；研究者负责审核与结论确认。'] },
    { id: 'output', zone: 'plan', row: 3, col: 0, span: 4, no: 'P·3', title: '研究输出', status: '完成独立验证后扩展', tone: 'plan',
      points: ['疼痛状态分类 / 连续严重度预测 / 脑连接解释 / 有依据的研究报告'] },
  ];

  /* ---- 2. 布局参数（逻辑 → 形状） -------------------------------------- */
  const L = {
    padX: 56,
    padTop: 158,
    padBottom: 68,
    nodeW: 250,
    colGap: 24,
    rowGap: 34,
    zoneGap: 164,
    headGap: 96,
  };
  const MAIN_COLS = 6;
  const PLAN_COLS = 4;
  const MAIN_W = MAIN_COLS * L.nodeW + (MAIN_COLS - 1) * L.colGap;
  const PLAN_W = PLAN_COLS * L.nodeW + (PLAN_COLS - 1) * L.colGap;
  const PLAN_X = L.padX + (MAIN_W - PLAN_W) / 2;

  const state = {
    map: null,
    dashboard: null,
    zoom: 1,
    x: 0,
    y: 0,
    overlay: null,
    active: null,
    lastFocus: null,
    suppressClick: false,
    size: { w: 0, h: 0 },
    content: { w: 0, h: 0 },
    baseRects: null,
    offsets: {},
  };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  /* ---- 3. 数据 ---------------------------------------------------------- */
  function loadMap() {
    if (!state.map) {
      state.map = fetch(MAP_URL, { cache: 'no-cache' })
        .then((response) => (response.ok ? response.json() : { modules: {} }))
        .catch(() => ({ modules: {} }));
    }
    return state.map;
  }

  function loadDashboard() {
    if (!state.dashboard) {
      state.dashboard = fetch(DATA_URL, { cache: 'force-cache' })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          const index = new Map();
          for (const item of data?.research_history?.milestones || []) {
            index.set(item.id || `${item.date}|${item.title}`, item);
          }
          return index;
        })
        .catch(() => new Map());
    }
    return state.dashboard;
  }

  /* ---- 4. 形状：行分组 → 矩形 ------------------------------------------ */
  const ROWS = [
    { zone: 'main', row: 0 },
    { zone: 'plan', row: 0 },
    { zone: 'plan', row: 1 },
    { zone: 'plan', row: 2 },
    { zone: 'plan', row: 3 },
  ];

  function rowModules(zone, row) {
    return MODULES.filter((m) => m.zone === zone && m.row === row);
  }

  function baseX(module) {
    if (module.zone === 'main') return L.padX + module.col * (L.nodeW + L.colGap);
    return PLAN_X + module.col * (L.nodeW + L.colGap);
  }

  /* ---- 5. 8 个锚点 ------------------------------------------------------ */
  function anchors(rect) {
    const { x, y, w, h } = rect;
    return {
      tl: [x, y], tc: [x + w / 2, y], tr: [x + w, y],
      ml: [x, y + h / 2], mr: [x + w, y + h / 2],
      bl: [x, y + h], bc: [x + w / 2, y + h], br: [x + w, y + h],
    };
  }

  /* ---- 6. 渲染 ---------------------------------------------------------- */
  function nodeHTML(module) {
    const foot = module.zone === 'plan' ? '' : '<span class="wf-node-foot">已登记 <b>0</b> 项工作</span>';
    return `<div class="wf-node${module.tone === 'future' || module.tone === 'plan' ? ' is-planned' : ''}"
      role="button" tabindex="0" data-module="${esc(module.id)}" data-count="0"
      aria-label="${esc(module.title)}，${esc(module.status)}">
      <span class="wf-node-top"><span class="wf-no">${esc(module.no || module.id)}</span><span class="wf-status">${esc(module.status)}</span></span>
      <h3>${esc(module.title)}</h3>
      <ul class="wf-points">${module.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul>
      ${foot}
    </div>`;
  }

  function layout(canvas) {
    // 先按内容自然高度渲染，再按行统一高度，最后定位。
    const nodes = new Map();
    for (const module of MODULES) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = nodeHTML(module).trim();
      const node = wrapper.firstElementChild;
      node.style.left = '0px';
      node.style.top = '0px';
      node.style.width = `${module.span ? PLAN_W : L.nodeW}px`;
      node.style.height = 'auto';
      node.style.visibility = 'hidden';
      canvas.append(node);
      nodes.set(module.id, node);
    }

    const heights = new Map();
    for (const { zone, row } of ROWS) {
      const items = rowModules(zone, row);
      const max = Math.max(...items.map((m) => nodes.get(m.id).offsetHeight));
      heights.set(`${zone}:${row}`, max);
    }

    let y = L.padTop;
    let previousZone = null;
    const rects = new Map();
    for (const { zone, row } of ROWS) {
      const items = rowModules(zone, row);
      const h = heights.get(`${zone}:${row}`);
      if (previousZone && zone !== previousZone) y += L.zoneGap - L.rowGap;
      for (const module of items) {
        const w = module.span ? PLAN_W : L.nodeW;
        const x = module.span ? PLAN_X : baseX(module);
        rects.set(module.id, { x, y, w, h });
      }
      y += h + L.rowGap;
      previousZone = zone;
    }

    for (const [id, rect] of rects) {
      const node = nodes.get(id);
      node.style.left = `${rect.x}px`;
      node.style.top = `${rect.y}px`;
      node.style.width = `${rect.w}px`;
      node.style.height = `${rect.h}px`;
      node.style.visibility = 'visible';
    }

    const right = Math.max(...[...rects.values()].map((r) => r.x + r.w));
    const bottom = Math.max(...[...rects.values()].map((r) => r.y + r.h));
    const content = { w: right + L.padX, h: bottom + L.padBottom };
    // 画布比内容大一圈，模块可以拖出原网格而不被裁掉
    const size = { w: content.w + 260, h: content.h + 260 };
    state.size = size;
    state.content = content;
    return { rects, content, size, y };
  }

  function pathsFor(rects) {
    const paths = [];
    const link = (from, to, cls = '', gap = 9) => {
      const [x1, y1] = from;
      const [x2, y2] = to;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const ex = x2 - (dx / len) * gap;
      const ey = y2 - (dy / len) * gap;
      const marker = cls ? 'wf-arrow-future' : 'wf-arrow';
      return `<path d="M ${x1} ${y1} L ${ex} ${ey}"${cls ? ` class="${cls}"` : ''} marker-end="url(#${marker})"/>`;
    };

    const main = MODULES.filter((m) => m.zone === 'main').sort((a, b) => a.col - b.col);
    for (let i = 0; i < main.length - 1; i += 1) {
      const a = anchors(rects.get(main[i].id));
      const b = anchors(rects.get(main[i + 1].id));
      paths.push(link(a.mr, b.ml, i === main.length - 2 ? 'is-future' : ''));
    }

    // 医院准备并行：04 底部中点向下 → 横向 → 06 底部中点（箭头指回 06）
    const n04 = rects.get('04');
    const n06 = rects.get('06');
    const a04 = anchors(n04);
    const a06 = anchors(n06);
    const laneY = Math.max(a04.bc[1], a06.bc[1]) + 30;
    paths.push(`<path class="is-future" d="M ${a04.bc[0]} ${a04.bc[1]} L ${a04.bc[0]} ${laneY} L ${a06.bc[0]} ${laneY} L ${a06.bc[0]} ${a06.bc[1] + 9}" marker-end="url(#wf-arrow-future)"/>`);

    const inputs = MODULES.filter((m) => m.zone === 'plan' && m.row === 0);
    const fusion = rects.get('fusion');
    const agent = rects.get('agent');
    const output = rects.get('output');
    for (const module of inputs) {
      const a = anchors(rects.get(module.id));
      paths.push(`<path d="M ${a.bc[0]} ${a.bc[1]} L ${a.bc[0]} ${fusion.y - 9}" marker-end="url(#wf-arrow)"/>`);
    }
    paths.push(link(anchors(fusion).bc, anchors(agent).tc, 'is-future'));
    paths.push(link(anchors(agent).bc, anchors(output).tc, 'is-future'));

    return paths.join('');
  }

  function linksSVG() {
    return `<svg class="wf-links" viewBox="0 0 ${state.size.w} ${state.size.h}" aria-hidden="true">
      <defs>
        <marker id="wf-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8" fill="none" stroke="#8fb4d8" stroke-width="1.5"/>
        </marker>
        <marker id="wf-arrow-future" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8" fill="none" stroke="#d0a877" stroke-width="1.5"/>
        </marker>
      </defs>
      <g class="wf-link-layer"></g>
    </svg>`;
  }

  /* ---- 偏移：拖动后的模块位置，写入 localStorage ----------------------- */
  const STORE_KEY = 'ng.workflow.board.v1';

  function loadOffsets() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return raw && typeof raw === 'object' ? raw : {};
    } catch (_) {
      return {};
    }
  }

  function saveOffsets() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state.offsets)); } catch (_) {}
  }

  function currentRects() {
    const rects = new Map();
    for (const [id, rect] of state.baseRects || []) {
      const offset = state.offsets[id] || { dx: 0, dy: 0 };
      rects.set(id, { x: rect.x + offset.dx, y: rect.y + offset.dy, w: rect.w, h: rect.h });
    }
    return rects;
  }

  function applyNodePositions(canvas) {
    const rects = currentRects();
    for (const node of canvas.querySelectorAll('.wf-node')) {
      const rect = rects.get(node.dataset.module);
      if (!rect) continue;
      node.style.left = `${rect.x}px`;
      node.style.top = `${rect.y}px`;
    }
    const layer = canvas.querySelector('.wf-link-layer');
    if (layer) layer.innerHTML = pathsFor(rects);
  }

  function bindNodeDrag(canvas) {
    for (const node of canvas.querySelectorAll('.wf-node')) {
      node.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        const id = node.dataset.module;
        const base = state.offsets[id] || { dx: 0, dy: 0 };
        const startX = event.clientX;
        const startY = event.clientY;
        let moved = false;
        let frame = null;
        const move = (ev) => {
          const dx = (ev.clientX - startX) / state.zoom;
          const dy = (ev.clientY - startY) / state.zoom;
          if (!moved && Math.hypot(dx, dy) < 3) return;
          moved = true;
          node.classList.add('is-dragging');
          state.suppressClick = true;
          state.offsets[id] = { dx: base.dx + dx, dy: base.dy + dy };
          if (!frame) {
            frame = requestAnimationFrame(() => {
              frame = null;
              applyNodePositions(canvas);
            });
          }
          ev.preventDefault();
        };
        const up = () => {
          window.removeEventListener('pointermove', move);
          window.removeEventListener('pointerup', up);
          node.classList.remove('is-dragging');
          if (moved) {
            saveOffsets();
            setTimeout(() => { state.suppressClick = false; }, 260);
          }
        };
        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', up, { once: true });
      });
    }
  }

  function zoneHeads(rects) {
    const mainTop = rects.get('01').y;
    const planTop = rects.get('in-brain').y;
    return `
      <div class="wf-zone-head is-main" style="left:${L.padX}px;top:${mainTop - L.headGap}px">
        <span class="wf-eyebrow">NEUROGRAPH / 研究主线</span>
        <h2>从脑影像到疼痛研究证据</h2>
        <p>99/96 开发性分类完成；医院准备与公开数据研究并行。</p>
      </div>
      <div class="wf-zone-head is-plan" style="left:${L.padX}px;top:${planTop - L.headGap}px">
        <span class="wf-eyebrow">NEUROGRAPH / 多模态 × AGENT</span>
        <h2>从单一影像主线，走向多模态研究协作</h2>
        <p>临床字段与协议先整理；瞳孔、融合与 Agent 待论证，三维场景重建远期调研。</p>
      </div>`;
  }

  function branch(rects) {
    const n04 = rects.get('04');
    const laneY = n04.y + n04.h + 30;
    return `<div class="wf-branch" style="left:${L.padX}px;top:${laneY - 15}px">
      <strong>医院准备并行</strong>PTN / NRS → 3T 协议建议 → 院方回填与现场核对。分类完成不等于外部验证。</div>`;
  }

  function legend() {
    return `<div class="wf-legend"><span><i></i>已开展</span><span><i class="is-future"></i>待执行</span><span>截至 2026-09-09</span></div>`;
  }

  function zoomControls() {
    return `<div class="wf-zoom">
      <button type="button" data-zoom="in" aria-label="放大">+</button>
      <button type="button" data-zoom="out" aria-label="缩小">−</button>
      <button type="button" data-zoom="reset" class="is-reset" aria-label="适配窗口">复位</button>
    </div>`;
  }

  function basis() {
    return `<p class="wf-basis">依据：9 月 8 日会议核对及会后研究记录，9 月 9 日整理；图示不代表实时运行状态。</p>`;
  }

  /* ---- 7. 缩放与平移 ---------------------------------------------------- */
  function applyTransform(canvas) {
    canvas.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
  }

  function fit(board, canvas, animate = false) {
    const width = board.clientWidth;
    const height = board.clientHeight;
    const { w, h } = state.content;
    const scale = Math.min(width / w, height / h) * 0.97;
    state.zoom = clamp(scale, 0.3, 1.2);
    state.x = (width - w * state.zoom) / 2;
    state.y = (height - h * state.zoom) / 2;
    if (animate) {
      canvas.classList.add('is-fitting');
      setTimeout(() => canvas.classList.remove('is-fitting'), 360);
    }
    applyTransform(canvas);
  }

  function bindZoom(board, canvas) {
    board.addEventListener('wheel', (event) => {
      event.preventDefault();
      const rect = board.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      const next = clamp(state.zoom * Math.exp(-event.deltaY * 0.0014), 0.3, 2.4);
      if (next === state.zoom) return;
      state.x = mx - (mx - state.x) * (next / state.zoom);
      state.y = my - (my - state.y) * (next / state.zoom);
      state.zoom = next;
      applyTransform(canvas);
    }, { passive: false });

    board.addEventListener('dblclick', (event) => {
      if (event.target.closest('.wf-node')) return;
      fit(board, canvas, true);
    });

    for (const button of board.querySelectorAll('[data-zoom]')) {
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        const action = button.dataset.zoom;
        if (action === 'reset') {
          state.offsets = {};
          saveOffsets();
          applyNodePositions(canvas);
          return fit(board, canvas, true);
        }
        const next = clamp(state.zoom * (action === 'in' ? 1.2 : 1 / 1.2), 0.3, 2.4);
        const rect = board.getBoundingClientRect();
        const mx = rect.width / 2;
        const my = rect.height / 2;
        state.x = mx - (mx - state.x) * (next / state.zoom);
        state.y = my - (my - state.y) * (next / state.zoom);
        state.zoom = next;
        applyTransform(canvas);
      });
    }
  }

  function bindPan(board, canvas) {
    let pan = null;
    const move = (event) => {
      if (!pan) return;
      const dx = event.clientX - pan.x;
      const dy = event.clientY - pan.y;
      if (!pan.moved && Math.hypot(dx, dy) < 4) return;
      pan.moved = true;
      state.suppressClick = true;
      state.x = pan.ox + dx;
      state.y = pan.oy + dy;
      applyTransform(canvas);
    };
    const up = () => {
      if (!pan) return;
      const moved = pan.moved;
      pan = null;
      board.classList.remove('is-panning');
      window.removeEventListener('pointermove', move);
      if (moved) setTimeout(() => { state.suppressClick = false; }, 260);
    };
    board.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('.wf-node, .wf-zoom, .wf-legend, a, button')) return;
      pan = { x: event.clientX, y: event.clientY, ox: state.x, oy: state.y, moved: false };
      state.suppressClick = false;
      board.classList.add('is-panning');
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('pointercancel', up, { once: true });
    });
  }

  /* ---- 8. 节点浮层：待办任务书 ---------------------------------------- */
  const TASKS_URL = new URL('workflow-tasks.json', scriptBase);
  const PIN_KEY = 'ng.workflow.tasks.pinned.v1';
  let tasksData = null;
  let taskbook = { filter: 'todo', bucket: { todo: [], done: [] }, pinned: new Set(), module: null };

  function loadTasks() {
    if (!tasksData) {
      tasksData = fetch(TASKS_URL, { cache: 'no-cache' })
        .then((response) => (response.ok ? response.json() : { modules: {} }))
        .catch(() => ({ modules: {} }));
    }
    return tasksData;
  }

  function loadPinned() {
    try {
      const raw = JSON.parse(localStorage.getItem(PIN_KEY) || '[]');
      return new Set(Array.isArray(raw) ? raw : []);
    } catch (_) {
      return new Set();
    }
  }

  function savePinned() {
    try { localStorage.setItem(PIN_KEY, JSON.stringify([...taskbook.pinned])); } catch (_) {}
  }

  function ensureOverlay() {
    if (state.overlay) return state.overlay;
    const overlay = document.createElement('div');
    overlay.className = 'wf-overlay';
    overlay.innerHTML = `
      <div class="wf-sheet wf-taskbook" role="dialog" aria-modal="true" aria-labelledby="wf-sheet-title">
        <div class="wf-sheet-head">
          <div><h2 id="wf-sheet-title"></h2><p id="wf-sheet-sub"></p></div>
          <button type="button" class="wf-sheet-close" aria-label="关闭">×</button>
        </div>
        <div class="wf-tb-body">
          <aside class="wf-tb-side" aria-label="任务分类">
            <button type="button" class="wf-tb-filter" data-tb-filter="todo">待办任务<b></b></button>
            <button type="button" class="wf-tb-filter" data-tb-filter="all">全部任务<b></b></button>
            <button type="button" class="wf-tb-filter" data-tb-filter="done">已完成任务<b></b></button>
          </aside>
          <div class="wf-tb-list" id="wf-tb-list"></div>
        </div>
      </div>`;
    document.body.append(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('.wf-sheet-close')) closeSheet();
    });
    overlay.querySelector('.wf-tb-side').addEventListener('click', (event) => {
      const button = event.target.closest('[data-tb-filter]');
      if (!button || button.dataset.tbFilter === taskbook.filter) return;
      taskbook.filter = button.dataset.tbFilter;
      renderTaskbook();
    });
    overlay.querySelector('#wf-tb-list').addEventListener('click', (event) => {
      const pin = event.target.closest('[data-pin]');
      if (!pin) return;
      const id = pin.dataset.pin;
      if (taskbook.pinned.has(id)) taskbook.pinned.delete(id);
      else taskbook.pinned.add(id);
      savePinned();
      renderTaskbook();
    });
    state.overlay = overlay;
    return overlay;
  }

  function statusClass(status) {
    if (status === '拟开展') return 'is-planned';
    if (status === '条件任务') return 'is-conditional';
    if (status === '等待条件') return 'is-waiting';
    return 'is-done';
  }

  function taskCard(task, index) {
    const done = task.status === '已完成';
    const pinned = taskbook.pinned.has(task.id);
    const pin = done ? '' : `<button type="button" class="wf-tb-pin" data-pin="${esc(task.id)}" aria-label="${pinned ? '取消置顶' : '置顶任务'}" aria-pressed="${pinned}">
      <svg viewBox="0 0 24 24"><path d="M9 4h6l-1 6 3 2v2H7v-2l3-2zM12 14v6"/></svg></button>`;
    const foot = done
      ? `完成于 ${esc(task.date || '')}`
      : `交付物：${esc(task.deliverable || '待定')}`;
    return `<article class="wf-tb-task${pinned ? ' is-pinned' : ''}${done ? ' is-done' : ''}" data-id="${esc(task.id)}" style="animation-delay:${index * 40}ms">
      ${pin}
      <div class="wf-tb-meta"><span class="wf-tb-id">${esc(task.id)}</span><span class="wf-tb-status ${statusClass(task.status)}">${esc(task.status)}</span></div>
      <h3>${esc(task.title)}</h3>
      <p>${esc((task.action || task.acceptance || '').slice(0, 140))}</p>
      <div class="wf-tb-foot">${foot}</div>
    </article>`;
  }

  function renderTaskbook() {
    const overlay = state.overlay;
    if (!overlay) return;
    const { todo, done } = taskbook.bucket;
    const count = (filter) => filter === 'todo' ? todo.length : filter === 'done' ? done.length : todo.length + done.length;
    for (const button of overlay.querySelectorAll('[data-tb-filter]')) {
      const filter = button.dataset.tbFilter;
      button.classList.toggle('is-active', filter === taskbook.filter);
      button.querySelector('b').textContent = count(filter);
    }
    let items;
    if (taskbook.filter === 'done') items = done;
    else if (taskbook.filter === 'all') items = [...todo, ...done];
    else items = todo;
    items = items.slice().sort((a, b) => (taskbook.pinned.has(b.id) ? 1 : 0) - (taskbook.pinned.has(a.id) ? 1 : 0));
    const list = overlay.querySelector('#wf-tb-list');
    list.innerHTML = items.length
      ? items.map(taskCard).join('')
      : '<p class="wf-tb-empty">这个分类下还没有任务。</p>';
    list.scrollTop = 0;
  }

  async function openModule(id) {
    const module = MODULES.find((item) => item.id === id);
    if (!module) return;
    const data = await loadTasks();
    taskbook.bucket = data.modules?.[id] || { todo: [], done: [] };
    taskbook.pinned = loadPinned();
    taskbook.filter = taskbook.bucket.todo.length ? 'todo' : 'done';
    taskbook.module = id;
    const overlay = ensureOverlay();
    state.active = id;
    state.lastFocus = document.activeElement;
    overlay.querySelector('#wf-sheet-title').textContent = `${module.no || module.id} ${module.title}`;
    const total = taskbook.bucket.todo.length + taskbook.bucket.done.length;
    overlay.querySelector('#wf-sheet-sub').textContent = total
      ? `待办 ${taskbook.bucket.todo.length} · 已完成 ${taskbook.bucket.done.length}`
      : '该模块尚无已登记任务';
    renderTaskbook();
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    overlay.querySelector('.wf-sheet-close').focus({ preventScroll: true });
  }

  function closeSheet() {
    if (!state.overlay) return;
    state.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (state.lastFocus?.focus) state.lastFocus.focus({ preventScroll: true });
  }

  /* ---- 9. 挂载 ---------------------------------------------------------- */
  function mount() {
    const view = document.querySelector(VIEW);
    if (!view) return;
    if (view.querySelector('.workflow-board')) return;
    view.classList.add('is-board-view');
    view.innerHTML = `<div class="workflow-board" tabindex="0" aria-label="项目流程画布"><div class="workflow-canvas"></div>${legend()}${zoomControls()}${basis()}</div>`;
    const board = view.querySelector('.workflow-board');
    const canvas = view.querySelector('.workflow-canvas');

    const { rects } = layout(canvas);
    state.baseRects = rects;
    state.offsets = loadOffsets();
    canvas.insertAdjacentHTML('afterbegin', zoneHeads(rects) + branch(rects));
    canvas.insertAdjacentHTML('beforeend', linksSVG());
    canvas.style.width = `${state.size.w}px`;
    canvas.style.height = `${state.size.h}px`;
    applyNodePositions(canvas);

    bindPan(board, canvas);
    bindZoom(board, canvas);
    bindNodeDrag(canvas);
    canvas.querySelectorAll('.wf-node').forEach((node) => {
      node.addEventListener('click', (event) => {
        if (state.suppressClick) {
          state.suppressClick = false;
          return;
        }
        event.stopPropagation();
        openModule(node.dataset.module);
      });
      node.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openModule(node.dataset.module);
        }
      });
    });

    loadMap().then((map) => {
      const modules = map.modules || {};
      for (const node of canvas.querySelectorAll('.wf-node')) {
        const count = (modules[node.dataset.module] || []).length;
        node.dataset.count = String(count);
        const foot = node.querySelector('.wf-node-foot');
        if (foot) foot.innerHTML = count ? `已登记 <b>${count}</b> 项工作` : '尚无已登记工作';
      }
    });

    const fill = () => {
      const top = Math.max(view.getBoundingClientRect().top, 0);
      view.style.height = `${Math.max(window.innerHeight - top, 420)}px`;
    };
    fill();
    fit(board, canvas);
    window.addEventListener('resize', () => {
      fill();
      fit(board, canvas, true);
    });
  }

  window.WorkflowBoard = { mount };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {
    const view = document.querySelector(VIEW);
    if (view) new MutationObserver(() => mount()).observe(view, { childList: true, subtree: false });
    mount();
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSheet();
    });
  }, { once: true });
  else {
    const view = document.querySelector(VIEW);
    if (view) new MutationObserver(() => mount()).observe(view, { childList: true, subtree: false });
    mount();
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSheet();
    });
  }
})();

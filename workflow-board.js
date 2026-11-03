/* ==========================================================================
   项目流程 · 主题浏览画布
   静态节点来自 2026-09-09 的两张流程图；点击节点读取 workflow-map.json，
   按时间轴列出该模块已登记的工作。
   ========================================================================== */
(() => {
  'use strict';

  const scriptBase = new URL('.', document.currentScript.src);
  const MAP_URL = new URL('workflow-map.json', scriptBase);
  const DATA_URL = new URL('data/dashboard.json', scriptBase);
  const VIEW = '#view-workflow';
  const CANVAS_W = 1760;
  const CANVAS_H = 1250;

  const NODES = [
    // 主线 01–06
    { id: '01', no: '01', title: '影像与标签接入', status: '已建立', tone: 'done',
      points: ['ABIDE / DS005713 无标签来源', 'SRPBS 影像与匿名临床表', '量表定义与尺度仍需核对'],
      x: 50, y: 150, w: 260, h: 250 },
    { id: '02', no: '02', title: '预处理与质量审核', status: '本批已完成', tone: 'done',
      points: ['T1 配准 · 功能像处理', '数值 QC → 研究者视觉确认', '保留科学排除与时点暂缓'],
      x: 330, y: 150, w: 260, h: 250 },
    { id: '03', no: '03', title: '共同脑连接表示', status: '已跑通', tone: 'done',
      points: ['AAL90：90 脑区时序', '90×90 FC / Fisher-z', '来源与目标角色分别管理'],
      x: 610, y: 150, w: 260, h: 250 },
    { id: '04', no: '04', title: '表征学习与迁移', status: '来源训练完成', tone: 'done',
      points: ['源域预训练 → 目标训练折适配', 'Raw FC / SSL / 固定来源对照', '五条来源训练完成，比较已执行'],
      x: 890, y: 150, w: 260, h: 250 },
    { id: '05', no: '05', title: '分类与严重度预测', status: '分类已比较', tone: 'done',
      points: ['分类已比较，置换完成，增益未确立', '量表定义明确后再做连续回归', '分级与双任务依单任务证据推进'],
      x: 1170, y: 150, w: 260, h: 250 },
    { id: '06', no: '06', title: '新的独立队列验证', status: '队列待取得', tone: 'future',
      points: ['检验泛化、误差与不确定性', 'PTN / NRS，院方待确认', '历史 SRPBS 外部检验未通过'],
      x: 1450, y: 150, w: 260, h: 250 },

    // 规划区：输入
    { id: 'in-brain', no: 'IN·1', title: '脑影像', status: '既有影像流程', tone: 'plan', zone: 'plan',
      points: ['T1 / 静息态 fMRI'], x: 80, y: 650, w: 250, h: 86 },
    { id: 'in-scale', no: 'IN·2', title: '临床量表', status: '已审计 · 口径待核', tone: 'plan', zone: 'plan',
      points: ['VAS / SF-MPQ2'], x: 440, y: 650, w: 250, h: 86 },
    { id: 'in-pupil', no: 'IN·3', title: '瞳孔信号', status: '待论证 · 尚未采集', tone: 'plan', zone: 'plan',
      points: ['设备 / 光照 / 采样 / 同步'], x: 800, y: 650, w: 250, h: 86 },
    { id: 'in-text', no: 'IN·4', title: '病历文本', status: '待论证 · 尚未采集', tone: 'plan', zone: 'plan',
      points: ['脱敏文本与临床定义'], x: 1160, y: 650, w: 250, h: 86 },

    // 规划区：融合
    { id: 'fusion', no: 'P·1', title: '多模态对齐与融合', status: '规划', tone: 'plan', zone: 'plan',
      points: ['匿名 ID 与采集时点对齐 → 缺失模态处理 → 各模态编码 → 融合表示',
               '对比单模态、简单融合与复杂模型，只有可验证的增益才进入后续方案。'],
      x: 80, y: 760, w: 1600, h: 150 },

    // 规划区：Agent
    { id: 'agent', no: 'P·2', title: 'Agent 协作层', status: '建议架构 · 未实现', tone: 'plan', zone: 'plan',
      points: ['数据 Agent · 质控 Agent · 实验 Agent · 证据 Agent',
               '编排任务 → 调用工具 → 读取结果 → 记录证据；研究者负责审核与结论确认。'],
      x: 80, y: 930, w: 1600, h: 150 },

    // 规划区：输出
    { id: 'output', no: 'P·3', title: '研究输出', status: '完成独立验证后扩展', tone: 'plan', zone: 'plan',
      points: ['疼痛状态分类 / 连续严重度预测 / 脑连接解释 / 有依据的研究报告'],
      x: 80, y: 1100, w: 1600, h: 110 },
  ];

  const state = { map: null, dashboard: null, zoom: 1, x: 0, y: 0, overlay: null, active: null, lastFocus: null };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

  /* ---- 数据 ------------------------------------------------------------- */
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

  /* ---- 画布 ------------------------------------------------------------- */
  function mount() {
    const view = document.querySelector(VIEW);
    if (!view) return;
    if (view.querySelector('.workflow-board')) return;
    view.classList.add('is-board-view');
    view.innerHTML = `<div class="workflow-board" tabindex="0" aria-label="项目流程画布"><div class="workflow-canvas"></div>${legend()}${zoomControls()}${basis()}</div>`;
    const board = view.querySelector('.workflow-board');
    const canvas = view.querySelector('.workflow-canvas');

    canvas.innerHTML = `${zoneHeads()}${branch()}${planFrame()}${nodesHTML()}${linksSVG()}`;

    bindPan(board, canvas);
    bindZoom(board, canvas);
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
    // 窗口尺寸变化时保持铺满与可视
    window.addEventListener('resize', () => {
      fill();
      fit(board, canvas, true);
    });
  }

  function zoneHeads() {
    return `
      <div class="wf-zone-head is-main">
        <span class="wf-eyebrow">NEUROGRAPH / 研究主线</span>
        <h2>从脑影像到疼痛研究证据</h2>
        <p>99/96 开发性分类完成；医院准备与公开数据研究并行。</p>
      </div>
      <div class="wf-zone-head is-plan">
        <span class="wf-eyebrow">NEUROGRAPH / 多模态 × AGENT</span>
        <h2>从单一影像主线，走向多模态研究协作</h2>
        <p>临床字段与协议先整理；瞳孔、融合与 Agent 待论证，三维场景重建远期调研。</p>
      </div>`;
  }

  function branch() {
    return `<div class="wf-branch"><strong>医院准备并行</strong>PTN / NRS → 3T 协议建议 → 院方回填与现场核对。分类完成不等于外部验证。</div>`;
  }

  function planFrame() {
    return `<div class="wf-plan-frame" aria-hidden="true"></div>`;
  }

  function nodesHTML() {
    return NODES.map((node) => `
      <div class="wf-node${node.tone === 'future' || node.tone === 'plan' ? ' is-planned' : ''}"
        role="button" tabindex="0" data-module="${esc(node.id)}" data-count="0"
        style="left:${node.x}px;top:${node.y}px;width:${node.w}px;height:${node.h}px"
        aria-label="${esc(node.title)}，${esc(node.status)}">
        <span class="wf-node-top"><span class="wf-no">${esc(node.no)}</span><span class="wf-status">${esc(node.status)}</span></span>
        <h3>${esc(node.title)}</h3>
        <ul class="wf-points">${node.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul>
        
      </div>`).join('');
  }

  function linksSVG() {
    const main = NODES.filter((node) => !node.zone);
    const plan = NODES.filter((node) => node.zone === 'plan');
    const input = plan.filter((node) => node.id.startsWith('in-'));
    const fusion = plan.find((node) => node.id === 'fusion');
    const agent = plan.find((node) => node.id === 'agent');
    const output = plan.find((node) => node.id === 'output');
    const paths = [];

    // 每个模块固定 8 个锚点：四角 + 四边中点。连线只在锚点之间发生，
    // 先定形状与内容边界，再决定方向，箭头不会穿过模块或落在空处。
    const anchor = (node, name) => {
      const { x, y, w, h } = node;
      return {
        tl: [x, y], tc: [x + w / 2, y], tr: [x + w, y],
        ml: [x, y + h / 2], mr: [x + w, y + h / 2],
        bl: [x, y + h], bc: [x + w / 2, y + h], br: [x + w, y + h],
      }[name];
    };
    const line = (from, to, cls = '', gap = 10) => {
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

    // 主线：右中点 → 左中点，水平直线
    for (let i = 0; i < main.length - 1; i += 1) {
      const a = main[i];
      const b = main[i + 1];
      paths.push(line(anchor(a, 'mr'), anchor(b, 'ml'), i === main.length - 2 ? 'is-future' : ''));
    }

    // 医院并行支线：04 底部中点 → 下方折线 → 06 底部中点（箭头指回 06）
    const n04 = main.find((node) => node.id === '04');
    const n06 = main.find((node) => node.id === '06');
    const [x4, y4] = anchor(n04, 'bc');
    const [x6, y6] = anchor(n06, 'bc');
    const yMid = y4 + 66;
    paths.push(`<path class="is-future" d="M ${x4} ${y4} L ${x4} ${yMid} L ${x6} ${yMid} L ${x6} ${y6 + 10}" marker-end="url(#wf-arrow-future)"/>`);

    // 规划区：输入底部中点竖直向下接入融合顶部；融合 → Agent → 输出
    for (const node of input) {
      const [cx, cy] = anchor(node, 'bc');
      paths.push(`<path d="M ${cx} ${cy} L ${cx} ${fusion.y - 10}" marker-end="url(#wf-arrow)"/>`);
    }
    paths.push(line(anchor(fusion, 'bc'), anchor(agent, 'tc'), 'is-future'));
    paths.push(line(anchor(agent, 'bc'), anchor(output, 'tc'), 'is-future'));

    return `<svg class="wf-links" viewBox="0 0 ${CANVAS_W} ${CANVAS_H}" aria-hidden="true">
      <defs>
        <marker id="wf-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8" fill="none" stroke="#8fb4d8" stroke-width="1.5"/>
        </marker>
        <marker id="wf-arrow-future" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
          <path d="M0 0 8 4 0 8" fill="none" stroke="#d0a877" stroke-width="1.5"/>
        </marker>
      </defs>${paths.join('')}</svg>`;
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

  /* ---- 缩放与平移 ------------------------------------------------------- */
  function applyTransform(canvas) {
    canvas.style.transform = `translate(${state.x}px, ${state.y}px) scale(${state.zoom})`;
  }

  function fit(board, canvas, animate = false) {
    const width = board.clientWidth;
    const height = Math.max(board.clientHeight, 320);
    const scale = Math.min(width / CANVAS_W, height / CANVAS_H) * 0.97;
    state.zoom = clamp(scale, 0.32, 1.2);
    state.x = (width - CANVAS_W * state.zoom) / 2;
    state.y = (height - CANVAS_H * state.zoom) / 2;
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
      const next = clamp(state.zoom * Math.exp(-event.deltaY * 0.0014), 0.32, 2.4);
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
        if (action === 'reset') return fit(board, canvas, true);
        const next = clamp(state.zoom * (action === 'in' ? 1.2 : 1 / 1.2), 0.32, 2.4);
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
    // 不用 setPointerCapture：保留 pointerdown/up 在节点上的目标，
    // 点击节点仍能触发 click；拖动由 window 跟踪，出界也不断。
    board.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      if (event.target.closest('.wf-zoom, .wf-legend, a, button')) return;
      pan = { x: event.clientX, y: event.clientY, ox: state.x, oy: state.y, moved: false };
      state.suppressClick = false;
      board.classList.add('is-panning');
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up, { once: true });
      window.addEventListener('pointercancel', up, { once: true });
    });
  }

  /* ---- 节点浮层 --------------------------------------------------------- */
  function ensureOverlay() {
    if (state.overlay) return state.overlay;
    const overlay = document.createElement('div');
    overlay.className = 'wf-overlay';
    overlay.innerHTML = `
      <div class="wf-sheet" role="dialog" aria-modal="true" aria-labelledby="wf-sheet-title">
        <div class="wf-sheet-head">
          <div><h2 id="wf-sheet-title"></h2><p id="wf-sheet-sub"></p></div>
          <span class="wf-sheet-status" id="wf-sheet-status" hidden></span>
          <button type="button" class="wf-sheet-close" aria-label="关闭">×</button>
        </div>
        <div class="wf-timeline" id="wf-timeline"></div>
      </div>`;
    document.body.append(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('.wf-sheet-close')) closeSheet();
    });
    overlay.querySelector('#wf-timeline').addEventListener('click', (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (link) closeSheet();
    });
    state.overlay = overlay;
    return overlay;
  }

  async function openModule(id) {
    const node = NODES.find((item) => item.id === id);
    if (!node) return;
    const map = await loadMap();
    const items = (map.modules?.[id] || []).slice().reverse();
    const overlay = ensureOverlay();
    state.active = id;
    state.lastFocus = document.activeElement;

    overlay.querySelector('#wf-sheet-title').textContent = `${node.no} ${node.title}`;
    overlay.querySelector('#wf-sheet-sub').textContent = items.length
      ? `按记录时间从新到旧 · 共 ${items.length} 项`
      : '该模块尚无已登记的工作记录';
    const status = overlay.querySelector('#wf-sheet-status');
    status.textContent = node.status;
    status.hidden = false;

    const timeline = overlay.querySelector('#wf-timeline');
    if (!items.length) {
      timeline.innerHTML = `<p class="wf-timeline-empty">这个模块还没有已登记的工作。后续实验与核查记录出现后，会自动在这里按时间排列。</p>`;
    } else {
      const index = await loadDashboard();
      timeline.innerHTML = items.map((item) => {
        const record = index.get(item.key);
        const summary = esc((record?.summary || record?.result || record?.title || item.title).slice(0, 160));
        const label = esc(record?.label || record?.status || '');
        return `<article class="wf-item">
          <div class="wf-item-card">
            <div class="wf-item-meta"><b>${esc(item.date)}</b>${label ? `<span>${label}</span>` : ''}</div>
            <h3>${esc(item.title)}</h3>
            <p>${summary}</p>
            <div class="wf-item-links">
              <a href="#history?focus=${encodeURIComponent(item.key)}&amp;date=${encodeURIComponent(item.date)}">查看工作详情 ↗</a>
              <a href="#datasets?tab=results">数据处理结果 ↗</a>
            </div>
          </div>
        </article>`;
      }).join('');
    }
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    timeline.scrollTop = 0;
    overlay.querySelector('.wf-sheet-close').focus({ preventScroll: true });
  }

  function closeSheet() {
    if (!state.overlay) return;
    state.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (state.lastFocus?.focus) state.lastFocus.focus({ preventScroll: true });
  }

  /* ---- 启动 ------------------------------------------------------------- */
  function boot() {
    const view = document.querySelector(VIEW);
    if (!view) return;
    new MutationObserver(() => mount()).observe(view, { childList: true, subtree: false });
    mount();
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeSheet();
    });
  }

  window.WorkflowBoard = { mount };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

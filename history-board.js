/* ==========================================================================
   研究历程 · 浮动卡片工作台交互
   - 画布平移（空白处拖动 / 双击复位）
   - 卡片拖拽（自由摆放，位置写入 localStorage）
   - 收起工作：箭头收回 + 卡片滑向等距单列（FLIP）
   ========================================================================== */
(() => {
  'use strict';

  const STORE_KEY = 'ng.history.board.v1';
  const VIEW_SELECTOR = '#view-history';
  const CARD_SELECTOR = '.history-work-card, .history-guidance-card';
  const LIMIT = 280;
  const finePointer = matchMedia('(pointer: fine)').matches;
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = read();
  let scheduled = false;
  let mutating = false;
  let viewEl = null;

  function read() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || '{}');
      return {
        cards: parsed && typeof parsed.cards === 'object' && parsed.cards ? parsed.cards : {},
        pan: parsed && parsed.pan && Number.isFinite(parsed.pan.x) && Number.isFinite(parsed.pan.y)
          ? { x: parsed.pan.x, y: parsed.pan.y } : { x: 0, y: 0 },
      };
    } catch (_) {
      return { cards: {}, pan: { x: 0, y: 0 } };
    }
  }

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (_) {}
  }

  function clamp(value) {
    return Math.max(-LIMIT, Math.min(LIMIT, value));
  }

  /* ---- 结构：画布视口 + 舞台 ------------------------------------------- */
  function ensureWrap() {
    const records = document.querySelector('#history-records');
    if (!records) return null;
    if (records.parentElement && records.parentElement.classList.contains('history-board-stage')) return records;

    const viewport = document.createElement('div');
    viewport.className = 'history-board-viewport';
    const stage = document.createElement('div');
    stage.className = 'history-board-stage';
    records.replaceWith(viewport);
    viewport.append(stage);
    stage.append(records);
    bindPan(viewport, stage);
    stage.style.transform = `translate3d(${store.pan.x}px, ${store.pan.y}px, 0)`;
    return records;
  }

  /* ---- 卡片 ------------------------------------------------------------- */
  function cardKey(card) {
    if (card.dataset.boardKey) return card.dataset.boardKey;
    const row = card.closest('[data-history-date]');
    const date = row ? row.dataset.historyDate : '';
    const siblings = row ? [...row.querySelectorAll(CARD_SELECTOR)] : [];
    return `${date}#${siblings.indexOf(card)}`;
  }

  function bindCards(root) {
    for (const card of root.querySelectorAll(CARD_SELECTOR)) {
      if (card.dataset.boardBound === '1') continue;
      card.dataset.boardBound = '1';
      card.classList.add('board-card');
      card.dataset.boardKey = cardKey(card);
      const saved = store.cards[card.dataset.boardKey];
      if (saved) card.style.transform = `translate3d(${saved.x}px, ${saved.y}px, 0)`;
      if (!finePointer) continue;
      card.addEventListener('pointerdown', onCardDown);
      card.addEventListener('dblclick', onCardReset);
    }
  }

  function onCardDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest('a, button, summary, input, select, textarea, label')) return;
    if (String(window.getSelection() || '').length) return;

    const card = event.currentTarget;
    const key = card.dataset.boardKey;
    const base = store.cards[key] || { x: 0, y: 0 };
    const startX = event.clientX;
    const startY = event.clientY;
    let moved = false;

    card.setPointerCapture(event.pointerId);
    card.classList.add('is-pressed');

    const move = (ev) => {
      if (ev.pointerId !== event.pointerId) return;
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) >= 4) {
        moved = true;
        card.classList.add('is-dragging');
      }
      if (!moved) return;
      card.style.transform = `translate3d(${base.x + dx}px, ${base.y + dy}px, 0)`;
      ev.preventDefault();
    };

    const finish = (ev) => {
      if (ev.pointerId !== event.pointerId) return;
      card.removeEventListener('pointermove', move);
      card.removeEventListener('pointerup', finish);
      card.removeEventListener('pointercancel', finish);
      card.classList.remove('is-pressed', 'is-dragging');
      if (moved) {
        store.cards[key] = {
          x: Math.round(clamp(base.x + ev.clientX - startX)),
          y: Math.round(clamp(base.y + ev.clientY - startY)),
        };
        save();
        syncResetButton();
      }
    };

    card.addEventListener('pointermove', move);
    card.addEventListener('pointerup', finish);
    card.addEventListener('pointercancel', finish);
  }

  function onCardReset(event) {
    if (event.target.closest('a, button, summary, input, select, textarea, label')) return;
    const card = event.currentTarget;
    delete store.cards[card.dataset.boardKey];
    card.style.transform = '';
    card.animate(
      [{ outline: '2px solid rgba(27,109,181,.55)', outlineOffset: '2px' }, { outline: '2px solid transparent', outlineOffset: '6px' }],
      { duration: 360, easing: 'ease-out' },
    );
    save();
    syncResetButton();
  }

  /* ---- 日期与链箭头 ----------------------------------------------------- */
  function tagDates(root) {
    for (const el of root.querySelectorAll('.history-date-stack[datetime]')) {
      if (!el.dataset.full) el.dataset.full = el.getAttribute('datetime');
    }
  }

  function syncChainArrows(view) {
    const adviceRows = [...view.querySelectorAll('.history-day-row')]
      .filter((row) => row.querySelector('.history-day-advice'));
    const wanted = view.classList.contains('is-work-collapsed') ? Math.max(adviceRows.length - 1, 0) : 0;
    if (view.querySelectorAll('.chain-arrow').length === wanted) return;
    for (const arrow of view.querySelectorAll('.chain-arrow')) arrow.remove();
    if (!wanted) return;
    adviceRows.forEach((row, index) => {
      if (!index) return; // 首位箭头收回：第一条建议上方不再有箭头
      const arrow = document.createElement('span');
      arrow.className = 'chain-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '↑';
      row.append(arrow);
    });
  }

  /* ---- 画布平移 --------------------------------------------------------- */
  function bindPan(viewport, stage) {
    let pan = null;

    viewport.addEventListener('pointerdown', (event) => {
      if (!finePointer || event.button !== 0) return;
      if (event.target.closest('.board-card, a, button, summary, input, select, textarea, label')) return;
      pan = { x: event.clientX, y: event.clientY, px: store.pan.x, py: store.pan.y, moved: false };
      viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!pan) return;
      const dx = event.clientX - pan.x;
      const dy = event.clientY - pan.y;
      if (!pan.moved && Math.hypot(dx, dy) < 5) return;
      pan.moved = true;
      viewport.classList.add('is-panning');
      stage.classList.add('is-panning');
      store.pan.x = clamp(pan.px + dx);
      store.pan.y = clamp(pan.py + dy);
      stage.style.transform = `translate3d(${store.pan.x}px, ${store.pan.y}px, 0)`;
    });

    const stop = () => {
      if (!pan) return;
      pan = null;
      viewport.classList.remove('is-panning');
      stage.classList.remove('is-panning');
      save();
      syncResetButton();
    };
    viewport.addEventListener('pointerup', stop);
    viewport.addEventListener('pointercancel', stop);
    viewport.addEventListener('dblclick', (event) => {
      if (event.target.closest('.board-card')) return;
      resetAll();
    });
  }

  /* ---- 连接箭头（收起态等距排列） --------------------------------------- */
  function decorateArrows(root) {
    for (const box of root.querySelectorAll('.history-day-advice')) {
      const cards = [...box.querySelectorAll('.history-guidance-card')];
      const arrows = [...box.querySelectorAll('.board-arrow')];
      if (cards.length < 2 && !arrows.length) continue;
      if (cards.length - 1 === arrows.length && arrows.every((arrow) => arrow.nextElementSibling?.classList.contains('history-guidance-card'))) continue;
      for (const arrow of arrows) arrow.remove();
      cards.forEach((card, index) => {
        if (!index) return;
        const arrow = document.createElement('span');
        arrow.className = 'board-arrow';
        arrow.setAttribute('aria-hidden', 'true');
        box.insertBefore(arrow, card);
      });
    }
  }

  /* ---- 工具条 ----------------------------------------------------------- */
  function syncResetButton() {
    const actions = document.querySelector('#view-history .history-heading-actions');
    if (!actions) return;
    let button = actions.querySelector('#history-board-reset');
    const hasCustom = Object.keys(store.cards).length > 0 || store.pan.x !== 0 || store.pan.y !== 0;
    if (!button) {
      button = document.createElement('button');
      button.id = 'history-board-reset';
      button.type = 'button';
      button.className = 'button history-board-reset';
      button.textContent = '重置布局';
      button.addEventListener('click', resetAll);
      actions.append(button);
    }
    button.hidden = !hasCustom;
  }

  function resetAll() {
    store.cards = {};
    store.pan = { x: 0, y: 0 };
    save();
    const view = document.querySelector(VIEW_SELECTOR);
    if (!view) return;
    for (const card of view.querySelectorAll(CARD_SELECTOR)) card.style.transform = '';
    const stage = view.querySelector('.history-board-stage');
    if (stage) stage.style.transform = 'translate3d(0px, 0px, 0)';
    syncResetButton();
  }

  /* ---- 收起 / 展开 ------------------------------------------------------ */
  function setCollapsed(collapsed) {
    const view = document.querySelector(VIEW_SELECTOR);
    if (!view) return;
    collapsed = Boolean(collapsed);
    const wasCollapsed = view.classList.contains('is-work-collapsed');
    if (wasCollapsed === collapsed) return;

    const works = [...view.querySelectorAll('.history-day-work')];
    const guidance = [...view.querySelectorAll('.history-guidance-card')];
    const before = new Map(guidance.map((card) => [card, card.getBoundingClientRect()]));

    if (collapsed) {
      // 先锁定当前高度，行才会真正收拢，间距才能滑到等距
      for (const el of works) el.style.height = `${el.getBoundingClientRect().height}px`;
      void view.offsetWidth;
      view.classList.add('is-work-collapsed');
      for (const el of works) el.style.height = '0px';
    } else {
      view.classList.remove('is-work-collapsed');
      for (const el of works) {
        el.style.height = 'auto';
        const target = el.getBoundingClientRect().height;
        el.style.height = '0px';
        void el.offsetHeight;
        el.style.height = `${target}px`;
      }
    }

    for (const el of works) {
      const done = (event) => {
        if (event.propertyName !== 'height') return;
        el.removeEventListener('transitionend', done);
        // 收起后必须保持 0 高度，否则回到 auto 会把行重新撑开；展开后才交还布局
        el.style.height = collapsed ? '0px' : '';
      };
      el.addEventListener('transitionend', done);
    }

    view.dataset.workCollapsed = collapsed ? 'true' : 'false';
    syncChainArrows(view);
    if (reduceMotion()) return;
    requestAnimationFrame(() => {
      for (const card of guidance) {
        const old = before.get(card);
        if (!old) continue;
        const now = card.getBoundingClientRect();
        // 目标位置必须落在视口附近，且跨度不能过大，否则不做 FLIP，避免卡片飞出屏幕
        if (now.bottom < -160 || now.top > innerHeight + 160) continue;
        if (old.bottom < -160 || old.top > innerHeight + 160) continue;
        const dx = old.left - now.left;
        const dy = old.top - now.top;
        if (Math.abs(dx) + Math.abs(dy) > innerHeight * 1.2) continue;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
        card.animate(
          [{ translate: `${dx}px ${dy}px` }, { translate: '0px 0px' }],
          { duration: collapsed ? 440 : 480, easing: 'cubic-bezier(.2,.75,.25,1)' },
        );
      }
    });
  }

  /* ---- 编排 ------------------------------------------------------------- */
  function enhance() {
    const view = document.querySelector(VIEW_SELECTOR);
    if (!view) return;
    mutating = true;
    try {
      const records = ensureWrap();
      if (records) {
        bindCards(records);
        decorateArrows(records);
        tagDates(records);
        syncChainArrows(view);
        if (view.classList.contains('is-work-collapsed')) {
          for (const el of records.querySelectorAll('.history-day-work')) {
            if (!el.style.height) el.style.height = '0px';
          }
        }
      }
      syncResetButton();
      const stage = view.querySelector('.history-board-stage');
      if (stage) stage.style.transform = `translate3d(${store.pan.x}px, ${store.pan.y}px, 0)`;
    } finally {
      requestAnimationFrame(() => { mutating = false; });
    }
  }

  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enhance();
    });
  }

  function boot() {
    viewEl = document.querySelector(VIEW_SELECTOR);
    if (!viewEl) return;
    new MutationObserver(() => { if (!mutating) schedule(); })
      .observe(viewEl, { childList: true, subtree: true });
    schedule();
    document.addEventListener('click', (event) => {
      if (event.target.closest('#history-work-toggle')) {
        // app.js 负责切换状态；这里只保证收起后箭头与间距同步刷新。
        requestAnimationFrame(schedule);
      }
    }, true);
  }

  window.HistoryBoard = {
    setCollapsed,
    reset: resetAll,
    refresh: schedule,
    get collapsed() {
      return Boolean(document.querySelector(VIEW_SELECTOR)?.classList.contains('is-work-collapsed'));
    },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

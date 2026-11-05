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
  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  const store = read();
  let scheduled = false;
  let viewEl = null;
  let stageEl, drawLinks, connectionFrame;
  let cardAnimations = [];
  const observed = new Set();
  const sizes = new ResizeObserver(scheduleConnections);

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
    stageEl = stage;
    drawLinks = CardConnections.layer(stage, 'history-links', 'history-link-layer');
    bindPan(viewport, stage);
    stage.style.transform = `translate3d(${store.pan.x}px, ${store.pan.y}px, 0)`;
    return records;
  }

  /* ---- 卡片 ------------------------------------------------------------- */
  function cardKey(card) {
    if (card.dataset.guidanceNode) return `guidance:${card.dataset.guidanceNode}`;
    if (card.dataset.recordKey) return `work:${card.dataset.recordKey}`;
    return legacyCardKey(card);
  }

  function legacyCardKey(card) {
    const row = card.closest('[data-history-date]');
    const date = row ? row.dataset.historyDate : '';
    const siblings = row ? [...row.querySelectorAll(CARD_SELECTOR)] : [];
    return `${date}#${siblings.indexOf(card)}`;
  }

  function bindCards(root) {
    let migrated = false;
    for (const card of root.querySelectorAll(CARD_SELECTOR)) {
      if (card.dataset.boardBound === '1') continue;
      card.dataset.boardBound = '1';
      card.classList.add('board-card');
      card.dataset.boardKey = cardKey(card);
      const key = card.dataset.boardKey;
      const oldKey = legacyCardKey(card);
      const saved = store.cards[key] || store.cards[oldKey];
      if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) {
        store.cards[key] = { x: clamp(saved.x), y: clamp(saved.y) };
        positionCard(card, store.cards[key]);
      }
      if (key !== oldKey && Object.hasOwn(store.cards, oldKey)) {
        delete store.cards[oldKey];
        migrated = true;
      }
      card.addEventListener('pointerdown', onCardDown);
      card.addEventListener('dblclick', onCardReset);
    }
    if (migrated) save();
  }

  function positionCard(card, offset) {
    card.style.transform = offset ? `translate3d(${offset.x}px, ${offset.y}px, 0)` : '';
    scheduleConnections();
  }

  function onCardDown(event) {
    if (!event.isPrimary || event.pointerType === 'touch' || event.button !== 0) return;
    if (event.target.closest('a, button, summary, input, select, textarea, label')) return;
    if (String(window.getSelection() || '').length) return;

    const card = event.currentTarget;
    const key = card.dataset.boardKey;
    const original = store.cards[key];
    const base = original || { x: 0, y: 0 };
    let offset;
    card.classList.add('is-pressed');
    CardConnections.drag(card, event, {
      move(dx, dy) {
        card.classList.add('is-dragging');
        offset = { x: Math.round(clamp(base.x + dx)), y: Math.round(clamp(base.y + dy)) };
        positionCard(card, offset);
      },
      finish(moved, canceled) {
        card.classList.remove('is-pressed', 'is-dragging');
        if (!moved || !card.isConnected) return;
        if (canceled) return positionCard(card, original);
        store.cards[key] = offset;
        save();
        syncResetButton();
      },
    });
  }

  function onCardReset(event) {
    if (event.target.closest('a, button, summary, input, select, textarea, label')) return;
    const card = event.currentTarget;
    delete store.cards[card.dataset.boardKey];
    positionCard(card);
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
      const value = el.getAttribute('datetime');
      const match = value && value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) {
        // 吸顶或收起时补全年月，避免只剩“29日”这种缺年份的读数
        el.dataset.full = `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
        el.dataset.period = `${match[1]}年${Number(match[2])}月`;
      } else if (!el.dataset.full) {
        el.dataset.full = value;
      }
    }
  }

  /* 吸顶状态：只有贴住顶部栏的日期胶囊才补全年月 */
  let pinnedFrame = 0;
  function updatePinned() {
    const view = document.querySelector(VIEW_SELECTOR);
    if (!view || view.hidden) return;
    const stacks = view.querySelectorAll('.history-date-stack');
    if (!stacks.length) return;
    const styles = getComputedStyle(view);
    const topbar = parseFloat(styles.getPropertyValue('--hb-topbar')) || 64;
    const gap = parseFloat(styles.getPropertyValue('--hb-sticky-gap')) || 16;
    const threshold = topbar + gap + 0.5;
    for (const el of stacks) {
      const rect = el.getBoundingClientRect();
      // 只有真正贴住顶部栏的那一个才算吸顶；已被行推出视口的日期不补年月
      const pinned = getComputedStyle(el).position === 'sticky'
        && rect.top >= threshold - 1.5 && rect.top <= threshold + 0.5;
      el.classList.toggle('is-pinned', pinned);
    }
  }
  function schedulePinned() {
    if (pinnedFrame) return;
    pinnedFrame = requestAnimationFrame(() => {
      pinnedFrame = 0;
      updatePinned();
    });
  }

  function scheduleConnections() {
    if (connectionFrame) return;
    connectionFrame = requestAnimationFrame(() => {
      connectionFrame = 0;
      if (!stageEl?.isConnected || viewEl.hidden) return;
      const origin = stageEl.getBoundingClientRect();
      const rects = new Map();
      for (const card of observed) {
        const { x, y, width, height } = card.getBoundingClientRect();
        if (width && height) rects.set(card.dataset.boardKey, { x: x - origin.x, y: y - origin.y, w: width, h: height });
      }
      const advice = [...observed].filter(card => card.dataset.guidanceNode);
      let edges;
      if (viewEl.classList.contains('is-work-collapsed')) {
        advice.sort((a, b) => a.querySelector('time').dateTime.localeCompare(b.querySelector('time').dateTime));
        edges = advice.slice(1).map((card, i) => ({ from: advice[i].dataset.boardKey, to: card.dataset.boardKey }));
      } else {
        edges = advice.flatMap(card => {
          const row = card.closest('[data-history-date]');
          if (row.dataset.historyDate !== card.dataset.guidanceTargetDate) return [];
          const works = [...row.querySelectorAll('.history-work-card')];
          const target = matchMedia('(max-width: 1180px)').matches ? works.at(-1) : works[0];
          return target ? [{ from: card.dataset.boardKey, to: target.dataset.boardKey }] : [];
        });
      }
      drawLinks(edges, rects);
      cardAnimations = cardAnimations.filter(animation => animation.playState === 'running' || animation.pending);
      if (cardAnimations.length) scheduleConnections();
    });
  }

  /* ---- 画布平移 --------------------------------------------------------- */
  function bindPan(viewport, stage) {
    viewport.addEventListener('pointerdown', (event) => {
      if (!event.isPrimary || event.pointerType === 'touch' || event.button !== 0) return;
      if (event.target.closest('.board-card, a, button, summary, input, select, textarea, label')) return;
      const { x, y } = store.pan;
      CardConnections.drag(viewport, event, {
        move(dx, dy) {
          viewport.classList.add('is-panning');
          stage.classList.add('is-panning');
          store.pan = { x: clamp(x + dx), y: clamp(y + dy) };
          stage.style.transform = `translate3d(${store.pan.x}px, ${store.pan.y}px, 0)`;
        },
        finish(moved) {
          viewport.classList.remove('is-panning');
          stage.classList.remove('is-panning');
          if (!moved) return;
          save();
          syncResetButton();
        },
      });
    });
    viewport.addEventListener('dblclick', (event) => {
      if (event.target.closest('.board-card')) return;
      resetAll();
    });
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
    for (const card of view.querySelectorAll(CARD_SELECTOR)) positionCard(card);
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

    const guidance = [...view.querySelectorAll('.history-guidance-card')];
    const before = new Map(guidance.map((card) => [card, card.getBoundingClientRect()]));
    for (const animation of cardAnimations) animation.cancel();
    cardAnimations = [];
    view.classList.toggle('is-work-collapsed', collapsed);
    view.dataset.workCollapsed = collapsed ? 'true' : 'false';
    scheduleConnections();
    schedulePinned();
    if (reduceMotion()) return;
    for (const card of guidance) {
      const old = before.get(card);
      const now = card.getBoundingClientRect();
      // 只为视口附近的卡片播放位移，避免跨越多屏的动画。
      if (now.bottom < -160 || now.top > innerHeight + 160) continue;
      if (old.bottom < -160 || old.top > innerHeight + 160) continue;
      const dx = old.left - now.left;
      const dy = old.top - now.top;
      if (Math.abs(dx) + Math.abs(dy) > innerHeight * 1.2) continue;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) continue;
      cardAnimations.push(card.animate(
        [{ translate: `${dx}px ${dy}px` }, { translate: '0px 0px' }],
        { duration: collapsed ? 440 : 480, easing: 'cubic-bezier(.2,.75,.25,1)' },
      ));
    }
  }

  /* ---- 编排 ------------------------------------------------------------- */
  function enhance() {
    const view = document.querySelector(VIEW_SELECTOR);
    if (!view) return;
    const records = ensureWrap();
    if (records) {
      bindCards(records);
      tagDates(records);
      for (const card of observed) {
        if (records.contains(card)) continue;
        sizes.unobserve(card);
        observed.delete(card);
      }
      for (const card of records.querySelectorAll(CARD_SELECTOR)) {
        if (observed.has(card)) continue;
        observed.add(card);
        sizes.observe(card);
      }
    }
    syncResetButton();
    schedulePinned();
    scheduleConnections();
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
    new MutationObserver(changes => {
      if (changes.some(change => !change.target.closest?.('.card-connections'))) schedule();
    })
      .observe(viewEl, { childList: true, subtree: true });
    schedule();
    window.addEventListener('scroll', schedulePinned, { passive: true });
    window.addEventListener('resize', () => { schedulePinned(); scheduleConnections(); });
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

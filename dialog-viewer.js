/* ==========================================================================
   当日 Codex 对话 · 只读查看器
   数据：dialogs/index.json + dialogs/<session>.json
   入口：在 #view-history 每个日期行右下角注入按钮（仅该日期有会话时）
   ========================================================================== */
(() => {
  'use strict';

  const scriptBase = new URL('.', document.currentScript.src);
  const INDEX_URL = new URL('dialogs/index.json', scriptBase);
  const MEMBERS_URL = new URL('dialogs/members.json', scriptBase);
  const VIEW_SELECTOR = '#view-history';
  const ROW_SELECTOR = '.history-day-row';

  const state = {
    index: null,
    indexLoading: null,
    members: {},
    sessions: new Map(),
    activeDate: null,
    activeSessionId: null,
    query: '',
    overlay: null,
    lastFocus: null,
  };

  const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]));

  function inline(text) {
    return esc(text)
      .replace(/`([^`\n]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
  }

  function textBlock(text) {
    const parts = String(text ?? '').split(/```/);
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        const body = part.replace(/^[a-zA-Z0-9_-]*\n/, '');
        return `<pre>${esc(body.replace(/\n$/, ''))}</pre>`;
      }
      return inline(part);
    }).join('');
  }

  function toolBlock(tool) {
    const name = tool?.name || 'tool';
    const summary = tool?.summary || '调用记录';
    const output = tool?.output || '';
    return `<details class="ng-tool"><summary><span class="ng-tool-name">${esc(name)}</span>${esc(summary)}</summary><pre class="ng-tool-body">${esc(output)}</pre></details>`;
  }

  function messageHTML(message, memberName) {
    const role = message.role === 'user' ? 'user' : 'assistant';
    const label = role === 'user' ? memberName : 'Codex';
    const avatar = role === 'user' ? String(memberName || '你').slice(0, 1) : 'Cx';
    const tools = Array.isArray(message.tools) ? message.tools.map(toolBlock).join('') : '';
    const body = `<div class="ng-msg-meta">${esc(label)}${message.time ? ' · ' + esc(message.time) : ''}</div><div class="ng-msg-bubble">${textBlock(message.text || '')}${tools}</div>`;
    return `<div class="ng-msg is-${role}"><div class="ng-msg-avatar" aria-hidden="true">${esc(avatar)}</div><div class="ng-msg-main">${body}</div></div>`;
  }

  async function loadIndex() {
    if (state.index) return state.index;
    if (!state.indexLoading) {
      state.indexLoading = fetch(INDEX_URL, { cache: 'no-cache' })
        .then((response) => (response.ok ? response.json() : { sessions: [] }))
        .then((data) => {
          state.index = Array.isArray(data?.sessions) ? data : { sessions: [] };
          return state.index;
        })
        .catch(() => {
          state.index = { sessions: [] };
          return state.index;
        });
    }
    return state.indexLoading;
  }

  async function loadMembers() {
    try {
      const response = await fetch(MEMBERS_URL, { cache: 'no-cache' });
      if (!response.ok) return {};
      const data = await response.json();
      return Object.fromEntries(
        (data.members || []).filter((member) => member?.id && member?.name).map((member) => [member.id, member.name]),
      );
    } catch {
      return {};
    }
  }

  function displayName(session) {
    return state.members[session?.memberId] || session?.member || '成员';
  }

  function sessionsFor(date) {
    if (!state.index) return [];
    return state.index.sessions.filter((session) => session.date === date);
  }

  async function loadSession(session) {
    if (state.sessions.has(session.id)) return state.sessions.get(session.id);
    const response = await fetch(new URL(session.file, scriptBase), { cache: 'no-cache' });
    if (!response.ok) throw new Error(`对话读取失败（${response.status}）`);
    const data = await response.json();
    state.sessions.set(session.id, data);
    return data;
  }

  /* ---- 浮层 ------------------------------------------------------------- */
  function ensureOverlay() {
    if (state.overlay) return state.overlay;
    const overlay = document.createElement('div');
    overlay.className = 'ng-dialog-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', '当日 Codex 对话');
    overlay.innerHTML = `
      <div class="ng-dialog-panel">
        <div class="ng-dialog-head">
          <div><h2 id="ng-dialog-title">当日 Codex 对话</h2><p id="ng-dialog-sub"></p></div>
          <div class="ng-dialog-tools">
            <label class="ng-dialog-search">
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input type="search" id="ng-dialog-search" placeholder="搜索对话" aria-label="搜索当日对话">
            </label>
            <button type="button" class="ng-dialog-close" data-ng-close aria-label="关闭对话查看器">×</button>
          </div>
        </div>
        <div class="ng-dialog-body">
          <aside class="ng-dialog-side"><h3>当天对话</h3><div class="ng-dialog-sessions"></div></aside>
          <div class="ng-dialog-thread" id="ng-dialog-thread"></div>
        </div>
        <div class="ng-dialog-foot"><span><i></i>只读 · 由组员上传并脱敏</span></div>
      </div>`;
    document.body.append(overlay);
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay || event.target.closest('[data-ng-close]')) close();
    });
    overlay.querySelector('.ng-dialog-sessions').addEventListener('click', (event) => {
      const button = event.target.closest('[data-session-id]');
      if (button) selectSession(button.dataset.sessionId);
    });
    overlay.querySelector('#ng-dialog-search').addEventListener('input', (event) => {
      state.query = event.target.value.trim().toLowerCase();
      renderThread();
    });
    state.overlay = overlay;
    return overlay;
  }

  function open(date) {
    ensureOverlay();
    const sessions = sessionsFor(date);
    if (!sessions.length) return;
    state.activeDate = date;
    state.query = '';
    state.lastFocus = document.activeElement;
    const list = state.overlay.querySelector('.ng-dialog-sessions');
    list.innerHTML = sessions.map((session) => `
      <button type="button" class="ng-dialog-session" data-session-id="${esc(session.id)}">
        <strong>${esc(displayName(session))}</strong>
        <small>${esc(session.title || '对话记录')}${session.duration ? ' · ' + esc(session.duration) : ''}</small>
      </button>`).join('');
    const search = state.overlay.querySelector('#ng-dialog-search');
    search.value = '';
    const first = sessions[0];
    state.overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    selectSession(first.id);
    search.focus({ preventScroll: true });
  }

  async function selectSession(id) {
    const session = sessionsFor(state.activeDate).find((item) => item.id === id);
    if (!session) return;
    state.activeSessionId = id;
    for (const button of state.overlay.querySelectorAll('[data-session-id]')) {
      button.classList.toggle('is-active', button.dataset.sessionId === id);
    }
    const title = state.overlay.querySelector('#ng-dialog-title');
    const sub = state.overlay.querySelector('#ng-dialog-sub');
    title.textContent = `${session.date} · ${session.title || '对话记录'}`;
    sub.textContent = `${displayName(session)}${session.duration ? ' · ' + session.duration : ''}${session.messageCount ? ' · 共 ' + session.messageCount + ' 条消息' : ''}`;
    const thread = state.overlay.querySelector('#ng-dialog-thread');
    thread.innerHTML = '<p class="ng-dialog-empty">正在读取对话…</p>';
    try {
      const data = await loadSession(session);
      state.sessions.set(id, data);
      renderThread();
    } catch (error) {
      thread.innerHTML = `<p class="ng-dialog-empty">${esc(error.message)}</p>`;
    }
  }

  function renderThread() {
    if (!state.overlay) return;
    const data = state.sessions.get(state.activeSessionId);
    const thread = state.overlay.querySelector('#ng-dialog-thread');
    if (!data) return;
    const messages = Array.isArray(data.messages) ? data.messages : [];
    const query = state.query;
    const filtered = query
      ? messages.filter((message) => JSON.stringify(message).toLowerCase().includes(query))
      : messages;
    if (!filtered.length) {
      thread.innerHTML = `<p class="ng-dialog-empty">${query ? '没有匹配的消息。' : '这场对话还没有可展示的消息。'}</p>`;
      return;
    }
    const session = sessionsFor(state.activeDate).find((item) => item.id === state.activeSessionId);
    const memberName = session ? displayName(session) : '成员';
    thread.innerHTML = filtered.map((message) => messageHTML(message, memberName)).join('');
    thread.scrollTop = 0;
  }

  function close() {
    if (!state.overlay) return;
    state.overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    if (state.lastFocus && typeof state.lastFocus.focus === 'function') state.lastFocus.focus({ preventScroll: true });
  }

  /* ---- 入口注入 --------------------------------------------------------- */
  function injectEntries(root) {
    if (!state.index) return;
    for (const row of root.querySelectorAll(ROW_SELECTOR)) {
      const date = row.dataset.historyDate;
      if (!date) continue;
      const sessions = sessionsFor(date);
      const exists = row.querySelector(':scope > .dialog-entry');
      if (!sessions.length) {
        if (exists) exists.remove();
        row.classList.remove('has-dialog');
        continue;
      }
      if (exists) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'dialog-entry';
      button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>查看当日 Codex 对话<b>${sessions.length}</b>`;
      button.title = '查看当日成员上传的 Codex 对话';
      button.addEventListener('click', () => open(date));
      row.append(button);
      row.classList.add('has-dialog');
    }
  }

  function schedule(root) {
    if (schedule.pending) return;
    schedule.pending = true;
    requestAnimationFrame(() => {
      schedule.pending = false;
      injectEntries(root);
    });
  }

  function boot() {
    const view = document.querySelector(VIEW_SELECTOR);
    if (!view) return;
    Promise.all([loadIndex(), loadMembers()]).then(([, members]) => {
      state.members = members;
      // 先补齐已渲染的行
      schedule(view);
      new MutationObserver(() => schedule(view)).observe(view, { childList: true, subtree: true });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();

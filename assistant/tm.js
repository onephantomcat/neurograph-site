/* mini TM · NL project assistant
   纯前端：浏览器直连 DeepSeek，密钥只存本机 localStorage。 */
(function () {
  'use strict';

  var MEMBERS = ['王挚', '吴钧诺', '吴旻昊', '朱子墨'];
  var API_URL = 'https://api.deepseek.com/chat/completions';
  var KB_INDEX = './assistant/kb/index.json';
  var MAX_MSGS = 40;
  var TOP_K = 4;
  var CTX_LIMIT = 9000;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lsDel(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function lsJson(k, d) { var v = lsGet(k); if (!v) return d; try { return JSON.parse(v); } catch (e) { return d; } }

  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function nowMonth() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  /* ---------------- state ---------------- */
  var S = {
    member: lsGet('tm.member') || MEMBERS[0],
    model: lsGet('tm.model') || 'deepseek-chat',
    width: parseInt(lsGet('tm.width'), 10) || 440,
    key: lsGet('tm.key') || '',
    open: false,
    busy: false,
    abort: null,
    sessions: [],
    current: '',
    kb: null,
    kbTried: false,
    kbCache: {},
    df: null,
    lastSources: [],
    viewName: ''
  };

  /* ---------------- sessions ---------------- */
  function sessionsKey() { return 'tm.sessions.' + S.member; }
  function currentKey() { return 'tm.current.' + S.member; }

  function loadSessions() {
    S.sessions = lsJson(sessionsKey(), []);
    if (!Array.isArray(S.sessions)) S.sessions = [];
    S.current = lsGet(currentKey()) || (S.sessions[0] && S.sessions[0].id) || '';
    if (!S.sessions.length) {
      newSession(true);
    } else if (!S.sessions.some(function (s) { return s.id === S.current; })) {
      S.current = S.sessions[0].id;
    }
  }
  function saveSessions() { lsSet(sessionsKey(), JSON.stringify(S.sessions)); lsSet(currentKey(), S.current); }
  function session() {
    var s = S.sessions.filter(function (x) { return x.id === S.current; })[0];
    if (!s) { s = { id: uid(), title: '新对话', messages: [], updated: Date.now() }; S.sessions.unshift(s); S.current = s.id; }
    return s;
  }
  function newSession(silent) {
    var s = { id: uid(), title: '新对话', messages: [], updated: Date.now() };
    S.sessions.unshift(s);
    S.current = s.id;
    saveSessions();
    if (!silent) { renderMessages(); renderSessions(); }
    return s;
  }
  function touch(s) { s.updated = Date.now(); saveSessions(); }

  /* ---------------- kb retrieval ---------------- */
  function loadKb() {
    if (S.kbTried) return Promise.resolve(S.kb);
    S.kbTried = true;
    return fetch(KB_INDEX, { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error('no kb'); return r.json(); })
      .then(function (j) { S.kb = j; return j; })
      .catch(function () { S.kb = null; return null; });
  }

  function grams(text) {
    var t = String(text || '').toLowerCase().replace(/\s+/g, ' ');
    var out = [];
    var zh = t.match(/[\u4e00-\u9fa5]+/g) || [];
    zh.forEach(function (run) {
      for (var i = 0; i + 1 < run.length; i++) out.push(run.slice(i, i + 2));
      if (run.length <= 6) out.push(run);
    });
    (t.match(/[a-z0-9_\-]{2,}/g) || []).forEach(function (w) { out.push(w); });
    return out;
  }

  function scoreChunk(c, qs, df, total) {
    var hay = ((c.title || '') + ' ' + (c.keywords || '') + ' ' + (c.summary || '')).toLowerCase();
    var title = (c.title || '').toLowerCase();
    var s = 0;
    qs.forEach(function (g) {
      if (!g) return;
      var n = df[g] || 0;
      var w = Math.log(1 + total / (1 + n));
      if (title.indexOf(g) >= 0) s += 3 * w;
      else if (hay.indexOf(g) >= 0) s += w;
    });
    if (/原文|转写/.test(title)) s *= 0.55;
    if (/总结|结论|背景/.test(title)) s *= 1.15;
    return s;
  }

  function buildDf(kb) {
    var df = Object.create(null);
    kb.chunks.forEach(function (c) {
      var seen = Object.create(null);
      grams((c.title || '') + ' ' + (c.keywords || '')).forEach(function (g) {
        if (g && !seen[g]) { seen[g] = 1; df[g] = (df[g] || 0) + 1; }
      });
    });
    return df;
  }

  function loadShard(name) {
    if (S.kbCache[name]) return Promise.resolve(S.kbCache[name]);
    return fetch('./assistant/kb/' + name, { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { S.kbCache[name] = j; return j; })
      .catch(function () { return null; });
  }

  function retrieve(query) {
    return loadKb().then(function (kb) {
      if (!kb || !kb.chunks || !kb.chunks.length) return [];
      var qs = grams(query);
      if (!S.df) S.df = buildDf(kb);
      var ranked = kb.chunks
        .map(function (c) { return { c: c, s: scoreChunk(c, qs, S.df, kb.chunks.length) }; })
        .filter(function (x) { return x.s > 0; })
        .sort(function (a, b) { return b.s - a.s; })
        .slice(0, TOP_K);
      if (!ranked.length) return [];
      return Promise.all(ranked.map(function (x) {
        return loadShard(x.c.shard).then(function (sh) {
          if (!sh || !sh.chunks) return null;
          for (var i = 0; i < sh.chunks.length; i++) {
            if (sh.chunks[i].id === x.c.id) return sh.chunks[i];
          }
          return null;
        });
      })).then(function (list) { return list.filter(Boolean); });
    });
  }

  /* ---------------- prompt ---------------- */
  function profileText() {
    if (window.TM_PROFILE && typeof window.TM_PROFILE.summary === 'string') return window.TM_PROFILE.summary;
    return 'NeuroGraph 是面向神经病理性疼痛的静息态 fMRI 研究与辅助分级项目，站点公开研究进度、聚合指标、方法说明与报告。';
  }

  function buildMessages(question, chunks) {
    var snapshot = (S.kb && S.kb.generated_at) || nowMonth();
    var lines = [];
    lines.push('你是「mini TM」，NeuroGraph 项目的私人答疑助理，说话像一位熟悉项目内情的私人秘书：亲切、直接、不客套。');
    lines.push('你只依据下面提供的项目资料作答；资料没写的，直接说“站内资料没写到”，不要编造。');
    lines.push('');
    lines.push('当前使用者身份：' + S.member + '。称呼对方时用这个名字。');
    if (S.viewName) lines.push('对方此刻正在浏览站内视图：' + S.viewName + '。回答可结合当前视图。');
    lines.push('项目资料快照日期：' + snapshot + '。涉及具体进度、数字、日期时，在句末标注（依据 ' + snapshot + ' 快照）。');
    lines.push('回答用简体中文；先给结论，再给依据；一般控制在 300 字以内，除非对方要求展开。');
    lines.push('引用资料时在句末写 [来源: 资料标题]，方便对方回看。');
    lines.push('');
    lines.push('## 项目概览');
    lines.push(profileText());
    if (chunks && chunks.length) {
      lines.push('');
      lines.push('## 本次检索到的项目资料');
      var used = 0;
      chunks.forEach(function (c, i) {
        var body = String(c.content || '');
        if (used + body.length > CTX_LIMIT) return;
        used += body.length;
        lines.push('【' + (i + 1) + '】' + (c.title || '未命名资料'));
        if (c.content) lines.push(body);
        lines.push('');
      });
    }
    var msgs = [{ role: 'system', content: lines.join('\n') }];
    var hist = session().messages.slice(-MAX_MSGS);
    hist.forEach(function (m) {
      if (m.role === 'user' || m.role === 'assistant') {
        if (m.role === 'assistant' && m.pending) return;
        msgs.push({ role: m.role, content: m.content || '' });
      }
    });
    return msgs;
  }

  /* ---------------- api ---------------- */
  function streamChat(messages, onThink, onText) {
    var ctrl = new AbortController();
    S.abort = ctrl;
    return fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + S.key
      },
      body: JSON.stringify({
        model: S.model,
        messages: messages,
        stream: true,
        temperature: 0.4,
        max_tokens: 2000
      }),
      signal: ctrl.signal
    }).then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          var err = new Error('HTTP ' + res.status);
          err.status = res.status;
          err.detail = t.slice(0, 400);
          throw err;
        });
      }
      var reader = res.body.getReader();
      var dec = new TextDecoder('utf-8');
      var buf = '';
      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return;
          buf += dec.decode(r.value, { stream: true });
          var idx;
          while ((idx = buf.indexOf('\n')) >= 0) {
            var line = buf.slice(0, idx).trim();
            buf = buf.slice(idx + 1);
            if (!line || line.charAt(0) === ':') continue;
            if (line.indexOf('data:') !== 0) continue;
            var data = line.slice(5).trim();
            if (data === '[DONE]') return;
            var j;
            try { j = JSON.parse(data); } catch (e) { continue; }
            var d = (j.choices && j.choices[0] && j.choices[0].delta) || {};
            if (d.reasoning_content && onThink) onThink(d.reasoning_content);
            if (d.content && onText) onText(d.content);
          }
          return pump();
        });
      }
      return pump();
    }).finally(function () { S.abort = null; });
  }

  /* ---------------- render ---------------- */
  function md(text) {
    return ensureLibs().then(function () {
      var html;
      if (window.marked) {
        try { html = window.marked.parse(text, { gfm: true, breaks: true }); }
        catch (e) { html = esc(text).replace(/\n/g, '<br>'); }
      } else {
        html = esc(text).replace(/\n/g, '<br>');
      }
      if (window.DOMPurify) {
        try { html = window.DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, ADD_ATTR: ['target'] }); } catch (e) {}
      }
      return html;
    });
  }

  function ensureLibs() {
    if (window.marked && window.DOMPurify) return Promise.resolve();
    var jobs = [];
    if (!window.marked) jobs.push(loadScript('./vendor/marked.umd.js'));
    if (!window.DOMPurify) jobs.push(loadScript('./vendor/purify.min.js'));
    return Promise.all(jobs).catch(function () {});
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src; s.async = true;
      s.onload = resolve; s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function renderMessages() {
    var box = $('#tm-messages');
    if (!box) return;
    var s = session();
    box.innerHTML = '';
    if (!s.messages.length) { renderWelcome(box); return; }
    s.messages.forEach(function (m, i) { box.appendChild(msgNode(m, i)); });
    scrollBottom(true);
  }

  function renderWelcome(box) {
    var wrap = document.createElement('div');
    wrap.className = 'tm-welcome';
    wrap.innerHTML =
      '<h3>你好，' + esc(S.member) + '。</h3>' +
      '<p>我是 mini TM，这个项目的私人助理。研究进度、方法取舍、数据口径、下一步安排，都可以直接问我；答不出来我会说清楚，不编。</p>' +
      '<div class="tm-chips">' +
      chip('最近一周有什么进展？') +
      chip('现在最大的风险是什么？') +
      chip('下一步该先做什么？') +
      chip('这个结论的依据在哪份文件？') +
      '</div>';
    box.appendChild(wrap);
    $$('.tm-chip', wrap).forEach(function (b) {
      b.addEventListener('click', function () {
        var input = $('#tm-input');
        input.value = b.textContent;
        input.focus();
      });
    });
  }

  function chip(t) { return '<button type="button" class="tm-chip">' + esc(t) + '</button>'; }

  function msgNode(m) {
    var row = document.createElement('div');
    row.className = 'tm-msg ' + (m.role === 'user' ? 'is-user' : 'is-bot');
    var body = document.createElement('div');
    body.className = 'tm-msg-body';
    var role = document.createElement('span');
    role.className = 'tm-msg-role';
    role.textContent = m.role === 'user' ? S.member : 'mini TM';
    body.appendChild(role);

    if (m.think) {
      var d = document.createElement('details');
      d.className = 'tm-think';
      var sum = document.createElement('summary');
      sum.textContent = m.pending ? '思考中…' : '思考过程';
      var pre = document.createElement('div');
      pre.className = 'tm-think-body';
      pre.textContent = m.think;
      d.appendChild(sum); d.appendChild(pre);
      body.appendChild(d);
    }

    var bubble = document.createElement('div');
    bubble.className = 'tm-bubble';
    bubble.innerHTML = m.html || esc(m.content || '').replace(/\n/g, '<br>');
    body.appendChild(bubble);

    if (m.cites && m.cites.length) {
      var cites = document.createElement('div');
      cites.className = 'tm-cites';
      m.cites.forEach(function (c) {
        var a = document.createElement(c.url ? 'a' : 'span');
        a.className = 'tm-cite';
        a.textContent = c.label;
        if (c.url) { a.href = c.url; a.target = '_blank'; a.rel = 'noopener'; }
        cites.appendChild(a);
      });
      body.appendChild(cites);
    }

    row.appendChild(body);
    return row;
  }

  function scrollBottom(force) {
    var box = $('#tm-messages');
    if (!box) return;
    var near = box.scrollHeight - box.scrollTop - box.clientHeight < 160;
    if (force || near) box.scrollTop = box.scrollHeight;
  }

  /* ---------------- send ---------------- */
  function send() {
    if (S.busy) return;
    var input = $('#tm-input');
    var q = input.value.trim();
    if (!q) return;
    if (!S.key) { openSheet(); toast('先填 DeepSeek API Key'); return; }

    var s = session();
    s.messages.push({ role: 'user', content: q });
    if (s.title === '新对话') s.title = q.slice(0, 18);
    input.value = '';
    autoGrow(input);
    S.lastSources = [];
    renderMessages(); renderSessions();
    touch(s);

    var bot = { role: 'assistant', content: '', html: '', think: '', cites: [], pending: true };
    s.messages.push(bot);
    renderMessages();
    setBusy(true);
    var t0 = Date.now();
    var thinkEl = null;
    var acc = '';
    var thinkAcc = '';
    var pendingTimer = null;

    retrieve(q).then(function (chunks) {
      S.lastSources = (chunks || []).map(function (c) { return { label: c.title || '资料', url: c.url || '' }; });
      var msgs = buildMessages(q, chunks);
      return streamChat(
        msgs,
        function (delta) {
          thinkAcc += delta;
          var d = $('#tm-messages details.tm-think:last-of-type');
          if (d) d.querySelector('.tm-think-body').textContent = thinkAcc;
          scrollBottom(false);
        },
        function (delta) {
          acc += delta;
          bot.content = acc;
          if (pendingTimer) return;
          pendingTimer = setTimeout(function () {
            pendingTimer = null;
            md(acc).then(function (h) { bot.html = h; bot.pending = false; renderInPlace(bot); });
          }, 90);
        }
      ).then(function () {
        clearTimeout(pendingTimer);
        bot.pending = false;
        bot.think = thinkAcc;
        bot.cites = S.lastSources;
        return md(acc).then(function (h) { bot.html = h; });
      }).catch(function (err) {
        clearTimeout(pendingTimer);
        bot.pending = false;
        s.messages.pop();
        renderMessages();
        showError(err);
        throw err;
      }).then(function () {
        touch(s);
        renderMessages();
        renderSessions();
      });
    }).catch(function () {}).then(function () {
      setBusy(false);
    });
  }

  function renderInPlace(bot) {
    var rows = $$('#tm-messages .tm-msg.is-bot');
    var row = rows[rows.length - 1];
    if (!row) return;
    var bubble = row.querySelector('.tm-bubble');
    if (bubble) bubble.innerHTML = bot.html;
    var sum = row.querySelector('.tm-think summary');
    if (sum && bot.think) sum.textContent = '思考过程';
    scrollBottom(false);
  }

  function showError(err) {
    var box = $('#tm-messages');
    var el = document.createElement('div');
    el.className = 'tm-error';
    var msg = '请求失败。';
    if (err.status === 401) msg = 'API Key 无效或已失效，请到设置里更新。';
    else if (err.status === 402) msg = '账户余额不足，请先充值。';
    else if (err.status === 429) msg = '请求太频繁，稍等几秒再试。';
    else if (err.status) msg = '接口返回 HTTP ' + err.status + '。';
    else if (err.name === 'AbortError') msg = '已停止生成。';
    else if (!navigator.onLine) msg = '网络已断开。';
    el.textContent = msg;
    if (err.name !== 'AbortError') {
      var retry = document.createElement('button');
      retry.type = 'button';
      retry.textContent = '重试';
      retry.addEventListener('click', function () { el.remove(); retryLast(); });
      el.appendChild(document.createElement('br'));
      el.appendChild(retry);
    }
    box.appendChild(el);
    scrollBottom(true);
  }

  function retryLast() {
    var s = session();
    var last = null;
    for (var i = s.messages.length - 1; i >= 0; i--) {
      if (s.messages[i].role === 'user') { last = s.messages[i]; break; }
    }
    if (!last) return;
    s.messages.pop();
    $('#tm-input').value = last.content;
    send();
  }

  function setBusy(v) {
    S.busy = v;
    var btn = $('#tm-send');
    if (!btn) return;
    btn.classList.toggle('is-stop', v);
    btn.setAttribute('aria-label', v ? '停止生成' : '发送');
    btn.innerHTML = v ? stopIcon() : sendIcon();
    var input = $('#tm-input');
    if (input) input.disabled = false;
  }

  /* ---------------- panel ---------------- */
  function openPanel() {
    if (S.open) return;
    S.open = true;
    document.body.classList.add('tm-open');
    var entry = $('#tm-entry');
    if (entry) entry.setAttribute('aria-expanded', 'true');
    var panel = $('#tm-panel');
    if (panel) panel.setAttribute('aria-hidden', 'false');
    setWidth(S.width);
    loadSessions();
    renderSessions();
    renderMessages();
    loadKb();
    setTimeout(function () { var i = $('#tm-input'); if (i) i.focus(); }, 260);
    if (!S.key) openSheet();
  }

  function closePanel() {
    S.open = false;
    document.body.classList.remove('tm-open');
    var entry = $('#tm-entry');
    if (entry) entry.setAttribute('aria-expanded', 'false');
    var panel = $('#tm-panel');
    if (panel) panel.setAttribute('aria-hidden', 'true');
    closeSheet();
  }

  function setWidth(w) {
    w = Math.max(360, Math.min(720, Math.round(w)));
    S.width = w;
    document.documentElement.style.setProperty('--tm-w', w + 'px');
    lsSet('tm.width', String(w));
  }

  /* ---------------- sessions ui ---------------- */
  function renderSessions() {
    var sel = $('#tm-sessions');
    if (!sel) return;
    sel.innerHTML = '';
    S.sessions.forEach(function (s) {
      var o = document.createElement('option');
      o.value = s.id;
      o.textContent = s.title || '未命名对话';
      if (s.id === S.current) o.selected = true;
      sel.appendChild(o);
    });
  }

  function exportMarkdown() {
    var s = session();
    var out = ['# ' + (s.title || '对话') + '', '', '导出时间：' + nowMonth() + '　身份：' + S.member, ''];
    s.messages.forEach(function (m) {
      if (m.pending) return;
      out.push('## ' + (m.role === 'user' ? S.member : 'mini TM'));
      out.push('');
      out.push(m.content || '');
      out.push('');
    });
    var blob = new Blob([out.join('\n')], { type: 'text/markdown;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = (s.title || 'mini TM 对话').replace(/[\\/:*?"<>|]/g, '_') + '.md';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  /* ---------------- sheet ---------------- */
  function openSheet() {
    var sheet = $('#tm-sheet');
    if (!sheet) return;
    sheet.classList.add('is-open');
    renderSheet();
    var k = $('#tm-key');
    if (k && !S.key) setTimeout(function () { k.focus(); }, 60);
  }
  function closeSheet() {
    var sheet = $('#tm-sheet');
    if (sheet) sheet.classList.remove('is-open');
  }
  function renderSheet() {
    var sheet = $('#tm-sheet');
    if (!sheet) return;
    sheet.innerHTML =
      '<h4>设置</h4>' +
      '<p class="tm-hint">密钥只保存在这台设备的浏览器里，不会写进网页或仓库。换台设备需要重新填写。</p>' +
      '<div class="tm-field"><label for="tm-key">DeepSeek API Key</label>' +
      '<input id="tm-key" type="password" autocomplete="off" placeholder="sk-…" value="' + esc(S.key) + '"></div>' +
      '<div class="tm-field"><label>当前身份</label><div class="tm-members">' +
      MEMBERS.map(function (m) {
        return '<button type="button" class="tm-member' + (m === S.member ? ' is-active' : '') + '" data-member="' + esc(m) + '">' + esc(m) + '</button>';
      }).join('') + '</div></div>' +
      '<div class="tm-field"><label>默认模型</label>' +
      '<select id="tm-model-2"><option value="deepseek-chat"' + (S.model === 'deepseek-chat' ? ' selected' : '') + '>deepseek-chat（快）</option>' +
      '<option value="deepseek-reasoner"' + (S.model === 'deepseek-reasoner' ? ' selected' : '') + '>deepseek-reasoner（会思考）</option></select></div>' +
      '<div class="tm-sheet-actions"><button type="button" class="tm-btn primary" id="tm-save">保存</button>' +
      '<button type="button" class="tm-btn" id="tm-sheet-close">关闭</button></div>' +
      '<div class="tm-sheet-actions" style="margin-top:18px"><button type="button" class="tm-btn danger" id="tm-wipe">清除本机数据</button></div>';

    $$('.tm-member', sheet).forEach(function (b) {
      b.addEventListener('click', function () {
        var m = b.getAttribute('data-member');
        switchMember(m);
        $$('.tm-member', sheet).forEach(function (x) { x.classList.toggle('is-active', x === b); });
      });
    });
    $('#tm-save').addEventListener('click', function () {
      S.key = $('#tm-key').value.trim();
      lsSet('tm.key', S.key);
      S.model = $('#tm-model-2').value;
      lsSet('tm.model', S.model);
      syncModelSelect();
      closeSheet();
    });
    $('#tm-sheet-close').addEventListener('click', closeSheet);
    $('#tm-wipe').addEventListener('click', function () {
      if (!confirm('清除本机的 API Key、身份和全部对话记录？')) return;
      ['tm.key', 'tm.member', 'tm.model', 'tm.width', 'tm.sessions.' + S.member, 'tm.current.' + S.member].forEach(lsDel);
      S.key = ''; S.sessions = []; S.current = '';
      newSession(true);
      renderMessages(); renderSessions();
      closeSheet();
    });
  }

  function switchMember(m) {
    if (!m || m === S.member) return;
    saveSessions();
    S.member = m;
    lsSet('tm.member', m);
    loadSessions();
    renderSessions();
    renderMessages();
    var sub = $('#tm-sub');
    if (sub) sub.textContent = '项目私人助理 · ' + m;
  }

  function syncModelSelect() {
    var sel = $('#tm-model');
    if (sel) sel.value = S.model;
  }

  /* ---------------- misc ui ---------------- */
  function autoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 132) + 'px';
  }

  function toast(msg) {
    var box = $('#tm-messages');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'tm-error';
    el.style.background = 'var(--amber-soft)';
    el.style.color = 'var(--amber)';
    el.textContent = msg;
    box.appendChild(el);
    scrollBottom(true);
    setTimeout(function () { el.remove(); }, 4000);
  }

  function currentView() {
    var h = (location.hash || '').replace('#', '');
    var map = {
      calendar: '项目日历', history: '研究历程', workflow: '项目流程', goals: '计划与目标',
      conclusions: '研究结论索引', datasets: '数据与结果', architectures: '模型架构', evidence: '报告与证据'
    };
    return map[h] || '';
  }

  function sendIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h15M13 6l6 6-6 6"/></svg>';
  }
  function stopIcon() {
    return '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>';
  }

  /* ---------------- bind ---------------- */
  function bind() {
    var entry = $('#tm-entry');
    if (entry) entry.addEventListener('click', function (e) {
      e.preventDefault();
      S.open ? closePanel() : openPanel();
    });

    var close = $('#tm-close');
    if (close) close.addEventListener('click', closePanel);
    var cfg = $('#tm-cfg');
    if (cfg) cfg.addEventListener('click', openSheet);
    var nw = $('#tm-new');
    if (nw) nw.addEventListener('click', function () { newSession(false); closeSheet(); });

    var modelSel = $('#tm-model');
    if (modelSel) modelSel.addEventListener('change', function () { S.model = modelSel.value; lsSet('tm.model', S.model); });

    var memberSel = $('#tm-member');
    if (memberSel) {
      memberSel.innerHTML = MEMBERS.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('');
      memberSel.value = S.member;
      memberSel.addEventListener('change', function () { switchMember(memberSel.value); });
    }

    var ses = $('#tm-sessions');
    if (ses) ses.addEventListener('change', function () { S.current = ses.value; saveSessions(); renderMessages(); });

    var rename = $('#tm-rename');
    if (rename) rename.addEventListener('click', function () {
      var s = session();
      var n = prompt('重命名对话', s.title || '');
      if (n && n.trim()) { s.title = n.trim().slice(0, 40); touch(s); renderSessions(); }
    });
    var exp = $('#tm-export');
    if (exp) exp.addEventListener('click', exportMarkdown);
    var del = $('#tm-del');
    if (del) del.addEventListener('click', function () {
      if (!confirm('删除当前对话？')) return;
      S.sessions = S.sessions.filter(function (x) { return x.id !== S.current; });
      if (!S.sessions.length) newSession(true); else S.current = S.sessions[0].id;
      saveSessions(); renderSessions(); renderMessages();
    });

    var input = $('#tm-input');
    if (input) {
      input.addEventListener('input', function () { autoGrow(input); });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); }
      });
    }

    var sendBtn = $('#tm-send');
    if (sendBtn) sendBtn.addEventListener('click', function () {
      if (S.busy) { if (S.abort) S.abort.abort(); return; }
      send();
    });

    var resizer = $('#tm-resizer');
    if (resizer) {
      var dragging = false;
      resizer.addEventListener('pointerdown', function (e) {
        dragging = true;
        document.body.classList.add('tm-resizing');
        resizer.setPointerCapture(e.pointerId);
      });
      resizer.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        setWidth(window.innerWidth - e.clientX);
      });
      resizer.addEventListener('pointerup', function (e) {
        dragging = false;
        document.body.classList.remove('tm-resizing');
        try { resizer.releasePointerCapture(e.pointerId); } catch (err) {}
      });
      resizer.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { setWidth(S.width + 24); e.preventDefault(); }
        if (e.key === 'ArrowRight') { setWidth(S.width - 24); e.preventDefault(); }
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      var sheet = $('#tm-sheet');
      if (sheet && sheet.classList.contains('is-open')) { closeSheet(); return; }
      if (S.open) closePanel();
    });

    window.addEventListener('hashchange', function () {
      S.viewName = currentView();
      var name = $('#view-name');
      if (name) S.viewName = S.viewName || name.textContent.trim();
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    bind();
    setWidth(S.width);
    syncModelSelect();
    var sub = $('#tm-sub');
    if (sub) sub.textContent = '项目私人助理 · ' + S.member;
    S.viewName = currentView();
    var name = $('#view-name');
    if (name && !S.viewName) S.viewName = name.textContent.trim();
    setBusy(false);
    loadSessions();
    loadKb();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

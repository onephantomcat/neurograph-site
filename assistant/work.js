(() => {
  const find = id => document.getElementById('tm-' + id);
  const work = find('work');
  const panel = find('panel');
  const status = find('work-status');
  const form = find('work-form');
  const login = find('work-login');
  const logout = find('work-logout');
  const list = find('work-list');
  let credential = '';
  let submissionId = '';
  let refreshId = 0;
  const labels = {
    submitted: '待接单', planned: '待确认', approved: '已确认', queued: '待运行',
    running: '运行中', ready: '计算完成', failed: '执行失败', published: '结果已推送',
  };

  const endpoint = fetch(new URL('./assistant/config.json', document.baseURI), {cache: 'no-store'})
    .then(response => response.ok ? response.json() : {})
    .then(config => {
      const url = config.work_endpoint;
      if (!url) return null;
      const target = new URL(url);
      const local = ['localhost', '127.0.0.1'].includes(location.hostname) && target.hostname === location.hostname;
      if (target.username || target.password || target.search || target.hash || !/^\/work\/?$/.test(target.pathname)) return null;
      target.pathname = '/work/';
      return target.protocol === 'https:' || (local && target.protocol === 'http:') ? target : null;
    })
    .catch(() => null);

  async function request(route, body) {
    const base = await endpoint;
    if (!base) throw new Error('当前站点尚未连接 Work 服务。');
    const headers = credential ? {Authorization: 'Bearer ' + credential} : {};
    if (body) headers['Content-Type'] = 'application/json';
    let response;
    try {
      response = await fetch(new URL(route, base), {
        method: body ? 'POST' : 'GET', headers, redirect: 'error', ...(body ? {body: JSON.stringify(body)} : {}),
      });
    } catch {
      throw connectionError('Work 服务连接失败，请运行连接检测。');
    }
    if (!(response.headers.get('content-type') || '').includes('application/json')) {
      const content = await response.text();
      const code = /error code:\s*(\d{4})/i.exec(content)?.[1];
      if (response.status === 403) {
        const cloudflare = code || response.headers.get('cf-mitigated') === 'challenge' ||
          /cloudflare|challenge-platform/i.test(content);
        throw connectionError(cloudflare
          ? 'Cloudflare' + (code ? ' ' + code : '') + ' 返回了访问拦截响应。'
          : 'Work 服务拒绝了本次连接（HTTP 403）。');
      }
      throw connectionError('Work 服务返回了异常响应（HTTP ' + response.status + '）。');
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Work 请求未成功。');
    return data;
  }

  function connectionError(message) {
    return Object.assign(new Error(message), {workConnection: true});
  }

  function showFailure(error) {
    status.textContent = error.message;
    if (error.workConnection) {
      const link = document.createElement('a');
      link.href = new URL('./assistant/work-check.html', document.baseURI).href;
      link.textContent = '运行连接检测';
      link.target = '_blank';
      link.rel = 'noopener';
      status.append(' ', link);
    }
  }

  function render(tasks) {
    list.replaceChildren(...tasks.map(task => {
      const row = document.createElement('li');
      const title = document.createElement('strong');
      const meta = document.createElement('div');
      title.textContent = task.title;
      const state = task.publication === 'publishing' ? '计算完成，等待发布确认' : (labels[task.state] || task.state);
      const time = new Date(task.started_at || task.updated_at).toLocaleString();
      meta.textContent = [state, task.host, time].filter(Boolean).join(' · ');
      row.append(title, meta);
      if (task.request) {
        const details = document.createElement('details');
        const heading = document.createElement('summary');
        const content = document.createElement('pre');
        heading.textContent = '查看需求与执行单';
        content.textContent = [task.owner, task.request, task.plan].filter(Boolean).join('\n\n');
        details.append(heading, content);
        row.append(details);
      }
      return row;
    }));
  }

  async function refresh() {
    const id = ++refreshId;
    try {
      const data = await request(credential ? 'tasks' : 'public');
      if (id !== refreshId) return;
      render(data.tasks);
      status.textContent = data.member ? '已连接 · ' + data.member : '公开任务进展';
    } catch (error) {
      if (id === refreshId) showFailure(error);
    }
  }

  function select(isWork) {
    panel.classList.toggle('tm-work-open', isWork);
    find('mode-chat').setAttribute('aria-pressed', String(!isWork));
    find('mode-work').setAttribute('aria-pressed', String(isWork));
    work.hidden = !isWork;
    if (isWork) refresh();
  }

  find('mode-chat').addEventListener('click', () => select(false));
  find('mode-work').addEventListener('click', () => select(true));
  panel.addEventListener('tm:show-chat', () => select(false));
  find('work-refresh').addEventListener('click', refresh);
  setInterval(() => {
    if (!work.hidden && panel.getAttribute('aria-hidden') === 'false') refresh();
  }, 15000);
  logout.addEventListener('click', () => {
    credential = '';
    submissionId = '';
    form.reset();
    list.replaceChildren();
    login.hidden = false;
    form.hidden = logout.hidden = true;
    refresh();
  });
  login.addEventListener('submit', async event => {
    event.preventDefault();
    const button = login.querySelector('button');
    button.disabled = true;
    credential = find('work-key').value.trim();
    find('work-key').value = '';
    try {
      await request('tasks');
      login.hidden = true;
      form.hidden = logout.hidden = false;
      await refresh();
    } catch (error) {
      credential = '';
      showFailure(error);
    } finally {
      button.disabled = false;
    }
  });
  form.addEventListener('input', () => { submissionId = ''; });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button');
    button.disabled = true;
    submissionId ||= crypto.randomUUID();
    try {
      await request('tasks', {
        id: submissionId,
        title: find('work-title').value.trim(),
        request: find('work-request').value.trim(),
      });
      submissionId = '';
      form.reset();
      await refresh();
    } catch (error) {
      showFailure(error);
    } finally {
      button.disabled = false;
    }
  });
})();

'use strict';

const EvidenceContext = (() => {
  let active;
  let pdfLibrary;
  const dialog = document.querySelector('#detail-dialog');
  const library = new URL('../vendor/pdfjs/', document.currentScript.src);
  const button = (label, action) => {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = 'button';
    node.textContent = label;
    node.addEventListener('click', action);
    return node;
  };

  function reference(state, kind, locator = '', excerpt = '') {
    window.MiniTM?.addReference({sourceId: state.source.id, title: state.source.label, kind, locator, excerpt});
  }

  function bind(source, root) {
    active?.dispose?.();
    const state = {source, root, selection: null};
    active = state;
    dialog.querySelector('.report-actions').append(
      button('引用整份资料', () => reference(state, 'document'))
    );
    const ask = button('向 mini TM 提问', () => {
      if (state.selection) reference(state, 'selection', state.selection.locator, state.selection.text);
    });
    ask.classList.add('evidence-selection');
    ask.hidden = true;
    ask.addEventListener('pointerdown', event => event.preventDefault());
    dialog.append(ask);
    state.dispose = () => {
      ask.remove();
      state.stopPDF?.();
    };
    state.ask = ask;
    return state;
  }

  function locate(locator) {
    if (!locator || !active?.root.isConnected) return;
    const target = [...active.root.querySelectorAll('[data-evidence-locator]')]
      .find(node => node.dataset.evidenceLocator === locator);
    if (!target) return;
    target.scrollIntoView({block: 'center'});
    target.classList.remove('evidence-target');
    requestAnimationFrame(() => target.classList.add('evidence-target'));
  }

  function decorate(root) {
    const prose = root.querySelector('.report-prose');
    prose?.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,pre').forEach((node, index) => {
      node.dataset.evidenceLocator = '段落 ' + (index + 1);
    });
    root.querySelectorAll('table').forEach((table, tableIndex) => {
      const header = table.tHead?.rows[0];
      const headers = [...(header?.cells || [])].map(cell => cell.textContent.trim());
      if (header && !header.querySelector('[data-evidence-column]')) {
        const column = document.createElement('th');
        column.scope = 'col';
        column.textContent = '引用';
        column.dataset.evidenceColumn = '';
        header.append(column);
      }
      [...table.tBodies].flatMap(body => [...body.rows]).forEach((row, index) => {
        const locator = row.dataset.evidenceLocator || `表 ${tableIndex + 1} · 第 ${index + 1} 行`;
        row.dataset.evidenceLocator = locator;
        const values = [...row.cells].map((cell, i) => [headers[i], cell.textContent.trim()].filter(Boolean).join('：'));
        row.insertCell().append(button('引用此行', () => {
          if (active?.root === root) reference(active, 'row', locator, values.join('\n'));
        }));
      });
    });
  }

  function delimited(text, delimiter, truncated) {
    const rows = [];
    let row = [], value = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"' && (quoted || !value)) {
        if (quoted && text[i + 1] === '"') { value += '"'; i++; }
        else quoted = !quoted;
      } else if (!quoted && (char === delimiter || char === '\n' || char === '\r')) {
        row.push(value);
        value = '';
        if (char !== delimiter) {
          if (char === '\r' && text[i + 1] === '\n') i++;
          rows.push(row);
          row = [];
        }
      } else value += char;
    }
    if (!truncated && !quoted && (row.length || value)) rows.push([...row, value]);
    return rows;
  }

  function table(root, text, format, truncated, locator) {
    const rows = delimited(text.replace(/^\uFEFF/, ''), format === 'tsv' ? '\t' : ',', truncated);
    const header = rows.shift();
    if (!header) { root.textContent = '没有可预览的表格行。'; return; }
    const wrap = document.createElement('div');
    wrap.className = 'report-table';
    wrap.tabIndex = 0;
    const grid = document.createElement('table');
    const headings = grid.createTHead().insertRow();
    for (const label of header) {
      const th = document.createElement('th');
      th.scope = 'col';
      th.textContent = label;
      headings.append(th);
    }
    const pageSize = 100;
    const status = document.createElement('span');
    let start = Math.max(0, (Number(/第 (\d+) 行/.exec(locator)?.[1]) || 1) - 1);
    start = Math.floor(Math.min(start, Math.max(0, rows.length - 1)) / pageSize) * pageSize;
    const previous = button('上一页', () => { start = Math.max(0, start - pageSize); draw(); });
    const next = button('下一页', () => { start += pageSize; draw(); });
    function draw() {
      grid.tBodies[0]?.remove();
      const body = grid.createTBody();
      for (const values of rows.slice(start, start + pageSize)) {
        const row = body.insertRow();
        row.dataset.evidenceLocator = `表 1 · 第 ${start + row.sectionRowIndex + 1} 行`;
        for (const value of values) row.insertCell().textContent = value;
      }
      decorate(root);
      previous.disabled = start === 0;
      next.disabled = start + pageSize >= rows.length;
      status.textContent = rows.length ? `第 ${start + 1}–${Math.min(rows.length, start + pageSize)} 行／${rows.length} 行` : '无数据行';
    }
    wrap.append(grid);
    root.replaceChildren(previous, status, next, wrap);
    if (truncated) {
      const note = document.createElement('p');
      note.textContent = '此处显示文件预览，完整数据可下载。';
      root.append(note);
    }
    draw();
  }

  async function pdf(state, url, locator) {
    const {root} = state;
    const status = document.createElement('p');
    const stage = document.createElement('div');
    stage.className = 'evidence-pdf';
    let pageNumber = 1, revision = 0, doc, renderTask, textLayer, loadingTask, module;
    const previous = button('上一页', () => show(pageNumber - 1));
    const next = button('下一页', () => show(pageNumber + 1));
    const cite = button('引用本页', () => reference(state, 'page', stage.dataset.evidenceLocator, stage.querySelector('.textLayer')?.textContent || ''));
    state.stopPDF = () => { revision++; renderTask?.cancel(); textLayer?.cancel(); loadingTask?.destroy().catch(() => {}); };
    root.replaceChildren(status);
    status.textContent = '正在打开 PDF…';
    async function show(requested) {
      const version = ++revision;
      renderTask?.cancel();
      textLayer?.cancel();
      pageNumber = Math.max(1, Math.min(doc.numPages, requested));
      stage.dataset.evidenceLocator = `第 ${pageNumber} 页`;
      previous.disabled = pageNumber === 1;
      next.disabled = pageNumber === doc.numPages;
      cite.disabled = true;
      status.textContent = `第 ${pageNumber}／${doc.numPages} 页`;
      try {
        const page = await doc.getPage(pageNumber);
        if (version !== revision) return;
        const width = Math.min(1050, Math.max(220, root.clientWidth - 12));
        const scale = width / page.getViewport({scale: 1}).width;
        const viewport = page.getViewport({scale});
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(viewport.width);
        canvas.height = Math.ceil(viewport.height);
        const layer = document.createElement('div');
        layer.className = 'textLayer';
        layer.style.setProperty('--total-scale-factor', String(scale));
        layer.style.setProperty('--scale-factor', String(scale));
        stage.style.width = viewport.width + 'px';
        stage.style.height = viewport.height + 'px';
        stage.replaceChildren(canvas, layer);
        renderTask = page.render({canvas, viewport});
        textLayer = new module.TextLayer({textContentSource: page.streamTextContent(), container: layer, viewport});
        await Promise.all([renderTask.promise, textLayer.render()]);
        if (version !== revision) return;
        cite.disabled = false;
        if (!layer.textContent.trim()) status.textContent += ' · 无可选文字';
      } catch {
        if (version === revision) status.textContent = '当前页未能预览，可打开 PDF 原件。';
      }
    }
    try {
      pdfLibrary ||= import(new URL('pdf.js', library)).then(module => {
        module.GlobalWorkerOptions.workerSrc = new URL('pdf.worker.js', library).href;
        return module;
      });
      if (!document.querySelector('#evidence-pdf-css')) {
        const css = document.createElement('link');
        css.id = 'evidence-pdf-css';
        css.rel = 'stylesheet';
        css.href = new URL('pdf_viewer.css', library).href;
        document.head.append(css);
      }
      module = await pdfLibrary;
      if (!root.isConnected || active !== state) return;
      loadingTask = module.getDocument({url, isEvalSupported: false});
      doc = await loadingTask.promise;
      if (!root.isConnected || active !== state) return;
      root.replaceChildren(previous, status, next, cite, stage);
      await show(Number(/第 (\d+) 页/.exec(locator)?.[1]) || 1);
    } catch {
      if (root.isConnected && active === state) status.textContent = 'PDF 预览未能加载，可打开原件。';
    }
  }

  document.addEventListener('selectionchange', () => {
    if (!dialog.open || !active?.root.isConnected) return;
    const {root, ask} = active;
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || !root.contains(selection.anchorNode) || !root.contains(selection.focusNode)) {
      ask.hidden = true;
      active.selection = null;
      return;
    }
    const range = selection.getRangeAt(0);
    const start = range.startContainer;
    const element = start.nodeType === Node.ELEMENT_NODE ? start : start.parentElement;
    const locator = element?.closest('[data-evidence-locator]')?.dataset.evidenceLocator || '';
    active.selection = {text, locator};
    const rect = range.getBoundingClientRect();
    ask.hidden = false;
    ask.style.left = Math.max(8, Math.min(rect.left, innerWidth - ask.offsetWidth - 8)) + 'px';
    ask.style.top = Math.max(8, Math.min(rect.bottom + 8, innerHeight - ask.offsetHeight - 8)) + 'px';
  });

  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    active?.dispose?.();
    active = null;
  });
  dialog.addEventListener('scroll', () => { if (active) active.ask.hidden = true; }, true);
  return {bind, decorate, locate, table, pdf};
})();

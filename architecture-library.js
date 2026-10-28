(() => {
  'use strict';
  const core = window.ArchitectureCore;
  const coverage = {full_text:'已读本地全文', partial_text:'已核部分正文', abstract_only:'仅核摘要', local_summary:'仅有本地整理'};
  const kinds = {model:'模型论文', method:'方法与评估', dataset:'数据集', review:'综述', measure:'量表与测量', clinical:'临床研究'};
  const figures = {full:'原框架已核对', partial:'框架需补全', none:'自行绘制流程', not_verified:'原图尚未核实'};
  const roleNames = {input:'输入', preprocess:'预处理', encoder:'特征编码', fusion:'信息融合', head:'预测', loss:'训练目标', evaluation:'评价', output:'输出'};
  let root, base, index, paper, selected, selectedVersion, variantId, mode = 'current', zoom = 1, sequence = 0, engine;
  let proposals = {}, references = [], diagramObserver, paperOverviewHTML='', standaloneId;
  const cache = new Map();
  const $ = selector => document.querySelector(selector);
  const variant = () => core.activeVariant(paper,variantId);
  const paperProposals = () => proposals[paper.id]?.[variant().id] || {};
  const moduleProposal = id => paperProposals()[id];
  const visibleModules = () => core.visibleModules(paper,mode,variant());
  const moduleSnapshot = module => core.snapshot(module,mode,moduleProposal(module.id),variant());
  const esc = text => String(text ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  function status(message, error = false) {
    const target = $('#architecture-status');
    target.textContent = message; target.classList.toggle('architecture-error', error);
  }
  function readJSON(url) {
    return fetch(new URL(url, base)).then(response => {
      if (!response.ok) throw new Error(`模型架构读取失败（${response.status}）`);
      return response.json();
    });
  }
  function localProposals() {
    const saved = localStorage.getItem('neurograph-architecture-proposals-v2');
    if (!saved) return {};
    const value = JSON.parse(saved);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('本机提议格式不正确，请检查浏览器存储');
    return value;
  }
  function shell() {
    root.innerHTML = `<div class="page-heading"><div><span class="eyebrow">MODEL ARCHITECTURES</span><h1>模型架构</h1><p>从论文输入走到研究输出，逐个模块查看方法与项目改动。</p></div></div>
      <div class="architecture-intro"><span id="architecture-total"></span><span>本地材料核查 · 按篇加载</span><details><summary>阅读范围与后续添加</summary><p>每篇保留正文、摘要和原图核查范围。模型论文展示网络结构，其他文章展示实际研究流程。图中虚线表示训练或辅助关系。新增论文由 Codex 阅读本地文件后登记。</p><p>浏览器提议只保存在本机。Codex 实施并登记版本后，图中的模块会显示“已修改”等状态。</p></details></div>
      <div class="architecture-filters"><label>搜索文章<input type="search" id="architecture-search" placeholder="模型、论文标题、论文编号" autocomplete="off"></label><label>文章类型<select id="architecture-kind" aria-label="文章类型"><option value="">全部类型</option>${Object.entries(kinds).map(([key,value])=>`<option value="${key}">${value}</option>`).join('')}</select></label><label>材料范围<select id="architecture-coverage" aria-label="材料范围"><option value="">全部阅读范围</option>${Object.entries(coverage).map(([key,value])=>`<option value="${key}">${value}</option>`).join('')}</select></label></div>
      <div id="architecture-status" class="architecture-status" role="status" aria-live="polite">正在读取文献索引…</div>
      <div class="architecture-layout"><aside class="architecture-catalog" aria-label="文献分类目录"><div id="architecture-count"></div><div id="architecture-list"></div></aside><div class="architecture-workspace"><div id="architecture-paper"><div class="architecture-empty"><h2>选择一篇文章</h2><p>从左侧目录打开文章，查看模块图、论文分析和版本详情。</p></div></div><details class="architecture-prompt" id="architecture-prompt-panel"><summary>模块引用与修改提示词 <span id="architecture-ref-count">0</span></summary><div id="architecture-references"></div><label>希望修改什么<textarea id="architecture-goal" rows="3" placeholder="例如：冻结编码器，仅调整分类模块，并解释各参数的作用。"></textarea></label><div class="architecture-actions"><button type="button" data-action="copy-prompt">复制修改提示词</button><button type="button" data-action="export">下载本机提议</button></div><details><summary>查看生成的提示词</summary><textarea id="architecture-prompt-text" rows="9" readonly aria-label="生成的修改提示词"></textarea></details></details></div></div>`;
    ResearchWorkbench.initInspector(root);
    for (const id of ['search','kind','coverage']) $('#architecture-'+id).addEventListener('input', renderCatalog);
    $('#architecture-goal').addEventListener('input', renderPrompt);
    root.onclick = event => {
      const target = event.target.closest('[data-paper],[data-model],[data-module],[data-action]');
      if (!target || !root.contains(target) && !ResearchWorkbench.panel.contains(target)) return;
      if (target.dataset.paper) openPaper(target.dataset.paper).catch(fail);
      else if (target.dataset.model) openStandalone(target.dataset.model).catch(fail);
      else if (target.dataset.module) selectModule(target.dataset.module, true).catch(fail);
      else action(target.dataset.action, target).catch(fail);
    };
    root.onchange = event => {
      if (event.target.id === 'architecture-version' || event.target.id === 'architecture-variant') {
        if (event.target.id === 'architecture-version') mode = event.target.value;
        else {variantId=event.target.value; mode='current';}
        selectedVersion=undefined;
        if (!visibleModules().some(module=>module.id===selected)) selected=undefined;
        renderPaper(selected).then(()=>draw()).catch(fail); route(selected);
      }
    };
    root.onsubmit = event => {
      if (event.target.id === 'architecture-proposal-form') {
        event.preventDefault(); saveProposal(new FormData(event.target)).catch(fail);
      }
    };
  }
  const fail = error => status(error.message, true);
  function executionMarks(id) {
    const counts=ResearchWorkbench.index.models.find(item=>item.id===id).executionCounts;
    const completed=counts.completed,running=counts.running;
    if(!completed&&!running)return '';
    const title=`已完成 ${completed} 次；正在进行 ${running} 次。按模型 × 数据集的一次活动计数，仅统计已核定执行记录；完成不代表 AUC 提升。`;
    return `<span class="architecture-run-marks" role="img" aria-label="${esc(title)}" title="${esc(title)}">${completed?`<span class="architecture-run-mark completed ${completed>3?'is-count':''}">${completed>3?completed:'<i></i>'.repeat(completed)}</span>`:''}${running?`<span class="architecture-run-mark running">${'<i></i>'.repeat(running)}</span>`:''}</span>`;
  }
  function renderCatalog() {
    const query = $('#architecture-search').value.trim().toLocaleLowerCase();
    const kind = $('#architecture-kind').value, range = $('#architecture-coverage').value;
    const matches = index.papers.filter(item => (!kind || item.kind === kind) && (!range || item.coverage === range) && `${item.id} ${item.name} ${item.title} ${item.summary}`.toLocaleLowerCase().includes(query));
    $('#architecture-count').textContent = `显示 ${matches.length} / ${index.papers.length} 篇 · 最近修改优先`;
    const extra=ResearchWorkbench.index.models.filter(item=>!item.paperId && (!kind||kind==='model') && !range && (!query || (item.id+' '+item.name).toLocaleLowerCase().includes(query))).map(item=>({...item,standalone:true}));
    const groups = new Map();
    for (const item of ResearchCore.recentModels([...matches,...extra],ResearchWorkbench.index)) {
      const key = item.standalone?'其他已登记模型':kinds[item.kind];
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    $('#architecture-list').innerHTML = [...groups].map(([name,items],position)=>`<details class="architecture-group" ${query||kind||position===0||items.some(item=>item.id===(standaloneId||paper?.id))?'open':''}><summary>${name}<span>${items.length}</span></summary>${items.map(item=>{
      const active=item.id===(standaloneId||paper?.id),modified=ResearchWorkbench.index.models.find(model=>model.id===item.id).lastModified;
      return `<button type="button" class="architecture-entry ${active?'is-active':''}" data-${item.standalone?'model':'paper'}="${esc(item.id)}" data-last-modified="${esc(modified||'')}" ${active?'aria-current="true"':''} title="最近修改：${modified?esc(new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',dateStyle:'medium'}).format(new Date(modified))):'尚未登记'}">${item.standalone?'':`<span>${item.id} · ${esc(item.year)}</span>`}<strong class="architecture-entry-name"><span class="architecture-model-name">${esc(item.name)}</span>${executionMarks(item.id)}</strong><small>${item.standalone?'项目运行与数据记录':coverage[item.coverage]+(item.revised?' · 有项目版本':'')}</small></button>`;
    }).join('')}</details>`).join('')||'<p class="architecture-empty">没有符合条件的文章。</p>';
  }
  function route(moduleId, versionId = selectedVersion) {
    const params = new URLSearchParams({paper:paper.id});
    const previous=new URLSearchParams(location.hash.split('?')[1]||'');
    if(previous.get('paper')===paper.id)for(const key of ['activity','dataset','fromEvent','date','tab'])if(previous.has(key))params.set(key,previous.get(key));
    params.set('mode',mode);
    if (variant().id!=='paper') params.set('variant',variant().id);
    if (moduleId) params.set('module', moduleId);
    if (moduleId && versionId) params.set('version', versionId);
    history.replaceState(null, '', '#architectures?'+params);
  }
  async function openPaper(id, moduleId, versionId, requestedVariant) {
    if (!index.papers.some(item=>item.id===id)) throw new Error('目录中没有该论文编号');
    const token = ++sequence;
    if (paper?.id !== id) {
      status(`正在读取 ${id}…`);
      if (!cache.has(id)) cache.set(id, readJSON(`architectures/${id}.json`).catch(error=>{cache.delete(id);throw error;}));
      const result = await cache.get(id);
      if (token !== sequence || root.hidden) return;
      paper = result; selected = undefined; selectedVersion=undefined; variantId=requestedVariant; zoom = 1;
    }
    if (moduleId && !paper.modules.some(module=>module.id===moduleId)) throw new Error('该论文中没有此模块引用');
    variantId = variant().id==='paper' ? undefined : variant().id;
    selected=moduleId || undefined; selectedVersion=versionId || undefined;
    standaloneId=undefined;
    renderCatalog(); await renderPaper(selected, selectedVersion);
    route(selected);
    await draw();
    if (token === sequence) status(`已打开 ${paper.id} · ${paper.modules.length} 个模块 · ${coverage[paper.reading.coverage]}`);
  }
  function parameters(items) {
    return items.length ? `<div class="architecture-table-wrap"><table><caption>参数及解释</caption><thead><tr><th>参数</th><th>取值</th><th>作用与依据</th></tr></thead><tbody>${items.map(item=>`<tr><th scope="row">${esc(item.name)}</th><td>${esc(item.value)}</td><td>${esc(item.meaning)}<small>${esc(item.evidence)}</small></td></tr>`).join('')}</tbody></table></div>` : '<p class="architecture-muted">此模块未核定可引用的原文参数。</p>';
  }
  function versionBody(version) {
    return `<p>${esc(version.description)}</p><dl><dt>输入</dt><dd>${esc(version.inputs)}</dd><dt>输出</dt><dd>${esc(version.outputs)}</dd></dl>${parameters(version.parameters)}${version.baseVersion?`<p>提议依据版本：<code>${esc(version.baseVersion)}</code></p>`:''}${version.reason?`<p>修改原因：${esc(version.reason)}</p>`:''}<small class="architecture-evidence">依据：${esc(version.evidence)}</small>`;
  }
  function originalFigures() {
    const assets = paper.reading.figure.assets || [];
    if (!assets.length) return `<details class="architecture-original"><summary>论文原图</summary><p>尚未收录这篇文章可核对的原图。下方交互图依据已注明的材料重绘。${paper.citation ? ` <a href="${esc(paper.citation)}" target="_blank" rel="noopener noreferrer">前往原文查看 ↗</a>` : ''}</p></details>`;
    return `<details class="architecture-original" open><summary>论文原图 · ${assets.map(item=>esc(item.label)).join('、')}</summary><p class="architecture-muted">保留作者图中的结构与标注。下方交互图可点击模块，查看项目改动并生成修改提示词。</p>${assets.map(item=>{const url = new URL(item.path, base).href;return `<figure><a href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="放大查看 ${esc(paper.name+' '+item.label)} 原图"><img src="${esc(url)}" alt="${esc(item.alt)}" width="${item.width}" height="${item.height}" loading="lazy" decoding="async"></a><figcaption><strong>${esc(item.label)}</strong> · ${esc(item.credit)} <a href="${esc(item.source)}" target="_blank" rel="noopener noreferrer">论文来源 ↗</a> <a href="${esc(url)}" target="_blank" rel="noopener noreferrer">放大查看原图 ↗</a></figcaption></figure>`;}).join('')}</details>`;
  }
  function diagramPanel() {
    const icon=paths=>`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
    const control=(action,label,paths)=>`<button type="button" class="architecture-icon-control" data-action="${action}" aria-label="${label}" title="${label}" data-tooltip="${label}">${icon(paths)}</button>`;
    return `<div class="architecture-diagram-frame"><div class="architecture-graph-toolbar" role="toolbar" aria-label="架构图工具">
      <details class="architecture-view-menu"><summary class="architecture-icon-control" aria-label="结构版本与项目方案" title="结构版本与项目方案" data-tooltip="结构版本与项目方案">${icon('<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="white"/><circle cx="15" cy="17" r="3" fill="white"/>')}</summary><div class="architecture-view-options"><label>结构版本<select id="architecture-version" aria-label="结构版本"><option value="current" ${mode==='current'?'selected':''}>项目改动与本机提议</option><option value="paper" ${mode==='paper'?'selected':''}>论文原版</option></select></label>${paper.variants?.length?`<label>项目方案<select id="architecture-variant" aria-label="项目方案">${paper.variants.map(item=>`<option value="${esc(item.id)}" ${item.id===variant().id?'selected':''}>${esc(item.label)}</option>`).join('')}</select></label>`:''}<p>独立方案分别查看，未登记模块保留论文说明。</p></div></details>
      ${control('zoom-out','缩小架构图','<path d="M5 12h14"/>')}${control('zoom-reset','适合窗口','<path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5"/>')}${control('zoom-in','放大架构图','<path d="M5 12h14M12 5v14"/>')}<output id="architecture-zoom" aria-label="架构图缩放比例"></output>${control('download-graph','下载 Mermaid 图','<path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/>')}</div>
      <div class="architecture-diagram-scroll" tabindex="0" aria-label="架构图，可左右滚动"><div id="architecture-diagram" aria-busy="true"><p>正在绘制模块图…</p></div></div><div class="architecture-legend" aria-label="模块颜色说明">${Object.entries(core.states).map(([state,label])=>`<span class="architecture-state ${state}"><i aria-hidden="true"></i>${label}</span>`).join('')}</div></div>`;
  }
  async function renderPaper(moduleId, versionId) {
    const analysis = paper.analysis, reading = paper.reading;
    const citation = /^https?:\/\//.test(paper.citation) ? `<a href="${esc(paper.citation)}" target="_blank" rel="noopener noreferrer">论文出处 ↗</a>` : '';
    $('#architecture-paper').innerHTML = `<article class="architecture-card"><header><span class="eyebrow">${paper.id} · ${esc(kinds[paper.kind])} · ${esc(paper.year)}</span><h2>${esc(paper.name)}</h2><p class="architecture-title">${esc(paper.title)}</p><p>${esc(paper.summary)}</p><div class="architecture-tags"><span>${coverage[reading.coverage]}</span><span>${figures[reading.figure.status]}</span>${citation}</div></header>
      <div class="architecture-io"><div><strong>输入</strong><p>${esc(analysis.input)}</p></div><span aria-hidden="true">→</span><div><strong>输出</strong><p>${esc(analysis.output)}</p></div></div>
      <details class="architecture-analysis"><summary>论文方法、创新与核查依据</summary><h3>训练或估计</h3><p>${esc(analysis.training)}</p><h3>推理或使用</h3><p>${esc(analysis.inference)}</p><h3>论文创新</h3><ul>${analysis.innovations.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><h3>限制与项目关联</h3><ul>${analysis.limitations.map(item=>`<li>${esc(item)}</li>`).join('')}</ul><p>${esc(analysis.projectRelation)}</p><h3>原框架图及重绘范围</h3><p>${esc(reading.figure.label)} · ${esc(reading.figure.explanation)}</p><p>${esc(reading.figure.completion)}</p><ul>${reading.files.map(file=>`<li>${esc(file.name)} · ${esc(file.locator)}<br>${esc(file.detail)}</li>`).join('')}</ul></details>
      ${originalFigures()}<h3>交互模块图</h3>${diagramPanel()}<div class="architecture-module-list" aria-label="选择架构模块">${visibleModules().map(module=>{const version=moduleSnapshot(module);return `<button type="button" data-module="${module.id}" class="${version.state}" aria-expanded="false" aria-controls="architecture-module-detail">${esc(module.label)}<small>${core.states[version.state]}</small></button>`;}).join('')}</div><details id="architecture-module-detail" class="architecture-module-detail"><summary>模块详情 <span id="architecture-module-name">请选择模块</span></summary><div id="architecture-module-body"></div></details></article>`;
    const card=$('#architecture-paper');
    paperOverviewHTML=`<h3>${esc(paper.name)}</h3><p>${esc(paper.title)}</p><p>${esc(paper.summary)}</p><dl><dt>输入</dt><dd>${esc(analysis.input)}</dd><dt>输出</dt><dd>${esc(analysis.output)}</dd></dl>`+card.querySelector('.architecture-analysis').outerHTML+card.querySelector('.architecture-original').outerHTML;
    card.querySelector('.architecture-analysis').remove();card.querySelector('.architecture-original').remove();
    card.querySelector('.architecture-title').remove();card.querySelector('#architecture-module-detail').remove();
    card.querySelector('header>p')?.remove();
    const inputModule=paper.modules.find(item=>item.role==='input'),outputModule=[...paper.modules].reverse().find(item=>['output','head','evaluation'].includes(item.role));
    card.querySelector('.architecture-io').innerHTML=`<div><strong>输入</strong><p>${esc(inputModule?.original.inputs||analysis.input)}</p></div><span aria-hidden="true">→</span><div><strong>输出</strong><p>${esc(outputModule?.original.outputs||analysis.output)}</p></div>`;
    const directory=document.createElement('details');directory.className='architecture-module-directory';directory.innerHTML='<summary>模块目录（也可点击图中模块）</summary>';
    const list=card.querySelector('.architecture-module-list');list.before(directory);directory.append(list);
    card.querySelector('.architecture-tags').insertAdjacentHTML('afterend','<div class="architecture-actions architecture-inspector-openers"><button type="button" data-action="overview">模型说明与原图</button><button type="button" data-action="show-data">数据与结果</button><button type="button" data-action="show-notes">人工备注</button></div>');
    if (moduleId) await selectModule(moduleId, false, versionId);
    else await ResearchWorkbench.setContext(inspectorContext(),paperOverviewHTML);
  }
  function inspectorContext(module,current) {
    const params=new URLSearchParams(location.hash.split('?')[1]||'');
    const same=params.get('paper')===paper?.id;
    return {paper,modelId:paper.id,modelName:paper.name,variant:mode==='paper'?{id:'paper',label:'论文原版'}:variant(),moduleId:module?.id,moduleLabel:module?.label,versionId:current?.id,
      activityId:same?params.get('activity')||undefined:undefined,datasetId:same?params.get('dataset')||undefined:undefined,
      fromEvent:same?params.get('fromEvent')||undefined:undefined,day:same?params.get('date')||undefined:undefined,tab:same?params.get('tab')||'description':'description'};
  }
  async function openStandalone(id) {
    await ResearchWorkbench.flush();
    const model=ResearchWorkbench.index.models.find(item=>item.id===id&&!item.paperId);
    if(!model)throw new Error('该模型未登记');
    standaloneId=id;paper=undefined;selected=undefined;selectedVersion=undefined;sequence++;
    const params=new URLSearchParams(location.hash.split('?')[1]||'');
    if(params.get('model')!==id){for(const key of [...params.keys()])params.delete(key);params.set('model',id);}
    params.set('model',id);history.replaceState(null,'','#architectures?'+params);
    $('#architecture-paper').innerHTML=`<article class="architecture-card"><h2>${esc(model.name)}</h2><p>已关联项目运行、数据用途和评价记录。本模型的逐模块架构尚未登记；当前不根据模型名称补造结构。</p><button type="button" data-action="show-data">查看数据与结果</button><button type="button" data-action="show-notes">人工备注</button></article>`;
    renderCatalog();
    await ResearchWorkbench.setContext({modelId:id,modelName:model.name,activityId:params.get('activity')||undefined,datasetId:params.get('dataset')||undefined,fromEvent:params.get('fromEvent')||undefined,day:params.get('date')||undefined,tab:params.get('tab')||'data'},`<h3>${esc(model.name)}</h3><p>架构登记待本地方法与实现核查；已有结果在“数据与结果”中分别保留。</p>`);
    ResearchWorkbench.glow($('#architecture-paper'));status('已打开 '+model.name+' 的研究记录');
  }
  async function selectModule(id, focus, versionId) {
    const module = paper.modules.find(item=>item.id===id);
    if (!module) throw new Error('模块不存在');
    const chain = core.versions(module);
    if (moduleProposal(id)) chain.push(moduleProposal(id));
    const version = versionId ? chain.find(item=>item.id===versionId) : undefined;
    if (versionId && !version) throw new Error('该模块版本不存在；本机提议需在原浏览器查看或从导出文件核查');
    const current = version ? {...version,state:version.status==='original'?'original':version.status==='proposed'?'proposed':version.change||'modified'} : moduleSnapshot(module);
    selected = id; selectedVersion=current.id; route(id,current.id);
    $('#architecture-module-name').textContent = module.label;
    $('#architecture-module-body').innerHTML = `<div class="architecture-module-heading"><span>${roleNames[module.role]}</span><code>${esc(core.reference(paper,module,current))}</code><button type="button" data-action="reference">加入提示词引用</button><button type="button" data-action="copy-reference">复制引用</button></div><p class="architecture-current">正在查看：${current.id==='paper'?'论文原版':esc(current.label)} · ${core.states[current.state]}</p>${chain.map((version,i)=>`${i?'<div class="architecture-version-arrow" aria-label="演进至下一版本">↓</div>':''}<details class="architecture-version ${version.status==='original'?'original':version.status==='proposed'?'proposed':version.change||'modified'}" ${version.id===current.id?'open':''}><summary>${esc(version.label)}${version.date?' · '+esc(version.date):''}<span>${version.status==='original'?'原始模块':version.status==='proposed'?'待实施提议':'已实施'}</span></summary>${versionBody(version)}<div class="architecture-actions"><button type="button" data-action="reference-version" data-version="${esc(version.id)}">引用此版本</button><button type="button" data-action="copy-version" data-version="${esc(version.id)}">复制此版本引用</button></div></details>`).join('')}<details class="architecture-edit"><summary>提出这个模块的修改</summary><form id="architecture-proposal-form"><p>填写后图中显示紫色，并保留原版及已实施版本。提议保存在当前浏览器的“${esc(variant().label)}”方案，下载后可交给 Codex。</p><label>修改说明<textarea name="description" rows="3" required maxlength="6000">${esc(current.description)}</textarea></label><label>输入<input name="inputs" required value="${esc(current.inputs)}" maxlength="2000"></label><label>输出<input name="outputs" required value="${esc(current.outputs)}" maxlength="2000"></label><label>修改原因<textarea name="reason" required rows="2" maxlength="2000"></textarea></label><fieldset><legend>补充或修改一个参数（可选）</legend><label>参数名称<input name="parameterName" maxlength="100"></label><label>参数值<input name="parameterValue" maxlength="500"></label><label>参数作用<input name="parameterMeaning" maxlength="2000"></label></fieldset><div class="architecture-actions"><button type="submit">保存本机提议</button>${moduleProposal(id)?'<button type="button" data-action="discard-proposal">移除本机提议</button>':''}</div></form></details>`;
    const detail = $('#architecture-module-detail'); detail.open = true;
    root.querySelectorAll('[data-module]').forEach(button=>{button.setAttribute('aria-expanded',String(button.dataset.module===id));button.classList.toggle('is-selected',button.dataset.module===id);});
    root.querySelectorAll('#architecture-diagram .node').forEach(node=>node.classList.toggle('is-selected',node.dataset.moduleId===id));
    const context=inspectorContext(module,current);if(focus)context.tab='description';
    await ResearchWorkbench.setContext(context,paperOverviewHTML);
    if (focus) detail.querySelector('summary').focus({preventScroll:true});
  }
  async function graphEngine() {
    if (!engine) engine = import(new URL('vendor/mermaid/mermaid-entry.js',base)).then(({default:mermaid})=>{
      mermaid.initialize({startOnLoad:false, securityLevel:'strict', theme:'base', themeVariables:{fontFamily:'system-ui, Microsoft YaHei, sans-serif', fontSize:'15px', lineColor:'#71849b'}, flowchart:{htmlLabels:false, useMaxWidth:true, curve:'basis'}, deterministicIds:true});
      return mermaid;
    }).catch(()=>{engine=undefined;throw new Error('架构图引擎读取失败，请重新打开文章');});
    return engine;
  }
  async function draw() {
    const target = $('#architecture-diagram'), token = sequence, currentPaper = paper;
    const mermaid = await graphEngine();
    if (target !== $('#architecture-diagram') || token !== sequence) return;
    const result = await mermaid.render('architecture-svg-'+Date.now(), core.graph(currentPaper,mode,paperProposals(),variant()));
    if (target !== $('#architecture-diagram') || token !== sequence) return;
    target.innerHTML = result.svg; target.setAttribute('aria-busy','false');
    const svg = target.querySelector('svg'); svg.setAttribute('aria-label',`${currentPaper.name}模块架构`);
    applyZoom();
    if (diagramObserver) diagramObserver.disconnect();
    const frame = target.parentElement;
    diagramObserver = new ResizeObserver(()=>{
      if (!root.hidden && frame.isConnected && frame.clientWidth) applyZoom();
    });
    diagramObserver.observe(frame);
    for (const module of visibleModules()) {
      const node = [...svg.querySelectorAll('.node')].find(item=>item.id.startsWith(svg.id+'-flowchart-'+module.id+'-'));
      if (!node) throw new Error('图形缺少模块：'+module.id);
      node.dataset.moduleId = module.id; node.setAttribute('tabindex','0'); node.setAttribute('role','button'); node.setAttribute('aria-label','查看模块：'+module.label);
      node.addEventListener('click',()=>selectModule(module.id,true).catch(fail));
      node.addEventListener('keydown',event=>{if (event.key==='Enter' || event.key===' ') {event.preventDefault();selectModule(module.id,true).catch(fail);}});
      node.classList.toggle('is-selected',selected===module.id);
      const params=new URLSearchParams(location.hash.split('?')[1]||'');
      const activity=ResearchWorkbench.index.activities.find(item=>item.id===params.get('activity'));
      if(activity?.modules?.[paper.id]?.includes(module.id))ResearchWorkbench.glow(node);
    }
    if(new URLSearchParams(location.hash.split('?')[1]||'').has('activity'))ResearchWorkbench.glow($('#architecture-paper'));
  }
  function applyZoom() {
    const target = $('#architecture-diagram'), svg = target.querySelector('svg');
    const frame = target.parentElement, padding = getComputedStyle(target);
    const width = frame.clientWidth-parseFloat(padding.paddingLeft)-parseFloat(padding.paddingRight);
    const height = frame.clientHeight-parseFloat(padding.paddingTop)-parseFloat(padding.paddingBottom);
    const box = svg.viewBox.baseVal;
    const size = core.diagramSize(box.width,box.height,width,height,zoom);
    svg.style.width = `${size.width}px`;
    svg.style.height = `${size.height}px`;
    $('#architecture-zoom').textContent = `${Math.round(size.scale*100)}%`;
    root.querySelector('[data-action="zoom-out"]').disabled = zoom<=0.25;
    root.querySelector('[data-action="zoom-in"]').disabled = zoom>=4;
  }
  function renderPrompt() {
    $('#architecture-ref-count').textContent = String(references.length);
    $('#architecture-references').innerHTML = references.map((item,i)=>`<div class="architecture-reference"><code>${esc(item.ref)}</code><button type="button" data-action="remove-reference" data-index="${i}" aria-label="移除引用 ${esc(item.ref)}">移除</button></div>`).join('') || '<p>选择模块后，点击“加入提示词引用”。</p>';
    $('#architecture-prompt-text').value = core.prompt(references,$('#architecture-goal').value);
  }
  async function clipboard(text) {
    await navigator.clipboard.writeText(text);
    status('已复制到剪贴板');
  }
  function download(name, body, mime) {
    const url = URL.createObjectURL(new Blob([body],{type:mime}));
    const link = document.createElement('a'); link.href=url; link.download=name; link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function persist(next) {
    localStorage.setItem('neurograph-architecture-proposals-v2',JSON.stringify(next));
    proposals = next;
    await renderPaper(selected,selectedVersion); await draw();
  }
  async function saveProposal(form) {
    const module = paper.modules.find(item=>item.id===selected);
    const current = [...core.versions(module),moduleProposal(selected)].find(item=>item?.id===selectedVersion);
    if (!current) throw new Error('修改提议所依据的模块版本不存在');
    const parameters = [...current.parameters], name = String(form.get('parameterName')).trim();
    const value = String(form.get('parameterValue')).trim(), meaning = String(form.get('parameterMeaning')).trim();
    if ((name || value || meaning) && !(name && value && meaning)) throw new Error('参数名称、值和作用需要同时填写');
    if (name) {
      const parameter = {name,value,meaning,evidence:'浏览器本机提议，尚未实施'};
      const i = parameters.findIndex(item=>item.name===name);
      if (i===-1) parameters.push(parameter); else parameters[i]=parameter;
    }
    const revision = {id:'proposal-'+Date.now(), label:'本机修改提议', date:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai'}).format(new Date()), status:'proposed', change:'modified', baseVariant:variant().id, baseVersion:current.baseVersion || core.reference(paper,module,current), parameters, evidence:'浏览器本机提议，尚未实施'};
    for (const field of ['description','inputs','outputs','reason']) {
      revision[field] = String(form.get(field)).trim();
      if (!revision[field]) throw new Error('请填写全部必填说明');
    }
    mode = 'current';
    selectedVersion = revision.id;
    await persist({...proposals,[paper.id]:{...proposals[paper.id],[variant().id]:{...paperProposals(),[selected]:revision}}});
    status('本机提议已保存；此模块以紫色标记，等待 Codex 实施');
  }
  async function action(name, button) {
    if(name==='overview'){await ResearchWorkbench.setContext(inspectorContext(),paperOverviewHTML);return;}
    if(name==='show-data'){await ResearchWorkbench.switchTab('data');return;}
    if(name==='show-notes'){await ResearchWorkbench.switchTab('notes');return;}
    if (name==='copy-prompt') {if (!references.length) throw new Error('请先加入至少一个模块引用'); await clipboard($('#architecture-prompt-text').value);}
    if (['reference','copy-reference','reference-version','copy-version'].includes(name)) {
      const module = paper.modules.find(item=>item.id===selected);
      const id = button.dataset.version || selectedVersion;
      const version = [...core.versions(module),moduleProposal(selected)].find(item=>item?.id===id);
      if (!version) throw new Error('引用的模块版本不存在');
      const ref = core.reference(paper,module,version);
      await selectModule(selected,false,id);
      if (name==='copy-reference' || name==='copy-version') return clipboard(ref);
      if (!references.some(item=>item.ref===ref)) references.push({ref,paper:paper.name,module:module.label,variant:mode==='paper'?'paper':variant().id,version});
      renderPrompt(); $('#architecture-prompt-panel').open=true; await ResearchWorkbench.switchTab('prompt'); status('模块已加入提示词引用');
    }
    if (name==='remove-reference') {references.splice(Number(button.dataset.index),1);renderPrompt();}
    if (name==='export') download('neurograph-module-proposals.json',JSON.stringify({version:2,proposals,references,goal:$('#architecture-goal').value},null,2),'application/json');
    if (name==='download-graph') download(paper.id+'-architecture.mmd',core.graph(paper,mode,paperProposals(),variant()),'text/plain');
    if (name==='discard-proposal') {const next=structuredClone(proposals); delete next[paper.id][variant().id][selected]; selectedVersion=undefined; await persist(next);status('已移除本机提议');}
    if (name.startsWith('zoom-')) {
      zoom = name==='zoom-reset'?1:Math.max(0.25,Math.min(4,zoom+(name==='zoom-in'?0.25:-0.25)));
      applyZoom();
      if (name==='zoom-reset') {
        const frame = $('#architecture-diagram').parentElement;
        frame.scrollTop=0; frame.scrollLeft=0;
      }
    }
  }
  let initializing;
  window.ArchitectureExplorer = {
    async show(assetBase) {
      base=assetBase; root=document.getElementById('view-architectures');
      await ResearchWorkbench.load();
      if (!initializing) initializing=(async()=>{
        shell(); proposals=localProposals(); index=await readJSON('architectures/index.json');
        $('#architecture-total').textContent=`${index.papers.length} 篇文章`;
        renderCatalog();renderPrompt();status('选择文章查看架构与核查范围');
      })().catch(error=>{initializing=undefined;throw error;});
      await initializing;
      const params=new URLSearchParams(location.hash.split('?')[1]||'');
      if(params.get('model')){await openStandalone(params.get('model'));return;}
      const nextMode=params.get('mode')==='paper'?'paper':'current', nextVariant=params.get('variant')||undefined, modeChanged=nextMode!==mode || nextVariant!==variantId;
      mode=nextMode;
      variantId=nextVariant;
      if (params.get('paper')) await openPaper(params.get('paper'),params.get('module'),params.get('version'),nextVariant);
    }
  };
})();

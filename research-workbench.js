(() => {
  'use strict';
  const base = new URL('.',document.currentScript.src), cache = new Map();
  const roles={train:'训练',validation:'验证',test:'测试',inference:'推理',pretraining:'预训练',reported:'材料已提及，用途按原报告'};
  const labels={description:'说明与版本',data:'数据与结果',notes:'人工备注',prompt:'引用与修改'};
  const localTime=value=>new Intl.DateTimeFormat('zh-CN',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date(value));
  let index, loading, panel, context={}, tab='description', noteTimer, noteQueue=Promise.resolve(), editingNote, database, activityFilter='', contextSequence=0;
  const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const get=selector=>panel.querySelector(selector);
  function json(path) {
    if(!cache.has(path))cache.set(path,fetch(new URL(path,base)).then(response=>{
      if(!response.ok)throw new Error(`研究记录读取失败（${response.status}）`);
      return response.json();
    }).catch(error=>{cache.delete(path);throw error;}));
    return cache.get(path);
  }
  function load() {
    if(!loading)loading=json('research/index.json').then(value=>{index=value;return value;}).catch(error=>{loading=undefined;throw error;});
    return loading;
  }
  const activity=id=>json('research/activities/'+encodeURIComponent(id)+'.json');
  const model=id=>index.models.find(item=>item.id===id);
  const dataset=id=>index.datasets.find(item=>item.id===id);
  function href(item,modelId=item.modelIds[0],datasetId,fromEvent='',day='') {
    return ResearchCore.href(index,item,modelId,datasetId,fromEvent,day);
  }
  function targets(events) {
    return ResearchCore.targets(index,events);
  }
  function eventLinks(event) {
    const linked=targets([event]);
    return linked.length?`<div class="research-event-links">${linked.map(item=>`<a href="${esc(href(item,undefined,undefined,event.id,event.date))}">${esc(item.modelIds.map(id=>model(id).name).join('、')||'数据集')} · ${esc(item.datasetIds.map(id=>dataset(id).name).join('、')||'数据用途见报告')} ↗</a>`).join('')}</div>`:'';
  }
  function activateDay(events,day) {
    const linked=targets(events);
    if(linked.length===1){location.hash=href(linked[0],undefined,undefined,linked[0].fromEvent,day);return true;}
    if(linked.length>1) {
      document.dispatchEvent(new CustomEvent('research-day-choice',{detail:{day,items:linked.map(item=>({title:item.title,href:href(item,undefined,undefined,item.fromEvent,day),models:item.modelIds.map(id=>model(id).name).join('、'),datasets:item.datasetIds.map(id=>dataset(id).name).join('、')}))}}));
      return true;
    }
    return false;
  }
  function glow(element) {
    if(!element)return;
    element.classList.remove('research-glow');
    void element.offsetWidth;
    element.classList.add('research-selected','research-glow');
    element.addEventListener('animationend',()=>element.classList.remove('research-glow'),{once:true});
  }
  function openDatabase() {
    if(!database)database=new Promise((resolve,reject)=>{
      const request=indexedDB.open('neurograph-research-notes',2);
      request.onupgradeneeded=()=>{
        const store=request.result.objectStoreNames.contains('notes')?request.transaction.objectStore('notes'):request.result.createObjectStore('notes',{keyPath:'id'});
        for(const [name,key] of [['model','target.modelId'],['dataset','target.datasetId']])if(!store.indexNames.contains(name))store.createIndex(name,key);
      };
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    return database;
  }
  async function notes(operation,value) {
    const db=await openDatabase();
    return new Promise((resolve,reject)=>{
      const transaction=db.transaction('notes',operation==='put'?'readwrite':'readonly'),store=transaction.objectStore('notes');
      const request=operation==='all'?store.getAll():operation==='find'?store.index(value.modelId?'model':'dataset').getAll(value.modelId||value.datasetId):store.put(value);
      transaction.oncomplete=()=>resolve(request.result);transaction.onerror=()=>reject(transaction.error);
    });
  }
  function message(text,error=false) {
    const target=get('#research-inspector-status');target.textContent=text;target.classList.toggle('architecture-error',error);
  }
  function error(error){message(error.message,true);}
  async function saveNote() {
    clearTimeout(noteTimer);
    const form=get('#research-note-form');
    if(!form || !form.elements.body.value.trim())return;
    const fields=new FormData(form),target=JSON.parse(form.dataset.target);
    if(editingNote && ['body','author','evidence'].every(key=>editingNote[key]===String(fields.get(key)).trim()))return;
    const now=new Date().toISOString();
    const item={id:editingNote?.id||crypto.randomUUID(),target,body:String(fields.get('body')).trim(),author:String(fields.get('author')).trim(),
      evidence:String(fields.get('evidence')).trim(),createdAt:editingNote?.createdAt||now,updatedAt:now,
      baseSourceRevision:editingNote?.baseSourceRevision||index.sourceRevision,status:'local_draft'};
    editingNote=item;
    noteQueue=noteQueue.then(()=>notes('put',item));
    await noteQueue;message('已自动保存至本机浏览器；导出后交给 Codex 核查。');
  }
  async function flush() {clearTimeout(noteTimer);await saveNote();await noteQueue;}
  function noteTarget() {
    return {modelId:context.modelId||null,paperId:context.paper?.id||null,variantId:context.variant?.id||null,
      moduleId:context.moduleId||null,versionId:context.versionId||null,datasetId:context.datasetId||null,activityId:context.activityId||null};
  }
  async function renderNotes(note) {
    const expectedContext=context,target=note?.target||noteTarget();editingNote=note;
    const existing=await notes('find',target);
    if(context!==expectedContext)return;
    const published=index.reviewedNotes.filter(item=>target.modelId?item.target.modelId===target.modelId:item.target.datasetId===target.datasetId);
    get('[data-inspector-body="notes"]').innerHTML=`<p class="research-note-target">备注对象：${esc(context.moduleLabel||context.modelName||dataset(target.datasetId)?.name)}${target.datasetId?' · '+esc(dataset(target.datasetId)?.name):''}${target.activityId?' · '+esc(target.activityId):''}</p>
      <form id="research-note-form"><label>署名<input name="author" maxlength="100" value="${esc(note?.author||'')}"></label><label>备注内容<textarea name="body" rows="5" maxlength="12000" required>${esc(note?.body||'')}</textarea></label><label>依据或待核查事项<textarea name="evidence" rows="2" maxlength="4000">${esc(note?.evidence||'')}</textarea></label><div class="architecture-actions"><button type="submit">保存本机备注</button><button type="button" data-inspector-action="new-note">另写一条</button><button type="button" data-inspector-action="export-notes">导出本机备注 JSON</button></div></form>
      <h3>已核查入库 ${published.length} 条</h3>${published.map(item=>`<details class="research-note" data-published-note="${esc(item.id)}"><summary>${esc(item.author||'项目成员')} · ${esc(localTime(item.reviewedAt))}</summary><div>展开后读取备注正文。</div></details>`).join('')||'<p>暂无已核查备注。</p>'}
      <h3>本机记录 ${existing.length} 条</h3>${existing.map(item=>`<details class="research-note"><summary>${published.some(note=>note.id===item.id)?'已有入库版本，修改需重新核查':'本机草稿'} · ${esc(item.author||'未署名')}</summary><p>${esc(item.body)}</p><small>${esc(localTime(item.updatedAt))} · ${esc(item.target.moduleId||item.target.activityId||'模型／数据集整体')}</small><button type="button" data-edit-note="${esc(item.id)}">编辑这条备注</button></details>`).join('')||'<p>输入后自动保存，其他设备通过导出文件交接。</p>'}`;
    get('#research-note-form').dataset.target=JSON.stringify(target);
  }
  function download(name,body) {
    const url=URL.createObjectURL(new Blob([JSON.stringify(body,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  async function exportNotes() {
    await flush();download('fmri-research-notes.json',{schemaVersion:1,kind:'research-notes',projectId:'Fmri',
      submissionId:crypto.randomUUID(),baseSourceRevision:index.sourceRevision,createdAt:new Date().toISOString(),notes:await notes('all')});
    message('本机备注已导出；正式记录仍需 Codex 核查。');
  }
  function show(nextTab=tab) {
    tab=nextTab;panel.hidden=false;
    document.body.classList.add('research-inspector-open');
    if(location.hash.startsWith('#architectures')){const params=new URLSearchParams(location.hash.split('?')[1]||'');params.set('tab',tab);history.replaceState(null,'','#architectures?'+params);}
    for(const button of panel.querySelectorAll('[data-inspector-tab]'))button.setAttribute('aria-selected',String(button.dataset.inspectorTab===tab));
    for(const body of panel.querySelectorAll('[data-inspector-body]'))body.hidden=body.dataset.inspectorBody!==tab;
  }
  async function switchTab(next) {
    if(tab==='notes')await flush();
    if(next==='notes')await renderNotes();
    show(next);
  }
  function initInspector(root) {
    if(panel){const prompt=root.querySelector('#architecture-prompt-panel');if(prompt){get('[data-inspector-body="prompt"]').replaceChildren(prompt);prompt.open=true;}return panel;}
    panel=document.createElement('aside');panel.id='research-inspector';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-labelledby','research-inspector-title');
    panel.innerHTML=`<header class="research-inspector-header"><div><strong id="research-inspector-title">模型详情</strong><small id="research-inspector-context"></small></div><button type="button" data-inspector-action="pin" aria-pressed="false" title="固定窗口位置">固定</button><button type="button" data-inspector-action="close" aria-label="关闭详情窗口">×</button></header><nav class="research-inspector-tabs" role="tablist" aria-label="详情分类">${Object.entries(labels).map(([key,label])=>`<button type="button" role="tab" id="inspector-tab-${key}" aria-controls="inspector-body-${key}" data-inspector-tab="${key}">${label}</button>`).join('')}</nav><div class="research-inspector-content">${Object.keys(labels).map(key=>`<section role="tabpanel" id="inspector-body-${key}" aria-labelledby="inspector-tab-${key}" data-inspector-body="${key}" ${key==='description'?'':'hidden'}>${key==='description'?'<div id="research-model-overview"></div><details id="architecture-module-detail" class="architecture-module-detail" hidden><summary>模块详情 <span id="architecture-module-name"></span></summary><div id="architecture-module-body"></div></details>':''}</section>`).join('')}</div><p id="research-inspector-status" role="status" aria-live="polite"></p>`;
    document.body.append(panel);
    const prompt=root.querySelector('#architecture-prompt-panel');
    if(prompt){get('[data-inspector-body="prompt"]').append(prompt);prompt.open=true;}
    else get('[data-inspector-body="prompt"]').textContent='打开模型后可以收集模块引用。';
    for(const event of ['click','change','submit'])panel.addEventListener(event,eventObject=>root['on'+event]?.(eventObject));
    panel.addEventListener('input',event=>{if(event.target.closest('#research-note-form')){clearTimeout(noteTimer);noteTimer=setTimeout(()=>saveNote().catch(error),500);}});
    panel.addEventListener('submit',event=>{if(event.target.id==='research-note-form'){event.preventDefault();saveNote().then(()=>renderNotes(editingNote)).catch(error);}});
    panel.addEventListener('change',event=>{if(event.target.id==='research-activity-filter'){activityFilter=event.target.value;renderData().catch(error);}});
    panel.addEventListener('toggle',event=>{
      const note=event.target;
      if(!note.matches('[data-published-note]')||!note.open||note.dataset.loaded)return;
      json('research/notes/'+note.dataset.publishedNote+'.json').then(item=>{note.querySelector('div').innerHTML=`<p>${esc(item.body)}</p><small>${esc(item.evidence)}</small><p>核查者：${esc(item.reviewedBy)}</p>`;note.dataset.loaded='true';}).catch(error);
    },true);
    panel.addEventListener('click',event=>{
      const target=event.target.closest('[data-inspector-tab],[data-inspector-action],[data-edit-note],[data-research-activity]');
      if(!target)return;
      if(target.dataset.inspectorTab)switchTab(target.dataset.inspectorTab).catch(error);
      if(target.dataset.editNote)flush().then(()=>notes('all')).then(items=>renderNotes(items.find(item=>item.id===target.dataset.editNote))).catch(error);
      if(target.dataset.researchActivity)selectActivity(target.dataset.researchActivity).catch(error);
      const action=target.dataset.inspectorAction;
      if(action==='close')flush().then(()=>{panel.hidden=true;document.body.classList.remove('research-inspector-open');}).catch(error);
      if(action==='pin'){const pinned=panel.classList.toggle('is-pinned');target.setAttribute('aria-pressed',String(pinned));target.textContent=pinned?'已固定':'固定';}
      if(action==='new-note')flush().then(()=>renderNotes()).catch(error);
      if(action==='export-notes')exportNotes().catch(error);
      if(action==='model-overview'){get('#architecture-module-detail').hidden=true;get('#research-model-overview').hidden=false;show('description');}
    });
    panel.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();flush().then(()=>{panel.hidden=true;document.body.classList.remove('research-inspector-open');}).catch(error);}
      const selected=event.target.closest('[data-inspector-tab]');
      if(selected && ['ArrowLeft','ArrowRight'].includes(event.key)){
        event.preventDefault();const keys=Object.keys(labels),position=(keys.indexOf(selected.dataset.inspectorTab)+(event.key==='ArrowRight'?1:3))%4;
        switchTab(keys[position]).then(()=>get(`[data-inspector-tab="${keys[position]}"]`).focus()).catch(error);
      }
    });
    const header=get('.research-inspector-header');let drag;
    header.addEventListener('pointerdown',event=>{
      if(event.target.closest('button')||panel.classList.contains('is-pinned')||matchMedia('(max-width:700px)').matches)return;
      const rect=panel.getBoundingClientRect();drag={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};header.setPointerCapture(event.pointerId);
    });
    header.addEventListener('pointermove',event=>{if(!drag)return;panel.style.right='auto';panel.style.left=Math.max(0,Math.min(innerWidth-panel.offsetWidth,drag.left+event.clientX-drag.x))+'px';panel.style.top=Math.max(0,Math.min(innerHeight-80,drag.top+event.clientY-drag.y))+'px';});
    header.addEventListener('pointerup',()=>{drag=undefined;});header.addEventListener('pointercancel',()=>{drag=undefined;});
    window.addEventListener('resize',()=>{if(matchMedia('(max-width:700px)').matches){panel.style.left='';panel.style.top='';panel.style.right='';panel.style.width='';panel.style.height='';}});
    new ResizeObserver(()=>{if(!panel.hidden)document.body.style.setProperty('--research-inspector-width',panel.offsetWidth+'px');}).observe(panel);
    return panel;
  }
  function baselineHTML(ids) {
    return ids.map(id=>index.baselines[id]).filter(Boolean).map(item=>`<details class="research-baseline" open><summary>原论文 baseline · ${esc(item.label)}</summary><p>${esc(item.reference)}</p><p>${esc(item.conditions)}</p>${item.url?`<a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">原文依据 ↗</a>`:''}</details>`).join('');
  }
  function usagesHTML(item) {
    return item.usages.map(usage=>`<article class="research-dataset-card" data-research-dataset="${esc(usage.datasetId)}"><strong>${esc(dataset(usage.datasetId).name)}</strong><span>${usage.roles.map(role=>esc(roles[role]||role)).join(' / ')}</span><p>${esc(usage.version)}</p>${usage.people?`<p>人员口径：${esc(Object.entries(usage.people).map(([key,value])=>`${({development:'开发',train:'训练',validation:'验证',test:'测试'})[key]||key} ${[].concat(value).join('/')} 人`).join('；'))}</p>`:''}<p>${esc(usage.detail)}</p><a href="#datasets?tab=data&dataset=${encodeURIComponent(usage.datasetId)}&activity=${encodeURIComponent(item.id)}${context.fromEvent?'&fromEvent='+encodeURIComponent(context.fromEvent):''}${context.day?'&date='+encodeURIComponent(context.day):''}">定位数据集 ↗</a></article>`).join('')||`<p>数据集精确ID尚未核定。${esc(item.datasetText||'实验数据见原论文材料。')}</p>`;
  }
  function metricsHTML(item) {
    const rows=Array.isArray(item.metrics)?item.metrics:[];
    return `${rows.length?`<div class="architecture-table-wrap"><table><caption>本次同条件结果；变化值与限制见下方</caption><thead><tr><th>条件</th><th>AUC</th><th>其他指标</th></tr></thead><tbody>${rows.map(row=>`<tr><th>${esc(row.name||row.method||row.variant||row.condition||'原记录')}</th><td>${Number.isFinite(row.auc)?row.auc.toFixed(4)+(Number.isFinite(row.auc_sd)?' ± '+row.auc_sd.toFixed(4):''):'未报告'}</td><td>${['mae','ba','brier','logloss'].filter(key=>Number.isFinite(row[key])).map(key=>`${key} ${row[key].toFixed(4)}`).join('；')}</td></tr>`).join('')}</tbody></table></div>`:''}
      <p>${esc(item.impact)}</p>${baselineHTML(item.baselineIds)}${item.comparisons&&Object.keys(item.comparisons).length?`<details><summary>同条件比较、区间与全部数值</summary><pre>${esc(JSON.stringify(item.comparisons,null,2))}</pre></details>`:''}`;
  }
  async function selectActivity(id) {
    await flush();
    const item=index.activities.find(item=>item.id===id);
    if(!item)throw new Error('未登记的活动');
    const url=href(item,context.modelId||item.modelIds[0],item.datasetIds.includes(context.datasetId)?context.datasetId:undefined,context.fromEvent||'',context.day||'');
    if(location.hash!==url)location.hash=url;
    else {context.activityId=id;await renderData();show('data');}
  }
  async function renderData() {
    const expectedContext=context;
    const target=get('[data-inspector-body="data"]');
    const items=index.activities.filter(item=>context.modelId?item.modelIds.includes(context.modelId):item.datasetIds.includes(context.datasetId));
    const chosen=context.activityId?items.find(item=>item.id===context.activityId):undefined;
    if(context.activityId&&!chosen)throw new Error('此活动与当前模型或数据集不匹配');
    const renderGroup=(origin,title)=>{
      const entries=items.filter(item=>item.origin===origin && (!activityFilter||item.tags.includes(activityFilter)));
      return `<details class="research-activity-group" ${origin==='project'?'open':''}><summary>${title} · ${entries.length} 条</summary>${entries.map(item=>`<button type="button" data-research-activity="${esc(item.id)}" ${chosen?.id===item.id?'aria-current="true"':''}><strong>${esc(item.title)}</strong><small>${esc(item.date||'日期见原文')} · ${esc(item.tags.join('、'))}</small></button>`).join('')||'<p>尚无已核查记录。</p>'}</details>`;
    };
    target.innerHTML=`${context.fromEvent?`<a class="research-return" href="#calendar?date=${encodeURIComponent(context.day||'')}&event=${encodeURIComponent(context.fromEvent)}">← 返回原日期与事件</a>`:''}<label>筛选工作类型<select id="research-activity-filter"><option value="">全部类型</option>${[...new Set(items.flatMap(item=>item.tags))].map(tag=>`<option value="${esc(tag)}" ${tag===activityFilter?'selected':''}>${esc(tag)}</option>`).join('')}</select></label><div id="research-active-activity"></div>${renderGroup('paper','原论文')}${renderGroup('project','本项目')}`;
    if(chosen) {
      const original=await activity(chosen.id);
      const stateNames={completed:'已完成',done:'已完成',partial:'部分完成',planned:'计划中',running:'运行中',failed:'失败',stopped:'已停止',recorded:'已记录'};
      const item={...original,status:stateNames[original.status]??original.status};
      if(context!==expectedContext || context.activityId!==chosen.id)return;
      get('#research-active-activity').innerHTML=`<article class="research-activity-detail"><span>${item.origin==='paper'?'原论文':'本项目'} · ${esc(item.status)}</span><h3>${esc(item.title)}</h3><div class="research-tags">${item.tags.map(tag=>`<span>${esc(tag)}</span>`).join('')}</div><p>${esc(item.summary)}</p>${usagesHTML(item)}${metricsHTML(item)}<details><summary>方法、创新、运行与依据</summary><p>${esc(item.method)}</p>${item.inference?`<p>推理／使用：${esc(item.inference)}</p>`:''}${item.innovations?`<ul>${item.innovations.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`:''}${item.changedComponent?`<p>修改板块：${esc(item.changedComponent)}</p>`:''}${item.evidence?`<ul>${item.evidence.map(file=>`<li>${esc(file.name||file.file)} · ${esc(file.locator)}</li>`).join('')}</ul>`:''}${item.configurations?.length?`<h3>运行配置</h3><pre>${esc(JSON.stringify(item.configurations,null,2))}</pre>`:''}${item.runs?.length?`<h3>运行实例</h3><pre>${esc(JSON.stringify(item.runs,null,2))}</pre>`:''}${item.citation?`<a href="${esc(item.citation)}" target="_blank" rel="noopener noreferrer">论文来源 ↗</a>`:''}${item.sourceIds.map(id=>`<a href="#evidence?source=${encodeURIComponent(id)}">报告 ${esc(id)} ↗</a>`).join(' ')}${item.gaps.map(text=>`<p>${esc(text)}</p>`).join('')}</details><p class="research-boundary">${esc(item.boundary)}</p></article>`;
      if(context.datasetId)glow(get(`[data-research-dataset="${CSS.escape(context.datasetId)}"]`));
    } else get('#research-active-activity').innerHTML='<p>选择记录，查看数据用途、同条件结果和原文依据。</p>';
  }
  async function setContext(next,overviewHTML) {
    const token=++contextSequence;
    await flush();if(token!==contextSequence)return;
    context=next;editingNote=undefined;activityFilter='';
    get('#research-inspector-title').textContent=next.modelName||dataset(next.datasetId)?.name||'研究详情';
    get('#research-inspector-context').textContent=[next.variant?.label,next.moduleLabel].filter(Boolean).join(' › ');
    const selectedActivity=index.activities.find(item=>item.id===next.activityId);
    if(selectedActivity?.origin==='project' && next.paper && !selectedActivity.variants?.[next.modelId])get('#research-inspector-context').textContent+=next.variant?.id==='paper'?' · 此活动未登记对应架构方案，图示为论文原版':' · 当前图与此活动的结构关联尚未核定';
    if(overviewHTML!==undefined)get('#research-model-overview').innerHTML=overviewHTML;
    get('#research-model-overview').hidden=Boolean(next.moduleId);get('#architecture-module-detail').hidden=!next.moduleId;
    get('[data-inspector-body="notes"]').innerHTML='';
    await renderData();
    if(token!==contextSequence)return;
    if(next.tab==='notes')await renderNotes();
    if(token!==contextSequence)return;
    show(next.tab||'description');
  }
  async function routeDataset() {
    const params=new URLSearchParams(location.hash.split('?')[1]||''),id=params.get('dataset');
    const host=document.getElementById('research-content');
    if(!host||!location.hash.startsWith('#datasets')||params.get('tab')!=='data')return;
    let detail=document.getElementById('research-dataset-detail');if(!detail){detail=document.createElement('section');detail.id='research-dataset-detail';detail.className='panel';host.prepend(detail);}
    detail.innerHTML=`<label>定位数据集<select id="research-dataset-picker"><option value="">选择数据集</option>${index.datasets.map(row=>`<option value="${esc(row.id)}" ${row.id===id?'selected':''}>${esc(row.id+' · '+row.name)}</option>`).join('')}</select></label><div id="research-dataset-selection"></div>`;
    detail.querySelector('select').onchange=event=>{location.hash='#datasets?tab=data&dataset='+encodeURIComponent(event.target.value);};
    if(!id)return;
    const selected=dataset(id);if(!selected)throw new Error('未登记的数据集ID');
    const associated=index.activities.filter(item=>item.datasetIds.includes(id));
    detail.querySelector('#research-dataset-selection').innerHTML=`<h2>${esc(selected.name)}</h2><p>${esc(selected.samples)}</p><p>${esc(selected.gaps||'原论文与本项目的数据口径分别保留。')}</p>${params.get('fromEvent')?`<a href="#calendar?date=${encodeURIComponent(params.get('date')||'')}&event=${encodeURIComponent(params.get('fromEvent'))}">← 返回日历</a>`:''}<button type="button" id="research-dataset-notes">为此数据集备注</button><details open><summary>关联模型与活动 · ${associated.length} 条</summary>${associated.map(item=>`<a class="research-dataset-activity" href="${esc(href(item,undefined,id,params.get('fromEvent')||'',params.get('date')||''))}">${esc(item.title)} <small>${esc(item.modelIds.map(id=>model(id).name).join('、'))}</small></a>`).join('')}</details>`;
    detail.querySelector('#research-dataset-notes').onclick=()=>{initInspector(document.getElementById('view-architectures'));setContext({datasetId:id,tab:'notes'},`<h3>${esc(selected.name)}</h3><p>${esc(selected.samples)}</p>`).catch(error);};
    glow(detail);glow(document.querySelector(`[data-dataset="${CSS.escape(id)}"]`));
    detail.scrollIntoView({block:'start'});
  }
  window.ResearchWorkbench={load,get ready(){return Boolean(index);},get index(){return index;},activity,href,targets,eventLinks,activateDay,glow,initInspector,
    setContext,switchTab,flush,routeDataset,close(){const token=contextSequence;if(panel)flush().then(()=>{if(token===contextSequence){panel.hidden=true;document.body.classList.remove('research-inspector-open');}}).catch(error);},
    get panel(){return panel;},error,escape:esc};
})();

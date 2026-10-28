(() => {
  'use strict';
  const base=new URL('.',document.currentScript.src),cache=new Map();
  const labels={description:'说明与版本',data:'数据与结果'};
  const roles={train:'训练',validation:'验证',test:'测试',inference:'推理',pretraining:'预训练',reported:'用途见原报告'};
  let index,loading,panel,context={},activityFilter='',activityLimit=8,contextSequence=0;
  const esc=value=>String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
  const get=selector=>panel.querySelector(selector);
  const number=value=>Number.isFinite(value)?value.toFixed(4):'—';
  function json(path){
    if(!cache.has(path))cache.set(path,fetch(new URL(path,base),{cache:'no-cache'}).then(response=>{
      if(!response.ok)throw new Error(`研究记录读取失败（${response.status}）`);
      return response.json();
    }).catch(error=>{cache.delete(path);throw error;}));
    return cache.get(path);
  }
  function load(){
    if(!loading)loading=json('research/index.json').then(value=>{index=value;return value;}).catch(error=>{loading=undefined;throw error;});
    return loading;
  }
  const activity=id=>json('research/activities/'+encodeURIComponent(id)+'.json');
  const model=id=>index.models.find(item=>item.id===id);
  const dataset=id=>index.datasets.find(item=>item.id===id);
  const href=(item,modelId=item.modelIds[0],datasetId,fromEvent='',day='')=>ResearchCore.href(index,item,modelId,datasetId,fromEvent,day);
  const targets=events=>ResearchCore.targets(index,events);
  function eventLinks(event){
    const linked=targets([event]);
    return linked.length?`<div class="research-event-links">${linked.map(item=>`<a href="${esc(href(item,undefined,undefined,event.id,event.date))}">${esc(item.modelIds.map(id=>model(id).name).join('、')||'数据集')} · ${esc(item.datasetIds.join('、')||'数据用途见报告')} ↗</a>`).join('')}</div>`:'';
  }
  function activateDay(events,day){
    const linked=targets(events);
    if(linked.length===1){location.hash=href(linked[0],undefined,undefined,linked[0].fromEvent,day);return true;}
    if(linked.length>1){document.dispatchEvent(new CustomEvent('research-day-choice',{detail:{day,items:linked.map(item=>({title:item.title,href:href(item,undefined,undefined,item.fromEvent,day),models:item.modelIds.map(id=>model(id).name).join('、'),datasets:item.datasetIds.map(id=>id+' · '+dataset(id).name).join('、')}))}}));return true;}
    return false;
  }
  function glow(element){
    if(!element)return;
    element.classList.remove('research-glow');void element.offsetWidth;
    element.classList.add('research-selected','research-glow');
    element.addEventListener('animationend',()=>element.classList.remove('research-glow'),{once:true});
  }
  function error(error){get('#research-inspector-status').textContent=error.message;}
  function datasetHref(id,item,options={}){
    const params=new URLSearchParams({tab:'data',dataset:id});
    if(item?.id)params.set('activity',item.id);
    if(options.fromEvent)params.set('fromEvent',options.fromEvent);
    if(options.day)params.set('date',options.day);
    return '#datasets?'+params;
  }
  function datasetLink(id,item,options={}){return id?`<a class="research-dataset-id" href="${esc(datasetHref(id,item,options))}" title="${esc(dataset(id)?.name||id)}">${esc(id)} ↗</a>`:'<span class="research-missing">数据编号待核定</span>';}
  function baselineHTML(ids=[]){
    const entries=ids.map(id=>index.baselines[id]).filter(Boolean);
    return entries.length?`<details class="research-paper-reference"><summary>原论文参照 · ${entries.length} 项</summary>${entries.map(item=>`<p><strong>${esc(item.label)}</strong><br>${esc(item.reference)}</p><small>${esc(item.conditions)}</small>${item.url?`<p><a href="${esc(item.url)}" target="_blank" rel="noopener noreferrer">原文依据 ↗</a></p>`:''}`).join('')}</details>`:'';
  }
  function resultTable(item,options={}){
    const rows=item.resultRows||[],limit=options.limit??3;
    const table=entries=>`<table class="research-results-table"><caption>ΔAUC＝本行 AUC − 同条件 baseline</caption><thead><tr><th>数据／条件</th><th>AUC</th><th>baseline</th><th>ΔAUC</th></tr></thead><tbody>${entries.map(row=>`<tr ${row.datasetId?`data-research-dataset="${esc(row.datasetId)}"`:''}><td>${datasetLink(row.datasetId,item,options)}<small title="${esc(row.condition)}">${esc(row.condition)}</small></td><td><strong>${number(row.auc)}</strong>${Number.isFinite(row.aucSd)?`<small>± ${number(row.aucSd)}</small>`:''}${Object.entries(row.otherMetrics||{}).slice(0,2).map(([key,value])=>`<small>${esc(key)} ${number(value)}</small>`).join('')}</td><td>${Number.isFinite(row.baselineAuc)?`<strong>${number(row.baselineAuc)}</strong><small title="${esc(row.baselineLabel)}">${esc(row.baselineLabel)}</small>`:'<span class="research-missing">未登记可比参照</span>'}</td><td>${Number.isFinite(row.deltaAuc)?`<strong>${row.deltaAuc>0?'+':''}${number(row.deltaAuc)}</strong>${row.isBaseline?'<small>参照条件</small>':''}${row.deltaInterval?`<small>95%区间<br>[${row.deltaInterval.map(number).join(', ')}]</small>`:''}`:'—'}</td></tr>`).join('')}</tbody></table>`;
    if(!rows.length)return `<p class="research-missing">${item.datasetIds.map(id=>datasetLink(id,item,options)).join(' ')} · 数值见原记录。</p>`;
    return table(rows.slice(0,limit))+(rows.length>limit?`<details class="research-more-results"><summary>其余 ${rows.length-limit} 个条件</summary>${table(rows.slice(limit))}</details>`:'');
  }
  function show(next='description'){
    const tab=Object.hasOwn(labels,next)?next:'description';panel.hidden=false;document.body.classList.add('research-inspector-open');
    if(location.hash.startsWith('#architectures')){const params=new URLSearchParams(location.hash.split('?')[1]||'');params.set('tab',tab);history.replaceState(null,'','#architectures?'+params);}
    for(const button of panel.querySelectorAll('[data-inspector-tab]'))button.setAttribute('aria-selected',String(button.dataset.inspectorTab===tab));
    for(const body of panel.querySelectorAll('[data-inspector-body]'))body.hidden=body.dataset.inspectorBody!==tab;
  }
  function close(){contextSequence++;if(panel)panel.hidden=true;document.body.classList.remove('research-inspector-open');}
  function initInspector(root){
    if(panel)return panel;
    panel=document.createElement('aside');panel.id='research-inspector';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-labelledby','research-inspector-title');
    panel.innerHTML=`<header class="research-inspector-header"><div><strong id="research-inspector-title">模型详情</strong><small id="research-inspector-context"></small></div><button type="button" data-inspector-action="pin" aria-pressed="false" title="固定窗口位置">固定</button><button type="button" data-inspector-action="close" aria-label="关闭详情窗口">×</button></header><nav class="research-inspector-tabs" role="tablist" aria-label="详情分类">${Object.entries(labels).map(([key,label])=>`<button type="button" role="tab" id="inspector-tab-${key}" aria-controls="inspector-body-${key}" data-inspector-tab="${key}">${label}</button>`).join('')}</nav><div class="research-inspector-content"><section role="tabpanel" id="inspector-body-description" aria-labelledby="inspector-tab-description" data-inspector-body="description"><div id="research-model-overview"></div><details id="architecture-module-detail" class="architecture-module-detail" hidden><summary>模块详情 <span id="architecture-module-name"></span></summary><div id="architecture-module-body"></div></details></section><section role="tabpanel" id="inspector-body-data" aria-labelledby="inspector-tab-data" data-inspector-body="data" hidden></section></div><p id="research-inspector-status" role="status" aria-live="polite"></p>`;
    document.body.append(panel);
    for(const event of ['click','change'])panel.addEventListener(event,eventObject=>root['on'+event]?.(eventObject));
    panel.addEventListener('change',event=>{if(event.target.id==='research-activity-filter'){activityFilter=event.target.value;activityLimit=8;renderData().catch(error);}});
    panel.addEventListener('click',event=>{
      const target=event.target.closest('[data-inspector-tab],[data-inspector-action],[data-research-activity]');if(!target)return;
      if(target.dataset.inspectorTab)show(target.dataset.inspectorTab);
      if(target.dataset.researchActivity)selectActivity(target.dataset.researchActivity).catch(error);
      const action=target.dataset.inspectorAction;
      if(action==='close')close();
      if(action==='pin'){const pinned=panel.classList.toggle('is-pinned');target.setAttribute('aria-pressed',String(pinned));target.textContent=pinned?'已固定':'固定';}
      if(action==='more-activities'){activityLimit+=8;renderData().catch(error);}
    });
    panel.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.preventDefault();close();}
      const selected=event.target.closest('[data-inspector-tab]');
      if(selected&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();const next=selected.dataset.inspectorTab==='data'?'description':'data';show(next);get(`[data-inspector-tab="${next}"]`).focus();}
    });
    const header=get('.research-inspector-header');let drag;
    header.addEventListener('pointerdown',event=>{
      if(event.target.closest('button')||panel.classList.contains('is-pinned')||matchMedia('(max-width:700px)').matches)return;
      const rect=panel.getBoundingClientRect();drag={x:event.clientX,y:event.clientY,left:rect.left,top:rect.top};header.setPointerCapture(event.pointerId);
    });
    header.addEventListener('pointermove',event=>{if(!drag)return;panel.style.right='auto';panel.style.left=Math.max(0,Math.min(innerWidth-panel.offsetWidth,drag.left+event.clientX-drag.x))+'px';panel.style.top=Math.max(0,Math.min(innerHeight-80,drag.top+event.clientY-drag.y))+'px';});
    header.addEventListener('pointerup',()=>{drag=undefined;});header.addEventListener('pointercancel',()=>{drag=undefined;});
    window.addEventListener('resize',()=>{if(matchMedia('(max-width:700px)').matches){for(const key of ['left','top','right','width','height'])panel.style[key]='';}});
    new ResizeObserver(()=>{if(!panel.hidden)document.body.style.setProperty('--research-inspector-width',panel.offsetWidth+'px');}).observe(panel);
    return panel;
  }
  async function selectActivity(id){
    const item=index.activities.find(item=>item.id===id);if(!item)throw new Error('未登记的活动');
    const url=href(item,context.modelId||item.modelIds[0],item.datasetIds.includes(context.datasetId)?context.datasetId:undefined,context.fromEvent||'',context.day||'');
    if(location.hash!==url)location.hash=url;else {await renderData();show('data');}
  }
  async function renderData(){
    const expected=context,items=index.activities.filter(item=>context.modelId?item.modelIds.includes(context.modelId):item.datasetIds.includes(context.datasetId));
    const chosen=context.activityId?items.find(item=>item.id===context.activityId):undefined;
    if(context.activityId&&!chosen)throw new Error('此活动与当前模型或数据集不匹配');
    const options={fromEvent:context.fromEvent,day:context.day};
    const group=(origin,title)=>{
      const entries=items.filter(item=>item.origin===origin&&item.id!==chosen?.id&&(!activityFilter||item.tags.includes(activityFilter))).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
      return `<details class="research-activity-group" ${origin==='project'?'open':''}><summary>${title} · ${entries.length} 条</summary>${entries.slice(0,activityLimit).map(item=>`<article class="research-result-entry"><header><time>${esc(item.date||'日期见原文')}</time><strong>${esc(item.title)}</strong></header>${resultTable(item,options)}${baselineHTML(item.baselineIds)}<button type="button" class="research-detail-button" data-research-activity="${esc(item.id)}">方法与依据 ↗</button></article>`).join('')||'<p>暂无其他记录。</p>'}${entries.length>activityLimit?'<button type="button" data-inspector-action="more-activities">再显示 8 条</button>':''}</details>`;
    };
    get('[data-inspector-body="data"]').innerHTML=`${context.fromEvent?`<a class="research-return" href="#calendar?date=${encodeURIComponent(context.day||'')}&event=${encodeURIComponent(context.fromEvent)}">← 返回原日期与事件</a>`:''}<details class="research-data-controls"><summary>筛选 · ${esc(activityFilter||'全部类型')}</summary><label>工作类型<select id="research-activity-filter"><option value="">全部类型</option>${[...new Set(items.flatMap(item=>item.tags))].map(tag=>`<option value="${esc(tag)}" ${tag===activityFilter?'selected':''}>${esc(tag)}</option>`).join('')}</select></label></details><div id="research-active-activity"></div>${group('project','本项目')}${group('paper','原论文')}`;
    if(!chosen)return;
    const item=await activity(chosen.id);if(context!==expected)return;
    get('#research-active-activity').innerHTML=`<article class="research-activity-detail"><header><time>${esc(item.date||'日期见原文')}</time><h3>${esc(item.title)}</h3></header>${resultTable(item,options)}${baselineHTML(item.baselineIds)}<details class="research-method-details"><summary>完整结果、方法与限制</summary><p>${esc(item.summary)}</p>${item.usages.map(usage=>`<p>${datasetLink(usage.datasetId,item,options)} · ${esc(usage.roles.map(role=>roles[role]).join('/'))}<br>${esc(usage.version)}<br>${esc(usage.detail)}</p>`).join('')}<p>${esc(item.method)}</p>${item.inference?`<p>推理／使用：${esc(item.inference)}</p>`:''}${item.innovations?`<ul>${item.innovations.map(text=>`<li>${esc(text)}</li>`).join('')}</ul>`:''}<p class="research-boundary">${esc(item.boundary)}</p>${item.gaps.map(text=>`<p>${esc(text)}</p>`).join('')}<details><summary>全部指标、比较与运行明细</summary><pre>${esc(JSON.stringify({metrics:item.metrics,comparisons:item.comparisons,configurations:item.configurations,runs:item.runs},null,2))}</pre></details>${item.sourceIds.map(id=>`<a href="#evidence?source=${encodeURIComponent(id)}">报告 ${esc(id)} ↗</a>`).join('<br>')}${item.citation?`<p><a href="${esc(item.citation)}" target="_blank" rel="noopener noreferrer">论文来源 ↗</a></p>`:''}</details></article>`;
    if(context.datasetId)glow(get(`[data-research-dataset="${CSS.escape(context.datasetId)}"]`));
  }
  async function setContext(next,overviewHTML){
    const token=++contextSequence;context=next;activityFilter='';activityLimit=8;
    get('#research-inspector-title').textContent=next.modelName||dataset(next.datasetId)?.name||'研究详情';
    get('#research-inspector-context').textContent=[next.variant?.label,next.moduleLabel].filter(Boolean).join(' › ');
    const selected=index.activities.find(item=>item.id===next.activityId);
    if(selected?.origin==='project'&&next.paper&&!selected.variants?.[next.modelId])get('#research-inspector-context').textContent+=' · 此活动未核定对应架构方案';
    if(overviewHTML!==undefined)get('#research-model-overview').innerHTML=overviewHTML;
    get('#research-model-overview').hidden=Boolean(next.moduleId);get('#architecture-module-detail').hidden=!next.moduleId;
    await renderData();if(token===contextSequence)show(next.tab);
  }
  async function routeDataset(){
    const params=new URLSearchParams(location.hash.split('?')[1]||''),id=params.get('dataset'),host=document.getElementById('research-content');
    if(!host||!location.hash.startsWith('#datasets')||params.get('tab')!=='data')return;
    let detail=document.getElementById('research-dataset-detail');if(!detail){detail=document.createElement('section');detail.id='research-dataset-detail';detail.className='panel';host.prepend(detail);}
    detail.innerHTML=`<label>定位数据集<select id="research-dataset-picker"><option value="">选择数据集</option>${index.datasets.map(row=>`<option value="${esc(row.id)}" ${row.id===id?'selected':''}>${esc(row.id+' · '+row.name)}</option>`).join('')}</select></label><div id="research-dataset-selection"></div>`;
    detail.querySelector('select').onchange=event=>{location.hash='#datasets?tab=data&dataset='+encodeURIComponent(event.target.value);};
    if(!id)return;
    const selected=dataset(id);if(!selected)throw new Error('未登记的数据集ID');
    const associated=index.activities.filter(item=>item.datasetIds.includes(id));
    detail.querySelector('#research-dataset-selection').innerHTML=`<h2>${esc(id+' · '+selected.name)}</h2><p>${esc(selected.samples)}</p><details><summary>数据版本与使用限制</summary><p>${esc(selected.gaps||'原论文与本项目的数据口径分别保留。')}</p></details>${params.get('fromEvent')?`<a href="#calendar?date=${encodeURIComponent(params.get('date')||'')}&event=${encodeURIComponent(params.get('fromEvent'))}">← 返回日历</a>`:''}<details open><summary>关联模型与活动 · ${associated.length} 条</summary>${associated.map(item=>`<a class="research-dataset-activity" href="${esc(href(item,undefined,id,params.get('fromEvent')||'',params.get('date')||''))}">${esc(item.title)} <small>${esc(item.modelIds.map(id=>model(id).name).join('、'))}</small></a>`).join('')}</details>`;
    glow(detail);glow(document.querySelector(`[data-dataset="${CSS.escape(id)}"]`));detail.scrollIntoView({block:'start'});
  }
  function forRecord(record){const key=record.id||`${record.date||''}|${record.title||''}`;return index.activities.find(item=>item.id===key||item.historyKey===key);}
  window.ResearchWorkbench={load,get ready(){return Boolean(index);},get index(){return index;},activity,href,targets,eventLinks,activateDay,glow,initInspector,setContext,switchTab:show,routeDataset,close,resultTable,baselineHTML,datasetLink,forRecord,get panel(){return panel;},error,escape:esc};
})();

'use strict';

// Plain browser JavaScript, sharing the existing dashboard's dialog and sources.
const eventTypes = {meeting:'会议', deadline:'DDL', work:'工作记录'};
const archiveUI = {query:'', expanded:false};
const calendarUI = {month:'', selected:'', type:'all', query:'', mode:'month'};
const shanghaiDay = () => new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const routeParams = () => new URLSearchParams(location.hash.split('?')[1] || '');
const validISODate = value => /^\d{4}-\d{2}-\d{2}$/.test(value||'') && !Number.isNaN(Date.parse(value+'T00:00:00Z')) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value;
const sourceById = id => data.sources.find(s=>s.id===id);
const uniqueSources = () => {
  const seen=new Set();
  return data.sources.filter(s=>{const key=s.repo_path||s.id;if(seen.has(key))return false;seen.add(key);return true;});
};
let routedSource = '';

function linkedReport(text, source) {
  let result='', offset=0;
  const re=/!?\[([^\]\n]+)\]\(([^)\n]+)\)/g;
  for (const match of text.matchAll(re)) {
    result+=escapeHTML(text.slice(offset,match.index));
    const label=escapeHTML(match[1]);
    const target=match[2].trim().replace(/^<|>$/g,'');
    let link='';
    if (/^https?:\/\//i.test(target)) {
      link=`<a href="${escapeHTML(target)}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`;
    } else if (!/^[a-z]+:/i.test(target)) {
      try {
        const path=decodeURIComponent(new URL(target,'https://archive.invalid/'+source.repo_path).pathname).slice(1);
        const found=data.sources.find(s=>s.repo_path===path);
        if (found) link=evidenceLink(found.id,match[1]);
        else if (target.endsWith('/') && data.sources.some(s=>s.repo_path?.startsWith(path)))
          link=`<a href="#evidence?folder=${encodeURIComponent(path)}">${label} ↗</a>`;
      } catch { /* Unresolvable original references remain visible plain text. */ }
    }
    result+=link || `${label} (${escapeHTML(target)})`;
    offset=match.index+match[0].length;
  }
  return result+escapeHTML(text.slice(offset));
}

function archiveRoute() {
  const id=routeParams().get('source');
  if(id && id!==routedSource && sourceById(id)) {routedSource=id;openSource(id);}
  if(!id)routedSource='';
}

function archiveEvidencePage() {
  const params=routeParams();
  const section=params.get('section')==='meetings'?'meetings':'sources';
  if(params.has('folder'))archiveUI.query=params.get('folder');
  const count=uniqueSources().filter(s=>s.section==='meetings').length;
  $('#view-evidence').innerHTML=`<div class="page-heading"><div><span class="eyebrow">RESEARCH ARCHIVE</span><h1>记录与证据</h1><p class="archive-subtitle">从研究结论回到报告、数据与工作现场。</p></div><a class="button" href="#calendar">在日历中浏览 ↗</a></div>
    <div class="archive-tabs" aria-label="证据分类"><a href="#evidence" ${section==='sources'?'aria-current="page"':''}>来源文件 <span>${uniqueSources().length-count}</span></a><a href="#evidence?section=meetings" ${section==='meetings'?'aria-current="page"':''}>会议记录 <span>${count}</span></a></div>
    ${section==='meetings'?meetingArchive():`${researchDisclosure('研究摘要与报告目录','先读结论，再查看完整归档',`<div class="archive-featured"><div><span class="eyebrow">2026-09-13 · 连接表示改进</span><h2>切空间连接：内部改善，跨站点仍受限</h2><p>99/96 开发集 AUC 0.753 / 0.756；站点留出 0.608 / 0.612。156 个模型已独立回读，尚不代表 TN/PHN 临床达标。</p></div>${reportByPath('docs/CONNECTIVITY_IMPROVEMENT_RESULTS_2026-09-13.md','阅读连接表示改进成果 ↗')}</div><div class="archive-featured"><div><span class="eyebrow">2026-09-13 · 六阶段训练归档</span><h2>六阶段实验与完整指标已同步</h2><p>478 份结果与报告 · 174,389 行指标。含训练预算、分类头、正则化及三种子来源学习曲线。</p></div>${reportByPath('reports/training-results-2026-09-13/README.md','阅读最新训练结果 ↗')}</div><div class="archive-featured"><div><span class="eyebrow">历史结果整合</span><h2>先读总目录，再定位实验版本</h2><p>31 个运行目录 · 11 组辅助记录。流程测试、失败和被替代版本分别保留。</p></div>${reportByPath('docs/TRAINING_RESULTS_INDEX.md','阅读训练结果总目录 ↗')}</div>`)}<div class="archive-tools"><label for="archive-search">搜索报告、目录或说明<input id="archive-search" type="search" placeholder="例如：置换、matched、OA、成员调研" value="${escapeHTML(archiveUI.query)}"></label><button class="button" id="archive-expand">${archiveUI.expanded?'折叠全部':'展开全部'}</button><span id="archive-count" role="status"></span></div><div id="archive-tree" class="archive-tree"></div>`}`;
  if(section==='sources') {
    renderSourceTree();
    $('#archive-search').addEventListener('input', e=>{archiveUI.query=e.target.value;renderSourceTree();});
    $('#archive-expand').addEventListener('click',()=>{archiveUI.expanded=!archiveUI.expanded;$('#archive-expand').textContent=archiveUI.expanded?'折叠全部':'展开全部';renderSourceTree();});
  }
}

function reportByPath(path,label) {
  const source=data.sources.find(s=>s.repo_path===path);
  return source?evidenceLink(source.id,label):'';
}

function renderSourceTree() {
  const needle=archiveUI.query.toLocaleLowerCase().trim();
  const sources=uniqueSources().filter(s=>s.section!=='meetings' && (!needle || [s.label,s.description,s.repo_path,...(s.category||[])].join(' ').toLocaleLowerCase().includes(needle)));
  $('#archive-count').textContent=`${sources.length} 份文件`;
  const tree={children:new Map(),files:[],count:0};
  for(const source of sources) {
    let node=tree;node.count++;
    for(const part of source.category||['项目文档']) {
      if(!node.children.has(part))node.children.set(part,{children:new Map(),files:[],count:0});
      node=node.children.get(part);node.count++;
    }
    node.files.push(source);
  }
  function render(node,depth=0) {
    return [...node.children.entries()].sort(([a],[b])=>a.localeCompare(b,'zh-CN')).map(([name,child])=>`<details class="archive-folder" ${archiveUI.expanded||needle?'open':''}><summary><span class="folder-symbol" aria-hidden="true"></span><span>${escapeHTML(name)}</span><small>${child.count} 份</small></summary><div class="folder-body">${render(child,depth+1)}</div></details>`).join('')+
      node.files.sort((a,b)=>a.label.localeCompare(b.label,'zh-CN')).map(s=>`<div class="archive-file"><span class="file-format">${escapeHTML(s.format||'FILE')}</span><div><button class="archive-file-title" data-source="${escapeHTML(s.id)}">${escapeHTML(s.label)}</button><small>${escapeHTML(s.description||s.repo_path)}</small></div>${window.NEUROGRAPH_PUBLIC && !s.public_url ? '<span class="muted">本机材料</span>' : `<a class="file-download" href="${window.NEUROGRAPH_PUBLIC ? s.public_url : '/api/source/'+encodeURIComponent(s.id)+'?download=1'}" download aria-label="下载 ${escapeHTML(s.label)}">下载</a>`}</div>`).join('');
  }
  $('#archive-tree').innerHTML=sources.length?render(tree):'<div class="empty"><h2>没有匹配文件</h2><p>尝试数据集名称、实验目录或报告关键词。</p></div>';
}

function meetingArchive() {
  const groups=new Map();
  data.sources.filter(s=>s.section==='meetings').forEach(s=>{if(!groups.has(s.date))groups.set(s.date,[]);groups.get(s.date).push(s);});
  return `<div class="meeting-intro"><h2>会议报告与原文</h2><p>${groups.size} 次会议，按会议日期归档。保留原件；未记录的钟点不补写。</p></div><div class="meeting-list">${[...groups].sort(([a],[b])=>b.localeCompare(a)).map(([date,sources])=>`<article class="meeting-card"><div class="meeting-date"><strong>${date.slice(8)}</strong><span>${date.slice(0,7)}</span></div><div><h3>${date} 项目会议</h3><p>${sources.some(s=>s.kind==='会议原文')?'总结与原文可分别查看':'当前仅归档会议报告'}</p><div class="meeting-files">${sources.map(s=>evidenceLink(s.id,s.kind+' · '+s.format.toUpperCase()+' ↗')).join('')}</div></div><a class="button" href="#calendar?date=${date}&type=meeting">查看日历 ↗</a></article>`).join('')}</div>`;
}

function monthDays(month) {
  const [year,m]=month.split('-').map(Number);
  const first=new Date(Date.UTC(year,m-1,1));
  const offset=(first.getUTCDay()+6)%7;
  const count=new Date(Date.UTC(year,m,0)).getUTCDate();
  return Array.from({length:Math.ceil((offset+count)/7)*7},(_,i)=>new Date(Date.UTC(year,m-1,i-offset+1)).toISOString().slice(0,10));
}

function calendarPage() {
  const params=routeParams();
  if(validISODate(params.get('date'))) {
    calendarUI.selected=params.get('date');calendarUI.month=calendarUI.selected.slice(0,7);
  }
  if(eventTypes[params.get('type')])calendarUI.type=params.get('type');
  if(!calendarUI.selected)calendarUI.selected=shanghaiDay();
  if(!calendarUI.month)calendarUI.month=calendarUI.selected.slice(0,7);
  $('#view-calendar').innerHTML=`<div class="page-heading"><div><span class="eyebrow">PROJECT CALENDAR · UTC+8</span><h1>项目日历</h1><p class="archive-subtitle">会议、截止日期与工作记录，每一条都有来处。</p></div>${window.NEUROGRAPH_PUBLIC ? '<span class="muted">研究日程与历史记录</span>' : '<button class="button primary" id="calendar-add">新增日程</button>'}</div>
    <div class="calendar-toolbar"><div class="month-controls"><button class="button" data-month-step="-1" aria-label="上个月">←</button><label for="calendar-month" class="sr-only">显示月份</label><input id="calendar-month" type="month" value="${calendarUI.month}"><button class="button" data-month-step="1" aria-label="下个月">→</button><button class="button" id="calendar-today">今天</button></div><div class="calendar-modes"><button class="button" data-calendar-mode="month" aria-pressed="${calendarUI.mode==='month'}">月历</button><button class="button" data-calendar-mode="list" aria-pressed="${calendarUI.mode==='list'}">月度清单</button></div></div>
    <div class="calendar-filters"><div class="event-type-filters" aria-label="事件类型">${Object.entries({all:'全部',...eventTypes}).map(([key,label])=>`<button class="type-filter ${key}" data-event-type="${key}" aria-pressed="${calendarUI.type===key}">${label}</button>`).join('')}</div><label class="calendar-search" for="calendar-query">搜索记录<input id="calendar-query" type="search" placeholder="搜索会议、实验或工作内容" value="${escapeHTML(calendarUI.query)}"></label></div>
    <div id="calendar-results"></div><div class="calendar-footnote">会议未记录钟点时仅按日期展示；工作记录采用原文日期，历史状态不代表当前进度。${window.NEUROGRAPH_PUBLIC ? '此站展示已发布日程，修改后需重新发布。' : '新增和编辑保存至本机 calendar.json，团队共享需提交 Git。'}</div>`;
  renderCalendarResults();
  $('#calendar-add')?.addEventListener('click',()=>editCalendarEvent());
  $('#calendar-query').addEventListener('input',e=>{calendarUI.query=e.target.value;renderCalendarResults();});
  $('#calendar-month').addEventListener('change',e=>{if(/^\d{4}-\d{2}$/.test(e.target.value)){calendarUI.month=e.target.value;calendarUI.selected=e.target.value+'-01';clearCalendarRoute();renderCalendarResults();}});
  $('#calendar-today').addEventListener('click',()=>{calendarUI.selected=shanghaiDay();calendarUI.month=calendarUI.selected.slice(0,7);clearCalendarRoute();calendarPage();$('#calendar-today').focus();});
}

function clearCalendarRoute() { history.replaceState(null,'','#calendar'); }

function filteredEvents() {
  const q=calendarUI.query.toLocaleLowerCase().trim();
  return (data.calendar?.events||[]).filter(e=>(calendarUI.type==='all'||e.type===calendarUI.type) && (!q || (e.title+' '+e.description).toLocaleLowerCase().includes(q))).sort((a,b)=>((a.date||'9999')+(a.time||'')).localeCompare((b.date||'9999')+(b.time||''))||a.title.localeCompare(b.title,'zh-CN'));
}

function eventCard(event) {
  return `<article class="calendar-event ${escapeHTML(event.type)}"><div class="event-card-meta"><span class="event-kind ${escapeHTML(event.type)}">${eventTypes[event.type]}</span><span>${event.date?escapeHTML(event.date)+(event.time?' '+escapeHTML(event.time):' · 钟点未记录'):'日期待定'}</span>${event.editable?`<button class="text-link event-edit" data-event-edit="${escapeHTML(event.id)}">编辑</button>`:''}</div><h3>${escapeHTML(event.title)}</h3><details><summary>记录详情与日期依据</summary><p class="event-description">${escapeHTML(event.description)}</p><small>${escapeHTML(event.date_basis||'人工记录')}</small></details><div class="event-sources">${event.sources.map(id=>{const s=sourceById(id);return s?evidenceLink(id,s.label+' ↗'):'';}).join('')}</div></article>`;
}

function renderCalendarResults() {
  const events=filteredEvents();
  const dated=events.filter(e=>e.date?.startsWith(calendarUI.month));
  const pending=events.filter(e=>!e.date);
  const selected=events.filter(e=>e.date===calendarUI.selected);
  const cells=monthDays(calendarUI.month).map(day=>{
    const daily=events.filter(e=>e.date===day);
    const types=[...new Set(daily.map(e=>e.type))];
    return `<button class="calendar-day ${day.startsWith(calendarUI.month)?'':'outside'} ${day===shanghaiDay()?'today':''}" data-calendar-day="${day}" aria-pressed="${day===calendarUI.selected}" aria-label="${day}，${daily.length}条记录${daily.length?'，'+escapeHTML(daily.map(e=>eventTypes[e.type]+':'+e.title).join('；')):''}"><span class="day-number">${Number(day.slice(8))}</span><span class="day-preview">${daily.slice(0,2).map(e=>`<span class="day-event ${e.type}">${escapeHTML(e.title)}</span>`).join('')}${daily.length>2?`<small>另 ${daily.length-2} 条</small>`:''}</span><span class="day-dots">${types.map(t=>`<i class="${t}"></i>`).join('')}${daily.length?`<small>${daily.length}</small>`:''}</span></button>`;
  }).join('');
  const empty='<div class="empty"><h3>暂无记录</h3><p>可切换日期或类型，也可以新增日程。</p></div>';
  $('#calendar-results').innerHTML=`<div class="calendar-summary" role="status">${calendarUI.month} · ${dated.length} 条已定日期记录 · ${pending.length} 条待定</div>${calendarUI.mode==='month'?`<div class="calendar-layout"><div class="month-panel"><div class="weekdays" aria-hidden="true">${['一','二','三','四','五','六','日'].map(d=>`<span>周${d}</span>`).join('')}</div><div class="calendar-grid" role="group" aria-label="${calendarUI.month}月历">${cells}</div></div><aside class="day-agenda" aria-label="当天记录"><h2>${calendarUI.selected} <small>${selected.length} 条</small></h2>${selected.map(eventCard).join('')||empty}</aside></div>`:`<div class="month-agenda"><h2>${calendarUI.month} 月度记录</h2>${dated.map(eventCard).join('')||empty}</div>`}<details class="undated-panel" open><summary>待定安排与未约定 DDL <span>${pending.length}</span></summary><p>以下行动项没有明确日期，未强行放入某一天。</p><div class="undated-grid">${pending.map(eventCard).join('')||'<p>当前筛选下没有待定安排。</p>'}</div></details>`;
}

function editCalendarEvent(id) {
  const event=(data.calendar?.events||[]).find(e=>e.id===id) || {type:'meeting',title:'',date:calendarUI.selected,time:'',description:'',sources:[]};
  openDialog(id?'编辑日程':'新增日程',`<h2>${id?'编辑日程':'新增日程'}</h2><form id="calendar-form" class="calendar-form"><label>标题<input name="title" required maxlength="160" value="${escapeHTML(event.title)}"></label><label>类型<select name="type">${Object.entries(eventTypes).map(([key,label])=>`<option value="${key}" ${event.type===key?'selected':''}>${label}</option>`).join('')}</select></label><div class="date-fields"><label>日期（留空表示待定）<input name="date" type="date" value="${escapeHTML(event.date)}"></label><label>北京时间（可选）<input name="time" type="time" value="${escapeHTML(event.time)}"></label></div><label>说明<textarea name="description" maxlength="4000" rows="4">${escapeHTML(event.description)}</textarea></label><label>关联报告（可多选）<select name="sources" multiple size="6">${data.sources.map(s=>`<option value="${escapeHTML(s.id)}" ${event.sources.includes(s.id)?'selected':''}>${escapeHTML(s.label)}</option>`).join('')}</select></label><p class="form-hint">Ctrl / Command 可选择多份报告。历史工作日志在原工作记录中维护。</p><p id="calendar-form-status" role="status"></p><button class="button primary" type="submit">保存日程</button></form>`);
  const picker=$('#calendar-form select[name="sources"]');
  for(const option of picker.options) {const source=sourceById(option.value);option.textContent=source.label+' — '+source.repo_path;}
  const searchLabel=document.createElement('label');
  searchLabel.innerHTML='筛选关联报告<input id="event-source-query" type="search" placeholder="按报告名称或文件路径筛选；已选报告保留">';
  picker.parentElement.before(searchLabel);
  $('#event-source-query').addEventListener('input',e=>{
    const query=e.target.value.trim().toLocaleLowerCase();
    for(const option of picker.options)option.hidden=!option.selected && !option.textContent.toLocaleLowerCase().includes(query);
  });
  $('#calendar-form').addEventListener('submit',async e=>{
    e.preventDefault();const form=e.target;const fields=new FormData(form);const button=form.querySelector('[type=submit]');button.disabled=true;
    const entry=Object.fromEntries(['title','type','date','time','description'].map(k=>[k,fields.get(k)]));
    entry.sources=fields.getAll('sources');if(id)entry.id=id;
    try {
      const response=await fetch('/api/calendar/event',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:data.calendar.revision,event:entry})});
      const result=await response.json();if(!response.ok)throw new Error(result.error||'保存失败');
      data.calendar.revision=result.revision;data.calendar.events=data.calendar.events.filter(x=>x.id!==result.event.id).concat({...result.event,editable:true});
      $('#detail-dialog').close();if(entry.date){calendarUI.selected=entry.date;calendarUI.month=entry.date.slice(0,7);}calendarUI.type='all';calendarUI.query='';clearCalendarRoute();showView('calendar');
    } catch(err){$('#calendar-form-status').textContent=err.message;button.disabled=false;}
  });
}

document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.calendarDay){calendarUI.selected=button.dataset.calendarDay;calendarUI.month=calendarUI.selected.slice(0,7);clearCalendarRoute();$('#calendar-month').value=calendarUI.month;renderCalendarResults();$(`[data-calendar-day="${calendarUI.selected}"]`)?.focus();}
  if(button.dataset.monthStep){const [y,m]=calendarUI.month.split('-').map(Number);calendarUI.month=new Date(Date.UTC(y,m-1+Number(button.dataset.monthStep),1)).toISOString().slice(0,7);calendarUI.selected=calendarUI.month+'-01';clearCalendarRoute();calendarPage();$(`[data-month-step="${button.dataset.monthStep}"]`).focus();}
  if(button.dataset.eventType){calendarUI.type=button.dataset.eventType;clearCalendarRoute();document.querySelectorAll('[data-event-type]').forEach(b=>b.setAttribute('aria-pressed',b===button));renderCalendarResults();}
  if(button.dataset.calendarMode){calendarUI.mode=button.dataset.calendarMode;document.querySelectorAll('[data-calendar-mode]').forEach(b=>b.setAttribute('aria-pressed',b===button));renderCalendarResults();}
  if(button.dataset.eventEdit)editCalendarEvent(button.dataset.eventEdit);
});

document.addEventListener('keydown',event=>{
  const day=event.target.closest('[data-calendar-day]');if(!day)return;
  const delta={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[event.key];
  if(delta===undefined)return;event.preventDefault();
  const date=new Date(day.dataset.calendarDay+'T00:00:00Z');date.setUTCDate(date.getUTCDate()+delta);
  calendarUI.selected=date.toISOString().slice(0,10);calendarUI.month=calendarUI.selected.slice(0,7);clearCalendarRoute();$('#calendar-month').value=calendarUI.month;renderCalendarResults();$(`[data-calendar-day="${calendarUI.selected}"]`)?.focus();
});

document.addEventListener('click',event=>{
  if(event.target.closest('a[href^="#"]') && document.querySelector('#detail-dialog')?.open)$('#detail-dialog').close();
});

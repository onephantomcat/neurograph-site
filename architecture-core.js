(function (root) {
  'use strict';
  const states = {original:'原始模块', modified:'已修改', added:'已新增', removed:'已移除', proposed:'待实施提议'};
  function versions(module) {
    return [{...module.original, id:'paper', label:'论文原版', status:'original'}, ...module.revisions];
  }
  function snapshot(module, mode, proposal, variant) {
    if (mode === 'paper') return {...module.original, id:'paper', state:'original'};
    if (proposal && variant && proposal.baseVariant!==variant.id) throw new Error('模块提议与所选项目方案不一致');
    if (proposal) return {...proposal, state:'proposed'};
    const revision = variant ? module.revisions.find(item=>item.id===variant.modules[module.id]) : module.revisions.filter(item => item.status === 'implemented').at(-1);
    return revision ? {...revision, state:revision.change || 'modified'} : {...module.original, id:'paper', state:'original'};
  }
  function reference(paper, module, version) {
    return `@architecture:${paper.id}/${module.id}@${version.id}`;
  }
  function activeVariant(paper, id) {
    const variants = [...(paper.variants || [])].sort((a,b)=>a.date.localeCompare(b.date));
    const selected = id ? variants.find(variant=>variant.id===id) : variants.at(-1);
    if (id && !selected) throw new Error('该论文没有此项目方案');
    return selected || {id:'paper',label:'论文原版',modules:{}};
  }
  function visibleModules(paper, mode, variant = activeVariant(paper)) {
    return paper.modules.filter(module => !module.revisions.some(version=>version.status==='implemented' && version.change==='added') || mode!=='paper' && Boolean(variant.modules[module.id]));
  }
  function label(value) {
    return String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n',' ');
  }
  function graph(paper, mode, proposals = {}, variant = activeVariant(paper)) {
    const lines = ['flowchart TB'];
    const modules = visibleModules(paper, mode, variant), ids = new Set(modules.map(module=>module.id));
    for (const module of modules) {
      const version = snapshot(module, mode, proposals[module.id], variant);
      lines.push(`${module.id}["${label(module.label)}<br/>${states[version.state]}"]:::${version.state}`);
    }
    let edgeIndex = 0;
    for (const edge of paper.connections) {
      const applies = !edge.variants || edge.variants.includes(variant.id);
      if (!ids.has(edge.from) || !ids.has(edge.to) || edge.change==='added' && (mode==='paper' || !applies)) continue;
      const removed = mode!=='paper' && (edge.change==='removed' && applies || [edge.from,edge.to].some(id=>snapshot(modules.find(module=>module.id===id),mode,proposals[id],variant).state==='removed'));
      const arrow = removed || edge.kind === 'training' ? '-.->' : '-->';
      const title = removed ? '历史路径 · '+(edge.label || '已移除') : edge.label;
      lines.push(`${edge.from} ${arrow}${title ? `|"${label(title)}"|` : ''} ${edge.to}`);
      if (removed) lines.push(`linkStyle ${edgeIndex} stroke:#be123c,stroke-dasharray:5`);
      else if (mode!=='paper' && edge.change==='added' && applies) lines.push(`linkStyle ${edgeIndex} stroke:#047857,stroke-width:2px`);
      edgeIndex++;
    }
    const colors = {original:['#eff6ff','#2563eb'], modified:['#fff3e3','#b45309'], added:['#ecfdf5','#047857'], removed:['#fff1f2','#be123c'], proposed:['#f5f3ff','#7c3aed']};
    for (const [state,[fill,stroke]] of Object.entries(colors)) lines.push(`classDef ${state} fill:${fill},stroke:${stroke},stroke-width:2px,color:#172b45`);
    return lines.join('\n');
  }
  function prompt(items, goal) {
    return ['请依据本地论文和项目源码修改模型。', `修改目标：${goal.trim() || '请填写具体修改目标'}`, '',
      ...items.map(item => [`模块引用：${item.ref}`, `论文：${item.paper}；模块：${item.module}；方案：${item.variant || '论文原版'}`, `当前说明：${item.version.description}`,
        `输入：${item.version.inputs}`, `输出：${item.version.outputs}`, `参数：${JSON.stringify(item.version.parameters)}`, `证据：${item.version.evidence}`].join('\n')),
      '', '请保留每个模块的 original，新增 revisions（日期、原因、可解释参数、实施证据），明确 implemented/proposed 与 modified/added/removed。',
      '同时核查 connections、训练与推理流程，运行 build_architectures.py 和相关测试，再同步 Fmri。'].join('\n');
  }
  const api = {states, versions, snapshot, reference, activeVariant, visibleModules, graph, prompt};
  root.ArchitectureCore = api;
  if (typeof module !== 'undefined') module.exports = api;
})(globalThis);

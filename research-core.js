(function(root){
  'use strict';
  function targets(index,events){
    const found=new Map(),activities=new Map(index.activities.map(item=>[item.id,item]));
    for(const event of events)for(const id of index.eventLinks[event.id]||[]){
      const item=activities.get(id);
      if(!item)throw new Error('日历引用了未登记的活动');
      if(item.modelIds.length||item.datasetIds.length)found.set(id,{...item,fromEvent:event.id,day:event.date});
    }
    return [...found.values()];
  }
  function href(index,item,modelId=item.modelIds[0],datasetId,fromEvent='',day=''){
    const selected=index.models.find(model=>model.id===modelId),params=new URLSearchParams();
    if(modelId&&!selected)throw new Error('跳转目标模型未登记');
    if(selected){
      if(selected.paperId){
        params.set('paper',selected.paperId);
        const variant=item.variants?.[modelId];
        params.set('mode',variant?'current':'paper');
        if(variant)params.set('variant',variant);
      }else params.set('model',selected.id);
      params.set('activity',item.id);params.set('tab','data');
    }else params.set('tab','data');
    if(datasetId||item.datasetIds[0])params.set('dataset',datasetId||item.datasetIds[0]);
    if(!selected)params.set('activity',item.id);
    if(fromEvent)params.set('fromEvent',fromEvent);
    if(day)params.set('date',day);
    return '#'+(selected?'architectures':'datasets')+'?'+params;
  }
  function recentModels(items,index){
    const models=new Map(index.models.map(item=>[item.id,item]));
    return [...items].sort((a,b)=>(Date.parse(models.get(b.id)?.lastModified)||0)-(Date.parse(models.get(a.id)?.lastModified)||0)||a.id.localeCompare(b.id));
  }
  const api={targets,href,recentModels};root.ResearchCore=api;
  if(typeof module!=='undefined')module.exports=api;
})(globalThis);

from pathlib import Path
import csv,json,math,statistics
METRICS=('auc','ap','ba','brier','logloss')
KEYS=('inner','repeat','seed')
def mean(values):
 values=list(values)
 if not values:raise ValueError('没有可计算的记录')
 return math.fsum(values)/len(values)
def load_models(path):
 with Path(path).open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
 if not rows:raise ValueError('模型指标表为空')
 required={'variant',*KEYS,*METRICS,'step','validation_n'}
 if not required<=rows[0].keys():raise ValueError('模型指标表缺少字段：'+','.join(sorted(required-rows[0].keys())))
 seen=set();out=[]
 for row in rows:
  r=dict(row)
  for key in (*KEYS,'step','validation_n'):r[key]=int(r[key])
  for key in METRICS:
   r[key]=float(r[key])
   if not math.isfinite(r[key]):raise ValueError('指标必须为有限数值')
   if key!='logloss' and not 0<=r[key]<=1:raise ValueError(key+'必须在0至1之间')
   if key=='logloss' and r[key]<0:raise ValueError('logloss不能为负')
  token=(r['variant'],*[r[k] for k in KEYS])
  if token in seen:raise ValueError('同方法、分区、支持和初始化出现重复记录')
  seen.add(token);out.append(r)
 if len({r['step'] for r in out})!=1:raise ValueError('请分别比较不同更新时点，不能混合选轮与末轮')
 if any(r['validation_n']<=0 for r in out):raise ValueError('验证人数必须大于0')
 if 'support_n' in out[0] and len({r['support_n'] for r in out})!=1:raise ValueError('请分别比较不同支持预算')
 return out
def aggregate(rows):
 result=[]
 for variant in sorted({r['variant'] for r in rows}):
  rr=[r for r in rows if r['variant']==variant]
  result.append(dict(variant=variant,models=len(rr),step=rr[0]['step'],**{k:mean(r[k] for r in rr) for k in METRICS}))
 return result
def paired(rows,reference):
 refs={tuple(r[k] for k in KEYS):r for r in rows if r['variant']==reference}
 if not refs:raise ValueError('找不到指定参照方法')
 result=[]
 for variant in sorted({r['variant'] for r in rows}-{reference}):
  rr={tuple(r[k] for k in KEYS):r for r in rows if r['variant']==variant}
  if rr.keys()!=refs.keys():raise ValueError('方法之间的分区、支持和初始化不能一一配对')
  for key,r in sorted(rr.items()):
   ref=refs[key]
   if r['validation_n']!=ref['validation_n']:raise ValueError('配对模型的验证人数不一致')
   result.append(dict(variant=variant,reference=reference,**dict(zip(KEYS,key)),**{'delta_'+m:r[m]-ref[m] for m in METRICS}))
 return result
def compare_summary(deltas):
 return [dict(variant=v,reference=next(r['reference'] for r in deltas if r['variant']==v),paired_models=sum(r['variant']==v for r in deltas),**{'delta_'+m:mean(r['delta_'+m] for r in deltas if r['variant']==v) for m in METRICS}) for v in sorted({r['variant'] for r in deltas})]
def binary_metrics(y,p,epsilon=2**-23):
 if len(y)!=len(p) or not y:raise ValueError('标签和概率必须等长且非空')
 if any(v not in (0,1) for v in y) or len(set(y))!=2:raise ValueError('评价需要同时包含0和1标签')
 if any(not math.isfinite(v) or not 0<=v<=1 for v in p):raise ValueError('概率必须是0至1之间的有限数值')
 if not 0<epsilon<.5:raise ValueError('概率裁剪精度不正确')
 pos=[v for v,t in zip(p,y) if t==1];neg=[v for v,t in zip(p,y) if t==0]
 auc=mean(1 if a>b else .5 if a==b else 0 for a in pos for b in neg)
 ordered=sorted(zip(p,y),key=lambda v:-v[0]);tp=0;last_recall=0.;ap=0.
 for i,(prob,label) in enumerate(ordered):
  tp+=label
  if i==len(ordered)-1 or ordered[i+1][0]!=prob:
   recall=tp/len(pos);ap+=(recall-last_recall)*tp/(i+1);last_recall=recall
 h=[v>=.5 for v in p];sensitivity=mean(a for a,t in zip(h,y) if t==1);specificity=mean(not a for a,t in zip(h,y) if t==0)
 pc=[min(max(v,epsilon),1-epsilon) for v in p]
 return dict(auc=auc,ap=ap,ba=(sensitivity+specificity)/2,brier=mean((v-t)**2 for v,t in zip(p,y)),logloss=mean(-t*math.log(v)-(1-t)*math.log1p(-v) for t,v in zip(y,pc)))
def write_csv(path,rows):
 with Path(path).open('w',encoding='utf8',newline='') as f:
  w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(rows)
def rank(values):
 indices=sorted(range(len(values)),key=lambda i:values[i]);result=[0.]*len(values);i=0
 while i<len(indices):
  j=i+1
  while j<len(indices) and values[indices[j]]==values[indices[i]]:j+=1
  for k in indices[i:j]:result[k]=(i+j-1)/2
  i=j
 return result
def spearman(a,b):
 if len(a)!=len(b) or len(a)<2:raise ValueError('向量必须等长且至少有两个元素')
 x,y=rank(a),rank(b);mx,my=mean(x),mean(y)
 xx=[v-mx for v in x];yy=[v-my for v in y];den=math.sqrt(math.fsum(v*v for v in xx)*math.fsum(v*v for v in yy))
 if den==0:raise ValueError('常数向量没有定义秩相关')
 return math.fsum(l*r for l,r in zip(xx,yy))/den
def group_map_pairs(path):
 maps={}
 with Path(path).open(encoding='utf-8-sig',newline='') as f:
  for row in csv.DictReader(f):
   v=row['variant'];roi=int(row['roi']);score=float(row['mean_sensitivity'])
   if not math.isfinite(score):raise ValueError('敏感性必须为有限值')
   if roi in maps.setdefault(v,{}):raise ValueError('同方法出现重复脑区')
   maps[v][roi]=score
 result=[]
 import itertools
 for left,right in itertools.combinations(sorted(maps),2):
  if maps[left].keys()!=maps[right].keys():raise ValueError('方法的脑区集合不一致')
  ids=sorted(maps[left]);a=[maps[left][i] for i in ids];b=[maps[right][i] for i in ids]
  top=lambda d:set(sorted(d,key=lambda i:(-d[i],i))[:10])
  result.append(dict(left=left,right=right,rois=len(ids),spearman=spearman(a,b),top10_overlap=len(top(maps[left])&top(maps[right]))/10))
 return result

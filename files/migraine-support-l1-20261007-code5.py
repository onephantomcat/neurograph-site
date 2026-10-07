"""Paper-motivated supervision-budget check, restricted to each outer training fold."""
from pathlib import Path
import importlib.util,json,os,time,warnings,joblib,numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import log_loss
from nilearn.connectome import ConnectivityMeasure
from threadpoolctl import threadpool_limits
OP=Path(__file__).resolve().parent;receipt=OP/'full_budget_launch_private.json';assert not receipt.exists(),'Observe this existing full-budget diagnostic; do not restart.'
original=json.loads((OP/'training_launch_private.json').read_text());parent=Path(original['parent_run']);data=joblib.load(original['source_package']);tasks=json.loads((parent/'tasks_private.json').read_text())
out=Path(original['run']).parent/('full-training-budget-'+str(int(time.time())));out.mkdir();(out/'models').mkdir();(out/'designs').mkdir();fractions=[1.,.3,.1,.03]
with receipt.open('x',encoding='utf8') as f:json.dump(dict(pid=os.getpid(),run=str(out),parent_run=str(parent),source_package=original['source_package'],fractions=fractions,outer_splits='Reuse original fixed outer training/query memberships; inner 2-fold StratifiedKFold seed20261005+fold on all 88 outer-training people.',tol=1e-8,max_iter=50000,model_seed=0,expected_inner_fits=96,expected_new_inner_FC_references=6,scope='No outer-query model computations/predictions/scores; larger training supervision is a separate development diagnostic, not paired K5 validation or pediatric paper replication.',started_unix=time.time()),f,indent=2)
spec=importlib.util.spec_from_file_location('support_l1',OP/'support_l1.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
state=dict(state='RUNNING',new_inner_fits=0,new_reference_fits=0,new_final_fits=0,outer_query_predictions=0,outer_query_scores=0,started_unix=time.time());rows=[];groups=[]
def save():m.save(out/'status_private.json',state)
save()
try:
 with threadpool_limits(limits=2):
  for fold in range(3):
   task=next(t for t in tasks if t['fold']==fold);support=task['outer_train'];query=task['query'];assert len(support)==88 and len(query)==44
   view=m.SupportView(data,support,query);y=view.rows('labels',support);inner=list(StratifiedKFold(2,shuffle=True,random_state=20261005+fold).split(np.arange(88),y));group=dict(task=f'f{fold}_full',fold=fold,support=support,query=query,inner_splits=[])
   folder=out/'models'/group['task'];folder.mkdir()
   for k,(a,b) in enumerate(inner):
    train=np.asarray(support)[a].tolist();validation=np.asarray(support)[b].tolist();yt=view.rows('labels',train);yv=view.rows('labels',validation);weights=np.array([.5/np.count_nonzero(yt==c) for c in yt])
    ref=ConnectivityMeasure(kind='tangent',standardize=False,vectorize=True,discard_diagonal=True).fit(view.rows('time_series',train));state['new_reference_fits']+=1
    xt=ref.transform(view.rows('time_series',train));xv=ref.transform(view.rows('time_series',validation));ca=view.rows('covariates',train);cv=view.rows('covariates',validation);group['inner_splits'].append(dict(train=train,validation=validation))
    joblib.dump(dict(reference=ref,train_indices=train,train_ids=view.rows('subject_ids',train)),out/f'{group["task"]}_inner{k}_reference_private.joblib',compress=3)
    for method in m.METHODS:
     if method=='fc':x,xval=np.c_[xt,ca],np.c_[xv,cv]
     elif method=='covariates':x,xval=ca,cv
     else:x=np.c_[view.rows(method,train),ca];xval=np.c_[view.rows(method,validation),cv]
     scaler=StandardScaler().fit(x,sample_weight=weights);z=scaler.transform(x);zv=scaler.transform(xval);threshold=float(abs(z.T@(weights*(.5-yt))).max());assert threshold>0 and threshold<=.500000001
     name=f'{group["task"]}_inner{k}_{method}.joblib';joblib.dump(dict(x=x,xv=xval,y=yt,yv=yv,train_indices=train,validation_indices=validation,scaler=scaler,weights=weights,support=support,outer_query=query),out/'designs'/name,compress=3)
     for fraction in fractions:
      lam=threshold*fraction
      with warnings.catch_warnings(record=True) as caught:
       warnings.simplefilter('always');model=LogisticRegression(l1_ratio=1.,solver='liblinear',C=1/lam,max_iter=50000,tol=1e-8,random_state=0).fit(z,yt,sample_weight=weights)
      assert not caught and model.n_iter_.max()<50000,[str(w.message) for w in caught]
      probability=model.predict_proba(zv)[:,1];wv=np.array([.5/np.count_nonzero(yv==c) for c in yv]);loss=float(log_loss(yv,probability,labels=[0,1],sample_weight=wv));diagnostic=m.kkt_diagnostic(z,yt,weights,model,lam)
      h=dict(model=model,scaler=scaler,weights=weights,lambda_=lam,lambda_max=threshold,fraction=fraction,probability=probability,validation_balanced_log_loss=loss,diagnostic=diagnostic,method=method,fold=fold,draw='full_training_budget',inner=k,train_indices=train,validation_indices=validation,phase='outer_training_inner_only',design=name)
      joblib.dump(h,folder/f'inner{k}_{method}_fraction{fraction}.joblib',compress=3);rows.append(dict(task=group['task'],method=method,inner=k,fraction=fraction,loss=loss,lambda_=lam,lambda_max=threshold,**diagnostic));state['new_inner_fits']+=1;save()
   assert view.accessed==set(support) and not view.accessed&set(query);groups.append(group);m.save(out/'groups_private.json',groups)
 selected=[]
 for g in groups:
  for method in m.METHODS:
   means=[float(np.mean([r['loss'] for r in rows if r['task']==g['task'] and r['method']==method and r['fraction']==f])) for f in fractions];i=int(np.argmin(np.round(means,12)));selected.append(dict(task=g['task'],method=method,fraction_grid=fractions,mean_inner_balanced_log_loss=means,chosen_fraction=fractions[i],selected_inner_loss=means[i]))
 m.save(out/'selection_private.json',selected);m.save(out/'inner_results_private.json',rows);assert state['new_inner_fits']==96 and state['new_reference_fits']==6
 state.update(state='FULL_TRAINING_BUDGET_COMPLETE_REPLAY_PENDING',completed_unix=time.time(),saved_models=96,inner_validation_probabilities=4224,outer_training_people_per_fold=88,inner_training_people_per_partition=44,outer_query_rows_used_in_model_computations=0)
 save();print(json.dumps(state),flush=True)
except BaseException:
 import traceback
 state.update(state='FAILED',error=traceback.format_exc());save();raise

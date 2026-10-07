"""Training-only L1 penalty scaled by the zero-solution threshold of each train split."""
from pathlib import Path
import importlib.util,json,os,time,warnings,joblib,numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss
from threadpoolctl import threadpool_limits
OP=Path(__file__).resolve().parent;receipt=OP/'relative_launch_private.json';assert not receipt.exists(),'Observe this relative-penalty run, never launch twice.'
original=json.loads((OP/'training_launch_private.json').read_text());source=Path(original['run']);parent=Path(original['parent_run'])
assert json.loads((source/'status_private.json').read_text())['new_l1_inner_fits']==480
out=source.parent/('relative-penalty-'+str(int(time.time())));out.mkdir();(out/'models').mkdir();fractions=[1.,.3,.1,.03]
with receipt.open('x',encoding='utf8') as f:json.dump(dict(pid=os.getpid(),run=str(out),design_source=str(source/'designs'),parent_run=str(parent),fractions=fractions,rule='lambda_max=max(abs(X_train_scaled.T @ (weights*(0.5-y_train)))); weighted balanced class masses make intercept gradient zero. Scale only by this inner-training threshold. No validation/query statistics enter lambda_max.',tol=1e-8,max_iter=50000,model_seed=0,expected_fits=480,outer_query_scores=0,started_unix=time.time()),f,indent=2)
spec=importlib.util.spec_from_file_location('support_l1',OP/'support_l1.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
state=dict(state='RUNNING',new_inner_fits=0,new_final_fits=0,new_reference_fits=0,outer_query_predictions=0,outer_query_scores=0,design_source=str(source/'designs'),started_unix=time.time());rows=[]
def save():m.save(out/'status_private.json',state)
save()
try:
 with threadpool_limits(limits=2):
  for task in json.loads((parent/'tasks_private.json').read_text()):
   folder=out/'models'/task['task'];folder.mkdir()
   for inner in range(2):
    for method in m.METHODS:
     design=source/'designs'/f'{task["task"]}_inner{inner}_{method}.joblib';d=joblib.load(design);scaler=d['scaler'];weights=d['weights'];z=scaler.transform(d['x']);zv=scaler.transform(d['xv'])
     assert not set(d['train_indices']) & set(d['validation_indices']) and not (set(d['support']) & set(task['query']))
     threshold=float(abs(z.T@(weights*(.5-d['y']))).max());assert threshold>0 and threshold<=.500000001
     for fraction in fractions:
      lam=threshold*fraction
      with warnings.catch_warnings(record=True) as caught:
       warnings.simplefilter('always');model=LogisticRegression(l1_ratio=1.,solver='liblinear',C=1/lam,max_iter=50000,tol=1e-8,random_state=0).fit(z,d['y'],sample_weight=weights)
      assert not caught and model.n_iter_.max()<50000,[str(w.message) for w in caught]
      probability=model.predict_proba(zv)[:,1];wv=np.array([.5/np.count_nonzero(d['yv']==c) for c in d['yv']]);loss=float(log_loss(d['yv'],probability,labels=[0,1],sample_weight=wv));diagnostic=m.kkt_diagnostic(z,d['y'],weights,model,lam)
      head=dict(model=model,scaler=scaler,weights=weights,lambda_=lam,lambda_max=threshold,fraction=fraction,probability=probability,validation_balanced_log_loss=loss,diagnostic=diagnostic,method=method,fold=task['fold'],draw=task['draw'],inner=inner,train_indices=d['train_indices'],validation_indices=d['validation_indices'],phase='support_inner_only',design=design.name)
      joblib.dump(head,folder/f'inner{inner}_{method}_fraction{fraction}.joblib',compress=3);rows.append(dict(task=task['task'],method=method,inner=inner,fraction=fraction,loss=loss,lambda_max=threshold,lambda_=lam,**diagnostic));state['new_inner_fits']+=1;save()
 selected=[]
 for task in json.loads((parent/'tasks_private.json').read_text()):
  for method in m.METHODS:
   means=[float(np.mean([r['loss'] for r in rows if r['task']==task['task'] and r['method']==method and r['fraction']==fraction])) for fraction in fractions];winner=int(np.argmin(np.round(means,12)))
   old=next(s for s in task['selection'] if s['method']==method)
   selected.append(dict(task=task['task'],method=method,fraction_grid=fractions,mean_inner_balanced_log_loss=means,chosen_fraction=fractions[winner],selected_inner_loss=means[winner],old_l2_selected_inner_loss=old['mean_inner_balanced_log_loss'][old['lambda_grid'].index(old['chosen_lambda'])]))
 m.save(out/'selection_private.json',selected);m.save(out/'inner_results_private.json',rows)
 state.update(state='RELATIVE_L1_TRAINING_COMPLETE_REPLAY_PENDING',completed_unix=time.time(),saved_models=480,inner_validation_probabilities=2400,maximum_kkt_residual=max(r['maximum_kkt_residual'] for r in rows),distinct_support_people=77,original_runs_preserved=True)
 assert state['new_inner_fits']==480;save();print(json.dumps(state),flush=True)
except BaseException:
 import traceback
 state.update(state='FAILED',error=traceback.format_exc());save();raise

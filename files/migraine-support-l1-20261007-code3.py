"""Refine only L1 heads whose KKT residual exceeds the first solver's tol."""
from pathlib import Path
import importlib.util,json,os,time,warnings,joblib,numpy as np
from scipy.special import expit
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss
from threadpoolctl import threadpool_limits
OP=Path(__file__).resolve().parent;launch=json.loads((OP/'training_launch_private.json').read_text());source=Path(launch['run']);receipt=OP/'refinement_launch_private.json'
assert not receipt.exists(),'Observe the existing numerical refinement, never launch again.'
assert json.loads((source/'status_private.json').read_text())['state']=='SUPPORT_L1_TRAINING_COMPLETE_REPLAY_PENDING'
spec=importlib.util.spec_from_file_location('support_l1',OP/'support_l1.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
out=source.parent/('numerical-refinement-'+str(int(time.time())));out.mkdir();(out/'models').mkdir()
with receipt.open('x',encoding='utf8') as f:json.dump(dict(pid=os.getpid(),run=str(out),source_run=str(source),parent_run=launch['parent_run'],selection_rule='Only first-run KKT maximum residual > 1e-4, fixed original solver tolerance; not validation loss or query scores.',refined_tol=1e-8,refined_max_iter=50000,started_unix=time.time()),f,indent=2)
state=dict(state='RUNNING',new_refinement_fits=0,reused_heads=0,outer_query_predictions=0,outer_query_scores=0,started_unix=time.time());rows=[]
def save():module.save(out/'status_private.json',state)
save()
try:
 with threadpool_limits(limits=2):
  for path in sorted((source/'models').rglob('*.joblib')):
   h=joblib.load(path);d=joblib.load(source/'designs'/h['design']);original=h['diagnostic']['maximum_kkt_residual'];head=dict(h)
   if original>1e-4:
    z=h['scaler'].transform(d['x']);zv=h['scaler'].transform(d['xv'])
    with warnings.catch_warnings(record=True) as caught:
     warnings.simplefilter('always');m=LogisticRegression(l1_ratio=1.,solver='liblinear',C=1/h['lambda_'],max_iter=50000,tol=1e-8,random_state=0).fit(z,d['y'],sample_weight=h['weights'])
    assert not caught and m.n_iter_.max()<50000,[str(w.message) for w in caught]
    p=m.predict_proba(zv)[:,1];wv=np.array([.5/np.count_nonzero(d['yv']==c) for c in d['yv']]);diagnostic=module.kkt_diagnostic(z,d['y'],h['weights'],m,h['lambda_'])
    head.update(model=m,probability=p,validation_balanced_log_loss=float(log_loss(d['yv'],p,labels=[0,1],sample_weight=wv)),diagnostic=diagnostic,numerically_refined=True,original_kkt_residual=original)
    rows.append(dict(model=path.relative_to(source).as_posix(),original_kkt=original,refined_kkt=diagnostic['maximum_kkt_residual'],iterations=int(m.n_iter_.max()),objective_change=diagnostic['objective']-h['diagnostic']['objective']))
    state['new_refinement_fits']+=1
   else:head['numerically_refined']=False;state['reused_heads']+=1
   destination=out/path.relative_to(source);destination.parent.mkdir(exist_ok=True);joblib.dump(head,destination,compress=3);save()
 assert state['new_refinement_fits']+state['reused_heads']==480
 selected=[]
 for task in json.loads((Path(launch['parent_run'])/'tasks_private.json').read_text()):
  for method in module.METHODS:
   means=[float(np.mean([joblib.load(out/'models'/task['task']/f'inner{k}_{method}_lambda{lam}.joblib')['validation_balanced_log_loss'] for k in range(2)])) for lam in module.LAMBDAS]
   chosen=int(np.argmin(np.round(means,12)));old=next(s for s in task['selection'] if s['method']==method)
   selected.append(dict(task=task['task'],method=method,lambda_grid=list(module.LAMBDAS),mean_inner_balanced_log_loss=means,chosen_lambda=module.LAMBDAS[chosen],selected_inner_loss=means[chosen],old_l2_selected_inner_loss=old['mean_inner_balanced_log_loss'][old['lambda_grid'].index(old['chosen_lambda'])]))
 module.save(out/'selection_private.json',selected);module.save(out/'refinement_diagnostics_private.json',rows)
 state.update(state='NUMERICAL_REFINEMENT_COMPLETE_REPLAY_PENDING',completed_unix=time.time(),design_source=str(source/'designs'),original_480_heads_preserved=True,maximum_refined_kkt=max(r['refined_kkt'] for r in rows),max_iterations=max(r['iterations'] for r in rows))
 save();print(json.dumps(state),flush=True)
except BaseException:
 import traceback
 state.update(state='FAILED',error=traceback.format_exc());save();raise

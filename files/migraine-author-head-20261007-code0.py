"""Fixed author-default L1/L2 heads on existing outer-training inner splits only."""
from pathlib import Path
import json,time,warnings
import joblib,numpy as np
from scipy.special import expit
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import log_loss,roc_auc_score,average_precision_score,brier_score_loss,balanced_accuracy_score
from threadpoolctl import threadpool_limits
METHODS=('fc','pretrained','random','covariates')
def save(p,v):p.write_text(json.dumps(v,indent=2,allow_nan=False)+'\n',encoding='utf8')
def feature_columns(method,x):
 expected={'fc':4009,'pretrained':292,'random':292,'covariates':4}[method]
 assert x.shape[1]==expected
 return x if method=='covariates' else x[:,:-4]
def metrics(y,p):
 w=np.array([.5/np.count_nonzero(y==v) for v in y])
 return dict(auc=float(roc_auc_score(y,p)),average_precision=float(average_precision_score(y,p)),log_loss=float(log_loss(y,p,labels=[0,1])),balanced_log_loss=float(log_loss(y,p,labels=[0,1],sample_weight=w)),brier=float(brier_score_loss(y,p)),balanced_accuracy=float(balanced_accuracy_score(y,p>=.5)))
def diagnostic(z,y,model,l1):
 a=np.c_[z,np.ones(len(z))];theta=np.r_[model.coef_[0],model.intercept_[0]];gradient=a.T@(expit(a@theta)-y)
 if l1:residual=np.where(theta!=0,abs(gradient+np.sign(theta)),np.maximum(abs(gradient)-1,0))
 else:residual=abs(gradient+theta)
 penalty=np.abs(theta).sum() if l1 else theta@theta/2
 return dict(maximum_kkt_residual=float(residual.max()),summed_objective=float(np.sum(np.logaddexp(0,a@theta)-y*(a@theta))+penalty),nonzero_coefficients=int(np.count_nonzero(model.coef_)),iterations=int(model.n_iter_.max()))
def run(design_run,out):
 source=Path(design_run);out=Path(out);assert not out.exists();out.mkdir();(out/'models').mkdir();groups=json.loads((source/'groups_private.json').read_text());assert len(groups)==3
 state=dict(state='RUNNING',started_unix=time.time(),new_inner_fits=0,new_reference_fits=0,new_final_fits=0,outer_query_predictions=0,outer_query_scores=0,source_design_run=str(source));save(out/'status_private.json',state);rows=[]
 try:
  with threadpool_limits(limits=2):
   for g in groups:
    folder=out/'models'/g['task'];folder.mkdir()
    for k,part in enumerate(g['inner_splits']):
     for method in METHODS:
      name=f'{g["task"]}_inner{k}_{method}.joblib';d=joblib.load(source/'designs'/name)
      assert list(d['train_indices'])==part['train'] and list(d['validation_indices'])==part['validation'] and len(d['y'])==44 and len(d['yv'])==44
      assert not (set(d['train_indices'])|set(d['validation_indices']))&set(d['outer_query'])
      x=feature_columns(method,np.asarray(d['x'],float));xv=feature_columns(method,np.asarray(d['xv'],float));y=np.asarray(d['y']);yv=np.asarray(d['yv']);prior=float(y.mean())
      for scale in ('raw','standardized'):
       scaler=None if scale=='raw' else StandardScaler().fit(x);z=x if scaler is None else scaler.transform(x);zv=xv if scaler is None else scaler.transform(xv)
       assert np.isfinite(z).all() and np.isfinite(zv).all()
       for penalty in ('l1','l2'):
        with warnings.catch_warnings(record=True) as caught:
         warnings.simplefilter('always');model=LogisticRegression(l1_ratio=1. if penalty=='l1' else 0.,solver='liblinear',C=1.,max_iter=1000,tol=1e-4,random_state=0).fit(z,y)
        p=model.predict_proba(zv)[:,1];stats=metrics(yv,p);diag=diagnostic(z,y,model,penalty=='l1')
        h=dict(model=model,scaler=scaler,method=method,scale=scale,penalty=penalty,train_indices=d['train_indices'],validation_indices=d['validation_indices'],outer_query=g['query'],design=name,probability=p,training_prior=prior,metrics=stats,diagnostic=diag,warnings=[str(w.message) for w in caught],phase='outer_training_inner_only')
        joblib.dump(h,folder/f'inner{k}_{method}_{scale}_{penalty}.joblib',compress=3)
        rows.append(dict(task=g['task'],inner=k,method=method,scale=scale,penalty=penalty,feature_count=x.shape[1],training_people=len(y),validation_people=len(yv),training_positive_count=int(y.sum()),validation_positive_count=int(yv.sum()),**stats,**diag,probability_range=float(np.ptp(p)),training_prior_baseline=metrics(yv,np.full(len(yv),prior)),warnings=h['warnings']))
        state['new_inner_fits']+=1;save(out/'status_private.json',state)
  assert state['new_inner_fits']==96;save(out/'inner_results_private.json',rows);save(out/'groups_private.json',groups)
  state.update(state='AUTHOR_DEFAULT_HEAD_DIAGNOSTIC_COMPLETE_REPLAY_PENDING',completed_unix=time.time(),saved_models=96,inner_probabilities=4224,parameter_selection=0,unweighted_fit=True,C=1.,max_iter=1000,tol=1e-4,seed=0,warnings=sum(bool(r['warnings']) for r in rows),maximum_kkt_residual=max(r['maximum_kkt_residual'] for r in rows));save(out/'status_private.json',state);return state
 except BaseException:
  import traceback
  state.update(state='FAILED',error=traceback.format_exc());save(out/'status_private.json',state);raise

"""Training-only relative L1 thresholds on the changed normalization features."""
from pathlib import Path
import argparse,importlib.util,json,os,time,warnings
import joblib,numpy as np
from scipy.special import expit
from sklearn.linear_model import LogisticRegression
from threadpoolctl import threadpool_limits
FRACTIONS=(1.,.3,.1,.03)

def diagnostic(z,y,model,weights,lam):
 a=np.c_[z,np.ones(len(z))];theta=np.r_[model.coef_[0],model.intercept_[0]];scores=a@theta;gradient=a.T@(weights*(expit(scores)-y));res=np.where(theta!=0,abs(gradient+lam*np.sign(theta)),np.maximum(abs(gradient)-lam,0))
 return dict(maximum_weighted_kkt=float(res.max()),weighted_objective=float(weights@(np.logaddexp(0,scores)-y*scores)+lam*abs(theta).sum()),nonzero_coefficients=int(np.count_nonzero(model.coef_)),iterations=int(model.n_iter_.max()))

def main():
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--output-root',type=Path,required=True);args=p.parse_args();O=Path(__file__).resolve().parent;receipt=O/'training_launch_private.json';assert not receipt.exists(),'Observe the existing relative-L1 job; never refit.'
 original=json.loads((O.parent/'20261007-normalization-class-balance/training_launch_private.json').read_text());source=Path(original['run']);designs=Path(original['design_run']);assert json.loads((source/'independent_replay_private.json').read_text())['state']=='ACTUAL_PREDECLARED_CLASS_BALANCE_INDEPENDENTLY_REPLAYED'
 spec=importlib.util.spec_from_file_location('metrics',O.parent/'20261007-author-training-alignment/author_head_diagnostic.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);args.output_root.mkdir(parents=True,exist_ok=True);out=args.output_root/('run-'+str(int(time.time())));out.mkdir();(out/'models').mkdir()
 with receipt.open('x',encoding='utf8') as f:json.dump(dict(pid=os.getpid(),run=str(out),source_run=str(source),design_run=str(designs),expected_fits=96,expected_inner_probabilities=4224,fractions=list(FRACTIONS),tol=1e-10,max_iter=10000,random_state=0,class_weight='balanced',new_query_scores=0,parameter_selection=0,started_unix=time.time(),predeclared_plan=str(O.parent/'20261007-normalization-class-balance/NEXT_TRAINING_HYPOTHESIS_PRIVATE.md')),f,indent=2)
 groups=json.loads((source/'groups_private.json').read_text());m.save(out/'groups_private.json',groups);state=dict(state='RUNNING',new_classifier_fits=0,new_encoder_forwards=0,new_query_scores=0,parameter_selection=0);m.save(out/'status_private.json',state);rows=[]
 try:
  with threadpool_limits(limits=2):
   for path in sorted((source/'models').glob('*/*.joblib')):
    old=joblib.load(path)
    if old['penalty']!='l1':continue
    d=joblib.load(designs/'designs'/old['design']);g=next(g for g in groups if g['task']==path.parent.name);assert d['train_indices']==old['train_indices'] and d['validation_indices']==old['validation_indices'] and not (set(d['train_indices'])|set(d['validation_indices']))&set(g['query']);x=d['x'];xv=d['xv'];y=np.asarray(d['y']);yv=d['yv'];assert x.shape==xv.shape==(44,288) and np.array_equal(np.bincount(y),[7,37]);weights=44/(2*np.bincount(y)[y]);scaler=old['scaler'];z=x if scaler is None else scaler.transform(x);zv=xv if scaler is None else scaler.transform(xv);a=np.c_[z,np.ones(len(z))];maximum=float(abs(a.T@(weights*(.5-y))).max());assert maximum>0 and np.isfinite(maximum)
    params=old['model'].get_params();assert params['class_weight']=='balanced' and params['C']==1 and params['tol']==1e-10 and params['max_iter']==10000 and params['intercept_scaling']==1 and params['l1_ratio']==1
    for fraction in FRACTIONS:
     lam=fraction*maximum;params['C']=1/lam
     with warnings.catch_warnings(record=True) as caught:
      warnings.simplefilter('always');model=LogisticRegression(**params).fit(z,y)
     probability=model.predict_proba(zv)[:,1];metrics=m.metrics(yv,probability);diag=diagnostic(z,y,model,weights,lam);reference=diagnostic(z,y,old['model'],weights,lam);h=dict(old);h.update(model=model,probability=probability,metrics=metrics,diagnostic=diag,warnings=[str(w.message) for w in caught],phase='predeclared_relative_L1_new_normalization',original_metrics=old['metrics'],original_diagnostic=old['diagnostic'],same_lambda_original_diagnostic=reference,original_model_file=path.name,lambda_max=maximum,lambda_=lam,fraction=fraction)
     folder=out/'models'/path.parent.name;folder.mkdir(exist_ok=True);filename=path.stem+'_fraction'+str(fraction)+'.joblib';joblib.dump(h,folder/filename,compress=3);rows.append(dict(task=path.parent.name,model_file=filename,method=h['method'],scale=h['scale'],fraction=fraction,lambda_max=maximum,lambda_=lam,metrics=metrics,original_metrics=old['metrics'],diagnostic=diag,same_lambda_original_diagnostic=reference,same_lambda_objective_difference=diag['weighted_objective']-reference['weighted_objective'],warnings=h['warnings']));state['new_classifier_fits']+=1;m.save(out/'status_private.json',state)
  assert state['new_classifier_fits']==96;m.save(out/'inner_results_private.json',rows);state.update(state='PREDECLARED_RELATIVE_L1_COMPLETE_REPLAY_PENDING',completed_unix=time.time(),saved_models=96,inner_probabilities=4224,maximum_weighted_kkt=max(r['diagnostic']['maximum_weighted_kkt'] for r in rows),warnings=sum(bool(r['warnings']) for r in rows));m.save(out/'status_private.json',state);print(json.dumps(state))
 except BaseException:
  import traceback
  state.update(state='FAILED',error=traceback.format_exc());m.save(out/'status_private.json',state);raise
if __name__=='__main__':main()

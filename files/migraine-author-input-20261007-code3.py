"""Separate process: replay actual saved heads and train-only feature scaling."""
from pathlib import Path
import json,joblib,numpy as np
from scipy.special import expit
from sklearn.metrics import roc_auc_score,average_precision_score,brier_score_loss,balanced_accuracy_score
O=Path(__file__).resolve().parent;r=json.loads((O/'training_launch_private.json').read_text());run=Path(r['run']);source=run;groups=json.loads((source/'groups_private.json').read_text());recorded=json.loads((run/'inner_results_private.json').read_text());rows=[];pmax=lmax=smax=0.;count=0
for path in sorted((run/'models').glob('*/*.joblib')):
 h=joblib.load(path);d=joblib.load(source/'designs'/h['design']);g=next(g for g in groups if g['task']==path.parent.name)
 assert h['train_indices']==d['train_indices'] and h['validation_indices']==d['validation_indices'] and not (set(h['train_indices'])|set(h['validation_indices']))&set(g['query'])
 method=h['method'];width={'fc':4005,'pretrained':288,'random':288,'covariates':4}[method];x=np.asarray(d['x'],float)[:,:width];xv=np.asarray(d['xv'],float)[:,:width];y=np.asarray(d['y']);yv=np.asarray(d['yv']);scaler=h['scaler']
 if h['scale']=='standardized':
  mean=x.sum(0)/len(x);var=((x-mean)**2).sum(0)/len(x);eps=np.finfo(float).eps;constant=var<=len(x)*eps*var+(len(x)*mean*eps)**2;scale=np.sqrt(var);scale[constant]=1.
  smax=max(smax,float(abs(mean-scaler.mean_).max()),float(abs(scale-scaler.scale_).max()));z=(x-mean)/scale;zv=(xv-mean)/scale
 else:assert scaler is None;z=x;zv=xv
 model=h['model'];params=model.get_params();assert params['C']==1 and params['max_iter']==1000 and params['tol']==1e-4 and params['random_state']==0 and params['solver']=='liblinear' and params['class_weight'] is None and params['l1_ratio']==(1 if h['penalty']=='l1' else 0)
 theta=np.r_[model.coef_[0],model.intercept_[0]];a=np.column_stack([z,np.ones(len(z))]);av=np.column_stack([zv,np.ones(len(zv))]);p=expit(av@theta);pmax=max(pmax,float(abs(p-h['probability']).max()));count+=len(p)
 clipped=np.clip(p,np.finfo(float).eps,1-np.finfo(float).eps);terms=-(yv*np.log(clipped)+(1-yv)*np.log1p(-clipped));balanced=np.array([.5/np.count_nonzero(yv==v) for v in yv]);ll=float(terms.mean());bll=float(balanced@terms);lmax=max(lmax,abs(ll-h['metrics']['log_loss']),abs(bll-h['metrics']['balanced_log_loss']))
 grad=a.T@(expit(a@theta)-y)
 if h['penalty']=='l1':res=np.where(theta!=0,abs(grad+np.sign(theta)),np.maximum(abs(grad)-1,0))
 else:res=abs(grad+theta)
 metrics=dict(auc=float(roc_auc_score(yv,p)),average_precision=float(average_precision_score(yv,p)),log_loss=ll,balanced_log_loss=bll,brier=float(brier_score_loss(yv,p)),balanced_accuracy=float(balanced_accuracy_score(yv,p>=.5)))
 assert max(abs(metrics[k]-h['metrics'][k]) for k in metrics)<1e-12
 old=joblib.load(Path(r['baseline_run'])/'models'/path.parent.name/path.name);assert old['train_indices']==h['train_indices'] and old['validation_indices']==h['validation_indices'];assert old['metrics']==h['baseline_metrics'];baseline=old['metrics'];baseline_auc=float(roc_auc_score(yv,old['probability']));assert abs(baseline_auc-baseline['auc'])<1e-12
 rows.append(dict(baseline_metrics=baseline,auc_difference=metrics['auc']-baseline['auc'],method=method,scale=h['scale'],penalty=h['penalty'],feature_count=width,metrics=metrics,nonzero_coefficients=int(np.count_nonzero(theta[:-1])),constant_head=bool(np.count_nonzero(theta[:-1])==0),maximum_kkt_residual=float(res.max()),iterations=int(model.n_iter_.max()),warnings=h['warnings']))
assert len(rows)==48 and count==2112 and pmax<1e-12 and lmax<1e-12 and smax<1e-10
summary=[]
for method in ['pretrained','random']:
 for scale in ['raw','standardized']:
  for penalty in ['l1','l2']:
   v=[x for x in rows if (x['method'],x['scale'],x['penalty'])==(method,scale,penalty)];assert len(v)==6
   summary.append(dict(method=method,scale=scale,penalty=penalty,groups=6,feature_count=v[0]['feature_count'],mean_whole_run_inner_metrics={k:float(np.mean([x['baseline_metrics'][k] for x in v])) for k in v[0]['baseline_metrics']},paired_inner_auc_difference_mean=float(np.mean([x['auc_difference'] for x in v])),paired_inner_auc_difference_range=[float(min(x['auc_difference'] for x in v)),float(max(x['auc_difference'] for x in v))],mean_inner_metrics={k:float(np.mean([x['metrics'][k] for x in v])) for k in v[0]['metrics']},constant_heads=sum(x['constant_head'] for x in v),mean_nonzero_coefficients=float(np.mean([x['nonzero_coefficients'] for x in v])),maximum_kkt_residual=max(x['maximum_kkt_residual'] for x in v),maximum_iterations=max(x['iterations'] for x in v),warnings=sum(bool(x['warnings']) for x in v)))
v=dict(state='ACTUAL_NEAREST_CENTER_HEADS_INDEPENDENTLY_REPLAYED',models=48,inner_probabilities=count,maximum_probability_difference=pmax,maximum_loss_difference=lmax,maximum_scaler_difference=smax,new_refits=0,new_outer_query_scores=0,parameter_selection=0,six_partitions_same_as_previous_larger_budget=True,conditional_development_diagnostic_not_independent_validation=True,no_new_encoder_forwards=True,selected_existing_window_start=360,exact_author_center_start=365,temporal_offset_seconds=-4.,no_window_selection_by_results=True,baseline_training_prior=37/44,baseline_auc=.5,baseline_average_precision=37/44,methods=summary)
(run/'independent_replay_private.json').write_text(json.dumps(v,indent=2),encoding='utf8');print(json.dumps(v),flush=True)

"""Independent saved-head numerical replay, retaining every matched configuration."""
from pathlib import Path
import json,joblib,numpy as np
from scipy.special import expit
from sklearn.metrics import roc_auc_score,average_precision_score,brier_score_loss,balanced_accuracy_score
O=Path(__file__).resolve().parent;r=json.loads((O/'training_launch_private.json').read_text());out=Path(r['run']);source=Path(r['source_run']);receipt=out/'independent_replay_private.json';assert not receipt.exists(),'Reuse the saved independent precision replay.'
assert json.loads((out/'status_private.json').read_text())['state']=='FIXED_OBJECTIVE_PRECISION_COMPLETE_REPLAY_PENDING'
groups=json.loads((source/'groups_private.json').read_text());rows=[];pmax=lmax=smax=0.;count=0
for path in sorted((out/'models').glob('*/*.joblib')):
 h=joblib.load(path);old=joblib.load(source/'models'/path.parent.name/path.name);d=joblib.load(source/'designs'/h['design']);g=next(g for g in groups if g['task']==path.parent.name);assert d['train_indices']==h['train_indices']==old['train_indices'] and d['validation_indices']==h['validation_indices']==old['validation_indices'] and not (set(d['train_indices'])|set(d['validation_indices']))&set(g['query'])
 x=np.asarray(d['x'],float);xv=np.asarray(d['xv'],float);y=np.asarray(d['y']);yv=np.asarray(d['yv']);assert x.shape==xv.shape==(44,288);scaler=h['scaler']
 if scaler is None:assert h['scale']=='raw';z=x;zv=xv
 else:
  mean=x.sum(0)/len(x);var=((x-mean)**2).sum(0)/len(x);eps=np.finfo(float).eps;constant=var<=len(x)*eps*var+(len(x)*mean*eps)**2;scale=np.sqrt(var);scale[constant]=1.;smax=max(smax,float(abs(mean-scaler.mean_).max()),float(abs(scale-scaler.scale_).max()));z=(x-mean)/scale;zv=(xv-mean)/scale
 pnew=h['model'].get_params();pold=old['model'].get_params();assert {k:v for k,v in pnew.items() if k not in ['tol','max_iter']}=={k:v for k,v in pold.items() if k not in ['tol','max_iter']};assert pnew['tol']==1e-10 and pnew['max_iter']==10000 and pnew['C']==1 and pnew['class_weight'] is None
 a=np.c_[z,np.ones(len(z))];av=np.c_[zv,np.ones(len(zv))]
 def objective(model):
  theta=np.r_[model.coef_[0],model.intercept_[0]];scores=a@theta;gradient=a.T@(expit(scores)-y)
  if h['penalty']=='l1':penalty=abs(theta).sum();res=np.where(theta!=0,abs(gradient+np.sign(theta)),np.maximum(abs(gradient)-1,0))
  else:penalty=theta@theta/2;res=abs(gradient+theta)
  return float((np.logaddexp(0,scores)-y*scores).sum()+penalty),float(res.max()),expit(av@theta)
 new_objective,kkt,p=objective(h['model']);old_objective,old_kkt,oldp=objective(old['model']);pmax=max(pmax,float(abs(p-h['probability']).max()),float(abs(oldp-old['probability']).max()));count+=len(p)
 clipped=np.clip(p,np.finfo(float).eps,1-np.finfo(float).eps);terms=-(yv*np.log(clipped)+(1-yv)*np.log1p(-clipped));balanced=np.array([.5/np.count_nonzero(yv==v) for v in yv]);ll=float(terms.mean());bll=float(balanced@terms);lmax=max(lmax,abs(ll-h['metrics']['log_loss']),abs(bll-h['metrics']['balanced_log_loss']))
 metrics=dict(auc=float(roc_auc_score(yv,p)),average_precision=float(average_precision_score(yv,p)),log_loss=ll,balanced_log_loss=bll,brier=float(brier_score_loss(yv,p)),balanced_accuracy=float(balanced_accuracy_score(yv,p>=.5)));assert max(abs(metrics[k]-h['metrics'][k]) for k in metrics)<1e-12;assert abs(new_objective-h['diagnostic']['summed_objective'])<1e-10 and abs(old_objective-h['original_diagnostic']['summed_objective'])<1e-10 and h['original_metrics']==old['metrics']
 rows.append(dict(method=h['method'],scale=h['scale'],penalty=h['penalty'],metrics=metrics,original_metrics=old['metrics'],auc_difference=metrics['auc']-old['metrics']['auc'],objective_difference=new_objective-old_objective,old_kkt=old_kkt,new_kkt=kkt,probability_change=float(abs(p-oldp).max()),warnings=h['warnings'],iterations=int(h['model'].n_iter_.max()),nonzero_coefficients=int(np.count_nonzero(h['model'].coef_))))
assert len(rows)==48 and count==2112 and pmax<1e-12 and lmax<1e-12 and smax<1e-10
summary=[]
for method in ['pretrained','random']:
 for scale in ['raw','standardized']:
  for penalty in ['l1','l2']:
   items=[x for x in rows if (x['method'],x['scale'],x['penalty'])==(method,scale,penalty)];assert len(items)==6
   summary.append(dict(method=method,scale=scale,penalty=penalty,groups=6,mean_original_metrics={k:float(np.mean([x['original_metrics'][k] for x in items])) for k in items[0]['metrics']},mean_refined_metrics={k:float(np.mean([x['metrics'][k] for x in items])) for k in items[0]['metrics']},paired_auc_difference_mean=float(np.mean([x['auc_difference'] for x in items])),paired_auc_difference_range=[min(x['auc_difference'] for x in items),max(x['auc_difference'] for x in items)],maximum_old_kkt=max(x['old_kkt'] for x in items),maximum_refined_kkt=max(x['new_kkt'] for x in items),objective_difference_range=[min(x['objective_difference'] for x in items),max(x['objective_difference'] for x in items)],maximum_validation_probability_change=max(x['probability_change'] for x in items),maximum_iterations=max(x['iterations'] for x in items),warnings=sum(bool(x['warnings']) for x in items)))
v=dict(state='ACTUAL_FIXED_OBJECTIVE_PRECISION_INDEPENDENTLY_REPLAYED',models=48,inner_probabilities=count,maximum_probability_difference=pmax,maximum_loss_difference=lmax,maximum_scaler_difference=smax,maximum_old_kkt=max(x['old_kkt'] for x in rows),maximum_refined_kkt=max(x['new_kkt'] for x in rows),objective_difference_range=[min(x['objective_difference'] for x in rows),max(x['objective_difference'] for x in rows)],new_refits_during_replay=0,new_encoder_forwards=0,new_query_scores=0,parameter_selection=0,baseline_prior=37/44,unchanged_mathematical_objective=True,solver_tolerance_is_not_absolute_kkt_threshold=True,conditional_development_diagnostic=True,methods=summary);receipt.write_text(json.dumps(v,indent=2));print(json.dumps(v))

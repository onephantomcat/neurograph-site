"""Bounded participant-isolated VAS experiment on published Power264 features.

No author models, pickle demographics, whole-sample transformations, or task rows.
Run with the existing research .venv; input preparation uses the bundled runtime.
"""
import os
for key in ['OMP_NUM_THREADS','MKL_NUM_THREADS','OPENBLAS_NUM_THREADS','NUMEXPR_NUM_THREADS']:
    os.environ[key]='1'
from pathlib import Path
import json, time, platform
import numpy as np
import pandas as pd
import scipy, sklearn
from scipy.stats import spearmanr
from sklearn.model_selection import KFold
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model import Ridge
from threadpoolctl import threadpool_limits

ROOT=Path(__file__).resolve().parent
OUT=ROOT.parent.parent/'output/emo-public-derivative-20260922'
ALPHAS=[.01,.1,1.,10.,100.]
METHODS={'clinical':['clinical'],'global_fc':['global_fc'],'whole_fc':['fc'],
         'clinical_plus_fc':['clinical','fc']}
SEED=20260922

def write_json(name,value):
    (OUT/name).write_text(json.dumps(value,ensure_ascii=False,indent=2,allow_nan=False)+'\n',encoding='utf-8')

def transform_blocks(data,names,train,test):
    """Each block has its own training-only scaler and sqrt(p) normalization."""
    a=[];b=[];state={}
    for name in names:
        x=data[name]
        mean=x[train].mean(axis=0);sd=x[train].std(axis=0)
        sd=np.where(sd<1e-12,1.,sd)
        denom=sd*np.sqrt(x.shape[1]*len(names))
        a.append((x[train]-mean)/denom);b.append((x[test]-mean)/denom)
        state[name+'_mean']=mean;state[name+'_denom']=denom
    return np.concatenate(a,axis=1),np.concatenate(b,axis=1),state

def predict_kernel(a,b,y,alpha):
    mean=float(y.mean())
    dual=np.linalg.solve(a@a.T+alpha*np.eye(len(a)),y-mean)
    return b@a.T@dual+mean,dual,mean

def main():
    started=time.strftime('%Y-%m-%dT%H:%M:%S%z')
    z=np.load(OUT/'inputs_private.npz',allow_pickle=False)
    ids=z['ids'];y=z['y'];n=len(y)
    data={'clinical':z['clinical'],'global_fc':z['global_fc'],'fc':z['X']}
    assert n==33 and len(set(ids))==n
    audit=json.loads((OUT/'input_audit.json').read_text(encoding='utf-8'))
    design={'started_local':started,'source_revision':audit['revision'],'participants':n,
      'target':'Emo-Fibro patient interview VAS 0-100; not simultaneous scan pain',
      'methods':{'train_mean':[],'train_median':[],**METHODS},'alphas':ALPHAS,
      'outer_folds':5,'repeats':5,'inner_folds':3,'seed':SEED,
      'clinical_features':audit['clinical_features'],
      'preprocessing':'training-only z-score, divide each block by sqrt(p); equal block weight in combined model',
      'selection':'minimum participant-weighted inner OOF MAE; no clipping; all methods identical outer splits',
      'inference':'paired subject bootstrap of mean repeated-OOF absolute errors, 2000 draws; conditional on these fits',
      'limitations':['n=33, single cohort, no external validation','third-party derivatives, own image QC not reproduced',
                     'interview VAS not scan-time VAS','exploratory prediction, not clinical grading or drug recommendation'],
      'libraries':{'python':platform.python_version(),'numpy':np.__version__,'scipy':scipy.__version__,'sklearn':sklearn.__version__},
      'state':'RUNNING'}
    write_json('design.json',design)
    records=[];fit_records=[];scores=[];model_dir=OUT/'models_private';model_dir.mkdir(exist_ok=True)
    max_sklearn_difference=0.;max_replay_difference=0.;final_fits=0;inner_fits=0
    for rep in range(5):
      for fold,(train,test) in enumerate(KFold(5,shuffle=True,random_state=SEED+rep).split(ids)):
        assert not set(ids[train])&set(ids[test])
        inner=list(KFold(3,shuffle=True,random_state=SEED+100*(rep+1)+fold).split(train))
        for method,constant in [('train_mean',np.mean(y[train])),('train_median',np.median(y[train]))]:
          for i in test:records.append({'id':ids[i],'repeat':rep,'fold':fold,'method':method,'y':float(y[i]),'prediction':float(constant)})
        for method,names in METHODS.items():
          errors={alpha:[] for alpha in ALPHAS}
          for inner_fold,(itr,iva) in enumerate(inner):
            tr=train[itr];va=train[iva]
            assert not set(ids[tr])&set(ids[va]) and not set(ids[test])&set(ids[np.r_[tr,va]])
            a,b,_=transform_blocks(data,names,tr,va)
            for alpha in ALPHAS:
              pred,_,_=predict_kernel(a,b,y[tr],alpha);inner_fits+=1
              errors[alpha].extend(np.abs(pred-y[va]).tolist())
              scores.append({'repeat':rep,'fold':fold,'method':method,'inner_fold':inner_fold,'alpha':alpha,
                             'mae':float(np.mean(np.abs(pred-y[va]))),'n_validation':len(va),
                             'train_indices':tr.tolist(),'validation_indices':va.tolist()})
          selected=min(ALPHAS,key=lambda alpha:np.mean(errors[alpha]))
          a,b,state=transform_blocks(data,names,train,test)
          pred,dual,mean=predict_kernel(a,b,y[train],selected);final_fits+=1
          # Independent implementation of the same explicit feature-space model.
          ref=Ridge(alpha=selected,fit_intercept=True,solver='cholesky').fit(a,y[train]).predict(b)
          delta=float(np.max(np.abs(ref-pred)));max_sklearn_difference=max(max_sklearn_difference,delta)
          assert delta<1e-7
          filename=f'{method}_r{rep}_f{fold}.npz'
          np.savez_compressed(model_dir/filename,train_indices=train,test_indices=test,alpha=selected,dual=dual,y_mean=mean,**state)
          stored=np.load(model_dir/filename,allow_pickle=False)
          a2=np.concatenate([(data[name][train]-stored[name+'_mean'])/stored[name+'_denom'] for name in names],axis=1)
          b2=np.concatenate([(data[name][test]-stored[name+'_mean'])/stored[name+'_denom'] for name in names],axis=1)
          replay=b2@a2.T@stored['dual']+float(stored['y_mean'])
          d=float(np.max(np.abs(pred-replay)));max_replay_difference=max(max_replay_difference,d);assert d<1e-9
          fit_records.append({'repeat':rep,'fold':fold,'method':method,'alpha':selected,
              'train_indices':train.tolist(),'test_indices':test.tolist(),
              'inner_mean_mae':{str(alpha):float(np.mean(errors[alpha])) for alpha in ALPHAS},'model':filename})
          for i,estimate in zip(test,pred):records.append({'id':ids[i],'repeat':rep,'fold':fold,'method':method,'y':float(y[i]),'prediction':float(estimate)})
      print(f'Completed repeat {rep+1}/5: {final_fits} final models, {inner_fits} inner fits',flush=True)
    pred_frame=pd.DataFrame(records)
    metrics=[]
    for (method,rep),part in pred_frame.groupby(['method','repeat']):
      assert len(part)==n and part.id.nunique()==n
      rho=float(spearmanr(part.y,part.prediction).statistic)
      metrics.append({'method':method,'repeat':int(rep),'mae':mean_absolute_error(part.y,part.prediction),
                      'rmse':float(np.sqrt(mean_squared_error(part.y,part.prediction))),
                      'r2':r2_score(part.y,part.prediction),'spearman':rho if np.isfinite(rho) else None})
    metric_frame=pd.DataFrame(metrics)
    aggregate=metric_frame.groupby('method')[['mae','rmse','r2','spearman']].mean().reset_index()
    paired=[]
    pred_frame['absolute_error']=(pred_frame.prediction-pred_frame.y).abs()
    errors=pred_frame.groupby(['id','method']).absolute_error.mean().unstack()
    rng=np.random.default_rng(SEED);samples=rng.integers(0,n,size=(2000,n))
    for a,b in [('global_fc','train_mean'),('whole_fc','train_mean'),('clinical_plus_fc','clinical'),('whole_fc','global_fc')]:
      diff=(errors[a]-errors[b]).to_numpy();boot=diff[samples].mean(axis=1)
      lo,hi=np.quantile(boot,[.025,.975])
      paired.append({'method':a,'comparator':b,'delta_mae':float(diff.mean()),'ci95_low':float(lo),'ci95_high':float(hi),
                     'independent_patients':n,'bootstrap_draws':2000,'scope':'conditional on fixed repeated OOF predictions, not external validation'})
    pred_frame.to_csv(OUT/'oof_predictions_private.csv',index=False)
    metric_frame.to_csv(OUT/'metrics_by_repeat.csv',index=False)
    aggregate.to_csv(OUT/'metrics_aggregate.csv',index=False)
    pd.DataFrame(paired).to_csv(OUT/'paired_comparisons.csv',index=False)
    write_json('fit_records_private.json',fit_records);write_json('inner_selection_private.json',scores)
    verification={'state':'PASS','final_models':final_fits,'inner_fits':inner_fits,'constant_predictions':50,
       'participants':n,'outer_test_occurrences_per_participant_per_method':5,
       'all_inner_and_outer_participant_sets_disjoint':True,'training_only_scalers':True,
       'independent_sklearn_final_models_checked':final_fits,'max_sklearn_prediction_difference':max_sklearn_difference,
       'saved_model_replays':final_fits,'max_replay_difference':max_replay_difference,
       'image_qc_or_visual_approval_claimed':False}
    write_json('verification.json',verification)
    design['state']='COMPLETE_VERIFIED';design['completed_local']=time.strftime('%Y-%m-%dT%H:%M:%S%z')
    write_json('design.json',design)
    write_json('summary.json',{'design':design,'metrics':aggregate.to_dict(orient='records'),'paired':paired,'verification':verification})
    print(aggregate.to_string(index=False));print(json.dumps(paired,indent=2))

if __name__=='__main__':
    with threadpool_limits(limits=1):main()

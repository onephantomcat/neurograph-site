"""Change solver stopping precision only, retaining all 48 mathematical objectives."""
from pathlib import Path
import argparse,importlib.util,json,os,time,warnings
import joblib,numpy as np
from sklearn.linear_model import LogisticRegression
from threadpoolctl import threadpool_limits

def main():
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--output-root',type=Path,required=True);args=parser.parse_args()
 O=Path(__file__).resolve().parent;receipt=O/'training_launch_private.json';assert not receipt.exists(),'Observe the existing precision run; never fit it twice.'
 original=json.loads((O.parent/'20261007-window-normalization/training_launch_private.json').read_text());source=Path(original['run']);verified=json.loads((source/'independent_replay_private.json').read_text());assert verified['state']=='ACTUAL_NEW_NORMALIZATION_HEADS_INDEPENDENTLY_REPLAYED'
 spec=importlib.util.spec_from_file_location('head_metrics',O.parent/'20261007-author-training-alignment/author_head_diagnostic.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 args.output_root.mkdir(parents=True,exist_ok=True);out=args.output_root/('run-'+str(int(time.time())));out.mkdir();(out/'models').mkdir()
 with receipt.open('x',encoding='utf8') as f:json.dump(dict(pid=os.getpid(),run=str(out),source_run=str(source),expected_fits=48,expected_inner_probabilities=2112,C=1.,tol=1e-10,max_iter=10000,random_state=0,solver='liblinear',query_scores=0,parameter_selection=0,started_unix=time.time(),reason='Measured original maximum KKT0.037629: compare numerical stopping precision with the mathematical objective fixed, all configurations retained.'),f,indent=2)
 groups=json.loads((source/'groups_private.json').read_text());m.save(out/'groups_private.json',groups);state=dict(state='RUNNING',new_classifier_fits=0,new_encoder_forwards=0,new_query_scores=0,parameter_selection=0);m.save(out/'status_private.json',state);rows=[]
 try:
  with threadpool_limits(limits=2):
   for path in sorted((source/'models').glob('*/*.joblib')):
    old=joblib.load(path);d=joblib.load(source/'designs'/old['design']);g=next(g for g in groups if g['task']==path.parent.name)
    assert d['train_indices']==old['train_indices'] and d['validation_indices']==old['validation_indices'] and not (set(d['train_indices'])|set(d['validation_indices']))&set(g['query'])
    x=d['x'];xv=d['xv'];y=d['y'];yv=d['yv'];assert x.shape==xv.shape==(44,288)
    scaler=old['scaler'];z=x if scaler is None else scaler.transform(x);zv=xv if scaler is None else scaler.transform(xv)
    params=old['model'].get_params();assert params['C']==1 and params['tol']==1e-4 and params['max_iter']==1000 and params['class_weight'] is None and params['intercept_scaling']==1 and params['fit_intercept'] and not params['dual']
    params.update(tol=1e-10,max_iter=10000)
    with warnings.catch_warnings(record=True) as caught:
     warnings.simplefilter('always');model=LogisticRegression(**params).fit(z,y)
    probability=model.predict_proba(zv)[:,1];metrics=m.metrics(yv,probability);diag=m.diagnostic(z,y,model,old['penalty']=='l1');h=dict(old);h.update(model=model,probability=probability,metrics=metrics,diagnostic=diag,warnings=[str(w.message) for w in caught],phase='fixed_objective_solver_precision_only',original_metrics=old['metrics'],original_diagnostic=old['diagnostic'],original_model_file=path.name)
    folder=out/'models'/path.parent.name;folder.mkdir(exist_ok=True);joblib.dump(h,folder/path.name,compress=3)
    rows.append(dict(task=path.parent.name,model_file=path.name,method=h['method'],scale=h['scale'],penalty=h['penalty'],metrics=metrics,original_metrics=old['metrics'],diagnostic=diag,original_diagnostic=old['diagnostic'],objective_difference=diag['summed_objective']-old['diagnostic']['summed_objective'],validation_probability_maximum_change=float(abs(probability-old['probability']).max()),warnings=h['warnings']))
    state['new_classifier_fits']+=1;m.save(out/'status_private.json',state)
  assert state['new_classifier_fits']==48;m.save(out/'inner_results_private.json',rows);state.update(state='FIXED_OBJECTIVE_PRECISION_COMPLETE_REPLAY_PENDING',completed_unix=time.time(),saved_models=48,inner_probabilities=2112,maximum_kkt_residual=max(r['diagnostic']['maximum_kkt_residual'] for r in rows),warnings=sum(bool(r['warnings']) for r in rows));m.save(out/'status_private.json',state);print(json.dumps(state))
 except BaseException:
  import traceback
  state.update(state='FAILED',error=traceback.format_exc());m.save(out/'status_private.json',state);raise
if __name__=='__main__':main()

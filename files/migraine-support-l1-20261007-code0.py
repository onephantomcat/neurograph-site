"""L1 diagnostic on existing support-set inner splits; no outer-query evaluation."""
from pathlib import Path
import json,time,warnings
import joblib,numpy as np
from scipy.special import expit
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss
from threadpoolctl import threadpool_limits
METHODS=('fc','pretrained','random','covariates')
LAMBDAS=(10.,1.,.1,.01)

class SupportView:
    def __init__(self,data,support,outer_query):
        self.allowed=set(map(int,support));self.forbidden=set(map(int,outer_query))
        assert not self.allowed & self.forbidden
        self.data=data;self.accessed=set()
    def rows(self,key,indices):
        indices=list(map(int,indices));assert set(indices)<=self.allowed
        self.accessed.update(indices)
        if key in ('time_series','subject_ids'):return [self.data[key][i] for i in indices]
        return np.asarray(self.data[key])[indices]

def kkt_diagnostic(x,y,weights,model,lam):
    z=np.c_[x,np.ones(len(x))];theta=np.r_[model.coef_[0],model.intercept_[0]]
    p=expit(z@theta);gradient=z.T@(weights*(p-y))
    active=theta!=0
    residual=np.where(active,abs(gradient+lam*np.sign(theta)),np.maximum(abs(gradient)-lam,0))
    objective=float(np.sum(weights*(np.logaddexp(0,z@theta)-y*(z@theta)))+lam*np.abs(theta).sum())
    return dict(maximum_kkt_residual=float(residual.max()),objective=objective,nonzero_coefficients=int(np.count_nonzero(model.coef_)),nonzero_intercept=bool(model.intercept_[0]!=0))

def fit_head(x,xv,y,yv,weights,scaler,lam):
    assert len(y)==5 and set(y)=={0,1} and set(yv)=={0,1}
    assert np.isfinite(x).all() and np.isfinite(xv).all()
    assert np.isclose(weights.sum(),1) and all(np.isclose(weights[y==c].sum(),.5) for c in (0,1))
    z=scaler.transform(x);zv=scaler.transform(xv)
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter('always')
        model=LogisticRegression(l1_ratio=1.,solver='liblinear',C=1/lam,max_iter=5000,tol=1e-4,random_state=0).fit(z,y,sample_weight=weights)
    assert not caught and model.n_iter_.max()<5000,[str(w.message) for w in caught]
    p=model.predict_proba(zv)[:,1]
    wv=np.array([.5/np.sum(yv==c) for c in yv])
    return dict(model=model,scaler=scaler,weights=weights,lambda_=lam,probability=p,validation_balanced_log_loss=float(log_loss(yv,p,labels=[0,1],sample_weight=wv)),diagnostic=kkt_diagnostic(z,y,weights,model,lam))

def save(path,value):
    tmp=path.with_suffix('.tmp');tmp.write_text(json.dumps(value,indent=2,allow_nan=False),encoding='utf8');tmp.replace(path)

def run(data,parent,out):
    parent=Path(parent);out=Path(out);assert not out.exists()
    out.mkdir();(out/'models').mkdir();(out/'designs').mkdir()
    tasks=json.loads((parent/'tasks_private.json').read_text());assert len(tasks)==15
    state=dict(state='RUNNING',started_unix=time.time(),new_l1_inner_fits=0,new_final_fits=0,new_reference_fits=0,outer_query_predictions=0,outer_query_scores=0,source_package_people=len(data['subject_ids']))
    save(out/'status_private.json',state)
    try:
        result=[];selected=[];all_people=set()
        with threadpool_limits(limits=2):
            for task in tasks:
                support=task['support'];query=task['query'];assert len(support)==10
                view=SupportView(data,support,query);folder=out/'models'/task['task'];folder.mkdir()
                for inner,part in enumerate(task['inner_splits']):
                    train=part['train'];validation=part['validation']
                    assert set(train).isdisjoint(validation) and set(train)|set(validation)==set(support)
                    for method in METHODS:
                        old=joblib.load(parent/'models'/task['task']/f'inner{inner}_{method}_lambda10.0.joblib')
                        assert old['phase']=='inner' and list(old['train_indices'])==train and list(old['query_indices'])==validation
                        assert old['train_ids']==view.rows('subject_ids',train) and old['query_ids']==view.rows('subject_ids',validation)
                        ca=view.rows('covariates',train);cv=view.rows('covariates',validation)
                        if method=='fc':
                            assert list(old['reference_people'])==train
                            x=np.c_[old['reference'].transform(view.rows('time_series',train)),ca]
                            xv=np.c_[old['reference'].transform(view.rows('time_series',validation)),cv]
                        elif method=='covariates':x,xv=ca,cv
                        else:x=np.c_[view.rows(method,train),ca];xv=np.c_[view.rows(method,validation),cv]
                        y=view.rows('labels',train);yv=view.rows('labels',validation)
                        design=dict(x=x,xv=xv,y=y,yv=yv,train_indices=train,validation_indices=validation,scaler=old['scaler'],weights=old['weights'],support=support,outer_query=query)
                        design_path=out/'designs'/f'{task["task"]}_inner{inner}_{method}.joblib';joblib.dump(design,design_path,compress=3)
                        for lam in LAMBDAS:
                            head=fit_head(x,xv,y,yv,old['weights'],old['scaler'],lam)
                            head.update(method=method,fold=task['fold'],draw=task['draw'],inner=inner,train_indices=train,validation_indices=validation,phase='support_inner_only',design=design_path.name)
                            joblib.dump(head,folder/f'inner{inner}_{method}_lambda{lam}.joblib',compress=3)
                            result.append(dict(task=task['task'],method=method,inner=inner,lambda_=lam,validation_balanced_log_loss=head['validation_balanced_log_loss'],**head['diagnostic']))
                            state['new_l1_inner_fits']+=1;save(out/'status_private.json',state)
                assert not view.accessed & set(query) and view.accessed==set(support);all_people.update(support)
                for method in METHODS:
                    means=[float(np.mean([r['validation_balanced_log_loss'] for r in result if r['task']==task['task'] and r['method']==method and r['lambda_']==lam])) for lam in LAMBDAS]
                    winner=int(np.argmin(np.round(means,12)))
                    baseline=next(r for r in task['selection'] if r['method']==method)
                    selected.append(dict(task=task['task'],method=method,lambda_grid=list(LAMBDAS),mean_inner_balanced_log_loss=means,chosen_lambda=LAMBDAS[winner],selected_inner_loss=means[winner],old_l2_selected_inner_loss=min(baseline['mean_inner_balanced_log_loss'])))
                save(out/'selection_private.json',selected);save(out/'inner_results_private.json',result)
        assert state['new_l1_inner_fits']==480 and len(result)==480 and len(selected)==60
        state.update(state='SUPPORT_L1_TRAINING_COMPLETE_REPLAY_PENDING',completed_unix=time.time(),distinct_support_people=len(all_people),support_tasks=15,inner_partitions=30,designs=120,saved_models=480,inner_validation_probabilities=2400,outer_query_rows_used_in_model_computations=0,input_package_loaded_people=132)
        save(out/'status_private.json',state);return state
    except BaseException:
        import traceback
        state.update(state='FAILED',error=traceback.format_exc());save(out/'status_private.json',state);raise

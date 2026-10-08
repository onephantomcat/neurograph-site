"""Within-person signed Pearson/Fisher AAL90 edges, then four covariates.

Input [people,time,90]; ROI order unchanged; output [people,4009] or [people,4].
No group reference, feature selection, scaling, query computation or MRI read.
"""
import numpy as np

def features(data, indices, kind):
    cov=np.asarray(data['covariates'],dtype=float)[indices]
    if kind=='covariates':return cov.copy()
    if kind!='fc_covariates':raise ValueError(kind)
    upper=np.triu_indices(90,1);edges=[]
    for i in indices:
        t=np.asarray(data['time_series'][i],dtype=float)
        if t.shape!=(300,90) or not np.isfinite(t).all() or np.any(t.std(0)==0):
            raise ValueError('Require finite original 300x90 nonconstant ROI series.')
        edges.append(np.arctanh(np.clip(np.corrcoef(t.T)[upper],-1+1e-7,1-1e-7)))
    x=np.c_[np.stack(edges),cov]
    if x.shape!=(len(indices),4009) or not np.isfinite(x).all():raise ValueError('Bad feature matrix.')
    return x

def check_partition(data, train, validation, query):
    a,b,c=map(set,(train,validation,query))
    if len(a)!=len(train) or len(b)!=len(validation) or a&b or (a|b)&c:
        raise ValueError('People must be unique and disjoint from the original query.')
    if len(set(data['subject_ids']))!=len(data['subject_ids']):raise ValueError('Duplicate people.')

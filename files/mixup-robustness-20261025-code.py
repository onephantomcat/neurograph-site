"""Pure array diagnostics for fixed predictions; these functions do not fit models."""
import numpy as np

def pair_wins(y,p):
    y=np.asarray(y);p=np.asarray(p);ip=np.flatnonzero(y==1);jn=np.flatnonzero(y==0)
    if not len(ip) or not len(jn):return ip,jn,None
    w=(p[ip,None]>p[jn][None,:]).astype(float)+.5*(p[ip,None]==p[jn][None,:])
    return ip,jn,w

def auc(y,p):
    _,_,w=pair_wins(y,p)
    return None if w is None else float(w.mean())

def endpoint_contributions(y,old,new,model_weight):
    ip,jn,wo=pair_wins(y,old);_,_,wn=pair_wins(y,new);assert wo is not None
    delta=wn-wo;result=np.zeros(len(y))
    result[ip]=.5*model_weight*delta.sum(1)/delta.size
    result[jn]=.5*model_weight*delta.sum(0)/delta.size
    return result,wo,wn

def distribution(values):
    v=np.asarray(values,dtype=float)
    return dict(cases=len(v),minimum=float(v.min()),q25=float(np.quantile(v,.25)),median=float(np.median(v)),q75=float(np.quantile(v,.75)),maximum=float(v.max()),positive=int(np.sum(v>0)),zero=int(np.sum(v==0)),negative=int(np.sum(v<0)))

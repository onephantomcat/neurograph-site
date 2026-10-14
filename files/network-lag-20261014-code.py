"""Baseline-referenced, energy-shrunk antisymmetric lag projection.

X: ordered acquired-frame union (T,90); baseline: independent pre-stimulus
frames (2,90). No interpolation, self edges, target selection or causal claim.
"""
import numpy as np
B=np.array([56,57,76,77]);A=np.arange(28,34)

def components(x,baseline,scale,mode='anchor',indices=None):
    x=np.asarray(x,dtype=float)
    assert x.ndim==2 and x.shape[1]==90 and np.isfinite(x).all()
    center=baseline.mean(0) if mode=='anchor' else x.mean(0)
    u=(x-center)/scale
    adjacent=np.ones(len(x)-1,dtype=bool) if indices is None else np.diff(indices)==1
    assert adjacent.any(), 'No consecutive acquired-frame pairs'
    b0=u[:-1,B][adjacent,:,None];b1=u[1:,B][adjacent,:,None]
    a0=u[:-1,A][adjacent,None,:];a1=u[1:,A][adjacent,None,:]
    numerator=np.mean(b0*a1-a0*b1)
    symmetric=np.mean(b0*a1+a0*b1)
    energy=np.mean((b0*b0+a0*a0+b1*b1+a1*a1)/2)
    return float(numerator),float(energy),float(symmetric)

def fit_metric(windows,baselines,training):
    centered=np.concatenate([windows[k]-baselines[k].mean(0) for k in training])
    scale=np.sqrt(np.mean(centered**2,axis=0));scale=np.where(scale<1e-12,1.,scale)
    lam=float(np.median([components(windows[k],baselines[k],scale)[1] for k in training]))
    return scale,max(lam,1e-12)

def apply_metric(windows,baselines,scale,lam):
    out=[]
    for x,b in zip(windows,baselines):
        n,d,s=components(x,b,scale)
        nd,dd,_=components(x,b,scale,'demean')
        out.append([n/(d+lam),nd/max(dd,1e-12),n/max(d,1e-12),s/(d+lam)])
    return np.array(out)

def standardize(x,training):
    med=np.nanmedian(x[training],axis=0);med=np.nan_to_num(med)
    x=np.where(np.isfinite(x),x,med)
    mu=x[training].mean(0);sd=x[training].std(0);sd=np.where(sd<1e-7,1.,sd)
    return (x-mu)/sd,med,mu,sd

def fit_ridge(x,y,training,alpha=10.):
    a=x[training];xm=a.mean(0);ym=y[training].mean();a=a-xm
    dual=np.linalg.solve(a@a.T+alpha*np.eye(len(a)),y[training]-ym)
    coef=a.T@dual;inter=float(ym-xm@coef)
    singular=np.linalg.svd(a,compute_uv=False)
    return coef,inter,float(np.sum(singular**2/(singular**2+alpha))),int(np.linalg.matrix_rank(a))

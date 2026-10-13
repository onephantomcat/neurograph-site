"""Local RETROICOR design diagnostics; never fit an unidentifiable BOLD GLM.

Cardiac phase uses measured bracketing peaks. Respiratory phase uses the
observed amplitude empirical CDF and derivative sign. This is a local
implementation, not execution of the author's unspecified PNM configuration.
"""
import numpy as np

def cardiac_phase(sample_times, peak_times):
    t=np.asarray(sample_times,dtype=float);p=np.asarray(peak_times,dtype=float)
    j=np.searchsorted(p,t,side='right')-1
    if len(p)<3 or (np.diff(p)<=0).any() or (j<0).any() or (j>=len(p)-1).any():
        raise ValueError('Every query requires two measured bracketing cardiac peaks.')
    return 2*np.pi*(t-p[j])/(p[j+1]-p[j])

def respiratory_phase(trace):
    x=np.asarray(trace,dtype=float)
    if x.ndim!=1 or len(x)<10 or not np.isfinite(x).all() or np.ptp(x)==0:raise ValueError('Finite varying respiratory trace required.')
    ordered=np.sort(x);cdf=np.searchsorted(ordered,x,side='right')/float(len(x))
    return np.pi*cdf*np.sign(np.gradient(x))

def fourier_design(card,resp,cardiac_order=4,respiratory_order=4,interaction_card=2,interaction_resp=2):
    c=np.asarray(card,dtype=float);r=np.asarray(resp,dtype=float)
    if c.shape!=r.shape or c.ndim!=1 or not np.isfinite(c).all() or not np.isfinite(r).all():raise ValueError('Equal finite phase series required.')
    columns=[]
    for phase,order in [(c,cardiac_order),(r,respiratory_order)]:
        for k in range(1,order+1):columns.extend([np.sin(k*phase),np.cos(k*phase)])
    for kc in range(1,interaction_card+1):
        for kr in range(1,interaction_resp+1):
            for sign in [1,-1]:columns.extend([np.sin(kc*c+sign*kr*r),np.cos(kc*c+sign*kr*r)])
    return np.stack(columns,axis=1)

def identifiability(design):
    x=np.asarray(design,dtype=float)
    if x.ndim!=2 or not np.isfinite(x).all():raise ValueError('Finite 2D design required.')
    augmented=np.column_stack([np.ones(len(x)),x]);singular=np.linalg.svd(augmented,compute_uv=False);rank=int(np.linalg.matrix_rank(augmented))
    return dict(observations=len(x),nuisance_columns=x.shape[1],rank_with_intercept=rank,residual_degrees_of_freedom=len(x)-rank,full_column_rank=rank==augmented.shape[1],smallest_observed_singular_value=float(singular[-1]),fit_identifiable=rank==augmented.shape[1] and len(x)>rank)

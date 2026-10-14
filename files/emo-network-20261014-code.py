"""Signed AAL90 connection bundles and training-only measurement shrinkage.

No labels or query subjects enter the population prior. Bundle components
describe anatomical community pairs, not newly discovered communities.
"""
import numpy as np
EDGE=np.triu_indices(90,1)
def masks(mapping):
    labels=np.array([mapping[i] for i in range(90)])
    return np.array([(labels[EDGE[0]]==i)&(labels[EDGE[1]]==j) | (labels[EDGE[0]]==j)&(labels[EDGE[1]]==i) for i in range(8) for j in range(i,8)])
def connections(ts):
    x=np.asarray(ts,dtype=float);assert x.ndim==2 and x.shape[1]==90
    x=x-x.mean(0);sd=np.sqrt(np.mean(x*x,0));assert np.all(sd>1e-12)
    r=(x/sd).T@(x/sd)/len(x)
    return np.arctanh(np.clip(r[EDGE],-.999999,.999999))
def bundles(z,mask):
    return np.stack([z[...,m].mean(-1) for m in mask],axis=-1)
def measure(ts,mask,seeds=range(16),block=15,person_index=0):
    z=connections(ts);b=bundles(z,mask);out=[]
    for seed in seeds:
        rng=np.random.default_rng(seed+1000*person_index)
        starts=rng.integers(0,len(ts),int(np.ceil(len(ts)/block)))
        ix=np.concatenate([(s+np.arange(block))%len(ts) for s in starts])[:len(ts)]
        out.append(bundles(connections(ts[ix]),mask))
    draws=np.array(out);half=len(ts)//2
    halves=np.array([connections(ts[:half]),connections(ts[half:])])
    return dict(edges=z,bundle=b,draws=draws,variance=draws.var(0,ddof=1),halves=halves,bundle_halves=bundles(halves,mask))
def prior(z,v,training):
    mu=z[training].mean(0);total=z[training].var(0,ddof=1)
    noise=v[training].mean(0);signal=np.maximum(total-noise,0.)
    scale=z[training].std(0);scale=np.where(scale<1e-7,1.,scale)
    return dict(mean=mu,total=total,noise=noise,signal=signal,scale=scale)
def represent(z,v,p,kind):
    d=(z-p['mean'])/p['scale']
    if kind=='raw_bundle':return d
    if kind=='pooled_noise':w=p['signal']/(p['signal']+p['noise']+1e-12)
    elif kind=='individual_noise':w=p['signal']/(p['signal']+v+1e-12)
    elif kind=='permuted_noise':w=p['signal']/(p['signal']+v[:,np.random.default_rng(0).permutation(z.shape[1])]+1e-12)
    else:raise ValueError(kind)
    return d*w

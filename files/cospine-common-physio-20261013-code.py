"""Local finite FC/Ridge math; true AAL90 windows, training-person references."""
import numpy as np
from scipy.linalg import eigh
tri=np.triu_indices(90)
def symfun(a,fun):
 v,u=eigh((a+a.T)/2);return (u*fun(v))@u.T

def covariance(ts):
 x=ts-ts.mean(0);sd=np.sqrt(np.mean(x*x,0));zero=sd<1e-12;x=x/np.where(zero,1,sd);c=x.T@x/len(x);np.fill_diagonal(c,1)
 return c,.8*c+.2*np.eye(90),int(zero.sum())

def tangent(covs,training):
 log=lambda v:np.log(np.maximum(v,1e-8))
 ref=symfun(np.mean([symfun(c,log) for c in covs[training]],axis=0),np.exp);inv=symfun(ref,lambda v:1/np.sqrt(np.maximum(v,1e-8)));out=[]
 for c in covs:
  t=symfun(inv@c@inv,log);v=t[tri].copy();v[tri[0]!=tri[1]]*=np.sqrt(2);out.append(v)
 return np.array(out)

def transform(x,training):
 med=np.nanmedian(x[training],axis=0);med=np.nan_to_num(med);missing=~np.isfinite(x);x=np.where(missing,med[None,:],x)
 mean=x[training].mean(0);std=x[training].std(0);std=np.where(std<1e-7,1,std)
 return (x-mean)/std

def ridge(x,y,tr,alpha):
 ym=y[tr].mean();xm=x[tr].mean(0);a=x[tr]-xm;u,d,vt=np.linalg.svd(a,full_matrices=False);coef=vt.T@((d/(d*d+alpha))*(u.T@(y[tr]-ym)));inter=ym-xm@coef
 return coef,inter

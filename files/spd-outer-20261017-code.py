"""Outer-only nested supports and the existing geometric-mean iteration on NumPy."""
import numpy as np

def outer_supports(y,pool,outer,repeat):
 assert len(set(pool))==len(pool)
 order={c:np.random.default_rng(np.random.SeedSequence([20261016,outer,3,repeat,c])).permutation(sorted(i for i in pool if y[i]==c)) for c in [0,1]}
 assert min(map(len,order.values()))>=20
 return {k:np.sort(np.r_[order[0][:k],order[1][:k]]) for k in [5,10,20]}

def matrix_function(x,fn):
 l,u=np.linalg.eigh(x);assert l.min()>0
 return (u*fn(l))@u.T

def reference(c):
 """Same Nilearn geometric-mean steps/tolerance; NumPy eigensolver backend."""
 assert c.ndim==3 and c.shape[1:]==(90,90) and np.allclose(c,c.transpose(0,2,1))
 g=c.mean(0);old=np.inf;step=1.
 for iteration in range(30):
  l,u=np.linalg.eigh(g);assert l.min()>0
  h=(u*np.sqrt(1/l))@u.T;a=h@c@h
  vals,vecs=np.linalg.eigh(a);assert vals.min()>0
  logs=(vecs*np.log(vals)[:,None,:])@vecs.transpose(0,2,1);lm=logs.mean(0);norm=np.linalg.norm(lm)
  v,q=np.linalg.eigh(lm);root=(u*np.sqrt(l))@u.T;g=root@((q*np.exp(v*step))@q.T)@root
  if norm<old:old=norm
  elif norm>old:step/=2.;norm=old
  if norm/g.size<1e-7:break
 assert norm/g.size<1e-7
 h=matrix_function(g,lambda x:1/np.sqrt(x));a=h@c@h;l,u=np.linalg.eigh((a+a.transpose(0,2,1))*.5)
 residual=float(np.linalg.norm(((u*np.log(l)[:,None,:])@u.transpose(0,2,1)).mean(0))/g.size)
 assert residual<1e-7
 return g,h,residual,iteration+1

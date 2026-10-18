"""Local 3-BiMap SPDNet adaptation. Input full signed AAL90 covariance [B,90,90],
support-whitened; four train-scaled covariates [B,4]; output binary logit [B].
Official block order: BiMap-ReEig-BiMap-ReEig-BiMap-LogEig. Widths, nested
initialization, upper-vector feature scale and covariate head are local adaptations.
"""
import torch
from torch import nn
from models import GeometryClassifier,Spectral,qr_positive,sym

class DeepSPD(nn.Module):
 def __init__(self,seed,dims=(90,48,24,16)):
  super().__init__();self.dims=tuple(dims);roi,d1,d2,rank=dims;assert roi>=d1>=d2>=rank
  base=GeometryClassifier('spd_log',seed,roi=roi,rank=rank);gen=torch.Generator().manual_seed(1000003+seed)
  tail=torch.randn(roi,d1-rank,generator=gen,dtype=torch.float64);tail=tail-base.W.detach()@(base.W.detach().T@tail);tail=qr_positive(tail)
  w1=torch.cat([base.W.detach(),tail],dim=1);w2=torch.eye(d1,dtype=torch.float64)[:,:d2];w3=torch.eye(d2,dtype=torch.float64)[:,:rank]
  self.projections=nn.ParameterList([nn.Parameter(v.clone()) for v in [w1,w2,w3]])
  self.head=base.head
  for name in ['ii','jj','factor','feature_mean','feature_rms']:self.register_buffer(name,getattr(base,name).clone())
 def matrix_forward(self,x):
  for i,w in enumerate(self.projections):
   x=sym(w.T@x@w)
   x=Spectral.apply(x,True) if i==2 else Spectral.apply(x,False)+torch.eye(x.shape[-1],dtype=x.dtype,device=x.device)
  return x
 def raw_features(self,x):
  z=self.matrix_forward(x);return z[:,self.ii,self.jj]*self.factor
 @torch.no_grad()
 def fit_feature_scale(self,x):
  f=self.raw_features(x);self.feature_mean.copy_(f.mean(0));self.feature_rms.copy_(((f-self.feature_mean)**2).mean().sqrt().clamp(min=1e-8))
 def forward(self,x,c):return self.head(torch.cat([(self.raw_features(x)-self.feature_mean)/self.feature_rms,c],dim=1)).squeeze(-1)
 @torch.no_grad()
 def step(self,lr=.01,weight_decay=.001):
  for w in self.projections:
   rg=w.grad-w@sym(w.T@w.grad);w.copy_(qr_positive(w-lr*rg))
  self.head.weight.add_(self.head.weight.grad+weight_decay*self.head.weight,alpha=-lr);self.head.bias.add_(self.head.bias.grad,alpha=-lr)
 def parameters_count(self):return sum(p.numel() for p in self.parameters())
 @torch.no_grad()
 def inspect_geometry(self,x,c):
  clips=[];mins=[];z=x
  for i,w in enumerate(self.projections):
   z=sym(w.T@z@w);l=torch.linalg.eigvalsh(z);clips.append(int((l<1e-4).sum()));mins.append(float(l.min()))
   if i<2:z=Spectral.apply(z,False)+torch.eye(z.shape[-1],dtype=z.dtype)
  effective=self.projections[0]@self.projections[1]@self.projections[2];collapsed=Spectral.apply(sym(effective.T@x@effective),True);feat=collapsed[:,self.ii,self.jj]*self.factor;logit=self.head(torch.cat([(feat-self.feature_mean)/self.feature_rms,c],dim=1)).squeeze(-1)
  return dict(clipped_eigenvalues=clips,minimum_preclip_eigenvalues=mins,collapse_logit_max_error=float(abs(logit-self(x,c)).max()),orthogonality_errors=[float(abs(w.T@w-torch.eye(w.shape[1],dtype=w.dtype)).max()) for w in self.projections],effective_orthogonality_error=float(abs(effective.T@effective-torch.eye(effective.shape[1],dtype=effective.dtype)).max()))

def numpy_deep(b,x,c):
 import numpy as np
 n={k:v.cpu().numpy() for k,v in b.items()}
 for i in range(3):
  w=n[f'projections.{i}'];z=w.T@x@w;l,u=np.linalg.eigh((z+z.transpose(0,2,1))*.5);f=np.maximum(l,1e-4);f=np.log(f) if i==2 else f;x=(u*f[:,None,:])@u.transpose(0,2,1)
 f=x[:,n['ii'],n['jj']]*n['factor'];v=np.c_[(f-n['feature_mean'])/n['feature_rms'],c];return 1/(1+np.exp(-(v@n['head.weight'][0]+n['head.bias'][0])))

"""Local SPD task adaptation. [B,90,90]+[B,4 or 13] -> ordered survival [B,2]."""
import torch
from torch import nn
from models import GeometryClassifier,sym,qr_positive

class PainModel(nn.Module):
 def __init__(self,arm,seed):
  super().__init__();assert arm in ['clinical_ordinal','spd_confounds_ordinal','spd_clinical_ordinal','spd_clinical_regression']
  self.arm=arm;self.ordinal=arm!='spd_clinical_regression';self.width=4 if arm=='spd_confounds_ordinal' else 13
  self.backbone=None if arm=='clinical_ordinal' else GeometryClassifier('spd_log',seed)
  if self.backbone is not None:del self.backbone.head
  torch.manual_seed(seed+10000)
  self.head=nn.Linear((136 if self.backbone is not None else 0)+self.width,1,bias=not self.ordinal,dtype=torch.float64)
  with torch.no_grad():self.head.weight.normal_(0,.01)
  if self.ordinal:self.cut=nn.Parameter(torch.zeros(2,dtype=torch.float64))
  else:
   with torch.no_grad():self.head.bias.zero_()
 @torch.no_grad()
 def initialize(self,x,y):
  if self.backbone is not None:self.backbone.fit_feature_scale(x)
  if self.ordinal:
   q=torch.stack([((y>j).double().sum()+.5)/(len(y)+1) for j in range(2)])
   t=-torch.logit(q);self.cut[0]=t[0];self.cut[1]=torch.log(torch.expm1(t[1]-t[0]))
 def thresholds(self):return torch.stack([self.cut[0],self.cut[0]+torch.nn.functional.softplus(self.cut[1])])
 def forward(self,x,c):
  f=c if self.backbone is None else torch.cat([(self.backbone.raw_features(x)-self.backbone.feature_mean)/self.backbone.feature_rms,c],1)
  score=self.head(f).squeeze(-1)
  return score[:,None]-self.thresholds() if self.ordinal else score
 @torch.no_grad()
 def step(self,lr=.01,wd=.001):
  if self.backbone is not None:
   w=self.backbone.W;g=w.grad;w.copy_(qr_positive(w-lr*(g-w@sym(w.T@g))))
  self.head.weight.add_(self.head.weight.grad+wd*self.head.weight,alpha=-lr)
  if self.ordinal:self.cut.add_(self.cut.grad,alpha=-lr)
  else:self.head.bias.add_(self.head.bias.grad,alpha=-lr)

def probability(logits):
 q=torch.sigmoid(logits);return torch.stack([1-q[:,0],q[:,0]-q[:,1],q[:,1]],1)

def numpy_forward(state,x,c,ordinal):
 import numpy as np
 n={k:v.detach().cpu().numpy() for k,v in state.items()}
 if 'backbone.W' in n:
  y=n['backbone.W'].T@x@n['backbone.W'];y=(y+y.transpose(0,2,1))*.5;l,u=np.linalg.eigh(y);z=(u*np.log(np.maximum(l,1e-4))[:,None,:])@u.transpose(0,2,1)
  f=z[:,n['backbone.ii'],n['backbone.jj']]*n['backbone.factor'];c=np.c_[(f-n['backbone.feature_mean'])/n['backbone.feature_rms'],c]
 s=(c@n['head.weight'].T).ravel()
 if not ordinal:return s+n['head.bias'][0]
 t=np.array([n['cut'][0],n['cut'][0]+np.logaddexp(0,n['cut'][1])]);q=1/(1+np.exp(-(s[:,None]-t)));return np.c_[1-q[:,0],q[:,0]-q[:,1],q[:,1]]

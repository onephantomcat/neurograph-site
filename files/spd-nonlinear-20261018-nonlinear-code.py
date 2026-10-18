"""Local positive-coefficient Hadamard cubic residual; not official SPDNet ReEig."""
import torch
from deep_model import DeepSPD
from models import Spectral,sym

class NonlinearSPD(DeepSPD):
 def __init__(self,seed,dims=(90,48,24,16)):
  super().__init__(seed,dims);self.register_buffer('activation_scale',torch.ones(2,dtype=torch.float64))
 def activate(self,a,i):return a+.25*a.pow(3)/self.activation_scale[i].square()
 @torch.no_grad()
 def calibrate(self,x):
  for i,w in enumerate(self.projections[:2]):
   x=sym(w.T@x@w);s=x.diagonal(dim1=-2,dim2=-1).flatten().median();assert torch.isfinite(s) and s>0;self.activation_scale[i].copy_(s);x=self.activate(x,i)
 def matrix_forward(self,x):
  for i,w in enumerate(self.projections):
   x=sym(w.T@x@w);x=Spectral.apply(x,True) if i==2 else self.activate(x,i)
  return x
 @torch.no_grad()
 def inspect_geometry(self,x,c=None):
  details=[]
  for i,w in enumerate(self.projections):
   x=sym(w.T@x@w);l=torch.linalg.eigvalsh(x)
   if i<2:
    z=self.activate(x,i);a=x[:-1];b=x[1:];mid=self.activate((a+b)*.5,i);avg=(self.activate(a,i)+self.activate(b,i))*.5
    details.append(dict(minimum_eigenvalue=float(l.min()),activated_minimum_eigenvalue=float(torch.linalg.eigvalsh(z).min()),relative_change=float((z-x).norm()/x.norm()),midpoint_relative_error=float((mid-avg).norm()/avg.norm()),scale=float(self.activation_scale[i])));x=z
   else:details.append(dict(minimum_eigenvalue=float(l.min()),log_clipped_eigenvalues=int((l<1e-4).sum())))
  return dict(layers=details,orthogonality_errors=[float(abs(w.T@w-torch.eye(w.shape[1],dtype=w.dtype)).max()) for w in self.projections])

def numpy_nonlinear(state,x,c):
 import numpy as np
 n={k:v.cpu().numpy() for k,v in state.items()}
 for i in range(3):
  w=n[f'projections.{i}'];x=w.T@x@w;x=(x+x.transpose(0,2,1))*.5
  if i<2:x=x+.25*x**3/n['activation_scale'][i]**2
  else:l,u=np.linalg.eigh(x);x=(u*np.log(np.maximum(l,1e-4))[:,None,:])@u.transpose(0,2,1)
 f=x[:,n['ii'],n['jj']]*n['factor'];v=np.c_[(f-n['feature_mean'])/n['feature_rms'],c];return 1/(1+np.exp(-(v@n['head.weight'][0]+n['head.bias'][0])))

"""Local lag-summary neural model; AAL90 [B,240,90] -> [B,90,4] -> logits.
No graph edges, no windows as people. Not an official FBNetGen/FMM replica.
Only support observations fit the four lag scales; confounds use original scales.
"""
import numpy as np
import torch
from torch import nn
LAGS=(1,2,4,8)

def lag_profiles(ts):
    x=np.asarray(ts,dtype=np.float64);assert x.ndim==3 and x.shape[1:]==(240,90) and np.isfinite(x).all()
    out=[]
    for lag in LAGS:
        a=x[:,:-lag,:];b=x[:,lag:,:];a=a-a.mean(1,keepdims=True);b=b-b.mean(1,keepdims=True)
        den=np.sqrt((a*a).sum(1)*(b*b).sum(1));assert np.min(den)>1e-12
        out.append((a*b).sum(1)/den)
    return np.stack(out,axis=-1)

class LagProfileNet(nn.Module):
    def __init__(self,seed):
        super().__init__();torch.manual_seed(seed)
        self.shared=nn.Linear(4,8,dtype=torch.float64);self.head=nn.Linear(724,1,dtype=torch.float64)
        self.register_buffer('mean',torch.zeros(4,dtype=torch.float64));self.register_buffer('scale',torch.ones(4,dtype=torch.float64))
    @torch.no_grad()
    def fit_feature_scale(self,x):
        self.mean.copy_(x.mean((0,1)));self.scale.copy_(x.std((0,1),unbiased=False).clamp(min=1e-8))
    def forward(self,x,c):
        z=torch.tanh(self.shared((x-self.mean)/self.scale)).flatten(1)
        return self.head(torch.cat([z,c],1)).squeeze(1)

def numpy_temporal(state,x,c):
    n={k:v.detach().cpu().numpy() for k,v in state.items()}
    h=np.tanh(((x-n['mean'])/n['scale'])@n['shared.weight'].T+n['shared.bias']).reshape(len(x),720)
    z=np.c_[h,c]@n['head.weight'][0]+n['head.bias'][0]
    return 1/(1+np.exp(-z))

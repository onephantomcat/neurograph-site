"""Own one-BiMap SPDNet task adaptation, not original AFEW reproduction.
Input whitened full covariance [B,90,90], train-scaled confounds [B,4].
Signed off-diagonals and diagonal retained; no graph/message passing.
Symmetric spectral derivative handles repeated eigenvalues by divided differences.
"""
import torch
from torch import nn

def sym(x):return (x+x.transpose(-1,-2))*.5

class Spectral(torch.autograd.Function):
    @staticmethod
    def forward(ctx,x,log_mode):
        values,vectors=torch.linalg.eigh(sym(x));clamped=values.clamp(min=1e-4)
        f=clamped.log() if log_mode else clamped-1
        derivative=(values>1e-4).to(x.dtype)/(clamped if log_mode else torch.ones_like(clamped))
        ctx.save_for_backward(values,vectors,f,derivative)
        return sym((vectors*f.unsqueeze(-2))@vectors.transpose(-1,-2))
    @staticmethod
    def backward(ctx,g):
        l,u,f,d=ctx.saved_tensors;gap=l.unsqueeze(-1)-l.unsqueeze(-2);numer=f.unsqueeze(-1)-f.unsqueeze(-2)
        close=gap.abs()<=1e-10*torch.maximum(torch.ones_like(gap),torch.maximum(l.abs().unsqueeze(-1),l.abs().unsqueeze(-2)))
        divided=numer/torch.where(close,torch.ones_like(gap),gap)
        divided=torch.where(close,(d.unsqueeze(-1)+d.unsqueeze(-2))*.5,divided)
        return sym(u@(divided*(u.transpose(-1,-2)@sym(g)@u))@u.transpose(-1,-2)),None

def qr_positive(x):
    q,r=torch.linalg.qr(x,mode='reduced');sign=torch.where(torch.diagonal(r)>=0,torch.ones(x.shape[1],dtype=x.dtype,device=x.device),-torch.ones(x.shape[1],dtype=x.dtype,device=x.device))
    return q*sign

class GeometryClassifier(nn.Module):
    def __init__(self,mode,seed,roi=90,rank=16):
        super().__init__();assert mode in ['spd_log','rectified_linear'];torch.manual_seed(seed);self.mode=mode
        self.W=nn.Parameter(qr_positive(torch.randn(roi,rank,dtype=torch.float64)))
        self.head=nn.Linear(rank*(rank+1)//2+4,1,dtype=torch.float64)
        with torch.no_grad():self.head.weight.normal_(0,.01);self.head.bias.zero_()
        ij=torch.triu_indices(rank,rank);self.register_buffer('ii',ij[0]);self.register_buffer('jj',ij[1]);self.register_buffer('factor',torch.where(ij[0]==ij[1],1.,2.**.5).to(torch.float64))
        self.register_buffer('feature_mean',torch.zeros(len(ij[0]),dtype=torch.float64));self.register_buffer('feature_rms',torch.ones((),dtype=torch.float64))
    def raw_features(self,x):
        y=self.W.T@x@self.W;z=Spectral.apply(y,self.mode=='spd_log')
        return z[:,self.ii,self.jj]*self.factor
    @torch.no_grad()
    def fit_feature_scale(self,x):
        f=self.raw_features(x);self.feature_mean.copy_(f.mean(0));self.feature_rms.copy_(((f-self.feature_mean)**2).mean().sqrt().clamp(min=1e-8))
    def forward(self,x,cov):return self.head(torch.cat([(self.raw_features(x)-self.feature_mean)/self.feature_rms,cov],dim=1)).squeeze(-1)
    @torch.no_grad()
    def step(self,lr=.01,weight_decay=.001):
        g=self.W.grad;rg=g-self.W@sym(self.W.T@g);self.W.copy_(qr_positive(self.W-lr*rg))
        self.head.weight.add_(self.head.weight.grad+weight_decay*self.head.weight,alpha=-lr);self.head.bias.add_(self.head.bias.grad,alpha=-lr)
    def parameters_count(self):return sum(p.numel() for p in self.parameters())

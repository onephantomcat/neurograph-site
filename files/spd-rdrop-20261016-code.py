"""Own binary R-Drop adapter. Inputs [B,90,90]/[B,4], output [B].
Drop only the 136 normalized log-covariance features; never alter covariates.
No additional parameters, covariance edits or query-side fitting.
"""
import torch
from models import GeometryClassifier

def symmetric_bernoulli_kl(z1,z2):
    return .5*(torch.sigmoid(z1)-torch.sigmoid(z2))*(z1-z2)

class DropoutClassifier(GeometryClassifier):
    def __init__(self,seed,p=.10,roi=90,rank=16):
        super().__init__('spd_log',seed,roi=roi,rank=rank)
        assert 0<=p<1
        self.dropout_probability=p

    def forward(self,x,cov,generator=None):
        f=(self.raw_features(x)-self.feature_mean)/self.feature_rms
        if self.training and self.dropout_probability:
            keep=torch.rand(f.shape,dtype=f.dtype,device=f.device,generator=generator)>=self.dropout_probability
            f=f*keep/(1-self.dropout_probability)
        return self.head(torch.cat([f,cov],dim=1)).squeeze(-1)

def training_objective(m,x,cov,y,weights,generator,coefficient):
    z1=m(x,cov,generator);z2=m(x,cov,generator)
    bce=.5*((torch.nn.functional.binary_cross_entropy_with_logits(z1,y,reduction='none')+torch.nn.functional.binary_cross_entropy_with_logits(z2,y,reduction='none'))*weights).sum()
    kl=symmetric_bernoulli_kl(z1,z2).mean()
    return bce+coefficient*kl,bce,kl

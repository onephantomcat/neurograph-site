"""Fixed-position supervised mixing; no new model parameters or graph changes."""
from contextlib import contextmanager
import numpy as np
import torch
from torch.nn import functional as F

def mixed_ce(logits,labels,weight,permutation):
    return weight*F.cross_entropy(logits,labels)+(1-weight)*F.cross_entropy(logits,labels[permutation])

class CommunityMixer:
    def __init__(self,model):
        self.model=model;self.active=False;self.calls=0;self.handle=model.classifier.register_forward_pre_hook(self._hook)
    def _hook(self,module,args):
        if not self.active:return None
        if not self.model.training:raise RuntimeError('Mixing must not run during evaluation')
        h=args[0]
        assert h.ndim==2 and h.shape[1]==256 and len(h)==len(self.permutation)
        self.calls+=1
        return (self.weight*h+(1-self.weight)*h[self.permutation],)
    @contextmanager
    def batch(self,weight,permutation):
        assert not self.active and 0<=weight<=1
        assert torch.equal(torch.sort(permutation).values,torch.arange(len(permutation),device=permutation.device))
        self.weight=float(weight);self.permutation=permutation;self.active=True;before=self.calls
        try:yield
        finally:self.active=False
        assert self.calls==before+1
    def close(self):
        assert not self.active
        self.handle.remove()

def mixing_rng(seed,inner):return np.random.default_rng(np.random.SeedSequence([20261025,seed,inner,77]))

def smoke(make_model):
    torch.manual_seed(812);torch.set_num_threads(2)
    class Tiny(torch.nn.Module):
        def __init__(self):super().__init__();self.classifier=torch.nn.Linear(256,2,dtype=torch.float64)
        def forward(self,h):return self.classifier(h)
    model=Tiny();mixer=CommunityMixer(model);labels=torch.tensor([0,1,0,1,1]);permutation=torch.tensor([2,4,1,0,3]);max_loss=max_gradient=0.
    for weight in [0.,.37,1.]:
        model.train();model.zero_grad(set_to_none=True);h=torch.randn(5,256,dtype=torch.float64,requires_grad=True)
        with mixer.batch(weight,permutation):logits=model(h)
        loss=mixed_ce(logits,labels,weight,permutation)
        soft=weight*F.one_hot(labels,2).to(logits.dtype)+(1-weight)*F.one_hot(labels[permutation],2).to(logits.dtype)
        manual=-(soft*logits.log_softmax(1)).sum(1).mean();max_loss=max(max_loss,float((loss-manual).abs().detach()))
        dz=(logits.detach().softmax(1)-soft)/len(labels);gh=dz@model.classifier.weight.detach();expected=weight*gh;expected.index_add_(0,permutation,(1-weight)*gh)
        loss.backward();max_gradient=max(max_gradient,float((h.grad-expected).abs().max()))
    assert max_loss<1e-12 and max_gradient<1e-12
    model.eval();blocked=False
    try:
        with mixer.batch(.5,permutation):model(torch.randn(5,256,dtype=torch.float64))
    except RuntimeError:blocked=True
    assert blocked and not mixer.active;mixer.close()
    # The real author network has the same tested classifier-input interface.
    actual=make_model(torch.device('cpu'));actual.eval();x=torch.eye(90).repeat(4,1,1);adj=torch.zeros(4,90,90)
    for j in range(89):adj[:,j,j+1]=1;adj[:,j+1,j]=1
    with torch.no_grad():plain=actual(None,x,adj)[0]
    hook=CommunityMixer(actual)
    with torch.no_grad():disabled=actual(None,x,adj)[0]
    disabled_error=float((plain-disabled).abs().max());assert disabled_error==0
    actual.train();actual.zero_grad(set_to_none=True);perm=torch.tensor([1,0,3,2])
    with hook.batch(.37,perm):out=actual(None,x,adj)[0]
    mixed_ce(out,torch.tensor([0,1,0,1]),.37,perm).backward()
    grad=float(actual.embedding.weight.grad.abs().max());assert grad>0 and np.isfinite(grad) and actual.clustering_module.community_prototypes.grad is None
    assert sum(p.numel() for p in actual.parameters())==3309738 and sum(p.numel() for p in actual.parameters() if p.requires_grad)==3307690
    hook.close()
    return dict(state='PASS',soft_target_loss_error=max_loss,manual_feature_gradient_error=max_gradient,disabled_author_forward_error=disabled_error,eval_mix_blocked=True,embedding_gradient_max=grad,frozen_prototype_gradient_absent=True,lambda_endpoints_checked=True,new_parameters=0)

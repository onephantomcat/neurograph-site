"""Only the existing first compression layer receives this auxiliary gradient."""
import torch
import torch.nn.functional as F

def centered_gram(features):
    x=features.flatten(1)
    x=x-x.mean(0,keepdim=True)
    return x@x.T

def geometry_loss(h,first_linear,activation):
    target=h.detach()
    z=activation(first_linear(target.flatten(1)))
    kh=centered_gram(target);kz=centered_gram(z)
    denominator=torch.linalg.vector_norm(kh)*torch.linalg.vector_norm(kz)
    cka=(kh*kz).sum()/denominator.clamp_min(1e-8)
    loss=1-cka
    return loss,dict(cka=float(cka.detach()),denominator=float(denominator.detach()),denominator_clamped=bool(denominator.detach()<1e-8)),kh,kz

class GeometryPenalty:
    def __init__(self,model):
        self.h=None;self.calls=0;self.first=model.clustering_module.encoder[0];self.activation=model.clustering_module.encoder[1]
        self.handle=model.lsra_layers[-1].register_forward_hook(self.capture)
    def capture(self,module,args,out):
        if module.training:self.h=out[0].detach()
    def loss(self):
        assert self.h is not None
        h=self.h;self.h=None;self.calls+=1
        return geometry_loss(h,self.first,self.activation)
    def close(self):self.handle.remove();self.h=None

def smoke(make_model):
    import random,numpy as np
    random.seed(20261026);np.random.seed(20261026);torch.manual_seed(20261026)
    # Gradient routing and finite differences on synthetic data, no optimizer steps.
    h=torch.randn(7,5,9,requires_grad=True,dtype=torch.float64);first=torch.nn.Linear(45,4,dtype=torch.float64);act=torch.nn.LeakyReLU()
    loss,stats,kh,kz=geometry_loss(h,first,act);loss.backward();assert h.grad is None and first.weight.grad.abs().max()>0
    analytic=float(first.weight.grad[0,0]);eps=1e-6
    with torch.no_grad():
        first.weight[0,0]+=eps;plus=float(geometry_loss(h,first,act)[0]);first.weight[0,0]-=2*eps;minus=float(geometry_loss(h,first,act)[0]);first.weight[0,0]+=eps
    error=abs((plus-minus)/(2*eps)-analytic);assert error<1e-8
    # Actual model hook leaves main output unchanged and auxiliary path consumes no RNG.
    model=make_model(torch.device('cpu'));model.eval();x=torch.randn(6,90,90);x=(x+x.transpose(1,2))*.5;adj=torch.eye(90).repeat(6,1,1)
    with torch.no_grad():before=model(None,x,adj)[0]
    penalty=GeometryPenalty(model)
    with torch.no_grad():after=model(None,x,adj)[0]
    assert torch.equal(before,after)
    model.train();torch.manual_seed(20261026);logits=model(None,x,adj)[0];rng=torch.get_rng_state().clone();aux,info,_,_=penalty.loss();assert torch.equal(rng,torch.get_rng_state())
    named=[(n,p) for n,p in model.named_parameters() if p.requires_grad];g=torch.autograd.grad(aux,[p for _,p in named],allow_unused=True)
    routed=[n for (n,p),v in zip(named,g) if v is not None]
    assert routed==['clustering_module.encoder.0.weight','clustering_module.encoder.0.bias']
    assert all(q is None or torch.isfinite(q).all() for q in g)
    penalty.close()
    return dict(state='PASS_SYNTHETIC_GEOMETRY_GRADIENT',finite_difference_error=error,upstream_h_gradient_none=True,actual_auxiliary_gradient_parameters=routed,main_output_difference=0,auxiliary_consumed_rng=False,new_patient_fits=0,new_optimizer_steps=0,synthetic_cka=info['cka'])

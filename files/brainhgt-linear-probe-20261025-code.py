"""A fixed, strongly regularized diagnostic readout; fit accepts training data only."""
import numpy as np
from scipy.optimize import minimize
from scipy.special import expit

def objective(theta,x,y):
    z=x@theta[:-1]+theta[-1]
    value=np.mean(np.logaddexp(0,z)-y*z)+.5*np.dot(theta[:-1],theta[:-1])
    residual=expit(z)-y
    gradient=np.r_[x.T@residual/len(y)+theta[:-1],residual.mean()]
    return float(value),gradient

def fit(training_features,training_labels):
    f=np.asarray(training_features,dtype=np.float64);y=np.asarray(training_labels,dtype=np.float64)
    assert f.ndim==2 and f.shape[1]==256 and len(f)==len(y) and set(y)=={0.,1.}
    assert np.isfinite(f).all()
    mean=f.mean(0);scale=np.maximum(f.std(0,ddof=0),1e-6);x=(f-mean)/scale
    trace=[]
    def callback(theta):
        value,gradient=objective(theta,x,y)
        trace.append(dict(iteration=len(trace)+1,objective=value,gradient_max=float(np.abs(gradient).max())))
    result=minimize(objective,np.zeros(257),args=(x,y),jac=True,method='L-BFGS-B',callback=callback,
        options=dict(maxiter=2000,maxfun=10000,ftol=1e-12,gtol=1e-8,maxls=40))
    value,gradient=objective(result.x,x,y)
    model=dict(theta=result.x,mean=mean,scale=scale)
    info=dict(success=bool(result.success),status=int(result.status),message=str(result.message),iterations=int(result.nit),evaluations=int(result.nfev),objective=value,gradient_max=float(np.abs(gradient).max()),lambda_l2=1.,parameters=257,trace=trace)
    return model,info

def predict(model,features):
    x=(np.asarray(features,dtype=np.float64)-model['mean'])/model['scale']
    z=x@model['theta'][:-1]+model['theta'][-1]
    return expit(z),z

def capture(backbone,x,adj):
    import torch
    pre=[];post=[];logits=[]
    def prehook(module,args,output):pre.append(output[0].detach().mean(1).cpu())
    def posthook(module,args):post.append(args[0].detach().cpu())
    hooks=[backbone.lsra_layers[-1].register_forward_hook(prehook),backbone.classifier.register_forward_pre_hook(posthook)]
    backbone.eval()
    try:
        with torch.no_grad():
            for i in range(0,len(x),32):logits.append(backbone(None,x[i:i+32],adj[i:i+32])[0].cpu())
    finally:
        for hook in hooks:hook.remove()
    return {k:torch.cat(v).numpy() for k,v in [('pre',pre),('post',post),('logits',logits)]}

def smoke():
    import torch
    rng=np.random.default_rng(20261025);x=rng.normal(size=(17,256));y=np.r_[np.zeros(8),np.ones(9)];theta=rng.normal(scale=.02,size=257)
    value,grad=objective(theta,x,y);eps=1e-5
    err=0.
    for j in [0,57,255,256]:
        plus=theta.copy();minus=theta.copy();plus[j]+=eps;minus[j]-=eps
        err=max(err,abs((objective(plus,x,y)[0]-objective(minus,x,y)[0])/(2*eps)-grad[j]))
    assert err<1e-8
    t=torch.tensor(theta,requires_grad=True);xt=torch.tensor(x);yt=torch.tensor(y);z=xt@t[:-1]+t[-1]
    loss=(torch.nn.functional.softplus(z)-yt*z).mean()+.5*t[:-1].square().sum();loss.backward()
    autograd_error=float(np.max(np.abs(t.grad.numpy()-grad)));assert autograd_error<1e-12
    m,info=fit(x,y);assert info['success'] and info['gradient_max']<1e-5
    assert np.array_equal(m['mean'],x.mean(0)) and np.array_equal(m['scale'],np.maximum(x.std(0),1e-6))
    return dict(state='PASS',finite_difference_error=err,autograd_error=autograd_error,synthetic_parameters=257,training_only_interface=True)

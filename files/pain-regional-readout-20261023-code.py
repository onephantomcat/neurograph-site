"""Frozen BrainHGT with an anatomically pooled, zero-output ranking residual."""
import torch
from torch import nn

def capture(backbone,x,adj,batch_size=32):
    logits=[];roi=[]
    def hook(module,args,output):roi.append(output[0].detach().clone())
    h=backbone.lsra_layers[-1].register_forward_hook(hook)
    try:
        backbone.eval()
        with torch.no_grad():
            for i in range(0,len(x),batch_size):logits.append(backbone(None,x[i:i+batch_size],adj[i:i+batch_size])[0].detach())
    finally:h.remove()
    return torch.cat(logits),torch.cat(roi)

class RegionalResidual(nn.Module):
    def __init__(self,backbone,indices):
        super().__init__();self.backbone=backbone
        for p in backbone.parameters():p.requires_grad_(False)
        self.register_buffer('indices',torch.as_tensor(indices,dtype=torch.long))
        self.register_buffer('mean',torch.zeros(256));self.register_buffer('scale',torch.ones(256))
        self.head=nn.Sequential(nn.Linear(256,8),nn.Tanh(),nn.Linear(8,1,bias=False))
        nn.init.zeros_(self.head[-1].weight)
    def train(self,mode=True):
        super().train(mode);self.backbone.eval();return self
    def pool(self,roi):return roi.index_select(1,self.indices).mean(1)
    def standardize(self,feature):return (feature-self.mean)/self.scale
    def fit_scale(self,training_feature):
        z=training_feature.double();self.mean.copy_(z.mean(0).float());self.scale.copy_(z.std(0,unbiased=False).clamp_min(1e-6).float())
    def from_cache(self,base_logits,feature):
        delta=self.head(self.standardize(feature)).squeeze(-1)
        return torch.stack([base_logits[:,0],base_logits[:,1]+delta],1)
    def forward(self,x,adj):
        base,roi=capture(self.backbone,x,adj)
        return self.from_cache(base,self.pool(roi))

def ranking_loss(logits,labels):
    score=logits[:,1]-logits[:,0]
    return torch.nn.functional.softplus(-(score[labels==1,None]-score[labels==0][None,:])).mean()

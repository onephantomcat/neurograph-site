"""Per-person [B,N,N] positive graph, signed node profiles -> logits [B,2]."""
import torch
from model import GNNPredictor

def normalize(m):
    degree=m.sum(-1,keepdim=True)
    p=m/degree.clamp_min(torch.finfo(m.dtype).tiny)
    eye=torch.eye(m.shape[-1],device=m.device,dtype=m.dtype).unsqueeze(0)
    return torch.where(degree>0,p,eye)

class Predictor(GNNPredictor):
    def __init__(self,node_input_dim,roi_num=90):
        super().__init__(node_input_dim,roi_num)
        self.alpha=torch.nn.Parameter(torch.zeros(3))
        self.mode='normalized'

    def propagate(self,p,h,layer):
        if self.mode=='identity':return h
        message=torch.bmm(p,h)
        if self.mode=='normalized':return message
        if self.mode!='residual':raise ValueError(self.mode)
        return h+torch.tanh(self.alpha[layer])*(message-h)

    def forward(self,m,node_feature):
        bz=m.shape[0];p=normalize(m)
        x=self.gcn(self.propagate(p,node_feature,0))
        x=self.bn1(x.reshape(bz*self.roi_num,-1)).reshape(bz,self.roi_num,-1)
        x=self.gcn1(self.propagate(p,x,1))
        x=self.bn2(x.reshape(bz*self.roi_num,-1)).reshape(bz,self.roi_num,-1)
        x=self.gcn2(self.propagate(p,x,2))
        x=self.bn3(x)
        return self.fcn(x.reshape(bz,-1))

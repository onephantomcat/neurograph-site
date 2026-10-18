"""Local small encoders; signed FC[B,90,90], A[B,90,90], ts[B,90,300], c[B,13]."""
import torch
from torch import nn
from static_graph_base import StaticGraphClassifier

class GraphEncoder(StaticGraphClassifier):
 def __init__(self,propagation):
  super().__init__(propagation=propagation,hidden=16,dropout=.2);del self.head
 def forward(self,fc,a):
  h=a@fc if self.propagation else fc;h=self.dropout(torch.relu(self.node1(h)))
  h=a@h if self.propagation else h
  return self.dropout(torch.relu(self.node2(h))).mean(1)

class TemporalEncoder(nn.Module):
 def __init__(self):
  super().__init__();self.mix=nn.Conv1d(90,16,1);self.time=nn.Conv1d(16,16,5,padding=2,groups=16);self.out=nn.Conv1d(16,16,1);self.drop=nn.Dropout(.2)
 def forward(self,t):return torch.relu(self.out(self.drop(torch.relu(self.time(self.drop(torch.relu(self.mix(t)))))))).mean(2)

class ROITransformer(nn.Module):
 def __init__(self):
  super().__init__();self.embed=nn.Linear(90,16);self.pos=nn.Parameter(torch.randn(90,16)*.01);self.ln1=nn.LayerNorm(16);self.qkv=nn.Linear(16,48);self.proj=nn.Linear(16,16);self.ln2=nn.LayerNorm(16);self.ff1=nn.Linear(16,32);self.ff2=nn.Linear(32,16);self.drop=nn.Dropout(.2)
 def forward(self,f):
  x=self.embed(f)+self.pos;q,k,v=self.qkv(self.ln1(x)).chunk(3,-1)
  def split(z):return z.reshape(len(z),90,2,8).transpose(1,2)
  q,k,v=map(split,(q,k,v));att=torch.softmax(q@k.transpose(-1,-2)/(8**.5),-1);h=(att@v).transpose(1,2).reshape(len(x),90,16)
  x=x+self.drop(self.proj(h));x=x+self.drop(self.ff2(torch.nn.functional.gelu(self.ff1(self.ln2(x)),approximate='tanh')))
  return x.mean(1)

FAMILIES=['clinical','node_mlp','gcn','temporal_cnn','roi_transformer']
class MultiPain(nn.Module):
 def __init__(self,family,objective,seed):
  super().__init__();assert family in FAMILIES and objective in ['ordinal','regression'];torch.manual_seed(seed);self.family=family;self.ordinal=objective=='ordinal'
  self.encoder=None if family=='clinical' else GraphEncoder(family=='gcn') if family in ['node_mlp','gcn'] else TemporalEncoder() if family=='temporal_cnn' else ROITransformer()
  self.head=nn.Linear(13+(0 if family=='clinical' else 16),1,bias=not self.ordinal)
  if self.ordinal:self.cut=nn.Parameter(torch.zeros(2))
  self.double()
 @torch.no_grad()
 def initialize(self,grade):
  if self.ordinal:
   q=torch.stack([((grade>j).double().sum()+.5)/(len(grade)+1) for j in range(2)]);t=-torch.logit(q);self.cut[0]=t[0];self.cut[1]=torch.log(torch.expm1(t[1]-t[0]))
 def forward(self,fc,a,ts,c):
  if self.encoder is None:z=c
  else:h=self.encoder(ts) if self.family=='temporal_cnn' else self.encoder(fc,a) if self.family in ['node_mlp','gcn'] else self.encoder(fc);z=torch.cat([h,c],1)
  s=self.head(z).squeeze(-1)
  if not self.ordinal:return s
  return s[:,None]-torch.stack([self.cut[0],self.cut[0]+torch.nn.functional.softplus(self.cut[1])])

def probability(logits):
 q=torch.sigmoid(logits);return torch.stack([1-q[:,0],q[:,0]-q[:,1],q[:,1]],1)

def numpy_predict(state,family,ordinal,fc,a,ts,c):
 import numpy as np
 n={k:v.detach().cpu().numpy() for k,v in state.items()};lin=lambda x,k:x@n[k+'.weight'].T+n[k+'.bias'];relu=lambda x:np.maximum(x,0)
 def norm(x,k):return (x-x.mean(-1,keepdims=True))/np.sqrt(x.var(-1,keepdims=True)+1e-5)*n[k+'.weight']+n[k+'.bias']
 if family in ['node_mlp','gcn']:
  h=a@fc if family=='gcn' else fc;h=relu(lin(h,'encoder.node1'));h=a@h if family=='gcn' else h;h=relu(lin(h,'encoder.node2')).mean(1)
 elif family=='temporal_cnn':
  h=relu(np.einsum('oc,bct->bot',n['encoder.mix.weight'][:,:,0],ts)+n['encoder.mix.bias'][None,:,None]);hp=np.pad(h,((0,0),(0,0),(2,2)));z=sum(hp[:,:,i:i+h.shape[2]]*n['encoder.time.weight'][:,0,i][None,:,None] for i in range(5));h=relu(z+n['encoder.time.bias'][None,:,None]);h=relu(np.einsum('oc,bct->bot',n['encoder.out.weight'][:,:,0],h)+n['encoder.out.bias'][None,:,None]).mean(2)
 elif family=='roi_transformer':
  x=lin(fc,'encoder.embed')+n['encoder.pos'];z=lin(norm(x,'encoder.ln1'),'encoder.qkv');q,k,v=np.split(z,3,-1)
  def split(z):return z.reshape(len(z),90,2,8).transpose(0,2,1,3)
  q,k,v=map(split,(q,k,v));scores=q@k.transpose(0,1,3,2)/np.sqrt(8);ex=np.exp(scores-scores.max(-1,keepdims=True));att=ex/ex.sum(-1,keepdims=True);h=(att@v).transpose(0,2,1,3).reshape(len(x),90,16);x=x+lin(h,'encoder.proj');z=lin(norm(x,'encoder.ln2'),'encoder.ff1');gelu=.5*z*(1+np.tanh(np.sqrt(2/np.pi)*(z+.044715*z**3)));h=(x+lin(gelu,'encoder.ff2')).mean(1)
 else:h=None
 z=c if h is None else np.c_[h,c];s=(z@n['head.weight'].T).ravel()
 if not ordinal:return s+n['head.bias'][0]
 t=np.array([n['cut'][0],n['cut'][0]+np.logaddexp(0,n['cut'][1])]);q=1/(1+np.exp(-(s[:,None]-t)));return np.c_[1-q[:,0],q[:,0]-q[:,1],q[:,1]]

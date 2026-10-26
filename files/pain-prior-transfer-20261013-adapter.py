"""Own frozen-prior regression interface around the official TabPFN v2 API.

Tabular train/query [n,p], original continuous y_train [n], y_pred [q].
Never supplies query labels or neural gradients. The optional null model resets
all neural parameters after copying the loaded model; output-distribution buffers
are deliberately unchanged. This is a weight ablation, not another trained model.
"""
from contextlib import contextmanager
import copy
import numpy as np,torch
from tabpfn import TabPFNRegressor
import tabpfn.regressor as official

@contextmanager
def frozen_loader(seed,random_weights):
 original=official.initialize_tabpfn_model
 def load(*args,**kwargs):
  items=list(original(*args,**kwargs));model=copy.deepcopy(items[0]);items[0]=model
  if random_weights:
   with torch.random.fork_rng(devices=[]):
    torch.manual_seed(seed)
    for name,p in model.named_parameters():
     with torch.no_grad():
      if p.ndim>=2:torch.nn.init.xavier_uniform_(p)
      elif 'norm' in name.lower() and name.endswith('weight'):p.fill_(1.)
      else:p.zero_()
  for p in model.parameters():p.requires_grad_(False)
  return tuple(items)
 official.initialize_tabpfn_model=load
 try:yield
 finally:official.initialize_tabpfn_model=original

def fit_prior(x,y,*,model_path,seed,variant,n_estimators=4):
 assert variant in ['pretrained','random_neural_weights']
 assert x.ndim==2 and y.shape==(len(x),) and np.isfinite(x).all() and np.isfinite(y).all()
 model=TabPFNRegressor(model_path=str(model_path),device='cuda',n_estimators=n_estimators,n_jobs=1,random_state=seed,inference_precision=torch.float32,fit_mode='fit_with_cache')
 with frozen_loader(seed,variant=='random_neural_weights'):model.fit(x,y)
 assert all(not p.requires_grad for p in model.model_.parameters())
 return model

def predict_prior(model,x):
 p=np.concatenate([np.asarray(model.predict(x[i:i+1],output_type='mean'),dtype=float) for i in range(len(x))]);assert p.shape==(len(x),) and np.isfinite(p).all();return p

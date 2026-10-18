"""Official TabPFN v2, frozen; fixed paper Eq.4 and official prior balancing.

Built with PriorLabs-TabPFN. This is an endpoint adapter, not a new network.
"""
from pathlib import Path
import os,sys
O=Path(__file__).resolve().parent
assert sys.version_info[:2]==(3,12), 'Use the existing Python3.12 runtime matching the retained official dependency wheels.'
sys.path.insert(0,str(O/'dependencies'));sys.path.insert(1,str(O.parent/'20260923-pretrained-models/dependencies'))
for k in ['OMP_NUM_THREADS','OPENBLAS_NUM_THREADS','MKL_NUM_THREADS']:os.environ[k]='2'
os.environ['HF_HUB_OFFLINE']='1';os.environ['HF_HUB_DISABLE_TELEMETRY']='1';os.environ['HF_HUB_DISABLE_IMPLICIT_TOKEN']='1';os.environ['CUDA_VISIBLE_DEVICES']=''
import numpy as np,torch
from tabpfn import TabPFNClassifier
torch.set_num_threads(2)
def fit_context(x,y,seed):
 assert x.ndim==2 and y.shape==(len(x),) and set(y.tolist())=={0,1,2} and np.isfinite(x).all()
 m=TabPFNClassifier(model_path=str(O/'weights/tabpfn-v2-classifier.ckpt'),device='cpu',n_estimators=4,n_jobs=1,random_state=seed,inference_precision=torch.float32,fit_mode='fit_with_cache',softmax_temperature=.9,balance_probabilities=False,average_before_softmax=False)
 with torch.no_grad():m.fit(x,y)
 m.model_.requires_grad_(False);m.model_.eval();assert np.array_equal(m.classes_,[0,1,2]) and all(not p.requires_grad for p in m.model_.parameters())
 return m
def predict_single_queries(m,x):
 with torch.inference_mode():p=np.concatenate([m.predict_proba(x[i:i+1]) for i in range(len(x))],axis=0).astype(float)
 assert p.shape==(len(x),3) and np.isfinite(p).all() and p.min()>=0 and abs(p.sum(1)-1).max()<1e-6
 return p
def adjust(p,counts,method):
 assert method in ['raw','official_balance','distpfn_single'];prior=np.asarray(counts,dtype=float)/sum(counts);assert (prior>0).all()
 if method=='raw':return p.copy()
 # DistPFN paper Eq.4, single-instance variant; no test-batch mean or tuning.
 z=p/prior if method=='official_balance' else p*p/prior
 return z/z.sum(1,keepdims=True)
def decode(p,decision):
 assert decision in ['argmax','median']
 return np.argmax(p,1) if decision=='argmax' else ((p[:,1]+p[:,2])>=.5).astype(int)+(p[:,2]>=.5).astype(int)

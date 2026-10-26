import numpy as np
from scipy.special import expit
def evaluate(y,p,epsilon):
 y=np.asarray(y);p=np.asarray(p,dtype=np.float64);h=p>=.5;ip=p[y==1];jn=p[y==0];auc=float(np.mean((ip[:,None]>jn).astype(float)+.5*(ip[:,None]==jn)))
 order=np.argsort(-p,kind='stable');ys=y[order];ps=p[order];ends=np.r_[np.flatnonzero(np.diff(ps)),len(ps)-1];tp=ys.cumsum()[ends];ap=float(np.sum(np.diff(np.r_[0.,tp/len(ip)])*tp/(ends+1)));pc=np.clip(p,epsilon,1-epsilon);se=float(h[y==1].mean());sp=float((~h[y==0]).mean())
 return dict(auc=auc,ap=ap,ba=(se+sp)/2,accuracy=float((h==y).mean()),sensitivity=se,specificity=sp,brier=float(np.mean((p-y)**2)),logloss=float(np.mean(-y*np.log(pc)-(1-y)*np.log1p(-pc))),prevalence=float(y.mean()),predicted_positive=float(h.mean()))
def offsets_from_training(z,y,sites):
 z=np.asarray(z,dtype=np.float64);y=np.asarray(y);sites=np.asarray(sites);global_mean={c:float(z[y==c].mean()) for c in [0,1]};out={};rows=[]
 for site in ['CIN','OSU','NKN']:
  n={c:int(((sites==site)&(y==c)).sum()) for c in [0,1]};means={c:float(z[(sites==site)&(y==c)].mean()) if n[c] else None for c in [0,1]};reason='fixed_zero_NKN_tiny_total3' if site=='NKN' else 'missing_train_class_zero' if not all(n.values()) else 'fixed_class_balanced_training_offset'
  b=.5*sum(means[c]-global_mean[c] for c in [0,1]) if reason=='fixed_class_balanced_training_offset' else 0.;out[site]=b;rows.append(dict(site=site,HC=n[0],Pain=n[1],global_HC_mean=global_mean[0],global_Pain_mean=global_mean[1],site_HC_mean=means[0],site_Pain_mean=means[1],offset=b,reason=reason))
 return out,rows

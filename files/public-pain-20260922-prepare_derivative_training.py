"""Join published per-person FC to original patient VAS; never load author pickle models."""
from pathlib import Path
import json, subprocess
import numpy as np
import pandas as pd

ROOT=Path(__file__).resolve().parent
REPO=ROOT/'imagenomer'
OUT=ROOT.parent.parent/'output/emo-public-derivative-20260922'
OUT.mkdir(exist_ok=True)
clinical=ROOT.parent/'20260916-severity-dataset-selection/emo-fibro/Clinical_fm_66_.xlsx'
d=pd.read_excel(clinical,sheet_name='data_66')
d=d.loc[d.gp.eq(0)].sort_values('rid').copy()
assert d.rid.is_unique
paths=subprocess.check_output(['git','-C',str(REPO),'ls-tree','-r','--name-only','HEAD','data/Fibromyalgia/fc']).decode().splitlines()
selected=[f'data/Fibromyalgia/fc/{int(rid)}_task-rest_fc.npy' for rid in d.rid]
assert set(selected)<=set(paths), 'Missing patient FC; inspect the actual join'
# Extract selected blobs without a checkout: the shallow filtered checkout fails
# on this Windows host, but ordinary git object reads preserve the public bytes.
derivatives=ROOT/'imagenomer_selected'
for source in [*selected,'README.md','LICENSE','notebooks/ImageNomer26FibromyalgiaDataset.ipynb']:
    target=derivatives/source
    target.parent.mkdir(parents=True,exist_ok=True)
    if not target.exists():
        target.write_bytes(subprocess.check_output(['git','-C',str(REPO),'show','HEAD:'+source]))
X=np.stack([np.load(derivatives/p,allow_pickle=False) for p in selected]).astype(np.float64)
y=d['1_vas_pain_iv'].to_numpy(dtype=float)
fields=['1_age','1_yr_study','1_fm_dx_t']
C=d[fields].to_numpy(dtype=float)
assert X.shape==(len(d),264*263//2)
assert np.isfinite(X).all() and np.isfinite(C).all() and np.isfinite(y).all()
assert np.max(np.abs(X))<=1.000001 and ((y>=0)&(y<=100)).all()
assert (C[:,2]<=C[:,0]).all()
assert np.all(X.std(axis=1)>0)
assert len(np.unique(X,axis=0))==len(d)
ids=np.array([f'sub-{int(x):03d}' for x in d.rid])
np.savez_compressed(OUT/'inputs_private.npz',X=X,y=y,clinical=C,ids=ids,
                    clinical_names=np.asarray(fields),global_fc=np.c_[X.mean(axis=1),np.abs(X).mean(axis=1)])
audit={'source_repository':'https://github.com/TulaneMBB/ImageNomer',
       'revision':subprocess.check_output(['git','-C',str(REPO),'rev-parse','HEAD']).decode().strip(),
       'dataset':'ds004144','representation':'published Power264 resting Pearson FC, upper triangle',
       'patients':len(d),'features':X.shape[1],'clinical_features':fields,'target':'interview VAS 0-100',
       'target_min':float(y.min()),'target_max':float(y.max()),'feature_min':float(X.min()),'feature_max':float(X.max()),
       'exact_duplicate_rows':0,'nonfinite_values':0,'missing_labels':0,'feature_level_checks':'PASS',
       'raw_image_qc':'NOT_REPRODUCED_FOR_THIS_DERIVATIVE','visual_review':'NOT_AVAILABLE_FROM_FC_ONLY',
       'primary_aal90_training_inclusion':False,
       'scope':'Separate exploratory derivative experiment; not a replacement for the pending AAL90 image pipeline.',
       'author_demo_not_reused':['health-control zero imputation','mixing resting/task rows in random splits','provided PCA and prediction weights'],
       'preprocessing_limit':'Notebook starts from external ROI time series and shows a 0.01-0.15 Hz filter; complete image preprocessing/motion provenance is not reproduced.'}
(OUT/'input_audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
d[['rid',*fields,'1_vas_pain_iv','16_int_task_ti']].to_csv(OUT/'clinical_source_private.csv',index=False)
print(json.dumps(audit,ensure_ascii=False,indent=2))

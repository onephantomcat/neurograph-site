"""Fixed sklearn classifiers; sigmoid SVM calibration uses training folds only."""
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.calibration import CalibratedClassifierCV

def make_model(method, seed, calibration_splits):
    if method in ('linear_svm','rbf_svm'):
        base=make_pipeline(StandardScaler(),SVC(kernel='linear' if method=='linear_svm' else 'rbf',
                    C=1.,gamma='scale',class_weight='balanced',probability=False,tol=1e-3,
                    cache_size=256,max_iter=-1,random_state=0))
        return CalibratedClassifierCV(base,method='sigmoid',cv=calibration_splits,n_jobs=1,ensemble=True)
    if method=='random_forest':
        return RandomForestClassifier(n_estimators=200,max_depth=3,min_samples_leaf=4,
                 max_features='sqrt',class_weight='balanced',random_state=seed,n_jobs=2)
    raise ValueError(method)

"""Shared sklearn fit/predict, calibration isolation inspection, native persistence."""
import numpy as np
import joblib

def fit_predict(model,x,y,xv,calibration_splits):
    model.fit(x,y)
    audit=[]
    if hasattr(model,'calibrated_classifiers_'):
        for fitted,(train,cal) in zip(model.calibrated_classifiers_,calibration_splits):
            scaler=fitted.estimator.steps[0][1]
            difference=float(np.max(np.abs(scaler.mean_-x[train].mean(0))))
            assert difference<1e-12 and int(scaler.n_samples_seen_)==len(train)
            assert not set(train)&set(cal)
            audit.append(dict(scaler_fit_people=len(train),calibration_people=len(cal),
                              scaler_mean_max_difference=difference,
                              support_vectors=int(fitted.estimator.steps[1][1].support_.size)))
    return model.predict_proba(xv)[:,1],audit

def save_reload(path,payload,xv):
    probability=payload['model'].predict_proba(xv)[:,1]
    joblib.dump(payload,path,compress=3)
    reloaded=joblib.load(path)
    difference=float(np.max(np.abs(reloaded['model'].predict_proba(xv)[:,1]-probability)))
    # Parallel forest accumulation can differ by floating-point summation order.
    assert difference<1e-12
    return difference

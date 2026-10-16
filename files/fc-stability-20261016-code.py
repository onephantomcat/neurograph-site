"""Train-only tangent edges [n,4005] + four confounds; no query fitting.
Two disjoint 120-frame halves estimate within-scan across-person consistency.
Weights alter the L2 penalty AFTER scaling; no diagonal or graph propagation.
"""
import numpy as np
from sklearn.covariance import LedoitWolf
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from nilearn.connectome import ConnectivityMeasure

CONDITIONS = ('uniform', 'stability', 'shuffled')

def consistency(a, b):
    a = np.asarray(a, float); b = np.asarray(b, float)
    assert a.shape == b.shape and a.ndim == 2
    a = a-a.mean(axis=0); b = b-b.mean(axis=0)
    den = np.sqrt((a*a).sum(axis=0)*(b*b).sum(axis=0))
    return np.clip(np.divide((a*b).sum(axis=0), den, out=np.zeros(a.shape[1]), where=den>0), -1, 1)

def penalties(r):
    q = 1/(.1+.9*np.maximum(r, 0))
    q = q/np.exp(np.log(q).mean())
    shuffled = q[np.random.default_rng(20261016).permutation(len(q))]
    return dict(uniform=np.ones(len(q)), stability=q, shuffled=shuffled)

def design(ts, cov, train, validation):
    assert set(train).isdisjoint(validation)
    ref = ConnectivityMeasure(cov_estimator=LedoitWolf(), kind='tangent', standardize=False, vectorize=True, discard_diagonal=True)
    x = ref.fit_transform([ts[i] for i in train])
    h1 = ref.transform([ts[i, :120] for i in train])
    h2 = ref.transform([ts[i, 120:] for i in train])
    r = consistency(h1, h2)
    q = ref.transform([ts[i] for i in validation])
    return dict(reference=ref, train_x=np.c_[x, cov[train]], validation_x=np.c_[q, cov[validation]], consistency=r, penalties=penalties(r))

def fit(x, y, edge_penalty):
    scaler = StandardScaler().fit(x)
    root = np.sqrt(np.r_[edge_penalty, np.ones(4)])
    clf = LogisticRegression(C=1, class_weight='balanced', solver='liblinear', tol=1e-8, max_iter=5000, random_state=0)
    clf.fit(scaler.transform(x)/root, y)
    assert clf.n_iter_.max()<5000
    return dict(scaler=scaler, root_penalty=root, model=clf)

def predict(bundle, x):
    return bundle['model'].predict_proba(bundle['scaler'].transform(x)/bundle['root_penalty'])[:, 1]

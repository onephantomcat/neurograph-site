"""AAL90 order as stored; [T,90] -> signed node rows [90,90], positive A.

Each person's graph uses that person's time series only. Constant ROIs have
zero correlations; positive off-diagonal weights plus unit self-loops undergo
symmetric degree normalization. Covariates and node columns scale on training
people only. MRI is never loaded by this module.
"""
import numpy as np
from sklearn.preprocessing import StandardScaler


def graph(series):
    t = np.asarray(series, dtype=np.float64)
    if t.ndim != 2 or t.shape[1] != 90 or not np.isfinite(t).all():
        raise ValueError('Require finite [time,90] in the existing AAL90 order.')
    z = t - t.mean(axis=0)
    norm = np.linalg.norm(z, axis=0)
    unit = np.divide(z, norm, out=np.zeros_like(z), where=norm > 0)
    x = np.clip(unit.T @ unit, -1, 1)
    a = np.maximum(x, 0)
    np.fill_diagonal(a, 1.)
    inv = 1 / np.sqrt(a.sum(axis=1))
    return x.astype('float32'), (inv[:, None] * a * inv[None, :]).astype('float32')


class TrainingTransforms:
    def fit(self, x, c):
        self.nodes = StandardScaler().fit(x.reshape(-1, 90))
        self.covariates = StandardScaler().fit(c)
        return self

    def transform(self, x, c):
        return (self.nodes.transform(x.reshape(-1, 90)).reshape(x.shape).astype('float32'),
                self.covariates.transform(c).astype('float32'))


def partition(data, train, validation, query):
    tr, va, qu = map(set, (train, validation, query))
    if len(tr) != len(train) or len(va) != len(validation) or tr & va or (tr | va) & qu:
        raise ValueError('Require unique training/validation people disjoint from query.')
    ids = data['subject_ids']
    if len(set(ids)) != len(ids):
        raise ValueError('Repeated person keys cannot be split as different people.')
    def rows(indices):
        pairs = [graph(data['time_series'][i]) for i in indices]
        return (np.stack([p[0] for p in pairs]), np.stack([p[1] for p in pairs]),
                np.asarray(data['covariates'][indices], dtype='float32'),
                np.asarray(data['labels'][indices], dtype='float32'))
    xt, at, ct, yt = rows(train)
    xv, av, cv, yv = rows(validation)
    transforms = TrainingTransforms().fit(xt, ct)
    xt, ct = transforms.transform(xt, ct)
    xv, cv = transforms.transform(xv, cv)
    return (xt, at, ct, yt), (xv, av, cv, yv), transforms

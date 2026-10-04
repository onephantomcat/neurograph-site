"""Describe nuisance rank and existing FC signal without selecting people.

The caller supplies numerical matrices. No diagnosis, label, cutoff, model fit,
input replacement or automatic training-inclusion decision is implemented.
"""
import numpy as np


def design_burden(design):
    design = np.asarray(design, dtype=np.float64)
    if design.ndim != 2 or not np.isfinite(design).all():
        raise ValueError('Expected a finite time-by-regressor matrix')
    rank = int(np.linalg.matrix_rank(design))
    return dict(frames=int(design.shape[0]), design_columns=int(design.shape[1]),
                actual_design_rank=rank, residual_dof=int(design.shape[0]-rank))


def signal_burden(series):
    series = np.asarray(series, dtype=np.float64)
    if series.ndim != 2 or not np.isfinite(series).all():
        raise ValueError('Expected finite existing time-by-ROI signals')
    centered = series-series.mean(axis=0, keepdims=True)
    singular = np.linalg.svd(centered, compute_uv=False)
    energy = singular**2
    if energy.sum() <= 0:
        raise ValueError('All ROI signals are constant')
    return dict(fc_signal_first_two_singular_energy_fraction=float(energy[:2].sum()/energy.sum()),
                fc_roi_population_std_min=float(np.std(series, axis=0).min()),
                fc_roi_population_std_max=float(np.std(series, axis=0).max()))

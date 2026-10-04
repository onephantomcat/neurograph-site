"""Recompute the declared objective of stored models without refitting heads."""
import argparse
import json
import os
from pathlib import Path
import sys
import time

for key in ['OMP_NUM_THREADS', 'MKL_NUM_THREADS', 'OPENBLAS_NUM_THREADS']:
    os.environ[key] = '1'
if os.environ.get('FMRI_DEPENDENCIES'):
    sys.path[:0] = os.environ['FMRI_DEPENDENCIES'].split(os.pathsep)

import joblib
import numpy as np
import pandas as pd
import scipy
import sklearn
import nilearn
from scipy.special import expit
from sklearn.base import clone
from sklearn.metrics import log_loss
from nilearn.connectome import sym_matrix_to_vec
from nilearn.connectome.connectivity_matrices import _map_eigenvalues
from threadpoolctl import threadpool_limits


def objective(theta, design, labels, weights, lam):
    margins = design @ theta
    loss = np.dot(weights, np.logaddexp(0.0, margins) - labels * margins)
    return float(loss + 0.5 * lam * np.dot(theta, theta))


def main(source, output):
    output.mkdir(parents=True, exist_ok=True)
    assert not (output / 'summary.json').exists(), 'Inspect a completed review before rerunning'
    ds = joblib.load(source / 'inputs_private.joblib')['data']
    tasks = json.loads((source / 'tasks_private.json').read_text(encoding='utf8'))
    original = json.loads((source / 'verification_private.json').read_text(encoding='utf8'))
    environment = json.loads((source / 'environment.json').read_text(encoding='utf8'))
    assert {name: module.__version__ for name, module in [('numpy', np), ('sklearn', sklearn),
            ('nilearn', nilearn), ('joblib', joblib)]} == {
            name: environment[name] for name in ['numpy', 'sklearn', 'nilearn', 'joblib']}
    assert original['counts'] == {'final': 724, 'inner': 5792}
    people = [(name, i) for name, cohort in ds.items() for i in range(len(cohort['y']))]
    lookup = {person: i for i, person in enumerate(people)}
    covariates = np.stack([ds[name]['cov'][i] for name, i in people])
    covariance = None
    covariance_params = None
    rows = []
    direction_checks = []
    checked_directions = set()
    ref_count = 0
    direct_transform_checks = 0
    max_transform_difference = 0.0
    max_query_probability_difference = 0.0
    max_loss_difference = 0.0
    started = time.time()
    for task in tasks:
        cache = {}
        paths = sorted((source / 'models' / task['key']).glob('*.joblib'))
        for path in paths:
            obj = joblib.load(path)
            model = obj['model']
            params = model.get_params()
            lam = float(obj['lambda_'])
            assert params['solver'] == 'liblinear' and not params['dual']
            assert params['l1_ratio'] == 0 and params['class_weight'] is None
            assert params['fit_intercept'] and params['intercept_scaling'] == 1
            assert np.isclose(params['C'], 1 / lam, rtol=0, atol=1e-14)
            assert model.classes_.tolist() == [0, 1]
            train = [tuple(person) for person in obj['train']]
            query = [tuple(person) for person in obj['query']]
            reference_people = [tuple(person) for person in obj['reference_people']]
            assert set(train).isdisjoint(query) and set(reference_people).isdisjoint(query)
            y = np.asarray([ds[name]['y'][i] for name, i in train], dtype=float)
            weights = np.asarray(obj['weights'], dtype=float)
            expected = np.zeros(len(train))
            domains = np.asarray([name for name, _ in train])
            for name in np.unique(domains):
                mass = obj['alpha'] if name == task['source'] else 1 - obj['alpha']
                for label in [0, 1]:
                    indices = np.flatnonzero((domains == name) & (y == label))
                    assert len(indices)
                    expected[indices] = mass / (2 * len(indices))
            np.testing.assert_array_equal(weights, expected)
            assert np.isclose(weights.sum(), 1) and (weights > 0).all()
            if obj['representation'] == 'fc':
                reference = obj['reference']
                assert reference.kind == 'tangent' and reference.standardize is False
                assert reference.vectorize and reference.discard_diagonal
                estimator_params = reference.cov_estimator_.get_params()
                if covariance is None:
                    covariance_params = estimator_params
                    estimator = clone(reference.cov_estimator_)
                    covariance = np.stack([estimator.fit(ds[name]['ts'][i]).covariance_.copy()
                                           for name, i in people])
                assert estimator_params == covariance_params
                key = tuple(reference_people)
                if key not in cache:
                    matrices = np.asarray([_map_eigenvalues(np.log,
                        reference.whitening_.dot(cov).dot(reference.whitening_)) for cov in covariance])
                    tangent = sym_matrix_to_vec(matrices, discard_diagonal=True)
                    # Directly execute the saved library transform once in each original task.
                    if not cache:
                        direct = reference.transform([ds[name]['ts'][i] for name, i in people])
                        difference = float(np.max(np.abs(direct - tangent)))
                        max_transform_difference = max(max_transform_difference, difference)
                        np.testing.assert_allclose(tangent, direct, rtol=0, atol=2e-12)
                        direct_transform_checks += 1
                    cache[key] = (np.c_[tangent, covariates], reference.mean_.copy(), reference.whitening_.copy())
                    ref_count += 1
                xx, saved_mean, saved_whitening = cache[key]
                np.testing.assert_array_equal(saved_mean, reference.mean_)
                np.testing.assert_array_equal(saved_whitening, reference.whitening_)
            else:
                assert obj['representation'] == 'covariates' and obj['reference'] is None
                xx = covariates
            raw = xx[[lookup[person] for person in train]]
            scaler = obj['scaler']
            np.testing.assert_allclose(scaler.mean_, np.average(raw, axis=0, weights=weights), rtol=0, atol=1e-10)
            z = (raw - scaler.mean_) / scaler.scale_
            design = np.c_[z, np.ones(len(train))]
            theta = np.r_[model.coef_[0], model.intercept_[0]]
            margin = design @ theta
            probabilities = expit(margin)
            sample_loss = np.logaddexp(0.0, margin) - y * margin
            loss = float(weights @ sample_loss)
            loss_check = float(log_loss(y, probabilities, sample_weight=weights, labels=[0, 1]))
            max_loss_difference = max(max_loss_difference, abs(loss - loss_check))
            assert abs(loss - loss_check) < 1e-12
            penalty = float(0.5 * lam * (theta @ theta))
            gradient = design.T @ (weights * (probabilities - y)) + lam * theta
            g0 = design.T @ (weights * (0.5 - y))
            gradient_norm = float(np.linalg.norm(gradient))
            initial_norm = float(np.linalg.norm(g0))
            gap_bound = gradient_norm ** 2 / (2 * lam)
            derivative_key = (obj['representation'], lam)
            if derivative_key not in checked_directions:
                direction = np.random.default_rng(20261004).normal(size=len(theta))
                direction /= np.linalg.norm(direction)
                step = 1e-5
                numeric = (objective(theta + step * direction, design, y, weights, lam) -
                           objective(theta - step * direction, design, y, weights, lam)) / (2 * step)
                analytic = float(gradient @ direction)
                difference = abs(numeric - analytic)
                assert difference < 1e-8
                direction_checks.append(dict(representation=derivative_key[0], lambda_=lam,
                                             central_step=step, absolute_error=difference))
                checked_directions.add(derivative_key)
            query_raw = xx[[lookup[person] for person in query]]
            replay = expit(((query_raw - scaler.mean_) / scaler.scale_) @ model.coef_[0] + model.intercept_[0])
            probability_difference = float(np.max(np.abs(replay - obj['probability'])))
            max_query_probability_difference = max(max_query_probability_difference, probability_difference)
            np.testing.assert_allclose(replay, obj['probability'], rtol=0, atol=2e-12)
            row = dict(target=task['target'], k_per_class=0 if task['source_only'] else task['k'],
                       reference=obj['reference_kind'], representation=obj['representation'],
                       alpha=float(obj['alpha']), lambda_=lam, phase=obj['phase'],
                       weighted_logloss=loss, l2_penalty=penalty, objective=loss + penalty,
                       objective_gap_upper_bound=gap_bound, gradient_l2=gradient_norm,
                       gradient_max_abs=float(np.max(np.abs(gradient))),
                       initial_gradient_l2=initial_norm,
                       gradient_relative_initial_l2=gradient_norm / initial_norm if initial_norm else None,
                       coefficient_l2=float(np.linalg.norm(theta)), intercept=float(model.intercept_[0]),
                       n_iter=int(model.n_iter_[0]), declared_tolerance=float(params['tol']),
                       task_key=task['key'], model_file=path.relative_to(source).as_posix())
            for name, role in [(task['source'], 'source'), (task['target'], 'target')]:
                indices = np.flatnonzero(domains == name)
                row[role + '_mass'] = float(weights[indices].sum())
                row[role + '_training_logloss'] = float(np.average(sample_loss[indices], weights=weights[indices])) if len(indices) else None
            rows.append(row)
        print(json.dumps(dict(task=task['key'], heads=len(rows), saved_references=ref_count,
                              seconds=round(time.time() - started, 1))), flush=True)
    frame = pd.DataFrame(rows)
    assert frame.phase.value_counts().to_dict() == {'inner': 5792, 'final': 724}
    assert len(direction_checks) == 8 and len(tasks) == 62
    assert frame.model_file.nunique() == 6516
    frame.to_csv(output / 'heads_objective_private.csv', index=False)
    group_fields = ['target', 'k_per_class', 'reference', 'representation', 'alpha']
    conditions = frame[frame.phase == 'final'].groupby(group_fields, sort=False, dropna=False).agg(
        saved_heads=('model_file', 'size'), weighted_logloss_median=('weighted_logloss', 'median'),
        weighted_logloss_min=('weighted_logloss', 'min'), weighted_logloss_max=('weighted_logloss', 'max'),
        l2_penalty_median=('l2_penalty', 'median'), objective_median=('objective', 'median'),
        gradient_l2_max=('gradient_l2', 'max'), objective_gap_upper_bound_max=('objective_gap_upper_bound', 'max'),
        source_training_logloss_median=('source_training_logloss', 'median'),
        target_training_logloss_median=('target_training_logloss', 'median')).reset_index()
    conditions.to_csv(output / 'objective_by_condition.csv', index=False)
    numerical = []
    for (phase, rep), subset in frame.groupby(['phase', 'representation'], sort=False):
        numerical.append(dict(phase=phase, representation=rep, heads=len(subset),
            max_gradient_l2=float(subset.gradient_l2.max()),
            max_gradient_relative_initial_l2=float(subset.gradient_relative_initial_l2.max()),
            max_objective_gap_upper_bound=float(subset.objective_gap_upper_bound.max()),
            median_objective_gap_upper_bound=float(subset.objective_gap_upper_bound.median())))
    summary = dict(id='fc-objective-review-20261004', source_run='fc-transfer-conditions-20261002',
        analysis_type='post hoc saved-model objective audit', saved_heads=len(frame),
        final_heads=724, inner_heads=5792, training_reference_fits=0, new_model_fits=0,
        new_independent_clinical_validations=0, original_results_and_selections_unchanged=True,
        numerical=numerical, max_query_probability_difference=max_query_probability_difference,
        max_logloss_independent_function_difference=max_loss_difference,
        saved_reference_transforms=ref_count, direct_saved_transform_checks=direct_transform_checks,
        max_cached_covariance_transform_difference=max_transform_difference,
        individual_covariance_recalculations=len(people), derivative_checks=direction_checks,
        objective_formula='sum(w_i * (logaddexp(0, x_i theta) - y_i * x_i theta)) + lambda/2 * ||theta||^2',
        intercept_penalized=True, intercept_scaling=1, weight_sum=1,
        gap_bound='||gradient||_2^2 / (2 * lambda), from lambda-strong convexity in the augmented standardized coordinates',
        limitations='Optimization evidence on previously developed cohorts; no refitting or new selection. '
                    'Training loss is not generalization or clinical evidence. Standardization differs across '
                    'conditions, so matching lambda and weight sums does not impose identical penalties in '
                    'original FC coordinates. The bound controls the convex head objective, not reference '
                    'estimation, input quality, sampling uncertainty or negative-transfer mechanisms.',
        environment=dict(python=sys.version, numpy=np.__version__, sklearn=sklearn.__version__,
                         scipy=scipy.__version__, nilearn=nilearn.__version__, joblib=joblib.__version__),
        elapsed_seconds=time.time() - started)
    (output / 'summary.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2, allow_nan=False) + '\n', encoding='utf8')
    print(json.dumps(summary, ensure_ascii=False), flush=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    with threadpool_limits(limits=1):
        main(args.source, args.output)

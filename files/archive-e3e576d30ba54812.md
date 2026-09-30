# GCN/GAT internal validation - phase1-n62-primary-label-permutation-04

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `15639b564d2e3eaf4dbd4c83d5ba9c98277ae8aa0cd2e35ed1fe01a8e88222ae`.
- Fold SHA-256: `9959a7fe6ebf31b5747b02a01d1f581e4e8a594f95b98282bc98419c576a3d51`.
- Outer-test was evaluated once per fold after train-only epoch selection and full outer-train refit.
- No held-out labels were used for threshold selection or probability calibration.

## Repeat-level OOF results

| Model | Input | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|
| GCN | combined | 0.430 +/- 0.067 | 0.689 | 0.471 | 0.246 | 0.195 |
| GAT | combined | 0.453 +/- 0.079 | 0.718 | 0.463 | 0.253 | 0.230 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architectures and training settings were frozen as small-sample comparators, not tuned clinical models.
- GAT attention weights are model internals, not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

# GCN/GAT internal validation - phase1-n62-primary-label-permutation-03

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `9eb30ce0f5e56b7b03df305d197cba9805d4b70c4537d3cedf435736e8806e20`.
- Fold SHA-256: `2e848c43d2dd31a5d82c7b921ee29f3b81de3b592b62a871bc89d385944a0fdd`.
- Outer-test was evaluated once per fold after train-only epoch selection and full outer-train refit.
- No held-out labels were used for threshold selection or probability calibration.

## Repeat-level OOF results

| Model | Input | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|
| GCN | combined | 0.435 +/- 0.064 | 0.671 | 0.451 | 0.252 | 0.213 |
| GAT | combined | 0.431 +/- 0.109 | 0.691 | 0.405 | 0.261 | 0.225 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architectures and training settings were frozen as small-sample comparators, not tuned clinical models.
- GAT attention weights are model internals, not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

# GCN/GAT internal validation - phase1-n62-primary

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `e2a6fa729f6899c86a0829c58677d049c434188754bdf3063f0a4d609bfdf60e`.
- Fold SHA-256: `ce9e1d5db7b62f669d723cd1ff12cf353110be04517b2ec1ff01ea1261cb3792`.
- Outer-test was evaluated once per fold after train-only epoch selection and full outer-train refit.
- No held-out labels were used for threshold selection or probability calibration.

## Repeat-level OOF results

| Model | Input | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|
| GCN | combined | 0.511 +/- 0.083 | 0.751 | 0.532 | 0.247 | 0.180 |
| GCN | corr | 0.545 +/- 0.101 | 0.768 | 0.523 | 0.234 | 0.180 |
| GAT | combined | 0.575 +/- 0.049 | 0.779 | 0.543 | 0.246 | 0.188 |
| GAT | corr | 0.580 +/- 0.035 | 0.753 | 0.557 | 0.244 | 0.221 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architectures and training settings were frozen as small-sample comparators, not tuned clinical models.
- GAT attention weights are model internals, not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

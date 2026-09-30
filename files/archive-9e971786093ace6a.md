# GCN/GAT internal validation - phase1-n62-primary-label-permutation-01

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `cf9a599f2b23f90fee7a625dd129f9fae5f466683c4ed76da1f82ffe0f6f5f48`.
- Fold SHA-256: `23ee34a7e4c205e9f7c1cdca588aa6c91253856784562ef3b826440b7637f633`.
- Outer-test was evaluated once per fold after train-only epoch selection and full outer-train refit.
- No held-out labels were used for threshold selection or probability calibration.

## Repeat-level OOF results

| Model | Input | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|
| GCN | combined | 0.585 +/- 0.086 | 0.794 | 0.568 | 0.226 | 0.189 |
| GAT | combined | 0.544 +/- 0.052 | 0.751 | 0.571 | 0.242 | 0.197 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architectures and training settings were frozen as small-sample comparators, not tuned clinical models.
- GAT attention weights are model internals, not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

# GCN/GAT internal validation - phase1-n62-primary-label-permutation-05

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `14ea6ab6d4343759c9e08e47e861fd3b3ed3d2a159be84252b6e8a8245a6430f`.
- Fold SHA-256: `0bd0ed22732925e5cb3414cd3eeb8686a982f8647f970cebcf18c560c7f77cd6`.
- Outer-test was evaluated once per fold after train-only epoch selection and full outer-train refit.
- No held-out labels were used for threshold selection or probability calibration.

## Repeat-level OOF results

| Model | Input | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|
| GCN | combined | 0.500 +/- 0.041 | 0.743 | 0.465 | 0.242 | 0.175 |
| GAT | combined | 0.551 +/- 0.067 | 0.769 | 0.511 | 0.251 | 0.214 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architectures and training settings were frozen as small-sample comparators, not tuned clinical models.
- GAT attention weights are model internals, not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

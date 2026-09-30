# GCN/GAT internal validation - phase1-n64-sensitivity

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `4554a559488c960731346cdef39898114e255d4584c1461221111edaaa91bfa3`.
- Fold SHA-256: `38c5b9bcfddc9d95cd9e835d9df9201c40d424405bb09cc413b36a455f1a690b`.
- Outer-test was evaluated once per fold after train-only epoch selection and full outer-train refit.
- No held-out labels were used for threshold selection or probability calibration.

## Repeat-level OOF results

| Model | Input | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---|---:|---:|---:|---:|---:|
| GCN | combined | 0.560 +/- 0.043 | 0.763 | 0.535 | 0.239 | 0.206 |
| GCN | corr | 0.659 +/- 0.021 | 0.839 | 0.609 | 0.212 | 0.145 |
| GAT | combined | 0.639 +/- 0.090 | 0.824 | 0.592 | 0.220 | 0.193 |
| GAT | corr | 0.653 +/- 0.042 | 0.810 | 0.636 | 0.226 | 0.184 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architectures and training settings were frozen as small-sample comparators, not tuned clinical models.
- GAT attention weights are model internals, not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

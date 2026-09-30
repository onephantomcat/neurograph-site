# BrainHGT internal validation - phase1-n62-primary

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `e2a6fa729f6899c86a0829c58677d049c434188754bdf3063f0a4d609bfdf60e`.
- Fold SHA-256: `ce9e1d5db7b62f669d723cd1ff12cf353110be04517b2ec1ff01ea1261cb3792`.
- Upstream BrainHGT: `4f411fab1163e24f0b54e9cb398fbfe5928ce833`.
- Device: CPU.
- Outer-test was evaluated once per fold after train-only epoch selection and refit.

## Primary repeat-level OOF results

| Input | Parameters | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|
| combined | 124230 | 0.690 +/- 0.070 | 0.841 +/- 0.042 | 0.609 +/- 0.070 | 0.236 | 0.216 |
| corr | 124102 | 0.615 +/- 0.023 | 0.804 +/- 0.011 | 0.595 +/- 0.026 | 0.249 | 0.235 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architecture and fixed hyperparameters are a methods-development experiment, not a clinical model.
- Attention and community assignments are not causal mechanisms or validated biomarkers.
- The shared mask harmonizes node metrics, but FC was not re-extracted under that mask.
- Label-permutation and sensitivity checks must pass before assigning INTERNAL_VALIDATION readiness.

`Research use only - clinician review required`

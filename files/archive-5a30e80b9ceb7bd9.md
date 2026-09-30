# BrainHGT internal validation - phase1-n62-primary-label-permutation-05

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `14ea6ab6d4343759c9e08e47e861fd3b3ed3d2a159be84252b6e8a8245a6430f`.
- Fold SHA-256: `0bd0ed22732925e5cb3414cd3eeb8686a982f8647f970cebcf18c560c7f77cd6`.
- Upstream BrainHGT: `4f411fab1163e24f0b54e9cb398fbfe5928ce833`.
- Device: CPU.
- Outer-test was evaluated once per fold after train-only epoch selection and refit.

## Primary repeat-level OOF results

| Input | Parameters | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|
| combined | 124230 | 0.595 +/- 0.081 | 0.786 +/- 0.071 | 0.544 +/- 0.032 | 0.283 | 0.268 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architecture and fixed hyperparameters are a methods-development experiment, not a clinical model.
- Attention and community assignments are not causal mechanisms or validated biomarkers.
- The shared mask harmonizes node metrics, but FC was not re-extracted under that mask.
- Label-permutation and sensitivity checks must pass before assigning INTERNAL_VALIDATION readiness.

`Research use only - clinician review required`

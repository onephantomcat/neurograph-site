# BrainHGT internal validation - phase1-n62-primary-label-permutation-03

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `9eb30ce0f5e56b7b03df305d197cba9805d4b70c4537d3cedf435736e8806e20`.
- Fold SHA-256: `2e848c43d2dd31a5d82c7b921ee29f3b81de3b592b62a871bc89d385944a0fdd`.
- Upstream BrainHGT: `4f411fab1163e24f0b54e9cb398fbfe5928ce833`.
- Device: CPU.
- Outer-test was evaluated once per fold after train-only epoch selection and refit.

## Primary repeat-level OOF results

| Input | Parameters | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|
| combined | 124230 | 0.458 +/- 0.095 | 0.700 +/- 0.071 | 0.459 +/- 0.063 | 0.310 | 0.283 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architecture and fixed hyperparameters are a methods-development experiment, not a clinical model.
- Attention and community assignments are not causal mechanisms or validated biomarkers.
- The shared mask harmonizes node metrics, but FC was not re-extracted under that mask.
- Label-permutation and sensitivity checks must pass before assigning INTERNAL_VALIDATION readiness.

`Research use only - clinician review required`

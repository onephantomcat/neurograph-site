# BrainHGT internal validation - phase1-n62-primary-label-permutation-04

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `15639b564d2e3eaf4dbd4c83d5ba9c98277ae8aa0cd2e35ed1fe01a8e88222ae`.
- Fold SHA-256: `9959a7fe6ebf31b5747b02a01d1f581e4e8a594f95b98282bc98419c576a3d51`.
- Upstream BrainHGT: `4f411fab1163e24f0b54e9cb398fbfe5928ce833`.
- Device: CPU.
- Outer-test was evaluated once per fold after train-only epoch selection and refit.

## Primary repeat-level OOF results

| Input | Parameters | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|
| combined | 124230 | 0.473 +/- 0.015 | 0.713 +/- 0.028 | 0.471 +/- 0.009 | 0.291 | 0.266 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architecture and fixed hyperparameters are a methods-development experiment, not a clinical model.
- Attention and community assignments are not causal mechanisms or validated biomarkers.
- The shared mask harmonizes node metrics, but FC was not re-extracted under that mask.
- Label-permutation and sensitivity checks must pass before assigning INTERNAL_VALIDATION readiness.

`Research use only - clinician review required`

# BrainHGT internal validation - phase1-n62-primary-label-permutation-02

## Outcome

- Evidence: `OBSERVED`.
- Dataset SHA-256: `e91ba79ac2bb1f0a2003f1543af26649fef4ccf16c05feb4a4c27e465481ccee`.
- Fold SHA-256: `460f3527797f5a856fc17f93aa17beb280640ab878a7683d55c18679d8f50bb0`.
- Upstream BrainHGT: `4f411fab1163e24f0b54e9cb398fbfe5928ce833`.
- Device: CPU.
- Outer-test was evaluated once per fold after train-only epoch selection and refit.

## Primary repeat-level OOF results

| Input | Parameters | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|
| combined | 124230 | 0.439 +/- 0.078 | 0.678 +/- 0.032 | 0.444 +/- 0.063 | 0.333 | 0.315 |

## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architecture and fixed hyperparameters are a methods-development experiment, not a clinical model.
- Attention and community assignments are not causal mechanisms or validated biomarkers.
- The shared mask harmonizes node metrics, but FC was not re-extracted under that mask.
- Label-permutation and sensitivity checks must pass before assigning INTERNAL_VALIDATION readiness.

`Research use only - clinician review required`

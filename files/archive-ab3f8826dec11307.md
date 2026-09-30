# BrainHGT internal validation - phase1-n62-primary

## Outcome

- Evidence: `SMOKE_ONLY`.
- Dataset SHA-256: `e2a6fa729f6899c86a0829c58677d049c434188754bdf3063f0a4d609bfdf60e`.
- Fold SHA-256: `ce9e1d5db7b62f669d723cd1ff12cf353110be04517b2ec1ff01ea1261cb3792`.
- Upstream BrainHGT: `4f411fab1163e24f0b54e9cb398fbfe5928ce833`.
- Device: CPU.
- Outer-test was evaluated once per fold after train-only epoch selection and refit.


## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architecture and fixed hyperparameters are a methods-development experiment, not a clinical model.
- Attention and community assignments are not causal mechanisms or validated biomarkers.
- The shared mask harmonizes node metrics, but FC was not re-extracted under that mask.
- Label-permutation and sensitivity checks must pass before assigning INTERNAL_VALIDATION readiness.

`Research use only - clinician review required`

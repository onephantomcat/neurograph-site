# BrainHGT internal validation - phase1-n64-sensitivity

## Outcome

- Evidence: `SMOKE_ONLY`.
- Dataset SHA-256: `4554a559488c960731346cdef39898114e255d4584c1461221111edaaa91bfa3`.
- Fold SHA-256: `38c5b9bcfddc9d95cd9e835d9df9201c40d424405bb09cc413b36a455f1a690b`.
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

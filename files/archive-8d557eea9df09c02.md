# GCN/GAT internal validation - phase1-n62-primary

## Outcome

- Evidence: `SMOKE_ONLY`.
- Dataset SHA-256: `e2a6fa729f6899c86a0829c58677d049c434188754bdf3063f0a4d609bfdf60e`.
- Fold SHA-256: `ce9e1d5db7b62f669d723cd1ff12cf353110be04517b2ec1ff01ea1261cb3792`.
- Outer-test was evaluated once per fold after train-only epoch selection and full outer-train refit.
- No held-out labels were used for threshold selection or probability calibration.


## Interpretation limits

- Internal repeated cross-validation only; no external or prospective validation.
- Control status is the HC cohort while patient status is Study1/Study2; disease and study/cohort effects cannot be separated.
- Architectures and training settings were frozen as small-sample comparators, not tuned clinical models.
- GAT attention weights are model internals, not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

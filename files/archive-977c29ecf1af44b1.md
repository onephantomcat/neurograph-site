# Phase 1 n=62/n=64 GCN/GAT/BrainHGT internal-CV report

## Outcome

- All frozen technical gates passed: versioned data, exact 5x3 fold reuse, train-only preprocessing/epoch selection, outer-test-once evaluation, GCN/GAT/BrainHGT corr-only ablations, n64 sensitivity, and five full persisted-label permutations per graph model.
- Readiness: `INTERNAL_CV_COMPLETE_RESEARCH_ONLY`; this is not external, prospective, or clinical validation.
- Critical limit: all controls are HC and all patients are Study1/Study2. Disease-specific effects are not identifiable separately from cohort/study effects.

## Graph-model repeat-level OOF results

| Cohort | Model | Input | ROC AUC | PR AUC | Balanced accuracy | Brier | ECE |
|---|---|---|---:|---:|---:|---:|---:|
| phase1-n62-primary | GCN | combined | 0.511 +/- 0.083 | 0.751 | 0.532 | 0.247 | 0.180 |
| phase1-n62-primary | GCN | corr | 0.545 +/- 0.101 | 0.768 | 0.523 | 0.234 | 0.180 |
| phase1-n62-primary | GAT | combined | 0.575 +/- 0.049 | 0.779 | 0.543 | 0.246 | 0.188 |
| phase1-n62-primary | GAT | corr | 0.580 +/- 0.035 | 0.753 | 0.557 | 0.244 | 0.221 |
| phase1-n62-primary | BrainHGT | combined | 0.690 +/- 0.070 | 0.841 | 0.609 | 0.236 | 0.216 |
| phase1-n62-primary | BrainHGT | corr | 0.615 +/- 0.023 | 0.804 | 0.595 | 0.249 | 0.235 |
| phase1-n64-sensitivity | GCN | combined | 0.560 +/- 0.043 | 0.763 | 0.535 | 0.239 | 0.206 |
| phase1-n64-sensitivity | GCN | corr | 0.659 +/- 0.021 | 0.839 | 0.609 | 0.212 | 0.145 |
| phase1-n64-sensitivity | GAT | combined | 0.639 +/- 0.090 | 0.824 | 0.592 | 0.220 | 0.193 |
| phase1-n64-sensitivity | GAT | corr | 0.653 +/- 0.042 | 0.810 | 0.636 | 0.226 | 0.184 |
| phase1-n64-sensitivity | BrainHGT | combined | 0.697 +/- 0.043 | 0.834 | 0.618 | 0.229 | 0.212 |
| phase1-n64-sensitivity | BrainHGT | corr | 0.692 +/- 0.038 | 0.839 | 0.636 | 0.221 | 0.218 |

## Classical and nuisance controls

| Cohort | Feature set | Repeat OOF ROC AUC |
|---|---|---:|
| phase1-n62-primary | demographics | 0.422 +/- 0.087 |
| phase1-n62-primary | timepoints | 0.619 +/- 0.029 |
| phase1-n62-primary | pipeline_source | 0.306 +/- 0.057 |
| phase1-n62-primary | nuisance_combined | 0.521 +/- 0.016 |
| phase1-n62-primary | fc | 0.571 +/- 0.072 |
| phase1-n62-primary | nodes | 0.723 +/- 0.028 |
| phase1-n62-primary | combined | 0.628 +/- 0.036 |
| phase1-n64-sensitivity | demographics | 0.401 +/- 0.033 |
| phase1-n64-sensitivity | timepoints | 0.606 +/- 0.032 |
| phase1-n64-sensitivity | pipeline_source | 0.346 +/- 0.042 |
| phase1-n64-sensitivity | nuisance_combined | 0.517 +/- 0.043 |
| phase1-n64-sensitivity | fc | 0.589 +/- 0.097 |
| phase1-n64-sensitivity | nodes | 0.682 +/- 0.025 |
| phase1-n64-sensitivity | combined | 0.673 +/- 0.030 |

## Robustness

- Combined-input AUC change, n64 minus n62: `+0.007`.
- Combined minus corr-only AUC: `+0.075` (n62), `+0.004` (n64).
- BrainHGT five-permutation range: `0.439` to `0.595`; 0/5 at least as high as observed, add-one `p=0.167`.
- GCN five-permutation range: `0.430` to `0.585`; 1/5 at least as high as observed, add-one `p=0.333`.
- GAT five-permutation range: `0.402` to `0.551`; 0/5 at least as high as observed, add-one `p=0.167`.
- Five permutations have minimum attainable add-one p=1/6 and are only an implementation sanity check.

## Integrity anchors

- Contract SHA-256: `4e852cec00ee99ba27b4ac5970436919261230790502ab2bb14911673e3dfe51`.
- GCN/GAT extension contract SHA-256: `bb9f9548d254915e076bf9b9f8a5796a32912f9398cfd37b7d7c8ab58d7a2168`.
- GCN/GAT implementation SHA-256: `5d03e1d958810b51e5682072eb9ad4e3e6cadb567ffc255d7fb2e3f7c192ec2d`.
- Shared mask semantic SHA-256: `d78fd94587f58252fe9ae0ee8df1cb4477047999f5d5c2abc24ce42bb8ed8a92`.
- Upstream BrainHGT commit: `4f411fab1163e24f0b54e9cb398fbfe5928ce833`.
- n62 dataset/folds: `e2a6fa729f6899c86a0829c58677d049c434188754bdf3063f0a4d609bfdf60e` / `ce9e1d5db7b62f669d723cd1ff12cf353110be04517b2ec1ff01ea1261cb3792`.
- n64 dataset/folds: `4554a559488c960731346cdef39898114e255d4584c1461221111edaaa91bfa3` / `38c5b9bcfddc9d95cd9e835d9df9201c40d424405bb09cc413b36a455f1a690b`.

## Interpretation limits

- No external or prospective validation.
- Study/cohort and patient/control status are perfectly confounded.
- The shared mask harmonizes node metrics, but FC was not re-extracted under that mask.
- The small, imbalanced sample makes calibration and model-rank comparisons unstable.
- Attention/community outputs are not causal mechanisms or validated biomarkers.

`Research use only - clinician review required`

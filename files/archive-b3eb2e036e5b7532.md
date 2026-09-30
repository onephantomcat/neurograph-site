# OA AAL90 leakage-safe nested-CV baseline

## Outcome

- Dataset: 62 subjects (18 controls, 44 patients).
- Outer validation: RepeatedStratifiedKFold(5 folds x 3 repeats).
- Inner selection: StratifiedKFold(3 folds) grid search by ROC AUC.
- All preprocessing and feature selection occur inside training folds.
- Decision threshold is fixed at 0.5; held-out labels are never used to optimize it.

## Primary repeated nested-CV results

Primary values are the mean and sample SD across repeat-level OOF metrics. The final column is a secondary cross-fitted ensemble estimate with a conditional descriptive bootstrap interval.

| Feature set | Features | Repeat OOF ROC AUC | Repeat OOF balanced accuracy | Sensitivity | Specificity | Brier | Cross-fit ensemble AUC (conditional 95% interval) |
|---|---:|---:|---:|---:|---:|---:|---:|
| demographics | 2 | 0.422 +/- 0.087 | 0.428 +/- 0.062 | 0.523 | 0.333 | 0.257 | 0.346 [0.210, 0.499] |
| timepoints (nuisance) | 1 | 0.619 +/- 0.029 | 0.683 +/- 0.000 | 0.977 | 0.389 | 0.242 | 0.567 [0.383, 0.744] |
| source pipeline (nuisance) | 1 | 0.306 +/- 0.057 | 0.358 +/- 0.042 | 0.402 | 0.315 | 0.251 | 0.227 [0.114, 0.346] |
| combined nuisance | 4 | 0.521 +/- 0.016 | 0.569 +/- 0.063 | 0.750 | 0.389 | 0.238 | 0.545 [0.360, 0.735] |
| fc | 4005 | 0.571 +/- 0.072 | 0.529 +/- 0.042 | 0.652 | 0.407 | 0.297 | 0.578 [0.417, 0.730] |
| nodes | 360 | 0.723 +/- 0.028 | 0.655 +/- 0.015 | 0.644 | 0.667 | 0.235 | 0.745 [0.597, 0.883] |
| combined | 4365 | 0.628 +/- 0.036 | 0.600 +/- 0.106 | 0.644 | 0.556 | 0.272 | 0.646 [0.497, 0.785] |

## Interpretation limits

- This is a classical leakage-safety baseline, not the final GAT/BrainHGT comparison.
- This OA cohort is a methods-development sample and not an external neuropathic-pain validation cohort.
- Control status is the HC cohort while patient status is Study1/Study2, so the endpoint is perfectly confounded with study/cohort membership; imaging performance cannot be attributed specifically to disease.
- Scan length and QC attrition are also entangled with the endpoint.
- The shared mask harmonizes the four voxelwise node metrics; FC retains validated original/repair ROI-signal pipelines and was not re-extracted under that mask.
- The primary estimate is the mean and SD of repeat-level OOF metrics; the repeat-averaged cross-fit ensemble is secondary.
- The conditional subject bootstrap does not include split, model-refit, feature-family-selection, or external-cohort uncertainty.
- Feature families are reported in parallel; choosing the best observed family after evaluation would be optimistic.
- Class-balanced logistic probabilities are not calibrated clinical risks; 0.5 is only a fixed benchmark threshold.
- The fixed 0.5 threshold avoids the legacy optimistic threshold selection on held-out labels.
- The timepoints-only row is a nuisance diagnostic, not a candidate diagnostic model.

## Next model gate

Migrate GCN/GAT/BrainHGT only after this leakage-safe baseline and the AAL90 data contract pass independent review. The graph-model comparison must reuse the same subject IDs and outer folds, and any threshold or hyperparameter selection must remain inside training data.

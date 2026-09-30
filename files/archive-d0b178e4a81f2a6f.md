# OA AAL90 leakage-safe nested-CV baseline

## Outcome

- Dataset: 44 subjects (13 controls, 31 patients).
- Outer validation: RepeatedStratifiedKFold(5 folds x 3 repeats).
- Inner selection: StratifiedKFold(3 folds) grid search by ROC AUC.
- All preprocessing and feature selection occur inside training folds.
- Decision threshold is fixed at 0.5; held-out labels are never used to optimize it.

## Primary repeated nested-CV results

Primary values are the mean and sample SD across repeat-level OOF metrics. The final column is a secondary cross-fitted ensemble estimate with a conditional descriptive bootstrap interval.

| Feature set | Features | Repeat OOF ROC AUC | Repeat OOF balanced accuracy | Sensitivity | Specificity | Cross-fit ensemble AUC (conditional 95% interval) |
|---|---:|---:|---:|---:|---:|---:|
| demographics | 2 | 0.418 +/- 0.058 | 0.486 +/- 0.050 | 0.484 | 0.487 | 0.407 [0.223, 0.618] |
| timepoints (nuisance) | 1 | 0.637 +/- 0.033 | 0.715 +/- 0.000 | 0.968 | 0.462 | 0.573 [0.342, 0.799] |
| fc | 4005 | 0.747 +/- 0.024 | 0.751 +/- 0.024 | 0.656 | 0.846 | 0.757 [0.600, 0.886] |
| nodes | 360 | 0.816 +/- 0.018 | 0.767 +/- 0.034 | 0.688 | 0.846 | 0.861 [0.730, 0.960] |
| combined | 4365 | 0.743 +/- 0.042 | 0.731 +/- 0.034 | 0.667 | 0.795 | 0.752 [0.596, 0.878] |

## Interpretation limits

- This is a classical leakage-safety baseline, not the final GAT/BrainHGT comparison.
- The 44-subject OA cohort is a methods-development sample and not an external neuropathic-pain validation cohort.
- Study, scan length, and QC attrition are entangled; imaging performance may reflect acquisition/cohort effects.
- The primary estimate is the mean and SD of repeat-level OOF metrics; the repeat-averaged cross-fit ensemble is secondary.
- The conditional subject bootstrap does not include split, model-refit, feature-family-selection, or external-cohort uncertainty.
- Feature families are reported in parallel; choosing the best observed family after evaluation would be optimistic.
- Class-balanced logistic probabilities are not calibrated clinical risks; 0.5 is only a fixed benchmark threshold.
- The fixed 0.5 threshold avoids the legacy optimistic threshold selection on held-out labels.
- The timepoints-only row is a nuisance diagnostic, not a candidate diagnostic model.

## Next model gate

Migrate GCN/GAT/BrainHGT only after this leakage-safe baseline and the AAL90 data contract pass independent review. The graph-model comparison must reuse the same subject IDs and outer folds, and any threshold or hyperparameter selection must remain inside training data.

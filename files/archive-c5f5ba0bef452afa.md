> 历史运行报告；类别：technical_only。文中私有输入/预测/模型文件不随此归档公开。

# Leakage-audited transfer representation ablation

Evidence status: **SYNTHETIC_SMOKE_ONLY**.

| Method | Repeat OOF ROC AUC | Balanced accuracy | Brier score |
|---|---:|---:|---:|
| raw_combined_logistic | 0.531 +/- 0.000 | 0.438 +/- 0.000 | 0.286 +/- 0.000 |
| ssl_reconstruction_logistic | 0.375 +/- 0.000 | 0.438 +/- 0.000 | 0.381 +/- 0.000 |
| pain_prior_ssl_logistic | 0.406 +/- 0.000 | 0.500 +/- 0.000 | 0.376 +/- 0.000 |

## Leakage audit

Every self-supervised encoder was fitted on its current outer-training subjects only. Subject-list hashes and zero-overlap checks are recorded in `transfer_results.json`; every outer-test probability is in `transfer_predictions.tsv`.

## Interpretation limits

- The current OA endpoint is patient versus control, not neuropathic-pain severity or treatment trajectory.
- Patient/control status is perfectly confounded with study/cohort in this dataset.
- This is internal cross-validation, not independent disease/site/scanner validation.
- The pain-related ROI set is a hypothesis prior and must be interpreted only through the prespecified ablation.
- The reconstruction encoder is not MeTSK, contrastive learning, SCDA, or a clinical foundation model.
- Repeat-averaged OOF metrics are descriptive and do not quantify external-cohort uncertainty.
- No method may be selected post hoc from these parallel results without an untouched validation cohort.

> 历史运行报告；类别：technical_only。文中私有输入/预测/模型文件不随此归档公开。

# ABIDE external FC-only transfer experiment

Evidence status: **REAL_DATA_SMOKE_ONLY**.

| Method | Repeat OOF ROC AUC | Balanced accuracy | Brier score |
|---|---:|---:|---:|
| raw_fc_logistic | 0.655 +/- 0.059 | 0.598 +/- 0.058 | 0.247 +/- 0.023 |
| oa_internal_fc_ssl_logistic | 0.572 +/- 0.091 | 0.521 +/- 0.033 | 0.258 +/- 0.035 |
| abide_external_fc_ssl_logistic | 0.626 +/- 0.111 | 0.572 +/- 0.064 | 0.260 +/- 0.044 |
| abide_external_fc_ssl_oa_finetune_logistic | 0.645 +/- 0.096 | 0.645 +/- 0.091 | 0.246 +/- 0.037 |

## Leakage contract

ABIDE source IDs, each OA adaptation-fold ID list, each OA test-fold ID list, model hashes, scaler hashes, and zero-overlap checks are persisted in `external_transfer_results.json`. Subject-level OOF probabilities are in `external_transfer_predictions.tsv`.

## Interpretation limits

- ABIDE is an independent self-supervised source, not an external OA or pain validation cohort.
- The OA endpoint is patient versus control and remains confounded with study/cohort.
- This FC-only experiment does not use the four node metrics because ABIDE per-ROI functional-mask coverage failed the frozen node-feature gate.
- No ASD/control diagnosis field enters the source NPZ or reconstruction objective.
- Results are internal OA repeated cross-validation and cannot establish neuropathic-pain diagnosis or severity validity.
- The encoder is a reconstruction feasibility model, not MeTSK, SCDA, contrastive learning, or a foundation model.

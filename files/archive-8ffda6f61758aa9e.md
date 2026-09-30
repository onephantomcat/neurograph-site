> 历史运行报告；类别：technical_only。文中私有输入/预测/模型文件不随此归档公开。

# External FC-only transfer experiment

Evidence status: **REAL_DATA_SMOKE_ONLY**.
Source: **OpenNeuro ds005713 v2.0.2** (`[private identity]`).

Method IDs containing 'abide' are retained for compatibility with existing result tables. external_source.namespace and external_source.source_dataset are authoritative for source identity.

| Method | Repeat OOF ROC AUC | Balanced accuracy | Brier score |
|---|---:|---:|---:|
| raw_fc_logistic | 0.655 +/- 0.059 | 0.598 +/- 0.058 | 0.247 +/- 0.023 |
| oa_internal_fc_ssl_logistic | 0.596 +/- 0.069 | 0.537 +/- 0.074 | 0.242 +/- 0.015 |
| abide_external_fc_ssl_logistic | 0.436 +/- 0.062 | 0.480 +/- 0.056 | 0.281 +/- 0.013 |
| abide_external_fc_ssl_oa_finetune_logistic | 0.582 +/- 0.098 | 0.527 +/- 0.071 | 0.239 +/- 0.023 |

## Leakage contract

DS005713 source IDs, each OA adaptation-fold ID list, each OA test-fold ID list, model hashes, scaler hashes, and zero-overlap checks are persisted in `external_transfer_results.json`. Subject-level OOF probabilities are in `external_transfer_predictions.tsv`.

## Interpretation limits

- OpenNeuro ds005713 v2.0.2 is an independent self-supervised source, not an external OA or pain validation cohort.
- The OA endpoint is patient versus control and remains confounded with study/cohort.
- This FC-only experiment does not use four-node metrics; their source-specific feature-readiness contract must be established separately.
- No diagnosis, pain, or outcome field enters the source NPZ or reconstruction objective.
- Results are internal OA repeated cross-validation and cannot establish neuropathic-pain diagnosis or severity validity.
- The encoder is a reconstruction feasibility model, not MeTSK, SCDA, contrastive learning, or a foundation model.

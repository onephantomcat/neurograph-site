# 近期研究结果（2026-09-16—20）

原切空间仍为开发参照。低维、动态状态、头动敏感性与临床联合实验没有可靠的整体影像增益；分类与程度量化并行，v5仅作补充。

## 报告

- [ZAN处理终态与人工确认记录](../../docs/ZAN_TRAINING_READINESS_2026-09-16.md)
- [多来源迁移与时序增强](../../docs/MULTISOURCE_AUGMENTATION_RESULTS_2026-09-16.md)
- [现有队列疼痛评分回归](../../docs/EXISTING_DATA_SEVERITY_RESULTS_2026-09-16.md)
- [ZAN54分类](../../docs/ZAN_CLASSIFICATION_RESULTS_2026-09-16.md)
- [ZAN作为来源的迁移比较](../../docs/ZAN_SOURCE_TRANSFER_RESULTS_2026-09-16.md)
- [时序增强与两视图对比学习](../../docs/ZAN_AUGMENTATION_CONTRASTIVE_RESULTS_2026-09-17.md)
- [近期疼痛fMRI研究梳理](../../docs/RESEARCH_UPDATE_AND_PAIN_FMRI_LITERATURE_2026-09-20.md)
- [连接稳定性、解剖汇总与CPM](../../docs/LOWDIM_CONNECTIVITY_RESULTS_2026-09-20.md)
- [动态连接状态占比](../../docs/DYNAMIC_STATE_RESULTS_2026-09-20.md)
- [头动记录、临床字段与增量实验](../../docs/MOTION_CLINICAL_RESULTS_2026-09-20.md)

## 全部聚合指标与图表

- [20260916-multisource-augmentation / aggregate_metrics.csv](20260916-multisource-augmentation/aggregate_metrics.csv)
- [20260916-multisource-augmentation / paired_comparisons.csv](20260916-multisource-augmentation/paired_comparisons.csv)
- [20260916-zan-classification / aggregate_metrics.csv](20260916-zan-classification/aggregate_metrics.csv)
- [20260916-zan-source-transfer / aggregate_metrics.csv](20260916-zan-source-transfer/aggregate_metrics.csv)
- [20260917-zan-augmentation-contrastive / augmentation_metrics.csv](20260917-zan-augmentation-contrastive/augmentation_metrics.csv)
- [20260917-zan-augmentation-contrastive / augmentation_paired.csv](20260917-zan-augmentation-contrastive/augmentation_paired.csv)
- [20260917-zan-augmentation-contrastive / augmentation_per_seed.csv](20260917-zan-augmentation-contrastive/augmentation_per_seed.csv)
- [20260917-zan-augmentation-contrastive / contrastive_metrics.csv](20260917-zan-augmentation-contrastive/contrastive_metrics.csv)
- [20260917-zan-augmentation-contrastive / contrastive_paired.csv](20260917-zan-augmentation-contrastive/contrastive_paired.csv)
- [20260917-zan-augmentation-contrastive / contrastive_per_seed.csv](20260917-zan-augmentation-contrastive/contrastive_per_seed.csv)
- [20260917-zan-augmentation-contrastive / zan_augmentation.png](20260917-zan-augmentation-contrastive/zan_augmentation.png)
- [20260917-zan-augmentation-contrastive / source_contrastive.png](20260917-zan-augmentation-contrastive/source_contrastive.png)
- [20260920-lowdim-connectivity / classification_metrics.csv](20260920-lowdim-connectivity/classification_metrics.csv)
- [20260920-lowdim-connectivity / regression_metrics.csv](20260920-lowdim-connectivity/regression_metrics.csv)
- [20260920-lowdim-connectivity / paired_differences.csv](20260920-lowdim-connectivity/paired_differences.csv)
- [20260920-lowdim-connectivity / anatomical_roi_mapping.csv](20260920-lowdim-connectivity/anatomical_roi_mapping.csv)
- [20260920-lowdim-connectivity / classification_and_intervals.png](20260920-lowdim-connectivity/classification_and_intervals.png)
- [20260920-lowdim-connectivity / within_scan_stability.png](20260920-lowdim-connectivity/within_scan_stability.png)
- [20260920-dynamic-states / classification_metrics.csv](20260920-dynamic-states/classification_metrics.csv)
- [20260920-dynamic-states / regression_metrics.csv](20260920-dynamic-states/regression_metrics.csv)
- [20260920-dynamic-states / paired_differences.csv](20260920-dynamic-states/paired_differences.csv)
- [20260920-dynamic-states / dynamic_classification.png](20260920-dynamic-states/dynamic_classification.png)
- [20260920-motion-clinical / classification_metrics.csv](20260920-motion-clinical/classification_metrics.csv)
- [20260920-motion-clinical / regression_metrics.csv](20260920-motion-clinical/regression_metrics.csv)
- [20260920-motion-clinical / paired_differences.csv](20260920-motion-clinical/paired_differences.csv)
- [20260920-motion-clinical / clinical_constant_comparisons.csv](20260920-motion-clinical/clinical_constant_comparisons.csv)
- [20260920-motion-clinical / clinical_field_availability.csv](20260920-motion-clinical/clinical_field_availability.csv)
- [20260920-motion-clinical / field_dictionary.csv](20260920-motion-clinical/field_dictionary.csv)
- [research-update-2026-09-20 / lowdim_verification.json](lowdim_verification.json)
- [research-update-2026-09-20 / dynamic_verification.json](dynamic_verification.json)
- [research-update-2026-09-20 / motion_verification.json](motion_verification.json)

全部CSV按来源原样复制，保留所有候选及阴性结果。39/46/59行分别来自9月20日三轮比较，含复用参照，不能相加作为模型数。最新205个预测头、2820内层候选及460个状态模型已独立重拟合；旧参照本轮未重训。

只有聚合指标、方法和核验摘要公开；逐人表、标签、预测、模型、原始影像及远端路径不在本目录。

> 历史运行报告；类别：development_or_historical_evaluation。文中私有输入/预测/模型文件不随此归档公开。

# 固定 DS005713 encoder 的 SRPBS 大阪外部验证

> 预注册主要成功判据**未达到**。本结果是跨图谱近似外部验证，不是临床有效性证明。

## 主要结果

SRPBS 疼痛 43 人 vs 健康 29 人：固定 encoder AUC `0.370`，Raw FC AUC `0.316`，差值 `+0.054`；配对标签置换单侧 `p=0.2629`。

## 次要结果

疼痛 43 人 vs 全部无疼痛 39 人：固定 encoder AUC `0.408`，Raw FC AUC `0.346`。

## 方法边界

- DS005713 checkpoint、scaler、OA n62 训练集和分类器搜索范围在读取 SRPBS 结局前固定。
- SRPBS 仅用于一次推理；其 condition/VAS/SF-MPQ2 均未进入 encoder、特征选择或分类器拟合。
- BAL140 官方相关矩阵经概率 overlap 和相关矩阵投影近似为 AAL90；未获得 ROI 时序，不能视为共同图谱重算。
- 21 名官方左侧疼痛翻转者在 AAL90 层交换左右节点以恢复原生方向；官方方向另作敏感性分析。

## 结论限制

- BAL140 ROI time series were unavailable; AAL90 FC is a deterministic but lossy projection of official BAL correlations.
- The official left-pain image flip is approximately undone after AAL90 projection; atlas asymmetry prevents exact inversion.
- OA patient/control status is confounded with OA acquisition cohort and preprocessing provenance.
- SRPBS probabilities are not recalibrated on external labels; threshold metrics and Brier score therefore test transport as-is.
- This validates research discrimination only, not pain severity, diagnosis, or clinical utility.

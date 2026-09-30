> 原报告按形成时点保留；本次同步不重训，也不更新其中外部等待状态。

# 03_heads：完整结果与配对比较

生成时间：2026-09-13T16:27:50.653558+08:00。结果已独立回读；99/96均是开发队列，不能作为新医院验证。
区间为2000次按类别分层、按人配对重采样，保留5次重复；固定模型，不包含重拟合或多重比较校正。所有预定方法及方向保留。

## primary99

| 方法 | AUC [条件95%CI] | 准确率 | BA | 灵敏度 | 特异度 | Brier |
|---|---|---:|---:|---:|---:|---:|
| frozen_plain_bce | 0.627 [0.532, 0.721] | 57.98% | 58.08% | 59.57% | 56.60% | 0.240 |
| frozen_plain_auc | 0.637 [0.536, 0.731] | 60.00% | 60.11% | 61.74% | 58.49% | 0.238 |
| frozen_balanced_bce | 0.625 [0.531, 0.720] | 58.79% | 59.24% | 65.65% | 52.83% | 0.241 |
| frozen_balanced_auc | 0.637 [0.538, 0.733] | 59.39% | 59.78% | 65.22% | 54.34% | 0.239 |
| latent_logistic_plain | 0.624 [0.527, 0.712] | 59.39% | 59.15% | 55.65% | 62.64% | 0.254 |
| latent_logistic_balanced | 0.623 [0.526, 0.711] | 60.20% | 60.13% | 59.13% | 61.13% | 0.255 |
| latent_logistic_balanced_calibrated | 0.606 [0.511, 0.689] | 57.98% | 56.59% | 36.96% | 76.23% | 0.242 |
| latent_logistic_balanced_threshold | 0.623 [0.526, 0.711] | 58.79% | 59.04% | 62.61% | 55.47% | 0.255 |
| ref_raw_screened_logistic | 0.639 [0.545, 0.725] | 59.80% | 59.67% | 57.83% | 61.51% | 0.317 |
| ref50_screened_logistic | 0.619 [0.526, 0.705] | 58.99% | 58.97% | 58.70% | 59.25% | 0.258 |

| 对比（左减右） | ΔAUC [条件95%CI] | ΔBA | ΔBrier（越低越好） |
|---|---|---:|---:|
| frozen_balanced_bce − frozen_plain_bce | -0.001 [-0.010, 0.007] | 1.16% | 0.001 |
| frozen_plain_auc − frozen_plain_bce | 0.010 [-0.009, 0.030] | 2.03% | -0.002 |
| frozen_balanced_auc − frozen_balanced_bce | 0.012 [-0.006, 0.031] | 0.54% | -0.003 |
| frozen_balanced_auc − frozen_plain_auc | 0.000 [-0.006, 0.007] | -0.34% | 0.001 |
| latent_logistic_balanced − latent_logistic_plain | -0.000 [-0.003, 0.002] | 0.98% | 0.000 |
| latent_logistic_balanced_calibrated − latent_logistic_balanced | -0.018 [-0.042, 0.005] | -3.54% | -0.013 |
| latent_logistic_balanced_threshold − latent_logistic_balanced | 0.000 [0.000, 0.000] | -1.09% | 0.000 |

## sensitivity96

| 方法 | AUC [条件95%CI] | 准确率 | BA | 灵敏度 | 特异度 | Brier |
|---|---|---:|---:|---:|---:|---:|
| frozen_plain_bce | 0.608 [0.516, 0.705] | 58.54% | 58.30% | 55.45% | 61.15% | 0.241 |
| frozen_plain_auc | 0.615 [0.519, 0.711] | 60.42% | 60.31% | 59.09% | 61.54% | 0.241 |
| frozen_balanced_bce | 0.610 [0.517, 0.705] | 58.75% | 59.09% | 63.18% | 55.00% | 0.243 |
| frozen_balanced_auc | 0.616 [0.521, 0.713] | 59.38% | 59.84% | 65.45% | 54.23% | 0.242 |
| latent_logistic_plain | 0.637 [0.540, 0.734] | 60.21% | 59.63% | 52.73% | 66.54% | 0.256 |
| latent_logistic_balanced | 0.645 [0.546, 0.739] | 61.25% | 60.80% | 55.45% | 66.15% | 0.255 |
| latent_logistic_balanced_calibrated | 0.607 [0.521, 0.696] | 56.88% | 54.74% | 29.09% | 80.38% | 0.244 |
| latent_logistic_balanced_threshold | 0.645 [0.546, 0.739] | 57.71% | 57.99% | 61.36% | 54.62% | 0.255 |
| ref_raw_screened_logistic | 0.620 [0.529, 0.710] | 58.13% | 57.92% | 55.45% | 60.38% | 0.330 |
| ref50_screened_logistic | 0.637 [0.543, 0.732] | 60.83% | 60.56% | 57.27% | 63.85% | 0.254 |

| 对比（左减右） | ΔAUC [条件95%CI] | ΔBA | ΔBrier（越低越好） |
|---|---|---:|---:|
| frozen_balanced_bce − frozen_plain_bce | 0.002 [-0.006, 0.010] | 0.79% | 0.001 |
| frozen_plain_auc − frozen_plain_bce | 0.006 [-0.011, 0.025] | 2.01% | -0.001 |
| frozen_balanced_auc − frozen_balanced_bce | 0.006 [-0.011, 0.026] | 0.75% | -0.001 |
| frozen_balanced_auc − frozen_plain_auc | 0.001 [-0.008, 0.010] | -0.47% | 0.001 |
| latent_logistic_balanced − latent_logistic_plain | 0.008 [-0.004, 0.020] | 1.17% | -0.002 |
| latent_logistic_balanced_calibrated − latent_logistic_balanced | -0.038 [-0.068, -0.009] | -6.07% | -0.011 |
| latent_logistic_balanced_threshold − latent_logistic_balanced | 0.000 [0.000, 0.000] | -2.81% | 0.000 |

冻结头新实现使用缓存的固定表示；实数首折对原30轮实现的概率最大差5.96e-8，见helper_verification.json。阈值分支保持原概率，因此AUC不变；校准分支单独评估概率。

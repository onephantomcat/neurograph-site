# ABIDE→OA 标签置换检验

证据状态：**FORMAL_LABEL_PERMUTATION_TEST**。

这里把同一名受试者的标签在所有重复折中一起打乱；无标签表征只重建一次，
每次置换都会重新运行内部交叉验证、特征选择和逻辑回归。

| 比较 | 观察值 | 至少同样极端 | add-one p |
|---|---:|---:|---:|
| fixed_vs_raw_auc_delta | 0.0341 | 312/1000 | 0.3127 |
| fixed_vs_internal_auc_delta | 0.0328 | 357/1000 | 0.3576 |
| fixed_vs_raw_brier_improvement | 0.0135 | 670/1000 | 0.6703 |
| fixed_vs_internal_brier_improvement | -0.0168 | 184/1000 | 0.1848 |

## 如何解释

- A low-resolution run is an implementation sanity check, not a significance result.
- The test addresses association inside the frozen OA repeated-CV design, not external clinical validity.
- ABIDE remains a diagnosis-free self-supervised source and is not a pain validation cohort.
- The OA endpoint remains patient versus control and is confounded with the originating study/cohort.

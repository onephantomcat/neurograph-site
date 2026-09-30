# 固定 DS005713 encoder：确认性复现与 SRPBS 外部验证

## 技术结论

固定 encoder 在 n64 重叠敏感性队列复现了正方向，但独立 SRPBS 主要检验未通过；因此不能确认原探索性 OA 性能增益具有外部泛化。

## n64 预设稳健性复现

固定 encoder 平均 OOF AUC `0.793`，Raw FC `0.592`，平均差值 `+0.201`；`3/3` 重复为正。

该预设判据达到，但 62/64 人与 n62 探索队列重叠，不能视为独立复现。

## SRPBS 独立外部主要检验

疼痛 43 vs 健康 29：固定 encoder AUC `0.370`，Raw FC `0.316`，差值 `+0.054`，配对置换单侧 `p=0.2629`。

固定 encoder AUC 95% bootstrap 区间为 `[0.244, 0.498]`；差值区间为 `[-0.103, +0.211]`。预注册成功判据未达到。

## 证据边界

- The n64 result is a prespecified robustness replication, not independent evidence, because 62 of 64 people overlap the discovery cohort.
- The SRPBS fixed encoder ranked pain below healthy often enough to yield AUC 0.370; probability or label direction was not changed after seeing this result.
- The positive fixed-minus-Raw external delta was small, uncertain, and not significant under the preregistered paired test.
- BAL137-to-AAL90 projection is deterministic and passed numerical audits but remains a lossy substitute for common-atlas FC recomputation from time series.
- No clinical diagnosis, pain-severity, or deployment claim is supported.

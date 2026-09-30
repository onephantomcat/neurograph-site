# SRPBS 域适配启动记录（2026-08-20）

## 已复核的迁移学习结果

本轮以 ABIDE n=972 的冻结 FC 自编码器作为先前指定的主要来源路线。针对
`phase1-n62-primary`，它的完整 OOF AUC 为 `0.6044`，高于 OA-fold SSL 的
`0.5715`，增量为 `+0.0328`。但是 1,000 次受试者级标签置换的主要检验
add-one p 值为 `0.3576`；同时其 Brier 分数劣于 OA-fold SSL。因此这些结果只支持
“可继续研究的方向性信号”，不支持 ABIDE 迁移优于 OA-fold SSL 的显著性结论。

证据：

- `reports/abide-external-transfer-permutations/primary/20260810T012139Z/external_transfer_permutation_summary.json`
- `docs/ABIDE_TRANSFER.md`

## 本次 SRPBS-FC 审计

归档已经通过官方 MD5 校验并解包。最终只读审计位于：

```text
SRPBS_FC/audit/20260820T0636Z/
```

结论如下：

| 项目 | 结果 |
|---|---:|
| FC `.mat` 文件 / 元数据文件 | 34 / 34 |
| 受试者行数与相邻元数据匹配 | 34 / 34 |
| 140 ROI（9,730 边） | 20 |
| 93 ROI（4,278 边） | 7 |
| AAL116（6,670 边） | 7 |
| 已证明可输入 AAL90 编码器的文件 | 0 |

大阪疼痛队列 `OsakaU/BAL-Osaka_FC_NP_N82.mat` 有 82 行并与 82 行临床元数据
一致，但它是 140 ROI 的 BAL（BrainVISA Sulci Atlas 加三个合并的小脑区域）矩阵，
而不是 AAL90。它不能通过“取前 90 个 ROI”、按边数截断或补零接入当前模型。

## BAL-140 标签与映射证据状态

2026-08-24 已从本地只读 `ROITBL_BAL.mat` 生成新的可复核清单；原 MAT 为
47 MiB 体素图谱载荷，不在 Git 中再分发：

```text
reports/srpbs-bal140-roi-evidence/20260824/bal140_roi_order.tsv
reports/srpbs-bal140-roi-evidence/20260824/bal140_roi_evidence_summary.json
reports/srpbs-bal140-roi-evidence/20260824/README.md
```

只读契约检查确认 `MAP` 为 `91×109×91×140`，`ROI.id` 与 `NUM.all` 都严格为
1..140，`ROI.name` 与 `LAB.all` 给出 140 个一致且唯一的有序名称；第 138–140 项
明确为 `L.CB`、`R.CB`、`VERM`。因此 BAL 特征向量的名称与顺序缺口已经关闭。
派生摘要保存原 MAT 的摘要值，以防同名文件被替换；原 MAT 本身不提交。

这也意味着 AAL90 不能被当作名称替换：BSA 是沟裂分区，而 AAL90 是解剖区分区，
小脑也不在 AAL90 内。可复算的 crosswalk 必须同时保留原始 BSA/AAL 掩膜、重叠
规则和已认证的 `ROITBL_BAL.mat` 顺序。当前仍没有经过复核的 BAL→AAL90
空间重叠 crosswalk，因此 BAL140 FC 仍不能直接进入 AAL90 encoder。

## 正式下一步

1. 基于 BAL 与 AAL90 的实际空间掩膜定义重叠规则，生成 many-to-many 候选映射、
   覆盖率和未映射清单并人工复核；若能取得原始影像，优先重算共同 AAL90 FC。
2. 映射或共同图谱重算通过后，新增 `prepare_srpbs_source.py`，以 `SRPBS:<site>:<participant_id>`
   作为受试者命名空间，输出审计表和无标签 FC 输入。大阪的疾病、卒中和健康标签在
   ABIDE→SRPBS→OA 适配阶段不参与训练。
3. 实现 `run_multistage_external_transfer.py`：ABIDE 无标签预训练 → SRPBS 无标签
   重构适配 → 每个 OA outer-train 内的既有分类步骤。它必须复用已有 OA 固定折，
   outer-test 只用于推理。
4. 将 Raw FC、OA-fold SSL、固定 ABIDE、SRPBS-only 和 ABIDE→SRPBS 作为预先列出的
   对比；报告 OOF AUC、Brier 与校准，不依据最高观察到的 AUC 重定义主要比较。

选择这条顺序的原因是特征维度相同并不能保证脑区语义相同；错误映射会在形状和普通
运行测试都通过的情况下，把不同脑区的连接送入已训练编码器，从而得到无法解释的结果。

影像重算、空间映射、双编码器、网络级特征及外部验证的分路线实施细节见
[`SRPBS_INTEGRATION_DETAILED_PLAN_2026-08-23.md`](SRPBS_INTEGRATION_DETAILED_PLAN_2026-08-23.md)。

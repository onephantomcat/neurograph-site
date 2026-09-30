# SRPBS 临床定义与评估设计审计（2026-09-05）

> 10:52续作更新：剩余108例已授权，107例入队，[个体编号已省略]因240/239时点差异单独暂缓。NKN原始2名Healthy中1名已QC排除，续批没有新增NKN Healthy；下方站点×标签多折方案只是草案，不能保证外层/内层均有足够单元支持。G12改为进行中，正式划分待实际验证；原“数据范围未授权”描述为10:33历史。详见[续作说明](../20260905-clinical108/README.md)。

## 已确认的定义

- 归档 README 明确 `diag=0` 为 Healthy Control、`diag=5` 为 Pain、`diag=6` 为 Stroke。主分类据此定义 Pain 对 Healthy Control；Stroke 单列，不把它当无痛对照。
- 官方数据论文说明 Osaka University 与 CiNet 的慢性痛按 IASP 定义纳入，数据表将该组概括为 chronic pain/back pain。这个证据支持“慢性痛状态”分类，但不能把所有 Pain 人员进一步解释成同一病因或单一神经病理性亚型。
- 归档 README 只把 sup7、sup8 两列都命名为“VAS for pain”，没有给出量表端点和相对 MRI 的施测时间窗。现有数值范围也明显不同，因此不自动换算，不跨表合并回归。

来源：[ATR 数据说明](https://bicr-resource.atr.jp/srpbs1600/)、[Tanaka 等 2021 数据论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC8405782/)、归档原始 `README.txt` 及 `sup7.tsv`/`sup8.tsv`。

## 聚合审计结果

脚本对原始临床表、145行临床清单和当前数据包逐项连接，只输出聚合数量，不输出匿名被试 ID。

| 范围 | Healthy | Pain | Stroke | 合计 |
| --- | ---: | ---: | ---: | ---: |
| 原始 sup7 + sup8 | 68 | 67 | 10 | 145 |
| 当前已数值通过、人工确认并可加载 | 11 | 9 | 不适用 | 20 |

当前20例按站点/标签为 OSU 5/5、NKN 1/1、CIN 5/3（Healthy/Pain）。最小站点×标签单元只有1例，所以本批只支持真实数据链路 smoke，不支持可解释的正式性能估计。

连续量表保留原始值：

| 表 | Pain | VAS 有值 | VAS 观测范围 | SF-MPQ2 | Pain Duration |
| --- | ---: | ---: | ---: | ---: | ---: |
| sup7 | 43 | 43 | 2–100 | 43，范围3–204 | 无此列 |
| sup8 | 24 | 21 | 0–8 | 无此列 | 17 |

机器可读结果见 [clinical_design_audit.json](clinical_design_audit.json)。

## 后续正式评估候选设计

这是一份可执行候选设计，不是冻结协议；最终折数要等实际预处理/QC人数确定后计算。

1. 主分类使用受试者级重复嵌套交叉验证，按站点×标签分层；外层折数取最终非空站点×标签单元允许的最大值、上限5。所有标准化、缺失处理、混杂调整、特征选择、目标域自监督适配和阈值选择只在当前训练部分拟合。
2. 另报 sup7→sup8 与 sup8→sup7 两个不在被留出表上调参的分布转移敏感性结果。它们检验跨采集来源变化，不能替代新的独立队列验证。
3. 分类至少保留 nuisance-only、Raw FC、目标训练折内 SSL、固定外部/来源 encoder、来源加目标训练折适配。输出受试者级 OOF 概率、PR-AUC、ROC-AUC、Brier、校准及不确定性；如实保留阴性路线。
4. 混杂候选为站点/协议/扫描仪、年龄、性别、平均 FD 与 censor 比例。先做 nuisance-only 基线；不使用 VAS 或其他目标量表构造分类输入。
5. 连续结局只在 Pain 内分析：sup7 的 VAS 与 SF-MPQ2 分开建模；sup8 的 VAS 单独建模。结局缺失者从对应任务排除，不给 Healthy 人工赋0，也不根据观测范围推导换算公式。

## 当前边界与下一步

- G12 已完成“现有证据范围内”的标签字典、分表量表策略和评估候选设计；病因/亚型、两套 VAS 端点与施测时点仍是未解决元数据，不伪称已查明。
- G13 首批24例已终态并完成所有可用 PASS 的人工确认；G14 已完成20例真实 smoke 接入。smoke 只证明接口、折内适配和审计链路能运行，不输出模型优劣结论。
- 不启动其余108名新增对象或Stroke。若研究者另行授权扩产，先按实际QC终态重新计算可行折数，再进入G15正式分类；G16在量表文档补齐前仍保持分表分析。

复现命令：

```powershell
python operations/20260905-clinical-design/build_clinical_design_audit.py `
  --sup7 tmp/srpbs1600-20260903-sup7.tsv `
  --sup8 tmp/srpbs1600-20260903-sup8.tsv `
  --manifest operations/20260904-training-preparation/prepared-confirmed/clinical_manifest.tsv `
  --readme tmp/srpbs1600-20260903-README.txt `
  --output operations/20260905-clinical-design/clinical_design_audit.json

python -m unittest operations/20260905-clinical-design/test_build_clinical_design_audit.py
```

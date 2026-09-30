# 临床正式分类准备：99 人真实接入完成

2026-09-08，Asia/Shanghai。执行范围为计划 G12/G14/G15 的数据接入、质量检查和候选划分验证；正式性能评估尚未启动。

## 已执行

- 14:36 最新远端采集：107 例续批终态为 79 PASS / 28 科学排除，全部 79 已由研究者确认；累计 108 份有效 AAL90 NPZ 均已下载并实际加载验证。传输中断保留已下载材料，重试完成；未修改远端生产。
- 建立独立 `prepared-confirmed99/`：来源 9×90×90、临床目标 99×90×90（Healthy 53 / Pain 46）。来源与全部 145 人临床库存无重叠；35 科学排除、1 时点 HOLD、10 Stroke 未进入二分类目标。
- 14:40:10 运行 99 人真实数据 smoke：Raw FC、目标训练折 SSL、SRPBS 固定来源 SSL、来源加目标训练折适配，四方法共 396 条折外预测。全部训练 loss 有限；checkpoint 回读一致；固定来源 encoder 未改；来源/目标及适配/测试重叠均为零。
- Smoke 使用两外折/两内折、单 epoch，仅验证执行链；`REAL_DATA_SMOKE_ONLY`，不得用于性能优劣、临床效用或独立验证结论。

## 站点与划分

| 站点 | Healthy | Pain | 合计 |
| --- | ---: | ---: | ---: |
| CIN | 33 | 17 | 50 |
| NKN | 1 | 2 | 3 |
| OSU | 19 | 27 | 46 |

`audit_splits.py` 实际模拟 5 次重复、5 外折、3 内折。全 99 人站点×类别分层不可行：NKN 的稀疏类别不足。全 99 人按类别分层、OSU/CIN 96 人按站点×类别分层分别通过 25 外折和 75 内折检查；被试分离、每折双类、每人每重复恰一次外折测试均通过。这不代表跨站点独立验证。

正式主分析尚待研究者选择：建议保留全 99 人类别分层，另做 OSU/CIN 96 人站点分层敏感性分析；另一选择为以 96 人为主分析、NKN 只描述。不静默删除 NKN，也不按测试性能挑协议。

后续更新：研究者于9月8日确认全99主分析加OSU/CIN96敏感性方案。选择与实际分折已保存在`operations/20260908-source-pretraining/`；16:09完成三个独立来源及两条多阶段来源适配。上述“尚待选择”为14:40准备时点，不是当前阻塞。

## 临床与处理边界

年龄、性别、protocol、censor fraction、mean FD 在 99 人中均无缺失。仍需在正式评估保留 nuisance-only 对照与混杂审计；非缺失不代表无混杂。91 人沿用既有流程、8 人明确记录完整原 T1 无裁剪策略，应保留处理差异敏感性。

sup7 29 名 Pain 的 VAS 均有数值（2–100），SF-MPQ2 29 个（3–204）；sup8 17 名 Pain 的 VAS 15 个有值（0–8），2 个缺失。端点、施测时间窗未知，不能自动换算或合并回归，健康组不赋 VAS=0。

## 复跑与文件

- `collect_current.py`：读取远端有效状态并下载、核验数组，带三次有界重试。
- `prepare_current.py`：连接官方匿名主键并生成来源/目标包（新输出目录）。
- `audit_splits.py` / `test_audit_splits.py`：聚合审计、真实划分模拟及边界测试。
- `split-audit/audit.json`：聚合结果；`candidate_assignments_private.json`：仅本地的逐人候选划分，不入 Git。
- `cohort_audit.ipynb`：可复核伴随 Notebook，由 `build_notebook.py` 生成并顺序执行 Python 单元；环境无 nbformat/nbclient，未使用 Jupyter kernel。
- Smoke 原始输出：`[本机路径已省略]`；入口为仓库 `scripts/run_srpbs_clinical_smoke.py`，使用 `--real-data-smoke --seed 20260908`。

准备器 9 项、划分模拟 4 项、迁移训练器 16 项及网站 36 项共 65 项测试通过。8877 API 已确认99人接入/99人工及新报告端点200，项目计划已更新。原 9/20 smoke、旧失败、科学排除与 QC 确认全部保留。原始影像、FC 包、逐人清单/预测及权重不上传或提交 Git。

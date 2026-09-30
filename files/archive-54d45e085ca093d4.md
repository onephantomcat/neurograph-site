# 共同空间支持与队列候选证据（2026-07-27）

状态：`OBSERVED` 候选比较；`PROPOSAL` 方法学建议；**尚未选择最终队列或掩膜**。

> [!IMPORTANT]
> 本次没有修改 `qc_aal90_pass`，没有运行 `phase1`，也没有生成 n=62/63/64/65
> 数据集。候选掩膜只是决策证据，不能在负责人确认前作为正式分析输入。

## 结论先行

1. 旧审计只使用 3 名供体，最大 punch-out 偏移为 0.3531 z。本次自动纳入全部
   55 名满覆盖供体后，n=63/n=65 的最大偏移升至 **0.469859 z**。
2. 排除短序列 `[个体编号已省略]` 后，AAL90 缺口并集从 476 降至 328–333 个体素，最低
   ROI 覆盖率从 0.886503 升至 0.920000；但最大偏移仍有 **0.421411 z**。
3. n=63 与 n=65 的 AAL90 支持相同，但 n=65 的全脑共同掩膜额外少 175 个体素。
   这些体素仍会影响 ALFF/fALFF z 化、ReHo 邻域和 DC 全脑网络，所以两者不能
   被视为相同特征定义。
4. 结果继续否定逐图 `nanmean()` 和补 0。若采用共同支持方案，必须在选定掩膜
   下对全部拟纳入被试重新计算四类指标。

## 候选比较

共同参考脑掩膜为 70,831 个体素；AAL90 与该掩膜交集为 44,953 个体素。

| 候选 | control / patient | Study 1 / Study 2 | ROI 时间点 | 全脑共同体素 | 删除全脑 | 删除 AAL90 | 最低 ROI 覆盖 | punch-out 最大 / p95 |
|---|---:|---:|---|---:|---:|---:|---:|---:|
| n=62 primary，排除短序列 | 18 / 44 | 12 / 32 | 272×1, 275×7, 280×54 | 63,822 | 7,009 (9.895%) | 328 | 0.920000 | 0.421411 / 0.118713 z |
| n=63 primary | 18 / 45 | 12 / 33 | 224×1, 272×1, 275×7, 280×54 | 63,650 | 7,181 (10.138%) | 476 | 0.886503 | 0.469859 / 0.125932 z |
| n=64 sensitivity，排除短序列 | 18 / 46 | 13 / 33 | 272×1, 275×7, 280×56 | 63,641 | 7,190 (10.151%) | 333 | 0.920000 | 0.421411 / 0.118713 z |
| n=65 sensitivity | 18 / 47 | 13 / 34 | 224×1, 272×1, 275×7, 280×56 | 63,475 | 7,356 (10.385%) | 476 | 0.886503 | 0.469859 / 0.125932 z |

历史 n=44 已在 manifest、NPZ、quality report 和 baseline 中交叉核对为
13 control / 31 patient。n=63 中新增的 19 名 primary 修复者包含 5 control /
14 patient，因此总计为 18 / 45；这里不存在标签漂移。

最差 punch-out 个案：

- n=63/n=65：供体 `[个体编号已省略]`，`z_fALFF`，AAL label 20，
  652 个参考体素保留 578 个，均值偏移 `+0.469859 z`。
- 排除 `[个体编号已省略]` 的 n=62/n=64：供体 `[个体编号已省略]`，`z_ALFF`，AAL label 70，
  200 个参考体素保留 184 个，均值偏移 `-0.421411 z`。

`[个体编号已省略]` 和 `[个体编号已省略]` 都属于历史 n=44，因此最大值不是由 11 名未发布修复者
作为供体所造成；仅限历史 n=44 供体时，四个候选的最大值不变。

这些数值是诊断性支持域 punch-out，不是置信区间、总体效应或共同掩膜重算后的
最终差异。

## 掩膜指纹

语义哈希包含掩膜形状、仿射矩阵和布尔体素内容，不依赖 NIfTI 序列化细节。

| 候选 | semantic SHA-256 |
|---|---|
| n=62 primary，排除短序列 | `9dc077ad7027f15ae6dc35f356eb6c2e7a783b31629a2b83503d4636917454b1` |
| n=63 primary | `07f4c1d0b4a4ee96122b5462f323ede86b147b3999dafcf41fd3e900c5b7cde3` |
| n=64 sensitivity，排除短序列 | `d78fd94587f58252fe9ae0ee8df1cb4477047999f5d5c2abc24ce42bb8ed8a92` |
| n=65 sensitivity | `870a954d93e6c009812c6d0b494df605943204e918d57aacc42ff2a615caa194` |

## 方法学建议（待负责人确认）

### 如果保留现有 `ml_disposition`

`PROPOSAL`：

- 主分析 n=63；
- high-motion sensitivity n=65；
- 两者统一使用 **n=65 共同掩膜**重新计算，使 sensitivity 比较只改变队列成员，
  不同时改变特征定义；
- 排除 `[个体编号已省略]` 作为额外短序列敏感性分析，但仍复用同一掩膜以隔离成员效应。

### 如果把 `[个体编号已省略]` 移出主分析

`PROPOSAL`：

- 主分析 n=62；
- high-motion sensitivity n=64；
- 两者统一使用 **n=64 共同掩膜**重新计算；
- 含 `[个体编号已省略]` 的 n=63/n=65 作为独立的短序列敏感性分析族，并明确其掩膜不同。

第二种设计能提高最低 ROI 覆盖率并移除唯一 224 时间点被试，但它会改变当前
清单把 `[个体编号已省略]` 标为 primary 的既有决定，必须由负责人显式批准，不能由代码
自动完成。

## 审计契约与产物

脚本：

```text
scripts/assess_coverage_gaps.py
src/oa_rebuild/coverage.py
```

服务器派生产物：

```text
data/generated/coverage_candidates/
  candidate_members.tsv
  candidate_aal90_coverage.tsv
  candidate_punchout_shifts.tsv
  common_mask_n62_primary_no_short_run.nii
  common_mask_n63_primary.nii
  common_mask_n64_sensitivity_no_short_run.nii
  common_mask_n65_sensitivity.nii
  coverage_candidate_summary.json
```

关键产物 SHA-256：

```text
coverage_candidate_summary.json   416a91c90cf0ef98667147065a20edef4fe7ea13a99afb9f8f177f5b21a2568c
candidate_members.tsv             570a82ce6f9a65008911527c29f972ebf210c746ac159195a9d735673b9edbf2
candidate_aal90_coverage.tsv      57c8eefe60c2ea14424947cef2d38b7fb3a5a719dc6c47e55de6432622056631
candidate_punchout_shifts.tsv     2cff0e71ad74cc225a62598c92aa9e1cc3296e7b4800840e03d0d856e29b6772
```

源证据：

```text
subject_manifest.tsv              c3945739c791438ff3af71706053e9710f5ff294f5bc66716dd8dd2992fe5b57
cohort_terminal_states.tsv        ed65f2a15fed5c4ee5b903f67332dfbe198888edf53d39d4105a7dd5af393a74
reference brain mask              6bd4d5f59e2b3cd02388ed3aeda042236ccf18dedff0a6580f264c05a7fad09a
AAL atlas                         d5412c7da63f75e0c0a7cd314e948fb655ae6cd6bd2e936b72b7fa81304ccca5
```

验证：

- 合成/去标识端到端测试：3/3 通过；
- 服务器当前提交原测试：37/37 通过，70.96 秒；
- 304 张特征图逐一检查；
- 21 名修复被试的四张图有限支持一致，并与修复 4-D 输入一致；
- 55 名满覆盖供体全部进入 punch-out；
- 既有 `aal90_coverage.tsv` 内容哈希仍为
  `79711b1127ac76f871e3d9ea941dbcf3f992826f8949294c5a0b124f0d6ef3c1`；
- n=44 NPZ 与 baseline JSON 未覆盖。

下一步只能在负责人明确选择队列契约和对应统一掩膜后进行。之后才可把选择写入
版本化配置，接入 repair ROI/FC 数据源，并在选定掩膜下重新计算四类节点特征。

`Research use only - clinician review required`

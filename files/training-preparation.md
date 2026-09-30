# SRPBS 下一阶段：数据包与加载验证

> 最新更新：2026-09-04 22:24，新增4例已由用户明确确认；`prepared-confirmed`来源9人、临床目标20人已通过原生AAL90适配器实际训练，4方法/80条预测，标记REAL_DATA_SMOKE_ONLY。详情见[真实训练接入](TRAINING_SMOKE.md)。下方21:08的16人包与“未接入训练”均保留为历史，不是当前状态。

2026-09-04 21:08 远端快照。已完成实际数据准备，**尚未接入既有迁移训练器或运行训练 smoke**。

- 1,627 个 participants 通过官方匿名 ID 联接 sup7/sup8；145 个临床 ID 不重叠且都可映射，无 site/diag 冲突。
- 当前全部 29 个数值 PASS 的真实 NPZ 已下载并重新运行既有 13 项验证，加查 Fisher-z 对称性；全部通过。不只是读取既有报告。
- 来源包仅 9 名已人工确认的非临床对象，显式 `SRPBS1600:` ID。整体排除所有 145 名临床对象，包含临床 Healthy 和 Stroke；来源 NPZ 无诊断、疼痛、结局标签。
- 目标包仅 16 名此前已人工确认且数值通过者（Healthy 9、Pain 7；sup7 12、sup8 4）。另外 4 名数值 PASS 留在临床清单中，人工确认 PENDING，未进入目标包。
- 临床清单 145 行；已知科学 QC 排除 7 人（历史 1＋首批 6），其余按真实状态保留。Stroke 单列，不进主二分类。135 个原始二分类候选扣除 7 个已知排除后的上限为 128，不是最终样本数。
- sup7/sup8 的 VAS 保留原值及表来源，不缩放、不合并、缺失不插补；sup8 不生成不存在的 SF-MPQ2。full-original-T1 修复差异随有效目录记录。

## 已生成并实际加载

`prepared/source_fc.npz` 为 9×90×90；`prepared/target_fc.npz` 为 16×90×90。严格上三角对应 9×4,005 和 16×4,005；有限、对称、零对角，标签 1–90，来源/目标交集 0。临床标签仅在目标包中。

三个 TSV 分别为 `source_manifest.tsv`、`clinical_manifest.tsv`、`target_ready_manifest.tsv`。临床 TSV 含匿名个体的临床字段，仅保留在本地工作区；未对外发布。`verified_snapshot.json` 保存来源路径、有效尝试、原始/有效状态、确认范围、实时采集时间和逐例数组复核。

这两个包是原生 AAL90 准备产物，**不声称兼容旧 `external_transfer.load_external_fc_source`**：旧接口要求 AAL116 来源角色及不同元数据。不能把原生 AAL90 假标成 AAL116，也不能把临床目标假标成 OA。`[本机路径已省略]` 本轮未改动。

## 测试与复现

9 项测试覆盖官方 ID 唯一性、表冲突/缺失、全体临床来源隔离、科学排除/人工待审不进入目标、缺失值与量表分离、实际 FC 数组/ROI 标签/覆盖验证，以及缺少来源排除清单的拒绝。

```powershell
python operations/20260904-training-preparation/test_prepare_cohort.py
python operations/20260904-training-preparation/prepare_cohort.py --snapshot operations/20260904-training-preparation/verified_snapshot.json --metadata tmp --output operations/20260904-training-preparation/prepared-new
```

输出目录必须是新的；现有 prepared 结果不覆盖。`inputs_before_repair.json` 是修复科学排除尚未归并时的历史快照，不作最终计数依据。

## 尚需完成

研究者确认新增 4 例；核对 Pain 病因与 VAS 施测口径；原生 AAL90 来源/临床目标接入真实训练器；在训练前明确个体/站点划分，之后执行真实 smoke。当前未建折、未训练、未扩至剩余 108 名或 Stroke，不作性能或泛化结论。

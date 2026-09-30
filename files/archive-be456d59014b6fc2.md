# Phase 1 / BrainHGT 分析契约决定（2026-07-27）

状态：`PROPOSAL -> APPROVED FOR IMPLEMENTATION`

依据负责人在候选覆盖审计后要求继续完成 BrainHGT，本轮按以下契约实施：

1. 分析单位为受试者；端点为公开 ds000208 的 patient/control 二分类。
2. 主分析为 `phase1-n62-primary`：
   - 历史 n=44；
   - 加入 18 名非短序列、`ml_disposition=primary` 的 verified repair；
   - 排除唯一 224 时间点且 `short_run_flag=1` 的 `[个体编号已省略]`。
3. high-motion sensitivity 为 `phase1-n64-sensitivity`：
   - 在 n=62 上加入 `[个体编号已省略]`、`[个体编号已省略]`；
   - 仍排除 `[个体编号已省略]`。
4. n=62 与 n=64 共用 n=64 的共同有限体素掩膜，避免 sensitivity 比较同时改变
   特征定义。
5. 四类节点指标必须在该掩膜下对全部 n=64 被试重新计算；ROI 聚合使用
   `AAL90 label ∩ shared mask`，禁止 `nanmean()` 和补 0。
6. 外层验证固定为受试者级 5 折 × 3 次重复；经典基线与 BrainHGT 必须读取同一
   `fold_assignments.tsv`。
7. BrainHGT 不使用上游训练器。上游训练器逐 epoch 读取 test 指标且硬编码 CUDA，
   不满足本项目的防泄漏/CPU 契约。只复用固定 commit 的模型前向组件。
8. BrainHGT 超参数在查看新队列结果前固定于
   [`config/phase1-n62-n64.toml`](../config/phase1-n62-n64.toml)；outer-test 不用于
   早停、阈值或超参数选择。
9. 所有 n=62/n=64 产物与 n=44 并列保存，不覆盖旧 NPZ、manifest、折分配或报告。
10. 最高就绪度只能是内部验证；没有外部、前瞻性或临床验证。
11. 经典基线在查看结果前固定为 demographics、timepoints、source pipeline、
    combined nuisance、FC、四类节点指标和 FC+节点指标七组并列分析。
12. 稳健性检查在查看正式结果前固定为：主队列 combined-input BrainHGT 做 5 次
    全标签置换；每次按置换后的标签和固定 CV seed 重新生成分层 5×3 folds 并完整
    重训。该检查的最小 add-one p 值仅为 1/6，只作为实现 sanity check。
13. 共同掩膜统一的是四类体素级节点指标及其 ROI 聚合；FC 继续使用已验证的
    `dparsf_original` / `repair_v3` ROI signals 和 Fisher-z FC，不在共同掩膜下
    重新提取。报告必须把这一点列为限制，并保留 source-pipeline nuisance 对照。

不可消除的设计限制：18 名 control 全部来自 HC cohort，patient 全部来自
Study1/Study2，因此 patient/control 端点与 study/cohort 完全混杂。内部 CV
性能不能被解释为疾病特异效应。

关键共同掩膜：

```text
semantic sha256 d78fd94587f58252fe9ae0ee8df1cb4477047999f5d5c2abc24ce42bb8ed8a92
file sha256     3e874f4546dd1cd93002a62634be662451defd9e21c7692d2c456eaa2ffe9d69
brain voxels    63,641 / 70,831
AAL90 voxels    44,620 / 44,953
minimum ROI coverage 0.920000
```

科学边界：

`Research use only - clinician review required`

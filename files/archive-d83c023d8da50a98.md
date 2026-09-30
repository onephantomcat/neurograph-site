# SRPBS 申请与疼痛领域适配数据契约

本文档把“申请数据”和“数据获批后接入模型”分开。SRPBS-FC 归档现已下载并审计，
大阪元数据确认包含 43 名疼痛患者、10 名卒中后无疼痛患者和 29 名健康对照；当前仍未
确认本机存在可与这 82 人逐一对应的 SRPBS rs-fMRI NIfTI 影像。后续状态与分路线实施
细节以 `SRPBS_INTEGRATION_DETAILED_PLAN_2026-08-23.md` 为准。

## 1. 现在可完成的申请准备

官方数据使用申请表：
[`ApplicationForm_DataUsage_DRMD.pdf`](https://bicr-resource.atr.jp/var/www/webapp/bicrresource/bicrresource/staticfiles/pdf/ApplicationForm_DataUsage_DRMD.pdf)。

申请需要由符合条件的负责人/指导教师参与，并接受数据使用条款。每位实际接触
数据的成员都应进入授权范围。提交前准备：

- 指导教师/PI 姓名、单位、职务和联系方式；
- 项目英文标题与不夸大临床用途的研究摘要；
- 使用哪些模态、为什么需要、预计使用多久；
- 实际使用者名单；
- 本地加密存储、访问控制、备份和删除安排；
- 明确不尝试重新识别、不转发给未授权人员、不上传公开 Git 仓库。

申请表和批准文件可能含个人信息，应保存在受控的项目管理目录，不提交到本仓库。
Codex 可以协助检查填写内容，但不会代替 PI 接受条款或在缺少明确授权时提交申请。

## 2. 暂不冻结“43/10/29”人数

实施前计划把大阪站点描述为 43 例难治性神经病理性疼痛、10 例卒中无疼痛和
29 例健康对照。这个数字可作为申请阶段的候选范围，但必须在获批后用官方数据
字典、实际文件清单和纳排条件重新计算，分别报告：

1. 元数据总人数；
2. 有 FC 文件的人数；
3. 图谱和矩阵检查通过的人数；
4. 运动/质量门槛通过人数；
5. 最终进入每个实验臂的人数及排除原因。

不能为了匹配计划人数而静默删除、补齐或改标签。

## 3. 获批后的只读落盘结构

建议放在 Git 仓库之外：

```text
[本机路径已省略]
├── raw_readonly\              # 官方原文件，只读
├── documentation\             # 数据字典、许可版本；含个人信息的申请文件另行受控
├── manifests\                 # 文件路径、大小、SHA-256、下载日期
└── processed\
    ├── audit\                  # 纳排表与 QC
    └── fc_aal90_source\        # 仅在图谱契约通过后生成
```

第一步只生成清单，不改原文件：相对路径、字节数、SHA-256、来源页面、下载日期和
授权版本。受试者 ID 在模型包中使用 `SRPBS:<site>:<id>` 命名空间，避免与
`ABIDE1:`、`ds000208` 或医院 ID 偶然重合。

## 4. 必须先回答的图谱与 FC 问题

即使 SRPBS 提供预计算 FC，也不能看到“90×90”就直接接入：

- 图谱的正式名称、版本、ROI 数和 ROI 顺序是什么；
- 是否真的是当前 DPABI AAL90 的 1..90 顺序；
- FC 是 Pearson 相关、偏相关还是其他定义；
- 是否已经 Fisher-Z；对角线和负边如何处理；
- 使用哪段时间序列、是否滤波、是否全局信号回归；
- 每个站点的扫描长度、TR、运动指标和排除规则；
- 同一人是否有多次扫描，哪一次属于基线。

只有 ROI 名称与顺序一一核对后才能转换。若图谱不同，应建立显式映射或把所有
队列重算到共同图谱；不能“取前 90 列”、按矩阵大小猜顺序或对缺失 ROI 补零。

## 5. 标签怎样使用才不泄漏

推荐先做无标签疼痛领域适配：

```text
ABIDE 无标签 FC 预训练
        ↓
SRPBS 无标签 FC 重构适配
        ↓
ds000208 当前 outer-train 自监督适配/训练分类头
        ↓
ds000208 当前 outer-test 只推理
```

SRPBS 的疼痛/卒中/健康标签只用于描述纳排和后续明确声明的监督实验，不进入上面
这条无标签编码器训练。若以后要用 SRPBS 标签训练疼痛分类器，必须另建实验协议，
按受试者/站点划分训练和测试，并与医院最终测试完全隔离。

## 6. 获批后建议增加的实现

1. `scripts/prepare_srpbs_source.py`：读取官方元数据和 FC，输出审计表与无标签 NPZ；
2. 把当前 checkpoint 契约推广为来源无关格式，记录 `dataset_namespace`、图谱、
   预处理、文件清单和受试者集合哈希；
3. `scripts/run_multistage_external_transfer.py`：实现 ABIDE→SRPBS→OA；
4. 在同一 OA 固定折上比较 Raw、OA-fold SSL、ABIDE、SRPBS、ABIDE→SRPBS；
5. n=972 ABIDE 固定编码器作为预先指定主要来源，SRPBS 与多阶段路线先作为新增
   比较，不根据看过的最高 AUC 临时更改主要终点。

每条路线都要保存来源/适配/测试 ID 哈希、模型哈希、OOF 概率和零重叠检查。

## 7. HCP 与 OpenPain 暂缓

HCP Young Adult 可在当前
[`ConnectomeDB`](https://hcp-db.humanconnectome.org/) 入口申请/访问，官方项目页为
[`HCP Young Adult`](https://www.humanconnectome.org/study/hcp-young-adult)。它适合扩大
健康源预训练，但体量和跨图谱处理成本高于当前最需要的 SRPBS 疼痛领域适配。

OpenPain 需要遵守其
[`Data Usage Agreement`](https://www.openpain.org/html/agreement.html)，且不同队列需
逐个核对临床终点、扫描协议和图谱。1000 次主要 ABIDE→OA 正式置换已完成；HCP
与 OpenPain 仍放在 SRPBS 申请、接入和审计之后。

本流程只用于研究方法开发；ds000208 仍不是神经病理性疼痛外部验证，最终临床
问题必须由独立医院队列回答。

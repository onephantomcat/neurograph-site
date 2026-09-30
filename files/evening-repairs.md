# 2026-09-05 晚间两例修复与既有技能更新

## 当前状态

**修复完成，原队列已恢复。** 2026-09-05 20:35独立采集快照：续批107例有效 **7 PASS、7 EXCLUDED、0未解决技术FAILED、1 RUNNING、92 PENDING**，worker7268处理[个体编号已省略]，无halt_reason。累计全部SRPBS36数值/29人工，临床27/20；36份真实NPZ重新加载并通过原13项及Fisher-z对称检查。累计临床科学排除14，135人主分类候选上限121，仍含未处理及HOLD。7例数值PASS待人工确认，现有9来源/20目标smoke未改变。

| 修复对象 | 实际终态 | 核心证据 |
|---|---|---|
| [个体编号已省略] | 技术修复完成；科学EXCLUDED，20:31:22 | Old Segment 20:21:38正常完成，Stage1计算完成；唯一失败项为censor176/240（73.33%）>20%。没有继续Stage2/AAL90。完整177×203×155 T1逐体素/affine一致，旧2×2×2失败保留。 |
| [个体编号已省略] | 全流程数值PASS，20:34:12；人工PENDING | 复用完成Stage1，关键native/normalized BOLD及AutoMask逐字节一致；修正QC无插值重排掩膜，Stage1/Stage2/AAL90与独立NPZ验证通过。240×90时序、90×90 FC/Fisher-z、最小ROI覆盖1.0，censor17/240（7.083%）。 |

混杂警告未消除或隐藏：[个体编号已省略]矩阵240×204、秩204、条件数4.663×10⁹；[个体编号已省略]矩阵240×45、秩45、条件数8.017×10⁸。二者新旧Stage1配置全字段相同，Stage2只改变独立输出路径`Cfg.MaskFile`。

实际下载31份限定范围证据，见`evidence_manifest.json`；只查看5张PNG，2张TIFF原件当前工具不支持而未查看，详见[图像材料与观察](VISUAL_REVIEW.md)。没有新增研究者批准。

20:40:55收尾复核：原worker7268仍处理[个体编号已省略]，无halt；原账本14条/14唯一ID，[个体编号已省略]明确为CURRENT_REVALIDATED。当前gzip累计读取22,861,912,527字节；不是被试完成百分比。全部7份图像文件均由解码器验证可读，TIFF问题只是本次预览工具不支持。本机8877仍无监听，本轮未启动网站，已更新看板结构化数据和生成计划。

恢复前[个体编号已省略]在未受信号干扰的子进程中于20:12:00正常完成。首次控制器27377因误要求原生产脚本不存在的`exit_code.txt`停止在修复前；核对真实生产脚本、修正检查并通过4项测试后，以新日志启动控制器31355。20:15:33原父调度器退出并开始串行修复；20:34:15使用原入口恢复，20:34:17原队列以`CURRENT_REVALIDATED`复核[个体编号已省略]而非重算，保留前13条账本并推进[个体编号已省略]。首次控制器错误和修正方法已写入技能，旧日志保留。

## 授权与范围

- 用户要求修复当前[个体编号已省略]、[个体编号已省略]，并将问题、步骤和以往错误案例写入已有skill。
- 已单独获得暂停/恢复授权；只暂停调度父进程，让当前子进程完成，不中断正在计算的被试，不关闭原全局冲突检查。
- 原始输入、旧失败、已完成产物、原生产账本和科学QC标准保留。独立修复按subject_id替换有效视图，不增加人数。
- 不扩充107例队列、不处理Stroke或时点HOLD、不自动签署人工确认、不改变9来源/20目标smoke包或启动训练。

## 故障与修复

### [个体编号已省略]：异常T1裁剪输入

旧T1完整177×203×155，裁剪/分割输入却为2×2×2、384字节，Old Segment索引越界。复用已提取原始输入，在独立attempt中保留完整T1，逐体素与affine验证相同。`c`前缀仅兼容旧DPARSF选择器，明确未裁剪、未插值、未翻转。原Stage 1未完成，故重跑Stage 1、QC、Stage 2、QC和AAL90。

工程：`../20260905-sub2044-repair/prepare_repair.py`、`run_repair.sh`、`test_repair.py`。不宣称已经复现裁剪工具的根本触发原因。

### [个体编号已省略]：等价空间网格被当成漂移

240个realigned体积同为RAS 64×64×40；AutoMask/native regressed BOLD为LAS，WM/CSF为RAS，归一化产物彼此同网格。实测源掩膜到realigned索引变换为`x_source=63-x_reference`，覆盖相同物理空间。

只在QC进程内将掩膜数组和affine一起无插值重排；不改头文件、不改任何原影像、不放大1e-5容差。非整数移位、改变覆盖范围、尺度/剪切均拒绝。对全部realigned体积保留严格网格一致性检查；组织掩膜相交前也做物理对齐。

工程：`../20260905-sub1978-repair/lossless_grid.py`、`stage1_qc.py`、`prepare_completed_stage1.py`、`run_repair.sh`。复制并复用完成Stage 1，不重算；重新生成配置后仅执行后续Stage 2，最终验证关键Stage 1产物与原文件逐字节相同。

## 调度与恢复

`control_queue.py`核对PID、启动时间、精确命令及唯一被试子进程；只对父进程发SIGSTOP。`serial_repairs.py`等待子进程退出并出现终态文件，终止已暂停的父调度器，持有原有`worker.lock`串行运行两例。

完成子进程可能尚未写入账本。恢复使用原`start_remaining.py --run --resume`，先通过原只读加载器读取账本；原队列会复核已存在的[个体编号已省略]终态而不是重新计算，并跳过先前13个已入账被试。恢复仍须通过原磁盘、身份、范围及DPABI全局互斥检查。

远端证据位于`[本机路径已省略]`：`pause-intent.json`、`pause.json`、`subject-finished-before-parent-exit.json`、`repair-events.jsonl`、`resume.json`、`queue-resume.log`；各文件只有实际完成对应动作后才产生。

## 已验证内容

全部42项回归通过；可执行`python operations/20260905-evening-repairs/verify_delivery.py --output <新的本地JSON路径>`复跑。测试记录见`validation_results.json`及`validation_results_final.json`；更新任务记录/看板并重新导出计划后，又复跑22项看板测试通过。研究数据验证独立见`verified_snapshot_final.json`，不将代码测试当成影像结果证明。

- 生产容器中T1保留方案8项测试通过。
- 生产容器中网格对齐6项测试通过，覆盖全部48种有符号轴排列、逐体素物理坐标及错误网格拒绝。
- 远端Linux进程/终态4项测试通过：父进程暂停时子进程正常完成，PID复用/命令变化被拒绝；原生产脚本成功不需要独立修复特有的exit_code文件，缺少完成标记、退出状态冲突及信号终止被拒绝。
- 本机看板22项测试通过，新增两例精确修复归并、旧批准不继承、完整性失败不误归为科学排除。
- 技能检查脚本2项测试通过；实际发现旧脚本遗漏status/TSV账本/QC文件，修正规则后在真实历史修复证据目录验证成功。
- 技能候选与更新后的原本机skill均通过`quick_validate.py`及随技能交付的2项脚本回归；已在真实历史QC/修复证据目录执行只读发现。

## 既有技能与历史案例

既有本机skill：`[本机路径已省略]`。

完整原版备份：`skill-backup/process-datasets/`。候选：`skill-candidate/process-datasets/`。已更新原本机skill的SKILL.md、neuroimaging-lessons.md和inspect_dataset_run.py，新增srpbs-repair-cases.md及test_inspect_dataset_run.py；原其他文件保留。写入前逐文件核对原版未相对备份产生他人修改。未安装或修改远端skill。

新增`references/srpbs-repair-cases.md`，保留并整理：[个体编号已省略]异常裁剪未复现根因、[个体编号已省略]技术修好但35.83% censor排除、[个体编号已省略]完整T1恢复、克隆脚本残留旧被试路径、不同display仍触发全局并发暂停、未加载账本导致恢复检查错误、FC-only分支验证器错用、数组形状代替物理网格、修复重复计人/旧完成时间、人工批准范围、数值警告、时点/身份HOLD、特征语义/泄漏、容器PATH/解释器、代理502与本机网站停服、PowerShell管道、skill证据发现遗漏。

修复只改变已证明有问题的行为，继续保留原始失败和科学负结果。不增加新hash、冻结contract、baseline或额外流程gate。

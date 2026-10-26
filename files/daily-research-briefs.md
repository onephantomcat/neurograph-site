# 每日研究摘要

按原实验日期记录模型、数据、工作、性能变化和修改板块。AUC差值乘100后以百分点表示，旁列原论文baseline、任务条件和原文来源。项目自身的变化仍按本批实验对照计算。无可比结果不填0；回归保留原指标。参数与完整记录保留在备注。

## 2026-10-26　相同FC与79人划分下的SPD、线性FC和BrainHGT比较

- 模型：完整BrainHGT、影像单独SPD及固定线性FC
- 数据：原SRPBS79人，原三内折、相同FC输入，无协变量
- 工作：新增15个SPD与3个固定线性FC；15原BrainHGT直接复用，对齐神经更新与选轮机会。
- 性能变化：同一原79人开发池、3内折、5种子，新增15个影像单独SPD和3个固定线性FC，复用15个原BrainHGT。验证AUC：BrainHGT 0.6901、SPD 0.7510、线性FC 0.7184。SPD相对线性FC Δ+0.0326、4/5种子正向，相对BrainHGT Δ+0.0609、5/5正向；两项AUC条件区间均跨0。 SPD出现较好的点估计，但没有通过预定的主要AUC人员区间要求，结束本固定配置，不扩rank、C、学习率、参考或选轮搜索。当前证据不足以把主线直接换成SPD，也不足以证明BrainHGT稳定胜过轻量参照。BrainHGT继续作为会议要求的基础模型，FC/SPD用于定位其可检验的缺口。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：轻量参照、BrainHGT缺口与论文比较范围

仅SRPBS原79人反复开发范围，验证参与选轮，非99人完整OOF、独立H-test或临床验证。人员区间条件于固定保存模型，不覆盖重训、100次选轮或累计研究选择。历史SPD协方差+4协变量及M5结果、本轮相关FC影像单独结果、作者原论文任务分别报告，不组成统一论文排行榜。

<details><summary>参数、完整记录与依据</summary>

原标题：相同FC与79人划分下的SPD、线性FC和BrainHGT比较

原摘要：15新SPD＋3固定线性／15原BrainHGT复用／原79人／AUC主要区间跨0 同一原79人开发池、3内折、5种子，新增15个影像单独SPD和3个固定线性FC，复用15个原BrainHGT。验证AUC：BrainHGT 0.6901、SPD 0.7510、线性FC 0.7184。SPD相对线性FC Δ+0.0326、4/5种子正向，相对BrainHGT Δ+0.0609、5/5正向；两项AUC条件区间均跨0。

原结果：SPD出现较好的点估计，但没有通过预定的主要AUC人员区间要求，结束本固定配置，不扩rank、C、学习率、参考或选轮搜索。当前证据不足以把主线直接换成SPD，也不足以证明BrainHGT稳定胜过轻量参照。BrainHGT继续作为会议要求的基础模型，FC/SPD用于定位其可检验的缺口。

具体方法：15新SPD＋3固定线性／15原BrainHGT复用／原79人／AUC主要区间跨0

限制：仅SRPBS原79人反复开发范围，验证参与选轮，非99人完整OOF、独立H-test或临床验证。人员区间条件于固定保存模型，不覆盖重训、100次选轮或累计研究选择。历史SPD协方差+4协变量及M5结果、本轮相关FC影像单独结果、作者原论文任务分别报告，不组成统一论文排行榜。

下一步：本轮预算结束，保留全部5种子、模型及阴性，不追加拟合。BrainHGT仍是已确认会议方向的基础模型；后续修改须先从保存表示/预测找出具体且未被旧实验回答的判别缺口，不能仅因参数多、训练AUC高或这次SPD点估计更高就增删模块。独立验证与三临床终点仍须真实输入。

依据：fc-spd-matched-20261026、fc-spd-matched-20261026-summary、fc-spd-matched-20261026-comparison、fc-spd-matched-20261026-methods、fc-spd-matched-20261026-seeds、fc-spd-matched-20261026-differences、fc-spd-matched-20261026-models、fc-spd-matched-20261026-intervals、fc-spd-matched-20261026-plan、fc-spd-matched-20261026-verification、fc-spd-matched-20261026-decision、fc-spd-matched-20261026-papers

</details>

## 2026-10-26　BrainHGT逐阶段归因：主要突变位于32维监督压缩

- 模型：完整BrainHGT的15个原选中模型
- 数据：原SRPBS79人，原三内折和5种子
- 工作：零新增训练，11阶段165记录及两种固定无训练干预，3555模型—人前向。
- 性能变化：复用15个BrainHGT、原79人及3内折、5种子，新增训练和更新均0。FC入口线性embedding全部满秩；LSRA到社区encoder第一32维时，训练有效秩28.90→2.08、固定诊断分数训练AUC0.6510→0.9768，验证仅0.6403→0.6730。主要变化是训练分类几何在此急剧收缩，而非观察到验证诊断信息突然下降。 目前最值得约束的是社区encoder第一层的全脑监督压缩，不是先改OMST、社区均值或最终分类器。不能宣称已证明FC诊断信息在某层被删光：同一固定诊断分数跨层没有出现可靠验证AUC下降，反而在压缩处点值提高。先前强FC分数使用不同几何变换/读出，不能与这些固定统计量差值当作信息损失。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：第一32维压缩的归因与唯一后续方案

仅SRPBS原79人反复开发范围，来源已由当前验证选轮，非99人完整OOF或独立临床验证。阶段AUC来自固定训练类均值诊断统计，不是新优化探针或可与原模型直接排名的算法；训练留一只排除均值自身贡献，表示仍用过该人的训练标签。几何变化不等于诊断因果丢失，冻结旁路有分布改变。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT逐阶段归因：主要突变位于32维监督压缩

原摘要：15原模型／11阶段／两个固定干预／零训练／定位32维监督几何收缩 复用15个BrainHGT、原79人及3内折、5种子，新增训练和更新均0。FC入口线性embedding全部满秩；LSRA到社区encoder第一32维时，训练有效秩28.90→2.08、固定诊断分数训练AUC0.6510→0.9768，验证仅0.6403→0.6730。主要变化是训练分类几何在此急剧收缩，而非观察到验证诊断信息突然下降。

原结果：目前最值得约束的是社区encoder第一层的全脑监督压缩，不是先改OMST、社区均值或最终分类器。不能宣称已证明FC诊断信息在某层被删光：同一固定诊断分数跨层没有出现可靠验证AUC下降，反而在压缩处点值提高。先前强FC分数使用不同几何变换/读出，不能与这些固定统计量差值当作信息损失。

具体方法：15原模型／11阶段／两个固定干预／零训练／定位32维监督几何收缩

限制：仅SRPBS原79人反复开发范围，来源已由当前验证选轮，非99人完整OOF或独立临床验证。阶段AUC来自固定训练类均值诊断统计，不是新优化探针或可与原模型直接排名的算法；训练留一只排除均值自身贡献，表示仍用过该人的训练标签。几何变化不等于诊断因果丢失，冻结旁路有分布改变。

下一步：只建议下一轮在社区encoder第一32维压缩处加一个固定弱几何保持损失，不改网络、参数量、拓扑或读出；最多15个新模型，复用15原参照，原人/5种子/200更新/100选轮，lambda=0.1单配置。只用训练批次，完整保留阴性。该方案本轮未训练，当前新增拟合0。

依据：brainhgt-stage-attribution-20261026、brainhgt-stage-attribution-20261026-summary、brainhgt-stage-attribution-20261026-comparison、brainhgt-stage-attribution-20261026-stages、brainhgt-stage-attribution-20261026-seeds、brainhgt-stage-attribution-20261026-means、brainhgt-stage-attribution-20261026-geometry、brainhgt-stage-attribution-20261026-transitions、brainhgt-stage-attribution-20261026-interventions、brainhgt-stage-attribution-20261026-intervention-seeds、brainhgt-stage-attribution-20261026-intervention-means、brainhgt-stage-attribution-20261026-intervals、brainhgt-stage-attribution-20261026-differences、brainhgt-stage-attribution-20261026-verification、brainhgt-stage-attribution-20261026-plan、brainhgt-stage-attribution-20261026-next

</details>

## 2026-10-25　BrainHGT监督表征的固定线性读出

- 模型：完整监督BrainHGT＋固定线性读出
- 数据：SRPBS79人开发范围，三内折同训练/验证
- 工作：复用15监督主干，比较社区聚合前后30个257参数线性读出；主干不重训。
- 性能变化：冻结15个已有监督主干，完成30个257参数线性读出。原模型／聚合前／聚合后AUC分别为0.6901／0.6134／0.6761；主候选相对原模型ΔAUC -0.014072，0/5源初始化改善，条件95%区间[-0.0306,+0.0012]。 主候选ΔBrier +0.001934（2/5改善）、Δlogloss -0.012515（1/5改善）；聚合前Brier/logloss均5/5改善，但AUC均下降且各差值条件区间跨0，不把概率误差取舍改写为判别提升。 当前强正则线性读出未改善AUC，固定配置停止。不能把主要瓶颈只归给原分类器；聚合前读出更低，也不支持简单认定社区聚合丢失信号。两项解释均非唯一因果归因。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：监督表征与分类读出诊断

仅SRPBS原outer0训练79人的3内折，训练52/53、验证27/26，5源初始化共享人员。来源曾由当前验证选轮，存在累积开发偏差；非99人OOF或独立临床验证。原20外查询新评分0，原标签/QC、CoSpine13留出和TN14停止不变。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT监督表征的固定线性读出

原摘要：冻结既有监督主干，以同一种固定正则线性头比较社区聚合前后，不新增主干模块。 冻结15个已有监督主干，完成30个257参数线性读出。原模型／聚合前／聚合后AUC分别为0.6901／0.6134／0.6761；主候选相对原模型ΔAUC -0.014072，0/5源初始化改善，条件95%区间[-0.0306,+0.0012]。

原结果：当前强正则线性读出未改善AUC，固定配置停止。不能把主要瓶颈只归给原分类器；聚合前读出更低，也不支持简单认定社区聚合丢失信号。两项解释均非唯一因果归因。

具体方法：冻结既有监督主干，以同一种固定正则线性头比较社区聚合前后，不新增主干模块。

限制：仅SRPBS原outer0训练79人的3内折，训练52/53、验证27/26，5源初始化共享人员。来源曾由当前验证选轮，存在累积开发偏差；非99人OOF或独立临床验证。原20外查询新评分0，原标签/QC、CoSpine13留出和TN14停止不变。

下一步：停止当前固定线性读出，不追加正则、层位、池化或种子搜索。现有证据不足以只改分类器或绕过社区；下一轮需新的训练侧机制依据或可比较的新数据，本轮不自动启动后续拟合。

依据：brainhgt-linear-probe-20261025、brainhgt-linear-probe-20261025-summary、brainhgt-linear-probe-20261025-comparison、brainhgt-linear-probe-20261025-plan、brainhgt-linear-probe-20261025-means、brainhgt-linear-probe-20261025-seeds、brainhgt-linear-probe-20261025-metrics、brainhgt-linear-probe-20261025-curves、brainhgt-linear-probe-20261025-comparisons、brainhgt-linear-probe-20261025-verification、brainhgt-linear-probe-20261025-budgets、brainhgt-linear-probe-20261025-failures、brainhgt-linear-probe-20261025-reproduction、brainhgt-linear-probe-20261025-code

</details>

## 2026-10-25　BrainHGT固定位置监督表征混合

- 模型：完整BrainHGT＋固定位置监督表征混合
- 数据：SRPBS79人开发范围，三内折同训练/验证
- 工作：复用15原模型，只新增15个alpha1监督混合模型；同人、200更新/100验证机会，无新增模块参数。
- 性能变化：15个固定位置监督混合模型完成，15个原模型复用。原模型／混合训练AUC为0.6901±0.0167／0.7106±0.0153；ΔAUC +0.020421，5/5初始化正向，条件95%区间[-0.0035,+0.0471]。 ΔBrier -0.011336（3/5改善）、Δlogloss -0.109634（4/5改善）。训练AUC 0.9825→0.9588；末次200步验证AUC 0.6548→0.6622，末次是辅助结果，不替换选中模型主指标。 AUC在五个初始化中均提高，平均Brier与logloss也下降，出现一致的开发改善迹象；但人员条件ΔAUC区间仍跨0，尚不能认定稳定AUC收益。按拟合前条件结束当前配置，不追加混合强度、位置、轮数或种子搜索。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：端到端监督表征训练

仅SRPBS原outer0训练79人的3内折：52/53训练、27/26验证，seed0—4共享人员。验证参与100次选轮且已反复开发，非99人OOF或独立临床验证。原20外查询新评分0，原标签/QC、CoSpine13留出和TN14停止不变。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT固定位置监督表征混合

原摘要：固定社区均值位置、同批表征和目标联合混合，完整监督主干从头学习；15新模型与15旧参照同人同更新。 15个固定位置监督混合模型完成，15个原模型复用。原模型／混合训练AUC为0.6901±0.0167／0.7106±0.0153；ΔAUC +0.020421，5/5初始化正向，条件95%区间[-0.0035,+0.0471]。

原结果：AUC在五个初始化中均提高，平均Brier与logloss也下降，出现一致的开发改善迹象；但人员条件ΔAUC区间仍跨0，尚不能认定稳定AUC收益。按拟合前条件结束当前配置，不追加混合强度、位置、轮数或种子搜索。

具体方法：固定社区均值位置、同批表征和目标联合混合，完整监督主干从头学习；15新模型与15旧参照同人同更新。

限制：仅SRPBS原outer0训练79人的3内折：52/53训练、27/26验证，seed0—4共享人员。验证参与100次选轮且已反复开发，非99人OOF或独立临床验证。原20外查询新评分0，原标签/QC、CoSpine13留出和TN14停止不变。

下一步：停止当前固定监督表征混合，不追加alpha、层位、混合概率、轮数或seed。现有证据仍不足以指定某个模块为唯一瓶颈，后续须有新的机制或可比较数据依据，不顺次叠加旧失败配置。

依据：brainhgt-supervised-mixup-20261025、brainhgt-supervised-mixup-20261025-summary、brainhgt-supervised-mixup-20261025-comparison、brainhgt-supervised-mixup-20261025-plan、brainhgt-supervised-mixup-20261025-means、brainhgt-supervised-mixup-20261025-seeds、brainhgt-supervised-mixup-20261025-metrics、brainhgt-supervised-mixup-20261025-curves、brainhgt-supervised-mixup-20261025-curve-summary、brainhgt-supervised-mixup-20261025-mixing、brainhgt-supervised-mixup-20261025-comparisons、brainhgt-supervised-mixup-20261025-verification、brainhgt-supervised-mixup-20261025-budgets、brainhgt-supervised-mixup-20261025-failures、brainhgt-supervised-mixup-20261025-reproduction、brainhgt-supervised-mixup-20261025-code

</details>

## 2026-10-25　BrainHGT监督混合收益的稳健性复核

- 模型：完整BrainHGT原模型与监督混合模型
- 数据：SRPBS原79人三内折保存预测
- 工作：复用30模型的预测和3000条原轨迹；检查站点、人员贡献和选轮，不新增训练或前向。
- 性能变化：复用30个选中模型的保存预测与3000条旧曲线，新增拟合/前向均0。逐一省略一名验证人后，79/79次ΔAUC仍正，范围[0.0156,0.0259]；100个共同检查点有85个平均点差为正，固定200步ΔAUC +0.0074。 原选轮后ΔAUC +0.020421，全部100检查点AUC均值的差仅+0.005323。排序挽救139、损伤86次；46人正贡献、18人负贡献、15人为0。人均Brier仅34/79改善、45/79变差，平均改善不代表多数人受益。 当前正向点差不依赖某一位验证人，也并非只在最高AUC选中轮出现；但固定检查点增量较小、站点间方向不一致。原人员条件ΔAUC区间仍跨0，停止当前混合配置的决定不变，不据此升级为稳定收益或独立验证。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：保存预测的稳健性复核

事后描述性复核，仅原SRPBS outer0训练79人的固定预测，3内折×5初始化；2590配对和395分类观测均重复使用同一批人。省略人员/站点只重算已存预测，未按本次省略重新训练，不是重训LOOCV或留站点验证。原20外查询新评分0，QC/标签、CoSpine13留出和TN14停止不变。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT监督混合收益的稳健性复核

原摘要：仅保存预测的人员/站点敏感性与完整训练轨迹复核，不重新拟合。 复用30个选中模型的保存预测与3000条旧曲线，新增拟合/前向均0。逐一省略一名验证人后，79/79次ΔAUC仍正，范围[0.0156,0.0259]；100个共同检查点有85个平均点差为正，固定200步ΔAUC +0.0074。

原结果：当前正向点差不依赖某一位验证人，也并非只在最高AUC选中轮出现；但固定检查点增量较小、站点间方向不一致。原人员条件ΔAUC区间仍跨0，停止当前混合配置的决定不变，不据此升级为稳定收益或独立验证。

具体方法：仅保存预测的人员/站点敏感性与完整训练轨迹复核，不重新拟合。

限制：事后描述性复核，仅原SRPBS outer0训练79人的固定预测，3内折×5初始化；2590配对和395分类观测均重复使用同一批人。省略人员/站点只重算已存预测，未按本次省略重新训练，不是重训LOOCV或留站点验证。原20外查询新评分0，QC/标签、CoSpine13留出和TN14停止不变。

下一步：保留固定alpha1监督混合作为开发线索，结束同一验证集上的参数扩搜。真正验证稳定收益仍需未参与开发且任务可比较的人员；原79/99人新切分不能充当独立H-test。本轮不启动新的训练、原20外查询评分或重新寻找最佳轮数。

依据：mixup-robustness-20261025、mixup-robustness-20261025-summary、mixup-robustness-20261025-comparison、mixup-robustness-20261025-plan、mixup-robustness-20261025-seeds、mixup-robustness-20261025-pairs、mixup-robustness-20261025-pair-folds、mixup-robustness-20261025-sites、mixup-robustness-20261025-site-evaluations、mixup-robustness-20261025-transitions、mixup-robustness-20261025-influence、mixup-robustness-20261025-trajectory、mixup-robustness-20261025-windows、mixup-robustness-20261025-verification、mixup-robustness-20261025-failures、mixup-robustness-20261025-code

</details>

## 2026-10-25　现有人员能否支持独立诊断验证

- 模型：现有BrainHGT与诊断队列使用记录
- 数据：四个成熟队列与其余候选，15条分支
- 工作：核对历史预测覆盖、临床/分组/路径及当前QC；本轮训练和预测均0。
- 性能变化：现有成熟队列中，SRPBS99、ZAN54、Emo53、偏头痛132全员已有历史模型预测；SRPBS原20人也已使用。目前可直接用于未参与开发、任务可比较的独立诊断验证人数为0。 不是没有潜在新人员：DS005713现持有快照有135个旧33来源键以外、同时具临床/分组和rest路径的条目（97patient/38HC），其中33条在当前QC目录为23/10且全部待确认。它们仍需核清身份、既往使用及输入，不能写成135名或33名合格独立测试者。 音乐68次已全部终态：7数值通过、56QC未通过、5技术失败，四条件共同人0、患者模型执行0；本批未处理HC。OA仍8通过/19未通过、27待审核且纳入false。CoSpine13人留出只用于健康人实验热痛，不转作诊断验证。
- 修改板块：未开发人员与任务可比性核查

本轮仅元数据与历史使用核查，新训练/模型预测/MRI及FC数组读取/留出评分/新增QC纳入均0。不同病因的patient/HC可研究外部运输，不能直接等同同病种确诊验证；命名空间键不重合不证明生物身份独立。旧失败、原分区、标签、QC、TN14停止和CoSpine留出保持。

<details><summary>参数、完整记录与依据</summary>

原标题：现有人员能否支持独立诊断验证

原摘要：核对15条现有队列/分支、保存预测覆盖、原20人及当前候选QC与用途；不训练或评分。 现有成熟队列中，SRPBS99、ZAN54、Emo53、偏头痛132全员已有历史模型预测；SRPBS原20人也已使用。目前可直接用于未参与开发、任务可比较的独立诊断验证人数为0。

原结果：不是没有潜在新人员：DS005713现持有快照有135个旧33来源键以外、同时具临床/分组和rest路径的条目（97patient/38HC），其中33条在当前QC目录为23/10且全部待确认。它们仍需核清身份、既往使用及输入，不能写成135名或33名合格独立测试者。

具体方法：核对15条现有队列/分支、保存预测覆盖、原20人及当前候选QC与用途；不训练或评分。

限制：本轮仅元数据与历史使用核查，新训练/模型预测/MRI及FC数组读取/留出评分/新增QC纳入均0。不同病因的patient/HC可研究外部运输，不能直接等同同病种确诊验证；命名空间键不重合不证明生物身份独立。旧失败、原分区、标签、QC、TN14停止和CoSpine留出保持。

下一步：先对齐DS005713当前33条待确认记录的原person_id、首访视、分组、全部既往使用与QC输出来源；不重处理、不评分，也不恢复TN14。只有形成未参与开发且双类/输入可比的真实名单后，才考虑一次复用15原模型＋15混合模型的零新增训练外部评估；当前不执行。

依据：independent-readiness-20261025、independent-readiness-20261025-summary、independent-readiness-20261025-comparison、independent-readiness-20261025-plan、independent-readiness-20261025-cohorts、independent-readiness-20261025-usage、independent-readiness-20261025-verification、independent-readiness-20261025-limitations、independent-readiness-20261025-audit-plan

</details>

## 2026-10-25　DS005713原33条候选的人员与QC来源核对

- 模型：现有BrainHGT诊断验证候选，不运行模型
- 数据：DS005713原33人及其14关联随访
- 工作：只读核对人员/访视、7份保存成员清单、原覆盖报告和新旧审核来源。
- 性能变化：原33条候选最终可用0人、按原AAL90覆盖要求排除33人（23patient/10HC）。最低脑区覆盖为0.3700—0.9107，均低于原0.92要求；不执行上轮针对这33人的条件评估方案。 网页PENDING来自当前审核数据库，不能覆盖历史处置：33人原Stage1/2数值检查及2026-08-24研究者图像确认均有记录，但AAL90覆盖失败已明确排除。保留原确认和排除，不重新审批或降低阈值。 33人均为原人员表中的基线，另有14次明确映射到其中14人的随访，仍是33人；随访3次覆盖失败、11次自动QC排除。7份已核对的来源/监督/预训练及优化成员清单与这33人均无直接交集；完整跨库身份和全历史未开发证明仍未建立。
- 修改板块：人员身份与QC来源核查

仅只读已有配置、源路径/成员表、原报告、Git版本及SQLite；新增训练/前向/预测、MRI或FC数组读取、QC决定/训练纳入和专家报告均0。匿名键与访视对应不等于真实生物身份无重叠；QC明确排除33人不代表其他独立性缺口已解决。TN14及原全部停止状态保持。

<details><summary>参数、完整记录与依据</summary>

原标题：DS005713原33条候选的人员与QC来源核对

原摘要：只读核对原33条人员/访视、7份保存成员清单和QC四层来源，全部33已有AAL90覆盖排除。 原33条候选最终可用0人、按原AAL90覆盖要求排除33人（23patient/10HC）。最低脑区覆盖为0.3700—0.9107，均低于原0.92要求；不执行上轮针对这33人的条件评估方案。

原结果：网页PENDING来自当前审核数据库，不能覆盖历史处置：33人原Stage1/2数值检查及2026-08-24研究者图像确认均有记录，但AAL90覆盖失败已明确排除。保留原确认和排除，不重新审批或降低阈值。

具体方法：只读核对原33条人员/访视、7份保存成员清单和QC四层来源，全部33已有AAL90覆盖排除。

限制：仅只读已有配置、源路径/成员表、原报告、Git版本及SQLite；新增训练/前向/预测、MRI或FC数组读取、QC决定/训练纳入和专家报告均0。匿名键与访视对应不等于真实生物身份无重叠；QC明确排除33人不代表其他独立性缺口已解决。TN14及原全部停止状态保持。

下一步：结束这33人的独立验证准备，原条件方案对本33不执行；不靠随访、补零、删ROI或改变原覆盖要求恢复。其他102条路径候选和新来源本轮未审计，不预报其可用人数。下一步若继续，只能另行核查新的输入来源和真实独立性依据，先不训练或评分。

依据：ds005713-person-audit-20261025、ds005713-person-audit-20261025-summary、ds005713-person-audit-20261025-comparison、ds005713-person-audit-20261025-plan、ds005713-person-audit-20261025-reasons、ds005713-person-audit-20261025-usage、ds005713-person-audit-20261025-visits、ds005713-person-audit-20261025-qc-layers、ds005713-person-audit-20261025-verification、ds005713-person-audit-20261025-next

</details>

## 2026-10-25　DS005713剩余102候选的人员与输入QC核查

- 模型：现有诊断验证候选，不运行模型
- 数据：DS005713剩余102登记键及36关联随访
- 工作：只读人员/访视、原失败报告、文件存在和保存成员；不训练、预测或新读数组。
- 性能变化：剩余102个候选登记键（74patient/28HC）当前可用于独立验证0：100条已有原QC排除，2条patient为原跨人员身份重复HOLD。结合此前33条，原135候选为133条原QC排除、2条身份待核，可直接验证仍0。 2条HOLD记录涉及同一组跨人员重复BOLD对象，不能当作2名独立验证人，也没有合格HC可组成病例/对照测试集。文件路径存在、旧成员清单未命中，都不能解除原身份和QC限制。 102个基线BOLD及对应T1文件在服务器均可找到，本轮未新读头或数组。138个关联访视仍来自原102个登记键；36随访中31原自动QC排除、3原AAL90覆盖排除、2原重复访视HOLD，无现成替代输入。
- 修改板块：剩余候选身份与输入QC核查

仅读既有metadata、配置、源文件存在/大小、原报告、保存成员、Git/annex对象记录与SQLite；训练/前向/预测、MRI头/数组与FC数组读取、QC决定/纳入及专家报告均0。原阈值、原33排除、TN14与CoSpine留出保持；不把登记键或重复访视当作已证独立生物个体。

<details><summary>参数、完整记录与依据</summary>

原标题：DS005713剩余102候选的人员与输入QC核查

原摘要：只读核对剩余102键、138访视、原失败报告和保存成员，100原QC排除、2身份HOLD。 剩余102个候选登记键（74patient/28HC）当前可用于独立验证0：100条已有原QC排除，2条patient为原跨人员身份重复HOLD。结合此前33条，原135候选为133条原QC排除、2条身份待核，可直接验证仍0。

原结果：2条HOLD记录涉及同一组跨人员重复BOLD对象，不能当作2名独立验证人，也没有合格HC可组成病例/对照测试集。文件路径存在、旧成员清单未命中，都不能解除原身份和QC限制。

具体方法：只读核对剩余102键、138访视、原失败报告和保存成员，100原QC排除、2身份HOLD。

限制：仅读既有metadata、配置、源文件存在/大小、原报告、保存成员、Git/annex对象记录与SQLite；训练/前向/预测、MRI头/数组与FC数组读取、QC决定/纳入及专家报告均0。原阈值、原33排除、TN14与CoSpine留出保持；不把登记键或重复访视当作已证独立生物个体。

下一步：结束当前135候选池的独立诊断验证准备，原30权重条件评估不执行。2条身份HOLD需来源方澄清人员与扫描归属后才能重新讨论；当前不合并身份、不选一个登记冒充新患者、不恢复排除者，也不训练或评分。后续若继续，应另行核查新的合格来源。

依据：ds005713-remaining-audit-20261025、ds005713-remaining-audit-20261025-summary、ds005713-remaining-audit-20261025-comparison、ds005713-remaining-audit-20261025-plan、ds005713-remaining-audit-20261025-reasons、ds005713-remaining-audit-20261025-gates、ds005713-remaining-audit-20261025-usage、ds005713-remaining-audit-20261025-visits、ds005713-remaining-audit-20261025-cohorts、ds005713-remaining-audit-20261025-verification、ds005713-remaining-audit-20261025-decision

</details>

## 2026-10-25　新疼痛数据来源核查与小样本下载尝试

- 模型：现有BrainHGT候选，模型未运行
- 数据：DS008919候选；另核DS007907/DS008783
- 工作：读取三套官方元数据和完整清单，尝试两人小样本影像访问；当前403。
- 性能变化：核查3个新来源：DS008919有27名慢性腰痛患者、25名对照，基线BOLD与T1同时列出的候选为51名（27患者/24对照）。已取得三套根元数据及8份示例侧车；官方影像入口在本机与服务器均返回403，新增MRI下载0，可直接独立验证仍0。 DS008919值得保留为下一步数据候选；51名只是清单中的输入配对上限，尚无影像可读性、人员独立性或QC结论。DS007907只有PET/T1，DS008783为咀嚼肌定量MRI，均不适用于当前全脑静息FC模型。
- 修改板块：新来源可取得性与输入适用性

本轮仅下载和读取来源元数据、完整文件清单及示例侧车；MRI文件/头/数组、预处理、FC、训练、预测、QC决定与新增训练纳入均0。保留全部访问失败；原QC、标签、分区、TN14停止与CoSpine留出不变。

<details><summary>参数、完整记录与依据</summary>

原标题：新疼痛数据来源核查与小样本下载尝试

原摘要：3来源核查／1个静息FC候选／影像访问403／新MRI0／无训练预测 核查3个新来源：DS008919有27名慢性腰痛患者、25名对照，基线BOLD与T1同时列出的候选为51名（27患者/24对照）。已取得三套根元数据及8份示例侧车；官方影像入口在本机与服务器均返回403，新增MRI下载0，可直接独立验证仍0。

原结果：DS008919值得保留为下一步数据候选；51名只是清单中的输入配对上限，尚无影像可读性、人员独立性或QC结论。DS007907只有PET/T1，DS008783为咀嚼肌定量MRI，均不适用于当前全脑静息FC模型。

具体方法：3来源核查／1个静息FC候选／影像访问403／新MRI0／无训练预测

限制：本轮仅下载和读取来源元数据、完整文件清单及示例侧车；MRI文件/头/数组、预处理、FC、训练、预测、QC决定与新增训练纳入均0。保留全部访问失败；原QC、标签、分区、TN14停止与CoSpine留出不变。

下一步：当前三来源核查到此结束。优先解决DS008919官方影像403访问问题；取得文件后先完成2人技术可读性与原流程适配核查，再决定全量获取。未取得新影像前不启动预处理、模型训练或评分，不扩展模型参数搜索。

依据：new-source-download-20261025、new-source-download-20261025-summary、new-source-download-20261025-comparison、new-source-download-20261025-download、new-source-download-20261025-plan、new-source-download-20261025-verification

</details>

## 2026-10-25　BrainHGT监督混合的跨队列开发复核

- 模型：完整BrainHGT：15原模型＋15固定监督混合模型
- 数据：ZAN54、Emo53、偏头痛132，均已有开发史
- 工作：零新增训练，固定权重完成7170次评分；保存预测复算和人员配对区间。
- 性能变化：复用15原模型和15混合模型，零新增训练，完成7170次模型—人评分。ZAN54 0.4112→0.4303（Δ+0.0190，4/5种子正向）；Emo53 0.5918→0.5764（Δ-0.0155，2/5种子正向）；偏头痛132 0.6116→0.6133（Δ+0.0017，4/5种子正向）。 本配置未在三个队列同时满足AUC方向、至少4/5种子改善及概率误差不恶化的预定要求。原SRPBS开发改善不能直接推广到这些队列；停止当前固定混合策略的跨队列推广和追加适配。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：监督混合跨队列开发复核

三个队列均有既往开发/查询使用，本轮为事后跨队列开发复核。无新H-test、疼痛分级或治疗反应验证；三个病种分别报告，未证明跨库生物个体完全无重叠。源选轮不变、目标上不选参或校准、阈值固定0.5；原QC、标签、分区、TN14停止与CoSpine留出保持。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT监督混合的跨队列开发复核

原摘要：30现有模型／3已开发队列／7170评分／零新增训练 复用15原模型和15混合模型，零新增训练，完成7170次模型—人评分。ZAN54 0.4112→0.4303（Δ+0.0190，4/5种子正向）；Emo53 0.5918→0.5764（Δ-0.0155，2/5种子正向）；偏头痛132 0.6116→0.6133（Δ+0.0017，4/5种子正向）。

原结果：本配置未在三个队列同时满足AUC方向、至少4/5种子改善及概率误差不恶化的预定要求。原SRPBS开发改善不能直接推广到这些队列；停止当前固定混合策略的跨队列推广和追加适配。

具体方法：30现有模型／3已开发队列／7170评分／零新增训练

限制：三个队列均有既往开发/查询使用，本轮为事后跨队列开发复核。无新H-test、疼痛分级或治疗反应验证；三个病种分别报告，未证明跨库生物个体完全无重叠。源选轮不变、目标上不选参或校准、阈值固定0.5；原QC、标签、分区、TN14停止与CoSpine留出保持。

下一步：结束本次固定权重跨队列复核，保留所有种子和阴性，不追加混合强度、层位、阈值、校准或目标微调。后续模型研发须先有新的具体机制依据；独立验证仍须真实可访问、身份和任务可比且通过原QC的新输入。

依据：mixup-crosscohort-20261025、mixup-crosscohort-20261025-summary、mixup-crosscohort-20261025-comparison、mixup-crosscohort-20261025-cohorts、mixup-crosscohort-20261025-seeds、mixup-crosscohort-20261025-models、mixup-crosscohort-20261025-intervals、mixup-crosscohort-20261025-plan、mixup-crosscohort-20261025-verification、mixup-crosscohort-20261025-decision

</details>

## 2026-10-24　BrainHGT失败归因与下一轮样本量实验方案

- 模型：完整BrainHGT及七项已有适配
- 数据：SRPBS79人开发范围，三内折
- 工作：复用保存预测，核对训练与验证差距、错误重合、站点配对和人员不确定性。
- 性能变化：未新增AUC成绩。原训练快速饱和；同站点与跨站点配对表现接近，现有适配未解决泛化问题。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：保存结果归因与下一实验设计

该归因阶段没有新增训练或前向；随后两档训练人数实验已完成，参见新节点。原归因条件区间仍不覆盖重训和反复开发。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT失败归因与下一轮样本量实验方案

原摘要：只读复用120模型记录，独立人员79，新训练/前向/外查询评分0。 复用8种方法、120份保存模型记录。原模型第10轮训练AUC0.9990、验证0.6249；社区先验错误排序交并比0.9913；疼痛残差损伤210、挽救137个原排序。原模型同站点/跨站点配对AUC0.6952/0.6893。

原结果：主要瓶颈是当前监督表示在52/53名训练人上迅速记忆、向新人员泛化不足；尚不能把原因唯一归为参数量。社区改动几乎不改变错误排序，区域残差改动较大却净损伤原正确排序。同站点与跨站点配对AUC接近，不支持把站点当本轮首要解释；关联分析不排除站点、头动或未测混杂。

具体方法：只读复用120模型记录，独立人员79，新训练/前向/外查询评分0。

限制：SRPBS诊断开发，仅原outer0训练79人（37患者/42对照）、3内折、5初始化。120模型记录、3160条重复预测观测，不是3160名独立人员。全部来源检查点曾由当前内验证选轮；非99人完整OOF或独立验证。原20外查询新评分0，标签/QC、CoSpine13人留出和TN14停止不变。

下一步：下一轮只建议完整原BrainHGT的两档训练人数响应实验：26人与52/53人，保持原验证人、5初始化、200更新和100次验证机会；原15个全量模型复用，最多新15个半量模型。该方案尚未启动；本轮新训练、前向及外查询评分均为0。

依据：brainhgt-failure-attribution-20261024、brainhgt-failure-attribution-20261024-plan、brainhgt-failure-attribution-20261024-summary、brainhgt-failure-attribution-20261024-comparison、brainhgt-failure-attribution-20261024-means、brainhgt-failure-attribution-20261024-seeds、brainhgt-failure-attribution-20261024-metrics、brainhgt-failure-attribution-20261024-verification、brainhgt-failure-attribution-20261024-curves、brainhgt-failure-attribution-20261024-overlap、brainhgt-failure-attribution-20261024-sites、brainhgt-failure-attribution-20261024-intervals、brainhgt-failure-attribution-20261024-covariates、brainhgt-failure-attribution-20261024-concentration、brainhgt-failure-attribution-20261024-failures

</details>

## 2026-10-24　BrainHGT两档训练人数响应实验

- 模型：完整BrainHGT：两档独立训练人数
- 数据：SRPBS79人开发范围，三内折同验证
- 工作：复用全量模型，按相同更新次数训练固定半量子集，比较增加人员的影响。
- 性能变化：15个半量模型完成，15个原全量模型直接复用。26人／52或53人训练的验证AUC为0.6776±0.0210／0.6901±0.0167；全量−半量ΔAUC +0.012546，3/5初始化正向，人员条件95%区间[-0.0661,+0.0912]。 全量的平均AUC高于半量，但未满足拟合前的全部判断条件，增加训练人数是否有稳定帮助仍未明确。不能只凭平均值或最好种子认定样本量是唯一瓶颈，也不能由此断言更多数据无用。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：独立监督人数与固定训练预算

原SRPBS outer0训练79人诊断开发，三内折原验证27/26人不变，五初始化0—4。每折一个固定26人子集，非五次独立子集；不是99人OOF或独立临床测试。来源及新模型均在当前内验证100次机会选轮；区间不含重训、子集选择或反复开发偏差。原20外查询新评分0，原标签/QC、CoSpine13留出及TN14停止不变。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT两档训练人数响应实验

原摘要：新增15半量，复用15全量；无新模块、外查询评分或QC变更。 15个半量模型完成，15个原全量模型直接复用。26人／52或53人训练的验证AUC为0.6776±0.0210／0.6901±0.0167；全量−半量ΔAUC +0.012546，3/5初始化正向，人员条件95%区间[-0.0661,+0.0912]。

原结果：全量的平均AUC高于半量，但未满足拟合前的全部判断条件，增加训练人数是否有稳定帮助仍未明确。不能只凭平均值或最好种子认定样本量是唯一瓶颈，也不能由此断言更多数据无用。

具体方法：新增15半量，复用15全量；无新模块、外查询评分或QC变更。

限制：原SRPBS outer0训练79人诊断开发，三内折原验证27/26人不变，五初始化0—4。每折一个固定26人子集，非五次独立子集；不是99人OOF或独立临床测试。来源及新模型均在当前内验证100次机会选轮；区间不含重训、子集选择或反复开发偏差。原20外查询新评分0，原标签/QC、CoSpine13留出及TN14停止不变。

下一步：本两档固定实验结束，不追加人数档位、子集种子或超参数搜索。当前不能把样本量单独定为已证实的首要原因；后续仅凭新的具体数据或机制依据另立有限问题，不顺次叠加旧失败模块。

依据：brainhgt-sample-size-20261024、brainhgt-sample-size-20261024-summary、brainhgt-sample-size-20261024-comparison、brainhgt-sample-size-20261024-plan、brainhgt-sample-size-20261024-means、brainhgt-sample-size-20261024-seeds、brainhgt-sample-size-20261024-metrics、brainhgt-sample-size-20261024-curves、brainhgt-sample-size-20261024-curve-summary、brainhgt-sample-size-20261024-sites、brainhgt-sample-size-20261024-comparisons、brainhgt-sample-size-20261024-verification、brainhgt-sample-size-20261024-budgets、brainhgt-sample-size-20261024-failures、brainhgt-sample-size-20261024-reproduction

</details>

## 2026-10-23　BrainHGT标签平滑与社区原型调优

- 模型：完整BrainHGT
- 数据：SRPBS99原训练侧三内折
- 工作：分别加入标签平滑或解冻社区原型，与原模型比较。
- 性能变化：原AUC 0.6901；标签平滑约+0.26个百分点，解冻原型约−0.26个百分点。平滑降低logloss但Brier变差。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：分类训练与社区原型

仅内层开发比较，不能由少数种子或小幅点估计声称可靠泛化。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT标签平滑与社区原型调优

原摘要：分别检验训练过度自信和默认冻结原型；不重开旧Dice系数、固定HRF/FD或跨半程SSL。 30个新模型、15个已保存CPU参照完成比较。原模型／标签平滑／解冻社区原型的内层AUC为0.6901/0.6927/0.6876，logloss为0.8658/0.8291/0.8125；全部五种子和阴性差值保留。

原结果：仅训练标签平滑0.1对原参照ΔAUC +0.002564，4/5种子正向，Δlogloss -0.036696，ΔBrier +0.006836。 仅解冻2048个社区原型参数对原参照ΔAUC -0.002564，1/5种子正向，Δlogloss -0.053369，ΔBrier -0.005264。 本轮固定配置已结束，不按单个最好种子追加搜索。

具体方法：分别检验训练过度自信和默认冻结原型；不重开旧Dice系数、固定HRF/FD或跨半程SSL。

限制：SRPBS99诊断开发，仅原outer0训练79人的三个内折，训练52/53、验证27/26；五seed共享人员且验证参与选轮，非99人完整OOF、K-shot或独立临床验证。20名原外查询新评分0；原标签、QC、13人CoSpine留出与TN14停止不变。

下一步：当前两项设置没有同时出现至少4/5种子AUC改善、平均logloss与Brier不恶化的组合，停止这两个固定配置，不追加平滑强度或原型学习率搜索；后续调优需先有新的具体机制依据。

依据：brainhgt-bounded-tuning-20261023、brainhgt-bounded-tuning-20261023-summary、brainhgt-bounded-tuning-20261023-comparison、brainhgt-bounded-tuning-20261023-plan、brainhgt-bounded-tuning-20261023-means、brainhgt-bounded-tuning-20261023-seeds、brainhgt-bounded-tuning-20261023-metrics、brainhgt-bounded-tuning-20261023-verification、brainhgt-bounded-tuning-20261023-literature、brainhgt-bounded-tuning-20261023-failures、brainhgt-bounded-tuning-20261023-comparisons

</details>

## 2026-10-23　BrainHGT疼痛相关区域读出与排序适配

- 模型：BrainHGT冻结诊断源＋区域读出／排序适配
- 数据：SRPBS99原训练侧三内折
- 工作：比较疼痛文献脑区、全脑和固定对照脑区读出。
- 性能变化：疼痛脑区比原诊断模型AUC低2.91个百分点；比全脑高0.49、比固定脑区高1.99个百分点。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：脑区选择、分类读出与排序训练

未超过原诊断模型，胜过较弱对照不能证明总体改善。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT疼痛相关区域读出与排序适配

原摘要：冻结既有诊断监督源，在LSRA后比较文献区域、固定对照与全脑读出，同容量排序训练。 45个新增区域残差头、五seed完成，15个诊断监督源直接复用。原模型／全脑／对照区域／疼痛相关区域的内层AUC为0.6901/0.6562/0.6411/0.6611。

原结果：疼痛相关读出对复用原诊断模型／无新增读出ΔAUC -0.029090，1/5种子正向，Δlogloss +0.052350，ΔBrier +0.006551。 疼痛相关读出对全90区均匀读出＋排序ΔAUC +0.004884，2/5种子正向，Δlogloss -0.042747，ΔBrier -0.014163。 疼痛相关读出对固定对照6区读出＋排序ΔAUC +0.019902，4/5种子正向，Δlogloss -0.050739，ΔBrier -0.014076。 疼痛分支训练AUC 1.0000，不能由训练拟合或胜过较弱对照声称改善。

具体方法：冻结既有诊断监督源，在LSRA后比较文献区域、固定对照与全脑读出，同容量排序训练。

限制：SRPBS99诊断开发，仅原outer0训练79人的三个内折，训练52/53、验证27/26，五seed共享人员。来源检查点曾由当前内验证选轮，新头固定200步；非完整99人OOF、K-shot或独立临床验证。20名原外查询新评分0，原标签/QC、13人CoSpine留出与TN14停止不变。

下一步：疼痛分支尚未稳定优于原模型和两个匹配读出，停止当前固定区域残差/排序设置，不追加区域、瓶颈、步数或排序权重搜索。训练拟合好而验证下降的记录保留；后续结构改动需要新的具体依据。

依据：pain-regional-readout-20261023、pain-regional-readout-20261023-summary、pain-regional-readout-20261023-comparison、pain-regional-readout-20261023-plan、pain-regional-readout-20261023-means、pain-regional-readout-20261023-seeds、pain-regional-readout-20261023-metrics、pain-regional-readout-20261023-verification、pain-regional-readout-20261023-literature、pain-regional-readout-20261023-failures、pain-regional-readout-20261023-comparisons、pain-regional-readout-20261023-regions、pain-regional-readout-20261023-code、pain-regional-readout-20261023-reproduction

</details>

## 2026-10-22　SPDNet＋LieBN：同人同预算支持内比较

- 模型：SPDNet＋LieBN几何归一化
- 数据：SRPBS99；内训练每类5／10人（完整支持每类10／20人）
- 工作：保持共同人员和训练预算，引入流形归一化。
- 性能变化：AUC约−0.08／+0.22个百分点；两预算未同时满足继续条件，概率损失也变差。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 原论文 baseline：[LieBN，ICLR 2024原文](https://openreview.net/forum?id=okYdj8Ysru)。原文评估Radar／HDM05等任务，未报告SRPBS疼痛分类AUC baseline。 本地改动采用原AIM归一化层；当前变化的直接参照为本项目同支持、同预算的SPDNet，原论文任务数值不直接相减。
- 修改板块：几何网络归一化

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SPDNet＋LieBN：同人同预算支持内比较

原摘要：100个人级内分区、seed0–4、500个新模型；原500个SPD保存预测复用；全部种子与阴性保留 完成500个新模型、100000次更新，原500个轻量SPD模型不重训。K10支持内五成员AUC：轻量SPD 0.7088→LieBN 0.7080（Δ-0.0008）；logloss 0.632869→0.637450；K20支持内五成员AUC：轻量SPD 0.7472→LieBN 0.7494（Δ+0.0022）；logloss 0.606009→0.608670。

原结果：当前AIM LieBN候选未同时满足两预算的预定支持内继续条件，停止该候选，不开展外查询比较，也不据结果追加动量、几何度量、深度或权重搜索。

具体方法：100个人级内分区、seed0–4、500个新模型；原500个SPD保存预测复用；全部种子与阴性保留

限制：SRPBS99为既有诊断开发队列，46病例/53对照。每预算50个重叠内分区，不能当50个独立队列。K为完整支持每类人数，二折内训练总10/20人。外查询评分新增0；诊断AUC不替代扫描同期疼痛、治疗反应或临床验证。

下一步：保留现有轻量SPD主线；下一模型候选为已依据有效秩诊断预定的固定PCA8 CortexMAE神经头容量消融，仅支持内部比较，未在本轮启动。独立人员、临床真值与三终点缺口继续单列。

依据：spd-liebn-20261022、spd-liebn-20261022-summary、spd-liebn-20261022-comparison、spd-liebn-20261022-plan、spd-liebn-20261022-means、spd-liebn-20261022-seeds、spd-liebn-20261022-metrics、spd-liebn-20261022-repeats、spd-liebn-20261022-trajectories、spd-liebn-20261022-numerics、spd-liebn-20261022-verification、spd-liebn-20261022-recent、spd-liebn-20261022-recent-csv、spd-liebn-20261022-failures

</details>

## 2026-10-22　CortexMAE低维分类头：同人同预算容量消融

- 模型：CortexMAE＋PCA紧凑分类头
- 数据：SRPBS99；内训练每类5／10人（完整支持每类10／20人）
- 工作：对冻结表示降维，检验减少分类头容量是否有效。
- 性能变化：AUC下降0.32／0.64个百分点，Brier和logloss也变差，仍未超过SPD。
- 原论文 baseline：[CortexMAE，ICML 2026表2、表5](https://proceedings.mlr.press/v306/lane26a.html)。原文表2使用accuracy；ABIDE的parcel／flat／volume／FC为62.0%／61.4%／60.4%／59.8%。未报告SRPBS99、每类10／20标签的AUC baseline。 本项目选用表5所述A424变体；原文默认Schaefer400和flat-map主模型的准确率不能当成本地A424的AUC。
- 修改板块：表示降维与分类头容量

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CortexMAE固定PCA8头：同人同预算容量消融

原摘要：100个人级支持内分区、seed0–4；500新头，2500个原模型结果复用；全部种子与阴性保留 完成500个PCA8新头、100000次更新，原分类头和SPD保存结果复用。K10支持内五成员AUC：强正则原头0.6096→PCA8 0.6064（Δ-0.0032），轻量SPD 0.7088；K20支持内五成员AUC：强正则原头0.6600→PCA8 0.6536（Δ-0.0064），轻量SPD 0.7472。

原结果：固定PCA8在两个预算下的AUC均低于强正则原头，Brier和logloss均变差，且未达到轻量SPD。未满足预定支持内继续条件，停止本候选，不开展外查询或追加维度、L2、深度、融合权重搜索。

具体方法：100个人级支持内分区、seed0–4；500新头，2500个原模型结果复用；全部种子与阴性保留

限制：SRPBS99诊断开发队列，46病例/53对照；K为完整支持每类人数，二折内训练实际总10/20人。每预算50个重叠内分区，不能当独立队列。外查询新评分0。原HCP预训练来源/跨匿名库人员身份未知、DPABI处理域差异和QC局限保持；诊断AUC不替代MRI同期痛、疗效或临床验证。

下一步：保留现有轻量SPD；停止当前CortexMAE的PCA8头及追加容量/融合搜索。下一步优先补齐独立诊断验证队列和扫描同期痛、治疗随访的真实标签与时间对应，已有跨队列阴性结果分列；本轮未启动新队列或新模型。

依据：cortexmae-pca8-20261022、cortexmae-pca8-20261022-summary、cortexmae-pca8-20261022-comparison、cortexmae-pca8-20261022-plan、cortexmae-pca8-20261022-means、cortexmae-pca8-20261022-seeds、cortexmae-pca8-20261022-metrics、cortexmae-pca8-20261022-repeats、cortexmae-pca8-20261022-trajectories、cortexmae-pca8-20261022-numerics、cortexmae-pca8-20261022-verification、cortexmae-pca8-20261022-recent、cortexmae-pca8-20261022-recent-csv、cortexmae-pca8-20261022-failures

</details>

## 2026-10-22　BrainHGT社区先验适配：同人同预算有限实验

- 模型：完整BrainHGT＋社区先验适配
- 数据：SRPBS99原训练侧三内折
- 工作：学习轻量社区先验修正，并与原模型和打乱对照比较。
- 性能变化：AUC 0.6901→0.6905，约+0.04个百分点；对打乱对照约+0.03个百分点，未达继续条件。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：脑解剖先验与社区分配

内层选轮结果有乐观偏差；不视为99人折外成绩。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT社区先验适配：同人同预算有限实验

原摘要：SRPBS99原outer0三个内折、五种子、三组CPU匹配，新增16参数社区先验基适配。 45个模型、五seed、4500轮完成。原完整模型/真实方向适配/乱序对照的内层AUC分别为0.6901/0.6905/0.6902；真实方向相对原模型ΔAUC +0.0004，相对乱序+0.0003。

原结果：未满足拟合前的继续条件，停止当前16参数先验适配，不看新外查询，不追加rank/强度/学习率搜索。

具体方法：SRPBS99原outer0三个内折、五种子、三组CPU匹配，新增16参数社区先验基适配。

限制：SRPBS99诊断开发，仅原outer0外训练79人的三个内折，训练52/53、验证27/26；五seed共享人员，验证参与选轮，非OOF、非K-shot、非独立H-test。原外查询20人新评分0；无MRI同期痛、治疗反应或新增专家临床验证。

下一步：保留完整模型、全部种子和本次阴性；优先真实状态痛输入/独立诊断或随访终点可用性，有新机制依据前不重开本先验系数搜索。

依据：community-prior-20261022、community-prior-20261022-summary、community-prior-20261022-comparison、community-prior-20261022-plan、community-prior-20261022-means、community-prior-20261022-seeds、community-prior-20261022-metrics、community-prior-20261022-verification、community-prior-20261022-literature、community-prior-20261022-failures

</details>

## 2026-10-22　报告前时间可靠性与试次疼痛读出

- 模型：固定HRF响应＋Ridge，FD加权与等权参照
- 数据：CoSpine 4人、60热痛试次
- 工作：比较完全早于评分的响应估计，并检查删帧可靠性。
- 性能变化：使用MAE：等权1.0072、FD加权1.0088，增加0.0016；未优于等权或乱序。
- 修改板块：任务响应估计与时间可靠性

仅健康实验热痛，短窗删帧不稳定，不能当连续临床疼痛预测。

<details><summary>参数、完整记录与依据</summary>

原标题：报告前时间可靠性与试次疼痛读出

原摘要：CoSpine原4人60试次、报告前7–8真实帧、三种HRF响应同维度比较；15标签为主，5/10标签全部保留。 4人60次热痛试次、236次唯一Ridge求解完成，五seed的300条记录全部保留。满预算共同协变量/等权响应/FD加权/乱序/FC的MAE为1.0168/1.0072/1.0088/1.0078/1.0144。

原结果：FD加权未优于等权或乱序，删单帧最大预测变化中位数仍约0.58个PR点，未满足原定继续条件，停止这一固定HRF/FD设置。

具体方法：CoSpine原4人60试次、报告前7–8真实帧、三种HRF响应同维度比较；15标签为主，5/10标签全部保留。

限制：4名健康开发成员，三人训练、一人留出；PR0–10是4秒刺激后的试次报告，并非MRI逐时刻患者疼痛。每窗7–8个实测帧、最晚源距报告至少1.112秒；独立刺激时钟、畸变/生理校正和局部配准限制保持。13人研究留出未读，专家/QC变更/独立临床验证0。

下一步：保留全部种子与本次阴性，停止当前短窗HRF/FD适配；下一步只核对能提供更长报告前采集、独立刺激时钟或真实患者MRI同期评分的输入，不用现有13人留出或调参追分。

依据：temporal-reliability-20261022、temporal-reliability-20261022-summary、temporal-reliability-20261022-comparison、temporal-reliability-20261022-plan、temporal-reliability-20261022-means、temporal-reliability-20261022-seeds、temporal-reliability-20261022-metrics、temporal-reliability-20261022-verification、temporal-reliability-20261022-literature、temporal-reliability-20261022-failures、temporal-reliability-20261022-timing、temporal-reliability-20261022-stability、temporal-reliability-20261022-comparisons

</details>

## 2026-10-22　训练侧跨半程自监督与有限适配

- 模型：BrainHGT训练侧自监督＋有限适配
- 数据：SRPBS99原训练侧，每折52／53人
- 工作：比较同半重建、同人跨半恢复、人间错配和随机来源。
- 性能变化：有限适配AUC：随机0.5605、同半0.4905、跨半0.5584、错配0.5430；跨半比随机低0.21个百分点。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：无标签时序目标与有限参数适配

验证人不加入自监督；没有达到同时改善判别和概率质量的条件。

<details><summary>参数、完整记录与依据</summary>

原标题：训练侧跨半程自监督与有限适配

原摘要：原SRPBS outer0三内折，U=K=52/53，四来源状态×两读出、五seed，当前验证与外查询不参与自监督。 45个训练侧自监督模型、120个下游读出完成。有限适配下随机/同半自重建/同人跨半/人间错配的AUC为0.5605/0.4905/0.5584/0.5430；全五seed与阴性均保留。

原结果：未同时满足预定判别、概率误差和种子方向条件，停止当前跨半程恢复/有限适配配置，不追加来源、步数、窗口或瓶颈搜索。

具体方法：原SRPBS outer0三内折，U=K=52/53，四来源状态×两读出、五seed，当前验证与外查询不参与自监督。

限制：SRPBS诊断开发，仅原outer0训练79人的三个内折：每折52/53训练、27/26验证。自监督U=当前训练人52/53，下游K为相同人员，验证人不加入无标签学习。不是99人OOF、K-shot或独立H-test；原外查询20人新评分0，无MRI同期痛/治疗反应/新增临床验证。

下一步：保留全部自监督/下游权重和负结果，停止本固定目标与适配搜索；下一步优先可比较独立人员及真实MRI同期评分或治疗随访输入，不用新查询挑目标。

依据：train-side-ssl-20261022、train-side-ssl-20261022-summary、train-side-ssl-20261022-comparison、train-side-ssl-20261022-plan、train-side-ssl-20261022-means、train-side-ssl-20261022-seeds、train-side-ssl-20261022-metrics、train-side-ssl-20261022-sources、train-side-ssl-20261022-verification、train-side-ssl-20261022-literature、train-side-ssl-20261022-failures、train-side-ssl-20261022-budgets、train-side-ssl-20261022-comparisons、train-side-ssl-20261022-controls

</details>

## 2026-10-20　CortexMAE有效秩与站点关联：降维保留方差但未去混杂

- 模型：CortexMAE预训练／随机表示
- 数据：SRPBS99支持内分区
- 工作：检查表示有效秩和降维后的站点关联。
- 性能变化：仅表示诊断，没有新AUC；PCA保留方差但未消除站点关联。
- 原论文 baseline：[CortexMAE，ICML 2026表2、表5](https://proceedings.mlr.press/v306/lane26a.html)。原文表2使用accuracy；ABIDE的parcel／flat／volume／FC为62.0%／61.4%／60.4%／59.8%。未报告SRPBS99、每类10／20标签的AUC baseline。 本项目选用表5所述A424变体；原文默认Schaefer400和flat-map主模型的准确率不能当成本地A424的AUC。
- 修改板块：表示维度与混杂诊断

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CortexMAE有效秩与站点关联：PCA8保留方差但未去混杂

原摘要：原100个人级支持内训练分区；每内训练10/20人；两冻结编码器；199次训练内行置换；新增预测器拟合0。 完成原100个支持内训练分区的有效秩与混杂诊断：两编码器200行分区统计、1600行PC统计，新增预测器拟合0。预训练有效秩约5.36/7.43；固定PCA8保留98.60%/91.20%方差。

原结果：PCA8后的站点解释方差比例未下降，不能将降维当作去站点。预训练表示的有效秩高于固定随机编码器，低秩本身也不等于更好的疼痛表示。

具体方法：原100个人级支持内训练分区；每内训练10/20人；两冻结编码器；199次训练内行置换；新增预测器拟合0。

限制：原99人仍为开发数据；每内训练仅10/20人，中心化秩上界9/19。分区重叠，描述性投影及置换不构成混杂因果解释、独立显著性或临床验证；一个站点仅3人。

下一步：下一项仅保留固定PCA8神经头作为支持内容量消融候选，不宣称去混杂；不扫描维度、层、融合权重或外查询。本轮未启动新预测训练。音乐继续等待原QC与既有比较流程。

依据：cortexmae-rank-20261020、cortexmae-rank-20261020-summary、cortexmae-rank-20261020-partitions、cortexmae-rank-20261020-pcs、cortexmae-rank-20261020-budgets、cortexmae-rank-20261020-figure、cortexmae-rank-20261020-plan、cortexmae-rank-20261020-conference

</details>

## 2026-10-19　音乐镇痛：扫描对应与统一处理

- 模型：统一影像处理流程；TabPFN比较尚未启动
- 数据：音乐镇痛17人、68次近扫描评分
- 工作：核对条件与扫描对应，统一处理影像并保留质量失败。
- 性能变化：尚无共同合格人集；未产生新MAE或AUC，不能报告影像增量。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：扫描／评分对齐与影像处理

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：音乐镇痛：扫描对应与统一处理

原摘要：68次条件VRS可对应扫描；精确评分时间仍缺，发现1例结构像次序偏离论文流程。 已核实17人68次评分与条件/扫描路径，11人先音乐、6人先对照；16人结构像位于第二、第三次静息扫描之间，1人在第四次之后。原始文件已完整获取85/85；统一处理完成23/68，机器QC通过3，QC未通过19，技术失败1。 进入处理前的逐扫描读取已执行24次扫描；85个原始数组已实际读回且内容可读；1个源文件不符合预定输入规格，保留原检查失败。其中1次BOLD为97帧/TR3秒，与预定100帧不符，保持排除，不补帧或改原影像。 已修复1次QC接口错误，原失败记录保留；阈值未改。 另有1次扫描的组织分割图为空，被原解剖输出检查拒绝；技术失败和输出完整保留，未重试，也未进入后续空间处理。其余未处理扫描继续执行原流程。

原结果：当前尚未形成经原数值QC与实际图像查看的四条件共同人集，患者模型比较未启动，未产生新的MAE或影像增量结论。

具体方法：68次条件VRS可对应扫描；精确评分时间仍缺，发现1例结构像次序偏离论文流程。

限制：评分与扫描的精确分钟间隔缺失；1人的完整洗脱流程未核实。17人/68状态不能算68人，VRS近扫描连续强度不等于临床分级。原QC阈值、Emo阴性、CoSpine留出和TN14停止保持；技术QC/图像查看不冒充专家报告或临床验证。

下一步：接续尚未处理的扫描；组织图为空的原技术失败保留并排除，不重试。97帧源输入按原100帧要求排除。待68个扫描终态与要求的实际图像查看完成，按四条件共同人集执行C/I/S五seed；人数不足则不比较。不放宽QC，不重启TN14。

依据：music-nearscan-20261018、music-nearscan-20261018-summary、music-nearscan-20261018-alignment、music-nearscan-20261018-qc、music-nearscan-20261018-processing、music-nearscan-20261018-official、music-nearscan-20261018-failures、music-nearscan-20261018-readback

</details>

## 2026-10-19　Emo27连续痛预测：范围收缩与两端误差

- 模型：已有连续疼痛模型的保存预测
- 数据：Emo27访谈VAS
- 工作：复用预测检查范围收缩、低高疼痛误差及日期差关系。
- 性能变化：没有新增拟合；未发现扩大预测范围能稳定改善VAS预测，AUC不适用于本回归问题。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：预测误差与标签时点诊断

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Emo27连续痛预测：范围收缩与两端误差

原摘要：原27人/三折/五seed，复用保存预测，无训练或新增前向。 复用Emo27原保存预测，完成42项连续痛诊断、36项外折误差及6组五seed汇总；新增训练0、模型预测0。影像模型预测SD/真实SD为0.225—0.619，低痛区间整体高估、高痛区间整体低估。

原结果：扩大预测范围没有带来稳定的连续VAS增益；各模型误差与访谈—扫描日期差关系不一致，不能认定时间错配是失败主因。

具体方法：原27人/三折/五seed，复用保存预测，无训练或新增前向。

限制：27名女性仍为反复开发样本；访谈VAS不是MRI同期痛，35/65为研究分箱。五成员集成不等于五队列；区间尾部仅5/6人，描述性关联不支持因果或独立临床验证。

下一步：停止在Emo27上追加架构/分箱搜索；音乐变化追踪先等待原四状态共同人群数值与真实视觉QC。CortexMAE完整缓存读取遇SSH认证失败，维度诊断未完成，不能据此启动PCA头。

依据：pain-range-diagnostics-20261019、pain-range-diagnostics-20261019-summary、pain-range-diagnostics-20261019-metrics、pain-range-diagnostics-20261019-members、pain-range-diagnostics-20261019-folds

</details>

## 2026-10-18　协方差几何体积、ROI方差与流程混杂核查

- 模型：协方差几何体积与协变量诊断
- 数据：SRPBS99训练内，每类10／20标签
- 工作：核查总体方差、几何体积和已测混杂能否解释类别差异。
- 性能变化：本条是特征关联复核，没有新增分类AUC提升。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：几何尺度与混杂解释

已有协变量不能排除所有未测混杂。

<details><summary>参数、完整记录与依据</summary>

原标题：协方差几何体积、ROI方差与流程混杂核查

原摘要：从99个原ROI文件标准化后与当前输入逐位一致。50个K10/20支持面板内，几何体积与原ROI对数方差相关约−0.75，与收缩率约+0.94；调整流程后与FD约−0.19、censor约−0.29至−0.31。协议与站点关联，未完整记录的扫描仪增益和早期强度处理仍未知。 外层M5 AUC（原SPD→几何体积/形状分支）：K10 0.731592→0.683366，Δ-0.048226，条件区间[-0.099306, -0.000256]，0/5支持重复正向；K20 0.775604→0.716735，Δ-0.058869，条件区间[-0.107376, -0.015500]，0/5支持重复正向。

原结果：同站点两类差异未被现有站点、批次、年龄/性别编码和头动描述完全解释：K10/20调整后标准化病例系数0.594689/0.564954，五重复均正；OSU/CIN原几何体积病例差均正。分层置换平均尾比例约0.34/0.14，不能挑最小值声称显著；这些证据只支持有限开发实验，不排除未测混杂。

具体方法：原50支持面板检查同站点及流程混杂；各5seed 999次分层置换；按预定支持证据运行250分支SPD，同人同预算/200步/原参考；主要K20，不用查询选参。

限制：几何体积不是原始ROI幅度或平均BOLD。与收缩率高度相关，疾病、网络相关结构、采集和处理影响尚不能因果区分。OLS为支持内描述，R²为样本内拟合，置换/面板/seed相互重叠。新模型同时改变标量分支和正则强度，不能把差值归因于单一因素。当前99人已开发，人员区间只覆盖固定预测，不是独立临床验证。

下一步：停止当前分支正则假设，保留原SPD。下一步先用同一支持划分检查收缩估计敏感性与同站点结果稳定性，再决定一个有限的估计器因素实验；不把缺失采集记录补成一致，不继续扫描正则。 原QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三个临床终点保持。

依据：spd-volumescale-20261017、spd-volumescale-20261017-summary、spd-volumescale-20261017-comparison、spd-volumescale-20261017-plan、spd-volumescale-20261017-relations、spd-volumescale-20261017-relation-panels、spd-volumescale-20261017-sites、spd-volumescale-20261017-adjusted-panels、spd-volumescale-20261017-adjusted、spd-volumescale-20261017-repeats、spd-volumescale-20261017-seeds、spd-volumescale-20261017-panels、spd-volumescale-20261017-coverage、spd-volumescale-20261017-technical、spd-volumescale-20261017-inventory、spd-volumescale-20261017-identifiability、spd-volumescale-20261017-model-means、spd-volumescale-20261017-model-seeds、spd-volumescale-20261017-model-contrasts、spd-volumescale-20261017-model-paired、spd-volumescale-20261017-model-diagnostics、spd-volumescale-20261017-model-panels

</details>

## 2026-10-18　本地SPDNet固定支持收缩率与近期工作对照

- 模型：SPDNet固定支持收缩估计
- 数据：SRPBS99，每类10／20标签
- 工作：用共同支持者决定协方差收缩，检验原表示的尺度影响。
- 性能变化：集成AUC约+0.29／−0.54个百分点，区间均跨0，未稳定改善。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：协方差估计与收缩

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：本地SPDNet固定支持收缩率与近期工作对照

原摘要：50个支持面板均可恢复原经验协方差并保持正定；原矩阵重构最大误差1.11e-16。收缩率中位数不使用标签或查询人员。 250次原SPDNet固定支持收缩率训练完成。五成员集成AUC（原→固定）：K10 0.731592→0.734501，K20 0.775604→0.770218；两项差值区间均跨0。五seed成员均值K10 0.687097→0.675867，K20 0.712612→0.704115。

原结果：原/固定logdet仍高度相关；固定支持收缩率没有带来稳定AUC增益，不能把既有退化归结为逐人收缩率。K20集成Brier和logloss略改善，但AUC下降；不以一个指标替代另一个指标。保留原SPDNet，停止本轮配置，不继续扫描收缩率。

具体方法：原单BiMap SPDNet网络及200步SGD不变；逐人LW改为支持λ中位数；50新支持参考，K10/20各五折五重复五seed，主要K20；不读查询选参数。

限制：当前99人（46病例/53对照）已用于模型开发；5外折×5支持重复×5初始化seed，不是125组独立人群。条件人员区间仅覆盖固定预测，不覆盖重训或研究选择。诊断、MRI时疼痛及治疗反应三个临床终点仍未完成；不改QC、CoSpine13留出或TN14停止。

下一步：下一步优先检验原模型在同站点、病例对照均可评估的人员中的排序及错误是否集中于采集/处理层；先复用已有固定预测做描述与不确定性分析，不按测试结果选择新结构。若站点内信息也弱，需补充与疼痛相关的独立训练来源及可信标签，再决定预训练或模型改动。

依据：spd-fixedshrink-20261018、spd-fixedshrink-20261018-summary、spd-fixedshrink-20261018-comparison、spd-fixedshrink-20261018-plan、spd-fixedshrink-20261018-estimator、spd-fixedshrink-20261018-estimator-panels、spd-fixedshrink-20261018-sites、spd-fixedshrink-20261018-coverage、spd-fixedshrink-20261018-technical、spd-fixedshrink-20261018-model-means、spd-fixedshrink-20261018-model-seeds、spd-fixedshrink-20261018-model-contrasts、spd-fixedshrink-20261018-model-paired、spd-fixedshrink-20261018-model-diagnostics、spd-fixedshrink-20261018-model-panels、spd-fixedshrink-20261018-recent、spd-fixedshrink-20261018-recent-work、spd-fixedshrink-20261018-recent-metrics、spd-fixedshrink-20261018-recent-seeds

</details>

## 2026-10-18　三层SPDNet与轻量模型：结构和官方训练参考对照

- 模型：三层SPDNet与轻量SPDNet
- 数据：SRPBS99，每类10／20标签
- 工作：保持人员和预算一致，检验增加网络深度的收益。
- 性能变化：主要AUC约+0.08／−0.28个百分点，区间均跨0；未形成稳定增益。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：网络深度与几何非线性

所测非线性未触发，不能将更多层数当作有效表达能力增加。

<details><summary>参数、完整记录与依据</summary>

原标题：三层SPDNet与轻量模型：结构和官方训练参考对照

原摘要：新增500模型和300000梯度更新；复用原250参照及50原参考。1125项三层初始/终态几何检查；实际MATLAB作者三层算子与QR更新合成对照通过。 主比较（双方200步）：K10 M5 0.731592→0.732388，Δ+0.000796，条件95%[-0.006931, 0.010355]，3/5支持重复正向；K20 M5 0.775604→0.772776，Δ-0.002828，条件95%[-0.009886, 0.003026]，0/5支持重复正向。补充比较（双方500轮/1000更新）：K20 M5 0.767240→0.766517，Δ-0.000723，条件95%[-0.008201, 0.006568]，3/5支持重复正向。

原结果：主比较未形成稳定、兼顾概率指标的增益，保留原轻量模型；本轮深度/训练配置完成后停止，不追加层宽、阈值、轮数或种子搜索。 所测初始化/终态ReEig均未触发，三层输出与乘积单投影数值一致；结合正交投影及输入特征值下界，本轮主要是过参数化的优化比较，不能称增加了有效非线性表达能力。

具体方法：三层90→48→24→16；K10/20与原轻量同200更新；K20另两臂均500轮/1000更新；原人级支持/参考/五seed；官方算子数值对照，非AFEW原任务复现。

限制：当前SRPBS99（46病例/53对照）已有开发历史；相同人员、原五外折、支持集合和seed，不是独立验证。主比较匹配标签及200更新；补充深浅比较匹配500轮/1000更新；跨训练方式预算/L2/批次不同，参数与FLOPs也不相等。条件人员区间仅针对固定预测，未覆盖重训或研究选择。QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三个临床终点保持。

下一步：不根据查询成绩继续加层或调整ReEig阈值。下一步先结合支持内输入谱与已有按站点诊断，确定是否需要改变有生物依据的表示或补充疼痛相关独立训练来源；新方案需与本轮的纯参数化效果分开。

依据：spd-deep-20261018、spd-deep-20261018-summary、spd-deep-20261018-comparison、spd-deep-20261018-plan、spd-deep-20261018-origins、spd-deep-20261018-geometry、spd-deep-20261018-spectrum、spd-deep-20261018-losses、spd-deep-20261018-budgets、spd-deep-20261018-model-means、spd-deep-20261018-model-seeds、spd-deep-20261018-model-contrasts、spd-deep-20261018-model-paired、spd-deep-20261018-model-diagnostics、spd-deep-20261018-model-panels、spd-deep-20261018-recent、spd-deep-20261018-recent-work、spd-deep-20261018-recent-metrics、spd-deep-20261018-recent-seeds、spd-deep-20261018-deep-code、spd-deep-20261018-light-code

</details>

## 2026-10-18　非线性SPD支持验证与项目论文缺口

- 模型：真正非线性SPD候选
- 数据：SRPBS99支持数据与合成检查
- 工作：先检查正定性、梯度和尺度是否满足后续训练要求。
- 性能变化：部分支持条件未通过，正式匹配训练未执行，没有新AUC。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：几何非线性与数值稳定性

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：非线性SPD支持验证与项目论文缺口

原摘要：完成合成检查及250支持组合/750层记录；支持检查10.20秒，未新增模型或查询评价。 250个支持组合全部有非线性、正定且梯度有限；243个通过全部条件，7个第二层相对改变量>2（K10为5/125，K20为2/125），最大3.272392。按计算前方案停止此固定候选，新增监督拟合0、查询前向/新AUC0。

原结果：真正非线性已经生效，但中位对角尺度未控制少数大元素的逐层放大；不是数值崩溃，也未测到性能下降。保留原轻量模型和旧三层结果，未执行计划中的250次匹配训练，不调整系数或放宽上限重试。

具体方法：原三层SPD的本地三次残差；250支持组合全部有曲率/正定/梯度，7个尺度超界；遵循拟合前方案停止，未启动监督训练或查询评价。

限制：全部判断仅用原K10/20的50个人级支持集合与五seed；每集合20/40人，组合相互重叠，250不代表250人或250次训练。尺度使用支持初始化对角的下中位数，随后固定。当前SRPBS99持续是开发数据；旧条件区间不覆盖重训及研究选择。输入已逐ROI标准化，几何量不等于原始BOLD幅度。QC、三临床终点、全部旧阴性/停止与CoSpine13留出保持。

下一步：下一步先验证对角保持、尺度有界的相关形状非线性，并补齐一个真实疼痛终点的时点/处理和人员依据；本轮不启动第二候选。项目和论文缺口见专项表，独立诊断、同期疼痛、疗效及H-test仍未完成。

依据：spd-nonlinear-20261018、spd-nonlinear-20261018-summary、spd-nonlinear-20261018-comparison、spd-nonlinear-20261018-plan、spd-nonlinear-20261018-origins、spd-nonlinear-20261018-support、spd-nonlinear-20261018-geometry、spd-nonlinear-20261018-support-seeds、spd-nonlinear-20261018-budgets、spd-nonlinear-20261018-recent、spd-nonlinear-20261018-recent-work、spd-nonlinear-20261018-recent-metrics、spd-nonlinear-20261018-recent-seeds、spd-nonlinear-20261018-nonlinear-code、spd-nonlinear-20261018-deep-code、spd-nonlinear-20261018-light-code、spd-nonlinear-20261018-paper、spd-nonlinear-20261018-paper-gaps

</details>

## 2026-10-18　27人访谈疼痛分级：未见影像增量

- 模型：SPD联合有序分类与临床头
- 数据：Emo27访谈VAS研究分级
- 工作：比较加入影像是否改善疼痛等级预测。
- 性能变化：联合影像宏F1 0.238、临床头0.248；等级误差0.444对0.407，未见影像增量。
- 修改板块：疼痛分级目标与影像融合

低、高等级识别失败；总体准确率不能掩盖类别问题。

<details><summary>参数、完整记录与依据</summary>

原标题：27人访谈疼痛分级：60次拟合未见影像增量

原摘要：原三外折18训练/9测试、五seed0..4、每模型200步；三个有序输入消融与一个连续目标臂，共60拟合。每折仅训练拟合协方差几何参考、白化、临床标准化、表示均值/RMS；原六路连续OOF直接分箱，新传统求解器拟合0。 27名患者的访谈VAS分级开发已完成60次拟合。联合SPD有序模型的平均等级误差0.444，宏F1 0.238；无影像有序头分别0.407、0.248。没有影像增量。

原结果：五成员集成对高强度区间的召回全部为0；联合SPD有序模型把26/27人判为中区间，另1人判为低区间但真值在中区间。仅凭59%左右总体准确率会掩盖低、高区间无法识别的问题。停止本配置，不追加切点、种子、训练轮数或类别权重搜索。

具体方法：原三外折18训练/9测试、五seed0..4、每模型200步；三个有序输入消融与一个连续目标臂，共60拟合。每折仅训练拟合协方差几何参考、白化、临床标准化、表示均值/RMS；原六路连续OOF直接分箱，新传统求解器拟合0。

限制：仅27位已开发的纤维肌痛女性患者；VAS来自访谈，不是MRI同期痛。<35、35–<65、≥65只是按慢性肌骨痛功能干扰文献划定的研究区间，尚未验证为本队列临床等级。1人时间间隔缺失及5人15–21天冲突保留；未完成独立临床验证或治疗反应目标。

下一步：停止当前分级配置；下一步优先取得同一疾病、明确评分窗口且与MRI同期的连续VAS/NRS及可比未开发人员。切点需有该人群的临床依据；新增患者前不把窗口、seed或诊断标签充当疼痛监督。

依据：pain-grading-20261018、pain-grading-20261018-summary、pain-grading-20261018-comparison、pain-grading-20261018-plan、pain-grading-20261018-metrics、pain-grading-20261018-means、pain-grading-20261018-folds、pain-grading-20261018-confusion、pain-grading-20261018-paired、pain-grading-20261018-coverage、pain-grading-20261018-training、pain-grading-20261018-model-code、pain-grading-20261018-base-code

</details>

## 2026-10-18　保持对角的有界SPD非线性：同人同预算比较

- 模型：有界非线性SPDNet
- 数据：SRPBS99，每类10／20标签
- 工作：在保持尺度边界的情况下加入有效非线性。
- 性能变化：比轻量SPD的AUC下降约1.37／1.28个百分点，差值区间跨0，未稳定改善。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：几何网络的有效非线性

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：保持对角的有界SPD非线性：同人同预算比较

原摘要：250支持组合初始检查全部通过；250模型/50000支持更新、1500几何快照/4500层记录，全部支持条件满足后才查询。 与原轻量200步比较：K10 M5 0.731592→0.717891，Δ-0.013701，条件95%[-0.034813, 0.004658]，1/5支持重复正向；K20 M5 0.775604→0.762760，Δ-0.012844，条件95%[-0.033037, 0.004746]，1/5支持重复正向。同结构ReEig参照：K10 M5 0.732388→0.717891，Δ-0.014497，条件95%[-0.036208, 0.003836]，1/5支持重复正向；K20 M5 0.772776→0.762760，Δ-0.010016，条件95%[-0.031616, 0.007914]，1/5支持重复正向。

原结果：主终点未满足稳定、兼顾概率指标的开发增量条件，保留原轻量模型。 本轮非线性确实生效且尺度边界在支持训练内通过；不因结果追加激活强度、层宽、轮数或种子搜索。固定候选结束，全部结果保留。

具体方法：三层90→48→24→16的本地相关形状三次激活；对角/符号保持，变化≤20%；250支持训练完成后才查询；原人级支持/参考/五seed及200更新。

限制：本轮未训练线性收缩H的额外对照，性能差反映整个激活替换，不能单独归因非线性。原SRPBS99（46病例/53对照）已有开发历史，五外折/支持集合/seed不变。双方匹配人员、目标标签及200更新；轻量1581参数对三层5997参数，不匹配FLOPs和支持检查成本。全部250支持训练完成且条件满足后才查询。条件bootstrap只覆盖固定预测人员抽样，不覆盖重训或多轮研究选择。隐层对角保持不等于原始BOLD幅度保持；QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三个临床终点要求不变。

下一步：该固定激活配置不继续追分。下一步优先补齐一个真实疼痛终点的时点、上游处理及人员依据，并判断是否具备未参与开发的同终点评估条件；旧99人不重新命名独立测试。方法稿可纳入本轮正负结果，原创性与临床效度仍需单独论证。

依据：spd-bounded-20261018、spd-bounded-20261018-summary、spd-bounded-20261018-comparison、spd-bounded-20261018-plan、spd-bounded-20261018-origins、spd-bounded-20261018-support、spd-bounded-20261018-geometry、spd-bounded-20261018-support-seeds、spd-bounded-20261018-budgets、spd-bounded-20261018-recent、spd-bounded-20261018-recent-work、spd-bounded-20261018-recent-metrics、spd-bounded-20261018-recent-seeds、spd-bounded-20261018-bounded-code、spd-bounded-20261018-deep-code、spd-bounded-20261018-light-code、spd-bounded-20261018-paper、spd-bounded-20261018-paper-gaps、spd-bounded-20261018-model-means、spd-bounded-20261018-model-seeds、spd-bounded-20261018-model-contrasts、spd-bounded-20261018-model-paired、spd-bounded-20261018-model-diagnostics、spd-bounded-20261018-model-panels、spd-bounded-20261018-losses

</details>

## 2026-10-18　疼痛分级多模型：MLP、GCN、CNN与Transformer

- 模型：MLP、GCN、时间CNN、ROI Transformer
- 数据：Emo27访谈VAS
- 工作：比较直接有序分类与连续回归后分箱。
- 性能变化：MLP／GCN回归分箱宏F1为0.481，但差值区间跨0；全部影像连续误差高于临床头。
- 修改板块：影像编码器与疼痛学习目标

研究分箱不等于临床疼痛等级，保留全部方法的阴性结果。

<details><summary>参数、完整记录与依据</summary>

原标题：疼痛分级多模型：MLP、GCN、CNN与Transformer

原摘要：5个新编码/消融族×2目标×3原折×5seed，共150拟合、30000更新；所有新模型AdamW .001、200全批步。原27人/三折/13临床字段/35和65切点保持；旧SPD及六路传统预测复用，新增传统求解器、参考或Scaler拟合0。 新增NodeMLP、GCN、时间CNN、ROI Transformer四类影像网络，分别做有序分级和连续回归后分箱，加同优化器临床消融，共150拟合。MLP/GCN回归后分箱宏F1均0.481；原SPD回归分箱为0.248。

原结果：直接有序分级的四种影像网络均未降低相对本轮临床头的等级误差。MLP/GCN回归后分箱有部分指标改善，但宏F1差值条件区间仍跨0；全部影像连续预测的VAS误差均高于临床头。CNN回归分箱等级误差0.370，其改善区间下限恰为0，不能写成已证明增益。

具体方法：5个新编码/消融族×2目标×3原折×5seed，共150拟合、30000更新；所有新模型AdamW .001、200全批步。原27人/三折/13临床字段/35和65切点保持；旧SPD及六路传统预测复用，新增传统求解器、参考或Scaler拟合0。

限制：同27位已开发纤维肌痛女性，访谈VAS不是MRI同期痛；35/65只是功能干扰文献的研究分箱，未验证为临床等级。1人时间缺失与5人15–21天冲突保留。多模型、多目标比较仅属探索，未获得独立临床验证。

下一步：本轮固定多模型比较结束，不按此27人的最高成绩继续筛选架构或参数。下一步补同病种MRI同期连续评分、该人群的分级依据及可比未开发人员；连续误差、各级识别与混杂增量分别检验。

依据：pain-multimodel-20261018、pain-multimodel-20261018-summary、pain-multimodel-20261018-comparison、pain-multimodel-20261018-plan、pain-multimodel-20261018-metrics、pain-multimodel-20261018-means、pain-multimodel-20261018-folds、pain-multimodel-20261018-confusion、pain-multimodel-20261018-paired、pain-multimodel-20261018-coverage、pain-multimodel-20261018-training、pain-multimodel-20261018-budgets、pain-multimodel-20261018-model-code、pain-multimodel-20261018-base-code

</details>

## 2026-10-18　SPD与时序网络融合：同人同预算比较

- 模型：SPDNet＋时间网络融合
- 数据：SRPBS99，每类10／20标签
- 工作：在相同人员、成员数与更新预算下比较异构与同构集成。
- 性能变化：异构融合AUC下降5.11／3.06个百分点，条件区间跨0。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：几何与时序模型融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SPD与时序网络融合：同人同预算比较

原摘要：250支持初始化检查通过；500新模型/100000更新，原250 SPD复用。共同时间置乱协方差最大误差1.67e-15、lag摘要最小相对变化0.993。这是输入敏感性检查，不是泛化证据。 K10 同构十SPD 0.723867→异构融合 0.672816，Δ-0.051051，条件95%[-0.120626, 0.017610]，0/5支持重复正向；K20 同构十SPD 0.755103→异构融合 0.724505，Δ-0.030598，条件95%[-0.102651, 0.043424]，2/5支持重复正向。

原结果：这次等权异构融合没有达到稳定、兼顾概率指标的增量条件。固定配置结束，保留原轻量SPD。 不追加查询选权重、lag或种子搜索。

具体方法：原轻量SPD与765参数时序摘要网络50%概率融合；十专家/2000更新，与十SPD比较；500新训练后统一查询，不用查询选权重。

限制：同原99人、五外折×五支持重复和K10/20标签；主要双方均10专家×200更新=2000更新/支持。异构11730与同构15810参数，不等FLOPs或优化器；原M5只有1000更新，单列背景。pair的成员均值是五个双专家配对的平均AUC，不是单网络成绩。所有99人已有开发历史；区间仅覆盖固定预测人员抽样，不覆盖重训或多轮研究选择。时序摘要受滤波、头动和采集流程影响；支持置乱敏感性不证明疼痛相关或与FC条件独立。诊断不代替同期疼痛/疗效；OA/ZAN/Emo阴性、CoSpine13留出、TN14停止和QC边界不变。

下一步：结束本轮固定融合配置，整理异构与同构同预算的完整正负结果。下一步先核实一个未参与开发、临床终点和处理可比的评估队列；原BrainLM＋FC方案须先解决真实atlas输入、检查点及无查询人员重叠依据，不能用补零或旧全训练池权重冒充小样本官方复现。

依据：spd-temporal-fusion-20261018、spd-temporal-fusion-20261018-summary、spd-temporal-fusion-20261018-comparison、spd-temporal-fusion-20261018-plan、spd-temporal-fusion-20261018-origins、spd-temporal-fusion-20261018-support、spd-temporal-fusion-20261018-confounds、spd-temporal-fusion-20261018-confound-summary、spd-temporal-fusion-20261018-budgets、spd-temporal-fusion-20261018-recent、spd-temporal-fusion-20261018-recent-work、spd-temporal-fusion-20261018-recent-metrics、spd-temporal-fusion-20261018-recent-seeds、spd-temporal-fusion-20261018-temporal-code、spd-temporal-fusion-20261018-light-code、spd-temporal-fusion-20261018-paper、spd-temporal-fusion-20261018-paper-gaps、spd-temporal-fusion-20261018-model-means、spd-temporal-fusion-20261018-model-seeds、spd-temporal-fusion-20261018-model-contrasts、spd-temporal-fusion-20261018-model-paired、spd-temporal-fusion-20261018-model-diagnostics、spd-temporal-fusion-20261018-model-panels、spd-temporal-fusion-20261018-losses、spd-temporal-fusion-20261018-bottleneck、spd-temporal-fusion-20261018-complementarity

</details>

## 2026-10-18　BrainLM＋FC：官方权重、A424与人员来源核查

- 模型：BrainLM官方256维候选／FMM
- 数据：SRPBS99真实A424输入；旧79人结果另列
- 工作：核对FMM所需官方权重、真实脑区输入与训练来源。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FMM，MICCAI 2025表3](https://papers.miccai.org/miccai-2025/paper/1399_paper.pdf)。公开OA药物反应：无预训练FMM基线 AUC 0.6067±0.2543，完整FMM 0.7756±0.2698，仅FC 0.5511±0.2958；院内队列分别为0.7143±0.2129、0.7520±0.2614、0.6896±0.1174。 公开数据56名患者、院内61人，五折药物反应预测，±为折间标准差；SRPBS患者／健康分类、512维本地适配与原文256维输入分别记录。
- 原论文 baseline：[BrainLM，ICLR 2024原文](https://proceedings.iclr.cc/paper_files/paper/2024/file/029ce70401321de3808b3ac39e1ab167-Paper-Conference.pdf)。原文未给SRPBS79／99疼痛诊断的AUC baseline。年龄、心理量表和脑活动预测使用各自指标，原文主要数值不能换算为本项目AUC。 FMM论文中的BrainLM药物反应分支是另一篇论文的评估；本地公开512维权重与候选256维检查点也分别记录。
- 修改板块：官方编码器接入与预训练来源

技术接入通过不能代替训练来源核定或疼痛效果验证。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainLM＋FC：官方权重、A424与人员来源核查

原摘要：官方Git/HF元数据与30.47MB候选权重实查；124张量有限；服务器99份A424逐人/数值核对；保留旧79人阴性。 已找到官方256维/4层/4头候选，安全张量检查通过；当前99人的真实A424与旧512特征仍可逐人对应。FMM论文具体权重身份、逐检查点预训练来源/人员排除和可复用缩放依据仍未核实，作者模型前向也未通过现有环境兼容检查。

原结果：本轮完成接入核查，新患者训练0、未产生新AUC。条件尚未满足，未启动K10/20比较；没有以512维旧适配、随机权重或90→424补零替代官方方法。历史79人FMM阴性与全部种子记录保留。

具体方法：官方Git/HF版本与256候选安全张量检查；真实99A424身份对应、旧79人阴性追溯；个体预训练排除与缩放未证实，作者前向环境不兼容，未启动患者比较。

限制：官方来源、结构相符、权重严格加载、真实人级输入、预训练无重叠和临床效度是不同结论。公开资料未列SRPBS不等于逐人无重叠已证实；未证实也不等于发现泄露。99人已有开发历史，旧79单基础seed/三外折OOF与当前五seed/K10/20指标分开。没有重读MRI、改QC/纳入、删ROI、重启旧停止实验或联系作者。

下一步：需要明确到候选检查点的预训练数据范围、可用人员排除依据与输入缩放记录，并完成作者模块兼容前向；随后才能判断是否批准一次固定的小样本适配。当前不自动恢复旧512结构的few-shot搜索，也不因缺文件而换成另一预训练模型。

依据：brainlm-fc-audit-20261018、brainlm-fc-audit-20261018-summary、brainlm-fc-audit-20261018-comparison、brainlm-fc-audit-20261018-plan、brainlm-fc-audit-20261018-checks、brainlm-fc-audit-20261018-inputs、brainlm-fc-audit-20261018-variants、brainlm-fc-audit-20261018-technical、brainlm-fc-audit-20261018-history、brainlm-fc-audit-20261018-history-selections、brainlm-fc-audit-20261018-recent、brainlm-fc-audit-20261018-recent-work、brainlm-fc-audit-20261018-recent-metrics、brainlm-fc-audit-20261018-recent-seeds、brainlm-fc-audit-20261018-paper、brainlm-fc-audit-20261018-paper-gaps

</details>

## 2026-10-18　疼痛分级：过拟合诊断与论文方法验证

- 模型：TabPFN v2、DistPFN与临床／FC输入
- 数据：Emo27访谈VAS研究分级
- 工作：用冻结论文方法检验影像联合方案，并分析过拟合。
- 性能变化：联合影像宏F1 0.248→0.238；同方法仅临床0.376、打乱FC 0.349，没有影像增量。
- 修改板块：冻结表格模型与疼痛分级

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：疼痛分级：过拟合诊断与论文方法验证

原摘要：旧四类影像有序模型共60个，训练宏F1全部为1，折级留出均值仅0.244–0.333；等级5/16/6人，最少仅2位低区间训练人。 完成官方冻结TabPFN v2及DistPFN单样本后验验证：临床＋FC宏F1由原始0.248降到调整后0.238；同方法临床0.376，训练侧FC打乱0.349。60个上下文全部重建回放一致，患者梯度更新0。

原结果：本轮未改善预定的影像联合方案，也未发现可靠影像增量。强先验平衡虽提高高区间召回，却增加等级误差；减少患者参数拟合不能自动补出影像信号。

具体方法：旧四类影像有序模型共60个，训练宏F1全部为1，折级留出均值仅0.244–0.333；等级5/16/6人，最少仅2位低区间训练人。

限制：27位女性开发样本，访谈VAS不是扫描同期疼痛，35/65为功能干扰研究分箱。配对区间不覆盖重训、方法选择或独立临床验证；原标签、人员、划分、QC及停止分支保持。

下一步：停止这一路后验、温度和检查点扩展搜索；优先取得扫描同期连续疼痛及更充足的两端等级样本，再在独立人群验证影像相对临床的增量。

依据：pain-targeted-20261018、pain-targeted-20261018-summary、pain-targeted-20261018-comparison、pain-targeted-20261018-plan、pain-targeted-20261018-metrics、pain-targeted-20261018-means、pain-targeted-20261018-folds、pain-targeted-20261018-confusion、pain-targeted-20261018-paired、pain-targeted-20261018-contexts、pain-targeted-20261018-overfit-models、pain-targeted-20261018-overfit-summary、pain-targeted-20261018-classes、pain-targeted-20261018-previous-increment、pain-targeted-20261018-adapter

</details>

## 2026-10-18　BrainLM256：严格加载、合成前向与缩放补查

- 模型：BrainLM官方256维候选／FMM
- 数据：SRPBS99真实A424输入；旧79人结果另列
- 工作：完成官方模型严格加载和合成前向，保留旧适配阴性。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FMM，MICCAI 2025表3](https://papers.miccai.org/miccai-2025/paper/1399_paper.pdf)。公开OA药物反应：无预训练FMM基线 AUC 0.6067±0.2543，完整FMM 0.7756±0.2698，仅FC 0.5511±0.2958；院内队列分别为0.7143±0.2129、0.7520±0.2614、0.6896±0.1174。 公开数据56名患者、院内61人，五折药物反应预测，±为折间标准差；SRPBS患者／健康分类、512维本地适配与原文256维输入分别记录。
- 原论文 baseline：[BrainLM，ICLR 2024原文](https://proceedings.iclr.cc/paper_files/paper/2024/file/029ce70401321de3808b3ac39e1ab167-Paper-Conference.pdf)。原文未给SRPBS79／99疼痛诊断的AUC baseline。年龄、心理量表和脑活动预测使用各自指标，原文主要数值不能换算为本项目AUC。 FMM论文中的BrainLM药物反应分支是另一篇论文的评估；本地公开512维权重与候选256维检查点也分别记录。
- 修改板块：官方编码器接入与预训练来源

技术接入通过不能代替训练来源核定或疼痛效果验证。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainLM256：严格加载、合成前向与缩放补查

原摘要：五个合成seed全部保留；完整权重严格加载，mask0编码及mask0.2重建通过；缩放源码差异有合成实测。 独立Python3.12.13环境已配置，Torch2.5.1+cpu、Transformers4.40.2。官方256维检查点严格加载FMM作者BrainLM模块，缺失键/额外键均0；合成seed0—4的编码与完整重建前向全部通过，重复特征误差0。

原结果：技术兼容问题已解决；具体检查点的训练数据、无查询人员重叠依据及输入缩放仍未充分核实。新患者训练未启动，未产生新AUC；保留旧79人阴性、原240项训练seed及上轮ABI失败。

具体方法：独立Python3.12环境，官方256权重strict=True加载作者模块，五seed合成前向；公开缩放实现与描述有差异，检查点来源和人员排除仍未明确，未启动患者比较。

限制：本轮是官方权重技术接入验证：作者网络与权重未改，CPU环境、mask=0编码及固定噪声属于本地推理设置；完整重建使用检查点原mask=0.2。合成数据无临床标签，不能证明疼痛预测有效、预训练充分或FMM原任务复现。来源未明不等于已发现泄露，库名不同也不证明个体交集为0。原99人为开发数据，QC、纳入、停止分支和并行疼痛研究均保持。

下一步：先取得检查点级训练来源说明、可用人员排除依据和实际输入列/缩放统计；公开代码的缩放分歧要先确认。满足后沿原同人K10/20、seed0—4和固定预算比较FC、FC＋冻结预训练、FC＋冻结随机。当前停止患者分支，独立环境可继续用于合成验证。

依据：brainlm-compatible-20261018、brainlm-compatible-20261018-summary、brainlm-compatible-20261018-comparison、brainlm-compatible-20261018-plan、brainlm-compatible-20261018-checks、brainlm-compatible-20261018-inputs、brainlm-compatible-20261018-variants、brainlm-compatible-20261018-technical、brainlm-compatible-20261018-history、brainlm-compatible-20261018-history-selections、brainlm-compatible-20261018-recent、brainlm-compatible-20261018-recent-work、brainlm-compatible-20261018-recent-metrics、brainlm-compatible-20261018-recent-seeds、brainlm-compatible-20261018-paper、brainlm-compatible-20261018-paper-gaps

</details>

## 2026-10-18　疼痛标签库存：扫描时点与低高样本

- 模型：标签库存核查；未新增模型
- 数据：音乐17人、Emo、DEIPP、CoSpine、DS005713
- 工作：核对扫描时点、低高疼痛人数与可用评分。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：疼痛标签与扫描对应

重复扫描不扩充独立人数；TN14停止状态不变。

<details><summary>参数、完整记录与依据</summary>

原标题：疼痛标签库存：扫描时点与低高样本

原摘要：已有扫描内或近扫描评分，但还没有可直接并入Emo、且完成同流程QC的新增临床样本。 音乐队列17患者/68次近扫描VRS，0–3为24次/10人、7–10为15次/7人，仅2人两端都有。Emo另6人是1低/2中/3高，均未通过原QC。

原结果：DEIPP有连续同期标签但只有3人；CoSpine开发低痛仅3试次/2人。Emo任务论文采集过当时痛，实际行为包未提供回答。DS005713临床表扩至172行/98评分，但同期性仍缺、TN14保持停止。

具体方法：已有扫描内或近扫描评分，但还没有可直接并入Emo、且完成同流程QC的新增临床样本。

限制：15条队列/分支分开报告；Emo35/65保持，其他0–10材料的0–3/7–10仅描述数值两端，不是新临床分级。重复扫描/试次不算新人；本轮MRI、训练、QC纳入均0。

下一步：下一轮优先准备音乐镇痛17人四条件的近扫描连续VRS：先完成原条件/评分时间与统一影像/QC对应，再按人留出比较官方冻结模型的临床与FC增量；当前不启动训练。

依据：pain-label-inventory-20261018、pain-label-inventory-20261018-summary、pain-label-inventory-20261018-cohorts、pain-label-inventory-20261018-tails、pain-label-inventory-20261018-fields、pain-label-inventory-20261018-plan、pain-label-inventory-20261018-metadata、pain-label-inventory-20261018-verification

</details>

## 2026-10-18　BrainLM256：训练来源追溯与缩放语句实测

- 模型：BrainLM官方256维候选／FMM
- 数据：SRPBS99真实A424输入；旧79人结果另列
- 工作：追溯具体检查点来源，并实测输入缩放语句的差异。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FMM，MICCAI 2025表3](https://papers.miccai.org/miccai-2025/paper/1399_paper.pdf)。公开OA药物反应：无预训练FMM基线 AUC 0.6067±0.2543，完整FMM 0.7756±0.2698，仅FC 0.5511±0.2958；院内队列分别为0.7143±0.2129、0.7520±0.2614、0.6896±0.1174。 公开数据56名患者、院内61人，五折药物反应预测，±为折间标准差；SRPBS患者／健康分类、512维本地适配与原文256维输入分别记录。
- 原论文 baseline：[BrainLM，ICLR 2024原文](https://proceedings.iclr.cc/paper_files/paper/2024/file/029ce70401321de3808b3ac39e1ab167-Paper-Conference.pdf)。原文未给SRPBS79／99疼痛诊断的AUC baseline。年龄、心理量表和脑活动预测使用各自指标，原文主要数值不能换算为本项目AUC。 FMM论文中的BrainLM药物反应分支是另一篇论文的评估；本地公开512维权重与候选256维检查点也分别记录。
- 修改板块：官方编码器接入与预训练来源

技术接入通过不能代替训练来源核定或疼痛效果验证。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainLM256：训练来源追溯与缩放语句实测

原摘要：五seed源码语句重放及10次冻结编码，3个失效样例全保留；训练来源未明确到256，患者拟合0。 已追溯14次仓库提交及8项公开讨论。作者已有回复支持一般预训练来源为UKB，但未明确绑定256检查点；缩放笔误问题19与统计量请求23均为0回复，后者针对13M，不能充当256来源证明。

原结果：缩放运算差异已用实际源码语句和官方冻结权重核实。仍无法认定该检查点当时采用哪种输入列、预训练人员及缩放统计，患者同人同预算比较未启动，未产生新AUC。上轮严格加载与前向成功、旧训练seed、阴性和失败均保留。

具体方法：追溯14次提交与8项公开讨论；重放官方缩放语句、五seed冻结特征比较和3失效案例。具体检查点来源和缩放未确认，患者比较未启动。

限制：公开脚本可执行与历史训练实际流程是不同证据。原始工具未改；规范公式只作为合成诊断对照，不能冒称官方纠正。0回复不等于作者承认错误或数据确实未保存。UKB一般来源说明不能替代检查点成员排除；没有证据断言已经泄露。全部新数据为合成，原99人开发属性、QC/纳入和并行疼痛研究保持。

下一步：本轮公开来源追溯已收尾。患者分支需要检查点对应的数据范围及查询排除依据、实际输入列、原缩放统计和运算确认；获得这些实际材料后再执行原定K10/20同人同预算比较。当前不继续改公式后试患者成绩，也不将HF512或大模型当作同一256版本。

依据：brainlm-scaling-20261018-scaling-seeds、brainlm-scaling-20261018-scaling-failures、brainlm-scaling-20261018-source-evidence、brainlm-scaling-20261018、brainlm-scaling-20261018-summary、brainlm-scaling-20261018-comparison、brainlm-scaling-20261018-plan、brainlm-scaling-20261018-checks、brainlm-scaling-20261018-inputs、brainlm-scaling-20261018-variants、brainlm-scaling-20261018-technical、brainlm-scaling-20261018-history、brainlm-scaling-20261018-history-selections、brainlm-scaling-20261018-recent、brainlm-scaling-20261018-recent-work、brainlm-scaling-20261018-recent-metrics、brainlm-scaling-20261018-recent-seeds、brainlm-scaling-20261018-paper、brainlm-scaling-20261018-paper-gaps

</details>

## 2026-10-18　CortexMAE-A424：固定预训练迁移与随机对照

- 模型：官方CortexMAE冻结编码器＋分类头
- 数据：SRPBS99，每类10／20标签
- 工作：与固定随机编码器和既有SPD模型比较迁移表示。
- 性能变化：比随机编码器AUC增加13.26／11.25个百分点，条件区间全正；仍低于SPD 12.68／11.04个百分点。
- 原论文 baseline：[CortexMAE，ICML 2026表2、表5](https://proceedings.mlr.press/v306/lane26a.html)。原文表2使用accuracy；ABIDE的parcel／flat／volume／FC为62.0%／61.4%／60.4%／59.8%。未报告SRPBS99、每类10／20标签的AUC baseline。 本项目选用表5所述A424变体；原文默认Schaefer400和flat-map主模型的准确率不能当成本地A424的AUC。
- 修改板块：冻结预训练迁移与分类头

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CortexMAE-A424：固定预训练迁移与随机对照

原摘要：官方A424权重及来源核查通过；500神经头、五seed与全部阴性保留。 完成500个神经分类头、100000次更新及全部保存头重放。五成员集成AUC：K10预训练0.6048、随机0.4722、原SPD0.7316；K20预训练0.6652、随机0.5528、原SPD0.7756。

原结果：相对同结构固定随机编码器，K10集成AUC提高0.1326、5/5支持重复正向；K20集成AUC提高0.1125、5/5支持重复正向。两个预算的条件区间均排除0。两预算仍低于原SPD集成，本轮不替换轻量SPD主线。 全部seed和阴性保留，停止该配置。

具体方法：作者模型原样、strict=True全键加载；官方逐ROI扫描zscore、float16存储、推理线性TR重采样、逐帧标准化及clip±3；37个16帧块固定均值池化。本地772→1神经头，仅支持集拟合尺度，均衡BCE/SGD .01/权重衰减 .001/200更新；没有早停或查询选参。

限制：原99人（46病例/53对照）反复参与过开发，不是独立验证。HCP-YA检查点与SRPBS目标队列按已声明来源成员排除；缺跨匿名库身份映射，不能证明生物个体交集为零。图谱与原SPD不同；只在预训练对随机的同输入比较中识别预训练贡献。条件bootstrap不覆盖重训、选方法或新队列。原体积DPABI与HCP处理差异、最小ROI 1体素/每人2区少于5体素、既有QC及临床终点缺口保留。

下一步：停止这一固定CortexMAE配置，不根据查询分数追加窗口、池化或融合权重。下一项先在支持集内部核查分类头正则化及与SPD的互补信息；有训练内依据后，再另定一次固定收缩残差融合比较。独立诊断、扫描同期疼痛与治疗随访仍分别需要合适数据。

依据：cortexmae-transfer-20261018、cortexmae-transfer-20261018-summary、cortexmae-transfer-20261018-comparison、cortexmae-transfer-20261018-plan、cortexmae-transfer-20261018-checks、cortexmae-transfer-20261018-technical、cortexmae-transfer-20261018-candidates、cortexmae-transfer-20261018-means、cortexmae-transfer-20261018-pairs、cortexmae-transfer-20261018-seeds、cortexmae-transfer-20261018-supports、cortexmae-transfer-20261018-failures、cortexmae-transfer-20261018-recent、cortexmae-transfer-20261018-recent-work、cortexmae-transfer-20261018-recent-metrics、cortexmae-transfer-20261018-recent-seeds、cortexmae-transfer-20261018-paper、cortexmae-transfer-20261018-paper-gaps

</details>

## 2026-10-18　CortexMAE分类头：支持内正则与SPD互补性

- 模型：CortexMAE分类头、SPD及等权融合
- 数据：SRPBS99；内训练每类5／10人（完整支持每类10／20人）
- 工作：检查分类头正则化，以及表示与SPD是否互补。
- 性能变化：强正则相对原头AUC约−0.96／+1.96个百分点；融合比SPD +0.08／−0.02个百分点，未稳定改善。
- 原论文 baseline：[CortexMAE，ICML 2026表2、表5](https://proceedings.mlr.press/v306/lane26a.html)。原文表2使用accuracy；ABIDE的parcel／flat／volume／FC为62.0%／61.4%／60.4%／59.8%。未报告SRPBS99、每类10／20标签的AUC baseline。 本项目选用表5所述A424变体；原文默认Schaefer400和flat-map主模型的准确率不能当成本地A424的AUC。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：分类头正则化与模型融合

仅支持内选型比较，未进行新增外查询评价。

<details><summary>参数、完整记录与依据</summary>

原标题：CortexMAE分类头：支持内正则与SPD互补性

原摘要：CortexMAE头的支持内过拟合、三档正则与固定融合检查已完成；外比较未启动 完成100个人级内分区、2500个模型/500000次更新及全部模型重放。K10支持内五成员AUC：原头0.6192、强正则头0.6096、SPD0.7088、固定融合0.7096；K20支持内五成员AUC：原头0.6404、强正则头0.6600、SPD0.7472、固定融合0.7470。

原结果：强正则降低概率误差，AUC改善随预算变化；两支错误高度相关，固定融合没有稳定增量。K10融合−SPD的ΔAUC +0.0008（3/5重复正向），Δlogloss +0.0017（2/5改善）；K20融合−SPD的ΔAUC -0.0002（3/5重复正向），Δlogloss -0.0003（2/5改善）。未同时满足预定训练内继续条件，本轮停止此固定候选，新增外查询比较0，不调融合权重。

具体方法：预训练头L2=0.001/0.1/10；固定随机头L2=10；五seed0—4、float64均衡BCE/SGD0.01/200更新均不变。100内分区各重新拟合5个原SPD成员，新增2000头和500 SPD；固定融合无新增可训练参数，按seed配对后等权平均。所有训练/推理仅用原支持内的人；内留出不进入尺度、参考或训练。

限制：当前为原99人开发数据上的支持内诊断。K10/20是完整支持每类人数，内训练实际每类5/10人、内留出每类5/10人，不能与上轮全支持训练的外查询AUC直接排名。支持重复和内折存在人员重叠，不是独立队列；本轮不新增置信区间或泛化声明。官方HCP检查点、424区输入及冻结池化沿用上轮；跨匿名库生物身份交集未知、DPABI/HCP处理域差异及原QC限制保留。临床三个终点仍未完成。

下一步：停止当前0.25固定融合，不进入外查询选权重。下一项若继续，先在同一支持内检查768维表示的有效秩与站点/协变量占比，判断判别信息是否主要落在少数方向；仅在出现可重复结构后设计低维瓶颈神经头。独立队列与临床终点仍需另补。

依据：cortexmae-support-20261018、cortexmae-support-20261018-summary、cortexmae-support-20261018-comparison、cortexmae-support-20261018-plan、cortexmae-support-20261018-means、cortexmae-support-20261018-seeds、cortexmae-support-20261018-supports、cortexmae-support-20261018-trajectories、cortexmae-support-20261018-complement、cortexmae-support-20261018-numerics、cortexmae-support-20261018-failures、cortexmae-support-20261018-recent、cortexmae-support-20261018-recent-work、cortexmae-support-20261018-recent-metrics、cortexmae-support-20261018-recent-seeds、cortexmae-support-20261018-paper、cortexmae-support-20261018-paper-gaps、cortexmae-support-20261018-verification

</details>

## 2026-10-17　固定五成员SPD：原外层划分复核

- 模型：固定五成员SPDNet集成
- 数据：SRPBS99原外层划分，每类5／10／20标签
- 工作：在原外层评价中复核固定集成策略。
- 性能变化：相对成员AUC均值分别增加5.93／4.45／6.30个百分点，条件区间均为正。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：集成策略的外层复核

使用既有开发队列，不能称新增独立来源验证。

<details><summary>参数、完整记录与依据</summary>

原标题：固定五成员SPD：原外层划分复核

原摘要：SRPBS99（46病例／53对照），原五外折×五支持重复×三预算。新增75份仅支持侧参考、375神经训练及75集成，450条实际外测试预测评价；传统模型新增0。每个集成的五成员只用同一批2K名训练者。平均外折AUC：K5 0.7135±0.0763；K10 0.7316±0.0232；K20 0.7756±0.0156。

原结果：K5集成减成员指标均值（主要）ΔAUC +0.0593，条件95%[0.0348, 0.0845]，5/5支持重复正向、5/5外折正向；K5集成减对角单成员（副比较）ΔAUC +0.0554，条件95%[0.0105, 0.1027]，5/5支持重复正向、4/5外折正向；K10集成减成员指标均值（主要）ΔAUC +0.0445，条件95%[0.0154, 0.0709]，5/5支持重复正向、5/5外折正向；K10集成减对角单成员（副比较）ΔAUC +0.0417，条件95%[0.0050, 0.0789]，5/5支持重复正向、3/5外折正向；K20集成减成员指标均值（主要）ΔAUC +0.0630，条件95%[0.0367, 0.0901]，5/5支持重复正向、5/5外折正向；K20集成减对角单成员（副比较）ΔAUC +0.0688，条件95%[0.0318, 0.1074]，4/5支持重复正向、5/5外折正向。 三个预算的主要AUC增量在原外层评估中保留；可固定此候选，但尚不能认定独立泛化。 支持重复SD（成员指标均值→集成）：K5 0.0646→0.0763；K10 0.0135→0.0232；K20 0.0158→0.0156，不能由AUC增加直接推断稳定性改善。

具体方法：原五外折×五支持×三预算，75训练侧参考、375固定神经拟合与75集成；450实际外测试指标与共同人员区间独立核算，传统新增0。

限制：主估计是五外折指标等权均值，再平均全部支持与初始化；不混同跨折OOF AUC或原内层均值。五折训练池重叠，六个主副比较未校正；2000共同人员抽样区间只覆盖保存预测重加权，不覆盖重训、开发选择或独立人群。支持SD条件于固定五初始化；对角单成员SD混合支持和初始化。概率误差下降部分由凸性保证。

下一步：三个预算的主要AUC增量在原外层评估中保留；可固定此候选，但尚不能认定独立泛化。 本轮固定375拟合已结束，不按外层成绩修改seed、权重、K或训练轮数。下一步整理该固定候选的独立来源与临床标签适用条件；未取得相应真实输入前不启动独立验证或新增临床终点训练。

依据：spd-outer-20261017、spd-outer-20261017-summary、spd-outer-20261017-metrics、spd-outer-20261017-comparison、spd-outer-20261017-means、spd-outer-20261017-contrasts、spd-outer-20261017-diagnostics、spd-outer-20261017-plan、spd-outer-20261017-code

</details>

## 2026-10-17　固定SPD：其他来源队列可用性核查

- 模型：固定SPDNet方案；本条未新增训练
- 数据：SRPBS99、ZAN54、Emo53、偏头痛132及OA候选
- 工作：核查人员重叠、缓存和目标队列可用性。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：跨队列样本与输入准备

原20名留出者已进入开发评价，不再视作新留出。

<details><summary>参数、完整记录与依据</summary>

原标题：固定SPD：其他来源队列可用性核查

原摘要：14项现有队列/来源记录中，尚无可直接用于未参与开发的同终点独立确认的数据包。ZAN54与Emo53具有AAL90时序和同义四协变量，可准备固定模型的跨病因外部探索；两者都已参与开发。偏头痛132的协变量列含义不同，不能直接接入当前模型。

原结果：历史SRPBS79＋20与当前99同人同序，原20已全部进入当前SPD外层评价，不能重新称留出。ZAN54、Emo53、偏头痛132的缓存均有限、人员键唯一；数组能读与独立验证成立分别判断。OA当前27份为8数值通过、19未通过、全27待审核，训练纳入仍0。

具体方法：只读四队列缓存和已有来源记录；服务器精确连接历史79/20与当前99，核对OA当前27条状态；没有MRI读取、训练、预测或审核修改。

限制：本轮没有产生新AUC。不同病因的Pain/HC不是同一种疾病确诊；旧开发队列上的新模型评估只能称同来源/跨病因开发复核。命名空间ID交集为0不证明生物身份无重叠。当前SPD从零训练，没有使用ABIDE/DS旧预训练权重。未重查MRI、旧QC图或所有公开来源的新版本；表中按证据日期保留范围。

下一步：建议下一项有限工作：以ZAN54为主要、Emo53为次要，准备固定权重跨病因迁移方案，复用75个来源支持面板的375成员，不在目标侧拟合参考、Scaler、校准或选参；每个M5仍只来自同一批2K来源训练者。保持各预算/支持/外折独立报告，不跨支持平均概率。本轮仅写方案，未执行900项拟议外部预测。严格独立确认继续寻找未开发且终点匹配的新来源；音乐队列先补输入/QC及与Emo去重。

依据：spd-external-readiness-20261017、spd-external-readiness-20261017-summary、spd-external-readiness-20261017-matrix、spd-external-readiness-20261017-comparison、spd-external-readiness-20261017-inputs、spd-external-readiness-20261017-plan

</details>

## 2026-10-17　固定SPD跨队列评估：ZAN54与Emo53

- 模型：SRPBS来源固定SPDNet集成
- 数据：SRPBS来源每类5／10／20标签；ZAN54与Emo53目标标签0
- 工作：保持来源模型固定，在其他队列检验集成。
- 性能变化：六项主要AUC增量约1.11–1.43个百分点，但区间全部跨0；目标AUC区间也含0.5。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 原论文 baseline：[Emo底层队列的纤维肌痛原研究](https://pubmed.ncbi.nlm.nih.gov/39522892/)。原研究33名患者＋33名对照，诊断AUC约0.65。 当前Emo53的纳入、处理与模型评价不同；该值作为数据集原研究参照，不能当成本批模型消融的baseline。
- 修改板块：跨队列模型迁移

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：固定SPD跨队列评估：ZAN54与Emo53

原摘要：复用75个来源支持面板与375成员，在ZAN54、Emo53各完成450项评价，共900项（750成员、150集成）；新增分类训练、来源/目标总体参考、目标Scaler或校准拟合均0。集成平均目标AUC：ZAN54（主要） K5 0.5213, K10 0.5310, K20 0.5316；Emo53（次要） K5 0.5522, K10 0.5601, K20 0.5666。

原结果：ZAN54（主要） K5主要ΔAUC +0.0119，条件95%[-0.0237, 0.0480]，4/5支持重复正向；ZAN54（主要） K10主要ΔAUC +0.0131，条件95%[-0.0251, 0.0521]，5/5支持重复正向；ZAN54（主要） K20主要ΔAUC +0.0143，条件95%[-0.0299, 0.0581]，5/5支持重复正向；Emo53（次要） K5主要ΔAUC +0.0141，条件95%[-0.0197, 0.0477]，4/5支持重复正向；Emo53（次要） K10主要ΔAUC +0.0143，条件95%[-0.0209, 0.0504]，5/5支持重复正向；Emo53（次要） K20主要ΔAUC +0.0111，条件95%[-0.0263, 0.0486]，5/5支持重复正向。 六个主要增量区间全部跨0，两个目标所有预算的集成AUC区间均包含0.5；未证明固定来源模型具有可靠跨队列判别或集成迁移增量。本轮停止该固定来源迁移配置的追加搜索。

具体方法：原75支持参考/375来源成员固定；107份目标逐人协方差、两目标各450评价。目标白化/Scaler/校准及分类拟合0，全部目标/预算/种子保留，独立指标和条件人员区间复核。

限制：ZAN和Emo均已有开发记录，病因与SRPBS异质Pain/HC不同，本轮是零目标标签拟合的跨病因外部探索，不是未开发同终点独立临床确认。十二个主副比较未校正；人员区间条件于保存来源模型/目标预测，不含重训或开发选择。来源五折不是目标外折，支持/预算相关；概率误差相对成员均值的收益部分由凸性保证。

下一步：六个主要增量区间全部跨0，两个目标所有预算的集成AUC区间均包含0.5；未证明固定来源模型具有可靠跨队列判别或集成迁移增量。本轮停止该固定来源迁移配置的追加搜索。 保留来源内正向结果与本次迁移阴性结果，不反转低AUC概率、不用目标成绩改标签或阈值。后续如研究少量目标标签能否适配，须另列真实目标支持预算和有限方案，不能把适配结果叫作零目标标签验证；本轮未启动适配训练。

依据：spd-transfer-20261017、spd-transfer-20261017-summary、spd-transfer-20261017-metrics、spd-transfer-20261017-comparison、spd-transfer-20261017-means、spd-transfer-20261017-contrasts、spd-transfer-20261017-diagnostics、spd-transfer-20261017-plan、spd-transfer-20261017-code

</details>

## 2026-10-17　SPD少量目标标签适配：ZAN54与Emo53

- 模型：来源SPDNet＋少标签分类头适配
- 数据：ZAN54、Emo53，每类5／10标签
- 工作：用少量目标标签对来源模型分类头做暖启动适配。
- 性能变化：四个集成AUC差均为负，区间均跨0，未见可靠适配收益。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：目标分类头的暖启动

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SPD少量目标标签适配：ZAN54与Emo53

原摘要：完成2,000次目标支持集分类头适配，保存全部头；1,200项折外评价含固定/适配各600项。五成员集成AUC：ZAN固定0.5316，目标每类5人适配0.4913、10人0.4908；Emo固定0.5666，对应0.5094、0.5040。新增目标Scaler/总体参考拟合0。

原结果：四个集成ΔAUC均为负，条件95%区间均跨0，未见少量目标标签暖启动分类头的可靠收益。ZAN K10和Emo K5/K10五次支持重复均下降；ZAN K5仅1/5正向。八个集成/成员均值比较全部保留；Emo K5成员均值差的未校正条件区间为负。训练损失下降不代表测试改善，本轮停止此配置追加调参。

具体方法：来源K20的125成员表示与变换冻结；目标每类5/10人、原ZAN五折/Emo三折。2000头拟合，1200 OOF与4800折级固定/适配同人评价，全部seed保留。OA62/64源文件可定位，GSR和协变量缺口保留。

限制：这是已开发队列的按人交叉验证，不是全局永久留出或独立临床确认。10/20标签是每次拟合的预算，完整交叉验证使用两队列全部107人的标签进行开发与评分。只在每折支持人拟合，测试人不参与Scaler、参考、训练或选参；跨折有不同适配头。人员区间条件于已保存预测，不覆盖折间训练依赖、重训和开发选择；八个比较未校正。支持重复同时改变来源与目标支持。适配额外使用10/20个目标标签，不能称零标签迁移。

下一步：停止这组分类头学习率/轮次/解冻搜索。OA下一分支以历史62人（44患者/18对照）为主要开发输入、64人为重叠敏感性版本，先从原ROI及头动记录补齐输入；旧GSR与当前无GSR分别登记，不能填零冒充FD/删帧比例。OA/HC诊断与三组治疗反应分开，保留原失败/QC状态。

依据：spd-adapt-20261017、spd-adapt-20261017-summary、spd-adapt-20261017-metrics、spd-adapt-20261017-comparison、spd-adapt-20261017-means、spd-adapt-20261017-contrasts、spd-adapt-20261017-diagnostics、spd-adapt-20261017-plan、spd-adapt-20261017-oa、spd-adapt-20261017-folds、spd-adapt-20261017-losses

</details>

## 2026-10-17　OA旧GSR：头动补齐与小样本SPD

- 模型：SPDNet与随机冻结几何、协变量参照
- 数据：OA旧GSR 37人，每类5／10标签
- 工作：补齐头动后进行匹配小样本比较。
- 性能变化：比随机几何AUC约+0.97／+3.03个百分点，但两区间跨0；未证明训练几何的可靠收益。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：小样本几何表示与协变量控制

旧处理与来源混杂保留，不能当独立OA疾病验证。

<details><summary>参数、完整记录与依据</summary>

原标题：OA旧GSR：头动补齐与小样本SPD

原摘要：完成原62人ROI/头动/FD读回与协变量补齐；实际37人旧GSR子集750拟合（250完整SPD、250冻结几何头、250协变量头）、180项OOF及900项折级评价。五成员集成平均AUC：K5 本地SPD 0.5285, 随机冻结几何 0.5188, 仅协变量 0.4582；K10 本地SPD 0.5485, 随机冻结几何 0.5182, 仅协变量 0.3879。

原结果：K5 SPD减随机冻结几何 ΔAUC +0.0097，条件95%[-0.0093,0.0287]，4/5支持正向；K5 SPD减仅协变量 ΔAUC +0.0703，条件95%[-0.0423,0.1804]，3/5支持正向；K10 SPD减随机冻结几何 ΔAUC +0.0303，条件95%[-0.0024,0.0649]，5/5支持正向；K10 SPD减仅协变量 ΔAUC +0.1606，条件95%[-0.0247,0.3480]，5/5支持正向。 预设K5主要增量区间包含0，未证明训练SPD几何相对随机冻结几何有可靠收益。 八个预设比较的条件区间均跨0。 八个集成/成员均值比较全部保留，未按成绩挑选种子、K或支持集合。

具体方法：OA原62人头动/FD/ROI完整读回；保留原排除并按原阈值共排25，37人旧GSR开发。原首重复五折、每类5/10、五支持五seed，三固定条件750拟合；参考数值失败后保持容差修复并只续算未完成480拟合，原270模型保留。

限制：旧GSR37人是历史62人的运动条件开发子集，既有62/64已用于研究；不是独立临床验证，也不等于新流水线QC通过或专家纳入。病例/对照的研究、采集及原/修复处理混杂仍可能影响判别。K5/K10指每次拟合10/20标签，完整37标签均进入交叉验证开发/评分。测试人不参与该折变换/训练/选参；不同折可改变人员角色。区间仅条件于保存OOF概率，不含折间训练依赖、重训或选择；八个比较未校正。

下一步：本轮有限750拟合到此结束，停止在该37人旧GSR子集追加K/学习率/轮次/成员搜索。保留所有正负结果，下一步优先核查病例/对照研究来源与处理流程混杂能否在真实资料中区分；若不能，保留为方法开发材料，转向有可比较病例/对照的独立队列。OA疗效仍需真实基线与时点及原质量问题处理，不把HC当不应答者。

依据：oa-spd-20261017、oa-spd-20261017-summary、oa-spd-20261017-metrics、oa-spd-20261017-comparison、oa-spd-20261017-means、oa-spd-20261017-contrasts、oa-spd-20261017-diagnostics、oa-spd-20261017-plan、oa-spd-20261017-inputs、oa-spd-20261017-folds、oa-spd-20261017-losses

</details>

## 2026-10-17　OA病例与对照：哪些比较仍然有效

- 模型：既有SPDNet模型
- 数据：OA旧GSR 37人
- 工作：复核病例、对照来源与处理差异，限定已有成绩的解释。
- 性能变化：原K5／K10 AUC 0.5285／0.5485保持；本条未产生新AUC增益。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：来源与预处理混杂核查

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：OA病例与对照：哪些比较仍然有效

原摘要：OA来源76人、历史62人及已评估37人的研究/扫描头/处理核查完成。37人中原处理16病例/10对照，修复版6病例/5对照；处理版本未与诊断完全绑定。病例研究1/2可识别，全部对照的研究编号缺失，真实采集批次仍不明。

原结果：现有结果可保留为同人同预算的算法开发比较；不能据此把诊断差异解释为排除来源与处理混杂的OA疾病效应，也不能作为独立临床验证。原K5/K10的SPD M5平均AUC为0.5285/0.5485，所有八项增量区间跨0，结论不变。

具体方法：只读152原始头、共享元数据、旧配置、76对回归矩阵及18修复汇总；按原人员键核查研究/采集/处理/帧数共同支持，不拟合、不重计分、不选测试赢家。

限制：原始BOLD头的空间网格与TR在两类一致；处理后帧数存在类别不对称。HC研究批次、逐人采集日期/设备标识及完整旧处理执行记录尚缺；论文/元数据/扫描头矛盾保留。25排除、旧GSR、新版QC及三个临床终点分别保留；本轮无新训练或重新计分。

下一步：先整理现存逐人采集/旧处理日志，补全HC真实批次与原始帧到处理帧的对应，并核实36/40层和T1 TR矛盾。若这些记录可追溯，再在已测共同支持层上预先限定处理敏感性比较；独立验证仍需来源明确、流程一致且未参与开发的队列，不追加OA模型搜索。

依据：oa-confounds-20261017、oa-confounds-20261017-summary、oa-confounds-20261017-comparison、oa-confounds-20261017-strata、oa-confounds-20261017-overlap、oa-confounds-20261017-acquisition、oa-confounds-20261017-processing、oa-confounds-20261017-balance、oa-confounds-20261017-plan

</details>

## 2026-10-17　OA早期时序异常：敏感性分析暂未启动

- 模型：原SPDNet敏感性方案未执行
- 数据：OA旧GSR输入
- 工作：追查早期工作时序异常，判断能否建立共同时间轴。
- 性能变化：新比较未启动，没有新AUC；保留原0.5285／0.5485。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：时序输入与敏感性分析

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：OA早期时序异常：敏感性分析暂未启动

原摘要：少5帧的8名HC并非单纯多裁一个前缀：早期FunRaw中段的原扫描偏移从15变10，出现重复；其中3例边界在五个抽样体素中混合了两个原始帧的值。work2精确继承该异常再裁前10帧。原62/37中分别涉及7/5名HC。

原结果：额外5帧问题已定位到早期工作输入，不属于原始采集短少。数值特征与未完整完成的原地裁除写回相符，具体执行事件仍缺日志。预定267帧共同窗无法由此建立一致原始时间轴，500拟合方案未启动，新AUC为0项；原AUC0.5285/0.5485、全部种子和阴性结果保留。

具体方法：76人五固定坐标逐帧核对，8例追加逐帧索引/边界混合及原始两份来源对照；456中间头/八配置/原协议；267帧条件不满足，新增模型和AUC均0。

限制：68人有精确连续前缀对应，8名HC存在中段回跳；五点追踪不宣称全体素核对。原始两份来源在这8人的抽样点全时序相同。HC第二阶段同期采集只有协议计划线索，实际逐人批次仍未确认。未删掉5名HC凑新成绩，未改标签、25排除、QC/专家状态或临床目标。

下一步：OA旧异常时序暂停新增模型；如继续OA，应从保留的原始MRI另列统一重建和真实QC复核，不能仅在旧ROI末端裁帧修复。70多AUC的SRPBS99候选另有单一初始子空间近端约束方案（375拟合，尚未启动）；推广需同终点、来源明确的未开发数据。

依据：oa-early-20261017、oa-early-20261017-summary、oa-early-20261017-comparison、oa-early-20261017-frames、oa-early-20261017-configs、oa-early-20261017-diagnostics、oa-early-20261017-readiness、oa-early-20261017-processing、oa-early-20261017-plan

</details>

## 2026-10-17　SRPBS99近端约束：同人同预算比较

- 模型：SPDNet＋近端约束
- 数据：SRPBS99，每类5／10／20标签
- 工作：在共同人员和训练预算下约束参数偏移。
- 性能变化：三个预算的ΔAUC均为0，未产生判别增益。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：分类训练的近端约束

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SRPBS99近端约束：同人同预算比较

原摘要：新增375个近端约束模型完成，375次严格重载及独立NumPy谱前向通过；复用原375模型及75训练侧参考，新增传统模型0。M5平均外折AUC（原→近端）：K5 0.713467→0.713467；K10 0.731592→0.731592；K20 0.775604→0.775604。

原结果：K5主要ΔAUC +0.000000，条件95%[0.000000, 0.000000]，0/5支持重复、0/5外折正向；K10次要ΔAUC +0.000000，条件95%[0.000000, 0.000000]，0/5支持重复、0/5外折正向；K20次要ΔAUC +0.000000，条件95%[0.000000, 0.000000]，0/5支持重复、0/5外折正向。全部75个M5外测试评价的AUC相同；概率略有变化，Brier/logloss仅有微小变化。K5主要比较没有得到稳定增量，结束这一固定系数配置，不继续扫描系数或根据测试分数挑种子。

具体方法：固定初始子空间近端系数0.01，75原支持×五初始化，复用75参考，200轮。五外折指标均值，2000共同人员抽样配对。

限制：主要估计为五外折指标等权均值，再平均全部支持及初始化，沿用原口径，不换成跨折OOF。K5 M5为主要比较，K10/K20和单成员为次要，未作多重校正。2000次共同99人员重抽样有效1999次、无效1次；区间只条件于保存预测，不包含重训、开发选择或新来源。M5差值区间[0,0]来自本批预测排序相同，不代表总体差异已确定为零。该队列已用于开发，所有新成绩仍是开发复核；支持重复SD条件于固定五初始化。人员、标签、QC及独立临床验证状态未改变。

下一步：K5主要比较没有得到稳定增量，结束这一固定系数配置，不继续扫描系数或根据测试分数挑种子。 保留原固定M5作为当前候选，整理全部正负结果；如继续改模型，先提出新的单一假设及固定预算方案，不自动扩大搜索。跨来源推广需另有同终点、来源和处理明确的真实数据；ZAN/Emo适配阴性及OA旧时序限制保留。

依据：spd-proximal-20261017、spd-proximal-20261017-summary、spd-proximal-20261017-comparison、spd-proximal-20261017-plan、spd-proximal-20261017-panels、spd-proximal-20261017-means、spd-proximal-20261017-contrasts、spd-proximal-20261017-diagnostics、spd-proximal-20261017-paired、spd-proximal-20261017-seeds

</details>

## 2026-10-17　SRPBS99余弦分类头：同人同预算比较

- 模型：SPDNet＋余弦分类头
- 数据：SRPBS99，每类5／10／20标签
- 工作：将原分类头替换为余弦分类。
- 性能变化：AUC约−0.17／+1.07／+0.25个百分点，区间均跨0，概率误差均变差。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：分类头结构

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SRPBS99余弦分类头：同人同预算比较

原摘要：新增375个SPD余弦头模型及75个M5评价完成；原375及近端375模型保持。M5平均外折AUC（原→余弦）：K5 0.713467→0.711725；K10 0.731592→0.742275；K20 0.775604→0.778137。复用75训练侧参考，新参考／传统模型拟合0。

原结果：K5主要ΔAUC -0.001741，条件95%[-0.015081, 0.011648]，3/5支持重复、2/5外折正向；K10次要ΔAUC +0.010683，条件95%[-0.008664, 0.030398]，4/5支持重复、4/5外折正向；K20次要ΔAUC +0.002533，条件95%[-0.017126, 0.021211]，3/5支持重复、3/5外折正向。三个预算M5的Brier和logloss均变差，局部AUC增加不代表概率预测整体改善。K5主要比较未获得稳定增量，结束这一固定余弦头配置，不追加温度、轮数或种子搜索。

具体方法：固定温度2的归一化余弦分类头，75原支持×五初始化，复用75参考，200轮。五外折指标均值，2000共同人员抽样配对。

限制：主估计为五外折指标等权均值，再平均全部支持和初始化；不更换为跨折OOF。K5 M5主要，其他预算及成员均值次要，未多重校正。2000共同99人员抽样1999有效／1缺类别无效，区间只条件于固定预测，不涵盖重训、开发选择或独立来源；五支持重复SD条件于固定五初始化。原队列已反复开发，本轮仍是开发比较。余弦头参考已有少样本方法，属于本地二分类适配，不是官方视觉任务完整复现或已证明新方法。

下一步：K5主要比较未获得稳定增量，结束这一固定余弦头配置，不追加温度、轮数或种子搜索。 保留原固定SPD M5，汇总已尝试的负结果；下一模型实验须另有具体假设和有限方案，不能连续扫描直到好看。 OA旧时序问题及ZAN/Emo迁移和适配阴性保持；临床终点、QC和独立验证状态不变。

依据：spd-cosine-20261017、spd-cosine-20261017-summary、spd-cosine-20261017-comparison、spd-cosine-20261017-plan、spd-cosine-20261017-panels、spd-cosine-20261017-means、spd-cosine-20261017-contrasts、spd-cosine-20261017-diagnostics、spd-cosine-20261017-paired、spd-cosine-20261017-seeds

</details>

## 2026-10-17　SRPBS99对数先行网络：同人同预算比较

- 模型：SPDNet对数先行网络
- 数据：SRPBS99，每类5／10／20标签
- 工作：将协方差取对数放到网络前端。
- 性能变化：AUC约−2.33／−0.47／−2.73个百分点，区间均跨0，概率指标也变差。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：几何算子的顺序

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SRPBS99对数先行网络：同人同预算比较

原摘要：本轮375个对数先行模型、375严格重载和75个M5评价完成；原模型、近端及余弦头共1125旧模型保持。M5平均外折AUC（原→对数先行）：K5 0.713467→0.690174；K10 0.731592→0.726905；K20 0.775604→0.748315。复用75支持侧参考，新参考／传统模型拟合0。

原结果：K5主要ΔAUC -0.023293，条件95%[-0.058874, 0.010178]，0/5支持重复、1/5外折正向；ΔBrier +0.001891、Δlogloss +0.005127（负值更好）；K10次要ΔAUC -0.004687，条件95%[-0.042075, 0.030332]，1/5支持重复、2/5外折正向；ΔBrier +0.003657、Δlogloss +0.017382（负值更好）；K20次要ΔAUC -0.027289，条件95%[-0.068400, 0.005555]，0/5支持重复、0/5外折正向；ΔBrier +0.008167、Δlogloss +0.026291（负值更好）。K5主要比较未得到稳定增量，结束这一次算子顺序配置，不扫描混合比例、维数、轮数或种子追分。

具体方法：完整90维矩阵先log、再90→16正交双线性投影，原线性头及幅度保留，75原支持×五初始化，复用75参考，200轮。五外折指标均值，2000共同人员抽样配对。

限制：五外折指标等权再平均全部支持和初始化，沿原口径，不换成跨折OOF。K5 M5主要，K10/K20及成员均值次要，未多重校正。2000共同99人员抽样1999有效／1缺类别无效，区间仅条件于保存预测，不含重训、开发选择或新来源；支持SD条件于固定五初始化。本队列已反复开发，属于开发比较；本地切空间双线性适配不称官方SPDNet完整复现、全新数学方法或独立临床验证。

下一步：K5主要比较未得到稳定增量，结束这一次算子顺序配置，不扫描混合比例、维数、轮数或种子追分。 保留原M5，汇总全部失败假设及现有候选，下一模型方案须另有具体机制和有限预算，不连续扫描直到好看。 OA旧时序及ZAN/Emo迁移/适配阴性保持，三临床终点和QC不变。

依据：spd-logfirst-20261017、spd-logfirst-20261017-summary、spd-logfirst-20261017-comparison、spd-logfirst-20261017-plan、spd-logfirst-20261017-panels、spd-logfirst-20261017-means、spd-logfirst-20261017-contrasts、spd-logfirst-20261017-diagnostics、spd-logfirst-20261017-paired、spd-logfirst-20261017-seeds

</details>

## 2026-10-17　SRPBS99支持自排除条件头：同人同预算比较

- 模型：SPDNet＋支持自排除条件头
- 数据：SRPBS99，每类5／10／20标签
- 工作：用排除自身的支持集信息构造条件分类头。
- 性能变化：AUC约−0.30／+0.04／+0.09个百分点，均跨0，未改善概率质量。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：支持集条件分类头

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SRPBS99支持自排除条件头：同人同预算比较

原摘要：新375模型、375严格重载和75个M5评价完成，原四模型1500旧模型保持。M5平均外折AUC（原→条件头）：K5 0.713467→0.710501；K10 0.731592→0.732004；K20 0.775604→0.776529。逐面板支持诊断及新训练均未用该面板查询人拟合；复用75参考，新参考／独立传统模型参照0。

原结果：K5主要ΔAUC -0.002966，条件95%[-0.020330, 0.014074]，2/5支持重复、2/5外折正向；ΔBrier +0.010040、Δlogloss +0.019095（负值更好）；K10次要ΔAUC +0.000412，条件95%[-0.018742, 0.019873]，2/5支持重复、3/5外折正向；ΔBrier +0.014963、Δlogloss +0.029950（负值更好）；K20次要ΔAUC +0.000925，条件95%[-0.015470, 0.017936]，3/5支持重复、3/5外折正向；ΔBrier +0.015751、Δlogloss +0.034774（负值更好）。主要K5未同时满足稳定AUC增量及概率质量不恶化，结束这一固定条件头配置，不追加lambda、校准初值或轮数搜索。

具体方法：保留原SPD编码器，支持条件ridge头/可学习校准与自排除训练损失，75原支持×五初始化，复用75参考，200轮。五外折指标均值，2000共同人员抽样配对。

限制：自排除仅是训练目标：编码器、尺度和校准使用所有支持者，不能称诚实LOOCV或独立验证。外test完全不进入训练/求解/尺度/校准/选轮。主估计沿五外折指标等权再平均全支持及初始化，K5 M5主要，其他预算/成员均值次要，未多重校正；2000共同99人重抽样1999有效/1缺类别排除，区间仅条件保存预测，不含重训/开发选择/新来源。本队列反复开发，仍是开发比较。R2D2思路的本地二分类适配不是官方视觉或跨未见类别任务复现。

下一步：主要K5未同时满足稳定AUC增量及概率质量不恶化，结束这一固定条件头配置，不追加lambda、校准初值或轮数搜索。 保留原M5，继续保存支持侧诊断与所有失败假设；下一步须由新的训练侧证据或真实独立来源支持，不根据外层成绩连续换模块。 标签/QC、OA旧时序、ZAN/Emo阴性、三临床终点保持。

依据：spd-crossridge-20261017、spd-crossridge-20261017-summary、spd-crossridge-20261017-comparison、spd-crossridge-20261017-plan、spd-crossridge-20261017-panels、spd-crossridge-20261017-means、spd-crossridge-20261017-contrasts、spd-crossridge-20261017-diagnostics、spd-crossridge-20261017-paired、spd-crossridge-20261017-seeds

</details>

## 2026-10-17　SRPBS99训练核查与动量优化：同人同预算比较

- 模型：SPDNet＋动量优化
- 数据：SRPBS99，每类5／10／20标签
- 工作：核对训练实现后，在共同预算下比较优化器。
- 性能变化：AUC约+0.14／+0.23／−0.50个百分点，区间均跨0；概率误差变差。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：训练优化方式

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SRPBS99训练核查与动量优化：同人同预算比较

原摘要：训练核查未发现所测梯度/SGD/谱截断错误，200轮训练目标仍可下降。375正式动量模型及75个M5已完成；M5平均外折AUC（原→动量）：K5 0.713467→0.714861；K10 0.731592→0.733931；K20 0.775604→0.770586。原1875模型及15续训权重保留；复用75参考，不新增传统参照、标签或人员。

原结果：K5主要ΔAUC +0.001394，条件95%[-0.011957, 0.015366]，3/5支持重复正向；ΔBrier +0.008960、Δlogloss +0.043150（负值更好）；K10次要ΔAUC +0.002339，条件95%[-0.014347, 0.019995]，3/5支持重复正向；ΔBrier +0.006722、Δlogloss +0.038284（负值更好）；K20次要ΔAUC -0.005018，条件95%[-0.020254, 0.009253]，1/5支持重复正向；ΔBrier +0.005712、Δlogloss +0.037965（负值更好）。同预算动量未满足本轮K5稳定增益与概率不恶化条件，停止此配置，保留原M5，不追加动量、学习率或轮数扫描。

具体方法：原SPD架构不变，只把无动量SGD改为切向运输动量0.9、同200轮；另15条支持侧续训不预测查询，75原支持×五初始化，复用75参考，200轮。五外折指标均值，2000共同人员抽样配对。

限制：训练目标未充分优化不等于泛化瓶颈已证；旧支持训练AUC已全1。独立原生谱梯度/SGD核对覆盖原SPD375个，其他旧模型核查支持侧目标与梯度，不能称所有潜在错误已排除。续训仅15条原outer0/repeat0、全部五seed，不预测查询。五外折指标等权再平均全部支持/初始化，K5 M5主要，其余次要，未多重校正；2000共同99人条件预测抽样1999有效/1无效，不覆盖重训/研究选择/独立来源。本队列已开发，不是临床或独立验证。

下一步：同预算动量未满足本轮K5稳定增益与概率不恶化条件，停止此配置，保留原M5，不追加动量、学习率或轮数扫描。 训练目标与外层泛化分开判断；下一步优先寻找已核实无查询重叠的表示来源或独立同终点证据，再决定模型，不以更低支持损失或最高seed继续追分。 OA旧时序、ZAN/Emo阴性、标签/QC及三临床终点保持。

依据：spd-momentum-20261017、spd-momentum-20261017-summary、spd-momentum-20261017-comparison、spd-momentum-20261017-plan、spd-momentum-20261017-panels、spd-momentum-20261017-means、spd-momentum-20261017-contrasts、spd-momentum-20261017-diagnostics、spd-momentum-20261017-paired、spd-momentum-20261017-seeds

</details>

## 2026-10-17　SRPBS50无标签几何预训练：跨人同支持比较

- 模型：无标签几何预训练SPDNet
- 数据：来源SRPBS50人；目标SRPBS99
- 工作：先学习来源协方差几何，再做同支持集分类。
- 性能变化：比随机来源AUC约+0.17／−0.16／−0.12个百分点，均跨0；三个预算也都低于旧原模型。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：无标签几何预训练

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SRPBS50无标签几何预训练：跨人同支持比较

原摘要：来源核查与五seed执行完成。M5平均外折AUC（随机冻结→预训练冻结；旧原）：K5 0.696263→0.697960；原0.713467；K10 0.725014→0.723451；原0.731592；K20 0.757863→0.756655；原0.775604。两新臂使用同一来源白化与原支持标签；旧原使用支持白化，额外无标签数据/预训练成本不同。

原结果：K5 预训练−随机ΔAUC +0.001697，条件95%[-0.002956, 0.006800]，4/5支持重复正向，ΔBrier +0.000082、Δlogloss +0.000188；K5 预训练−旧原ΔAUC -0.015507，条件95%[-0.045682, 0.013103]，0/5支持重复正向，ΔBrier +0.000037、Δlogloss -0.000140；K10 预训练−随机ΔAUC -0.001564，条件95%[-0.007206, 0.003699]，1/5支持重复正向，ΔBrier +0.000100、Δlogloss +0.000225；K10 预训练−旧原ΔAUC -0.008141，条件95%[-0.039024, 0.023572]，2/5支持重复正向，ΔBrier +0.002619、Δlogloss +0.008217；K20 预训练−随机ΔAUC -0.001208，条件95%[-0.005839, 0.003163]，1/5支持重复正向，ΔBrier +0.000130、Δlogloss +0.000204；K20 预训练−旧原ΔAUC -0.018949，条件95%[-0.053149, 0.008835]，2/5支持重复正向，ΔBrier +0.006081、Δlogloss +0.012817（概率误差负值更好）。未获得稳定的主要预训练效应，停止该相对几何目标；保留原M5，不扫预训练轮数、学习率、维数或源子集追分。

具体方法：源50无标签相对距离预训练五编码器，与同源白化的随机冻结编码器作750头同支持对照；源参考1、每阶段200轮、各保留五初始化。五外折指标均值，2000共同人员抽样配对。

限制：来源互斥是同一SRPBS登记人员键核对，不是生物身份鉴定；不同站点/时长/处理差异保留。主比较K5预训练减同源白化随机冻结，其余次要；与旧端到端SPD不是同总信息或同预训练成本。五外折指标等权再平均支持/初始化，2000共同99人条件预测抽样1999有效/1无效，未多重校正，不覆盖重训/开发选择/独立来源。当前99及旧来源已开发，不能称新独立临床验证。

下一步：未获得稳定的主要预训练效应，停止该相对几何目标；保留原M5，不扫预训练轮数、学习率、维数或源子集追分。 来源无重叠已解决本轮训练资格，但不能把非疼痛群体几何等同疼痛判别信息；下一步需新的源训练内任务依据或真正同终点独立数据，不扩大几何损失搜索。 原标签/QC、OA旧时序、ZAN/Emo阴性、CoSpine13留出、TN14停止及三临床终点保持。

依据：spd-sourcegeo-20261017、spd-sourcegeo-20261017-summary、spd-sourcegeo-20261017-comparison、spd-sourcegeo-20261017-plan、spd-sourcegeo-20261017-panels、spd-sourcegeo-20261017-means、spd-sourcegeo-20261017-contrasts、spd-sourcegeo-20261017-diagnostics、spd-sourcegeo-20261017-paired、spd-sourcegeo-20261017-seeds

</details>

## 2026-10-17　几何预训练充分性与疼痛原型约束SPD

- 模型：SPDNet疼痛原型约束与加强来源预训练
- 数据：来源SRPBS50人；目标SRPBS99
- 工作：分别检验疼痛原型约束和更充分的来源训练。
- 性能变化：原型约束增量接近0；加强来源训练比旧原模型低约10.06／9.17／8.76个百分点。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：预训练充分性与类别原型

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：几何预训练充分性与疼痛原型约束SPD

原摘要：旧源200步明显未充分优化：五源平均几何损失0.040308→0.001505；40/10人留出平均误差从原SGD200步0.016790到加强2000步0.006769。但支持集疼痛关联下降、站点关联上升；几何学得更好没有自动变成疼痛判别信息。全局log幅度仅占完整距离约2.4%–2.8%，删除后疼痛关联未改善。 M5平均外折AUC（旧原→原型约束；加强源冻结）：K5 0.713467→0.715079；源加强0.597337；K10 0.731592→0.731588；源加强0.631798；K20 0.775604→0.775604；源加强0.669091。

原结果：K5 原型−旧原ΔAUC +0.001612，条件95%[-0.003204, 0.007296]，2/5支持重复正向，ΔBrier -0.000033、Δlogloss -0.000066；K5 加强源−旧200步ΔAUC -0.100622，条件95%[-0.151200, -0.045224]，0/5支持重复正向，ΔBrier +0.029094、Δlogloss +0.071086；K10 原型−旧原ΔAUC -0.000004，条件95%[-0.005396, 0.006949]，2/5支持重复正向，ΔBrier -0.000005、Δlogloss +0.000045；K10 加强源−旧200步ΔAUC -0.091653，条件95%[-0.149306, -0.031624]，0/5支持重复正向，ΔBrier +0.033088、Δlogloss +0.080253；K20 原型−旧原ΔAUC +0.000000，条件95%[-0.002155, 0.002051]，1/5支持重复正向，ΔBrier +0.000030、Δlogloss +0.000127；K20 加强源−旧200步ΔAUC -0.087564，条件95%[-0.159088, -0.020874]，0/5支持重复正向，ΔBrier +0.028483、Δlogloss +0.072406（概率误差负值更好）。主要比较未满足稳定增益条件，停止本次固定原型约束；保留旧原M5，不追加权重、温度或轮数搜索。

具体方法：固定源40/10人员留出与50人续训检查优化，75支持内检查疼痛/站点/FD关联；375原型SPD与旧原只差0.1辅助原型损失，375加强源冻结头另比旧200步。全部五初始化，200目标步；五外折等权及2000共同人员条件抽样。

限制：关联是既有开发支持集的中心化Gram描述，站点内按人999次置换仅作参照，未校正多重比较，重叠面板/seed不能当独立样本；不证明疼痛特异性或站点因果混杂。源50没有疼痛标签，登记身份排除不等于生物鉴定。主要比较K5原型−旧原；加强源冻结与原型模型的来源/白化/可训练参数不同，不能互作单因素归因。区间为2000次共同99人条件预测抽样（1999有效），不覆盖重训/方法选择。当前99已开发，无独立临床验证。

下一步：主要比较未满足稳定增益条件，停止本次固定原型约束；保留旧原M5，不追加权重、温度或轮数搜索。 本次加强源几何冻结迁移也因三个预算一致负迁移停止。支持内可行性核对：K5仅19/25面板具有至少两个同时含病例/对照的站点，K10/20为25/25；下一步先在较大支持预算内评估按站点留人的稳定性，再决定站点稳健训练，不直接扩大几何预训练或辅助损失搜索。原标签/QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三临床终点保持。

依据：spd-taskproto-20261017、spd-taskproto-20261017-summary、spd-taskproto-20261017-comparison、spd-taskproto-20261017-plan、spd-taskproto-20261017-panels、spd-taskproto-20261017-means、spd-taskproto-20261017-contrasts、spd-taskproto-20261017-diagnostics、spd-taskproto-20261017-paired、spd-taskproto-20261017-seeds

</details>

## 2026-10-17　K10/20训练内站点留出与混杂检查

- 模型：SPDNet及混杂参照
- 数据：SRPBS99，每类10／20标签
- 工作：在训练侧比较随机划分和站点留出。
- 性能变化：随机划分AUC比站点留出高5.92／4.16个百分点；这是评价分布差异，不能算算法提升。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：站点泛化与混杂诊断

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：K10/20训练内站点留出与混杂检查

原摘要：本轮仅在原支持人员内重拟合并评估，不读取外层查询成绩。K10可评估22/25支持面板、43个站点划分；K20为25/25、50个划分。其余44站点候选保留不适用原因，没有补0或按成绩排除。 训练内M5 AUC（随机留人→留站点）：K10 原SPD 0.639190→0.579991，协变量头0.525382→0.500015；K20 原SPD 0.704355→0.662737，协变量头0.514025→0.457612。

原结果：K10 随机−站点ΔAUC +0.059199，条件区间未给出（有效共同人员抽样不足100次），4/5支持重复正向；K20 随机−站点ΔAUC +0.041619，条件区间[-0.027375, 0.112007]，5/5支持重复正向。两个预算留站点AUC均≥0.55：满足；两个预算随机−站点差均≥0.03且至少4/5重复为正：满足；同一混杂参照在两预算随机AUC≥0.60、转站点下降≥0.03：未满足。未同时满足训练依据，本轮不启动预定站点组平衡候选，不扩展阈值或参数搜索；不据此否定其他稳健方法。

具体方法：原K10/20支持内逐站点留出及同训练/测试类数随机参照；每内训练重拟合参考和尺度，930 SPD及930协变量头，五seed/200步。固定权重分量消融与站点比例参照另列，外层查询不作训练决定。

限制：随机与站点划分的留出人员不同，比较的是同支持/同类别数预算的划分敏感性，不是同人预测差或站点因果效应。站点、年龄/性别/头动及影像分布仍可能交织；固定权重去协变量分量不等于消除影像混杂。站点比例参照在新站点退回总体比例，其AUC=0.5不证明无混杂。人员bootstrap区间仅覆盖这些固定预测；重叠支持/seed非独立，当前99已开发，不是独立验证。

下一步：保留原SPD，未启动本轮预定站点组平衡候选；站点差距存在，但协变量/站点比例捷径证据未同时满足，不代表所有站点稳健方法无效。下一步优先核对影像表示中同类人员的跨站点偏移及各站点方向的稳定性，再判断是否需要条件对齐；不直接扫描站点损失或重新挑参数。 原标签/QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三临床终点保持。

依据：spd-siteholdout-20261017、spd-siteholdout-20261017-summary、spd-siteholdout-20261017-comparison、spd-siteholdout-20261017-plan、spd-siteholdout-20261017-panels、spd-siteholdout-20261017-means、spd-siteholdout-20261017-contrasts、spd-siteholdout-20261017-diagnostics、spd-siteholdout-20261017-paired、spd-siteholdout-20261017-seeds、spd-siteholdout-20261017-coverage、spd-siteholdout-20261017-repeats

</details>

## 2026-10-17　K10/20同类跨站点偏移与总体幅度检查

- 模型：既有SPDNet几何特征
- 数据：SRPBS99训练内，每类10／20标签
- 工作：检查同类跨站点偏移，以及协方差总体幅度的影响。
- 性能变化：去幅度未改善站点泛化；本条未给出可确认的单一AUC增益。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：协方差尺度与站点混杂

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：K10/20同类跨站点偏移与总体幅度检查

原摘要：只在原K10/20支持人员内检查，复用250个原支持模型和930个内层模型，不新增拟合或外层查询评价。同类跨站点可比较面板为K10 21/25、K20 25/25；全部五seed、重复、置换及不适用原因保留。 留站点M5 AUC（原SPD→固定权重置幅度为训练均值）：K10 0.579991→0.445619；K20 0.662737→0.481369。两预算五次支持重复均下降；幅度保留变化、形状固定在训练均值且保留四协变量时分别为0.642105、0.672033。

原结果：当前判别明显依赖总体协方差幅度；去幅度并未改善站点泛化。去幅度投影形状的同类站点距离／类别内置换均值K10为1.096514、K20为1.247397，病例/对照偏移方向平均余弦仅0.081855、0.187399。存在部分站点差异，但两预算尚无足够一致的同类形状偏移支持固定条件对齐。

具体方法：原50支持面板同类跨站点质心偏移和999次类别内置换，250原模型表示与930内层模型幅度敏感性；保留全seed/参考，零新拟合，外层查询不作决定。

限制：固定权重幅度干预改变了原模型输入分布，不是形状模型重训，也不是因果调整。只幅度分量仍含原四协变量和训练形状均值截距。幅度指Ledoit-Wolf协方差的log行列式几何尺度，不能等同全脑平均BOLD或证明疼痛机制；采集、处理、头动和疾病差异仍可能交织。支持集重叠，当前99人均属开发，条件区间只覆盖固定预测，不是独立临床验证。

下一步：保留原SPD及幅度信息，停止当前无依据的条件对齐。下一步优先核对幅度与ROI方差、头动及采集/处理尺度的关系和同站点病例差异，再记录一个幅度与形状分支分别正则化的有限方案；不能直接采用本轮较高的幅度分量分数作为新模型成绩。原QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三临床终点要求保持。

依据：spd-conditionalshift-20261017、spd-conditionalshift-20261017-summary、spd-conditionalshift-20261017-comparison、spd-conditionalshift-20261017-plan、spd-conditionalshift-20261017-panels、spd-conditionalshift-20261017-means、spd-conditionalshift-20261017-contrasts、spd-conditionalshift-20261017-diagnostics、spd-conditionalshift-20261017-shift-panels、spd-conditionalshift-20261017-seeds、spd-conditionalshift-20261017-coverage、spd-conditionalshift-20261017-repeats、spd-conditionalshift-20261017-shift-means、spd-conditionalshift-20261017-shift-seeds、spd-conditionalshift-20261017-shift-repeats

</details>

## 2026-10-16　连接一致性加权正则：训练内三条件对照

- 模型：连接一致性加权分类
- 数据：SRPBS训练内分区
- 工作：按时序分段的一致性约束连接特征。
- 性能变化：比普通正则AUC +0.84个百分点，比打乱权重+1.61个百分点，两个区间均跨0。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：连接可靠性加权与正则化

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：连接一致性加权正则：训练内三条件对照

原摘要：SRPBS99，原15个内层训练/验证分区、三条件共45次固定拟合；不做外层最终训练或查询评分。平均内验证AUC：普通L2为0.7375，一致性加权0.7460，打乱权重0.7299。45个模型读回最大概率差0，CPU批处理约18秒。

原结果：没有达到预先继续标准。加权减普通ΔAUC +0.0084，条件95%[−0.0084,0.0262]、10/15分区正向；加权减打乱+0.0161，区间[−0.0036,0.0373]、9/15正向。两区间跨0，停止这组固定映射，不进入K5/K10/K20或扩参数搜索。

具体方法：训练人员同次扫描前后120帧，共用训练切空间参考；比较普通、真实一致性与打乱权重L2，四协变量相同，固定C=1；45模型读回和独立核算。

限制：15个内验证分区存在人员重叠，属于开发诊断；分区SD不是五种子SD，也不是独立重复。稳定性指同次扫描前后半段的跨人连接一致性，不是跨次重测可靠性。两项条件人员区间不覆盖重训和开发选择，未作多重比较校正。没有独立临床、小样本、扫描同期疼痛或疗效验证。

下一步：本配置按拟合前标准停止。下一项模型研究应先有独立于外层分数的新机制依据，明确真实监督人数与混杂对照；真实临床终点及独立人员验证仍待补齐。

依据：fc-stability-20261016、fc-stability-20261016-summary、fc-stability-20261016-metrics、fc-stability-20261016-comparison、fc-stability-20261016-means、fc-stability-20261016-contrasts、fc-stability-20261016-diagnostics、fc-stability-20261016-plan、fc-stability-20261016-code

</details>

## 2026-10-16　SPD几何网络：五种子训练内对照

- 模型：轻量SPDNet、无对数网络、强FC
- 数据：SRPBS99训练内开发分区
- 工作：检验协方差对数几何是否改善疾病分类。
- 性能变化：比同参数无对数网络AUC +3.18个百分点；比完整强FC低3.14个百分点，其差值区间跨0。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：协方差几何表示

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SPD几何网络：五种子训练内对照

原摘要：SRPBS99、原15个内分区，两个1581参数网络各五种子、固定200轮，另设完整切空间与仅协变量对照。150次神经＋30次线性拟合和读回完成，外层最终拟合及评分均为0。 平均内验证AUC：SPD矩阵对数网络 0.7291±0.0483；同参数无对数网络 0.6973±0.0457；完整切空间＋协变量Logistic 0.7605；仅四协变量Logistic 0.5847。

原结果：SPD减同参数无对数网络ΔAUC +0.0318，条件95%[0.0106, 0.0512]，5/5种子正向；SPD减完整切空间＋协变量LogisticΔAUC -0.0314，条件95%[-0.0766, 0.0121]，1/5种子正向；SPD减仅四协变量LogisticΔAUC +0.1444，条件95%[0.0647, 0.2271]，5/5种子正向。未同时达到拟合前继续条件，停止本组固定适配，不追加K5/K10/K20、外层评分或参数搜索。

具体方法：完整协方差、训练参考白化，比较同参数矩阵对数与线性谱函数；五种子固定200轮，另设完整切空间及协变量对照，180模型读回和独立核算。

限制：这里是相关内验证分区的开发结果：神经网络SD来自五个种子的15分区均值，线性参照是确定性15分区，不虚构五个种子。条件人员区间不包含重新训练和开发选择，三项比较未校正。作者原任务为视觉分类；本轮为自写单层诊断适配，未确立原创方法、稳健小样本或独立临床效度。

下一步：结束这组SPD适配。下一步优先核对诊断标签与站点/协变量、可用疼痛终点及独立人员数据，再决定下一项有依据的模型实验。 扫描同期疼痛、疗效及独立验证仍未完成。

依据：spd-geometry-20261016、spd-geometry-20261016-summary、spd-geometry-20261016-metrics、spd-geometry-20261016-comparison、spd-geometry-20261016-means、spd-geometry-20261016-contrasts、spd-geometry-20261016-diagnostics、spd-geometry-20261016-plan、spd-geometry-20261016-code

</details>

## 2026-10-16　SPD小样本：每类5／10／20人

- 模型：轻量SPDNet与无对数参照
- 数据：SRPBS99，每类5／10／20标签
- 工作：在三个标签预算下比较几何表示。
- 性能变化：AUC分别增加1.85／2.76／3.09个百分点，条件区间均为正；仍属同队列开发。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：几何表示与小样本标签预算

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SPD小样本：每类5／10／20人

原摘要：SRPBS99、原15个内分区、五次固定支持与初始化联合重复，两个1581参数神经网络各固定200轮，共450拟合和225份支持侧参考。每类5/10/20人仅使用10/20/40名有标签支持人员，外层最终拟合及评分0。 SPD平均内验证AUC：K5 0.6411±0.0203；K10 0.6855±0.0297；K20 0.7117±0.0394。

原结果：K5的SPD减无对数ΔAUC +0.0185，条件95%[0.0003, 0.0357]，5/5联合重复正向；K10的SPD减无对数ΔAUC +0.0276，条件95%[0.0066, 0.0470]，5/5联合重复正向；K20的SPD减无对数ΔAUC +0.0309，条件95%[0.0108, 0.0504]，5/5联合重复正向。 SPD的K20减K5为+0.0707；全部预算均已完成，不选择最高分预算或重复作为总体结果。

具体方法：225个支持侧参考；每类5/10/20人、五个固定支持和初始化重复，两个同参数神经网络固定200轮；450份模型读回及全部指标/条件区间核算。

限制：五次SD包含支持抽取和初始化变化，不是纯初始化SD；15分区人员相关。条件人员区间固定已保存预测，不覆盖重训、开发选择或独立来源，三个预算比较未校正。K5从零训练只有10人；诊断开发结果不等于稳健few-shot、疼痛分级或临床验证。

下一步：本轮450神经拟合已完成。后续可围绕K5的支持变化单独提出一项有限训练策略，继续以神经模型的实际指标和稳定性为阶段重点；不再以传统机器学习名次限制探索，不自动扩大本批参数。三临床终点及独立验证仍待完成。

依据：spd-small-sample-20261016、spd-small-sample-20261016-summary、spd-small-sample-20261016-metrics、spd-small-sample-20261016-comparison、spd-small-sample-20261016-means、spd-small-sample-20261016-contrasts、spd-small-sample-20261016-diagnostics、spd-small-sample-20261016-plan、spd-small-sample-20261016-code、spd-geometry-20261016-plan

</details>

## 2026-10-16　SPD小样本：Dropout与预测一致性

- 模型：SPDNet＋Dropout／预测一致性
- 数据：SRPBS99，每类5标签
- 工作：检验随机失活与重复预测一致性是否减少过拟合。
- 性能变化：一致性比普通Dropout AUC +0.05个百分点，比原SPD +0.14个百分点；区间均跨0。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：训练正则化

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SPD小样本：Dropout与预测一致性

原摘要：SRPBS99、原15内分区、五次支持与初始化联合重复，每类5人、总10名支持者。两新条件各固定200轮、1581参数，共150新拟合；复用75份支持侧参考，新增参考/传统模型/外层最终拟合及评分均为0。 平均内验证AUC：原SPD（已有结果） 0.6411±0.0203；SPD＋普通Dropout 0.6420±0.0210；SPD＋Dropout＋预测一致性 0.6425±0.0212。

原结果：一致性减普通DropoutΔAUC +0.0005，条件95%[-0.0008, 0.0018]，5/5联合重复正向；普通Dropout减原SPDΔAUC +0.0009，条件95%[-0.0012, 0.0031]，3/5联合重复正向；一致性减原SPDΔAUC +0.0014，条件95%[-0.0010, 0.0038]，3/5联合重复正向。 本组固定正则化没有稳定改善K5，结束该配置，不追加p、损失权重或轮数搜索。

具体方法：复用75份K5支持参考和原SPD预测；两新条件相同Dropout随机流与双前向，只有一致性损失系数0或1不同；150新模型读回，225指标和全部条件区间独立核算。

限制：五次SD同时含支持抽取与初始化变化；15内分区人员相关。三个比较未作多重校正，条件人员区间只基于保存预测，不覆盖重新训练、开发选择或独立人群。每类5人仍只有10名有标签训练者，不等于稳健few-shot或临床验证。

下一步：本组固定正则化没有稳定改善K5，结束该配置，不追加p、损失权重或轮数搜索。 本轮有限训练已完成，不自动扩大到K10/K20；下一项实验须另明确问题与预算，扫描同期疼痛、疗效和独立验证仍待完成。

依据：spd-rdrop-20261016、spd-rdrop-20261016-summary、spd-rdrop-20261016-metrics、spd-rdrop-20261016-comparison、spd-rdrop-20261016-means、spd-rdrop-20261016-contrasts、spd-rdrop-20261016-diagnostics、spd-rdrop-20261016-plan、spd-rdrop-20261016-code

</details>

## 2026-10-16　SPD小样本：低维几何投影

- 模型：紧凑投影SPDNet
- 数据：SRPBS99，每类5／10／20标签
- 工作：压缩几何投影，检验更小模型是否适合少标签。
- 性能变化：AUC分别下降6.23／7.52／5.47个百分点，三个区间全负。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：几何投影容量

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：SPD小样本：固定四维投影

原摘要：SRPBS99、原15内分区、每类5/10/20人、五次支持与初始化联合重复。新增225个四维SPD模型（375参数），引用225个原16维模型（1581参数），减少约76.28%参数；新参考/传统模型/外层最终训练及评分均为0。 紧凑4维平均内验证AUC：K5 0.5787±0.0147；K10 0.6102±0.0118；K20 0.6570±0.0244。

原结果：K5紧凑减原SPDΔAUC -0.0623，条件95%[-0.0903, -0.0325]，0/5联合重复正向；K10紧凑减原SPDΔAUC -0.0752，条件95%[-0.1050, -0.0451]，0/5联合重复正向；K20紧凑减原SPDΔAUC -0.0547，条件95%[-0.0858, -0.0225]，0/5联合重复正向。 固定四维压缩在三个预算均未改善平均AUC，结束本紧凑配置，不扫描维度追分。

具体方法：复用225份支持参考与原16维预测，固定BiMap输出四维、375参数、200轮，不扫描秩；225新模型读回与450项指标/条件区间独立核算。

限制：SD来自五个支持抽取与初始化联合重复；15内分区人员相关。三个预算比较未作多重校正，人员区间只条件于保存预测，不含重训、开发选择或独立人群。K5只有10名有标签支持者，参数更少不等于稳健few-shot或临床有效。

下一步：固定四维压缩在三个预算均未改善平均AUC，结束本紧凑配置，不扫描维度追分。 本轮225新拟合完成，不自动追加秩、轮数或其他正则化；三临床终点、独立人员与跨来源验证仍待完成。

依据：spd-compact-20261016、spd-compact-20261016-summary、spd-compact-20261016-metrics、spd-compact-20261016-comparison、spd-compact-20261016-means、spd-compact-20261016-contrasts、spd-compact-20261016-diagnostics、spd-compact-20261016-plan、spd-compact-20261016-code

</details>

## 2026-10-16　SPD小样本：同十人五初始化集成

- 模型：五成员SPDNet集成
- 数据：SRPBS99，同10名支持者
- 工作：在相同支持标签下融合不同初始化的预测。
- 性能变化：相对成员AUC均值增加3.76个百分点，条件区间全正；未显示支持抽样波动减小。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：预测集成

成员指标均值与预测集成是不同汇总方式，不能据AUC提高声称独立泛化。

<details><summary>参数、完整记录与依据</summary>

原标题：SPD小样本：同十人五初始化集成

原摘要：SRPBS99、原15内分区×五组K5支持×五初始化，形成375成员。复用75个已有模型，新增300次神经训练，得到75个五成员集成；实际预测指标450项。每个集成仍只用每类5人、共10名训练者，新增参考/传统模型/外层最终训练及评分均为0。 平均内验证AUC：单成员指标均值（375项） 0.6455；同十人五成员概率平均 0.6831；原对角单成员（75项） 0.6411。

原结果：集成减成员指标均值（主要）ΔAUC +0.0376，条件95%[0.0224, 0.0520]，5/5支持重复正向；集成减原对角单成员（副比较）ΔAUC +0.0420，条件95%[0.0183, 0.0628]，5/5支持重复正向。 固定M5集成出现正向AUC开发信号，可保留为候选；仍需另一预算或独立来源验证，不能宣称解决小样本泛化。 集成支持重复SD为0.0289，成员指标均值为0.0208；本轮没有显示支持抽样波动减小。

具体方法：复用75份支持参考及原成员，补齐75支持×五初始化，300新成员/75旧成员和75集成；等权概率平均，450项预测指标和条件区间独立核算。

限制：前两行SD为固定五初始化条件下的支持重复变化；历史对角SD同时改变支持与初始化。15分区人员相关，两个比较未校正，条件人员区间只基于保存预测，不包含重训、开发选择或独立人群。集成Brier/logloss相对成员指标均值的收益部分来自凸性，不等于独立校准证明。

下一步：固定M5集成出现正向AUC开发信号，可保留为候选；仍需另一预算或独立来源验证，不能宣称解决小样本泛化。 本轮有限300新拟合已完成，不自动扩大K10/K20或搜索成员；三临床终点、独立人员和跨来源验证仍待完成。

依据：spd-ensemble-20261016、spd-ensemble-20261016-summary、spd-ensemble-20261016-metrics、spd-ensemble-20261016-comparison、spd-ensemble-20261016-means、spd-ensemble-20261016-contrasts、spd-ensemble-20261016-diagnostics、spd-ensemble-20261016-plan、spd-ensemble-20261016-code

</details>

## 2026-10-16　固定五成员SPD：三个标签预算

- 模型：固定五成员SPDNet集成
- 数据：SRPBS99，每类5／10／20标签
- 工作：将固定集成策略扩展到三个标签预算。
- 性能变化：相对成员AUC均值分别增加3.76／4.97／5.35个百分点，条件区间均为正。
- 原论文 baseline：[SPDNet，AAAI 2017原文](https://ojs.aaai.org/index.php/AAAI/article/view/10866)。原文在HDM05动作、PaSC人脸和AFEW情绪等视觉任务评估分类；没有疼痛fMRI或SRPBS小样本AUC baseline。 本项目的单层轻量SPDNet、协变量和标签预算属于任务适配；AUC变化使用本批无对数、随机几何、原轻量模型或同人数成员参照。
- 修改板块：预测集成与标签预算

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：固定五成员SPD：三个标签预算

原摘要：SRPBS99、原15内分区、五支持重复、五初始化。新增600神经拟合，引用K5的375成员和K10/K20原150成员，总1125成员与225集成，共1350条实际预测评价；其中本轮新增评价900条。每集成仍只用当次同2K名支持，新增参考/传统模型/外层最终训练及评分均为0。 集成平均内验证AUC：K5 0.6831±0.0289；K10 0.7331±0.0215；K20 0.7712±0.0061。

原结果：K5集成减成员指标均值（主要）ΔAUC +0.0376，条件95%[0.0224, 0.0520]，5/5支持重复正向；K5集成减原对角单成员（副比较）ΔAUC +0.0420，条件95%[0.0183, 0.0628]，5/5支持重复正向；K10集成减成员指标均值（主要）ΔAUC +0.0497，条件95%[0.0342, 0.0656]，5/5支持重复正向；K10集成减原对角单成员（副比较）ΔAUC +0.0477，条件95%[0.0276, 0.0682]，5/5支持重复正向；K20集成减成员指标均值（主要）ΔAUC +0.0535，条件95%[0.0349, 0.0714]，5/5支持重复正向；K20集成减原对角单成员（副比较）ΔAUC +0.0594，条件95%[0.0382, 0.0813]，4/5支持重复正向。 K10/K20在固定M5下均出现正向开发增量，可保留该策略；这仍是同队列预算延伸，不是独立泛化确认。 支持重复SD（成员指标均值→集成）：K5 0.0208→0.0289；K10 0.0168→0.0215；K20 0.0063→0.0061，不能只凭AUC升高宣称抽样稳定性改善。

具体方法：K10/K20各补300新成员，引用原150成员；K5的450评价精确复用，整合1125成员/225集成共1350评价；固定M5和原训练，全部指标/共同人员区间独立核算。

限制：主两条件SD来自固定五初始化条件下的支持变化；历史对角SD同时改变支持和初始化。15分区人员相关，六个预算比较和两项描述性曲线差值均未校正；区间只基于保存预测，不含重训、开发选择或独立人群。概率误差下降部分来自凸性，不等于临床校准证明。

下一步：K10/K20在固定M5下均出现正向开发增量，可保留该策略；这仍是同队列预算延伸，不是独立泛化确认。 本轮固定预算曲线已完成，不扫描成员/seed/权重。后续优先为固定策略的原外层分区复核，仍须明确同来源开发性质；三临床终点和独立验证要求不变。

依据：spd-ensemble-budget-20261016、spd-ensemble-budget-20261016-summary、spd-ensemble-budget-20261016-metrics、spd-ensemble-budget-20261016-comparison、spd-ensemble-budget-20261016-means、spd-ensemble-budget-20261016-contrasts、spd-ensemble-budget-20261016-diagnostics、spd-ensemble-budget-20261016-plan、spd-ensemble-budget-20261016-code

</details>

## 2026-10-15　OA治疗反应队列核查

- 模型：影像预处理与QC；疗效模型未训练
- 数据：OA／ds000208治疗反应候选27份
- 工作：核查处理日志、脑区信号覆盖和失败原因。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：治疗反应输入与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：OA治疗反应队列核查

原摘要：原56患者中29保持头动排除；27份已处理结果仍8份数值通过待审核、19份QC未通过。新逐例核查定位9份第一阶段QC停止与10份AAL90覆盖停止，未发现程序崩溃记录。

原结果：27份第一阶段日志均有完成标记、无既定致命错误。10份AAL90未通过者均有区域有限信号覆盖低于原0.92，其中9份FC/Fisher-z有限，1份还有FC/Fisher-z非有限；8份标准化Dice未通过，3份参考覆盖未通过，2份CSF为空且干扰项各少1列，失败项可重叠。共同出现不证明CSF导致列数差；仅凭日志不能确认可自动修复的软件缺陷。

具体方法：只读27份队列/配置/原QC及实际日志，连接56原患者标签，保留29原头动排除；公开聚合，不读取MRI或拟合。

限制：本轮只读现有小型日志、QC/config记录和原公开临床表；MRI新读取/预处理/编码/拟合/专家报告/QC修改/训练纳入均0。数值通过8份不等于专家确认或独立临床验证，三研究/药物组分开，旧排除与停止保持。

下一步：优先核查2份CSF为空案例的原配置、已有分割及T1/功能配准证据，再核10份AAL90不足案例的缺失区域与标准化；不放宽原阈值或自动重跑。逐人基线VAS和MRI/治疗/随访日期仍须真实来源，未补齐且未审核前不启动疗效训练。

依据：oa-readiness-audit-20261014、oa-readiness-audit-20261014-summary、oa-readiness-audit-20261014-groups、oa-readiness-audit-20261014-failures、oa-readiness-audit-20261014-clinical

</details>

## 2026-10-15　FBNetGen作者实现：SRPBS五种子对照

- 模型：FBNetGen作者实现
- 数据：SRPBS开发分区，五种子
- 工作：比较可学习图与固定图。
- 性能变化：可学习图AUC +5.80个百分点，条件区间[1.06,10.82]；仅3／5种子正向，未证明跨种子稳定优越。
- 原论文 baseline：[FBNetGen，原文表1](https://proceedings.mlr.press/v172/kan22a/kan22a.pdf)。PNC性别分类：GRU版本 AUC 0.808±0.033，Pearson图基线0.696±0.045；ABCD：0.945±0.007，对应Pearson图0.888±0.003。CNN版本为0.807／0.939。 原文评估性别分类，报告5次测试均值及标准差；这些原值只供方法背景，疼痛任务的变化使用本批可学习图／固定图参照。
- 修改板块：可学习连接构造

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：FBNetGen作者实现：SRPBS五种子对照

原摘要：SRPBS99、原五外折/三内折、seed 0–4，共150次内层拟合及50次外层重训。FBNetGen作者实现：可学习图 AUC 0.6678±0.0594；同一预测器：固定绝对Pearson图 AUC 0.6098±0.0311。

原结果：可学习图减固定图的平均ΔAUC +0.0580，同人配对条件95%区间[0.0106, 0.1082]。区间未跨0，仅支持本批已保存模型的条件差异。3/5个seed方向为正，可学习图的seed间AUC标准差更大；不能据此声称跨训练种子的稳定优越。

具体方法：原AAL90/240时间点/人级分区；五seed、同预测器/批次/mixup；训练内缩放、最高AUC选轮；200检查点读回。作者预测器保留行和缩放，不称邻居聚合。

限制：作者预测器实际按邻接行和缩放本节点特征，没有邻居聚合；本轮保留原行为。属于作者代码的SRPBS任务适配，非PNC/ABCD原论文任务复现。SRPBS已用于开发，不构成扫描同期疼痛、治疗反应或独立临床验证。

下一步：结束本批固定配置，不按外层成绩延长搜索。若继续图机制研究，另列真正邻居聚合与行和缩放的匹配对照；临床终点和独立人员证据继续单独补充。

依据：fbnetgen-srpbs-20261015、fbnetgen-srpbs-20261015-summary、fbnetgen-srpbs-20261015-metrics、fbnetgen-srpbs-20261015-comparison、fbnetgen-srpbs-20261015-means、fbnetgen-srpbs-20261015-inner、fbnetgen-srpbs-20261015-folds、fbnetgen-srpbs-20261015-selection、fbnetgen-srpbs-20261015-plan

</details>

## 2026-10-15　FBNetGen邻居聚合：四条件五种子对照

- 模型：FBNetGen邻居聚合
- 数据：同一SRPBS开发分区，五种子
- 工作：将原图读出改为邻居消息聚合，比较学习图与固定图。
- 性能变化：学习图比固定图低1.26个百分点；相对旧学习图读出低8.33个百分点，未改善。
- 原论文 baseline：[FBNetGen，原文表1](https://proceedings.mlr.press/v172/kan22a/kan22a.pdf)。PNC性别分类：GRU版本 AUC 0.808±0.033，Pearson图基线0.696±0.045；ABCD：0.945±0.007，对应Pearson图0.888±0.003。CNN版本为0.807／0.939。 原文评估性别分类，报告5次测试均值及标准差；这些原值只供方法背景，疼痛任务的变化使用本批可学习图／固定图参照。
- 修改板块：图消息聚合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：FBNetGen邻居聚合：四条件五种子对照

原摘要：SRPBS99、原五外折/三内折、seed0–4。新增150次内层和50次外层训练，复用原行和版本200次拟合。邻居聚合＋可学习图AUC 0.5844±0.0590，邻居聚合＋固定图0.5970±0.0406；原行和＋可学习图0.6678±0.0594，原行和＋固定图0.6098±0.0311。

原结果：本轮没有提高指标。邻居版本可学习图减固定图ΔAUC −0.0126，条件95%区间[−0.0530, 0.0285]，仅2/5种子为正；可学习图改为邻居聚合后比原行和版本低0.0833，条件区间[−0.1584, −0.0109]，仅1/5种子提高。不能把更合理的聚合运算直接称为性能改善。

具体方法：原AAL90/240时间点/人员分区；仅三处einsum改为邻居聚合；其余图尺度/模型/批次/mixup/损失不变；新增200拟合与200读回，旧200拟合只读复用。

限制：作者预测器三处行和缩放在本轮改为真正邻居聚合，其余既定训练设置不变。这是SRPBS诊断开发上的本地模型修改，不是PNC/ABCD论文原任务复现；条件区间不覆盖重训和历次开发选择，也不构成同期疼痛、治疗反应或独立临床验证。

下一步：本轮结束，不按外层分数追加配置。若继续，先在合成或训练内检查聚合尺度与优化稳定性，再另列有限方案；临床终点和独立人员验证仍待补齐。

依据：fbnetgen-neighbor-20261015、fbnetgen-neighbor-20261015-summary、fbnetgen-neighbor-20261015-metrics、fbnetgen-neighbor-20261015-comparison、fbnetgen-neighbor-20261015-means、fbnetgen-neighbor-20261015-inner、fbnetgen-neighbor-20261015-folds、fbnetgen-neighbor-20261015-selection、fbnetgen-neighbor-20261015-plan、fbnetgen-neighbor-20261015-contrasts

</details>

## 2026-10-15　FBNetGen归一化与残差传播：五种子对照

- 模型：FBNetGen归一化／残差传播
- 数据：同一SRPBS开发分区，五种子
- 工作：比较归一化图传播与残差连接。
- 性能变化：残差比归一化高4.01个百分点但区间跨0；比无传播低0.75个百分点，未获得稳定增益。
- 原论文 baseline：[FBNetGen，原文表1](https://proceedings.mlr.press/v172/kan22a/kan22a.pdf)。PNC性别分类：GRU版本 AUC 0.808±0.033，Pearson图基线0.696±0.045；ABCD：0.945±0.007，对应Pearson图0.888±0.003。CNN版本为0.807／0.939。 原文评估性别分类，报告5次测试均值及标准差；这些原值只供方法背景，疼痛任务的变化使用本批可学习图／固定图参照。
- 修改板块：图归一化与残差传播

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：FBNetGen归一化与残差传播：五种子对照

原摘要：SRPBS99、原5外折/3内折、seed0–4。300次新拟合和300份模型读回完成，旧400次拟合不重跑。五种子AUC：归一化0.5672±0.0476，残差0.6073±0.0563，不传播0.6148±0.0555；旧邻居0.5844±0.0590，旧行和0.6678±0.0594。

原结果：本轮未获得稳定增益。残差减归一化ΔAUC +0.0401，条件95%[−0.0371,0.1129]，仅3/5种子正向；残差减不传播−0.0075，区间[−0.0279,0.0132]，仅1/5正向；残差低于旧行和0.0605，区间[−0.1056,−0.0151]。按拟合前标准停止本配置搜索。

具体方法：原AAL90/240时间点/人员分区；仅传播采用归一化、零初始化有界残差或identity；图正则保持原M，新增3标量；300拟合/读回，旧400拟合只读复用。

限制：这是既有SRPBS诊断开发上的本地方法适配。归一化与零初始化残差来自已有方法，新增3个标量不代表原创机制或少样本效果已成立；非PNC/ABCD原任务复现、扫描同期疼痛、疗效或独立临床验证。区间条件于保存模型/人员划分，不覆盖重训和历次开发选择，四比较未校正。

下一步：本轮300拟合结束，不追加宽度、种子、阈值或传播系数搜索，也不自动启动K5。下一项研究须有新的训练侧机制证据和同监督预算设计；真实临床终点、混杂与独立人员验证仍待补齐。

依据：fbnetgen-residual-20261015、fbnetgen-residual-20261015-summary、fbnetgen-residual-20261015-metrics、fbnetgen-residual-20261015-comparison、fbnetgen-residual-20261015-means、fbnetgen-residual-20261015-inner、fbnetgen-residual-20261015-folds、fbnetgen-residual-20261015-selection、fbnetgen-residual-20261015-plan、fbnetgen-residual-20261015-contrasts、fbnetgen-residual-20261015-code

</details>

## 2026-10-14　CoSpine：共同生理协变量与多人对照

- 模型：共同生理协变量Ridge、强FC与NeuroSTORM读出
- 数据：CoSpine 4人、60相关试次
- 工作：按人留一比较生理协变量与影像预测。
- 性能变化：使用MAE：共同协变量0.9594、强FC 0.9967；没有由影像建立稳定增量。
- 修改板块：生理协变量与疼痛读出

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine：共同生理协变量与多人对照

原摘要：4名原开发成员、60个相关试次完成同人留一人对照，共同协变量人均MAE 0.959371，较强FC 0.996683。随机/读出/残差两种子和冻结预训练逐折结果全部保留；40次外层拟合、216次内层Ridge拟合。

原结果：4名原开发成员、60个相关试次完成同人留一人对照，共同协变量人均MAE 0.959371，较强FC 0.996683。随机/读出/残差两种子和冻结预训练逐折结果全部保留；40次外层拟合、216次内层Ridge拟合。

具体方法：共同生理协变量、真实短窗AAL90 FC、随机/冻结官方模型、head-only与5480参数小残差；4折留一人。

限制：健康人热痛随后报告PR 0–10的4人开发结果；各人统一未作畸变或BOLD生理回归，使用同人DICOM/CSA切片时点。2人的JSON时钟不匹配和1组场图位置问题已保留；短窗FC仅真实采集帧。局部配准、独立TTL/记录长度及预训练名册缺口仍在。新增专家/正式QC/独立临床验证0，13人留出MRI未读，原三临床目标未完成。

下一步：小残差未形成两种子一致超出共同协变量、强FC、随机、冻结及读出对照的增量证据，停止本轮残差扩参；优先补场图来源、真实患者同期疼痛/疗效终点及独立来源，不追开发分数。

依据：cospine-common-physio-20261013、cospine-common-physio-20261013-summary、cospine-common-physio-20261013-readiness、cospine-common-physio-20261013-plan、cospine-common-physio-20261013-code

</details>

## 2026-10-14　CoSpine短窗网络时序指标：关联与稳定性检验

- 模型：网络时滞指标＋Ridge
- 数据：CoSpine 4人、60相关试次
- 工作：检验短窗网络候选的疼痛关联与删帧稳定性。
- 性能变化：MAE 1.0168→1.0386，误差增加约0.0218；调整后关联接近0，指标不稳定。
- 修改板块：短窗网络时序特征

仅健康实验热痛，试次不增加独立人数。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine短窗网络时序指标：关联与稳定性检验

原摘要：4名健康开发成员、60相关试次、1960固定预算拟合完成。候选调整后疼痛关联r=.0039，条件区间[-.3890,.5661]，1正3负；单帧删除46/60试次至少一次翻符号。最大预算共同MAE1.0168，加入候选1.0386；本定义停止扩展。

原结果：4名健康开发成员、60相关试次、1960固定预算拟合完成。候选调整后疼痛关联r=.0039，条件区间[-.3890,.5661]，1正3负；单帧删除46/60试次至少一次翻符号。最大预算共同MAE1.0168，加入候选1.0386；本定义停止扩展。

具体方法：固定24边反对称时滞，训练侧尺度和能量收缩；1–3训练人×5/10/15连续标签，全部1960固定读出。

限制：核心反对称时滞已有先例，本轮是短窗小样本适配。只有4独立人、7–8真实帧；条件区间不含重训/方案选择，无重测或临床独立验证。温度/年龄/性别同人恒定，心理标签缺；专家/QC新增0，13研究留出MRI未读。

下一步：停止本短窗时滞定义扩展。先补独立刺激时钟、场图姿态及足够报告前真实帧，或取得同人患者MRI同期程度/心理/治疗标签；不换公式追逐显著，原临床目标保持。

依据：network-lag-20261014、network-lag-20261014-summary、network-lag-20261014-novelty、network-lag-20261014-comparison、network-lag-20261014-learning、network-lag-20261014-plan、network-lag-20261014-code、network-lag-20261014-curve、network-lag-20261014-curve-detail

</details>

## 2026-10-14　Emo27：患者网络估计与疼痛关联

- 模型：患者网络估计候选＋回归
- 数据：Emo27女性患者
- 工作：检验网络估计是否提供额外疼痛关联与回归收益。
- 性能变化：MAE 12.747→14.734，增加1.987；新增关联的人员重训区间跨0。
- 修改板块：患者网络估计与疼痛关联

截短一致性改善不能直接当预测改善。

<details><summary>参数、完整记录与依据</summary>

原标题：Emo27：患者网络估计与疼痛关联

原摘要：27名纤维肌痛女性、81个采样测量、3402次实际拟合尝试（3192正式模型，210对照修正）完成。候选截短一致性略改善，但额外疼痛关联r=.106，人员重训95%[-.519,.546]；临床/心理MAE12.747，加入候选14.734。本定义停止扩展。

原结果：27名纤维肌痛女性、81个采样测量、3402次实际拟合尝试（3192正式模型，210对照修正）完成。候选截短一致性略改善，但额外疼痛关联r=.106，人员重训95%[-.519,.546]；临床/心理MAE12.747，加入候选14.734。本定义停止扩展。

具体方法：固定36组关系、个体采样噪声收缩；6/12/18独立训练人，3192正式模型，另210对照修正。

限制：原访谈VAS0–100，1间隔缺失/5超过14天保留，非MRI同期痛。核心经验Bayes已有先例，仅小样本适配；27人已开发，无重复扫描/临床独立验证。HAM-D/HAM-A同人27/27完整，调整不证明疼痛特异性。

下一步：停止本采样收缩定义扩展；优先补真实患者MRI同期评分、心理/用药与治疗随访、独立人员来源，或真实重复扫描验证。旧负结果/13CoSpine留出未读/TN14停止保持。

依据：emo-network-20261014、emo-network-20261014-summary、emo-network-20261014-novelty、emo-network-20261014-comparison、emo-network-20261014-learning、emo-network-20261014-measurement、emo-network-20261014-confounds、emo-network-20261014-plan、emo-network-20261014-measurement-plan、emo-network-20261014-code、emo-network-20261014-curve、emo-network-20261014-stability

</details>

## 2026-10-14　BrainHGT泛化诊断与五种子训练比较

- 模型：完整BrainHGT
- 数据：SRPBS99、成人偏头痛132人
- 工作：比较优化方式与类别均衡训练对泛化的影响。
- 性能变化：SRPBS AUC下降1.89个百分点；偏头痛下降0.56个百分点。均衡训练局部+0.86个百分点，但区间跨0且概率误差变差。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：分类优化与类别均衡

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT泛化诊断与五种子训练比较

原摘要：完整BrainHGT＋OMST原条件五seed平均OOF AUC：ZAN54 0.4521±0.0617；SRPBS99 0.6292±0.0280；Emo53 0.5268±0.0719；偏头痛132 0.4888±0.0581。

原结果：AdamW平均AUC：SRPBS 0.6292→0.6103，偏头痛 0.4888→0.4832。偏头痛均衡CE为0.4974，对原条件ΔAUC +0.0086、条件95%[-0.0696,+0.0873]；特异性升至0.3905，但BA 0.4979且Brier 0.1412→0.2314。本轮没有可靠整体抗过拟合收益，停止本配置扩展。

具体方法：原AAL90与人级分区、原完整模型/OMST；seed0–4，算术平均AUC；AdamW与偏头痛均衡CE各一单因素配置及严格回放。

限制：四队列诊断开发，原人员/标签/QC/划分保持；初始化seed0–4共享人员，均值±SD不等于五个独立人群。无MRI同期疼痛、治疗响应或独立临床验证。

下一步：停止本轮未获稳定判别增量的配置，不扩wd/dropout/选轮搜索、不接K学习曲线或结构模块。下一步仅在独立训练侧确认选轮问题，或补真实患者同期疼痛/心理/治疗及独立人员依据。

依据：brainhgt-generalization-20261014、brainhgt-generalization-20261014-summary、brainhgt-generalization-20261014-metrics、brainhgt-generalization-20261014-comparison、brainhgt-generalization-20261014-means、brainhgt-generalization-20261014-inner、brainhgt-generalization-20261014-folds、brainhgt-generalization-20261014-selection、brainhgt-generalization-20261014-plan、brainhgt-generalization-20261014-code、brainhgt-generalization-20261014-auc-figure、brainhgt-generalization-20261014-curve-figure

</details>

## 2026-10-14　BrainHGT五种子选轮对照

- 模型：完整BrainHGT
- 数据：SRPBS99、成人偏头痛132人
- 工作：比较模型选轮规则。
- 性能变化：SRPBS AUC +2.26个百分点、偏头痛−0.37个百分点，均跨0；概率损失降低不等于判别改善。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：训练选轮与模型选择

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT五种子选轮对照

原摘要：SRPBS99：AUC选轮 0.6292±0.0280，logloss选轮 0.6518±0.0261；偏头痛132：AUC选轮 0.4888±0.0581，logloss选轮 0.4851±0.0205。

原结果：SRPBS99 ΔAUC+0.0226，条件95%区间[-0.0466,0.0906]；Δlogloss-0.1229，ΔBrier-0.0258。判别差异未获可靠支持。 偏头痛132 ΔAUC-0.0037，条件95%区间[-0.0609,0.0537]；Δlogloss-0.0260，ΔBrier-0.0032。判别差异未获可靠支持。 两队列logloss差值的固定模型条件区间均低于0，支持本批概率损失降低；Brier差值区间均跨0。偏头痛仍全部预测患者，BA为0.5、特异性为0；较小seed波动不能当有效判别。

具体方法：原AAL90与人级分区、完整模型/OMST；Adam和普通CE保持，同轨迹最高AUC/最低logloss双选轮；seed0–4算术平均AUC、条件配对区间及严格回放。

限制：SRPBS99与偏头痛132诊断开发；原完整模型/OMST、标签/QC/人员分区保持。五seed共享人员；无扫描同期疼痛、治疗响应或独立临床验证。

下一步：结束本次有限选轮对照，不扩选轮/优化器搜索；后续结构研究单列机制与公平消融，同时补真实临床终点和独立人员。

依据：brainhgt-selection-20261014、brainhgt-selection-20261014-summary、brainhgt-selection-20261014-metrics、brainhgt-selection-20261014-comparison、brainhgt-selection-20261014-means、brainhgt-selection-20261014-inner、brainhgt-selection-20261014-folds、brainhgt-selection-20261014-selection、brainhgt-selection-20261014-plan、brainhgt-selection-20261014-code、brainhgt-selection-20261014-auc-figure、brainhgt-selection-20261014-curve-figure

</details>

## 2026-10-14　BrainHGT五种子共享encoder结构对照

- 模型：BrainHGT原编码器／ROI共享编码器
- 数据：SRPBS99、成人偏头痛132人
- 工作：在相同人员与训练预算下改为脑区共享编码。
- 性能变化：SRPBS AUC −3.58个百分点，偏头痛+2.06个百分点；两个区间均跨0。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：时序编码器的参数共享

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：BrainHGT五种子共享encoder结构对照

原摘要：SRPBS99原模型 0.6292±0.0280；ROI共享32未通过内层保留标准，未算新外层AUC，ROI共享994 0.5934±0.0299。偏头痛132原模型 0.4888±0.0581；ROI共享32未通过内层保留标准，未算新外层AUC，ROI共享994 0.5094±0.0468。

原结果：SRPBS99ROI共享994 ΔAUC-0.0358，条件95%[-0.0783,0.0065]，1/5种子正方向。未获可靠判别增量。 偏头痛132ROI共享994 ΔAUC+0.0206，条件95%[-0.0322,0.0762]，3/5种子正方向。未获可靠判别增量。

具体方法：原AAL90/OMST/人级分区、Adam/普通CE/最高AUC选轮保持，仅替换社区encoder为ROI共享32或994；内层预定保留标准、全部seed、配对条件区间及严格回放。

限制：既有SRPBS99与偏头痛132诊断开发。共享结构仅替换社区encoder；原输入/OMST/先验/标签/QC/人级分区保持。无同期疼痛、疗效或独立临床验证。

下一步：停止未获得稳定增量的共享结构，不扩宽度或种子搜索；后续优先取得可对齐MRI的真实临床终点和独立人员证据。

依据：brainhgt-shared-encoder-20261014、brainhgt-shared-encoder-20261014-summary、brainhgt-shared-encoder-20261014-metrics、brainhgt-shared-encoder-20261014-comparison、brainhgt-shared-encoder-20261014-means、brainhgt-shared-encoder-20261014-inner、brainhgt-shared-encoder-20261014-folds、brainhgt-shared-encoder-20261014-selection、brainhgt-shared-encoder-20261014-decisions、brainhgt-shared-encoder-20261014-plan、brainhgt-shared-encoder-20261014-code、brainhgt-shared-encoder-20261014-clinical

</details>

## 2026-10-13　Emo27访谈VAS：临床与强FC对照结果

- 模型：临床Ridge与强FC回归
- 数据：Emo27患者访谈VAS
- 工作：保持同一人员与评分，检验加入FC的增量。
- 性能变化：使用MAE：临床12.97→加FC 15.88，误差增加2.91个VAS点，没有影像收益。
- 修改板块：临床与FC回归融合

访谈VAS不视为扫描同期疼痛；MAE不转换为AUC。

<details><summary>参数、完整记录与依据</summary>

原标题：Emo27访谈VAS：临床与强FC对照结果

原摘要：Emo27同人访谈VAS比较完成：临床＋混杂MAE12.97，加入强FC后15.88，误差增加2.91个VAS点；没有稳定影像增量。

原结果：Emo27同人访谈VAS比较完成：临床＋混杂MAE12.97，加入强FC后15.88，误差增加2.91个VAS点；没有稳定影像增量。

具体方法：原患者交集三外折/三内折；训练侧切空间和缩放，有限Ridge；保存模型独立回放。

限制：三折人级开发评价，访谈VAS不是扫描同期痛。144内层及12最终Ridge、6常量估计已完成；无新增独立临床验证、专家报告或QC纳入。

下一步：停止Emo27追加BNT训练；已准备BNT回归/临床接口和既有偏头痛132人的FC及原划分。其他已跑队列按各自诊断、评分或疗效终点选择，保留旧开发历史，不追旧查询分数。

依据：emo27-vas-20261013、emo27-vas-20261013-summary、emo27-vas-20261013-metrics、emo27-vas-20261013-cohorts、emo27-vas-20261013-plan

</details>

## 2026-10-13　疼痛队列多模型适配：ZAN54与SRPBS99

- 模型：BNT、Com-BrainTF、BrainHGT
- 数据：ZAN54、SRPBS99
- 工作：将官方图模型适配为疼痛队列分类，并加入同条件协变量参照。
- 性能变化：SRPBS强FC AUC 0.7527高于全部神经模型；ZAN神经结果最高0.4993，无稳定增量。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 原论文 baseline：[BNT，NeurIPS 2022表1](https://papers.nips.cc/paper_files/paper/2022/file/a408234a9b80604a9cf6ca518e474550-Paper-Conference.pdf)。ABIDE：BNT AUC 0.802±0.010，VanillaTF基线0.764±0.012；ABCD性别分类：BNT 0.962±0.003，VanillaTF 0.943±0.007。 ABIDE为1009人CC200输入；原文数据、划分和监督量与疼痛迁移实验有差异。±为原文标准差。
- 原论文 baseline：[Com-BrainTF，原文表1](https://arxiv.org/html/2307.10181)。ABIDE：Com-BrainTF AUC 0.796±0.038；该论文重跑的BNT基线0.783±0.044。 ASD／健康对照，70%／10%／20%划分；本论文BNT基线与BNT自身原文的0.802来自不同实验，保留各自出处。±为原文标准差。
- 修改板块：官方模型的疼痛任务适配

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：疼痛队列多模型适配：ZAN54与SRPBS99

原摘要：BNT、Com-BrainTF、BrainHGT已分别在ZAN54和SRPBS99完成协变量融合适配。SRPBS切空间AUROC0.7527高于全部神经结果；ZAN神经结果最高0.4993，无稳定强FC增量。

原结果：BNT、Com-BrainTF、BrainHGT已分别在ZAN54和SRPBS99完成协变量融合适配。SRPBS切空间AUROC0.7527高于全部神经结果；ZAN神经结果最高0.4993，无稳定强FC增量。

具体方法：原五外折/三内折；三作者框架＋四协变量，训练侧缩放/参考，保存结果严格回放。

限制：患者组/健康组的开发比较，不是扫描同期痛、程度或疗效预测。两个队列分别解释；全部固定种子和阴性结果保留，没有新增独立临床验证或专家QC。

下一步：停止本轮大参数从零训练配置；下一步只考虑有训练内依据的低参数适配，并继续取得真实疼痛时点、治疗结局及独立人员来源，不扩搜索到出现好分。

依据：pain-model-adaptation-20261013、pain-model-adaptation-20261013-summary、pain-model-adaptation-20261013-metrics、pain-model-adaptation-20261013-figure、pain-model-adaptation-20261013-plan

</details>

## 2026-10-13　疼痛模型紧凑适配：四队列五模型

- 模型：BNT、Com-BrainTF、BrainHGT等五种紧凑模型
- 数据：ZAN54、SRPBS99、Emo53、成人偏头痛132人
- 工作：比较紧凑架构与各队列强FC。
- 性能变化：SRPBS紧凑模型AUC 0.5090–0.6645，低于FC 0.7527；Emo也全部低于FC。其他队列有局部优势，未形成一致收益。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 原论文 baseline：[BNT，NeurIPS 2022表1](https://papers.nips.cc/paper_files/paper/2022/file/a408234a9b80604a9cf6ca518e474550-Paper-Conference.pdf)。ABIDE：BNT AUC 0.802±0.010，VanillaTF基线0.764±0.012；ABCD性别分类：BNT 0.962±0.003，VanillaTF 0.943±0.007。 ABIDE为1009人CC200输入；原文数据、划分和监督量与疼痛迁移实验有差异。±为原文标准差。
- 原论文 baseline：[Com-BrainTF，原文表1](https://arxiv.org/html/2307.10181)。ABIDE：Com-BrainTF AUC 0.796±0.038；该论文重跑的BNT基线0.783±0.044。 ASD／健康对照，70%／10%／20%划分；本论文BNT基线与BNT自身原文的0.802来自不同实验，保留各自出处。±为原文标准差。
- 原论文 baseline：[Emo底层队列的纤维肌痛原研究](https://pubmed.ncbi.nlm.nih.gov/39522892/)。原研究33名患者＋33名对照，诊断AUC约0.65。 当前Emo53的纳入、处理与模型评价不同；该值作为数据集原研究参照，不能当成本批模型消融的baseline。
- 修改板块：模型容量与任务适配

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：疼痛模型紧凑适配：四队列五模型

原摘要：四队列、五模型紧凑适配已完成。ZAN54切空间AUROC0.3903，紧凑模型全部种子0.2593–0.5379；SRPBS99切空间AUROC0.7527，紧凑模型全部种子0.5090–0.6645；Emo53切空间AUROC0.6040，紧凑模型全部种子0.3775–0.4843；偏头痛132切空间AUROC0.5384，紧凑模型全部种子0.5075–0.5980。

原结果：四队列、五模型紧凑适配已完成。ZAN54切空间AUROC0.3903，紧凑模型全部种子0.2593–0.5379；SRPBS99切空间AUROC0.7527，紧凑模型全部种子0.5090–0.6645；Emo53切空间AUROC0.6040，紧凑模型全部种子0.3775–0.4843；偏头痛132切空间AUROC0.5384，紧凑模型全部种子0.5075–0.5980。

具体方法：各队列原划分；五紧凑框架＋四协变量，训练侧缩放/参考，保存结果严格回放。

限制：全部为既有队列的患者/对照诊断开发。不同病种分别解释；未新增扫描同期VAS、治疗结局或独立人员验证，原QC授权和Emo27访谈VAS阴性结果保留。

下一步：停止本轮紧凑配置的继续搜索：没有模型在同队列两个固定种子中同时获得超出两种FC及协变量参照的正向条件区间。下一步优先补真实扫描疼痛时点/治疗结局和同病种独立来源，再设计有新证据的适配。

依据：compact-pain-20261013、compact-pain-20261013-summary、compact-pain-20261013-metrics、compact-pain-20261013-figure、compact-pain-20261013-plan

</details>

## 2026-10-13　小样本疼痛回归：冻结先验适配

- 模型：冻结预训练先验＋回归头、临床Ridge
- 数据：Emo27、SRPBS sup7 29人、sup8 15人
- 工作：用冻结表示做少标签疼痛评分适配。
- 性能变化：Emo先验MAE 13.29–15.86，均差于临床12.97；两SRPBS子集有升有降，未见稳定改善。
- 修改板块：冻结先验与疼痛回归

量表分别解释；不同队列的MAE不直接排名。

<details><summary>参数、完整记录与依据</summary>

原标题：小样本疼痛回归：冻结先验适配

原摘要：三组原评分患者的冻结先验适配完成。Emo27有限临床Ridge MAE12.9692，冻结先验全部表示/种子13.2865–15.8575；SRPBS sup7／29人有限临床Ridge MAE18.5703，冻结先验全部表示/种子17.9883–19.2077；SRPBS sup8／15人有限临床Ridge MAE2.4139，冻结先验全部表示/种子2.2117–2.4556。

原结果：三组原评分患者的冻结先验适配完成。Emo27有限临床Ridge MAE12.9692，冻结先验全部表示/种子13.2865–15.8575；SRPBS sup7／29人有限临床Ridge MAE18.5703，冻结先验全部表示/种子17.9883–19.2077；SRPBS sup8／15人有限临床Ridge MAE2.4139，冻结先验全部表示/种子2.2117–2.4556。

具体方法：原人级分区；冻结回归先验、有限临床及强FC/随机消融，训练侧缩放/参考，保存结果严格回放。

限制：Emo为访谈VAS，不能称MRI同期痛；SRPBS两评分表的单位端点和MRI时点未确认，仅作分开的补充探索。全部有开发史，未新增临床真值或独立验证，原负结果和停止分支保留。

下一步：本轮没有稳定候选，停止当前配置扩搜。Emo未超临床Ridge，sup7未超训练均值，sup8未超完整Pearson FC＋临床。保留可追溯预训练接入实现；先补原VAS端点/时点和可比较独立来源，再决定有新依据的疼痛适配。

依据：pain-prior-transfer-20261013、pain-prior-transfer-20261013-summary、pain-prior-transfer-20261013-metrics、pain-prior-transfer-20261013-figure、pain-prior-transfer-20261013-plan、pain-prior-transfer-20261013-adapter、pain-prior-transfer-20261013-license

</details>

## 2026-10-13　CoSpine：疼痛输入与时序适配准备

- 模型：NeuroSTORM冻结编码器与影像处理流程
- 数据：CoSpine开发成员
- 工作：扩展真实任务输入，并检查时间归一化和适配器。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：任务时间对齐与生理噪声处理

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine：疼痛输入与时序适配准备

原摘要：新增12名CoSpine开发成员完成原生帧空间映射、252次冻结编码与独立读回，24幅非线性图已实际查看。时间干预发现整段归一化及编码器早期token依赖后续输入；5504参数适配器接入通过，疼痛监督拟合0。

原结果：新增12名CoSpine开发成员完成原生帧空间映射、252次冻结编码与独立读回，24幅非线性图已实际查看。时间干预发现整段归一化及编码器早期token依赖后续输入；5504参数适配器接入通过，疼痛监督拟合0。

具体方法：原人员/固定窗口与空间映射；冻结编码、真实时间干预及独立读回。

限制：健康热痛离线技术与适配准备，未新增专家QC、训练纳入、疼痛预测成绩或独立临床验证；13名研究留出MRI未读。原五人读出、临床及强FC负结果与停止状态保留。

下一步：优先取得可核实的上游时间处理与限定报告前输入，并按完整窗口解释双向token；补强FC/刺激及协变量对照与实际预训练成员依据后再设计有限疼痛适配。OA先补基线、治疗/扫描/随访对应和既有审核，不启动8例疗效训练。

依据：cospine-pain-readiness-20261013、cospine-pain-readiness-20261013-summary、cospine-pain-readiness-20261013-readiness、cospine-pain-readiness-20261013-plan、cospine-pain-readiness-20261013-adapter、cospine-pain-readiness-20261013-normalization

</details>

## 2026-10-13　CoSpine：原始报告前输入试验

- 模型：NeuroSTORM冻结编码器与影像处理流程
- 数据：CoSpine开发成员
- 工作：从原始影像建立完全早于评分的任务输入。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：任务时间对齐与生理噪声处理

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine：原始报告前输入试验

原摘要：1名原开发成员的原始报告前输入试验完成：真实切片时间对齐、短段运动校正、固定空间映射及一次官方冻结编码。独立输入重建误差0，所有源切片早于评分，疼痛监督拟合0。

原结果：1名原开发成员的原始报告前输入试验完成：真实切片时间对齐、短段运动校正、固定空间映射及一次官方冻结编码。独立输入重建误差0，所有源切片早于评分，疼痛监督拟合0。

具体方法：实测SliceTiming、短段运动校正、固定空间采样和刺激前统计，官方冻结前向一次。

限制：健康热痛单人技术试验，未新增专家QC、训练纳入、疼痛预测或独立临床验证。场图和生理噪声校正未做，局部配准偏差保留；26开发/13研究留出和全部旧负结果不变。

下一步：先补原始输入的畸变/生理噪声与窗口边界处理，再按原开发名单批量准备同人数据。有限疼痛适配统一刺激/协变量、强FC、随机模型、冻结模型和小残差；不依据开发分数筛人，不读取13人留出MRI。

依据：cospine-raw-window-20261013、cospine-raw-window-20261013-summary、cospine-raw-window-20261013-readiness、cospine-raw-window-20261013-plan、cospine-raw-window-20261013-code

</details>

## 2026-10-13　CoSpine：畸变与短窗生理诊断

- 模型：NeuroSTORM冻结编码器与影像处理流程
- 数据：CoSpine开发成员
- 工作：检查畸变校正和短窗口生理回归是否可行。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：任务时间对齐与生理噪声处理

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine：畸变与短窗生理诊断

原摘要：1名原开发成员的畸变与生理诊断完成：固定TOPUP使校准AP/PA相关性0.653211→0.979989；DICOM/生理起点与作者生成触发一致。8帧的32项生理设计剩余自由度0，未应用该回归；校正后官方冻结编码通过，监督拟合0。

原结果：1名原开发成员的畸变与生理诊断完成：固定TOPUP使校准AP/PA相关性0.653211→0.979989；DICOM/生理起点与作者生成触发一致。8帧的32项生理设计剩余自由度0，未应用该回归；校正后官方冻结编码通过，监督拟合0。

具体方法：实测SliceTiming、短段运动校正、固定空间采样和刺激前统计，官方冻结前向一次。

限制：健康热痛单人技术结果；校准图一致性和表示变化不当疼痛预测增益。作者触发表仅已下载前段，实际独立TTL及0.6955秒记录长度差未解决；新增专家/QC/临床验证0，原划分和全部负结果保留。

下一步：下一轮停止8帧直接套32项去噪，先固定不做短窗GLM、生理指标作为各方法共同协变量的有限方案，并核实整段采样长度/实际触发、场图到BOLD姿态。再扩原开发成员，同人同划分比较刺激/协变量、强FC、随机、冻结及小残差；13人留出MRI保持未读。

依据：cospine-noise-pilot-20261013、cospine-noise-pilot-20261013-summary、cospine-noise-pilot-20261013-readiness、cospine-noise-pilot-20261013-plan、cospine-noise-pilot-20261013-code

</details>

## 2026-10-12　ABIDE原任务：40次复算与同数据对照

- 模型：BNT、Com-BrainTF、VanillaTF、BrainNetCNN
- 数据：ABIDE作者1009行CC200数据
- 工作：在同一作者数据上复算模型并比较两套评价设置。
- 性能变化：VanillaTF AUC 0.7731／0.7503；BrainNetCNN 0.7637／0.7554，均低于同协议BNT。
- 原论文 baseline：[BNT，NeurIPS 2022表1](https://papers.nips.cc/paper_files/paper/2022/file/a408234a9b80604a9cf6ca518e474550-Paper-Conference.pdf)。ABIDE：BNT AUC 0.802±0.010，VanillaTF基线0.764±0.012；ABCD性别分类：BNT 0.962±0.003，VanillaTF 0.943±0.007。 ABIDE为1009人CC200输入；原文数据、划分和监督量与疼痛迁移实验有差异。±为原文标准差。
- 原论文 baseline：[Com-BrainTF，原文表1](https://arxiv.org/html/2307.10181)。ABIDE：Com-BrainTF AUC 0.796±0.038；该论文重跑的BNT基线0.783±0.044。 ASD／健康对照，70%／10%／20%划分；本论文BNT基线与BNT自身原文的0.802来自不同实验，保留各自出处。±为原文标准差。
- 原论文 baseline：[BrainNetCNN，在BNT论文中的对照](https://papers.nips.cc/paper_files/paper/2022/file/a408234a9b80604a9cf6ca518e474550-Paper-Conference.pdf)。BNT论文表1：ABIDE的BrainNetCNN AUC 0.749±0.024；同表BNT为0.802±0.010。 这是BNT论文的统一框架对照。BrainNetCNN自身原论文主要研究神经发育回归，不能把0.749称为其自身原文的疼痛AUC。
- 修改板块：原任务复算与评价设置

两套协议有多项差异，不作单因素提升解释；ABIDE成绩不代表疼痛迁移。

<details><summary>参数、完整记录与依据</summary>

原标题：ABIDE原任务：40次复算与同数据对照

原摘要：BNT／Com此前20次，新增VanillaTF／BNT框架BrainNetCNN20次；共40拟合、80权重回读，复核重拟合0。VanillaTF 与 BNT框架BrainNetCNN完成20次固定拟合、40份选中／末轮权重回读，复核重拟合0。 VanillaTF AUROC0.7731/0.7503；BrainNetCNN 0.7637/0.7554（当前／部分对齐）。 四组新对照的平均AUROC均低于同协议BNT。

原结果：BNT／Com此前20次，新增VanillaTF／BNT框架BrainNetCNN20次；共40拟合、80权重回读，复核重拟合0。VanillaTF 与 BNT框架BrainNetCNN完成20次固定拟合、40份选中／末轮权重回读，复核重拟合0。 VanillaTF AUROC0.7731/0.7503；BrainNetCNN 0.7637/0.7554（当前／部分对齐）。 四组新对照的平均AUROC均低于同协议BNT。

具体方法：BNT／Com20次＋VanillaTF／BNT框架BrainNetCNN20次；80权重回读；BrainNetCNN原随机eval保留。

限制：本轮为官方代码在作者1009行CC200数据上的原任务复算，尚不能称完整论文协议复现。当前代码划分706/203/100；论文划分／批量对齐为706/100/203。两作者包19个站点、FC对角全0、无人员ID，100帧时序不能重建包内FC；诊断方向仅有站点汇总支持。BrainHGT原OMST输入缺，患者拟合0。ABIDE疾病分类不证明疼痛迁移有效。 本轮核查HGT3/ALTER55个官方历史commit及issue：原输入仍未补齐，HGT/ALTER本轮患者拟合均0；ALTER早期官方README有BNT入口，但论文1012人与1009包的对应仍缺确认。 直接复用既有BNT逐seed划分、1009行CC200作者数组和监督预算；两协议多因素不同，不作单因素归因。BrainNetCNN为BNT作者框架对照实现，原eval仍有随机dropout；成绩为保存随机状态的一次读出，回读仅重放该次读出。未确认完整论文协议、人员身份与诊断方向，AP按原label1。ABIDE成绩不证明疼痛或小样本鲁棒性，研究总目标未完成。

下一步：继续等BrainHGT原OMST及ALTER1012人原材料；疼痛路线先核同人CC200、强FC／协变量、临床终点时点和独立人员来源，再决定单因素有限迁移。Emo53未胜切空间0.5983，B阶段保持停止；不追加ABIDE搜索。

依据：abide-original-protocol-20261012、abide-original-protocol-20261012-summary、abide-original-protocol-20261012-execution、abide-original-protocol-20261012-metrics、abide-original-protocol-20261012-input-audit、abide-original-protocol-20261012-input-audit-summary、abide-original-protocol-20261012-controls、abide-original-protocol-20261012-controls-summary、abide-original-protocol-20261012-controls-metrics、abide-original-protocol-20261012-controls-seeds

</details>

## 2026-10-12　Emo53官方模型未超过切空间对照

- 模型：BrainHGT、BNT、Com-BrainTF、切空间Logistic
- 数据：Emo53
- 工作：用三套官方图模型与同条件强FC参照做分类比较。
- 性能变化：切空间AUC 0.5983；BrainHGT 0.4573–0.4815，BNT 0.5142–0.5256，Com-BrainTF 0.4145–0.5328，均未超过参照。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 原论文 baseline：[BNT，NeurIPS 2022表1](https://papers.nips.cc/paper_files/paper/2022/file/a408234a9b80604a9cf6ca518e474550-Paper-Conference.pdf)。ABIDE：BNT AUC 0.802±0.010，VanillaTF基线0.764±0.012；ABCD性别分类：BNT 0.962±0.003，VanillaTF 0.943±0.007。 ABIDE为1009人CC200输入；原文数据、划分和监督量与疼痛迁移实验有差异。±为原文标准差。
- 原论文 baseline：[Com-BrainTF，原文表1](https://arxiv.org/html/2307.10181)。ABIDE：Com-BrainTF AUC 0.796±0.038；该论文重跑的BNT基线0.783±0.044。 ASD／健康对照，70%／10%／20%划分；本论文BNT基线与BNT自身原文的0.802来自不同实验，保留各自出处。±为原文标准差。
- 原论文 baseline：[Emo底层队列的纤维肌痛原研究](https://pubmed.ncbi.nlm.nih.gov/39522892/)。原研究33名患者＋33名对照，诊断AUC约0.65。 当前Emo53的纳入、处理与模型评价不同；该值作为数据集原研究参照，不能当成本批模型消融的baseline。
- 修改板块：官方模型的疼痛任务适配

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Emo53官方模型未超过切空间对照

原摘要：Emo53同条件比较完成：切空间Logistic AUROC0.5983；BrainHGT两个seed为0.4815/0.4573，BNT为0.5142/0.5256，Com-BrainTF为0.5328/0.4145。三套官方任务适配均未超过传统对照。

原结果：Emo53同条件比较完成：切空间Logistic AUROC0.5983；BrainHGT两个seed为0.4815/0.4573，BNT为0.5142/0.5256，Com-BrainTF为0.5328/0.4145。三套官方任务适配均未超过传统对照。

具体方法：三外折、两固定seed；27最终/189内层拟合；216保存模型重放；B阶段未运行。

限制：53人（27FM/26HC）、三折人级开发评价；原13例失败和QC限制保留。未复现作者ABIDE原任务成绩，未新增独立临床验证。

下一步：本轮停止在A阶段，不扩大学习率、轮次或seed；B阶段残差候选保留未运行。优先检验作者原任务实现，再决定同病种任务适配与独立验证。切空间自身区间较宽，不能据当前排序保证泛化。

依据：emo-official-20261012、emo-official-20261012-summary、emo-official-20261012-metrics、emo-official-20261012-figure

</details>

## 2026-10-12　疼痛数据：人员、终点、时点与对照核查

- 模型：数据与标签核查
- 数据：DS005713、Emo27、CoSpine
- 工作：核对独立人数、疼痛评分含义与评分／扫描时间关系。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：人员去重与疼痛终点对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：疼痛数据：人员、终点、时点与对照核查

原摘要：现有疼痛材料补齐了部分人员、临床字段及任务时间对应，尚未形成新的独立临床验证。DS00571336次扫描经原person_id匹配到33人（19患者/14健康）；Emo27患者与原Power264的同人访谈VAS一致，病程/药物等已有字段齐备；CoSpine585个固定早期窗无直接报告期重叠。

原结果：现有疼痛材料补齐了部分人员、临床字段及任务时间对应，尚未形成新的独立临床验证。DS00571336次扫描经原person_id匹配到33人（19患者/14健康）；Emo27患者与原Power264的同人访谈VAS一致，病程/药物等已有字段齐备；CoSpine585个固定早期窗无直接报告期重叠。

具体方法：公开元数据、原manifest人员键及已有小输入直接对应；无MRI/模型拟合。

限制：本轮是元数据和已有输入复核，新MRI读取/编码/拟合/专家报告/纳入均0。访谈痛、实验热痛、个人自发痛、病种诊断和疗效分别解释；缺项不补造。未恢复TN14、Emo B或其他暂停分支，未新建Goal/自动化，未联系作者。

下一步：优先整理Emo27访谈VAS的同人AAL90强FC和限定临床历史/混杂对照，作为限定的离线开发补充；同期疼痛/疗效目标仍先补真实时点和结局。CoSpine先核时间处理并准备动态/强FC参照，13人留出MRI保持未读。无新依据不追加ABIDE或Emo诊断模型搜索。

依据：pain-readiness-20261012、pain-readiness-20261012-summary、pain-readiness-20261012-cohorts

</details>

## 2026-10-09　五人疼痛读出：未超过协变量对照

- 模型：NeuroSTORM冻结表示＋三种神经读出；协变量回归
- 数据：CoSpine 5名健康人、75个相关试次
- 工作：比较平均池化、时间差分和时间注意力，按人留一预测热痛评分。
- 性能变化：使用MAE：协变量0.8762；三种影像读出分别3.3692、1.5627、2.6723，均未改善。
- 修改板块：时间特征与疼痛读出

试次不当作独立患者；实验热痛不等于慢性疾病分类。

<details><summary>参数、完整记录与依据</summary>

原标题：五人疼痛读出：未超过协变量对照

原摘要：5名健康开发受试者、75个相关试次按人留一。30个神经读出和5个协变量拟合完成并独立重放；PR评分平均MAE：协变量0.8762，平均池化3.3692，时间差分1.5627，时间注意力2.6723。三个影像残差读出均未超过协变量，本轮配置停止扩展。

原结果：5名健康开发受试者、75个相关试次按人留一。30个神经读出和5个协变量拟合完成并独立重放；PR评分平均MAE：协变量0.8762，平均池化3.3692，时间差分1.5627，时间注意力2.6723。三个影像残差读出均未超过协变量，本轮配置停止扩展。

具体方法：五个开发人按人留一、三读出两seed共30头及5协变量拟合；独立保存模型重放，MRI与encoder不重跑。

限制：这是五人健康热痛的离线开发诊断，75个试次不能当75名独立受试者；未读13名研究留出、未新增专家报告或临床验证。当前比较没有强FC、随机encoder、作者prompt或内部adapter对照，不能证明完整方法优劣或论文创新。研究总目标尚未完成。

下一步：按原顺序接续已关闭开发输入的必要空间处理与编码，保留原采集9项失败及部分文件；后续优先核实任务时间、报告混合和采集差异，再以新问题比较真实动态对照或作者任务适配，不重扫本轮池化/差分/注意力配置。临床真值、日期、人员及预训练重叠与独立H-test仍需真实依据。

依据：five-person-readout-20261009、five-person-readout-20261009-summary

</details>

## 2026-10-08　3人非线性、双模型真实特征与5人缓存描述

- 模型：NeuroSTORM／Omni-fMRI
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：扩展跨人影像输入，提取NeuroSTORM与Omni-fMRI真实表示。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：3人非线性、双模型真实特征与5人缓存描述

原摘要：新增3名开发受试者完成固定非线性映射、230帧单次空间重采样及63次NeuroSTORM冻结编码。独立核对622,814,010个BOLD值和5,824,224个缓存值，15幅私有空间图已查看。Omni完成1次固定真实MRI前向，CLS768及4,848个动态patch通过独立复核。累计5人75个相关主窗口中，人间均值差异占池化总离差平方和约99.9506%。

原结果：新增3名开发受试者完成固定非线性映射、230帧单次空间重采样及63次NeuroSTORM冻结编码。独立核对622,814,010个BOLD值和5,824,224个缓存值，15幅私有空间图已查看。Omni完成1次固定真实MRI前向，CLS768及4,848个动态patch通过独立复核。累计5人75个相关主窗口中，人间均值差异占池化总离差平方和约99.9506%。

具体方法：新增3人固定FNIRT组合、单次完整BOLD空间采样和真实冻结编码及独立读回；旧FAST/BBR和模型调用不重复。

限制：这是健康开发人群的空间和表示描述，没有新增疼痛预测拟合、专家报告或独立临床成绩；75个窗口不能当75名独立受试者，人间差异不等于疼痛信号。研究总目标尚未完成。

下一步：沿原采集作业接续关闭的开发输入；在明确物理时间、预处理和人级分区后，对冻结池化、时间差异token读出、作者任务提示及同容量监督方法做有限开发比较，保留强FC、协变量与适用传统对照。

依据：three-person-nonlinear-20261008、three-person-nonlinear-20261008-summary

</details>

## 2026-10-08　3人开发BBR与Omni-fMRI官方权重核查

- 模型：NeuroSTORM／Omni-fMRI
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：核查新增成员的配准结果，并验证Omni-fMRI官方权重。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：3人开发BBR与Omni-fMRI官方权重核查

原摘要：新增3名开发受试者各完成1次固定BBR，复用已完成FAST和刚体矩阵。独立读回27,039,744个输出值，并核对10,074,031个源内部插值点；六幅私有BBR/刚体对照图已查看。Omni-fMRI官方特征权重349项匹配加载，完成1次合成编码器前向，CLS768和768维patch通过形状/有限值检查；完整模型缺两项未调用classifier参数，严格全模型加载失败及前向后的保存失败保留。

原结果：新增3名开发受试者各完成1次固定BBR，复用已完成FAST和刚体矩阵。独立读回27,039,744个输出值，并核对10,074,031个源内部插值点；六幅私有BBR/刚体对照图已查看。Omni-fMRI官方特征权重349项匹配加载，完成1次合成编码器前向，CLS768和768维patch通过形状/有限值检查；完整模型缺两项未调用classifier参数，严格全模型加载失败及前向后的保存失败保留。

具体方法：新增3人各一次固定BBR与独立spline读回，原FAST和刚体复用；官方权重受限读取和严格加载按实际终态报告。

限制：本轮没有新增真实MRI编码、疼痛预测拟合或临床成绩；BBR位移不等于配准改善，合成前向不等于疼痛收益。实际专家新增0，新3人非线性映射仍未做。研究总目标尚未完成。

下一步：按原顺序对已完成BBR的3人接续固定非线性映射和独立空间复核，再进行真实编码。Omni与NeuroSTORM的物理时间和预处理须先明确，按同预算比较冻结池化、时序差异、作者提示适配和同容量监督读出，保留必要传统对照。

依据：development-bbr-checkpoint-20261008、development-bbr-checkpoint-20261008-summary

</details>

## 2026-10-08　Omni-fMRI模型运行与3人开发输入扩展

- 模型：NeuroSTORM／Omni-fMRI
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：接入Omni-fMRI运行环境并准备新增成员输入。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Omni-fMRI模型运行与3人开发输入扩展

原摘要：Omni-fMRI作者标准SDPA组件完成2次实际调用，完整12层编码器完成1次随机权重合成输入前向，输出CLS768和954个动态patch。官方权重已下载，但完整加载或预训练前向尚未通过，实际失败保留。新增3人完成固定裁剪、FAST与初始配准，独立读取300,145,071个空间结果值，私有6幅图已查看。

原结果：Omni-fMRI作者标准SDPA组件完成2次实际调用，完整12层编码器完成1次随机权重合成输入前向，输出CLS768和954个动态patch。官方权重已下载，但完整加载或预训练前向尚未通过，实际失败保留。新增3人完成固定裁剪、FAST与初始配准，独立读取300,145,071个空间结果值，私有6幅图已查看。

具体方法：作者标准SDPA组件与完整编码器实际前向、官方权重读取及键覆盖检查；新增3人固定裁剪和独立完整值读回，保留真实失败。

限制：这是运行兼容性和输入准备，没有新疼痛预测拟合或临床成绩；新3人的BBR、非线性映射和真实编码尚未开展。实际专家新增0，原2人真实表示不重复。三个独立临床目标尚未完成。

下一步：继续原采集作业，保留网络失败；对已复核3人按原顺序接续固定BBR/非线性与真实编码。Omni真实输入须先说明与NeuroSTORM一致的物理时间和各自预处理，再比较冻结读出、时间差异与作者提示适配，保留同容量监督和适用传统对照。

依据：omni-runtime-expansion-20261008、omni-runtime-expansion-20261008-summary

</details>

## 2026-10-08　真实表示：新增编码与两人缓存比较

- 模型：NeuroSTORM
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：提取新增成员的真实表示，比较人内变化和人间差异。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：真实表示：新增编码与两人缓存比较

原摘要：1名新增开发受试者完成固定非线性映射、230帧单次空间重采样和21次冻结编码；独立核对207,604,670个BOLD值及1,941,408个缓存值。累计2人的30个主窗口缓存显示，平均池化表示的跨人相对差异约28.15%，人内窗口偏离约0.054%～0.924%。这些是表示描述，尚无疼痛预测结果。

原结果：1名新增开发受试者完成固定非线性映射、230帧单次空间重采样和21次冻结编码；独立核对207,604,670个BOLD值及1,941,408个缓存值。累计2人的30个主窗口缓存显示，平均池化表示的跨人相对差异约28.15%，人内窗口偏离约0.054%～0.924%。这些是表示描述，尚无疼痛预测结果。

具体方法：复用已完成BBR，固定FNIRT和完整230帧映射；新增21次冻结编码与独立数值复核，2人缓存描述比较；保留Omni依赖失败。

限制：模型拟合0、留出MRI读取0、实际专家新增0；2人和30个相关窗口不能证明泛化、疼痛特异性或临床效用。Omni-fMRI组件探测因缺timm在导入阶段失败，前向调用0。三个独立临床目标尚未完成。

下一步：接续原采集作业并保留网络失败，对原顺序已关闭输入沿用同一固定空间和编码方案。输入人数足够后，比较冻结池化、时间差异token读出、作者提示适配和同容量监督方法；核实Omni独立依赖及真实前向，统一物理时间与预算，保留传统模型作为对照。

依据：development-real-tokens-20261008、development-real-tokens-20261008-summary

</details>

## 2026-10-08　新增开发输入：单位、组织分割与BBR复核

- 模型：影像预处理流程
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：核对新增成员的空间单位、组织分割和配准。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：新增开发输入：单位、组织分割与BBR复核

原摘要：1名新增开发受试者完成空间单位副本、裁剪、FAST、初始刚体/仿射与BBR；独立数值复核和私有图像技术检查已完成，非线性映射及新模型编码尚未开展。截至记录，25人采集作业新增完成3人，3人网络超时保留失败，原作业仍在接续。

原结果：1名新增开发受试者完成空间单位副本、裁剪、FAST、初始刚体/仿射与BBR；独立数值复核和私有图像技术检查已完成，非线性映射及新模型编码尚未开展。截至记录，25人采集作业新增完成3人，3人网络超时保留失败，原作业仍在接续。

具体方法：1名新增开发输入的空间单位副本、固定裁剪/FAST/刚体/仿射/BBR及独立插值复核；保留渲染/插值假设失败和网络超时，不重原前向。

限制：这是新增1人的技术输入推进，拟合0、专家新增0，不能证明配准改善、疼痛预测收益或临床效用。原前26开发/后13研究留出保持，留出MRI未读；三个独立临床目标尚未完成。

下一步：接续同一采集作业，保留超时的部分文件和失败记录；对已完成输入继续固定非线性映射及独立复核，再开展预先说明预算和时间窗口的跨人表示比较。保留作者提示调优、差异token读出与同容量监督对照；新模型先核实官方输入和权重，不靠名称或最高开发分数判断论文贡献。

依据：cospine-development-space-20261008、cospine-development-space-20261008-summary

</details>

## 2026-10-08　NeuroSTORM固定时间对照与跨人开发输入

- 模型：NeuroSTORM
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：比较真实时序、恒定帧与倒序输入，检查编码器是否利用时间变化。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：时序表示诊断

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：NeuroSTORM固定时间对照与跨人开发输入

原摘要：三个预先指定的真实窗口完成恒定均值帧、倒序共6次冻结前向，独立输入和指标重放通过。去掉实测时间变化后，内部token时间变化仍约7.67%；池化向量的变化很小。另25个开发输入正在按原人序采集，截至记录完成1/25人的原生影像及事件输入核查。

原结果：三个预先指定的真实窗口完成恒定均值帧、倒序共6次冻结前向，独立输入和指标重放通过。去掉实测时间变化后，内部token时间变化仍约7.67%；池化向量的变化很小。另25个开发输入正在按原人序采集，截至记录完成1/25人的原生影像及事件输入核查。

具体方法：复用三个固定原窗口的结果，新增恒定均值帧和倒序6次前向；独立输入/指标重放，不重原21次；按原人序推进剩余25个开发输入，留出不读。

限制：时间对照只涉及1名健康热痛受试者，拟合0、专家新增0，不能据此归因疼痛或证明临床效用。输入核查不是MNI配准、专家QC或训练纳入；13名研究留出未读。三个独立临床目标尚未完成。

下一步：接续原作业完成剩余开发输入，保留失败和原人员顺序；再完成必要空间处理及跨人任务设计，比较实际token减恒定均值token的差异读出、冻结池化、作者提示调优及同容量监督。原传统方法作适用对照；机制查新与稳定跨人增量决定是否形成论文贡献。

依据：token-dynamics-20261008、token-dynamics-20261008-summary

</details>

## 2026-10-08　CoSpine真实任务窗口与NeuroSTORM时空特征

- 模型：NeuroSTORM
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：对真实热痛任务窗口提取冻结时空特征。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine真实任务窗口与NeuroSTORM时空特征

原摘要：CoSpine首人完整230帧已映射到MNI；15个固定早期窗口和6个时间参考敏感性窗口完成21次冻结NeuroSTORM内部前向。真实时空特征全部为有限值，独立读回通过。

原结果：CoSpine首人完整230帧已映射到MNI；15个固定早期窗口和6个时间参考敏感性窗口完成21次冻结NeuroSTORM内部前向。真实时空特征全部为有限值，独立读回通过。

具体方法：复用已核对形变映射完整230帧；声明固定早期事件采样、空间补边和整段归一化；严格加载冻结NeuroSTORM，21次真实窗口内部前向，拟合0。

限制：这是1名健康热痛受试者的输入与表示实验，预测拟合0、专家新增0。池化向量在15窗口间变化很小，不能当作疼痛稳定性或有效性。事件插值/空间补边/整段归一化采用明确的本地设置；原切片参考与时间滤波仍未知，不能证明评分信号已排除。

下一步：先用固定的重复帧与时间顺序对照检查时空表示，区分位置编码、静态成分与真实动态；再在原26开发/13研究留出范围内开展有限疼痛任务适配，与冻结表示、作者提示调优、同容量监督及适用FC/协变量公平比较。旧停止分支保持，三个独立临床目标尚未完成。

依据：cospine-real-tokens-20261008、cospine-real-tokens-20261008-summary

</details>

## 2026-10-08　CoSpine非线性映射与任务窗口复核

- 模型：影像预处理流程
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：核对空间映射与事件窗口，发现部分窗口可能用到评分开始后的采样。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine非线性映射与任务窗口复核

原摘要：CoSpine首人固定FNIRT与BBR组合完成，独立支持重采样及90区计数一致；平均非零覆盖99.42%，上一阶段仿射为99.54%，两次均无零支持区。真实事件窗口复核发现，在暂定帧参考0下，20×0.8秒窗口的插值需要评分开始后的采样点，涉及3/15试次。

原结果：CoSpine首人固定FNIRT与BBR组合完成，独立支持重采样及90区计数一致；平均非零覆盖99.42%，上一阶段仿射为99.54%，两次均无零支持区。真实事件窗口复核发现，在暂定帧参考0下，20×0.8秒窗口的插值需要评分开始后的采样点，涉及3/15试次。

具体方法：固定安装FNIRT配置；复用BBR/仿射，一次重采样均值和支持；独立相对场/图谱计数、私有像素及无评分窗口支持复核，拟合0。

限制：这是1人的空间/时间输入研究，无新增预测成绩。非零覆盖和正Jacobian不等于解剖准确；时间重采样不能增加真实分辨率。实际切片参考/派生滤波仍未知，完整4D重采样、任务特征和患者拟合均未做，专家新增0、独立临床目标未完成。

下一步：复用已核对形变，完成服务器端完整时间序列空间映射；明确自己的物理时间窗口和实际派生处理限制，再做真实时空token前向。固定提前窗口仅为候选，包含预刺激/早期响应，不能宣称纯疼痛。随后按人员26开发/13研究留出比较冻结、作者提示调优、同容量监督和疼痛任务适配，保留旧停止状态。

依据：cospine-nonlinear-time-20261008、cospine-nonlinear-time-20261008-summary

</details>

## 2026-10-08　CoSpine偏置校正与BBR边界复核

- 模型：影像预处理流程
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：完成偏置校正、组织分割与脑边界配准核查。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine偏置校正与BBR边界复核

原摘要：CoSpine首人固定FAST偏置校正及三类组织分割完成，白质概率≥0.5得到517,792体素；复用原刚体初始化和实际白质边界，BBR命令完成。独立核对新输出9,013,248个有限值、校正算术及刚体矩阵，并查看四张私有截面图。

原结果：CoSpine首人固定FAST偏置校正及三类组织分割完成，白质概率≥0.5得到517,792体素；复用原刚体初始化和实际白质边界，BBR命令完成。独立核对新输出9,013,248个有限值、校正算术及刚体矩阵，并查看四张私有截面图。

具体方法：固定FAST偏置/组织分割；复用原刚体初始化及白质边界BBR；校正算术与矩阵独立复核，四张私有图实际查看，模型拟合0。

限制：这是1人的输入处理，无新增预测成绩。BBR与原刚体位置变化不等于配准改善；尚未做FNIRT或新的MNI组合，因此99.54%是上一阶段仿射覆盖。实际专家新增0、患者模型拟合0、独立临床验证未完成，完整MRI留服务器。

下一步：复用现有结果完成必要MNI非线性配准与实际时间处理核对，再提取逐试次特征。论文主线继续NeuroSTORM疼痛任务适配，比较冻结表示、作者任务提示调优和同容量直接监督；刺激/血流延迟/评分动作的区分是待检验问题，普通adapter本身不称原创。保持26开发/13研究留出，不重开旧配置搜索。

依据：cospine-bias-bbr-20261008、cospine-bias-bbr-20261008-summary

</details>

## 2026-10-08　CoSpine脑提取修复与空间覆盖复核

- 模型：影像预处理流程
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：修复脑提取并复查脑区覆盖。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CoSpine脑提取修复与空间覆盖复核

原摘要：CoSpine首人复用原T1，先按标准方向重定向并以默认170毫米去除颈部，再执行原BET-R。掩膜体积约1287毫升；同参数重新仿射配准后，AAL90平均非零覆盖由64.83%升至99.54%，零支持区由4降至0、不足一半由29降至0，最小覆盖91.43%。

原结果：CoSpine首人复用原T1，先按标准方向重定向并以默认170毫米去除颈部，再执行原BET-R。掩膜体积约1287毫升；同参数重新仿射配准后，AAL90平均非零覆盖由64.83%升至99.54%，零支持区由4降至0、不足一半由29降至0，最小覆盖91.43%。

具体方法：固定170毫米去颈部后BET-R；同参数两级仿射；新裁剪全值映射、90区覆盖和私有像素复核，模型拟合0。

限制：这是1人的空间输入修复，非零覆盖不代表有效神经信号或解剖准确。未完成偏置校正、BBR或FNIRT，实际专家新增0、患者模型拟合0；不据此声称疼痛预测增量、完整作者复现或独立临床验证。原文件/标签/人员划分/QC与全部失败和停止状态保持。

下一步：继续复用首人输入，完成有依据的偏置校正与必要配准；核对实际派生时间处理，明确参考时间/滤波不确定性后提取任务特征。沿26开发/13研究留出推进NeuroSTORM真实时空任务适配及同条件参照，普通adapter本身不称原创，不重做旧配置搜索。

依据：cospine-brain-repair-20261008、cospine-brain-repair-20261008-summary

</details>

## 2026-10-08　NeuroSTORM内部适配与CoSpine空间试验

- 模型：NeuroSTORM
- 数据：CoSpine开发成员；人数按原节点记录
- 工作：接入内部适配器，同时检查首人的空间输入。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：影像输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：NeuroSTORM内部适配与CoSpine空间试验

原摘要：NeuroSTORM的5480参数内部适配器通过真实CUDA合成前向、反向和保存重载，5173020参数编码器保持冻结。CoSpine首人T1完整读取15925248有限值，BET及两级仿射命令完成；AAL90有4区无支持、29区支持不足一半，平均覆盖64.83%。患者模型拟合0。

原结果：NeuroSTORM的5480参数内部适配器通过真实CUDA合成前向、反向和保存重载，5173020参数编码器保持冻结。CoSpine首人T1完整读取15925248有限值，BET及两级仿射命令完成；AAL90有4区无支持、29区支持不足一半，平均覆盖64.83%。患者模型拟合0。

具体方法：首人T1全值、仿射矩阵及覆盖独立复核；5480参数内部adapter真实CUDA合成梯度；真实事件设计，患者拟合0。

限制：内部adapter接口通过不等于新方法有效；八个空间格点不是ROI，普通bottleneck也不是LoRA。单人仿射与非零覆盖是技术观察，不是非线性标准化、专家QC、完整作者复现或独立临床验证。原132及各旧结果/停止、QC授权/专家0/25注意保持；39健康者585试次仍是39人。

下一步：先修正脑提取并复核配准、实际派生滤波及切片参考时间，再提取逐试次特征。沿26开发/13研究性留出，用新的有限任务适配假设比较冻结GAP、时空token和内部适配及同条件强参照；不重做54图模型或旧停止搜索。

依据：task-adaptation-space-20261008、task-adaptation-space-20261008-summary、task-adaptation-space-20261008-code0、task-adaptation-space-20261008-code1

</details>

## 2026-10-08　分层图Transformer：拓扑偏置消融

- 模型：轻量分层图Transformer
- 数据：成人偏头痛132人开发数据
- 工作：比较乘法衰减、加法拓扑先验与无拓扑偏置。
- 性能变化：验证AUC分别0.5871、0.5832、0.5871；加法先验比无偏置低约0.39个百分点，未见稳定改善。
- 原论文 baseline：[BrainHGT，原文表1–2](https://arxiv.org/html/2511.17604#S4.T1)。ABIDE：完整模型 AUC 0.7665±0.0145；原文最强对照 ALTER 0.7580±0.0263。ADNI：完整模型 0.8084±0.0138；ALTER 0.7956±0.0272。 原文为ASD／阿尔茨海默病分类，训练／验证／测试70%／10%／20%，重复10次；与疼痛开发实验分别解释。±为原文标准差。
- 修改板块：图注意力的拓扑偏置

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：分层图Transformer：拓扑偏置消融

原摘要：分层图Transformer完成54个保存模型，每个6869参数；六组44训练/44验证、三seed比较乘法衰减、加log先验、无拓扑偏置。验证AUC均值0.5871、0.5832、0.5871，训练均1.0。加log使短程头分配给两跳外的注意力从84.12%降到70.77%，但AUC未稳定改善，停止当前偏置配置搜索。

原结果：分层图Transformer完成54个保存模型，每个6869参数；六组44训练/44验证、三seed比较乘法衰减、加log先验、无拓扑偏置。验证AUC均值0.5871、0.5832、0.5871，训练均1.0。加log使短程头分配给两跳外的注意力从84.12%降到70.77%，但AUC未稳定改善，停止当前偏置配置搜索。

具体方法：真实标准图谱重叠/原132的signedFC与OMST本地重建；三固定偏置同6869参数，54保存模型/55实际梯度拟合，2376概率独立NumPy重放。

限制：这是原132人反复使用的开发数据和本地小型层级适配，不是BrainHGT完整复现、新独立队列或临床验证。七网络先验来自真实标准图谱，第8类为未覆盖区域而非生物学网络。54配置实际55次梯度拟合，含一次保存失败丢失的模型；失败保留，未扩大科学配置。原标签、人员划分、QC授权/专家0/25注意、旧结果和停止分支保持。

下一步：停止当前拓扑偏置的参数搜索。优先复用CoSpine首人输入完成T1/空间处理与逐试次疼痛特征，并核对NeuroSTORM中间token及末段适配接口；新实验先定义有限任务适配假设。原队列继续作为开发/迁移数据，按病种、访视和终点分开；传统方法保留为对照。

依据：hierarchical-transformer-20261008、hierarchical-transformer-20261008-summary、hierarchical-transformer-20261008-figure、hierarchical-transformer-20261008-code0、hierarchical-transformer-20261008-code1、hierarchical-transformer-20261008-code2

</details>

## 2026-10-08　多算法开发比较与CoSpine影像输入核对

- 模型：线性SVM、RBF SVM、随机森林
- 数据：成人偏头痛132人；CoSpine输入另行核查
- 工作：比较影像＋协变量与仅协变量，并核对CoSpine后续输入。
- 性能变化：影像／协变量AUC：线性SVM 0.4704／0.4595，RBF 0.5598／0.4196，森林0.5064／0.6579；没有一致影像增量。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：传统分类器与模态增量

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：多算法开发比较与CoSpine影像输入核对

原摘要：原132人开发数据完成60个固定模型：线性SVM、RBF SVM、浅随机森林，分别比较FC加4协变量与仅4协变量。验证AUC均值依次0.4704/0.4595、0.5598/0.4196、0.5064/0.6579；影像森林训练AUC1.0、验证0.5064。72个SVM校准器有33个反转方向，影像SVM校准前验证AUC仅0.5058/0.5232。没有稳定影像增量，停止本轮配置搜索。CoSpine已核对39人585个疼痛试次，并完整读取首人native脑影像与事件时间轴。

原结果：原132人开发数据完成60个固定模型：线性SVM、RBF SVM、浅随机森林，分别比较FC加4协变量与仅4协变量。验证AUC均值依次0.4704/0.4595、0.5598/0.4196、0.5064/0.6579；影像森林训练AUC1.0、验证0.5064。72个SVM校准器有33个反转方向，影像SVM校准前验证AUC仅0.5058/0.5232。没有稳定影像增量，停止本轮配置搜索。CoSpine已核对39人585个疼痛试次，并完整读取首人native脑影像与事件时间轴。

具体方法：六既有44/44内层分区，两特征，固定SVM训练内校准与浅森林三个seed；60保存模型、108基础/72校准拟合、独立2640概率重放。新CoSpine全事件核对和首人服务器原生影像完整读回。

限制：60是模型数，仍是原132开发人，六组44训练/44验证，每组7对照/37病例；森林三个seed及人员分区相关。SVM标准化与sigmoid校准限于训练内，校准折仅2或3对照；固定参数，没有原外层查询评分、阈值调优或新增H-test。108基础分类器拟合和72校准拟合全部保存；独立重放2640概率。高病例先验使Brier/logloss较低或AP较高也不等于判别改善。CoSpine是39名健康者实验热痛，585试次不算585人；首份预处理影像数值/时间轴可用，不等于MNI配准、专家QC、全39人就绪或临床验证。ZAN为已使用的原队列，重新查到的66登记/56BOLD不算新增人。原36图模型停止、540/45及1609、TN14停止、原QC授权/专家0/25注意与标签/人员划分保持。

下一步：沿用并改进原SRPBS、ZAN、Emo、PRT等数据与方法，按各自真实终点分别研究；不重做已完成实验或混合病种/量表。优先CoSpine跨人逐试次疼痛特征与人员留出方案，以及原开发方法的过拟合、类别不平衡和校准诊断。每项改动先明确有限假设并同人员、特征、监督预算比较。独立临床诊断、同期评分与疗效真值/日期、预训练重叠、专家复核和正式论文材料仍缺。

依据：research-expansion-20261008、research-expansion-20261008-summary、research-expansion-20261008-figure、research-expansion-20261008-code0、research-expansion-20261008-code1、research-expansion-20261008-code2

</details>

## 2026-10-08　静态GCN与无图：36次开发诊断

- 模型：轻量静态GCN、同容量无图网络
- 数据：成人偏头痛132人开发数据
- 工作：在相同人员和容量下检验图传播是否有用。
- 性能变化：平均AUC 0.532390→0.552338，增加1.99个百分点；方向不一致且训练接近满分，未建立可靠泛化。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：图连接与消息传播

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：静态GCN与无图：36次开发诊断

原摘要：轻量静态GCN与同容量无图消融完成36次训练内开发拟合，每模型1749参数。全部18组验证AUC均值0.552338/0.532390，成对平均差0.019949；仅11/18组AUC改善、10/18组Brier改善，差值方向不一致。两方法训练AUC均约0.997426，验证明显较弱，存在过拟合。停止这一静态正边GCN假设，不扩大配置、seed或查询搜索。

原结果：轻量静态GCN与同容量无图消融完成36次训练内开发拟合，每模型1749参数。全部18组验证AUC均值0.552338/0.532390，成对平均差0.019949；仅11/18组AUC改善、10/18组Brier改善，差值方向不一致。两方法训练AUC均约0.997426，验证明显较弱，存在过拟合。停止这一静态正边GCN假设，不扩大配置、seed或查询搜索。

具体方法：六个原44/44训练内分区，seed0/1/2，两方法1749参数；固定100epoch、训练人变换/权重、保存重载及独立NumPy重放。

限制：复用原132开发人和六个44训练/44验证内层分区，每训练集7对照/37病例，seed0/1/2全报告；分区与seed相关，不当18个独立队列。节点输入为signed FC行，传播仅正边加自环；两方法同输入/参数/监督/损失/优化器/epochs，只改变传播是否为I。训练人拟合节点列与协变量标准化、训练类均衡权重；固定100epoch，无验证早停或选最优，无外层查询计算。新44人监督不能与原K5成绩直接作公平增量；未证明强FC/协变量增量、K5鲁棒性、预训练收益、生物标志物或独立临床泛化。原540/45和1609拟合保持，本轮36另列，不回写主分析；专家0/25注意、用户QC全纳入、真实三终点/日期/预训练重叠/H-test与投稿声明缺口保留。

下一步：停止当前静态正边GCN方向并保留全部正负结果。任务态连接特征等待真实作者个人分区和metadata；独立诊断/同期疼痛/疗效验证等待相应真实标签、日期与未开发人员。当前不增加架构或参数搜索。

依据：static-graph-diagnostic-20261008、static-graph-diagnostic-20261008-summary、static-graph-diagnostic-20261008-figure、static-graph-diagnostic-20261008-code0、static-graph-diagnostic-20261008-code1、static-graph-diagnostic-20261008-code2、static-graph-diagnostic-20261008-code3、static-graph-diagnostic-20261008-code4

</details>

## 2026-10-07　训练方法：正则尺度、窗口与归一化

- 模型：官方体积表示＋Logistic、同结构随机表示
- 数据：成人偏头痛132人
- 工作：复查归一化、训练求解及分类训练方式，并整合已完成实验。
- 性能变化：局部配置有变化，未获得一致预测提升；原K5阴性结论不变，本条文稿整理未新增AUC。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：输入归一化与分类训练

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：训练方法：正则尺度、窗口与归一化

原摘要：有限训练诊断已完成：先前L1 1225新拟合、作者默认96、原中央窗口48、新归一化与后续240，累计1609；原K5 540另列。已完成训练的四项诊断已整合论文Methods、Results和Discussion：240保存头、10,560训练内概率、全部40个阶段配置与可复现附录。数值精度改善，类均衡的概率误差代价与随机对照更强的结果同时保留；原K5主分析及阴性结论不变，本次新增拟合/查询评分0。 开发性论文阅读材料已整理：当前Methods、Results、Discussion保留全部主要比较，6组历史运行记录移至完整附录，原K5图及40训练配置可查。本次没有新拟合或评分；作者/伦理/许可及独立临床真值仍缺，不是提交就绪稿。

原结果：有限训练诊断已完成：先前L1 1225新拟合、作者默认96、原中央窗口48、新归一化与后续240，累计1609；原K5 540另列。已完成训练的四项诊断已整合论文Methods、Results和Discussion：240保存头、10,560训练内概率、全部40个阶段配置与可复现附录。数值精度改善，类均衡的概率误差代价与随机对照更强的结果同时保留；原K5主分析及阴性结论不变，本次新增拟合/查询评分0。 开发性论文阅读材料已整理：当前Methods、Results、Discussion保留全部主要比较，6组历史运行记录移至完整附录，原K5图及40训练配置可查。本次没有新拟合或评分；作者/伦理/许可及独立临床真值仍缺，不是提交就绪稿。

具体方法：既有四方法有限L1、作者默认头和原中央窗口对照保留；新输入默认48→同目标精度48→类均衡48→训练lambda_max四比例L1 96。六原训练内分区，每折44训练/44验证，Scaler与类权重/正则阈值仅训练估计，全部8/8/8/16配置保留、不选最优。240模型和10560概率已经分别独立重放。本次正文与表格整合新增拟合/重采样/前向/查询评分0。

限制：原有限诊断常数解、全部阴性结果和选择记录保留，详见原报告。新归一化联合改变多因素；严格求解不保证预测增益，类均衡八配置Brier均更差，相对L1在原始尺度随机更强、标准化时预训练更强，无一致预训练优势。原132人训练按用户授权QC全纳入，实际专家报告0、25原注意/文件/标签/划分保持。六内层分区人员重复，未知预训练重叠、空间/窗口/CONN差异与准确日期/临床真值/H-test缺失保留；未成立独立临床验证、完整作者复现或超越论文。

下一步：保留全部已完成结果；核对整体目标缺口，缺独立临床真值、日期和H-test时不执行对应终点，不编造投稿声明。

依据：migraine-support-l1-20261007、migraine-support-l1-20261007-summary、migraine-support-l1-20261007-table、migraine-support-l1-20261007-code0、migraine-support-l1-20261007-code1、migraine-support-l1-20261007-code2、migraine-support-l1-20261007-code3、migraine-support-l1-20261007-code4、migraine-support-l1-20261007-code5、migraine-support-l1-20261007-code6、migraine-author-head-20261007、migraine-author-head-20261007-summary、migraine-author-head-20261007-table、migraine-author-head-20261007-code0、migraine-author-head-20261007-code1、migraine-author-head-20261007-code2、migraine-author-input-20261007、migraine-author-input-20261007-summary、migraine-author-input-20261007-table、migraine-author-input-20261007-code0、migraine-author-input-20261007-code1、migraine-author-input-20261007-code2、migraine-author-input-20261007-code3、migraine-author-input-20261007-code4、migraine-normalization-20261007、migraine-normalization-20261007-summary、migraine-normalization-20261007-table、migraine-normalization-20261007-code0、migraine-normalization-20261007-code1、migraine-normalization-20261007-code2、migraine-normalization-20261007-code3、migraine-normalization-20261007-code4、migraine-normalization-20261007-code5、migraine-normalization-20261007-code6、migraine-normalization-20261007-code7、migraine-normalization-20261007-code8、migraine-normalization-20261007-code9、migraine-normalization-20261007-code10、migraine-normalization-20261007-code11、migraine-normalization-20261007-manuscript-appendix、migraine-normalization-20261007-manuscript-table、migraine-normalization-20261007-code12、manuscript-reading-history-20261007、manuscript-reading-materials-20261007、manuscript-reading-summary-20261007、manuscript-reading-code-20261007

</details>

## 2026-10-06　DEIPP：旧转换丢失离散标签值，整数修复已独立核对

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：修复标签转换并核对评分与功能影像的时序连接。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：旧转换丢失离散标签值，整数修复已独立核对

原摘要：首份疼痛评分任务（rating_run-1）的两条功能映射已完成，四份最终CIFTI完整读回共476,126,912个有限值。每份1304×91,282，TR0.46秒、起点0；左右皮层29,696/29,716顶点和19个子皮层脑区共31,870体素逐集合对应，未平滑/6毫米两档保留。固定13帧延迟连接原VAS与1225脑行，原标签未改；实际MATLAB2/5/10分箱已独立核对全部7,350个分组值，差0，组均值最大差1.221245327087672e-15。

原结果：首份疼痛评分任务（rating_run-1）的两条功能映射已完成，四份最终CIFTI完整读回共476,126,912个有限值。每份1304×91,282，TR0.46秒、起点0；左右皮层29,696/29,716顶点和19个子皮层脑区共31,870体素逐集合对应，未平滑/6毫米两档保留。固定13帧延迟连接原VAS与1225脑行，原标签未改；实际MATLAB2/5/10分箱已独立核对全部7,350个分组值，差0，组均值最大差1.221245327087672e-15。

具体方法：完整逐值比较三个离散标签图，保留旧转换的标签损失失败；独立整数转换及原Workbench导入完成，另一个进程用数组置换与翻转独立核对。完整ciftify及临床验证仍未完成。 后续：八个标准体积、两个变形场完整读取；原保存变换回放，整数标签在同旧warp定位问题，皮层下表独立纯Python回放。 后续：原三步脑掩膜生成及T1乘掩膜实际执行；旧/修复原生掩膜完整比较，独立Python逐值回放T1乘掩膜。 后续：十份原生表面及拓扑完整读取；源球面与中间面平均、float32平移逐值回放；真实mri_info复核CRAS写出格式。 后续：完整整数适配保存数组独立读取、源标签回放、新保存变换重放及结构到功能配准前缀核对；原缺模板失败与后缀恢复保留。 后续：当前版本显式线性分量诊断、保存输出独立读回、固定中央面技术查看及真实MATLAB运动帧标记方程独立回放；原pca缺函数失败保留。 后续：新组织掩膜完整读回，CSF实际编号集合与WM/CSF腐蚀逐值独立核对；明确PCA版本适配准备，原函数缺失保留。 后续：1304帧完整4D与逐帧合并独立读回，真实WM/CSF各5PC以时间Gram特征分解重放，1304×16干扰矩阵逐值核对；明确Python/SciPy版本适配。 后续：完整读取固定NTRP投影及加均值4D，逐值回放加法和时间均值；12预定空间位置独立重建AFNI源公式投影，报告真实差异；保存两次功能ciftify代码失败，只恢复必要后缀。 后续：实际读取两个标签体积XML、四个中间CIFTI轴，按输入ROI编号独立核对123970个体素到脑区映射及31870个模板标签值；不改活跃作业。 后续：首份rating的既有矩阵组合、均值独立读回与固定中央面技术查看；实际MATLAB运动方程及独立Python核对。 后续：首份rating完整1304帧读回、全部逐帧输出与均值核对；任务自身组织PC及16列干扰独立Gram重放。 后续：首份rating固定高通去噪、完整两个4D及均值加法重放、12固定位置AFNI源公式独立测量。 后续：首份rating四最终CIFTI完整数值/轴读回、固定13帧标签对应及实际MATLAB2/5/10分箱独立重放。

限制：1225行来自同一人同一运行，是依赖时间点；不是1225名患者或独立临床样本。排名分箱短片段NaN为0/29/69行，完整MRI仍保留1304帧、物理删除0，不排除人或改变QC。首次独立时间分箱把自动边界误作首尾等分而失败；原输出/失败保留，按已安装R2025a的binpicker算法修正重放，MATLAB没有重跑。实际时间分箱边界为0:700:1400、0:250:1250、0:130:1300，时间组不等人数。作者个人分区和人工SCAN网络编号未取得，尚未生成作者parcel连接特征；完整作者复现、专家配准准确性及独立临床验证未成立。原Workbench警告、版本差异/跨访视T2、AFNI旧超差/合成失败，原540/45及1609阴性结果、用户QC授权/实际专家0/原25注意、临床真值/日期/预训练成员/H-test缺口保留。

下一步：rating必要轴/数值/标签分箱收尾已完成，复用这些真实receipt；取得真实个人分区与原metadata之前不宣称作者连接特征已完成。新静态GCN与同容量无图的36次训练内开发比较另见独立报告；无一致增量则停止，不重复影像或旧训练，不依据查询成绩扩搜索。

依据：deipp-label-semantics-20261006、deipp-label-semantics-20261006-summary

</details>

## 2026-10-06　DEIPP：两份静息前缀与首份结构输出已独立核对

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：两份静息前缀与首份结构输出核对
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：两份静息前缀与首份结构输出已独立核对

原摘要：10月6日，原第二、第三份静息头动与畸变前缀正常完成；独立进程完整读取四个80×80×56×1304输出，共1,869,414,400有限值，保存均值的float32舍入差和网格差均0。沿原参数执行两份同访视rating到静息矩阵及逆矩阵，保存均值诊断切面已查看。首份结构autorecon2/3命令正常完成，六个320³体积共196,608,000有限值、六个表面及双侧厚度已独立读取，T1/T2和表面交点中心图已查看。

原结果：10月6日，原第二、第三份静息头动与畸变前缀正常完成；独立进程完整读取四个80×80×56×1304输出，共1,869,414,400有限值，保存均值的float32舍入差和网格差均0。沿原参数执行两份同访视rating到静息矩阵及逆矩阵，保存均值诊断切面已查看。首份结构autorecon2/3命令正常完成，六个320³体积共196,608,000有限值、六个表面及双侧厚度已独立读取，T1/T2和表面交点中心图已查看。

具体方法：独立完整读回两份静息的运动和畸变输出，执行原跨运行矩阵；首份结构六个完整体积、六个表面及厚度实际读取，固定中央图查看。完整ciftify、患者流程与临床验证仍未完成。

限制：这是固定三人中的两份功能前缀与首份结构保存输出复核，新增参与者0。全脑解剖精度、跨访视T2配准专家意见、完整ciftify、结构到功能、最终删帧及临床终点配对仍未完成；专家/QC纳入、分类和独立临床验证均0。共同网格、有限数值及可逆矩阵不能证明准确配准。FreeSurfer7.3.2对作者7.2、原功能前缀AFNI25.2.09对作者23.0及历史失败保持。

下一步：容器原缺少MNI152标准资源，官方fsl-data_standard 2208.0/build0的196,312,969字节包现已在独立目录完整取得、75成员实际读取解包，六个必需模板完整数值载入且均有限；容器与共享环境保持。下一步继续T2和结构转换适配，尚未因此完成患者ciftify。132候选输入数值、同范围技术查看与逐人FC已全部核对，25项专家注意仍待判断；原K5四方法比较继续等待既有必要质量与身份条件。

依据：deipp-completed-prefix-20261006、deipp-completed-prefix-20261006-summary

</details>

## 2026-10-06　偏头痛132人输入已核查，25项仍待专家确认

- 模型：官方冻结体积表示、随机表示、强FC、协变量Logistic
- 数据：成人偏头痛132人（111患者、21对照）
- 工作：完成输入检查后，按每类5标签比较四种固定方法。
- 性能变化：FC AUC 0.5184、预训练0.5261、随机0.4990、协变量0.6138；预训练比FC高0.77个百分点，但差值区间跨0。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：体积表示迁移与小样本分类

按用户授权纳入；专家确认仍0，不能写成独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛132人输入已核查，25项仍待专家确认

原摘要：全132人候选输入已完成数值复核与同范围技术查看：264个288维向量、10032个保存窗口，窗口重组与组织均值误差0。新增25人全部按原顺序查看，另补齐早期4人的原生图；累计396个模型切面、1584个原生位置及792个源/滤波切面。新增6项条纹或组织与功能边界注意，累计25项待专家确认。396个小特征文件20847968字节已完整读回并实际载入，原107行与文件保持。132份时间信息与个体FC协方差已复算，残差自由度2—272、中位数260，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0；真实临床终点与独立H-test仍缺。 后续训练：132人按用户授权将训练质控标为通过并全部纳入：111名偏头痛、21名对照。原K5四方法540次拟合、45次训练人员FC参考已完成，540个保存头及2,640个预测独立重放差0。五次固定抽样平均AUC：FC 0.5184、官方冻结表示0.5261、随机同结构0.4990、仅协变量0.6138。冻结表示相对FC和随机模型的AUC差值区间均包含0，未见可靠整体改善；相对协变量的Brier误差更高。 论文交付：论文主要摘要、Methods、Results和Discussion已写入已完成132人训练，提供五支持AUC和三个配对参照的AUC/Brier图及矢量下载；原条件区间、用户授权纳入、专家报告0与临床缺口保持，没有新增训练或选择配置。 论文正文整理：论文主要Methods/Results已更新实际完成的全4D、患者组织PC、NTRP及中间CIFTI标签核对；早期未执行和失败段落明确为历史。另提供不夹带正文前后运行日志的审阅稿，全部原记录和科学阴性结果保留，功能数值与轴核对已完成，临床三个终点/H-test未完成，没有新训练或重采样。

原结果：全132人候选输入已完成数值复核与同范围技术查看：264个288维向量、10032个保存窗口，窗口重组与组织均值误差0。新增25人全部按原顺序查看，另补齐早期4人的原生图；累计396个模型切面、1584个原生位置及792个源/滤波切面。新增6项条纹或组织与功能边界注意，累计25项待专家确认。396个小特征文件20847968字节已完整读回并实际载入，原107行与文件保持。132份时间信息与个体FC协方差已复算，残差自由度2—272、中位数260，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0；真实临床终点与独立H-test仍缺。 后续训练：132人按用户授权将训练质控标为通过并全部纳入：111名偏头痛、21名对照。原K5四方法540次拟合、45次训练人员FC参考已完成，540个保存头及2,640个预测独立重放差0。五次固定抽样平均AUC：FC 0.5184、官方冻结表示0.5261、随机同结构0.4990、仅协变量0.6138。冻结表示相对FC和随机模型的AUC差值区间均包含0，未见可靠整体改善；相对协变量的Brier误差更高。 论文交付：论文主要摘要、Methods、Results和Discussion已写入已完成132人训练，提供五支持AUC和三个配对参照的AUC/Brier图及矢量下载；原条件区间、用户授权纳入、专家报告0与临床缺口保持，没有新增训练或选择配置。 论文正文整理：论文主要Methods/Results已更新实际完成的全4D、患者组织PC、NTRP及中间CIFTI标签核对；早期未执行和失败段落明确为历史。另提供不夹带正文前后运行日志的审阅稿，全部原记录和科学阴性结果保留，功能数值与轴核对已完成，临床三个终点/H-test未完成，没有新训练或重采样。

具体方法：新增25人实际窗口/空间/组织均值重算与全部固定技术图查看；132份原设计、ROI时序及逐人协方差实际计算。 后续按用户质控授权执行原K5四方法，540拟合45参考及全部保存预测重放。 论文主要正文整合与既有聚合图生成；没有新患者、训练、参考或重采样。 主要正文当前状态与历史记录分开，原科学结果保留，新增审阅副本。

限制：通过状态依据用户授权，132人训练纳入已落实；没有新增逐人专家审核报告，实际专家证据仍0，原25项质量注意与所有原文件保留。诊断开发对照仅有21名对照；预训练人员重叠未知，首编号访视不证明临床基线，准确日期、年龄、同期疼痛与治疗随访仍缺。AUPRC须对照84.09%的偏头痛比例。配对区间仅覆盖固定已训模型下的人员/五次支持抽样重采样，不包含重训及全部选参不确定性，不是独立临床验证。

下一步：训练阶段已完成；保留全部五次抽样及阴性比较，不按查询成绩扩大搜索。继续现有临床功能作业与必要组织协变量、NTRP和ciftify；未开发临床终点及H-test继续补齐。原20未评分，Emo13失败及TN14/结构535/CLIP停止状态保持，总Goal继续运行。

依据：migraine-input-review132-20261006、migraine-input-review132-20261006-summary、migraine-readiness-20261002-draft、migraine-input-pilot-20261002-literature、migraine-k5-training-20261006-figure、migraine-k5-training-20261006-figure-pdf、migraine-k5-training-20261006-figure-svg、migraine-k5-training-20261006-figure-code、manuscript-current-review-20261007

</details>

## 2026-10-05　DEIPP：三份同访视静息参考已取得并独立读回

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：三份同访视静息参考已取得并读回
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：三份同访视静息参考已取得并独立读回

原摘要：10月5日，原固定三人ses-01静息参考全部取得，共1,129,455,498压缩字节。另一个进程完整读取三份80×80×56×1326数组，共1,425,715,200数值，原Git-annex对象身份、gzip完整流与CRC、数值统计和源文件大小/mtime核对通过。新增两份原始均值/SD共12个固定中央切面已实际技术查看，完整MRI仍留服务器。

原结果：10月5日，原固定三人ses-01静息参考全部取得，共1,129,455,498压缩字节。另一个进程完整读取三份80×80×56×1326数组，共1,425,715,200数值，原Git-annex对象身份、gzip完整流与CRC、数值统计和源文件大小/mtime核对通过。新增两份原始均值/SD共12个固定中央切面已实际技术查看，完整MRI仍留服务器。

具体方法：原三份版本化静息输入完整取得，独立流式读取/CRC/对象身份/统计检查，新两份均值与SD固定中央切面实际查看；完整预处理及临床验证未完成。

限制：完成的是原三份静息输入的取得和原始数值核对，新增参与者0。三份最终功能预处理、结构到功能配准、ciftify、删帧、专家/QC纳入及临床验证均未完成；同人同ses标签不证明准确日期或疼痛同期。原超时与断点续传、rating和结构失败及软件版本适配保留。有限数值和少量切面不能证明解剖或临床质量。

下一步：第二、第三固定静息的头动作业及其畸变依赖已实际启动，沿原参数继续；完成后独立读回和技术查看，再接续原跨运行矩阵与必要结构流程。132候选输入继续，107人独立复核、103人原生图与19项专家注意分别保持；不由取得原始MRI升级为训练资格。

依据：deipp-rest-three-20261005、deipp-rest-three-20261005-summary

</details>

## 2026-10-05　偏头痛107人输入已核查，19项仍待专家确认

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：偏头痛107人输入已核查，19项仍待专家确认
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛107人输入已核查，19项仍待专家确认

原摘要：10月5日22:48输入截点，新增2人保存窗口、空间映射、组织均值和固定图技术查看，累计107人、214个288维向量、8132个保存窗口，窗口重组与组织均值误差0。321个小特征文件16901991字节已读回并实际载入；107人模型切面及103人原生图已查看，新增两人在本次显示尺度未记录新的突出注意，原19项专家注意保留。107份时间信息和个体FC协方差已复算，残差自由度2—272、中位数257，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0，真实临床终点与独立H-test仍缺。

原结果：10月5日22:48输入截点，新增2人保存窗口、空间映射、组织均值和固定图技术查看，累计107人、214个288维向量、8132个保存窗口，窗口重组与组织均值误差0。321个小特征文件16901991字节已读回并实际载入；107人模型切面及103人原生图已查看，新增两人在本次显示尺度未记录新的突出注意，原19项专家注意保留。107份时间信息和个体FC协方差已复算，残差自由度2—272、中位数257，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0，真实临床终点与独立H-test仍缺。

具体方法：新增2人实际窗口/空间/组织均值重算与全部固定技术图查看；107份原设计、ROI时序及逐人协方差实际计算。

限制：107数值/模型技术，103原生，19专家注意；专家/纳入/跨人参考/分类拟合0。

下一步：完成全132必要输入/质量/身份及原有限比较；补真实临床终点、成员映射与独立H-test。

依据：migraine-input-review107-20261005、migraine-input-review107-20261005-summary

</details>

## 2026-10-05　DEIPP：AFNI带通差异已按源码正则项复核

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：AFNI带通差异已按源码正则项复核
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：AFNI带通差异已按源码正则项复核

原摘要：10月5日，按AFNI26.2.09源码独立重建多项式、阻带正弦余弦、干扰去均值和删帧设计，加入源码规定的列归一化及1e-6正则项。三组既有合成输出再次独立读回，带通最大差6.970×10⁻⁵，不含带通两组最大差5.387×10⁻⁵，均满足原2×10⁻⁴界限。

原结果：10月5日，按AFNI26.2.09源码独立重建多项式、阻带正弦余弦、干扰去均值和删帧设计，加入源码规定的列归一化及1e-6正则项。三组既有合成输出再次独立读回，带通最大差6.970×10⁻⁵，不含带通两组最大差5.387×10⁻⁵，均满足原2×10⁻⁴界限。

具体方法：按同版本源码独立重建设计与列归一化正则SVD，复核三组既有保存输出；原失败保持，无新患者投影。

限制：此前未正则化SVD与带通的约3.497×10⁻⁴差异保留；纠正的是核对算法，没有重跑投影、改频率/删帧或放宽界限。源码正则化产生约3.363×10⁻⁴的理想投影偏移，说明理想投影与程序实现有区别。保存文本逆矩阵逐次float回放差约5.728×10⁻⁴仍未通过，不能声称逐位一致或全部精度差异均已解释。患者投影、完整ciftify、专家确认、QC纳入、分类拟合和独立临床验证仍0。

下一步：依赖合成数值核对已按实际源码完成；继续等待原结构配准产生真实文件，再核对后接续患者功能流程。132共同输入仍继续；105人独立复核、101人原生查看与19例专家注意分别保持，不据技术成功升级训练或临床完成。

依据：deipp-afni-numeric-20261005、deipp-afni-numeric-20261005-summary

</details>

## 2026-10-05　偏头痛105人输入已核查，19例仍待专家确认

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：偏头痛105人输入已核查，19例仍待专家确认
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛105人输入已核查，19例仍待专家确认

原摘要：10月5日21:56输入截点，新增14人保存窗口、空间映射、组织均值和固定图技术查看，累计105人、210个288维向量、7980个保存窗口，窗口重组与组织均值误差0。315个小特征文件16586605字节已读回并实际载入；105人模型切面及101人原生图已查看，新增4例专家注意，累计19例。105份时间信息和个体FC协方差已复算，残差自由度2—272、中位数257，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0，真实临床终点与独立H-test仍缺。

原结果：10月5日21:56输入截点，新增14人保存窗口、空间映射、组织均值和固定图技术查看，累计105人、210个288维向量、7980个保存窗口，窗口重组与组织均值误差0。315个小特征文件16586605字节已读回并实际载入；105人模型切面及101人原生图已查看，新增4例专家注意，累计19例。105份时间信息和个体FC协方差已复算，残差自由度2—272、中位数257，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0，真实临床终点与独立H-test仍缺。

具体方法：新增14人实际窗口/空间/组织均值重算与全部固定技术图查看；105份原设计、ROI时序及逐人协方差实际计算。

限制：105数值/模型技术，101原生，19专家注意；专家/纳入/跨人参考/分类拟合0。

下一步：完成全132必要输入/质量/身份及原有限比较；补真实临床终点、成员映射与独立H-test。

依据：migraine-input-review105-20261005、migraine-input-review105-20261005-summary

</details>

## 2026-10-05　DEIPP：AFNI投影工具已运行，带通数值差异待核查

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：AFNI投影工具已运行，带通数值差异待核查
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：AFNI投影工具已运行，带通数值差异待核查

原摘要：10月5日，在服务器原生文件系统的独立目录配置官方AFNI26.2.09投影工具和同发行共享库。三组合成投影均退出0，外部进程完整读回22,272个保存值，全部有限；KILL删6帧后保留114帧，ZERO保留120帧并将指定6帧置零，掩膜外和空间坐标检查通过。

原结果：10月5日，在服务器原生文件系统的独立目录配置官方AFNI26.2.09投影工具和同发行共享库。三组合成投影均退出0，外部进程完整读回22,272个保存值，全部有限；KILL删6帧后保留114帧，ZERO保留120帧并将指定6帧置零，掩膜外和空间坐标检查通过。

具体方法：独立官方AFNI二进制及同发行共享库，真实执行三组合成投影并外部SVD读回，保留权限失败与带通数值差异。

限制：合成去趋势及干扰回归与独立SVD的最大差约5.172×10⁻⁵，满足运行前2×10⁻⁴检查界限。带通输出与保存设计复算差约3.497×10⁻⁴，按官方源码频率索引重建差约3.519×10⁻⁴，均未满足同一界限，原因尚未确认。原权限失败和各数值失败保留，未改科学参数或放宽界限。没有执行患者投影，完整患者ciftify、专家确认、QC纳入、临床拟合及独立验证仍0。

下一步：依据同版本源码和实际浮点计算继续诊断带通差异，再接入原患者流程；同时继续原132人输入及结构配准任务。主程序数量、91人已独立复核及15例专家注意分别记录，不将依赖帮助或合成成功升级为完整作者流程。

依据：deipp-afni-project-20261005、deipp-afni-project-20261005-summary

</details>

## 2026-10-05　DEIPP：三条T2转换命令完成，强度缩放已核对

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：三条T2转换命令完成，强度缩放已核对
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：三条T2转换命令完成，强度缩放已核对

原摘要：10月5日，只读绑定官方FSL标准资源后，T1转换、方向重排和T2最近邻重采样三条实际命令均退出0。独立完整读回两份320³保存数组，共65,536,000个有限值；按FreeSurfer7.3.2源码复算uint8缩放、舍入与截断，固定27个位置差值均0，六个中央面板已技术查看。

原结果：10月5日，只读绑定官方FSL标准资源后，T1转换、方向重排和T2最近邻重采样三条实际命令均退出0。独立完整读回两份320³保存数组，共65,536,000个有限值；按FreeSurfer7.3.2源码复算uint8缩放、舍入与截断，固定27个位置差值均0，六个中央面板已技术查看。

具体方法：只读绑定官方FSL标准资源，逐条记录真实转换退出码，独立按FreeSurfer源码复算uint8缩放及固定27位置，保留原失败与临床边界。

限制：原浮点T2转成uint8后会改变强度，之前原值对照最大差67.00032043457031及失败输出仍保留。新差值0只核对源码规定的转换期望和27个固定位置；没有证明原强度保持、整幅数值逐值等价或T2解剖配准。完整患者ciftify、T2标准空间warp、专家确认、QC纳入、临床拟合及独立验证仍0。

下一步：等待原结构恢复产生T2配准文件并实际核查，再推进完整结构到功能流程；补齐仍缺的3dTproject依赖。继续原132候选队列，保留91人独立复核和15例专家注意，有限分类按原人员划分及完整输入质量身份条件执行。

依据：deipp-conversion-runtime-20261005、deipp-conversion-runtime-20261005-summary

</details>

## 2026-10-05　DEIPP：T2选择已恢复，真实转换检查失败

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：T2选择已恢复，真实转换检查失败
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：T2选择已恢复，真实转换检查失败

原摘要：10月5日，依据ciftify官方历史T2选择函数，在独立副本中恢复--T2参数与真实文件选择。转换后两份保存数组各320³，独立完整读回共65,536,000个有限数值；六个中央切面与保存数组差0，并已进行技术查看。

原结果：10月5日，依据ciftify官方历史T2选择函数，在独立副本中恢复--T2参数与真实文件选择。转换后两份保存数组各320³，独立完整读回共65,536,000个有限数值；六个中央切面与保存数组差0，并已进行技术查看。

具体方法：依据历史官方选择函数制作独立适配副本，实际转换后独立完整读回保存数组，保留FSL模板缺失和T2数值差异。

限制：转换检查仍失败：FSL报告缺少MNI标准模板；T2保存为uint8，27个固定位置与原始最近邻数值最大差67.00032043457031。数组有限和文件存在不能证明完整命令、强度保真或解剖配准通过。原失败环境和输出保留，完整患者ciftify、专家确认、QC纳入、临床拟合及独立验证均0。

下一步：补齐FSL所需标准资源并逐条记录实际命令退出码，查明T2类型转换和强度缩放后再继续；等待原结构处理产生真实T2配准文件，随后验证完整结构到功能流程。保留132候选队列、91人独立核查与15例专家注意，有限分类仍需完整队列和必要质量身份条件。

依据：deipp-t2-adaptation-20261005、deipp-t2-adaptation-20261005-summary

</details>

## 2026-10-05　DEIPP：ciftify影像读取已兼容，作者T2流程仍未匹配

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：ciftify影像读取已兼容，作者T2流程仍未匹配
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：ciftify影像读取已兼容，作者T2流程仍未匹配

原摘要：10月5日，在独立Python3.10环境中，ciftify2.3.3配合Nibabel3.2.2和NumPy1.23.5通过NIfTI、GIFTI小数组实际读取，差值均0。随包40个影像模板中，38个完整读取，共25,719,547个有限数值；另2个CIFTI-1文件的直接读取失败保留，Workbench信息读取成功。

原结果：10月5日，在独立Python3.10环境中，ciftify2.3.3配合Nibabel3.2.2和NumPy1.23.5通过NIfTI、GIFTI小数组实际读取，差值均0。随包40个影像模板中，38个完整读取，共25,719,547个有限数值；另2个CIFTI-1文件的直接读取失败保留，Workbench信息读取成功。

具体方法：在独立兼容环境实际执行ciftify影像读取、模板读取及作者参数解析，保留旧接口和T2分支差异。

限制：作者脚本要求的--T2参数在ciftify2.3.3中解析失败，其T2选择函数实际返回None；不能直接删除该参数后称作者流程通过。原Nibabel5导入失败、Nibabel4旧接口失败和本轮未匹配的T2分支均保留。小数组、模板和帮助检查只说明相应软件行为，尚未运行患者ciftify流程；专家确认、QC纳入、临床拟合和独立验证均0。

下一步：核查作者实际使用的ciftify分支及T2输出要求，解决命令与行为的对应后，再接续结构到功能处理；继续观察原结构恢复和同访视静息采集。保留132候选队列、91人独立核查和15例专家注意，有限分类仍需完整队列及必要质量身份条件。

依据：deipp-ciftify-compatibility-20261005、deipp-ciftify-compatibility-20261005-summary

</details>

## 2026-10-05　DEIPP：首份静息输出已复核，同访视跨运行矩阵已完成

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：首份静息输出已复核，同访视跨运行矩阵已完成
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：首份静息输出已复核，同访视跨运行矩阵已完成

原摘要：10月5日，首份静息头动与畸变校正保存输出已独立完整读取：两个80×80×56×1304数组，共934,707,200有限值；两份保存均值按float32精度重算差0，仿射差0，1304×6头动参数有限。同访视rating→rest及其逆矩阵按作者normcorr、6自由度指令完成，两侧乘积与单位矩阵最大差约4.08e-11。

原结果：10月5日，首份静息头动与畸变校正保存输出已独立完整读取：两个80×80×56×1304数组，共934,707,200有限值；两份保存均值按float32精度重算差0，仿射差0，1304×6头动参数有限。同访视rating→rest及其逆矩阵按作者normcorr、6自由度指令完成，两侧乘积与单位矩阵最大差约4.08e-11。

具体方法：独立完整读回两份静息4D保存数组，复算均值，实际查看原生图；按作者指令计算同访视正反矩阵并查看均值诊断图。

限制：这次完成的是首份静息功能前缀复核和跨运行矩阵计算。另保存一份变换后的rating均值用于私有技术查看，未重采样完整四维BOLD，也未完成到结构影像的配准、最终删帧或完整作者流程。实际查看两图15个展示面板，其中rest中央3切面重复显示、3面板为叠加图，合计9个不同保存数组的中央切面；不能加计更多输入或专家意见。原AFNI斜切警告、结构缺少非线性变换失败及独立恢复作业保留。专家确认、QC纳入、临床拟合和独立验证均0。

下一步：继续观察原结构依赖恢复和另两份同访视静息采集，按原作者顺序补齐必要的结构与功能对齐，再检查保存输出及专家质量。保留132候选队列、91人独立输入核查和15例专家注意；有限分类仍需完整队列与必要质量身份条件，扫描日期、临床真值和未开发验证尚未齐备。

依据：deipp-rest-alignment-20261005、deipp-rest-alignment-20261005-summary

</details>

## 2026-10-05　DEIPP：下一结构阶段缺少非线性变换，已保留失败并补齐依赖

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：下一结构阶段缺少非线性变换，已保留失败并补齐依赖
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：下一结构阶段缺少非线性变换，已保留失败并补齐依赖

原摘要：10月5日，首份脑提取后续结构命令退出1，分割阶段无法读取talairach.m3z。实际容器的FreeSurfer7.3.2脚本中，-autorecon2未启用生成该文件的非线性配准步骤；norm和线性变换文件存在，非线性变换缺失。独立新目录已显式加入-careg继续运行，原失败和脑提取输出保持。

原结果：10月5日，首份脑提取后续结构命令退出1，分割阶段无法读取talairach.m3z。实际容器的FreeSurfer7.3.2脚本中，-autorecon2未启用生成该文件的非线性配准步骤；norm和线性变换文件存在，非线性变换缺失。独立新目录已显式加入-careg继续运行，原失败和脑提取输出保持。

具体方法：检查实际终态日志、文件和容器指令，保留缺失非线性变换失败，独立目录追加-careg恢复。

限制：这次报告的是实际失败、依赖诊断与恢复启动，没有称恢复成功。作者使用7.2，当前为7.3.2；补齐指令属于版本适配，完整作者驱动、表面重建和完整处理尚未完成。许可已被成功使用，不再是本次错误原因。专家确认、QC纳入、临床拟合和独立验证均0；原脑提取5数组、163,840,000有限值及9切面技术查看结论保持。

下一步：观察原恢复作业和同访视静息畸变校正终态，再独立读取保存输出；恢复成功后仍需检查变换、组织和表面质量。保留132候选队列、91人独立输入核查和15例专家注意，继续按原有限分类方案及必要身份与质量条件推进。

依据：deipp-structural-dependency-20261005、deipp-structural-dependency-20261005-summary

</details>

## 2026-10-05　DEIPP：首份脑提取完成，掩膜编码差异已核对

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：首份脑提取完成，掩膜编码差异已核对
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：首份脑提取完成，掩膜编码差异已核对

原摘要：10月5日，首份结构影像脑提取的4条命令均正常退出。独立读取5份320×320×320数组，共163,840,000有限值；原0/1掩膜转换为0/255，原值比较最大差254，但3,984,272个保留体素的支持区域差0，保存的遮罩T1及两份脑掩膜复制结果逐点差0。9个原生中央技术切面已实际查看。

原结果：10月5日，首份结构影像脑提取的4条命令均正常退出。独立读取5份320×320×320数组，共163,840,000有限值；原0/1掩膜转换为0/255，原值比较最大差254，但3,984,272个保留体素的支持区域差0，保存的遮罩T1及两份脑掩膜复制结果逐点差0。9个原生中央技术切面已实际查看。

具体方法：独立读取五份脑提取相关数组，核对掩膜0/1到0/255编码与实际遮罩结果；9切面技术查看，旧断言失败保留。

限制：原逐值相等断言因此失败，失败原件保留；新复核按实际编码同时核对支持区域、255倍编码关系、空间坐标和遮罩结果，没有重做或改写科学输出。公开OASIS对象与作者实际模板字节身份仍未确认，软件版本适配保持。脑提取阶段完成不代表完整作者流程或专家质量通过；专家确认、QC纳入、临床拟合和独立验证均0。准确日期、身份访视临床真值和未开发验证仍待完成。

下一步：继续原同访视静息头动和畸变任务，完成后独立读回；按原作者顺序推进后续结构处理及跨运行对齐。保留132候选队列、91人独立输入核查和15例专家注意，满足必要身份与质量条件后执行原有限分类比较。

依据：deipp-brainmask-review-20261005、deipp-brainmask-review-20261005-summary

</details>

## 2026-10-05　DEIPP：首份静息参考已读回，OASIS输入已核查

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：首份静息参考已读回，OASIS输入已核查
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：首份静息参考已读回，OASIS输入已核查

原摘要：10月5日，原三人同访视静息参考沿原身份和ses-01选取，本轮首份完整取得355,989,294压缩字节，80×80×56×1326数组475,238,400数值全部有限，原Git-annex对象和完整gzip读取检查通过。公开OASIS三份输入已独立读回，48,273,408数值均有限，形状216×256×291和空间坐标一致；55,360,609字节原包与明确服务器版本全字节相等。首份静息6个原生切面和模板9个切面已实际技术查看。

原结果：10月5日，原三人同访视静息参考沿原身份和ses-01选取，本轮首份完整取得355,989,294压缩字节，80×80×56×1326数组475,238,400数值全部有限，原Git-annex对象和完整gzip读取检查通过。公开OASIS三份输入已独立读回，48,273,408数值均有限，形状216×256×291和空间坐标一致；55,360,609字节原包与明确服务器版本全字节相等。首份静息6个原生切面和模板9个切面已实际技术查看。

具体方法：原固定人/访视静息原始数组及公开OASIS三个输入独立读回；6+9切面实际技术查看，后续处理继续。

限制：这是部分作者流程的输入核查。第一份结构初始阶段已完成，后续脑提取和首份静息头动任务已启动；脑提取、功能对齐和完整作者工作流尚未完成。模板来自公开OASIS对象，尚未确认与DEIPP作者实际模板逐字节一致；FreeSurfer、AFNI等软件版本适配保持。数值有限和少量技术切面不能证明专家QC通过；专家确认、QC纳入、临床拟合和独立验证均0，准确日期与临床真值仍缺。完整MRI留在服务器，本机只接收小切面包。

下一步：继续观察原静息下载、脑提取和头动作业；各自完成后读回输出，再按作者步骤进行畸变校正和跨运行对齐。保留132候选原队列、91人独立核查和15例专家注意，必要质量、身份及临床条件满足后再进行原有限分类比较。

依据：deipp-rest-oasis-inputs-20261005、deipp-rest-oasis-inputs-20261005-summary

</details>

## 2026-10-05　DEIPP：一份结构影像初始阶段完成，四个输出已数值复核

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：一份结构影像初始阶段完成，四个输出已数值复核
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：一份结构影像初始阶段完成，四个输出已数值复核

原摘要：10月5日有效许可配置后，一份结构影像的FreeSurfer初始阶段正常结束，实际耗时1331.36秒（约22.19分钟）。随后独立读取四个320×320×320输出，共131,072,000个数值全部有限；空间坐标及线性变换矩阵有限，原文件未改变。完整MRI继续保留服务器，本机没有下载完整结构影像。

原结果：10月5日有效许可配置后，一份结构影像的FreeSurfer初始阶段正常结束，实际耗时1331.36秒（约22.19分钟）。随后独立读取四个320×320×320输出，共131,072,000个数值全部有限；空间坐标及线性变换矩阵有限，原文件未改变。完整MRI继续保留服务器，本机没有下载完整结构影像。

具体方法：原初始阶段指令适配执行，独立读取四个保存数组与线性变换；没有新增专家意见。

限制：当前仅一份初始阶段完成，完整结构流程仍0；专家确认、QC纳入、临床拟合和独立验证均0。实际FreeSurfer7.3.2与作者7.2的差异保留，不能称完整作者复现。此前缺许可失败记录保留；当前许可缺口已解除，许可内容不公开。同访视静息参考、作者模板对象对应、后续处理与最终删帧、准确日期及临床真值仍待核实。

下一步：继续确认作者模板对象和同访视静息参考，按原流程推进其余结构及功能处理；保留132候选原队列、91人已核查范围与15例专家注意，必要质量和身份条件满足后再进行原有限分类比较。

依据：deipp-licensed-first-stage-20261005、deipp-licensed-first-stage-20261005-summary

</details>

## 2026-10-05　偏头痛91人输入已核查，15例仍待专家确认

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：偏头痛91人输入已核查，15例仍待专家确认
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛91人输入已核查，15例仍待专家确认

原摘要：10月5日14:44截点，新增3人窗口、空间映射、组织均值和技术查看，累计91人、182个288维向量、6916个保存窗口，窗口重组与组织均值误差0。273个小特征文件已读回并实际载入；91人模型切面及87人原生图已查看，既有15例专家注意保留。91份时间信息和个体FC协方差也已核对，残差自由度2—272、中位数256，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0，临床真值及独立H-test仍缺。

原结果：10月5日14:44截点，新增3人窗口、空间映射、组织均值和技术查看，累计91人、182个288维向量、6916个保存窗口，窗口重组与组织均值误差0。273个小特征文件已读回并实际载入；91人模型切面及87人原生图已查看，既有15例专家注意保留。91份时间信息和个体FC协方差也已核对，残差自由度2—272、中位数256，协方差均正定；正定不恢复移除的信息。专家确认、训练纳入、跨人参考和分类拟合仍0，临床真值及独立H-test仍缺。

具体方法：新增3人实际窗口/空间/组织均值重算与全部固定技术图查看；91份原设计、ROI时序及逐人协方差实际计算。

限制：91数值/模型技术，87原生，15专家注意；专家/纳入/跨人参考/分类拟合0。

下一步：完成全132必要输入/质量/身份及原有限比较；补真实临床终点、成员映射与独立H-test。

依据：migraine-input-review91-20261005、migraine-input-review91-20261005-summary

</details>

## 2026-10-05　偏头痛88人时间信息与FC协方差已核对

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：偏头痛88人时间信息与FC协方差已核对
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛88人时间信息与FC协方差已核对

原摘要：10月5日补齐88人的时间信息和个体FC协方差核查：原设计残差自由度2—272，中位数256；前两个奇异方向的能量比例约28.40%—100%。88个既定90×90收缩协方差均正定，条件数139.55—3322.65，独立矩计算与双精度分解核对通过。矩阵正定不恢复去噪移除的信息，也不证明有效独立样本量或临床性能。原88人6688窗口、技术查看和15例专家注意保持；专家确认、训练纳入、跨人参考和分类拟合仍0。

原结果：10月5日补齐88人的时间信息和个体FC协方差核查：原设计残差自由度2—272，中位数256；前两个奇异方向的能量比例约28.40%—100%。88个既定90×90收缩协方差均正定，条件数139.55—3322.65，独立矩计算与双精度分解核对通过。矩阵正定不恢复去噪移除的信息，也不证明有效独立样本量或临床性能。原88人6688窗口、技术查看和15例专家注意保持；专家确认、训练纳入、跨人参考和分类拟合仍0。

具体方法：重新读取88份原去噪设计并复算秩；对88份原时序计算描述性SVD及既定逐人协方差，独立矩和分解核对。

限制：残差自由度与正定性不是有效独立样本量或临床性能；专家/纳入/跨人参考/分类拟合0。

下一步：继续全132必要输入/身份/质量与原有限比较，分别补真实临床终点、成员和独立H-test。

依据：migraine-input-information-20261005、migraine-input-information-20261005-summary

</details>

## 2026-10-05　DEIPP：三份头动与畸变校正输出已独立读回

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：三份头动与畸变校正输出读回
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：三份头动与畸变校正输出已独立读回

原摘要：10月5日独立复核原第二、第三份保存输出，头动和畸变校正共4个数组、1,869,414,400个数值全部有限；各保留1304帧，保存均值按float32精度重算后差值0，坐标矩阵差0，运动参数均有限。新增12个原生中间切面已实际查看。连同此前首份，原选定3份运行的两个处理阶段均已数值读回；每阶段累计1,402,060,800个有限值。完整MRI仍留在服务器。

原结果：10月5日独立复核原第二、第三份保存输出，头动和畸变校正共4个数组、1,869,414,400个数值全部有限；各保留1304帧，保存均值按float32精度重算后差值0，坐标矩阵差0，运动参数均有限。新增12个原生中间切面已实际查看。连同此前首份，原选定3份运行的两个处理阶段均已数值读回；每阶段累计1,402,060,800个有限值。完整MRI仍留在服务器。

具体方法：独立分块读取保存的四份数组并复算均值，实际查看12个原生中间切面；保留三份原倾斜角警告。

限制：这是部分功能预处理输出检查。三份原AFNI倾斜角警告约19.86°—27.63°均保留，数值有限和技术查看不能证明配准质量。FreeSurfer许可仍缺，结构处理完成0；同访视静息参考、作者模板对象对应、最终删帧、准确日期和完整作者流程仍待完成。专家确认、QC纳入、临床拟合和独立验证均0；未增加患者、运行或训练。

下一步：取得有效FreeSurfer许可后接续结构处理；继续核对同访视静息参考、模板对象对应与其余作者依赖，再完成对齐和实际删帧。132候选与既定K5四方法540拟合方案继续，专家和临床终点缺口保留。

依据：deipp-three-prefix-review-20261005、deipp-three-prefix-review-20261005-summary

</details>

## 2026-10-05　偏头痛88人技术图已查看，15例待专家核对

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：偏头痛88人技术图已查看，15例待专家核对
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛88人技术图已查看，15例待专家核对

原摘要：10月5日完成新增30人的技术查看：30幅完整合成图覆盖120幅原图，累计88人的264个模型切面、84人的1008个原生位置及504个源/滤波切面已查看。新增9例专家注意，累计15例，涉及组织轮廓、局部低信号或边界差异；技术观察不代替专家质控。此前88人6688个保存窗口和300时间点组织均值重算误差0，264文件已实际载入本机。专家确认、训练纳入和分类拟合仍0，临床真值和H-test仍缺。

原结果：10月5日完成新增30人的技术查看：30幅完整合成图覆盖120幅原图，累计88人的264个模型切面、84人的1008个原生位置及504个源/滤波切面已查看。新增9例专家注意，累计15例，涉及组织轮廓、局部低信号或边界差异；技术观察不代替专家质控。此前88人6688个保存窗口和300时间点组织均值重算误差0，264文件已实际载入本机。专家确认、训练纳入和分类拟合仍0，临床真值和H-test仍缺。

具体方法：新增30人的全部固定内容置于30幅无裁剪/重采样合成图，实际查看并逐项记录；原58人观察与原日期保留。

限制：描述性技术查看，累计15例待专家核对；专家确认/训练纳入/分类拟合0。原47残差/48协方差诊断范围保持。

下一步：继续全132人共同输入及必要质量核查，再按原四方法有限方案执行；补真实临床终点、成员对应和独立H-test。

依据：migraine-input-view-20261005、migraine-input-view-20261005-summary

</details>

## 2026-10-05　偏头痛88人窗口与组织均值已核对，技术查看继续

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：偏头痛88人窗口与组织均值已核对，技术查看继续
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛88人窗口与组织均值已核对，技术查看继续

原摘要：10月5日13:41截点，按原候选顺序新增30人独立数值复核，累计88人、176个288维向量和6688个保存窗口，重组误差0。88人的WM/CSF掩膜与300时间点均值已复算，均值误差0。264个小特征文件已完整读回并在本机载入。技术查看仍为此前58人，新增技术图待查看；六例质量注意记录保留。专家确认、训练纳入与分类拟合均0，临床真值和H-test仍缺。

原结果：10月5日13:41截点，按原候选顺序新增30人独立数值复核，累计88人、176个288维向量和6688个保存窗口，重组误差0。88人的WM/CSF掩膜与300时间点均值已复算，均值误差0。264个小特征文件已完整读回并在本机载入。技术查看仍为此前58人，新增技术图待查看；六例质量注意记录保留。专家确认、训练纳入与分类拟合均0，临床真值和H-test仍缺。

具体方法：保留此前58项人员记录；新增30人窗口/空间/量化与300时间点组织均值重算，88人小特征完整读回并实际载入。

限制：新增图尚未实际查看；技术查看仍58人，专家确认和训练纳入0。数值一致不证明配准或临床有效。

下一步：完成新增技术查看及全132必要质量核查，再按原K5四方法540拟合/45参考执行；补齐临床真值和独立H-test。

依据：migraine-input-numeric-20261005、migraine-input-numeric-20261005-summary

</details>

## 2026-10-04　实际预训练参数已复核，训练人员仍未知

- 模型：公开体积预训练模型
- 数据：候选偏头痛数据及公开权重
- 工作：核对实际参数与权重来源，训练人员来源仍未确认。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：预训练来源核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：实际预训练参数已复核，训练人员仍未知

原摘要：实际checkpoint保存MAE预训练、五来源、seed1234及训练/验证比例0.8/0.1，154项参数与此前检查一致。运行名含topk100，但未保存topk；当前源码默认10000，实际采样预算和人员不能由名称重建。尚需原训练源码、实际划分和逐轮训练/验证名单；个人重叠未知，H-test仍未建立。

原结果：实际checkpoint保存MAE预训练、五来源、seed1234及训练/验证比例0.8/0.1，154项参数与此前检查一致。运行名含topk100，但未保存topk；当前源码默认10000，实际采样预算和人员不能由名称重建。尚需原训练源码、实际划分和逐轮训练/验证名单；个人重叠未知，H-test仍未建立。

具体方法：静态读取实际checkpoint ZIP元数据，不反序列化；154参数与旧检查一致，12标量与原pickle字面量直接核对。

限制：配置不证明实际人员；topk未保存，不能据运行名或当前源码默认值宣称原实际采样预算。

下一步：取得原训练版本、真实划分与逐轮训练/验证人员，继续全132共同输入、原有限比较与独立临床验证。

依据：neurostorm-checkpoint-provenance-20261004、neurostorm-checkpoint-provenance-20261004-summary

</details>

## 2026-10-04　偏头痛临床终点已对照注册记录，逐人数据仍缺

- 模型：尚未训练疗效模型
- 数据：成人偏头痛／ds005016
- 工作：将可得临床终点与试验注册记录对应，核实标签是否可取得。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：临床标签与终点定义

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛临床终点已对照注册记录，逐人数据仍缺

原摘要：原试验NCT02133209已完整读回。注册随访3/6/12个月与发表10/20/52周保留各自口径；HIT-6在注册为主要、发表为次要，作者已说明调整。入组确诊与既往诊疗史分开；28天日记平均痛不能充当扫描时疼痛。逐人日期、日记、治疗结局及实际成员对应仍缺，H-test尚未建立。

原结果：原试验NCT02133209已完整读回。注册随访3/6/12个月与发表10/20/52周保留各自口径；HIT-6在注册为主要、发表为次要，作者已说明调整。入组确诊与既往诊疗史分开；28天日记平均痛不能充当扫描时疼痛。逐人日期、日记、治疗结局及实际成员对应仍缺，H-test尚未建立。

具体方法：完整读取官方注册API原文，并核对原试验XML及同试验后续论文的官方全文。

限制：未取得逐人临床真值；未将月份换算为周数或访视编号，未建立H-test。

下一步：取得去标识人员/访视对应、真实日记和扫描时评分，再按原方案做临床增量比较。

依据：migraine-clinical-registry-20261004、migraine-clinical-registry-20261004-summary

</details>

## 2026-10-04　132人候选文件与访视对应已核对，临床时间仍缺

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：132人候选文件与访视对应已核对，临床时间仍缺
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：132人候选文件与访视对应已核对，临床时间仍缺

原摘要：原132人候选的manifest、参与者表、性别、标签、设备与首编号访视路径逐项一致，264份原始影像头与库存一致；该范围共有322组T1/rest访视配对，仍是132人。准确扫描日期、年龄、同期疼痛、治疗结局与实际预训练人员对应尚未取得；未新增专家确认、训练纳入或分类拟合。

原结果：原132人候选的manifest、参与者表、性别、标签、设备与首编号访视路径逐项一致，264份原始影像头与库存一致；该范围共有322组T1/rest访视配对，仍是132人。准确扫描日期、年龄、同期疼痛、治疗结局与实际预训练人员对应尚未取得；未新增专家确认、训练纳入或分类拟合。

具体方法：3729份元数据与原Git blob一致；132行manifest、264影像头及322组访视文件对应。

限制：首编号访视不证明临床基线；不以干预组补造治疗结局。独立输入复核原51人，专家确认、训练纳入及真实候选分类0。

下一步：完成全132共同输入与原必要复核，按原四方法有限对照，并补真实临床时间、终点和独立性证据。

依据：migraine-identity-visits-20261004、migraine-identity-visits-20261004-summary

</details>

## 2026-10-04　DEIPP：3份BOLD读完；首样本头动与畸变校正已读回

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：3份BOLD读完；首样本头动与畸变校正已读回
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP：3份BOLD读完；首样本头动与畸变校正已读回

原摘要：截至23:00，原选定3份BOLD均已完整读完，共1,131,927,149压缩字节、1,425,715,200个数值，全部有限；原Git-annex身份、压缩流CRC与27个独立抽样点均通过，抽样误差0。3张原始均值/标准差面板共18个中间切面已技术查看，完整MRI本机复制0。首样本去掉22帧后保留1304帧，头动校正完成，467,353,600个数值及1304×6个运动参数均有限；独立均值按保存精度舍入后误差0、坐标矩阵差0，3个头动均值切面已查看。首样本畸变校正也已完成，校正后1304帧、467,353,600个数值均有限；另两份沿原顺序接续处理。

原结果：截至23:00，原选定3份BOLD均已完整读完，共1,131,927,149压缩字节、1,425,715,200个数值，全部有限；原Git-annex身份、压缩流CRC与27个独立抽样点均通过，抽样误差0。3张原始均值/标准差面板共18个中间切面已技术查看，完整MRI本机复制0。首样本去掉22帧后保留1304帧，头动校正完成，467,353,600个数值及1304×6个运动参数均有限；独立均值按保存精度舍入后误差0、坐标矩阵差0，3个头动均值切面已查看。首样本畸变校正也已完成，校正后1304帧、467,353,600个数值均有限；另两份沿原顺序接续处理。

具体方法：同原3人固定顺序和具体版本，完整读取与独立数值核查；首样本原删帧保留段逐值复算，头动全数组和保存均值另用Nibabel复算。原作者指令在现有容器逐项执行场图与畸变处理；软件版本和未完成步骤单独报告。

限制：完成的是原3人各一份运行的读取，以及首样本的部分功能处理。原MATLAB驱动和完整作者流程未执行；实际软件版本与作者说明存在差异。首样本约19.86度倾斜角警告保留，数值有限和技术查看均不证明配准质量。FreeSurfer许可仍缺，结构处理完成0；所选评分运行后续还需要同访视静息参考、结构配准、作者模板及其余依赖、最终删帧和准确扫描日期。专家确认、QC纳入、临床拟合及独立验证均0，重复访视不能充当独立患者。原首份BOLD、20:54两份BOLD、27对象与5/9/12份配套输入均保留原时点。

下一步：继续原第二、第三份的头动与畸变校正并读回，补同访视静息参考、有效FreeSurfer许可及作者其余依赖。原132候选与必要复核继续；完成后按既定K5四方法方案在本机处理小特征。

依据：unseen-clinical-sources-20261004、unseen-clinical-sources-20261004-summary

</details>

## 2026-10-04　强FC固定目标标准化：两方向未形成稳定改善

- 模型：切空间FC＋Logistic来源借用
- 数据：SRPBS79与Emo53，双向迁移
- 工作：只用目标支持者估计标准化，检查来源借用是否改善。
- 性能变化：两个方向均未形成稳定整体改善；本条未给出可直接汇总的单一ΔAUC。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：迁移特征标准化

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：强FC固定目标标准化：两方向未形成稳定改善

原摘要：10月4日固定目标训练均值与尺度后，K5目标参考自适应AUC为SRPBS79 0.7088、Emo53 0.5456；相对原策略差值-0.0172、-0.0225，两项配对95%区间均包含0。实际4320新拟合、2196原头复用，全部6516保存头独立复算。已有队列事后开发分析，候选分类与新增独立临床验证仍0。

原结果：10月4日固定目标训练均值与尺度后，K5目标参考自适应AUC为SRPBS79 0.7088、Emo53 0.5456；相对原策略差值-0.0172、-0.0225，两项配对95%区间均包含0。实际4320新拟合、2196原头复用，全部6516保存头独立复算。已有队列事后开发分析，候选分类与新增独立临床验证仍0。

具体方法：480最终和3840内层新拟合；2196原头复用；6516保存头、366参考及选择独立复算，全部68条件共享配对重采样。

限制：已开发79/53队列的事后敏感性；两主要差值均跨0，不主张稳定改善、显著恶化或等效。μ/s固定不禁止训练内λ/α改变。候选分类和临床验证0。

下一步：完整132输入及原必要核查后沿原K5四方法540拟合/45参考；独立临床诊断、同期程度和治疗反应仍须各自真实证据。

依据：fc-target-scaling-20261004、fc-target-scaling-20261004-plan、fc-target-scaling-20261004-summary、fc-target-scaling-20261004-differences、fc-target-scaling-20261004-figure

</details>

## 2026-10-04　强FC目标复查：6516保存头的加权损失与正则实现一致

- 模型：切空间FC＋Logistic
- 数据：SRPBS79与Emo53
- 工作：复核保存分类头的加权损失、正则项与代码实现。
- 性能变化：复核既有训练结果，未新增可比AUC。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：训练目标与实现核查

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：强FC目标复查：6516保存头的加权损失与正则实现一致

原摘要：10月4日重算6516个保存头的加权损失、L2正则和梯度，全部保存概率复算误差0。最终FC头的最大优化目标差上界估计4.24×10⁻⁶；它约束训练目标，不能换算为AUC或临床增量。原主要结果与选择保持，没有新拟合。

原结果：10月4日重算6516个保存头的加权损失、L2正则和梯度，全部保存概率复算误差0。最终FC头的最大优化目标差上界估计4.24×10⁻⁶；它约束训练目标，不能换算为AUC或临床增量。原主要结果与选择保持，没有新拟合。

具体方法：重读724最终和5792内层模型，复算训练内权重/标准化/损失/正则/梯度及全部保存概率；8次方向差分。

限制：事后数值复查；浮点梯度的目标差上界估计，不涵盖输入质量或抽样不确定性。没有新拟合、QC或临床验证。

下一步：继续全132候选和原K5四方法对照；独立临床三终点仍需真实参照、时间、身份与测试数据。

依据：fc-objective-review-20261004、fc-objective-review-20261004-summary、fc-objective-review-20261004-conditions

</details>

## 2026-10-04　47名偏头痛候选：300帧下的残差信息差异

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：300帧下的残差信息差异
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：47名偏头痛候选：300帧下的残差信息差异

原摘要：10月4日复算47人的原去噪设计：均保留300帧，残差自由度2—272，中位数259；信息最少的输入，其FC前两个奇异方向约占100%信号能量。数值完成不能等同训练纳入，真实候选分类仍0。

原结果：10月4日复算47人的原去噪设计：均保留300帧，残差自由度2—272，中位数259；信息最少的输入，其FC前两个奇异方向约占100%信号能量。数值完成不能等同训练纳入，真实候选分类仍0。

具体方法：实际读取47份原去噪设计，重算矩阵秩；实际300×90时序描述性SVD，未替换输入或选人。

限制：固定47人复核范围；残差自由度不是有效独立样本数，没有新排除阈值、分类拟合或临床验证。

下一步：继续全132候选及原质量核查；先处理运动干扰与配准/覆盖问题，再开展共同人员的K5四方法有限比较。

依据：migraine-temporal-audit-20261004、migraine-temporal-audit-20261004-summary

</details>

## 2026-10-04　2026慢性疼痛结构研究：来源重叠与补充表复核

- 模型：未训练新模型
- 数据：慢性疼痛结构影像研究资料
- 工作：核对文献的来源重叠与补充表。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：文献证据与来源核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：2026慢性疼痛结构研究：来源重叠与补充表复核

原摘要：10月4日复核2026结构研究：八个队列中五个对应既有或当前开发来源；英国腰痛340行效应方向与补充字典不一致，未据此重算总元分析。原表49个显著高斯曲率项中33个研究间效应预测区间包含0。没有新患者分类或临床验证。

原结果：10月4日复核2026结构研究：八个队列中五个对应既有或当前开发来源；英国腰痛340行效应方向与补充字典不一致，未据此重算总元分析。原表49个显著高斯曲率项中33个研究间效应预测区间包含0。没有新患者分类或临床验证。

具体方法：实际读取正式XML、16表9928记录及作者版本代码；2720行效应算术和340项FDR复算。

限制：公开组统计核查；未取得底层人员矩阵或重跑完整元分析，不改原表，不作新分类/临床成绩。

下一步：继续132候选处理和有限比较；独立三临床终点仍需真实参照、时间与H-test。

依据：chronic-pain-ipd-20261004、chronic-pain-ipd-20261004-summary、chronic-pain-ipd-20261004-directions

</details>

## 2026-10-04　强FC参考复查：参考变化伴随来源权重与正则选择变化

- 模型：切空间FC＋Logistic来源借用
- 数据：SRPBS79与Emo53
- 工作：复查几何参考、来源权重和正则选择的共同变化。
- 性能变化：既有分数不能归因于单一参考变化；未形成新的单因素AUC提升。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：几何参考与迁移策略

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：强FC参考复查：参考变化伴随来源权重与正则选择变化

原摘要：10月4日保存选参复查：改用联合参考后，SRPBS有10/15个相关折—抽样单元改变α或λ，Emo有9/15个改变；协变量2,640个配对概率值完全相同。参考对照反映整个流程，不能把AUC差全部归因于参考几何；原主要指标与区间保持，没有新拟合或临床验证。

原结果：10月4日保存选参复查：改用联合参考后，SRPBS有10/15个相关折—抽样单元改变α或λ，Emo有9/15个改变；协变量2,640个配对概率值完全相同。参考对照反映整个流程，不能把AUC差全部归因于参考几何；原主要指标与区间保持，没有新拟合或临床验证。

具体方法：30份K5选参重放原12位舍入和平分顺序，60项FC联合选择重现原边际次数；协变量保存概率逐项核对。

限制：事后描述；三固定折和五次重叠支持抽样相关。没有新拟合、QC纳入、专家确认或临床验证。

下一步：继续全132候选输入与原有限对照；独立临床三终点仍需真实参照、时间与测试数据。

依据：fc-reference-selection-20261004、fc-reference-selection-20261004-summary、fc-reference-selection-20261004-figure

</details>

## 2026-10-04　临床MRI论文复查：治疗变化、刺激对照与跨人预测分开

- 模型：未训练新模型
- 数据：临床疼痛MRI文献
- 工作：区分治疗变化、刺激对照和跨人预测的研究终点。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：研究任务与评价口径

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：临床MRI论文复查：治疗变化、刺激对照与跨人预测分开

原摘要：10月4日临床MRI论文复查：治疗前后影像变化相关不等于治疗前预测，同一患者的刺激对照不等于健康对照。新读到35名患者的公开评分表和对应编号，未取得完整MRI或形成临床验证；现有全132候选处理与四方法有限方案继续。

原结果：10月4日临床MRI论文复查：治疗前后影像变化相关不等于治疗前预测，同一患者的刺激对照不等于健康对照。新读到35名患者的公开评分表和对应编号，未取得完整MRI或形成临床验证；现有全132候选处理与四方法有限方案继续。

具体方法：原始论文及作者稿全文、临床表2与实验时间图核对；实际读取35项编号对应表，空行不计人员。

限制：没有新模型拟合、完整MRI、专家QC确认、训练纳入或独立临床验证；既有停止与标签/划分保持。

下一步：继续全132候选输入与原定有限对照；补齐独立临床MRI、真实终点和准确时间对应。

依据：clinical-literature-comparison-20261004

</details>

## 2026-10-04　DEIPP连续评分：首份完整影像已读完，其余样本待完成

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：首份完整影像已读完，其余样本待完成
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP连续评分：首份完整影像已读完，其余样本待完成

原摘要：DEIPP已实读3人资料、4份问卷及3份连续VAS样本；66行当天问卷中63个访视键与MRI文件库存对应。三份连续记录共101,415个观测，影像头均为80×80×56×1326、TR0.46秒。10月4日按作者代码和真实样本重组时间轴：去掉22个扫描帧，再去掉66个初始帧，按13帧（5.98秒）对齐脑信号与评分；每份在实际头动删帧前有1,225个对齐点，独立插值复算误差0。13个已读S3对象已按具体版本重新读取，10个完整小文件与固定Git内容一致，该版本核查阶段三份影像只核查压缩头；与前次读取字节无变化。首份完整原始影像已在服务器取得并读完1326帧（356,390,271字节），内容与原有Git-annex对象一致，六个原始均值/波动切面已看；预定另外两份仍待完成。实际删帧记录、作者影像处理、专家QC和准确扫描日期仍缺，临床配对、拟合与独立验证均未完成。腰痛库仍缺对照及可读评分表。

原结果：DEIPP已实读3人资料、4份问卷及3份连续VAS样本；66行当天问卷中63个访视键与MRI文件库存对应。三份连续记录共101,415个观测，影像头均为80×80×56×1326、TR0.46秒。10月4日按作者代码和真实样本重组时间轴：去掉22个扫描帧，再去掉66个初始帧，按13帧（5.98秒）对齐脑信号与评分；每份在实际头动删帧前有1,225个对齐点，独立插值复算误差0。13个已读S3对象已按具体版本重新读取，10个完整小文件与固定Git内容一致，该版本核查阶段三份影像只核查压缩头；与前次读取字节无变化。首份完整原始影像已在服务器取得并读完1326帧（356,390,271字节），内容与原有Git-annex对象一致，六个原始均值/波动切面已看；预定另外两份仍待完成。实际删帧记录、作者影像处理、专家QC和准确扫描日期仍缺，临床配对、拟合与独立验证均未完成。腰痛库仍缺对照及可读评分表。

具体方法：三个真实响应样本、各65,536字节影像头和三份BOLD字典，与固定版本作者去dummy、评分和脑信号索引代码核对；实际重组3×1,225个删帧前评分点，第二种线性插值算法误差0。未取得完整MRI、作者保存元数据或真实删帧向量。 13个已读S3对象已按具体版本重新读取，10个完整小文件与固定Git内容一致，三份影像只核查压缩头；与前次读取字节无变化。 首份完整原始BOLD在服务器读完1326帧/475,238,400个有限值，原对象内容与gzip核对通过，独立九点读回差异0，六个技术切面已看；另两份待完成。

限制：DEIPP是3名女性患者的密集重复扫描，论文主要分析2人；访视和采样点不是独立患者。它可继续核对个人疼痛变化输入，不能补足跨人诊断或预定治疗反应验证。腰痛库25个人员目录不等于已取得25人输入。Emo仍是开发队列，原停止决定和全部正负结果保留。

下一步：继续完成预定三个DEIPP首run完整原始影像的取得和数值读取，再取得作者处理元数据、实际头动删帧和准确扫描日期，补专家QC及真实临床配对。已完成的一份不代表全部63次访视，三人重复记录不构成跨人H-test。原132候选处理及诊断、同期程度、治疗反应的独立验证继续。

依据：unseen-clinical-sources-20261004、unseen-clinical-sources-20261004-summary、migraine-readiness-20261002-clinical

</details>

## 2026-10-04　48人FC协方差数值复核；分类训练待完成输入

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：48人FC协方差数值复核；分类训练待完成输入
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：48人FC协方差数值复核；分类训练待完成输入

原摘要：原48人300×90时序按既定LedoitWolf逐人计算，48个90×90协方差均正定、对数特征值均有限；独立矩估计相对最大差6.9092e-7，双精度分解相对最大差4.8720e-16。条件数248.21—3322.65；跨人切空间参考和分类拟合均0。 同一3人首run的作者配套输入另读27个明确版本对象：12个压缩影像头、15份完整JSON；15份均与固定Git一致。3对AP/PA场图均指向选定BOLD且方向相反，读出时间均0.0387103秒。作者解剖代码用ses-01 T1与ses-02 T2；完整配套MRI新增0，准确扫描日期仍缺。

原结果：原48人300×90时序按既定LedoitWolf逐人计算，48个90×90协方差均正定、对数特征值均有限；独立矩估计相对最大差6.9092e-7，双精度分解相对最大差4.8720e-16。条件数248.21—3322.65；跨人切空间参考和分类拟合均0。

具体方法：48份原时序逐人协方差、独立矩公式和双精度分解；临床27对象明确版本与15完整固定Git正文复核。

限制：收缩估计可使矩阵正定，但不能恢复去噪移除的信息。并发47人时序信息核查保留原范围；没有新增排除阈值、改变输入或训练纳入。全132共同输入及原质量复核仍须完成，三例边界差异待专家确认。 头信息和IntendedFor不能证明全影像内容、解剖配准或临床时间对应；作者处理、真实删帧、专家QC及临床拟合仍未完成。原13对象、首份完整BOLD和时间轴记录各保留原日期与范围。

下一步：继续全132候选和原质量核查；个体协方差可计算后，跨人切空间参考仍只在训练折估计。按原K5四方法有限方案执行，临床三端点继续分别补真实处理、日期、身份与未参与开发的验证资料。

依据：migraine-covariance-numeric-20261004、migraine-covariance-numeric-20261004-summary、unseen-clinical-sources-20261004

</details>

## 2026-10-04　DEIPP配套影像：12/12份已独立读回并技术查看

- 模型：DEIPP作者影像处理流程
- 数据：DEIPP已选3名成员的多访视配套影像
- 工作：12/12份读回并技术查看
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与连续疼痛标签对齐

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：DEIPP配套影像：12/12份已独立读回并技术查看

原摘要：截至19:39，原选定3人所需12份配套影像已全部在服务器取得并独立读完（3份T1、3份T2、6份场图），共122,012,143压缩字节、141,926,400个数值，均有限，计数与原压缩流读取一致。前9份于19:24独立读取，余3份于19:39补完。3张私有技术面板、36个原始中间切面已实际查看；场图只查看第一体积。本机完整MRI复制0。

原结果：截至19:39，原选定3人所需12份配套影像已全部在服务器取得并独立读完（3份T1、3份T2、6份场图），共122,012,143压缩字节、141,926,400个数值，均有限，计数与原压缩流读取一致。前9份于19:24独立读取，余3份于19:39补完。3张私有技术面板、36个原始中间切面已实际查看；场图只查看第一体积。本机完整MRI复制0。

具体方法：同12个版本对象原顺序取得；独立Nibabel完整数组读取与原流式数值计数比较，读取实际头内坐标并技术查看原始中间切面。

限制：配套输入的完整取得与数值读取已完成。结构像约0.7mm、场图约2.7mm，轴方向分别为RAS和LAS，仍须真实配准和处理。原始中间切面为非专家技术查看；作者预处理、专家确认、QC纳入、临床分类拟合及独立验证均0，准确扫描日期、真实删帧和临床配对仍缺。12份影像来自同3人；18:35的5份和19:24的9份证据均保留原时点。

下一步：准备作者所需工具、模板和完整处理环境；继续原BOLD作业，之后执行真实配准和质量核查。

依据：unseen-clinical-sources-20261004、unseen-clinical-sources-20261004-summary

</details>

## 2026-10-03　强FC逐折复查：提升与负迁移的方向保持，局部差异仍在

- 模型：切空间FC＋Logistic来源借用
- 数据：SRPBS79与Emo53
- 工作：逐折复算已有来源迁移结果。
- 性能变化：原有改善与负迁移方向保持；复核本身不构成新的AUC提升。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：结果与迁移参照复核

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：强FC逐折复查：提升与负迁移的方向保持，局部差异仍在

原摘要：10月3日保存预测逐折复查：SRPBS相对目标单独的折内加权ΔAUC为+0.0911，13/15个相关折—抽样单元提高、2个持平；Emo相对来源单独为−0.1342，12/15个单元下降。四项主要比较全部保留；此次没有新拟合或独立临床验证。

原结果：10月3日保存预测逐折复查：SRPBS相对目标单独的折内加权ΔAUC为+0.0911，13/15个相关折—抽样单元提高、2个持平；Emo相对来源单独为−0.1342，12/15个单元下降。四项主要比较全部保留；此次没有新拟合或独立临床验证。

具体方法：保存概率与按人外层划分作病例—对照排序分解；用scikit-learn独立核对全部原AUC/Brier和折内加权。

限制：事后描述性分析；15单元相关，不作独立二项或显著性检验。原主要指标、区间、QC/划分及停止决定不变。

下一步：继续全偏头痛候选输入和原定有限对照；独立临床三终点仍需真实配对文件。

依据：fc-fold-robustness-20261003、fc-fold-robustness-20261003-summary、fc-fold-robustness-20261003-figure、fc-fold-robustness-20261003-pdf

</details>

## 2026-10-03　独立临床来源补查：六个记录的访问与适用范围

- 模型：尚未训练新模型
- 数据：6项候选临床来源
- 工作：核对访问条件、标签与是否能用于独立验证。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：外部数据与验证准备

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：独立临床来源补查：六个记录的访问与适用范围

原摘要：10月3日实际补查六个临床来源记录：两条Zenodo文件受限，Dryad脑影像标记记录只列补充DOCX且正文未取得，OpenPain需使用协议/注册；健康热痛与未列MRI的临床试验不能代替当前临床影像任务。新增逐人MRI、临床真值与独立验证均0。

原结果：10月3日实际补查六个临床来源记录：两条Zenodo文件受限，Dryad脑影像标记记录只列补充DOCX且正文未取得，OpenPain需使用协议/注册；健康热痛与未列MRI的临床试验不能代替当前临床影像任务。新增逐人MRI、临床真值与独立验证均0。

具体方法：读取官方元数据、完整文件清单、使用协议和作者README；保留实际下载失败。

限制：没有新增逐人输入、纳入、拟合或独立临床验证；旧开发数据不改名为未见数据，TN14和其他停止/暂停范围保持。

下一步：优先接入已有访问权限的逐人临床—MRI配对文件，核对诊断、量表及评分/MRI/随访时间、身份与使用依据；继续原候选输入和有限对照。

依据：unseen-clinical-sources-20261003、unseen-clinical-sources-20261003-summary

</details>

## 2026-10-03　偏头痛候选：58人输入已复核，影像质控待确认

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：58人输入已复核，影像质控待确认
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛候选：58人输入已复核，影像质控待确认

原摘要：同设备候选库存132人（111病例/21对照）。截至10月4日22:28，服务器完成58人完整输入及冻结/随机288维提取（116个向量、4408次前向）。58人窗口、空间、量化及WM/CSF已独立复核，4408个窗口重组和组织均值误差0；174个模型技术切面已查看。174个小特征文件共9,162,142字节已读回并在本机载入；累计六例边界或组织轮廓差异待专家核对。头动程序完成59人，空间及完整表示58人，各层范围分别记录。专家确认、训练纳入和真实候选分类拟合仍0；旧失败和此前各阶段证据保留。

原结果：同设备候选库存132人（111病例/21对照）。截至10月4日22:28，服务器完成58人完整输入及冻结/随机288维提取（116个向量、4408次前向）。58人窗口、空间、量化及WM/CSF已独立复核，4408个窗口重组和组织均值误差0；174个模型技术切面已查看。174个小特征文件共9,162,142字节已读回并在本机载入；累计六例边界或组织轮廓差异待专家核对。头动程序完成59人，空间及完整表示58人，各层范围分别记录。专家确认、训练纳入和真实候选分类拟合仍0；旧失败和此前各阶段证据保留。

具体方法：同设备候选库存132人（111病例/21对照）。截至10月4日22:28，服务器完成58人完整输入及冻结/随机288维提取（116个向量、4408次前向）。58人窗口、空间、量化及WM/CSF已独立复核，4408个窗口重组和组织均值误差0；174个模型技术切面已查看。174个小特征文件共9,162,142字节已读回并在本机载入；累计六例边界或组织轮廓差异待专家核对。头动程序完成59人，空间及完整表示58人，各层范围分别记录。专家确认、训练纳入和真实候选分类拟合仍0；旧失败和此前各阶段证据保留。 10月4日按原manifest顺序新增7人复核，当前止于58人、4408窗口；此前51人及更早记录和日期保留。28幅新增技术图已查看，累计六例待专家核对。原132人的文件与访视对应已核对，准确日期、临床终点和实际预训练人员对应仍缺；专家确认、训练纳入、独立临床验证均0，真实候选分类拟合0。

限制：这些是候选输入的阶段进展，不是全队列QC、训练纳入或诊断成绩。首编号访视不等于已证实临床基线；专家确认、训练纳入、独立临床验证均0。原年龄、同期痛、治疗真值和身份/预训练重叠缺口保留。

下一步：继续完成全候选影像、数值和技术视觉检查，再在本机做原定K5四方法有限对照；只传小特征。本机训练产物完整归档服务器并实际恢复核验后，再释放已结束任务的大文件。

依据：migraine-batch-inputs-20261003、migraine-batch-inputs-20261003-summary、migraine-readiness-20261002-draft、migraine-readiness-20261002-protocol、migraine-readiness-20261002-clinical

</details>

## 2026-10-02　偏头痛输入试验：两人FC与官方288维已跑通

- 模型：官方288维体积编码器、切空间FC
- 数据：成人偏头痛2名开发成员
- 工作：跑通真实影像的FC与官方特征提取。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：真实输入与表示提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛输入试验：两人FC与官方288维已跑通

原摘要：两人各300帧完成运动校正/MNI、去噪和AAL90；两份750×96³量化输入独立复核通过。原版NeuroSTORM完成152次真实前向，得到冻结预训练与随机同结构共4个288维向量。

原结果：两人各300帧完成运动校正/MNI、去噪和AAL90；两份750×96³量化输入独立复核通过。原版NeuroSTORM完成152次真实前向，得到冻结预训练与随机同结构共4个288维向量。

具体方法：原CUDA sm61编译及参考核验、152真实前向、独立持久化池化、AAL90/FFT512/抽样QR复算。

限制：仅两人技术试验，分类拟合和新增QC/训练纳入均0；不代表全队列质量或诊断有效。Torch版本及38窗口整run汇总有本地适配；设备混杂、年龄/临床真值与身份/预训练重叠缺口保持，独立临床验证未完成。

下一步：按同设备库存111病例/21对照准备逐人批量输入，完成全队列头动/覆盖与技术检查后做K5四方法有限对照；临床三个终点继续补独立真值、访视时间及身份证据。

依据：migraine-input-pilot-20261002、migraine-input-pilot-20261002-summary

</details>

## 2026-10-02　偏头痛输入试验：两人头动完成，官方模型仍待前向

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：两人头动完成，官方模型仍待前向
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛输入试验：两人头动完成，官方模型仍待前向

原摘要：两人各300帧完成运动校正与FD独立复算；两人完成2mm标准空间数值检查，96³裁框均保留100%脑掩膜。官方288维编码器223个状态张量严格加载、5,173,020参数；现成Mamba扩展在1080Ti实际失败，正编译原内核sm_61。

原结果：两人各300帧完成运动校正与FD独立复算；两人完成2mm标准空间数值检查，96³裁框均保留100%脑掩膜。官方288维编码器223个状态张量严格加载、5,173,020参数；现成Mamba扩展在1080Ti实际失败，正编译原内核sm_61。

具体方法：实际SPM/DPABI、FD独立计算、脑内有限/脑外缺失检查、strict加载及真实CUDA失败、全文与代码复核。

限制：两人试验不代表全队列质量；脑外NaN保留，两人空间数值/6个技术面板已检查，96³补边规则已明确；时间重采样/窗口及官方前向尚未完成。官方完整前向、人员表示、分类拟合和新增QC纳入均0；设备混杂、临床真值及身份/预训练重叠缺口保持。

下一步：完成原Mamba sm_61运行、时间重采样/窗口和96³×20实际输入，再处理AAL90与同设备K5四方法；按端点补未参与开发的临床真值。文献主结果冻结/附录微调及区间代码口径已核对。

依据：migraine-input-pilot-20261002

</details>

## 2026-10-02　偏头痛候选：完整元数据、设备混杂与真实输入核查

- 模型：官方体积编码器与FC输入准备
- 数据：成人偏头痛候选；本节点范围见原记录
- 工作：完整元数据、设备混杂与真实输入核查
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像输入、混杂与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：偏头痛候选：完整元数据、设备混杂与真实输入核查

原摘要：3729份元数据与347个rest影像头已实读；首访视文件名配对146人（111患者/35对照），两人四份完整T1/rest已读取并核对官方版本。首访视病例全用TrioTim，对照14/35用Prisma，诊断比较需处理设备混杂。

原结果：3729份元数据与347个rest影像头已实读；首访视文件名配对146人（111患者/35对照），两人四份完整T1/rest已读取并核对官方版本。首访视病例全用TrioTim，对照14/35用Prisma，诊断比较需处理设备混杂。

具体方法：全库元数据、既有影像头、两人完整体素和上游版本、实际环境与小结果重放。

限制：尚无逐人年龄、疼痛评分、治疗结局与访视时间表；头动/MNI和官方288维前向未完成，分类拟合与新增QC纳入均0。147目录/347运行不是验证人数，当前候选按开发研究管理。

下一步：先复用服务器输入做两人头动、MNI/掩膜覆盖与官方288维后端试运行，再按同设备、K5、四方法有限对照推进；诊断/同期程度/治疗临床增量各自补真值与时间，论文工作稿已交付。

依据：migraine-readiness-20261002

</details>

## 2026-10-02　强FC来源权重与参考估计：五次支持抽样完成

- 模型：切空间FC＋Logistic自适应来源借用
- 数据：SRPBS79、Emo53，每类5标签
- 工作：比较目标单独、来源单独和自适应来源借用。
- 性能变化：SRPBS AUC 0.6398→0.7260，+8.62个百分点；Emo 0.4624→0.5681，+10.57个百分点，但仍低于来源单独0.6994。
- 原论文 baseline：[Emo底层队列的纤维肌痛原研究](https://pubmed.ncbi.nlm.nih.gov/39522892/)。原研究33名患者＋33名对照，诊断AUC约0.65。 当前Emo53的纳入、处理与模型评价不同；该值作为数据集原研究参照，不能当成本批模型消融的baseline。
- 修改板块：来源权重与几何参考

改善依赖参照和迁移方向，不能概括为稳定迁移成功。

<details><summary>参数、完整记录与依据</summary>

原标题：强FC来源权重与参考估计：五次支持抽样完成

原摘要：srpbs79：K5目标参考、自适应来源权重AUC 0.7260，目标单独0.6398，来源单独0.6943；emo53：K5目标参考、自适应来源权重AUC 0.5681，目标单独0.4624，来源单独0.6994。五次支持抽样均实际重训，结果仍属开发研究。

原结果：srpbs79：K5目标参考、自适应来源权重AUC 0.7260，目标单独0.6398，来源单独0.6943；emo53：K5目标参考、自适应来源权重AUC 0.5681，目标单独0.4624，来源单独0.6994。五次支持抽样均实际重训，结果仍属开发研究。

具体方法：同损失尺度、K5/K10、五次支持重训、目标内层选权重/λ及有限参考；6516头全复算。

限制：132人、原三外层划分；724最终头及5792内层头全复算。主要预算K5，K10/固定来源权重/参考估计为次要；区间同时重采人员和5次已拟合支持抽样，不覆盖全部训练分布、外层划分、研究选择或独立临床验证。 原20未评分，旧QC/划分、Emo13失败、批量确认与细区覆盖限制、TN14和结构535停止保持。

下一步：首阶段强FC迁移条件实验已完成并复算；下一步核查偏头痛候选的按人/访视临床、头动、身份与真实输入，可运行才安排强FC、官方288维冻结表示、随机和协变量的有限对照。未参与开发的诊断/程度/治疗临床增量继续另行准备，整体论文目标保持进行中。

依据：fc-transfer-conditions-20261002

</details>

## 2026-10-02　结果复评与下一步三项实验目标

- 模型：既有FC与预训练迁移方法
- 数据：SRPBS79、Emo53
- 工作：复评已完成结果，并确定后续实验问题。
- 性能变化：无新增AUC；0.7947属于既有开发条件，不能当独立临床验证。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：结果解释与研究安排

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：结果复评与下一步三项实验目标

原摘要：强FC联合完整目标训练补集的SRPBS开发AUC为0.7947；K5联合为0.7469。Emo来源单独0.6980高于联合K5的0.6206，目标标签的增量仍需检验。结构融合、CLIP灰度和原79体积配置未形成可靠增量。

原结果：上述为已完成开发结果的复评，没有新增训练。两队列既往接触、支持抽样及条件区间限制保留；0.7947不是独立临床验证，也不是确认性主要预算。

具体方法：核对已保存聚合结果、完整学习曲线和正式论文；本次新增训练0。

限制：上述为已完成开发结果的复评，没有新增训练。两队列既往接触、支持抽样及条件区间限制保留；0.7947不是独立临床验证，也不是确认性主要预算。

下一步：下一步依次检验强FC的来源借用条件、偏头痛候选的临床表与真实输入、未参与开发的临床增量。结构融合已完成且条件535头停止，CLIP灰度与原79体积配置不继续扩展；三项新目标均未启动训练。

依据：research-reassessment-20261002

</details>

## 2026-10-02　两队列少样本比较完成，预训练未形成稳定迁移优势

- 模型：Meta-matching与强FC、随机表示
- 数据：SRPBS79、Emo53，每类5标签
- 工作：完成双向少标签迁移及两种适配方式比较。
- 性能变化：预训练未同时超过强FC和随机表示，未形成稳定迁移优势。
- 修改板块：预训练迁移与适配

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：两队列少样本比较完成，预训练未形成稳定迁移优势

原摘要：SRPBS79（源Emo53）目标单独/联合：预训练0.5789/0.5495，强FC0.6214/0.7469；Emo53（源SRPBS79）目标单独/联合：预训练0.4378/0.4791，强FC0.4416/0.6206。每类5人的全部双向、两种适配模式没有同时支持预训练超过强FC和随机表示；不据局部优势宣称稳定迁移收益。

原结果：每类5人的全部双向、两种适配模式没有同时支持预训练超过强FC和随机表示；不据局部优势宣称稳定迁移收益。

具体方法：两方向、K1/5/10/完整补集，五随机与强FC，训练内选C；7290保存头复算。

限制：两队列均有既往开发接触；1098最终头、6192内层头已逐个复算。当前是诊断分组开发比较，非扫描时疼痛、程度预测或独立临床验证。区间固定保存模型，不覆盖重训、全部支持抽样与研究选择；Emo批量确认非逐例专家审核，13原失败及4人细区覆盖限制保留。

下一步：本轮支持/种子/头的有限比较结束。下一阶段以真实终点和近期文献为依据选题，优先检验强FC的迁移边界、输入与任务差异；有新依据才安排新配置。保留全部预算/方向，程度与治疗任务分开，真正未参与开发的验证仍另行准备。论文目标保持进行中。

依据：multidataset-fewshot-20261002

</details>

## 2026-10-02　调整研究目标，开展按病种和终点区分的多数据集试验

- 模型：尚未新增预测模型
- 数据：4个候选数据仓库
- 工作：按病种、疼痛程度和治疗反应分别规划数据与实验。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：数据与研究终点分工

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：调整研究目标，开展按病种和终点区分的多数据集试验

原摘要：研究范围扩展到原79人之外：比较脑影像相对临床、人口学和强FC方法的预测增量，检验这些结果在不同病种、来源和样本规模下是否成立。预训练是否有用由结果决定；阴性和迁移失败也是研究结论。

原结果：四仓库元数据核查；新拟合0；新QC纳入0。

具体方法：官方说明、Git树与实际字段审计，按来源区分诊断/干预/重复条件。

限制：原79、Emo、ZAN和已使用的PRT仍保留开发接触记录；诊断分类、患者疼痛程度、刺激反应及治疗变化分别报告。原79体积AUC：FC0.7422、预训练0.5269、随机0.4771；合并SRPBS/ZAN到Emo此前未见可靠改善。新元数据核查没有新增训练、QC批准或独立临床验证。

下一步：先核对Emo-Fibro与偏头痛候选的逐人终点、访视、身份重叠和可运行输入，再为各任务确定有限比较。复用有效特征，训练内选参；可兼容来源做按数据集留出评价。缺年龄可另做影像单独任务并报告缺失，缺评分不做程度回归；不会把干预分组当诊断。

依据：multidataset-goal-20261002

</details>

## 2026-10-02　原79人体积表示比较完成，预训练表示未超过FC

- 模型：冻结体积预训练表示、随机表示、强FC
- 数据：SRPBS79
- 工作：完成同人员的体积表示分类比较。
- 性能变化：预训练比FC低21.52个百分点，条件区间全负；比随机高4.99个百分点，但区间跨0。
- 原论文 baseline：[NeuroSTORM原方法，arXiv 2506.11167v2](https://arxiv.org/html/2506.11167v2)。原方法评估人口学、表型、疾病和状态分类等任务；未提供SRPBS疼痛或成人偏头痛同预算的AUC baseline。 原方法与儿科头痛应用论文分别列出；本地早期192维适配、官方288维、池化与输入处理差异按各条实验备注解释。
- 原论文 baseline：[NeuroSTORM儿科头痛研究，MLHC 2026](https://proceedings.mlr.press/v340/aldeia26a.html)。儿科头痛二分类：FC baseline AUC 0.67，冻结NeuroSTORM 0.82；110人、189次扫描。 这是相关疼痛应用论文，留一人时排除其全部访视。成人偏头痛、SRPBS及实验热痛具有不同终点与输入，不能直接与这两个原值相减。
- 修改板块：体积预训练迁移

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：原79人体积表示比较完成，预训练表示未超过FC

原摘要：原79人开发池的9个按人任务中，FC平均AUC 0.7422，预训练体积表示0.5269，随机表示0.4771。三分支243次拟合及全部保存模型复算已完成。

原结果：预训练−FC差-0.2152，按人条件95%区间[-0.3402, -0.0839]；预训练−随机差0.0499，区间[-0.0681, 0.1721]跨0。

具体方法：固定三分支/原9按人任务/243头；训练内切空间、标准化与选C；全部保存模型复算。

限制：这是原79人内部开发比较，9任务互有重叠；条件区间依赖已保存预测，没有重拟合，也不包含随机种子分布。每人240帧分12个不重叠窗口，模型状态逐窗重置。36人不动、43人平移、最大8mm；各人MNI原点不同、token位置改变。原生40人自动掩膜触边，完整解剖覆盖与作者预处理精确再现未证明；FC回归/滤波而体积最小处理，比较包含处理差异。原QC、标签、划分、视觉豁免、原20未评分、结构535停止与TN14保持。

下一步：这轮有限比较已完成，不追加窗口、种子、分类头或融合搜索。下一步优先补齐真正未参与开发数据的同Pain/HC终点、年龄、评分与MRI时间配对、身份重叠和QC证据。ds005016的147人目录、347组访问文件名和两份影像头核查均不能算作验证可用人数。

依据：volume-comparison-20261002、volume-nearest-crop-20261001

</details>

## 2026-10-01　15/79全run表示已核对，固定提取继续

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：15/79全run表示已核对，固定提取继续
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：15/79全run表示已核对，固定提取继续

原摘要：原79人中已完成15人的预训练与随机全run表示：原5人表示直接复用，按同一裁框规则新增10人。每人240帧、12个固定窗口、每分支192维；共180个不同窗口、360份分支窗口表示。分类拟合和疼痛评分均0。

原结果：本批8人覆盖损失0/脑内非有限0/192前向有限，累计15；分类0。

具体方法：同一逐人取框规则、原2mm/96³、固定240帧/12窗、原发布权重和位置buffer。

限制：本批新增8人完整240帧、96窗口/192分支前向已核对；已知自动脑掩膜框外损失0、脑内非有限0，保存4份实际掩膜并独立复核几何和汇总，实际查看8图120面板。局部左右不对称、前下部和外周掩膜差异保留，不改原QC或纳入。统一取框规则需36人不动、43人平移，最大8mm；各人MNI原点不同，平移会改变相对位置和token分组，自动掩膜保留不等于完整解剖覆盖。

下一步：接续剩余64人的相同固定提取流程，远端逐人归一化、本机C盘保存窗口并冻结提取；独立程序完成或遇错即停。全部79表示及同一取框规则核对后，才沿原9按人任务做三分支243头比较。训练内标准化和选C，原20、结构535停止、TN14、原QC/标签/划分和视觉豁免保持。新验证继续补终点、年龄/评分—MRI时间、身份重叠及QC。

依据：volume-nearest-crop-20261001

</details>

## 2026-10-01　CLIP原79开发比较完成，未见预训练增益

- 模型：CLIP预训练／随机编码器与强FC
- 数据：SRPBS79
- 工作：把FC作为灰度图提取表示，完成固定配置分类比较。
- 性能变化：CLIP未超过切空间、随机或原像素特征，未见预训练增益。
- 修改板块：FC图像化与跨模态表示迁移

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CLIP原79开发比较完成，未见预训练增益

原摘要：原79开发池、原9项按人任务的四分支比较已完成并独立复读324个模型：切空间AUC 0.7422、CLIP 0.4270、同架构随机0.5411、同图像像素0.6918；均含相同人口学。固定FC灰度输入未见CLIP预训练增益。

原结果：CLIP未超过切空间、随机或像素；固定FC灰度配置结束。

具体方法：原9按人任务、四分支同人口学与训练内选C，324保存模型及按人条件区间独立复读。

限制：CLIP相对切空间ΔAUC −0.3152，按人条件95%区间[−0.4309，−0.2030]；相对随机差值区间跨零。仅原79开发证据、单个随机种子及当前灰度配置，不能推广至所有CLIP用途或独立临床效果。原20人未评分，旧QC、标签、划分及主线保持。

下一步：CLIP当前固定FC灰度配置结束，保留阴性结果，不根据查询成绩翻转概率或搜索配色、提示词。主线继续已有体积输入与冻结表示工作；真正未参与开发的同终点数据仍待取得。

依据：clip-comparison-20261001

</details>

## 2026-10-01　7/79全run表示已核对，按统一坐标规则保留脑掩膜

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：7/79全run表示已核对，按统一坐标规则保留脑掩膜
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：7/79全run表示已核对，按统一坐标规则保留脑掩膜

原摘要：原79人中已完成7人的预训练与随机全run表示：原5人取框位置未变、表示直接复用，按同一坐标规则新增2人。每人240帧、12个固定窗口、每分支192维；共84个不同窗口、168份分支窗口表示。分类拟合和疼痛评分均0。

原结果：本批2人覆盖损失0/脑内非有限0/48前向有限，累计7；分类0。

具体方法：同一几何规则逐人最小平移、原2mm/96³、实际完整run与原发布权重和位置buffer。

限制：全部79人的本人掩膜都能放入2mm、96³框；沿同一规则选离原框最近的覆盖位置，36人不动、43人平移，最大8mm。新增2人框外已知自动脑体素损失0、脑内非有限0，独立复核保存汇总并实际查看2图30面板。各人不再共享同一个MNI原点，平移会改变脑相对位置和token分组；自动掩膜覆盖不等于完整解剖覆盖，技术查看不改原QC。

下一步：继续按原身份顺序有界提取其余72人，所有人采用同一取框规则、同一2mm尺寸、原权重/位置buffer与固定窗口汇总；窗口和表示保存在本机C盘，仅核对后回收本轮远端临时大文件。全部79表示核对后运行原9按人任务、三分支243头，保留原20、结构535停止、TN14和所有原边界。新验证继续补临床定义、年龄/量表—MRI时间、身份重叠和QC，不把名义147人当已可验证。

依据：volume-nearest-crop-20261001

</details>

## 2026-10-01　CLIP两人FC特征提取完成，疼痛效果待比较

- 模型：CLIP预训练／随机编码器
- 数据：SRPBS79中的2名开发成员
- 工作：将FC灰度图送入两分支，检查特征能否正常提取。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[CLIP，原文及公开模型](https://arxiv.org/abs/2103.00020)。原文为图像—文本预训练与视觉迁移，未报告把FC灰度图用于SRPBS79疼痛诊断的AUC baseline。 本项目FC图像的预训练／随机编码器比较属于任务适配；该原文也不充当本地FC两视图训练的性能基线。
- 修改板块：FC图像化输入与编码器接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：CLIP两人FC特征提取完成，疼痛效果待比较

原摘要：CLIP支线已用原79开发池中按身份顺序选取的2人FC图像，完成预训练与同架构随机编码器的512维冻结表示。12次GPU前向全部有限，同输入重复差为0；分类拟合和疼痛评分均0。主线既有结果保留。

原结果：两分支512维均有限；分类0；无疼痛收益结论。

具体方法：原FC固定灰度输入、官方预处理、冻结图像编码器和新初始化随机对照、CPU/GPU及保存数值复核。

限制：这是FC图像编码的技术可行性检查，没有疼痛预测成绩。图像没有新增模态；CLIP文本分支未使用，不能称脑影像—临床文本对齐。仅2人和一个随机种子，不代表全79质量、随机分布或独立临床验证。

下一步：CLIP支线下一步复用原79现成FC，在相同9项按人划分内比较切空间、冻结CLIP、同架构随机表示及同图像像素对照；人口学与分类头条件一致，标准化和选参仅训练内。GPU与主线错峰，保留主线三分支243头方案。

依据：clip-feasibility-20261001

</details>

## 2026-10-01　共同框覆盖不足，体积比较暂停

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：共同框覆盖不足，体积比较暂停
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：共同框覆盖不足，体积比较暂停

原摘要：全部79人的扩展自动脑掩膜已实测并独立复算：43人、4764个体素超出原固定框；联合范围x=-72至82、y=-112至84、z=-86至86mm。前后跨度196mm超过2mm/96³可覆盖的190mm，仅移动框不能完整容纳已测掩膜。其余74人的表示提取保持暂停；已有5份保留，分类0。自动掩膜不证明完整解剖覆盖。

原结果：43人框外4764体素；全体y跨度196mm>190mm；分类0。

具体方法：复用6掩膜、归一化73首帧/掩膜；重新读取实际保存掩膜，按仿射变换与逆固定框坐标独立复算。

限制：没有完整解剖覆盖或模型增益结论；原QC和数据划分保持。

下一步：先明确适用于全部原79的体积输入方案及其与预训练输入的差异，再决定是否继续。不能仅移框、默删体素、跳人或直接插值后称为原训练输入。79掩膜诊断已完成，独立程序exit0并停止；尚未采用新框、改体素间距、重提5份表示或训练243头。原20、结构535头、TN14、原QC和暂停任务保持。

依据：volume-cohort-progress-20261001

</details>

## 2026-10-01　5/79全run表示已核对，固定框覆盖不足使提取暂停

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：5/79全run表示已核对，固定框覆盖不足使提取暂停
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：5/79全run表示已核对，固定框覆盖不足使提取暂停

原摘要：原79人中已完成5人的预训练与随机全run表示，每人240帧、12个固定窗口、每分支192维；共60个不同窗口、120份分支窗口表示。分类拟合和疼痛评分均0。

原结果：下一人的宽框自动脑掩膜有217254个体素，其中145个位于固定96³框下方（z=-84、-82、-80mm），已停止其窗口和表示提取。既有5份表示保留；不能据前5人无框外损失保证其余74人覆盖。自动掩膜不证明完整解剖覆盖。

具体方法：真实宽框掩膜物理坐标核对；失败资料保留。

限制：尚无79人共同框覆盖结论、分类或临床增益。

下一步：先复用已有宽框掩膜并补齐其余人员的掩膜，测量全部79人的共同物理范围，再判断是否存在一致的2mm/96³输入框；独立后台诊断完成或遇错后停止，不自动改框、删人、训练或发布。全79表示齐备后才运行原9任务、三分支243头；原20、结构535头、TN14及暂停任务保持。

依据：volume-cohort-progress-20261001

</details>

## 2026-10-01　4/79人的全run表示已核对，分类比较待开始

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：4/79人的全run表示已核对，分类比较待开始
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：4/79人的全run表示已核对，分类比较待开始

原摘要：原79人中已完成4人的预训练与随机全run表示：复用先前2人，按原身份顺序新增2人。每人240帧、12个固定窗口、每分支192维；4人共48个不同窗口、96份分支窗口表示。分类拟合和疼痛评分均0。

原结果：首批2名未完成人实际完成，累计4/79；分类0。

具体方法：逐人宽框和固定框实测、远端临时派生、本机窗口和同输入冻结两分支。

限制：本批新增2人的宽框自动脑掩膜均完整落在固定96³内，脑内非有限值为0；已独立复核实际掩膜和保存汇总、查看2张私有拼图。自动掩膜与完整解剖覆盖、非专家查看与专家审核分开；不能据4人保证剩余75人质量，也没有疼痛增益结论。

下一步：继续按原身份顺序有界串行提取其余75人；远端归一化和准备窗口，本机C盘保存窗口并冻结提取，每人核对后仅回收本轮远端可重建临时大文件。全79表示齐备后运行既定原9任务、三固定分支243个分类头；原20、结构535头、TN14和暂停任务保持原状态。

依据：volume-cohort-progress-20261001

</details>

## 2026-10-01　两站点全run表示已生成，疼痛比较待开始

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：两站点全run表示已生成，疼痛比较待开始
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：两站点全run表示已生成，疼痛比较待开始

原摘要：2位开发个体来自不同站点，各240帧按固定顺序分成12个20帧窗口；预训练与随机分支共48份窗口表示均有限，分别汇总成192维全run表示。分类拟合和疼痛评分均0。

原结果：两站点技术输入和48份分支窗口表示完成；患者分类0。

具体方法：扩展掩膜测量，保持物理坐标收回已知缺失体素，固定全run汇总及同架构随机对照。

限制：扩展MNI范围后，既定96³保留两例全部自动脑掩膜；发现并收回原标准框外73个体素。自动掩膜与参考交集为86.59%—88.03%，不能称完整解剖覆盖或推广到79人。分窗状态重置，随机分支共用冻结位置编码；无疼痛增益结论。

下一步：沿原79身份顺序分批准备同坐标完整输入并提取固定全run表示；逐人核对覆盖与有限值，全部齐备后沿原9项按人拆分比较FC+人口学、预训练+人口学、随机+人口学，训练内标准化和选C。原20不评分，结构535头、TN14和暂停任务保持停止。

依据：volume-cross-site-20261001

</details>

## 2026-10-01　真实体积输入跑通，疼痛比较尚未开始

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：真实体积输入跑通，疼痛比较尚未开始
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：真实体积输入跑通，疼痛比较尚未开始

原摘要：一个原开发个体的未回归数据完成2 mm适配与20帧冻结前向，保留13,630个脑token；重复差0，预热后0.109秒、峰值415 MiB。分类拟合和疼痛评分均0。

原结果：单个开发个体的2 mm未回归输入和首20帧前向完成；全run表示和疼痛比较未运行。

具体方法：复用SPM参数与原坐标回退；完整范围对比、全run统计、独立token掩膜及重复前向。

限制：96³裁切未丢失完整2 mm输出中的脑掩膜或参考掩膜体素；个体自动掩膜与参考掩膜交集占86.6%，不代表完整解剖覆盖。仅一人前20帧，未形成全run表示或患者比较；上采样不恢复原分辨率，Aurora与当前上游前向不等价。

下一步：先按同一物理坐标与强度分支核对另一原开发站点输入，明确全run固定汇总与同架构随机表示对照，再沿原按人划分执行有限比较；所有标准化、选参和降维在训练内完成。原20不评分，结构535头、TN14与旧暂停任务保持停止。

依据：volume-real-input-20261001

</details>

## 2026-10-01　体积模型推理跑通，患者输入仍需适配

- 模型：官方体积预训练编码器
- 数据：SRPBS79的分批输入；人数见本节点
- 工作：体积模型推理跑通，患者输入仍需适配
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：体积输入、空间覆盖与特征提取

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：体积模型推理跑通，患者输入仍需适配

原摘要：NeuroMamba主模型113项权重严格加载；完整96×96×96×20合成输入用时0.41秒，峰值分配显存984 MiB，重复输出一致。现有开发输入为3 mm，作者要求2 mm；本轮未训练或评分患者。

原结果：权重严格加载、数值复核及合成全尺寸推理完成；患者输入适配未完成。

具体方法：作者指明的Aurora后端；独立递推/显式卷积、CPU/GPU和背景反例。

限制：这是合成输入的工程可行性核查，单次计时不含读取和预处理，不能当患者推理P95、疼痛收益或临床验证。Aurora与当前上游门控写法不同；零背景残差也不符合minback掩膜假设。ds005016仅核对元数据和文件名，可用人数、身份重叠及同终点仍未确立。原结构阴性及全部开发边界保留。

下一步：先明确使用的作者后端与输入分支，核对固定2 mm坐标、脑覆盖、强度和背景，执行一个既有开发输入的技术试跑；输入未适配前不做患者分类比较。再沿原拆分准备强FC、预训练和适用随机表示的有限比较。新队列继续补终点、身份和QC证据；原20不评分，TN14及旧暂停任务保持。

依据：volume-feasibility-20261001

</details>

## 2026-10-01　79人结构与FC比较完成，未满足扩展条件

- 模型：FastSurfer结构特征、FC及融合分类
- 数据：SRPBS79
- 工作：比较结构分割特征与FC，以及两者组合。
- 性能变化：未满足扩展条件，未见稳定结构增量；具体各条件分数保留在备注。
- 修改板块：结构影像与FC融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：79人结构与FC比较完成，未满足扩展条件

原摘要：原79人统一输入及独立数值复算完成，9任务405个分类头和保存模型复算完成。FC+FastSurfer融合平均AUC为0.7255，FC+人口学为0.7422；三个训练组的增量方向不一致，未满足原继续条件，停止这条结构路线的小样本及双向站点扩展。

原结果：全79复算、9任务405头及保存模型复算通过；原继续判定阴性。

具体方法：同人、同内部拆分、训练侧选参、两种等权融合。

限制：原79人是开发数据，9任务互有重叠；平均AUC不是79人独立测试AUC。按人共同重采样的条件区间不涵盖重训不确定性。FastSurfer硬体积与SPM灰质积分是不同测量，不能归因为预训练因果收益；阴性不证明等效或普遍无效。用户免人工视觉审核与实际查看、专家批准分别记录，有限值覆盖不等于完整解剖覆盖。

下一步：保留全部方法、两项主要差值、三个组方向和阴性决定。暂停当前结构扩展，不运行条件性535个后续分类头；按已有证据选择下一研究假设，并继续准备真正未参与开发的同终点验证。原20不评分，QC、标签、划分、TN14及旧暂停自动化保持。

依据：structural-uniform79-20261001

</details>

## 2026-09-30　收束预训练问题，准备新队列验证

- 模型：既有预训练与FC方法
- 数据：现有开发队列及候选验证队列
- 工作：收束已测方法，明确同终点验证数据需求。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：研究安排与独立验证准备

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：收束预训练问题，准备新队列验证

原摘要：当前优先投入三件事：明确预训练表示在小样本及跨站点条件下的收益，完成结构与FC公平比较，并行核查真正未参与开发的同终点数据。已完成新验证数据需求与候选盘点，尚无符合全部条件的新队列证据。

原结果：三项优先事项已对应现有执行方案；完成同终点验证数据需求与候选可用性表，尚无新验证或患者成绩。

具体方法：沿用原9任务、少样本与双向站点方案；数据工作并行，不增加人工等待或重复计算。

限制：原79/99与多轮查看的Emo仍属开发证据；FastSurfer硬体积与SPM灰质积分不作预训练因果归因。

下一步：完成原79人统一输入与9任务内部对照，复算保存模型后按原判定推进每类1/5/10人及双向站点；并行记录新验证队列的身份重叠、终点与扫描时间、用药/头动/站点及真实输入缺口。原20本轮不评分。

依据：active-research-goal-20260929、unseen-validation-requirements-20260930

</details>

## 2026-09-30　18人数值核验完成，接续已恢复

- 模型：FastSurferVINN
- 数据：SRPBS99中的原79人结构队列
- 工作：18人数值核验完成，接续已恢复
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FastSurferVINN，NeuroImage 2022](https://doi.org/10.1016/j.neuroimage.2022.118933)。原文评价结构像分割的Dice等指标；没有提取结构体积后进行疼痛分类的AUC baseline。 本项目后续结构／FC分类是另设下游任务，分割质量和分类AUC分别解释。
- 修改板块：结构分割与特征输入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：18人数值核验完成，接续已恢复

原摘要：原79人统一处理已完成18人的本地数值核验，下一批8人已启动。此前本地处理与训练接续中断，现已恢复；已完成影像未重跑。继续按用户要求免人工视觉审核，全79人输入齐备后执行既定9组训练对照，目前尚无新的疼痛预测成绩。

原结果：已收取18人完整数值文件；独立物理坐标映射一致，SPM积分最大差1.78e-15，FC与原时序独立Pearson最大差2.98e-08，原数值QC及AAL90均通过。其中16人没有人工视觉查看，保留为用户授权免审核；不与先前2人真实查看记录混写。当前患者拟合仍为0。

具体方法：9月30日第三批8人正常退出，累计18人完整处理。检查发现本地两个接续进程已退出，收取记录停在16人，日志没有终态错误；本机有当日上午重启记录，但不能据此确定此前进程的退出时刻和原因。本轮恢复原程序，从已完成产物补收剩余2人并核验，随后续跑下一8人。已完成影像未重跑，原处理及训练方案未改，定期任务未恢复。训练后先复算保存模型，仅在原主要对比满足既定条件时继续少样本与双向站点；阴性结果保留。

限制：免人工审核按用户授权记录，未查看者不写成已查看或专家批准；此前实际查看的2人、14张拼图保留。有限值覆盖不等于完整解剖覆盖，原矩阵条件数警告及两人抽样诊断的局限保留。原QC、标签、划分及TN14停止状态不变，缺失或数值不一致的输入仍不能训练。

下一步：自动收取已完成输入并做数值复算，沿原顺序继续剩余批次；全79齐备后比较强FC、传统SPM结构、预训练结构及有限融合，再复核保存模型。依既定主要对比结果推进每类1/5/10人和双向站点评价，不按查询集挑方案；原20不评价。

依据：structural-spm-audit-20260929

</details>

## 2026-09-29　10人数值核验完成，接续已恢复

- 模型：FastSurferVINN
- 数据：SRPBS99中的原79人结构队列
- 工作：10人数值核验完成，接续已恢复
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FastSurferVINN，NeuroImage 2022](https://doi.org/10.1016/j.neuroimage.2022.118933)。原文评价结构像分割的Dice等指标；没有提取结构体积后进行疼痛分类的AUC baseline。 本项目后续结构／FC分类是另设下游任务，分割质量和分类AUC分别解释。
- 修改板块：结构分割与特征输入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：10人数值核验完成，接续已恢复

原摘要：原79人统一处理已完成10人的本地数值核验，下一批8人已启动。此前本地处理与训练接续中断，现已恢复；已完成影像未重跑。继续按用户要求免人工视觉审核，全79人输入齐备后执行既定9组训练对照，目前尚无新的疼痛预测成绩。

原结果：已收取10人完整数值文件；独立物理坐标映射一致，SPM积分最大差1.78e-15，FC与原时序独立Pearson最大差2.98e-08，原数值QC及AAL90均通过。其中8人没有人工视觉查看，保留为用户授权免审核；不与先前2人真实查看记录混写。10项输入测试及6项接续决策测试通过，当前患者拟合仍为0。

具体方法：远端第二批8人正常退出，累计10人完整处理。检查发现本地两个接续进程已不存在，日志未给出退出原因，最后记录9人核验；不是远端计算失败。本轮从原完成产物收取第10人，独立数值复算通过后续跑下一8人。接续程序重新启动为隐藏后台进程，未改正在运行的处理代码或恢复定期任务。训练后先复算保存模型，仅在原主要对比满足既定条件时继续少样本与双向站点；阴性结果保留。

限制：免人工审核按用户授权记录，未查看者不写成已查看或专家批准；此前实际查看的2人、14张拼图保留。有限值覆盖不等于完整解剖覆盖，原矩阵条件数警告及两人抽样诊断的局限保留。原QC、标签、划分及TN14停止状态不变，缺失或数值不一致的输入仍不能训练。

下一步：自动收取已完成输入并做数值复算，沿原顺序继续剩余批次；全79齐备后比较强FC、传统SPM结构、预训练结构及有限融合，再复核保存模型。依既定主要对比结果推进每类1/5/10人和双向站点评价，不按查询集挑方案；原20不评价。

依据：structural-spm-audit-20260929

</details>

## 2026-09-29　整合研究目标、成果与失败取舍

- 模型：FastSurferVINN
- 数据：SRPBS99中的原79人结构队列
- 工作：整合研究目标、成果与失败取舍
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FastSurferVINN，NeuroImage 2022](https://doi.org/10.1016/j.neuroimage.2022.118933)。原文评价结构像分割的Dice等指标；没有提取结构体积后进行疼痛分类的AUC baseline。 本项目后续结构／FC分类是另设下游任务，分割质量和分类AUC分别解释。
- 修改板块：结构分割与特征输入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：整合研究目标、成果与失败取舍

原摘要：研究目标已整合现有成果与阴性结果：继续争取可信预训练增益，重点研究少样本迁移何时有效。近期先比较同一T1的传统SPM结构、预训练结构、FC及有限融合，再按训练内证据推进学习曲线和双向站点评价；最终仍需未参与开发的数据验证。

原结果：9月29日上午续跑核查：批次曾在完成12人后因下一例推理非零退出而停止，日志未明确原因。确认旧进程不存在后保留失败日志和部分产物，复用已完成12人，以相同模型和参数进行一次续跑；故障例现已完成，后续仍在提取。没有新的疼痛拟合或评价。

具体方法：既有成果与失败归纳；进程及恢复产物实查。没有新增疼痛模型结果。

限制：现有分类参照约AUC 0.75，尚无稳定的预训练整体收益或可靠疼痛程度模型。原79/99及反复查看的Emo属于开发证据；结构融合本身不作为创新点，不设发表AUC门槛。

下一步：先核对已续跑的79人结构提取与逐例产物，复用完成文件；完整核验后做人口学、FC、传统SPM、预训练结构及有限融合的训练内部比较。按整合目标保留阴性路线停止决定、少样本与双向站点要求，并推进同终点新队列。

依据：active-research-goal-20260929、structural-cohort-20260929

</details>

## 2026-09-29　两站点结构分割已跑通，79人提取启动

- 模型：FastSurferVINN
- 数据：SRPBS99中的原79人结构队列
- 工作：两站点结构分割已跑通，79人提取启动
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FastSurferVINN，NeuroImage 2022](https://doi.org/10.1016/j.neuroimage.2022.118933)。原文评价结构像分割的Dice等指标；没有提取结构体积后进行疼痛分类的AUC baseline。 本项目后续结构／FC分类是另设下游任务，分割质量和分类AUC分别解释。
- 修改板块：结构分割与特征输入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：两站点结构分割已跑通，79人提取启动

原摘要：OSU和NKN各1例的FastSurfer三方向分割均已跑通，约36秒和37秒完成；空间、标签与体积计算复核通过。两例已有SPM灰质图在90个目标脑区内完整，可准备同一T1输入的传统特征对照。原79人结构提取已启动，目前没有新的疼痛预测成绩。

原结果：OSU和NKN各1例的FastSurfer三方向分割均已跑通，约36秒和37秒完成；空间、标签与体积计算复核通过。两例已有SPM灰质图在90个目标脑区内完整，可准备同一T1输入的传统特征对照。原79人结构提取已启动，目前没有新的疼痛预测成绩。

具体方法：两站点同参数分割；两例SPM90区独立映射与积分；原79人只提取不拟合。

限制：这是两例技术可行性和批量提取启动记录，不是跨站点预测验证或79人全部完成。分割叠加图共30张、SPM叠加图10张已作技术查看，均不替代专家审核；原QC、纳入、标签、划分、TN14和暂停自动化不变。

下一步：核对正在运行的原79人提取进程及逐例产物，保留失败和部分文件，不重复启动。完整特征检查后，在原训练内部比较FC、预训练结构、传统SPM结构及限定融合，再决定是否推进少样本和双向站点开发评价。

依据：structural-cohort-20260929

</details>

## 2026-09-28　原99人T1核查完成，预训练结构分割单例跑通

- 模型：FastSurferVINN
- 数据：SRPBS99中的原79人结构队列
- 工作：原99人T1核查完成，预训练结构分割单例跑通
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FastSurferVINN，NeuroImage 2022](https://doi.org/10.1016/j.neuroimage.2022.118933)。原文评价结构像分割的Dice等指标；没有提取结构体积后进行疼痛分类的AUC baseline。 本项目后续结构／FC分类是另设下游任务，分割质量和分类AUC分别解释。
- 修改板块：结构分割与特征输入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：原99人T1核查完成，预训练结构分割单例跑通

原摘要：已找回并核对原99人的T1：99份影像头、文件大小及原来源路径均对应。FastSurfer官方三方向权重已加载，开发集单例分割约36秒完成，空间和体积计算复核通过。核心标签仅与NeuFoM45项中的31项同名，仍缺14项；尚无新的疼痛预测成绩。

原结果：已找回并核对原99人的T1：99份影像头、文件大小及原来源路径均对应。FastSurfer官方三方向权重已加载，开发集单例分割约36秒完成，空间和体积计算复核通过。核心标签仅与NeuFoM45项中的31项同名，仍缺14项；尚无新的疼痛预测成绩。

具体方法：逐一读取99份T1头与既有来源；按开发池顺序选1例；核对官方31/45标签对应。

限制：本轮仅完成1例结构分割与15张切片的技术查看，不是全队列分割或专家审核；疼痛模型拟合和评价均为0。原99人仍属开发数据，不新增审核或纳入，不恢复TN14或定期任务。

下一步：先按原清单顺序核查另一站点的一例，确认结构提取能在两种采集上运行；再预先规定实际可用结构特征、传统组织体积和FC的训练内部对照。缺失14项不补零、不宣称NeuFoM原模型复现，未核查完前不批量启动全队列。

依据：structural-pilot-20260928

</details>

## 2026-09-28　TN历史审核与网页记录对齐完成

- 模型：尚未新增预测模型
- 数据：DS005713／TN历史队列
- 工作：对齐既有审核、临床字段与可用影像记录。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：样本审核与标签连接

TN14保持停止；历史审核不等于新增训练纳入。

<details><summary>参数、完整记录与依据</summary>

原标题：TN历史审核与网页记录对齐完成

原摘要：TN记录已对齐：78例历史审核对应同一处理路径，网页PENDING不否定既有确认。51人临床快照中21人有处理记录，7人满足原FC条件、14人覆盖不足；6名有评分者均属于已停止的TN14，并未形成新队列。

原结果：TN记录已对齐：78例历史审核对应同一处理路径，网页PENDING不否定既有确认。51人临床快照中21人有处理记录，7人满足原FC条件、14人覆盖不足；6名有评分者均属于已停止的TN14，并未形成新队列。

具体方法：78个身份与attempt路径一致；21=7+14，6为既有TN14子集；7份FC公式回读。

限制：本轮只核对已有记录和7份本地FC，新增审核、纳入和模型拟合均为0。保留8月24日研究者确认与原覆盖排除，TN14和定期任务继续停止。远端端口连接超时，原始文件及队列未重新核实。

下一步：TN文本暂不启动联合预测，避免重新包装已停止的TN14。优先取得原99人的批准T1或逐人结构表；远端连接恢复或提供本地副本后，先核实来源和单例分割可行性。当前等待可访问输入，不重复扫描旧模型或恢复定期任务。

依据：tn-provenance-20260928

</details>

## 2026-09-28　结构与临床文本本地核查完成

- 模型：结构与临床文本输入准备
- 数据：SRPBS99与DS005713／TN
- 工作：核对结构特征及真实临床叙述能否连接到影像。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：结构／文本输入与样本对应

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：结构与临床文本本地核查完成

原摘要：新输入核查：原99人临床表没有病历叙述；TN的2.0.2快照有51人真实短文本，但旧影像连接记录仅7人纳入、6人具备开发性回归条件。当前QC中21条对应记录仍待确认，与旧清单尚未对齐。本地未找到所需结构表，远端仍待实查。

原结果：新输入核查：原99人临床表没有病历叙述；TN的2.0.2快照有51人真实短文本，但旧影像连接记录仅7人纳入、6人具备开发性回归条件。当前QC中21条对应记录仍待确认，与旧清单尚未对齐。本地未找到所需结构表，远端仍待实查。

具体方法：20份候选表、Emo字典、99唯一身份对应、TN三字段153值原表复核。

限制：本轮核查输入，没有新训练或疼痛指标。51人是另一TN队列；7/6人为9月13日记录，不代表当前新增纳入。远端队列状态未知，原QC、53名用户批量确认、13名失败、TN14停止及定期任务暂停均保持。

下一步：先核对TN旧纳入与当前QC记录的输出身份及审核来源，并核实原批准T1及已有结构产物；可取得影像时，再做单例现成分割模型的可行性试验。TN真实短文本可先研究信息抽取，须与原文和简单规则比较；不把诊断字段输入同一诊断分类，不使用术后信息预测基线。缺少原文或同访视影像时不拼造新模态。

依据：input-inventory-20260928

</details>

## 2026-09-28　年龄性别辅助迁移对照完成

- 模型：Brain-JEPA、同窗口FC与随机表示
- 数据：SRPBS79训练内部
- 工作：以年龄和性别辅助任务检验冻结表示。
- 性能变化：性别AUC 0.5933，低于FC 0.6454（−5.21个百分点）；年龄MAE 13.45岁，也高于FC 9.79岁。
- 原论文 baseline：[Brain-JEPA，原文表1–3](https://arxiv.org/html/2409.19407)。主表报告ACC／F1／MSE／相关系数，未提供本项目疼痛AUC baseline。例如UKB性别ACC：从头训练82.60%，Brain-JEPA 88.17%。 原文涵盖UKB、HCP-Aging、ADNI和MACC等任务；准确率不能直接填入本项目AUC列，原文微调与本地冻结表示分开。
- 修改板块：冻结表示的辅助迁移评价

辅助任务结果不能当疼痛预测收益。

<details><summary>参数、完整记录与依据</summary>

原标题：年龄性别辅助迁移对照完成

原摘要：原79人训练内部辅助比较：Brain-JEPA年龄误差13.45岁，同窗口FC为9.79岁、训练均值为13.54岁；性别AUC为0.5933，同窗口FC为0.6454。官方表示优于三个随机表示的均值，但两个任务均未超过FC。

原结果：原79人训练内部辅助比较：Brain-JEPA年龄误差13.45岁，同窗口FC为9.79岁、训练均值为13.54岁；性别AUC为0.5933，同窗口FC为0.6454。官方表示优于三个随机表示的均值，但两个任务均未超过FC。

具体方法：原79训练内部9任务，5表示，年龄/性别，810头与108指标行独立复核。

限制：这是年龄和性别辅助任务，不是新增疼痛AUC。九个训练内部评价组互相重叠，来自已反复使用的开发数据；不能作为独立临床验证或证明差异的因果来源。

下一步：停止扩展当前冻结Brain-JEPA配置。下一轮先核查现有资料中是否有同人结构量化表或真实临床叙述，为结构分支或医疗模型提供新输入；如没有则明确数据缺口，不生成伪特征，不继续扫描旧表示。疼痛主线仍需同终点、训练内部选择和独立队列证据。

依据：representation-controls-20260928

</details>

## 2026-09-28　NeuFoM公开实现与现成模型核对完成

- 模型：NeuFoM公开实现
- 数据：公开代码与合成数据
- 工作：检查训练／测试隔离和标准化实现。
- 性能变化：发现可能混入测试数据；未将相关高分计为可靠AUC提升。
- 原论文 baseline：[NeuFoM作者公开实现](https://github.com/Shef-AIRE/NeuFoM)。对应完整正式论文及原文AUC baseline尚未核定；保留缺项。 本项目该条为代码核查，未训练患者模型；代码中的验证问题不用于反推原论文的实际分数。
- 修改板块：数据泄漏与实现审查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：NeuFoM公开实现与现成模型核对完成

原摘要：NeuFoM公开代码的合成复核发现：20个内层拟合中12个会混入外层测试行，最多16行；结构标准化也会受测试行影响。不能原样运行并把高分当成可靠增益。

原结果：NeuFoM公开代码的合成复核发现：20个内层拟合中12个会混入外层测试行，最多16行；结构标准化也会受测试行影响。不能原样运行并把高分当成可靠增益。

具体方法：固定作者Git版本，实际执行合成索引/标准化/矩阵与优化循环；患者使用0。

限制：本轮患者使用和患者训练均为0；结论针对固定版本公开代码，不推断论文实际实现。NeuFoM仍依赖冻结BrainLM，新增45项结构特征；尚未取得可直接用于本任务的完整疼痛模型。

下一步：下一步先用已有年龄、性别作辅助迁移对照，检查已核验表示能否保留这些信息，区分普遍适配失败与疼痛任务信息不足；只用原79训练内部数据，不计作疼痛成绩。NeuFoM结构分支需先有同人结构表；fMRI-LM待核实真实权重入口，不重复既有TabPFN/FMM实验。

依据：neufom-audit-20260928

</details>

## 2026-09-28　RPN少样本校准完成，两个中心方向不同

- 模型：RPN冻结模型＋少标签偏移校准
- 数据：Szeged、Essen作者验证样例
- 工作：使用5人支持标签调整预测偏移。
- 性能变化：使用MSE：Szeged 0.4416→0.2082改善；Essen 0.5355→0.6247变差，未一致受益。
- 修改板块：小样本输出校准

保留两中心相反方向；MSE不转换为AUC。

<details><summary>参数、完整记录与依据</summary>

原标题：RPN少样本校准完成，两个中心方向不同

原摘要：5人支持标签校准后，Szeged的期望MSE由0.4416降至0.2082，Essen却由0.5355升至0.6247；统一偏移校准没有同时改善两个中心，按事前规则停止推广。

原结果：5人支持标签校准后，Szeged的期望MSE由0.4416降至0.2082，Essen却由0.5355升至0.6247；统一偏移校准没有同时改善两个中心，按事前规则停止推广。

具体方法：固定作者模型；两个中心各500排列，1/5/10支持者；四个对照，独立公式与组合枚举复算。

限制：这是作者已查阅样例上的传统模型方法开发。MSE为已观察队列随机选支持者后的平均平方误差，越低越好；不是新增独立临床验证，也不是深度学习增益。固定偏移不改变同一中心内的预测排序。

下一步：收束RPN统一偏移校准辅助实验，不根据本轮query结果继续挑中心、校准强度或窗口。下一轮回到疼痛任务与输入匹配：核对同病种、同终点数据及现成模型，明确一个新假设后再做训练内部比较，保留同输入、随机表示、强ML和跨站点证据要求。

依据：rpn-calibration-20260928

</details>

## 2026-09-26　疼痛任务候选RPN作者模型复现完成

- 模型：RPN作者冻结模型
- 数据：作者56个原验证样例
- 工作：复算已发布模型预测并核对目标的评价尺度。
- 性能变化：19人中心原尺度MSE 0.4416，目标去均值后0.1726；差异来自评价口径，不能算模型提升。
- 修改板块：原模型复算与目标尺度

不是新增独立验证；回归不报告AUC。

<details><summary>参数、完整记录与依据</summary>

原标题：疼痛任务候选RPN作者模型复现完成

原摘要：RPN作者模型与56个原验证样例的保存预测一致，最大差1.11e−16。19人中心原尺度MSE0.4416，按作者脚本将目标去均值后0.1726；这是评价口径差异，不是模型提升。

原结果：RPN作者模型与56个原验证样例的保存预测一致，最大差1.11e−16。19人中心原尺度MSE0.4416，按作者脚本将目标去均值后0.1726；这是评价口径差异，不是模型提升。

具体方法：固定作者权重；全部91人公式核对、56作者保存预测重放和三例时序连接核对；没有新患者训练。

限制：RPN是传统机器学习，预测实验QST痛觉敏感性；作者样例复现不是本项目新增独立临床验证。现有419/450区输入不能直接接入，未产生本地患者新预测。

下一步：下一步仅在作者公开任务限定一次1/5/10个支持标签的偏移校准对照，参数只由支持者拟合，评价剩余者；这是已查阅数据上的方法开发。RPN本地接入仍待图谱/灰质流程与真实QST适用性核对。DL主线继续要求同输入、随机表示、强ML与跨站点证据。

依据：pain-task-audit-20260926

</details>

## 2026-09-26　Brain-JEPA时间输入适配与源内比较完成

- 模型：Brain-JEPA、同输入FC、随机编码器
- 数据：SRPBS79训练内部，每类5标签
- 工作：适配作者时序采样规则后重做冻结表示比较。
- 性能变化：Brain-JEPA AUC 0.4517→0.4501（−0.16个百分点）；同输入FC 0.5610，未改善。
- 原论文 baseline：[Brain-JEPA，原文表1–3](https://arxiv.org/html/2409.19407)。主表报告ACC／F1／MSE／相关系数，未提供本项目疼痛AUC baseline。例如UKB性别ACC：从头训练82.60%，Brain-JEPA 88.17%。 原文涵盖UKB、HCP-Aging、ADNI和MACC等任务；准确率不能直接填入本项目AUC列，原文微调与本地冻结表示分开。
- 修改板块：时序输入适配

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Brain-JEPA时间输入适配与源内比较完成

原摘要：按作者采样时间适配后，原79训练内部每类5人时Brain-JEPA平均AUC 0.4501（旧配置0.4517），同输入FC 0.5610，三个随机模型均值0.4890。未达到事先约定的继续条件，停止当前配置的外层评价扩展。

原结果：按作者采样时间适配后，原79训练内部每类5人时Brain-JEPA平均AUC 0.4501（旧配置0.4517），同输入FC 0.5610，三个随机模型均值0.4890。未达到事先约定的继续条件，停止当前配置的外层评价扩展。

具体方法：五表示相同450区160帧，全支持训练内选择、固定少样本支持；810拟合及450最终头重拟合。

限制：结果来自互有重叠、已反复使用的源训练组，不能作为独立泛化或显著性证据。复用99人450区输入；18人有分析掩膜零交集细分区，原QC不变。

下一步：停止继续扫描这个冻结编码器的时间窗口与归一化；下一步回到同疼痛任务的来源和训练目标，先核对原始论文与可复用材料，再限定一个有依据的新方案。

依据：jepa-timegrid-20260926

</details>

## 2026-09-25　Brain-JEPA全99输入与源内少样本比较完成

- 模型：Brain-JEPA、同输入FC、随机编码器
- 数据：SRPBS99输入；原79人训练内部每类5标签
- 工作：完成官方冻结表示与强FC、随机表示的少标签比较。
- 性能变化：Brain-JEPA AUC 0.4517；FC 0.5747、随机均值0.4363，未超过FC。
- 原论文 baseline：[Brain-JEPA，原文表1–3](https://arxiv.org/html/2409.19407)。主表报告ACC／F1／MSE／相关系数，未提供本项目疼痛AUC baseline。例如UKB性别ACC：从头训练82.60%，Brain-JEPA 88.17%。 原文涵盖UKB、HCP-Aging、ADNI和MACC等任务；准确率不能直接填入本项目AUC列，原文微调与本地冻结表示分开。
- 修改板块：冻结预训练表示与小样本分类

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Brain-JEPA全99输入与源内少样本比较完成

原摘要：原79人训练内部，每类5人时Brain-JEPA平均AUC 0.4517，同输入FC 0.5747，三个随机模型均值0.4363。未达到事先约定的继续条件，停止当前配置的外层评价扩展。

原结果：原79人训练内部，每类5人时Brain-JEPA平均AUC 0.4517，同输入FC 0.5747，三个随机模型均值0.4363。未达到事先约定的继续条件，停止当前配置的外层评价扩展。

具体方法：五表示相同450区160帧，全支持训练内选择、固定少样本支持；810拟合及450最终头重拟合。

限制：结果来自互有重叠、已反复使用的源训练组，不能作为独立泛化或显著性证据。99人均完成450区输入；18人有分析掩膜零交集细分区，原QC不变。

下一步：下一步重点检查输入域差异、覆盖/头动混杂及表示所保留的信息；只根据无标签诊断与源训练内部证据提出一个新假设，不继续当前配置的外query搜索。

依据：jepa-source-study-20260925

</details>

## 2026-09-25　Brain-JEPA首例真实输入及完整推理核验完成

- 模型：Brain-JEPA
- 数据：SRPBS开发集1例真实输入
- 工作：接入真实脑区时序并核对完整网络输出。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[Brain-JEPA，原文表1–3](https://arxiv.org/html/2409.19407)。主表报告ACC／F1／MSE／相关系数，未提供本项目疼痛AUC baseline。例如UKB性别ACC：从头训练82.60%，Brain-JEPA 88.17%。 原文涵盖UKB、HCP-Aging、ADNI和MACC等任务；准确率不能直接填入本项目AUC列，原文微调与本地冻结表示分开。
- 修改板块：预训练输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Brain-JEPA首例真实输入及完整推理核验完成

原摘要：Brain-JEPA已接入1例真实开发数据：450区均有有效时序，得到768维表示；完整网络独立公式误差3.16e-06。本轮没有分类拟合或新AUC。

原结果：Brain-JEPA已接入1例真实开发数据：450区均有有效时序，得到768维表示；完整网络独立公式误差3.16e-06。本轮没有分类拟合或新AUC。

具体方法：450区独立提取、原AAL重提、覆盖检查和官方编码器完整公式复算。

限制：一例技术接入不能代表全99人或精度改善。部分颞极区域分析掩膜交集偏低，最低17.4%；原QC与审核意见不变。

下一步：下一步复用首例，完成原99人450区无标签覆盖核对；在原79的训练内部，用相同中心160帧比较FC、随机编码器与官方预训练表示，再按内部证据决定是否进入后续评价。

依据：jepa-real-pilot-20260925

</details>

## 2026-09-25　Brain-JEPA官方编码器接入与完整公式复核完成

- 模型：Brain-JEPA
- 数据：合成脑区时序
- 工作：严格加载官方权重，独立检查完整网络计算。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[Brain-JEPA，原文表1–3](https://arxiv.org/html/2409.19407)。主表报告ACC／F1／MSE／相关系数，未提供本项目疼痛AUC baseline。例如UKB性别ACC：从头训练82.60%，Brain-JEPA 88.17%。 原文涵盖UKB、HCP-Aging、ADNI和MACC等任务；准确率不能直接填入本项目AUC列，原文微调与本地冻结表示分开。
- 修改板块：预训练输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Brain-JEPA官方编码器接入与完整公式复核完成

原摘要：Brain-JEPA官方权重已取得并严格加载，完整450×160合成输入得到768维表示，与独立注意力公式复算最大差3.58e-06。模型技术接入完成，尚无患者预测或新AUC。

原结果：Brain-JEPA官方权重已取得并严格加载，完整450×160合成输入得到768维表示，与独立注意力公式复算最大差3.58e-06。模型技术接入完成，尚无患者预测或新AUC。

具体方法：官方target_encoder严格加载、完整4500 token合成推理与独立分块注意力公式核对。

限制：本轮只用合成信号验证完整编码器。450区名称顺序已核对；固定MNI图谱、时间采样和本地预处理差异仍须在一例真实输入上检查。

下一步：下一步分别提取Tian50与Schaefer400的一例无标签时序，核对覆盖与旧AAL重提；采用事先明确的时间与整段标准化策略，再进入源训练内同输入FC、随机和预训练比较。

依据：jepa-model-ready-20260925

</details>

## 2026-09-25　Brain-JEPA输入审查：短时序直接采样会重复末帧

- 模型：Brain-JEPA
- 数据：合成帧编号与短时序
- 工作：检查作者默认采样器，发现末帧重复，需要适配。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[Brain-JEPA，原文表1–3](https://arxiv.org/html/2409.19407)。主表报告ACC／F1／MSE／相关系数，未提供本项目疼痛AUC baseline。例如UKB性别ACC：从头训练82.60%，Brain-JEPA 88.17%。 原文涵盖UKB、HCP-Aging、ADNI和MACC等任务；准确率不能直接填入本项目AUC列，原文微调与本地冻结表示分开。
- 修改板块：预训练输入与模型接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Brain-JEPA输入审查：短时序直接采样会重复末帧

原摘要：Brain-JEPA输入检查发现：直接套用作者默认采样器，240/300帧在起点为0时分别只保留81/101个不同帧。保留为待适配候选，尚未运行预训练权重或生成疼痛AUC。

原结果：Brain-JEPA输入检查发现：直接套用作者默认采样器，240/300帧在起点为0时分别只保留81/101个不同帧。保留为待适配候选，尚未运行预训练权重或生成疼痛AUC。

具体方法：运行官方采样/切块/位置/普通注意力，独立公式核对；无权重、无患者评分。

限制：本轮使用合成输入检查作者代码；没有新增患者评分、450区提取或训练纳入。原53人用户批量确认的依据不变，不升级为逐人专家阅片。

下一步：先补齐Brain-JEPA官方权重、450区逐行对应、时间采样与归一化依据，做一例无标签输入核对；具备条件后再作同输入FC、随机编码和固定预训练表示的训练内部比较。

依据：pretraining-input-audit-20260925

</details>

## 2026-09-25　小样本分类头复核完成：L2原型未一致改善

- 模型：Meta-matching表示＋Logistic／L2原型
- 数据：源训练内部，每类5标签
- 工作：在相同表示条件下比较分类头。
- 性能变化：AUC 0.6353→0.6185，降低1.68个百分点；多数训练组方向为负。
- 原论文 baseline：[Meta-matching，Nature Neuroscience 2022](https://www.nature.com/articles/s41593-022-01059-9)。原文将大队列表型预测器迁移到少样本新表型，主要评价预测相关与误差；没有SRPBS／Emo疼痛诊断的同条件AUC baseline。 本项目DNN67＋FC分类及来源借用的AUC以本地同人员对照解释，原文100-shot等表型条件另列。
- 修改板块：小样本分类头

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：小样本分类头复核完成：L2原型未一致改善

原摘要：源训练内部135个任务中，每类5人时DNN共同尺度LR平均AUC0.6353，中心化L2原型0.6185；三个训练组的差值有两组为负，按事先约定停止扩展该分类头。

原结果：源训练内部135个任务中，每类5人时DNN共同尺度LR平均AUC0.6353，中心化L2原型0.6185；三个训练组的差值有两组为负，按事先约定停止扩展该分类头。

具体方法：135个原训练侧任务，7表示×3分类头；945 LR独立重拟合、1890原型距离公式核对。

限制：仅原79人开发数据的训练内部比较，训练组互有重叠；不是新外部或临床验证。每个外折的query未用于该折此次比较，原20人和Emo未新增评分；不把任务数当人数。

下一步：收束当前67维表示上的分类头扩展。下一轮核对可复用模型的预训练目标、输入与疼痛任务匹配程度，再决定是否引入一个有依据的新表示或优先补同任务数据；不在旧query继续挑头、种子或阈值。

依据：fewshot-geometry-20260925

</details>

## 2026-09-25　Emo合并源外推完成：增加来源未显示增益

- 模型：切空间FC＋Logistic
- 数据：Emo53测试；来源SRPBS99、ZAN54或合并153人
- 工作：保持目标队列不变，只比较来源选择。
- 性能变化：合并源AUC 0.6211，比SRPBS单源0.6453低2.42个百分点；差值区间跨0。
- 原论文 baseline：[Emo底层队列的纤维肌痛原研究](https://pubmed.ncbi.nlm.nih.gov/39522892/)。原研究33名患者＋33名对照，诊断AUC约0.65。 当前Emo53的纳入、处理与模型评价不同；该值作为数据集原研究参照，不能当成本批模型消融的baseline。
- 修改板块：训练来源组合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Emo合并源外推完成：增加来源未显示增益

原摘要：同一53名Emo目标上，SRPBS99源切空间AUC0.6453，ZAN54源0.4772，合并153源0.6211；合并相对SRPBS差值−0.0242，条件95%区间[−0.1097,+0.0641]，未显示可靠改善。

原结果：同一53名Emo目标上，SRPBS99源切空间AUC0.6453，ZAN54源0.4772，合并153源0.6211；合并相对SRPBS差值−0.0242，条件95%区间[−0.1097,+0.0641]，未显示可靠改善。

具体方法：12份预先拟合模型；同一53目标、目标拟合0，公式和统计独立复核。

限制：53人依据用户授权批量确认，未逐人专家阅片；目标拟合0人。异质Pain/ZAN到FM的跨队列探索，不能称同病种临床确认；既往开发与本次目标已有多轮查看。

下一步：停止把扩大异质来源或当前FMM结构作为默认改进方向。下一轮先审查源侧证据能否支持一个明确的小样本适配假设；若继续使用Emo，应明确转为开发研究，并另找同任务新队列检验。不得用本轮目标成绩重选模型、阈值或来源。

依据：pooled-external-results-20260925

</details>

## 2026-09-25　Emo53人用户确认与固定79源外推完成

- 模型：AAL切空间、Meta-matching与等权融合
- 数据：Emo53测试；固定SRPBS79来源模型
- 工作：将已有来源模型外推到同一目标人员。
- 性能变化：FC AUC 0.6923，Meta 0.4943，融合0.6054；融合比FC低8.69个百分点，未改善。
- 原论文 baseline：[Meta-matching，Nature Neuroscience 2022](https://www.nature.com/articles/s41593-022-01059-9)。原文将大队列表型预测器迁移到少样本新表型，主要评价预测相关与误差；没有SRPBS／Emo疼痛诊断的同条件AUC baseline。 本项目DNN67＋FC分类及来源借用的AUC以本地同人员对照解释，原文100-shot等表型条件另列。
- 原论文 baseline：[Emo底层队列的纤维肌痛原研究](https://pubmed.ncbi.nlm.nih.gov/39522892/)。原研究33名患者＋33名对照，诊断AUC约0.65。 当前Emo53的纳入、处理与模型评价不同；该值作为数据集原研究参照，不能当成本批模型消融的baseline。
- 修改板块：跨队列表示融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：Emo53人用户确认与固定79源外推完成

原摘要：Emo27患者、26对照共53人经用户授权批量确认。固定79人源模型外推AUC：AAL切空间0.6923、预训练DNN0.4943、等权融合0.6054；未见预训练增益。

原结果：AAL AUC0.6923、DNN0.4943、融合0.6054；融合差值−0.0869，条件区间[−0.1852,0.0000]。

具体方法：53人数值输入独立核验、用户授权批量确认；仅应用原79人源模型，目标拟合0人，三方法重放与统计独立复核通过。

限制：用户授权批量确认已登记，未逐人专家阅片；13名原QC失败者保持排除，覆盖缺口保留。目标53人用于评价、用于训练0人；异质Pain到FM的探索不等于临床确认。

下一步：保留本次固定外推的阴性结果，不在Emo重新挑结构、参数、种子或阈值。另一153人合并源方案仍按独立预登记比较；后续新方法需新的输入或来源训练内证据支持。

依据：emo-intake-20260925

</details>

## 2026-09-25　PRT一阶对比图整理完成：2254张真实影像

- 模型：未新增预测模型
- 数据：PRT／慢性背痛原192人
- 工作：整理真实一阶任务对比影像，准备后续影像增量比较。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[PRT慢性背痛原研究](https://doi.org/10.1002/ana.78183)。原文神经特征分类AUC约0.64，行为特征约0.76；加入神经信息未改善分类。 本项目复用192人的衍生任务特征，输入组合、正则和划分不同；这些原值不用于单个改动的净增益计算。
- 修改板块：任务影像资料准备

2254张图不等于2254名患者；人数仍为原192人。

<details><summary>参数、完整记录与依据</summary>

原标题：PRT一阶对比图整理完成：2254张真实影像

原摘要：已整理2254张真实一阶对比图，覆盖202个编号、322次访视；193人有基线、129人有随访，其中120人两次都有。原192人（141患者、51对照）的基线四条件全部匹配。此前4508是含macOS附属文件的后缀计数，不能作为影像或人数。

原结果：真实影像2254张；原192人四条件完整，新增训练纳入0。

具体方法：保留原ZIP，识别并排除2254个AppleDouble资源文件；完整读取2254张三维图，核对形状、仿射、有限值及访视内覆盖。按作者代码将前四张映射为压力低/高、声音低/高，后3张不猜条件。

限制：这是文件与空间信息检查，不是原始时序预处理或临床验证。全部图含缺失体素，未填零；头动资料、同期临床疼痛评分和正式影像审核仍缺，新增训练纳入0。诊断组别不能替代扫描时痛/不痛。

下一步：PRT下一步补齐精确ROI/模式定义及临床、头动和刺激记录，再核对特征提取；额外1个基线编号不自动并入原192人。暂不扩大模型搜索，Emo外推保持各自原方案。

依据：prt-images-20260925

</details>

## 2026-09-25　FMM连接分支79人开发比较与独立重训完成

- 模型：FMM：ResNet连接分支＋BrainLM时序分支
- 数据：SRPBS79
- 工作：比较仅连接输入与加入预训练时序的组合。
- 性能变化：加入预训练时序后AUC降低3.47个百分点，条件区间跨0；相对强AAL参照低21.62个百分点。
- 原论文 baseline：[FMM，MICCAI 2025表3](https://papers.miccai.org/miccai-2025/paper/1399_paper.pdf)。公开OA药物反应：无预训练FMM基线 AUC 0.6067±0.2543，完整FMM 0.7756±0.2698，仅FC 0.5511±0.2958；院内队列分别为0.7143±0.2129、0.7520±0.2614、0.6896±0.1174。 公开数据56名患者、院内61人，五折药物反应预测，±为折间标准差；SRPBS患者／健康分类、512维本地适配与原文256维输入分别记录。
- 原论文 baseline：[BrainLM，ICLR 2024原文](https://proceedings.iclr.cc/paper_files/paper/2024/file/029ce70401321de3808b3ac39e1ab167-Paper-Conference.pdf)。原文未给SRPBS79／99疼痛诊断的AUC baseline。年龄、心理量表和脑活动预测使用各自指标，原文主要数值不能换算为本项目AUC。 FMM论文中的BrainLM药物反应分支是另一篇论文的评估；本地公开512维权重与候选256维检查点也分别记录。
- 修改板块：FC与时序分支融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：FMM连接分支79人开发比较与独立重训完成

原摘要：原79人开发比较：仅连接分支AUC 0.5360，加入预训练表示0.5013，随机表示对照0.5174；原AAL90切空间参照0.7175。本次适配没有改善开发表现，预训练组合接近随机排序。

原结果：预训练组合相对仅连接分支ΔAUC -0.0347，条件95%区间[-0.1667,+0.0991]；相对AAL参照ΔAUC -0.2162，区间[-0.3559,-0.0759]。

具体方法：原三折外层及各自三折内层，20/50轮只由训练内平均AUC选择，阈值固定0.5。27个内层拟合和9个最终模型；全部9个最终模型另写优化循环重训复核，27份内层选轮次记录另算AUC核对。

限制：单种子、反复使用的79人开发数据；AAL参照的脑区划分不同。采用公开512维权重和固定裁剪，是FMM启发适配；未新增外部验证、视觉批准或训练纳入。

下一步：暂不扩大当前FMM结构或在旧query上搜索。下一轮先收取并核对已结束的Emo批次产物、覆盖及标签，保留正式影像审核要求；满足原纳入条件后，按已登记的固定源模型方案检验外推。只有新的输入或训练内证据支持预训练增量，才启动新的1/5/10-shot结构比较。

依据：fmm-results-20260925

</details>

## 2026-09-24　PRT声音/压力与脑影像增量比较完成

- 模型：Logistic分类
- 数据：PRT192人
- 工作：比较评分／人口学、脑区响应及联合输入。
- 性能变化：评分／人口学AUC约0.735，加入脑影像约0.719，下降约1.6个百分点，未见稳定增量。
- 原论文 baseline：[PRT慢性背痛原研究](https://doi.org/10.1002/ana.78183)。原文神经特征分类AUC约0.64，行为特征约0.76；加入神经信息未改善分类。 本项目复用192人的衍生任务特征，输入组合、正则和划分不同；这些原值不用于单个改动的净增益计算。
- 修改板块：临床与影像模态融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：PRT声音/压力与脑影像增量比较完成

原摘要：原192人、原划分下：声音ROI AUC 0.637，压力ROI 0.504。不愉快度评分＋人口学AUC 0.735，加入脑影像后0.719；ΔAUC −0.0155，条件95%区间[−0.0590,+0.0279]，没有稳定增量。

原结果：评分/人口学AUC 0.735；加入脑影像0.719，未见稳定增量。

具体方法：复用192人及上一轮全部五次五折；内层三折、相同四个C、训练内标准化、平衡L2 Logistic及0.5阈值。新增100外层/1200内层拟合均已重跑复核；既有44维ROI预测直接复用。配对区间固定预测，不含完整训练不确定性。

限制：同一开发队列的补充比较，不能判断扫描时是否疼痛，也不能证明声音反应对疼痛特异。论文有一阶头动回归，但现有表缺逐人头动和实际刺激剂量，混杂没有排除；不愉快度评分不是背痛强度。

下一步：PRT暂不扩大模型搜索。先取得可连接的逐人头动、刺激记录及真实临床疼痛评分；若继续声音路线，需要同任务独立队列检验特异性。Emo外推维持原方案。

依据：prt-modality-20260924

</details>

## 2026-09-24　PRT现有192人任务特征分类完成

- 模型：Logistic分类
- 数据：PRT192人
- 工作：用作者公开任务脑区响应区分患者与健康对照。
- 性能变化：脑区响应AUC约0.633，主要组合约0.609；本条未建立明确独立模块增益。
- 原论文 baseline：[PRT慢性背痛原研究](https://doi.org/10.1002/ana.78183)。原文神经特征分类AUC约0.64，行为特征约0.76；加入神经信息未改善分类。 本项目复用192人的衍生任务特征，输入组合、正则和划分不同；这些原值不用于单个改动的净增益计算。
- 修改板块：任务响应分类

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：PRT现有192人任务特征分类完成

原摘要：已有PRT表格包含141名慢性背痛患者、51名健康对照。按人嵌套验证，脑区响应AUC 0.633，加入年龄/性别后0.609，固定图谱响应0.602。可开展单独分类研究，当前区分能力有限。

原结果：脑区响应AUC 0.633；主要组合0.609，区分能力有限。

具体方法：192人各一行；5次5折外层、3折内层，训练折拟合标准化及C=0.001/0.01/0.1/1；平衡L2 Logistic、阈值0.5。100外层与1200内层拟合在另一进程重现，另做99次完整流程标签置换诊断。

限制：终点是慢性背痛患者/健康对照分组，不能判断扫描当时是否疼痛。作者衍生任务特征未重做原始影像QC；不能直接并入AAL90静息态，也不是独立临床验证。人口学AUC 0.375，不据此夸大脑影像增益。

下一步：PRT先补头动、刺激强度及原始特征来源核对，再决定限定的声音/压力比较；缺少pain_avg仍不能做背痛程度回归。Emo外推继续原方案。

依据：prt-classification-20260924

</details>

## 2026-09-24　FMM输入与合成程序核验，修订小样本路线

- 模型：FMM
- 数据：SRPBS候选输入与合成数据
- 工作：核对FC和时序输入，以及模型训练代码。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：[FMM，MICCAI 2025表3](https://papers.miccai.org/miccai-2025/paper/1399_paper.pdf)。公开OA药物反应：无预训练FMM基线 AUC 0.6067±0.2543，完整FMM 0.7756±0.2698，仅FC 0.5511±0.2958；院内队列分别为0.7143±0.2129、0.7520±0.2614、0.6896±0.1174。 公开数据56名患者、院内61人，五折药物反应预测，±为折间标准差；SRPBS患者／健康分类、512维本地适配与原文256维输入分别记录。
- 修改板块：双分支输入与代码接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：FMM输入与合成程序核验，修订小样本路线

原摘要：FMM连接分支的79人输入与合成数据程序自检完成；患者训练尚未开始，无新增AUC。

原结果：患者监督拟合0；输入独立重算差2.98e−8，合成两批优化独立复核差0。

具体方法：既有79人输入、固定窗口、ResNet18＋512维冻结表示的适配；无新患者训练。

限制：原79人仍为开发数据；512维公开权重与原论文256维不同，覆盖限制及原QC/审核/划分保持，研究定期任务仍关闭。

下一步：先完成既有队列与产物核对，再实施有限FMM连接分支对照；不重复既有选边/PCA/CPM或冻结线性融合，不用Emo选本轮模型。

依据：fmm-preparation-20260924

</details>

## 2026-09-24　合并源模型已准备，Emo对照继续处理

- 模型：切空间FC＋Logistic
- 数据：SRPBS99、ZAN54来源；Emo目标输入准备
- 工作：完成合并来源模型核对，继续准备目标数据。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：来源训练与目标输入准备

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：合并源模型已准备，Emo对照继续处理

原摘要：仅用原153人拟合的12份源模型及720次内层拟合已复核。Emo健康对照33人的66份原始文件已完整读回；其余32人顺序队列已启动，截至本次快照完成1/32（1人删帧比例超标，保留未通过）。目标分类尚未执行。

原结果：源模型复核完成；目标分类未执行。

具体方法：仅源数据5次3折选参、12份模型独立重拟合；目标预处理沿用原QC。

限制：患者与对照诊断分组不等于扫描当时疼痛。数值通过仍需影像审核和纳入确认；Emo尚未加入训练或产生新AUC，其他研究自动化保持原状态。

下一步：完成Emo对照预处理、同等QC和影像审核后，在同一批获准受试者上比较合并源与单来源模型；Emo在这一步全部留作目标测试。

依据：pooled-external-prep-20260924

</details>

## 2026-09-24　预训练有限实验归档与Emo输入复核

- 模型：Meta-matching、切空间FC与融合分类
- 数据：SRPBS79；Emo输入核查另列
- 工作：归档预训练分类结果并复核Emo输入。
- 性能变化：FC AUC 0.7175、Meta 0.5978、融合0.7149；融合比FC低0.26个百分点。
- 原论文 baseline：[Meta-matching，Nature Neuroscience 2022](https://www.nature.com/articles/s41593-022-01059-9)。原文将大队列表型预测器迁移到少样本新表型，主要评价预测相关与误差；没有SRPBS／Emo疼痛诊断的同条件AUC baseline。 本项目DNN67＋FC分类及来源借用的AUC以本地同人员对照解释，原文100-shot等表型条件另列。
- 原论文 baseline：[Emo底层队列的纤维肌痛原研究](https://pubmed.ncbi.nlm.nih.gov/39522892/)。原研究33名患者＋33名对照，诊断AUC约0.65。 当前Emo53的纳入、处理与模型评价不同；该值作为数据集原研究参照，不能当成本批模型消融的baseline。
- 修改板块：预训练表示融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：预训练有限实验归档与Emo输入复核

原摘要：预训练模型已完成开发、少样本和双向站点比较，尚无稳定整体增量；独立队列的输入复核继续推进，尚未生成外部分类成绩。

原结果：79人开发AUC：原方法0.7175，DNN67为0.5978，融合0.7149；无稳定整体增量。Emo患者27人数值通过，仍待完整审核。

具体方法：同划分有限比较、支持者内尺度、双向站点、五随机种子与固定128维；首例冻结编码另用独立公式核验。

限制：79人是反复使用的开发样本；原20人本轮未评分。Emo数值QC通过不等于视觉批准或训练纳入，患者诊断也不等于扫描当时正在疼痛。

下一步：复用正在运行的32名健康对照处理队列；完成后核对共同QC、覆盖、人工审核与标签，再执行原79人源模型的固定跨队列比较。暂不按旧query分数增加模型或参数搜索。

依据：pretrained-pain-20260924

</details>

## 2026-09-23　153人合并监督疼痛分类验证完成

- 模型：切空间FC＋Logistic
- 数据：SRPBS99、ZAN54，合并来源153人
- 工作：比较各队列单独训练与合并监督训练。
- 性能变化：SRPBS 0.7525→0.7727（+2.02个百分点）；ZAN 0.3735→0.4775（+10.40个百分点），仍未形成稳定跨队列收益。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：监督训练来源组合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：153人合并监督疼痛分类验证完成

原摘要：合并后两队列的内部AUC点估计上升，但差值区间均跨零，尚无稳定改善证据；ZAN仍接近随机，整队列留出也未支持通用疼痛识别。

原结果：SRPBS AUC 0.7525→0.7727；ZAN 0.3735→0.4775；跨队列 0.5832/0.5637。

具体方法：同一留出受试者比较单队列/合并训练；4方法、340最终模型、4080内层拟合独立核验。

限制：仅SRPBS99与ZAN54的开发性验证，153人均为既有受试者。患者/对照分组不等于扫描当时是否疼痛；7T/3T、TR、病种及人群差异保留，不是新的独立临床验证。

下一步：保留合并训练为后续候选；待其他队列完成原定QC、审核及标签核对后检验，优先独立队列，不按本批分数追加模型搜索。

依据：pooled-pain-20260923、pooled-pain-20260923-paired

</details>

## 2026-09-20　连接稳定性、解剖汇总与CPM完成

- 模型：FC稳定性特征、解剖汇总、CPM
- 数据：ZAN54与SRPBS开发队列；评分子集另计
- 工作：比较稳定连接与低维解剖／连接预测。
- 性能变化：连接稳定性有改善，分类和评分预测未见稳定整体收益。
- 修改板块：连接表示与特征汇总

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：连接稳定性、解剖汇总与CPM完成

原摘要：230个新预测头；分段稳定性提高，分类和评分预测没有稳定整体收益。

原结果：230个新预测头；分段稳定性提高，分类和评分预测没有稳定整体收益。

具体方法：同扫描前后半段诊断及训练折内选边，不称跨日重测。

限制：既有开发队列，未新增独立临床人数；不同VAS表不混合，未校正条件区间不能当临床有效性证明。

下一步：优先确认评分定义与同任务独立数据，保留原切空间及阴性结果。

依据：research-20260920-lowdim

</details>

## 2026-09-20　单一动态状态占比比较完成

- 模型：动态状态特征＋分类／回归
- 数据：ZAN54与SRPBS开发队列；评分子集另计
- 工作：以单一动态状态占比补充静态连接。
- 性能变化：跨站点和评分小子集的改善区间均跨0。
- 修改板块：动态连接状态

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：单一动态状态占比比较完成

原摘要：115个新预测头、460个状态模型；跨站点和小评分子集改善区间跨0。

原结果：115个新预测头、460个状态模型；跨站点和小评分子集改善区间跨0。

具体方法：100秒窗口、20秒步长、4状态，每人聚类总权重1，所有学习限定训练折。

限制：既有开发队列，未新增独立临床人数；不同VAS表不混合，未校正条件区间不能当临床有效性证明。

下一步：优先确认评分定义与同任务独立数据，保留原切空间及阴性结果。

依据：research-20260920-dynamic

</details>

## 2026-09-20　头动记录、临床字段与增量实验完成

- 模型：临床／头动与影像联合模型
- 数据：ZAN54与SRPBS开发队列；评分子集另计
- 工作：补齐头动、临床字段后检验影像增量。
- 性能变化：临床加入影像后未见可靠增量，未形成可确认的AUC提升。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：临床与影像增量

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：头动记录、临床字段与增量实验完成

原摘要：153人36504帧已核对；205个新预测头核验通过，临床+影像没有可靠增量。

原结果：153人36504帧已核对；205个新预测头核验通过，临床+影像没有可靠增量。

具体方法：保留原划分和QC，窗内去异常帧且至少保留80%，临床缺失值只由训练折填补。

限制：既有开发队列，未新增独立临床人数；不同VAS表不混合，未校正条件区间不能当临床有效性证明。

下一步：优先确认评分定义与同任务独立数据，保留原切空间及阴性结果。

依据：research-20260920-motion

</details>

## 2026-09-20　近期疼痛fMRI文献与研究瓶颈整理

- 模型：未新增预测模型
- 数据：11项疼痛fMRI研究文献
- 工作：整理低维、动态与临床头动线索，并对应后续实验。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：文献与研究安排

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：近期疼痛fMRI文献与研究瓶颈整理

原摘要：整理11项相关成果，后续低维、动态及头动临床三轮已执行。

原结果：整理11项相关成果，后续低维、动态及头动临床三轮已执行。

具体方法：定向梳理近一年研究，不是穷尽性系统综述。

限制：既有开发队列，未新增独立临床人数；不同VAS表不混合，未校正条件区间不能当临床有效性证明。

下一步：优先确认评分定义与同任务独立数据，保留原切空间及阴性结果。

依据：research-20260920-literature

</details>

## 2026-09-17　时序增强与两视图对比学习完成

- 模型：FC自编码器与两视图对比学习
- 数据：SRPBS来源及99／96人目标
- 工作：比较时序增强与匹配的两视图训练目标。
- 性能变化：12项匹配AUC差值区间全部跨0，未建立可靠改善。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：无标签预训练目标与增强

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：时序增强与两视图对比学习完成

原摘要：1230个新分类头；匹配两视图目标的12个AUC差区间全部跨0。

原结果：1230个新分类头；匹配两视图目标的12个AUC差区间全部跨0。

具体方法：3来源、3种子，固定增强和对比学习预算，原始参照复用。

限制：既有开发队列，未新增独立临床人数；不同VAS表不混合，未校正条件区间不能当临床有效性证明。

下一步：优先确认评分定义与同任务独立数据，保留原切空间及阴性结果。

依据：research-20260920-augmentation

</details>

## 2026-09-16　多来源迁移、时序增强与评分回归完成

- 模型：FC自编码器、神经分类头、Logistic／Ridge
- 数据：ZAN54与SRPBS开发队列；评分子集另计
- 工作：比较多来源迁移、时序增强与疼痛评分回归。
- 性能变化：切空间仍为参照，两个评分子集未稳定超过均值预测；无稳定整体收益。
- 修改板块：预训练来源与下游任务

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：多来源迁移、时序增强与评分回归完成

原摘要：1830个最终预测头；原切空间仍为参照，两表程度预测未稳定超过常量。

原结果：1830个最终预测头；原切空间仍为参照，两表程度预测未稳定超过常量。

具体方法：按真实受试者绑定增强视图，原99/96划分与双向站点保持不变。

限制：既有开发队列，未新增独立临床人数；不同VAS表不混合，未校正条件区间不能当临床有效性证明。

下一步：优先确认评分定义与同任务独立数据，保留原切空间及阴性结果。

依据：research-20260920-multisource

</details>

## 2026-09-16　ZAN54分类与来源迁移记录补齐

- 模型：FC自编码器＋分类头、切空间Logistic
- 数据：ZAN54与SRPBS开发队列；评分子集另计
- 工作：补齐来源迁移与ZAN分类结果。
- 性能变化：来源迁移未显示稳定整体收益；具体AUC按各实验条件阅读。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：来源迁移与分类训练

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：ZAN54分类与来源迁移记录补齐

原摘要：25ZAN/29HC已批准分类；ZAN作为来源也未带来稳定整体迁移收益。

原结果：25ZAN/29HC已批准分类；ZAN作为来源也未带来稳定整体迁移收益。

具体方法：队列与病种分开，来源人数不计入目标监督人数。

限制：既有开发队列，未新增独立临床人数；不同VAS表不混合，未校正条件区间不能当临床有效性证明。

下一步：优先确认评分定义与同任务独立数据，保留原切空间及阴性结果。

依据：research-20260920-zan、research-20260920-zan-source

</details>

## 2026-09-15　冻结BrainLM、随机对照与FC融合评估完成

- 模型：BrainLM冻结表示＋Logistic／FC融合
- 数据：SRPBS99；两站点留出另见备注
- 工作：检验预训练时序、随机时序及与强FC融合的收益。
- 性能变化：强FC AUC 0.7525，BrainLM单独0.4751，融合0.6920；预训练融合低于FC 6.05个百分点。
- 原论文 baseline：[BrainLM，ICLR 2024原文](https://proceedings.iclr.cc/paper_files/paper/2024/file/029ce70401321de3808b3ac39e1ab167-Paper-Conference.pdf)。原文未给SRPBS79／99疼痛诊断的AUC baseline。年龄、心理量表和脑活动预测使用各自指标，原文主要数值不能换算为本项目AUC。 FMM论文中的BrainLM药物反应分支是另一篇论文的评估；本地公开512维权重与候选256维检查点也分别记录。
- 修改板块：时序表示与FC融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：冻结BrainLM、随机对照与FC融合评估完成

原摘要：4种方案、240个最终分类模型；冻结BrainLM及FC融合没有稳定整体收益。

原结果：99人AUC：原切空间0.7525，冻结BrainLM0.4751，随机冻结0.4963，切空间加BrainLM0.6920，切空间加随机0.7152。240个模型独立回算通过。

具体方法：真实A424时序、3段固定200帧裁剪、逐人逐ROI标准化；冻结512维编码器，训练侧缩放和Logistic，2880次内层候选拟合。

限制：仅一种输入适配及一次随机初始化；未训练FMM_TC的ResNet18分支。A424小ROI仅1—3体素，数值就绪不等于视觉通过；不是新增临床验证。

下一步：先核对检查点输入约定与ROI支持，再决定完整FC分支是否值得评估；保留原切空间参考。

依据：paper-methods-20260915-STAGIN_BRAINLM_RESULTS_2026-09-15、paper-methods-20260915-paired_comparisons

</details>

## 2026-09-15　STAGIN训练完成：严格重训存在限制

- 模型：STAGIN
- 数据：SRPBS99／96及OSU↔CIN
- 工作：从头适配动态图网络，进行内部和跨站点分类。
- 性能变化：内部AUC 0.5479／0.5137；跨站点0.4806／0.5076，未显示可靠优势。
- 原论文 baseline：[STAGIN，原文表1](https://arxiv.org/html/2105.13495)。HCP-Rest：SERO版本 AUC 0.9296±0.0187，GARO版本0.9151±0.0258；静态GIN基线0.8955±0.0237。 1093人、性别分类、Schaefer400、五折交叉验证；与本项目疼痛、AAL90及训练预算分别解释。±为折间标准差。
- 修改板块：动态图与时空注意力

存在严格重训限制，训练拟合接近满分。

<details><summary>参数、完整记录与依据</summary>

原标题：STAGIN训练完成：严格重训存在限制

原摘要：120个最终模型训练完成；留出表现接近随机，严格重训仍不稳定。

原结果：训练内选择容量：99/96人AUC0.5479/0.5137，OSU→CIN/CIN→OSU为0.4806/0.5076。训练AUC接近1；保存检查点重放没有分类判定变化。

具体方法：作者128维4层与32维2层；19个动态窗口、训练折整批输入；60个评估单元，360次内层训练选择容量和15/30轮。

限制：严格重训未通过：完全匹配调用顺序的24次内层重训仍出现10个模型-样本判定变化。状态COMPLETE_WITH_REPRODUCIBILITY_LIMITATION；不能写成全面复现通过。

下一步：先解决训练可重现性，再考虑作者小批量与正则化对照；不凭训练集高分继续加轮数。

依据：paper-methods-20260915-STAGIN_BRAINLM_RESULTS_2026-09-15、paper-methods-20260915-aggregate_metrics

</details>

## 2026-09-15　图网络、时序与DCSTN适配训练完成

- 模型：GCN、时序网络、DCSTN、FC动态统计
- 数据：SRPBS99／96及OSU↔CIN
- 工作：在共同评估中比较图网络、时序与连接组合。
- 性能变化：最接近候选的内部AUC为0.7324／0.7221；99人增量区间跨0，EC分支无稳定收益。
- 原论文 baseline：[DCSTN，Knowledge-Based Systems原文表3–5](https://doi.org/10.1016/j.knosys.2024.112856)。主结果表报告ACC／SEN／SPE／F1；DCSTN在ABIDE的ACC为0.865±0.021，ADNI为0.786±0.027。ROC图的AUC未逐图核定，暂不填入AUC baseline。 这些表格数字是准确率；本地高斯TE、窗口及训练预算也经过适配，疼痛AUC按本地参照解释。
- 修改板块：图网络、时序与FC／EC融合

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：图网络、时序与DCSTN适配训练完成

原摘要：第一轮8种候选、480个最终模型；静态图、时序与动态连接适配均未超越原切空间。

原结果：最接近的新候选切空间加动态统计，99/96人AUC0.7324/0.7221，双向站点0.5964/0.6070；99人ΔAUC条件区间跨零。DCSTN的EC分支没有稳定增量。

具体方法：沿用按人划分与训练内选择；比较signed GCN、TCN、GCN-GRU、动态统计及高斯TE的DCSTN适配，原方法同划分对照。

限制：神经网络训练AUC很高而留出较低，存在过拟合；高斯滞后依赖不等于神经因果，适配不等于完整原论文复现。

下一步：优先核对动态输入与时间对齐，保留简单方法；不根据反复使用的外层结果不断追分。

依据：paper-methods-20260915-GRAPH_TEMPORAL_RESULTS_2026-09-15、paper-methods-20260915-MODEL_IMPLEMENTATION_GUIDE_2026-09-15

</details>

## 2026-09-15　训练侧年龄校正与外推评估完成

- 模型：切空间FC＋Logistic
- 数据：SRPBS99／96及OSU↔CIN
- 工作：仅在训练侧做年龄校正后评估外推。
- 性能变化：OSU→CIN AUC +2.75个百分点，反向−8.62个百分点；内部结果也下降，未一致改善。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：年龄混杂校正

正向AUC增加同时伴随敏感性下降，不能只报提高。

<details><summary>参数、完整记录与依据</summary>

原标题：训练侧年龄校正与外推评估完成

原摘要：120个最终校正模型核验通过，未获得稳定双向迁移改善。

原结果：OSU→CIN年龄校正AUC0.6078→0.6353，但灵敏度51.76%→35.29%；CIN→OSU AUC0.6129→0.5267。99/96人结果下降，年龄加头动/删帧亦无一致收益。

具体方法：各内外训练侧独立拟合切空间，OLS只用训练健康对照；两个限定候选、1440次内层拟合、全部测试人保留，独立核对年龄支持范围。

限制：固定预测配对区间不含重训或跨实验选择不确定性。协议与站点共线，详细协议表未核实；线性校正失败不证明年龄没有影响。

下一步：补齐详细采集协议、同病种与年龄共同支持信息，继续保留原切空间开发参考。

依据：age-correction-20260915-report

</details>

## 2026-09-15　站点与协变量诊断训练完成

- 模型：协变量Logistic与站点识别模型
- 数据：SRPBS99及OSU↔CIN
- 工作：比较年龄、性别、头动对疾病与站点识别的影响。
- 性能变化：年龄性别的疾病AUC为0.6390；跨站点0.4895／0.4713，加入头动未改善。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：混杂诊断与协变量参照

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：站点与协变量诊断训练完成

原摘要：145个诊断模型完成；站点识别AUC约0.986，提示强采集站点信号。

原结果：120个协变量疾病模型及25个站点识别模型完成。年龄性别疾病分类99人AUC0.6390，双向站点0.4895/0.4713；加入头动未改善。

具体方法：复用原60个疾病划分；站点识别采用训练站点×疾病四组等总权重。核对年龄、协议、头动及分类错误的描述性关联。

限制：0.986是站点识别而非疾病预测成绩；站点与协议贡献无法分离，描述性关联不能作为因果归因。

下一步：训练侧年龄校正随后完成，见同日节点；详细协议和新中心临床信息仍是关键缺口。

依据：connectivity-followup-20260915-docs-SITE_DIAGNOSIS_RESULTS_2026-09-15-md

</details>

## 2026-09-14　切空间连接第二轮训练与核验完成

- 模型：切空间FC＋Logistic
- 数据：SRPBS99／96及两站点
- 工作：比较特征中心化等训练侧处理。
- 性能变化：SRPBS99 AUC 0.7525→0.7383，下降1.42个百分点；平衡准确率虽升，区间仍跨0。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：FC特征标准化

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：切空间连接第二轮训练与核验完成

原摘要：240个最终模型；中心化、PCA与选边没有稳定整体优势。

原结果：99人仅中心化BA由68.66%到70.08%，AUC却由0.7525到0.7383；BA条件95%区间跨零。双向站点及96人结果不支持替换原切空间。

具体方法：保持原99/96人、5重复×5外折×3内折与C范围；4320次内层候选拟合，训练内阈值/选模复用预测，参考重拟合和概率回算通过。

限制：局部准确率上升不等于稳健增益；两个已有站点属于开发留出，固定预测区间不覆盖新中心不确定性。

下一步：继续站点混杂诊断和有限训练侧校正，不扩大同一测试集上的无界参数搜索。

依据：connectivity-followup-20260915-docs-CONNECTIVITY_REFINEMENT_RESULTS_2026-09-14-md

</details>

## 2026-09-13　切空间连接表示与TN覆盖诊断

- 模型：Pearson FC／切空间FC＋Logistic
- 数据：SRPBS99及TN输入核查
- 工作：用共同划分检验连接几何表示。
- 性能变化：SRPBS99相对Pearson强L2的AUC约增加10.8个百分点，条件区间[2.9,18.6]个百分点；跨站点改善未同时建立。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：连接几何表示

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：切空间连接表示与TN覆盖诊断

原摘要：切空间内部99/96人AUC约0.753/0.756；双向站点约0.608/0.613，泛化仍有限。

原结果：相对同折Pearson强L2，内部AUC提高；99人ΔAUC约+0.108，固定预测条件区间[+0.029,+0.186]。跨站点提升未同步建立。

具体方法：比较收缩FC、切空间和正负节点强度；全部训练侧拟合参考与缩放，沿用既有嵌套划分及双向站点留出。

限制：99/96人高度重叠且均已用于开发，不能作为独立临床验证；不能复用旧方法的置换p值或宣布TN/PHN目标达成。

下一步：切空间成为后续开发参照；第二轮连接候选及站点诊断见9月14—15日节点。

依据：connectivity-improvement

</details>

## 2026-09-13　顺序训练改进与来源学习曲线

- 模型：FC自编码器＋分类头
- 数据：来源10／25／50人；SRPBS目标
- 工作：比较训练充分性、正则化和来源人数变化。
- 性能变化：局部变化的配对区间跨0，来源扩大未出现稳定单调收益。
- 修改板块：训练策略与预训练来源规模

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：顺序训练改进与来源学习曲线

原摘要：标签、训练预算、分类头、正则降维、来源规模及临床就绪核查完成；没有稳定扩量或加轮数收益。

原结果：100轮相对30轮仅有局部小幅变化，配对区间跨零；强L2保留为简洁候选。来源10/25/50人、3种子共15个编码器，没有稳定单调收益。

具体方法：保留99/96人及原内外折；依次执行限定预算、分类头与内部校准、正则/降维，以及同来源池的学习曲线。

限制：本地可执行阶段完成不等于临床目标完成；历史TN标签、PHN数据和新中心依赖外部输入。开发集比较不作为确认性排名。

下一步：转向连接表示和站点差异诊断；外部标签与同定义临床资料继续单独等待。

依据：training-update-20260913-docs-SEQUENTIAL_IMPROVEMENT_CONCLUSIONS_2026-09-13-md

</details>

## 09-12 19:02　OA同流程试处理与目标核查

- 模型：统一影像预处理流程
- 数据：OA候选队列
- 工作：核对原始输入并启动与目标一致的预处理试验。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理与质量核查

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：OA同流程试处理与目标核查

原摘要：下载与传输已完成；前3例QC未通过、第4例计算中，SRPBS等待续作。

原结果：162个源文件已完整接收；当前0通过、3 QC未通过、1运行、72待处理。独立配准初始化修复例仍单列。

具体方法：采用SRPBS核心no-GSR/Friston24/spike/统一分割/滤波参数；OA原始去前10帧一次，保留完整T1。

限制：数值通过不等于视觉批准；完整76人尚未处理完，前3例不足以估计全队列通过率。未开展新分类或证明精度提升。

下一步：继续OA逐例处理并保留未通过原因 → 全76人到终态且释放共享资源后恢复SRPBS；技术失败则暂停复查。

依据：execution-status、oa-reacquire、next-processing-targets

</details>

## 09-11 18:53　50人＋临床训练折联合预训练

- 模型：FC自编码器＋Logistic
- 数据：SRPBS50人来源与临床训练折；SRPBS目标
- 工作：比较仅来源预训练与联合训练折无标签数据的预训练。
- 性能变化：主分析AUC 0.619→0.605，下降1.4个百分点，区间跨0。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：无标签预训练来源

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：50人＋临床训练折联合预训练

原摘要：联合预训练主分析AUC 0.605，仅50人为0.619；OA测试仍需统一处理流程。

原结果：联合预训练主分析AUC 0.605，仅50人为0.619；OA测试仍需统一处理流程。 配对ΔAUC -0.014，条件95%区间[-0.088, 0.063]。

具体方法：沿用99/96及原内外折，200个编码器和200个分类器；内折验证者与外折测试者均不参与对应预训练。未调整为主比较，混杂调整为敏感性分析。

限制：当前已探索队列的开发结果；同epoch不等于同优化步数。OA现有包使用GSR，与SRPBS no-GSR不一致；不能直接作为同流程独立测试。

下一步：先定位或生成符合相同处理规则的OA输入并核对标签、身份与头动；本轮没有用OA成绩调参。

依据：joint-source-target、joint-source-target-json、joint-source-target-csv

</details>

## 09-11 16:13　50/46人扩量训练完成

- 模型：FC自编码器＋Logistic
- 数据：来源50／46人；目标SRPBS99／96
- 工作：扩大来源后完成内部和双向站点测试。
- 性能变化：50人来源主AUC 0.619，旧9人来源0.694；扩量未带来单调增益，且两实验条件不能视为纯单因素比较。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：来源规模与迁移评估

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：50/46人扩量训练完成

原摘要：50人来源主分析AUC 0.619；扩量及部分微调未见稳定提升。

原结果：50/46人预训练、99/96分类与双向站点测试全部回读通过。50人来源主分析AUC 0.619（旧9人0.694，Raw 0.639）；OSU→CIN / CIN→OSU AUC为0.632 / 0.648。

具体方法：完成1300个拟合模型及10个训练比例对照，沿用原划分、训练折内调整；完整报告保留新50/46、旧9/7及Raw等134行结果和五项指标条件95%区间。

限制：未见稳定的扩量或部分微调增益；区间基于固定预测的受试者重采样。当前队列已用于开发，不是新医院独立验证，不能据此承诺诊断准确率。

下一步：保留全量结果，下一步优先核对来源组成、源/目标分布及预先设定的学习曲线，继续隔离最终医院验证数据。

依据：source50-training、source50-results-json、source50-results-csv、site-transfer-report

</details>

## 09-09 整理 / 09-08 会议　明确病种，医院与公开数据并行

- 模型：尚未新增临床预测模型
- 数据：医院PTN／PHN候选与公开疼痛队列
- 工作：明确优先病种、评分终点及医院／公开数据分工。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：研究目标与临床数据准备

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：明确病种，医院与公开数据并行

原摘要：单一病种优先；医院需求草案已整理，病种、协议与院方安排待确认。

原结果：更新项目目标、责任接口与行动顺序；纠正1,627人库存不是1,627名疼痛患者，保留79续批与99累计临床的区别。

具体方法：对照会议总结、校订转写与任务记录，保留会后完成的预训练和99/96分类；置换仅记录最后保存快照。

限制：完成的是计划整理，不是医院确认、采集、外联或公网部署；未复听音频，姓名沿用转写。会议没有明确截止日期。

下一步：P0核对病种/终点/MRI需求，同时检查置换终态；院方反馈后再现场核对流程。

依据：meeting-20260908、hospital-requirements、record

</details>

## 09-09 10:41　大阪与CiNet双向站点留出

- 模型：冻结FC自编码器＋Logistic
- 数据：OSU↔CIN；来源9／7人
- 工作：预训练和监督训练均排除目标站点，检查直接外推。
- 性能变化：9人来源两方向AUC 0.634／0.600，7人为0.641／0.659；相对Raw差值区间均跨0。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：跨站点来源与评价

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：大阪与CiNet双向站点留出

原摘要：

原结果：150拟合模型及10训练先验对照完成，160预测回读误差0；预训练与监督拟合均不含测试站点。9人Logistic两个方向AUC0.634/0.600，7人为0.641/0.659，相对Raw区间均含0。

具体方法：OSU46训练→CIN50测试及反方向；每方向5组种子、训练站点内3折选参。全部16配置及年龄/头动调整同时报告。

限制：测试对象已用于前期方法探索，属于站点留出开发实验，非新医院独立确认。7人Logistic大阪→CiNet灵敏度仅30.6%，不能只强调66.4%准确率。

下一步：增加同流程合格来源，并保持测试站点排除；继续保留Raw与冻结Logistic，不以测试成绩删人或改阈值。

依据：site-transfer-report、existing-site-performance、matched-finetuning-report

</details>

## 09-09 10:12　同规则来源冻结与部分微调

- 模型：FC自编码器冻结／部分微调
- 数据：SRPBS99／96；同规则7人来源
- 工作：在共同划分下比较冻结表示和最后层微调。
- 性能变化：部分微调AUC 0.660／0.674；8项微调减冻结差值区间均跨0。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：编码器解冻与分类训练

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：同规则来源冻结与部分微调

原摘要：

原结果：400外折模型、1800次内折拟合及200个FC调整器回读通过。7人来源最后层99/96准确率65.66%/67.08%，AUC0.660/0.674；8组微调减冻结AUC差值区间均含0。

具体方法：复用9/7来源和99/96原划分；同一BCE头比较冻结/最后层，原始FC不调整或折内年龄＋站点＋头动调整；内折选择学习率及轮数。

限制：部分微调未显示稳定增益。调整后AUC约0.52–0.54，不能区分混杂与输入分布偏移；96/99高度重叠，不是独立医院验证。

下一步：扩大同流程QC合格来源，并检查站点留出迁移；保留简单Logistic对照，不按外折成绩删人。

依据：matched-finetuning-report、matched-source-report

</details>

## 09-09 09:51　同规则来源与训练折内混杂检查

- 模型：FC自编码器＋分类头
- 数据：同规则来源与SRPBS99／96目标
- 工作：检查年龄、站点与头动调整对迁移比较的影响。
- 性能变化：本条为混杂和保存结果复核，未报告单一可确认的AUC增益。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：混杂校正与结果核查

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：同规则来源与训练折内混杂检查

原摘要：保留SRPBS来源9/7人；低头动子集未显示一致优势。

原结果：完成750模型、450调整器重算及600协变量变换核对，预测回读误差0；相同划分下比较未调整、年龄、站点、头动影响。

具体方法：no-GSR及原科学QC不变；7人额外mean FD≤0.2。每个内/外训练折独立拟合协变量处理、OLS、特征筛选及Logistic。

限制：9到7人同时改变人数与疾病构成；数据已用于开发，不能称独立验证。ABIDE/DS历史角色保留，本轮不纳入严格比较。

下一步：优先同流程扩量和明确疾病/量表定义；不依据测试成绩删除被试或选择新主检验。

依据：matched-source-report、dataset-roles

</details>

## 09-09 09:20　PTN、七日NRS与MRI建议及数据集分工

- 模型：尚未新增临床预测模型
- 数据：医院PTN／PHN候选与公开疼痛队列
- 工作：明确优先病种、评分终点及医院／公开数据分工。
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：研究目标与临床数据准备

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：PTN、七日NRS与MRI建议及数据集分工

原摘要：

原结果：院方反馈TN和带状疱疹相关痛较多；据此改为PTN优先、PHN独立备选。已形成七日NRS回归、3T建议协议及来源/测试角色。

具体方法：核对原始资料、当前实际来源清单及公开官方文档；明确H-dev/H-test角色和医院待填事实。

限制：不是医院确认或采集；仅有病种较多的反馈，确切病例量/设备/时段未知。DS当前子集病种构成未全部确认。

下一步：疼痛科和影像科回填可行性；取得合规样例后实际验证导出、预处理与量表关联。

依据：hospital-initial-review、dataset-roles、cohort-role-audit

</details>

## 09-09 00:45　1000次置换与最终独立回读

- 模型：FC自编码器迁移与Raw FC参照
- 数据：SRPBS99／96，DS005713固定来源
- 工作：用嵌套置换检验已有迁移增益。
- 性能变化：10项多重校正后均未显著，未支持固定来源迁移收益。
- 修改板块：统计验证与置换评价

不显著不能证明等效或无效。

<details><summary>参数、完整记录与依据</summary>

原标题：1000次置换与最终独立回读

原摘要：

原结果：1000/1000次置换终态COMPLETE、独立回读PASS；10项Holm校正均未显著，未支持固定DS005713迁移增益，不证明等效或无效。年龄混杂和新医院独立验证限制保留。

具体方法：核对持久COMPLETE和independent_readback PASS、结果摘要；原执行独立复核1000次/2000个OOF数组，AUC最大误差0。

限制：本次为结果回读与网站同步；站点内置换不消除年龄混杂，差值零假设不是一般算法等效检验。

下一步：保留开发性未确立增益结论，医院单病种采集准备继续。

依据：clinical-permutation-results、record

</details>

## 09-08 20:39　校准复核与嵌套置换

- 模型：13种既有分类方法
- 数据：SRPBS99／96
- 工作：独立复算AUC与概率误差，并检查混杂和置换流程。
- 性能变化：既有预测重放一致；复核本身没有新增AUC提升。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：概率校准与统计核查

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：校准复核与嵌套置换

原摘要：

原结果：全部13方法×两套OOF的AUC/Brier重算一致；Raw校准较差，Pain组年龄高约8–9岁。原三组预测重放误差0、两次完整试跑及独立回读通过，20:38启动1000次正式置换。

具体方法：每次站点内打乱标签，99/96共享同一次标签置换；重建分层内外折，重新特征选择、调参、拟合，固定1000次预算。

限制：启动快照，不是完成或实时进度；站点内交换未控制年龄等其他混杂。10项标签零假设检验给出Holm校正，差值不是一般模型等效检验；不把最高AUC改为主问题。

下一步：全部完成后独立回读标签/OOF/AUC/p值；独立临床验证和VAS端点时点仍待解决。

依据：clinical-permutation-20260908、clinical-calibration-20260908、record

</details>

## 09-08 20:13　99/96嵌套分类

- 模型：冻结DS005713自编码器、Raw FC及其他分类头
- 数据：SRPBS99／96
- 工作：完成嵌套分类并独立回读保存模型。
- 性能变化：99人自编码器／Raw AUC为0.562／0.639（−7.7个百分点）；96人为0.521／0.620（−9.9个百分点）。
- 原论文 baseline：项目自建方法／组合。该条为项目自建分类器、融合或消融比较，没有对应单篇原论文的同任务AUC baseline；差值采用本条列出的项目对照。 原论文baseline与项目内部参照分别记录，不用其他病种或其他指标代填。
- 修改板块：迁移表示与分类评估

仅为既有队列上的开发比较，尚无独立临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：99/96嵌套分类

原摘要：

原结果：13方法×50外折=650模型外折完成，12,675条OOF；独立回读650模型、2,600条fit审计，概率重放误差0。99人固定DS005713/Raw AUC为0.562/0.639，96人为0.521/0.620。

具体方法：两套均5重复×5外折×3内折；每个内层重新拟合目标SSL/适配和分类变换。报告ROC-AUC/AP/Brier/校准/分组及2000次受试者配对条件bootstrap。

限制：SRPBS固定AUC0.694/0.685，但对Raw差值区间均跨0；不宣称稳定迁移增益。区间固定已拟合预测，不含完整训练不确定性，未校正多重比较；完整嵌套置换与独立验证未完成。

下一步：复核校准与混杂，继续完整嵌套置换；不以最高点估计替换主要问题。

依据：clinical-classification-results-20260908、clinical-classification-20260908、record

</details>

## 09-08 16:09　五条来源编码器

- 模型：FC自编码器
- 数据：SRPBS9人、DS005713 33人／36扫描、ABIDE972人
- 工作：训练不同无标签来源的编码器，并准备来源适配版本。
- 性能变化：本条完成来源预训练，未提供下游AUC增益。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：预训练来源与适配

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：五条来源编码器

原摘要：

原结果：SRPBS9人、DS00571336次扫描/33人、ABIDE972人分别预训练30 epoch；ABIDE与DS005713再各向SRPBS非临床9人适配5 epoch，共5份检查点。

具体方法：复用实际AAL90加载器，来源排除全部145临床ID；父编码器不变，5份检查点回读相等，均对99人完成99×32有限表示推理。

限制：临床进入重构0人；推理接入不是临床性能。不同来源预处理差异保留，相同epoch不等于相同梯度步数，不以训练内损失挑来源。

下一步：按已确认99主分析/96敏感性实施完整嵌套分类和训练折内适配。

依据：source-pretraining-20260908、record

</details>

## 09-08 14:40　99人分类准备

- 模型：FC自编码器＋分类流程
- 数据：SRPBS来源9人、目标99人
- 工作：实际加载输入包并跑通端到端分类流程。
- 性能变化：仅为流程试跑，未给出正式AUC提升。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：训练输入与端到端接入

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：99人分类准备

原摘要：

原结果：全部108份有效NPZ实际重载通过；来源9人、目标99人完成4路径smoke，生成396条测试预测。临床99人为53 Healthy与46 Pain。

具体方法：官方匿名主键连接，全部145个临床ID从来源排除。训练loss、checkpoint回读、来源/目标与适配/测试重叠检查通过；全99类别分层、OSU/CIN96联合分层各实测25外折与75内折。

限制：仅真实数据执行验证，不报告性能优劣。NKN为1 Healthy/2 Pain，无法全站点联合分层；正式主分析方案待研究者选择。VAS分表，（编号省略） HOLD及科学排除不变。

下一步：选择样本方案后落实正式训练比较与混杂审计。

依据：classification-preparation99、record

</details>

## 09-08 09:14　QC 审核上线

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：QC 审核上线
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：QC 审核上线

原摘要：74 位被试、296 张图已就绪，待逐例人工审核。

原结果：初始 73 位 / 292 张图，同步接口再次读取后加入 （编号省略），交付时达到 74 位 / 296 张图。每例提供 T1 配准边缘、MNI 标准化边缘、DPABI 叠加图及滤波后 BOLD 拼图。

具体方法：仅展示有效数值 PASS 且未获既有人工确认的输出；独立修复按精确目录匹配。支持逐张翻页、缩放、备注、通过/需复查/待定、本地持久保存与 JSON 导出。TIFF 保留原件并提供全尺寸浏览副本。33 项测试及隔离浏览器保存、刷新、修改、导出流程通过。

限制：交付核验时新增研究者审核记录为 0。图像成功加载、助手观察和数值 PASS 均不等于研究者通过；网页记录与远端账本分开保存，不自动纳入训练。此处数量为交付快照。

下一步：逐例查看全部图像并填写真实意见；后续用审核页同步按钮补充新结果，按有效目录归并导出的意见。

依据：qc-web-review、record

</details>

## 09-08 08:53　续批完成 101 / 107 例

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：续批完成 101 / 107 例
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：续批完成 101 / 107 例

原摘要：73 例数值通过、28 例排除；其余 6 例处理中或待处理。

原结果：有效 73 PASS、28 科学排除、0 未解决技术失败、1 运行、5 待处理，终态比例 94.39%。当前 （编号省略） 处于隔离恢复解包阶段；该例随后进入上方网页交付清单。

具体方法：直接核对持久状态、完成标记、两阶段 QC 和 AAL90 验证文件；新增 14 个 PASS 的证据通过。20 秒前后对比显示 tar/gzip 实际读取与 CPU 增长，证实正在推进。磁盘剩余 121.95 GiB，继续遵守原 100,000,000,000 字节停止线。

限制：此时累计全部 SRPBS 为 102 数值通过 / 29 人工确认，临床为 93 / 20；续批 73 位仍待人工。科学排除、技术失败和人工待审独立统计，终态并非全部成功。

下一步：跟进最终 107 例终态、磁盘峰值和新 PASS 的人工审核。实时状态请看项目总览，而非沿用本节点数字。

依据：status-20260908

</details>

## 09-07 21:09　T1 裁剪防护上线

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：T1 裁剪防护上线
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：T1 裁剪防护上线

原摘要：已拦截退化裁剪并恢复完整 T1；科学 QC 继续独立执行。

原结果：在 c/co 两条准备路径拦截明显退化裁剪；（编号省略） 独立修复达到数值 PASS，原队列恢复。9月8日生产核验中，防护已接住 （编号省略）、（编号省略）、（编号省略） 的三次退化输出。

具体方法：任一轴小于 16 或体素总数低于完整 T1 的 1% 时，隔离坏产物并选用与完整 T1 字节一致的兼容副本。真实坏例重放保留 159×213×200 完整 T1；正常路径重跑为 156×190×200。远端生产容器 60 项回归通过，旧产物及失败记录保留。

限制：这是对已观测退化输入的防护，不宣称解释所有裁剪失败根因。正常裁剪与科学 QC 阈值不变；（编号省略） 虽避免技术崩溃，仍因头动被科学排除。（编号省略） 数值通过但人工仍待审，近奇异混杂警告保留。

下一步：在后续处理持续核对完整图与实际选中 T1 的维度及内容；逐例审核新有效输出，不沿用旧人工确认。

依据：t1-collapse-repair、status-20260908

</details>

## 09-07 10:05　两例 T1 修复完成

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：两例 T1 修复完成
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：两例 T1 修复完成

原摘要：（编号省略）、（编号省略） 数值通过，待人工审核；原队列已恢复。

原结果：两例均完成 Stage1、Stage2、AAL90 和独立检查。10:03 重新加载全部 77 份有效 NPZ 验证通过；续批当时为 48 PASS、21 排除、0 未解决失败、1 运行、37 待处理。

具体方法：只暂停父调度器派发，等待活动子任务正常结束后持原锁串行修复。输入分别保留 180×204×153 与 165×199×175 完整 T1，逐体素/affine 一致；恢复后通过真实 gzip I/O 确认推进。

限制：原失败和科学参数未改，修复按同一被试替换有效视图，不重复计人。两例人工仍待审；近奇异警告未消除，来源9/目标20的 smoke 规模不变。

下一步：继续续批与新增有效输出人工审核，保留 （编号省略） 时点暂缓。

依据：two-repairs-20260907

</details>

## 09-05 — 09-06　T1 与掩膜修复

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：T1 与掩膜修复
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：T1 与掩膜修复

原摘要：3 例修复后数值通过；另 1 例仍因头动超标排除。

原结果：（编号省略）、（编号省略）、（编号省略） 修复达到数值 PASS；（编号省略） 修复计算崩溃后，因 censor 73.33% 保持科学排除。

具体方法：退化 T1 采用独立完整图工作目录；（编号省略） 依据物理空间对应关系在 QC 内无插值重排掩膜数组及 affine，不直接改头文件或放宽网格容差。协调器等待当前子任务完成、复用原锁并恢复原队列。

限制：技术恢复不自动成为科学 PASS。记录了 （编号省略） 修复触发全局互斥而暂停原队列的实际情况，以及晚间控制器检查错误的修正；不能只凭目录/display 隔离宣称互不影响。旧失败、警告和科学阈值均保留。

下一步：后续修复继续遵守原并发约束，数值验证与研究者视觉审核分别完成。

依据：sub2005-repair、evening-repairs、sub2053-repair

</details>

## 09-05 10:52　临床续批启动

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：临床续批启动
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：临床续批启动

原摘要：107 人入队，1 人因扫描时点定义暂缓。

原结果：扣除历史批次对象，107 名符合 240 时点、TR 2.5、dummy 0 的候选进入续批；54 Healthy / 53 Pain，CIN 53、NKN 3、OSU 51。

具体方法：按官方 participants、临床补充表、MRIQC 与影像库存逐 ID 联接。运行沿用逐例串行、16 DPABI workers、既有磁盘底线与失败分类；累计汇总首批、续批及独立修复。

限制：（编号省略） 库存 240 体积，但 MRIQC 为 size_t=239、dummy_trs=1，保留 HOLD_TIMING_DEFINITION，既不入零 dummy 队列，也不算科学排除。Stroke 不进入本批。

下一步：待实际 QC 终态与人工确认后重新核定站点×标签结构；不能按最小非空单元直接决定正式 CV 折数。

依据：clinical108、clinical-design、record

</details>

## 09-05 10:33　真实数据流程跑通

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：真实数据流程跑通
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：真实数据流程跑通

原摘要：9 人来源包、20 人目标包完成 smoke；不作为性能结论。

原结果：HC 11 / Pain 9 的目标包与 9 人来源包实际加载，4 条技术路径形成 80 条折外预测记录；检查点可回读，loss 有限。

具体方法：排除全部 145 名临床 ID 后构建来源池，来源与临床交集为 0；目标适配 fit/test 交集为 0，固定来源 encoder 未改变。使用原生 AAL90 90×90 FC、4,005 条边。

限制：结果为 REAL_DATA_SMOKE_ONLY：metrics_interpretable=false、regression_run=false。仅证明真实接口、折内适配与审计链路，不解释 AUC 或模型优劣。20例中最小站点×标签单元只有1例，正式评估未就绪。

下一步：扩产并完成视觉审核，明确 VAS 端点与相对 MRI 施测时点；预处理、特征选择和适配只在训练折内拟合。

依据：training-preparation、training-smoke、clinical-design

</details>

## 09-04 — 09-05　临床首批完成

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：临床首批完成
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：临床首批完成

原摘要：24 例中，18 例通过并完成人工确认，6 例科学排除。

原结果：独立修复归并后无未解决技术失败。研究者对最后4例已交付的16张图作出确认，首批18个有效 PASS 全部完成人工确认；临床累计20/20，全部 SRPBS 累计29/29。

具体方法：（编号省略） 独立修复为 PASS；（编号省略） 保留完整 T1 后恢复计算，但 censor 86/240（35.83%）超过原20%上限，停止后续 Stage2/AAL90。新确认精确匹配有效目录，不扩展到其他被试或修复输出。

限制：24/24 达到终态不等于24例全通过；科学排除不能通过人工意见覆盖。后续续批与新修复均需各自独立审核。

下一步：以已确认数据开展真实接口测试，新增样本按同一数值、视觉与训练边界处理。

依据：clinical24、independent-repair、sub2041-repair、late-visual-confirmation、record

</details>

## 09-03 — 09-05　临床标签核对

- 模型：影像预处理与QC；未训练新预测模型
- 数据：SRPBS临床候选与历史处理批次
- 工作：临床标签核对
- 性能变化：未进行新的患者预测比较，AUC提升未评估。
- 原论文 baseline：未产生新的AUC比较。本条没有新增AUC变化，原论文baseline不用于评价这项输入、资料或技术核查。 如需查看后续模型效果，按对应实验日期阅读。
- 修改板块：影像预处理、人工审核与样本标签

本条是输入或技术核查，不等于通过临床验证。

<details><summary>参数、完整记录与依据</summary>

原标题：临床标签核对

原摘要：145 人标签已联接；量表定义与正式评估方案仍待完善。

原结果：官方 ID 联接得到 145 名临床对象；主分类按 diag=5 Pain 对 diag=0 Healthy Control，diag=6 Stroke 单列。来源改走原生 AAL90 路径，与旧投影实验分别解释。

具体方法：核对归档 README、sup7/sup8 与临床清单，保留 VAS 与 SF-MPQ2 的来源表信息。候选设计为受试者级、站点×标签分层的重复嵌套 CV，另考虑两套来源表间的迁移敏感性。

限制：旧 N82 crosswalk 不可得不能推导为归档没有疼痛标签；不得猜测 ID 映射。VAS 端点及施测时点仍未明，不能自动换算或合并。BAL140/9,730 边与 AAL90/4,005 边不能截断、填充或混用。

下一步：按最终有效样本核定可执行划分，补齐量表口径后再开展正式分类/回归；新的独立验证仍待完成。

依据：clinical-design、qc-policy、record

</details>


<!-- brainhgt-geometry-20261026 -->

## 2026-10-26　BrainHGT第一压缩层几何保持实验

- 模型：完整BrainHGT，第一压缩层固定几何保持λ0.1
- 数据：原SRPBS79人，原三内折和5种子
- 工作：15新模型、15原参照复用；原200更新和100选轮，保留选中及末次。
- 性能变化：原79人、3内折、5种子，完成15个几何保持模型，复用15原参照。验证AUC 0.6901→0.7158，Δ+0.0257，5/5种子正向，人员条件95%[-0.0240,+0.0775]。 观察到AUC均值+0.0257、5/5种子正向，但人员条件AUC区间仍跨0，未通过预定主要要求。结束第一压缩层λ0.1几何保持配置，不追加系数、层位或种子搜索；保存正向现象和全部模型，尚不升级为稳定改进方案。训练几何相似度、有效秩变化或概率误差下降不能替代AUC证据，也不能据此认定BrainHGT所有适配均无效。
- 修改板块：第一压缩层训练几何约束，不增加模块或参数

仅SRPBS原outer0的79人反复开发池，非99人完整OOF、未开发H-test或临床验证。原3内折训练52/53与验证26/27，验证按原100次机会选轮；五seed共享人员。人员区间条件于保存选中模型，不覆盖重训、100选轮或累计研究选择。

[完整几何保持实验报告](https://onephantomcat.github.io/neurograph-site/files/brainhgt-geometry-20261026.md)；[执行前唯一配置方案](https://onephantomcat.github.io/neurograph-site/files/brainhgt-geometry-20261026-plan.md)。


<!-- geometry-crosscohort-20261026 -->

## 2026-10-26　BrainHGT几何保持的跨队列固定权重复核

- 模型：15个固定几何保持BrainHGT，原45条记录复用
- 数据：ZAN54、Emo53、偏头痛132，均有开发使用史
- 工作：零训练，仅新增3585模型—人评分，原参照不重算。
- 性能变化：固定15个几何保持选中模型，复用原45条模型—队列预测记录，零新增训练、3585次新评分。ZAN54 0.4112→0.4560（Δ+0.0448，4/5种子正向）；Emo53 0.5918→0.5659（Δ-0.0259，0/5种子正向）；偏头痛132 0.6116→0.5808（Δ-0.0309，1/5种子正向）。 迁移AUC方向不一致：ZAN点值提高，Emo和偏头痛下降，没有三个队列共同支持。停止本几何保持配置的跨病因推广及追加适配，不按最好队列改结论。三个队列概率误差均值下降仍完整保留，但不能替代AUC排序收益。
- 修改板块：固定权重迁移评价，未加模块或参数

三个目标队列均有既往开发/历史查询，病因、设备与类别先验不同；不是新H-test、同病种独立临床验证、MRI同期疼痛程度或疗效证据。未重新证明跨库生物身份/访视完全无重叠。条件区间仅固定保存模型，不覆盖源重训/100选轮/累计研究选择或多重比较。

[完整跨队列复核报告](https://onephantomcat.github.io/neurograph-site/files/geometry-crosscohort-20261026.md)；[评分前有限方案](https://onephantomcat.github.io/neurograph-site/files/geometry-crosscohort-20261026-plan.md)。


<!-- srpbs-task-audit-20261026 -->

## 2026-10-26：SRPBS任务适用性与几何保持收益归因

原79人标签/FC/QC来源链未见冲突，FC及逐人标准化时序差0；VAS时点和端点均未确认。几何保持挽救236、损伤170个重复排序，约79.7%净ΔAUC来自双高头动配对。

现有证据不足以认定数据集损坏；主要限制是诊断标签与MRI同期痛不等价、小样本开发，以及收益对头动/站点分布不均。双低头动配对收益很小，CIN内部排序下降，不能把整体开发增量解释为普遍疼痛信息改善。

事后开发描述，分组和关联不证明因果、去混杂或独立验证；较高头动指相对训练中位数，不是QC失败。158条源QC的PENDING沿用原字段，审批另存：62当前、17历史同目录/完成时点用户接受；本轮专家/视觉新审核0。跨库身份、真实访视、MRI同期量表仍未确认，不改标签/QC或按成绩删人。

继续以SRPBS Pain/HC诊断开发为主，暂停本几何保持配置的追加调优与跨病因推广。下一候选只研究训练侧头动敏感性：先核对旧去混杂方案与训练人内诊断—头动重叠，再定义一个有限对照；本轮不启动训练，不按低头动子集挑选高分。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/srpbs-task-audit-20261026.md)。


<!-- motion-support-20261026 -->

## 2026-10-26：训练侧头动支持域与旧方案核对

原三训练分区meanFD病例−HC标准化差0.0089/0.1160/0.0328；二档均衡第一折权重全1，第三折连续FD差扩大。不追加头动均衡加权训练。

总体头动与诊断近似平衡，不支持用简单均衡加权解释或修复旧模型失败；站点内仍有差异，NKN极小，不能据此排除条件混杂。唯一后续候选收窄为既有异常帧对静态FC/OMST的输入敏感性，先量化改变再考虑训练。

元数据描述和有限代码查核，不是去混杂、因果或独立验证；观测min–max重叠不保证可交换性。NKN三个训练分区只有1/2/3人，第一折无HC。52人既有spike回归、27人无标记，不能将再次去帧预告为有效降噪。

下一步只做输入测量：52位有既有异常帧标记的人各一次静态FC及对应OMST，27位直接复用；不读取MRI、不改变QC或按AUC挑输入。若实际无改变则停止，训练0。最多15新模型/复用15原参照仅为测量之后的后续候选，当前未启动。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/motion-support-20261026.md)。


<!-- static-censor-input-20261026 -->

## 2026-10-26：固定去帧的静态FC与OMST输入测量

52份新FC与52对应OMST完成，27人原样复用。52人的FC最大边差中位0.01852、相对Frobenius差中位1.491%；50人二值图改变，hop变化比例中位8.851%。

输入确有可辨识变化，但训练QC–FC关联六项三降三升，没有一致降噪证据。输入变化、图hop变化都不能替代AUC；原15模型直接对照仍是尚未执行的唯一候选，不自动启动。

开发输入测量，不是模型预测、去混杂因果或临床验证。52人已有spike回归，未重做回归/滤波/MRI；QC–FC不一致保留。旧统一拓扑干预无AUC收益的结果保持，hop变化不证明模型输出依赖该变化。原20/CoSpine13/其他队列新评分0。

如果继续，只运行原定最多15新完整BrainHGT、复用15原参照的单配置直接AUC对照，原人/seed/200更新/100选轮不变；不加模块、几何损失或重加权。本轮阶段B未启动，不能把输入变化或QC–FC方向写成AUC改善。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/static-censor-input-20261026.md)。

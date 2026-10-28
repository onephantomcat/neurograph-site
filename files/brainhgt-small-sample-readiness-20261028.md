# BrainHGT小样本准备：概率恶化更一致，K10方案尚未训练

2026-10-28。**零新增训练，复核原版、旧几何和固定切空间目标45模型的4500轮曲线，并读取新目标15模型的30个选轮/末轮状态。固定25→100轮，新目标验证AUC0.6760→0.6734，五种子方向不一致；验证logloss1.0084→1.3426，五种子均恶化。**

更一致的问题是后期概率质量恶化，不能把选轮0.7304到末轮0.6734的全部差距解释成持续AUC崩塌。局部梯度有冲突，但属于整训练集eval快照，不证明辅助项有害或实际Adam更新出错。保留原0.7304及停止结论；下一有限问题是K10同预算比较，不追加模块。

## 固定轮次核对

|方法|第25轮训练AUC|第25轮验证AUC|第100轮验证AUC|25→100 ΔAUC|第25轮验证logloss|第100轮验证logloss|
|---|---:|---:|---:|---:|---:|---:|
|原BrainHGT|1.000000|0.657906|0.654792|-0.003114|1.126966|1.591188|
|旧LSRA几何|1.000000|0.667369|0.670696|+0.003327|1.023788|1.377100|
|固定切空间目标|1.000000|0.675977|0.673413|-0.002564|1.008443|1.342638|


|初始化|固定25→100 Δ验证AUC|Δ验证logloss|
|---:|---:|---:|
|0|-0.056013|+0.378477|
|1|+0.027320|+0.275330|
|2|-0.002289|+0.301685|
|3|+0.024725|+0.367849|
|4|-0.006563|+0.347633|


新目标25到100轮训练AUC一直1.0，训练logloss0.014975→0.001375；验证AUC均值只下降0.002564，五初始化3负2正，不能描述成所有模型持续AUC崩塌。验证logloss五初始化均上升，Brier四升一下，概率质量恶化更一致。原版和旧几何的固定窗口logloss也恶化，现象不是本轮固定目标独有。

先前的选轮AUC0.730433和末轮0.673413仍真实，但选轮本身选择验证最高点，二者差距不能全部归因后期训练因果效应。固定epoch是开发后描述，也不是独立选择规则；不得据本表另选10/25/50轮来报告新最高成绩。[4500轮](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-curves)、[固定时点](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-epochs)、[45模型窗口](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-windows)、[15方法种子窗口](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-seeds)全部保留。

新目标选轮→末轮，15模型14个AUC更低；重复正负人员配对中修复109、损伤256，平均ΔAUC−0.057021。验证错分人数均值10.40→9.13，却有高置信错误均值1.93→5.73（真类别概率≤0.1）；所以0.5阈值错分数下降也不代表排序或概率质量改善。旧几何修复179/损伤296，AUC均值−0.045147。配对和错误均跨相同人员/折/种子重复，不能相加当新增患者，不做独立显著性检验。[30条漂移](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-drift)。

## 第一压缩层的局部梯度

|状态|辅助与CE负余弦|0.1辅助/CE梯度范数中位|余弦中位|合并梯度与CE负内积|
|---|---:|---:|---:|---:|
|selected|13/15|1.426464|-0.277525|5/15|
|final|15/15|5.521105|-0.433695|15/15|


末轮15/15辅助梯度与CE负余弦，λ0.1加权范数比中位5.521；合并梯度与CE负内积15/15。CE已经接近零，辅助项相对更大是可能的常规正则现象，负夹角并不自动表示设计错误，也不能证明它导致验证下降。选轮负余弦13/15，合并负内积5/15；全部保留。

这些数只描述第一Linear参数块、整52/53训练人、eval模式的当前快照。没有重建历史dropout批次或Adam动量/预条件，不是当时实际更新方向，也未新计算验证梯度。不以此自动引入梯度裁剪、损失调度、GradNorm或另一模块。[30状态](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-gradients)、[状态汇总](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-gradient-means)、[各初始化](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-gradient-seeds)。

## 借鉴哪些既有小样本证据

- **SPD小样本**：SPD AUC0.6411/0.6855/0.7117；相对同参数无对数Δ+0.0185/+0.0276/+0.0309。几何表示有小样本开发依据，不能当作BrainHGT同协议收益。[原报告](https://onephantomcat.github.io/neurograph-site/#evidence?source=spd-small-sample-20261016)
- **冻结表示原型头**：DNN共同尺度LR0.6353；中心化L2原型0.6185，三训练组两组差值为负。不直接重做L2原型，旧停止保持。[原报告](https://onephantomcat.github.io/neurograph-site/#evidence?source=fewshot-geometry-20260925)
- **双队列少样本迁移**：双向目标单独/源目标联合均未同时支持预训练超过强FC和随机表示。不能把额外源样本或教师知识隐去，预训练不自动有效。[原报告](https://onephantomcat.github.io/neurograph-site/#evidence?source=multidataset-fewshot-20261002)
- **BrainHGT人数响应**：AUC0.677595对0.690140；Δ+0.012546，3/5种子正向，区间跨0。不能把样本少定为唯一瓶颈；旧单一支持组不足以评估抽样鲁棒性。[原报告](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-sample-size-20261024)
- **固定切空间目标**：选轮AUC0.730433；旧几何0.715842，线性FC0.718407；两主比较未满足。最贴近的BrainHGT方法候选；尚无K10成绩。[原报告](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-tangent-target-20261028)

这些研究的输入、人员预算、分区或表示不同，不组成统一AUC排名。SPD结果提供几何结构的局部依据；原型和迁移阴性提示不能把通用少样本组件当作必然有效；BrainHGT26人实验只有一个固定支持组，本轮方案将支持抽样与初始化分别列出。[旧研究核对表](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-prior)。

## 文献与创新范围

- [SimpleShot](https://arxiv.org/abs/1911.04623)（2019，arXiv预印本）：简单特征变换和最近邻是重要少样本参照，先检查简单机制；对象分类及基础类表示不等同疼痛新人员；不再次启动旧L2原型分支。
- [Prototypical Networks](https://papers.nips.cc/paper_files/paper/2017/hash/cb8da6767461f2812ae4290eac7cbc42-Abstract.html)（2017，NIPS正式论文）：区分支持集/查询集与任务训练；本项目仍是固定诊断类别的新人员泛化，不是新类别元学习。
- [Benchmarking functional connectome-based predictive models for resting-state fMRI](https://www.sciencedirect.com/science/article/pii/S1053811919301594)（2019，NeuroImage正式论文；本轮核对既有摘要，全文访问403）：切空间与简单线性预测已有系统研究；训练侧参考需单列；不声称本项目首次使用切空间；不新增传统模型拟合。
- [Similarity of Neural Network Representations Revisited](https://proceedings.mlr.press/v97/kornblith19a.html)（2019，ICML正式论文）：CKA比较表示关系，可用于既有辅助目标；CKA不是本项目提出，数值增大不能替代泛化。
- [Similarity-Preserving Knowledge Distillation](https://openaccess.thecvf.com/content_ICCV_2019/html/Tung_Similarity-Preserving_Knowledge_Distillation_ICCV_2019_paper.html)（2019，ICCV正式论文）：保持样本间相似关系已有方法来源；本项目固定FC几何不使用训练教师logit，不能泛称首次关系蒸馏。
- [BrainLinear](https://arxiv.org/abs/2608.15266)（2026，arXiv预印本；非已核实正式会议结果）：训练参考切空间与诊断方向筛选已有接近研究，需缩小原创主张；不据摘要宣称完全相同，也不把预印本成绩当疼痛指标。

当前可检验的主张是“固定训练侧FC几何约束能否提高BrainHGT在有限人员监督下的样本效率”，不是已经成立的少样本创新。切空间、CKA、相似关系保持、原型分类均已有方法；本轮仅核对以上指定来源，不是穷尽查新，不能宣称首次。小样本稳定性、标签效率是待验证优势，不能拆成三个已完成新算法。[文献映射](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-literature)。

## K10下一方案已具体化，未启动

建议先做每类10人的有限先导：原3内折×3支持抽样×2初始化×原版/固定目标两条件=最多36模型，各200更新；9个支持侧参考/scaler只用各20人。当前仅准备成员与方案，尚未训练；K5/K20不自动扩展。全部支持与初始化、阴性和原停止状态保留。

生成27份K5/K10/K20嵌套成员设计，其中K10九份；公开只保留人数预算，成员私有。本轮没有任何K10参考拟合、目标生成、训练、验证新预测或AUC。原0.730433/0.715842/0.690140和所有停止分支保持。[人员预算](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-supports)、[完整K10方案](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-next)、[本轮执行前范围](https://onephantomcat.github.io/neurograph-site/#evidence?source=brainhgt-small-sample-readiness-20261028-plan)。

## 实际执行及核验

仅对原52/53训练人员进行30次eval前向，计算第一Linear的CE及0.1×辅助几何梯度；没有optimizer、参数更新、验证/外查询前向、新参考或MRI读取。既有验证预测只用于重算和描述。K10支持设计已生成，参考/scaler和36模型均未拟合。

服务器UID1020、CPU2/GPU0，20.268131秒自然结束。15旧权重文件读取、选轮/末轮30次训练前向和autograd，无optimizer或参数更新；未改写原模型文件。原版/旧几何只复用保存曲线/验证预测，本轮未读它们的权重或再评分。独立指标和原预算/成员核对通过；梯度数值来自Torch，另行核对其范数/余弦标量关系，不冒充独立NumPy重建全部网络梯度。

4500曲线、30条排序漂移、30梯度状态和27份嵌套支持设计核对通过；其中9份K10。独立指标误差2.22e-16，训练回放概率差1.19e-07、logit差1.91e-06，保存CKA差5.96e-08；权重保持，训练/参考拟合0、验证新前向0。

仅原SRPBS79人已反复开发池、原三内折；验证参与原选轮。本轮没有新增K5/K10/K20成绩，36模型只是拟议先导。固定轮次和梯度为开发后描述，不给因果、独立泛化或新类别元学习结论；重复人员/配对不增加样本量。

原20/CoSpine13/新队列评分、新MRI/ROI/FC/QC改判、作者联系0；132用户授权/25注意/新增专家0、133QC排除/2身份HOLD、TN14及既有全部阴性保持。无新Goal/聊天/自动化/memory写入。本阶段零训练归因完成，研究总目标和独立临床验证仍未完成。

<Self-Audit>本轮只用原训练人计算梯度，验证复用旧预测；新支持成员均在原内训练侧且平衡嵌套。复用模型、目标、曲线、人员与发布组件，无新训练或参考拟合。既有验证反复开发，局部梯度和时序变化只作描述，K10预算仅方案，未新增hash/冻结contract/baseline机制/gate。</Self-Audit>


<!-- brainhgt-k10-pilot-20261028 -->

## 2026-10-29：BrainHGT K10先导：AUC 0.6585，未达到预定要求

36个新模型、7200更新、3600选轮完成。每类10名训练支持人，原三内折、三支持抽样、两个初始化；原版验证AUC 0.6277，固定目标版0.6585，Δ+0.0308。两个初始化中2/2正向、三个支持组中3/3正向。

人员配对条件95% [-0.0132,+0.0707]；ΔBrier +0.0025、Δlogloss +0.0222。未同时满足预先列出的AUC、支持/初始化方向和概率质量要求，结束本固定K10先导，不自动追加支持组、K档位或参数搜索。 未满足项：平均Brier恶化；平均logloss恶化；人员条件AUC区间下界未大于0。

仅原SRPBS79人反复开发池。K10指20名训练支持人，另有26/27名带标签验证人用于100次选轮；不等于总计只接触20个标签。两个初始化、三个支持组相互依赖，条件区间不含重训、重抽支持、选轮或累计研究选择。不是新类别元学习、未开发H-test或临床验证。

停止本固定K10配置并保留全部支持/初始化及阴性。下一步仅复用已有预测、曲线和权重定位支持组差异或泛化问题，取得新机制依据后再明确有限修改；不直接扩大K、λ或训练时长。 原三个临床终点和独立人员验证要求保持。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/brainhgt-k10-pilot-20261028.md)。

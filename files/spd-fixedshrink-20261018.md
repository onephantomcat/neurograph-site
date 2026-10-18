# 本地SPDNet固定支持收缩率与近期工作对照

2026-10-18；本地任务适配，未宣称官方原任务复现。

基于模型：本地单BiMap SPDNet任务适配（90→16，logSPD，四协变量）。

本轮改动：逐人Ledoit–Wolf λ改为支持集λ中位数；网络/优化器不变。

代码整理工具：Codex（GPT-6系列；当前环境未提供具体子型号）。

250次原SPDNet固定支持收缩率训练完成。五成员集成AUC（原→固定）：K10 0.731592→0.734501，K20 0.775604→0.770218；两项差值区间均跨0。五seed成员均值K10 0.687097→0.675867，K20 0.712612→0.704115。

原/固定logdet仍高度相关；固定支持收缩率没有带来稳定AUC增益，不能把既有退化归结为逐人收缩率。K20集成Brier和logloss略改善，但AUC下降；不以一个指标替代另一个指标。保留原SPDNet，停止本轮配置，不继续扫描收缩率。

每个支持集合只用其λ_i中位数；不读查询λ或标签确定该参数。经验协方差按原λ_i反推后复原原C，最大误差1.11e-16。新输入需要50个新支持几何参考和白化；模型参数和训练更新数不变。支持特征均值/RMS独立复核误差6.11e-16，250权重严格重载误差0，独立NumPy前向误差3.33e-15；50000步损失有限。参考迭代残差最大3.77e-8，属于数值近似。

诊断只用支持人员，重复人员不当成新样本。每预算25支持面板统计如下：

|K|λ中位数均值|矩阵相对改变量均值|原/固定logdet相关均值|原病例SMD|固定病例SMD|
|---:|---:|---:|---:|---:|---:|
|10|0.061686|0.012618|0.964325|0.888729|0.964793|
|20|0.061250|0.012712|0.960465|0.803225|0.873352|

SMD是面板内病例与对照差值除两类总体方差平均平方根，仅为支持样本描述。原/固定几何体积的头动关系、站点内病例差和不适用面板全部保留，未按结果删面板。

训练耗时220.647秒，CPU双线程；诊断2.401秒。原K10/20 250模型复用，新250模型及50参考保留；未修改其他任务进程、GPU或系统环境。

原同人同支持同200步SGD与五seed；只改协方差收缩规则，因输入改变重新拟合50个支持侧几何参考/白化及特征尺度；未使用查询人估计lambda或参考。

当前99人（46病例/53对照）已用于模型开发；5外折×5支持重复×5初始化seed，不是125组独立人群。条件人员区间仅覆盖固定预测，不覆盖重训或研究选择。诊断、MRI时疼痛及治疗反应三个临床终点仍未完成；不改QC、CoSpine13留出或TN14停止。

下一步优先检验原模型在同站点、病例对照均可评估的人员中的排序及错误是否集中于采集/处理层；先复用已有固定预测做描述与不确定性分析，不按测试结果选择新结构。若站点内信息也弱，需补充与疼痛相关的独立训练来源及可信标签，再决定预训练或模型改动。

[本轮比较](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-comparison.md)；[组员近期工作表](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-recent.md)；[近期全部模型均值](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-recent-metrics.csv)；[近期全部种子](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-recent-seeds.csv)；[训练前方案](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-plan.md)；[250模型与原模型600项指标](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-model-panels.csv)；[原始聚合](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-summary.json)。

<Self-Audit>仅支持内确定估计器参数；保持原模型和全部seed。AUC无稳定改善，停止该配置；未以概率指标改善宣称排序提升或独立临床验证。</Self-Audit>

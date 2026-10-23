# BrainHGT标签平滑与社区原型有限调优结果

2026-10-23。

30个新模型、15个已保存CPU参照完成比较。原模型／标签平滑／解冻社区原型的内层AUC为0.6901/0.6927/0.6876，logloss为0.8658/0.8291/0.8125；全部五种子和阴性差值保留。

仅训练标签平滑0.1对原参照ΔAUC +0.002564，4/5种子正向，Δlogloss -0.036696，ΔBrier +0.006836。 仅解冻2048个社区原型参数对原参照ΔAUC -0.002564，1/5种子正向，Δlogloss -0.053369，ΔBrier -0.005264。 本轮固定配置已结束，不按单个最好种子追加搜索。

SRPBS99诊断开发，仅原outer0训练79人的三个内折，训练52/53、验证27/26；五seed共享人员且验证参与选轮，非99人完整OOF、K-shot或独立临床验证。20名原外查询新评分0；原标签、QC、13人CoSpine留出与TN14停止不变。

## 同人同预算结果

|方法|可训练参数|内层AUC均值±SD|AP|BA|敏感性|特异性|Brier↓|logloss↓|
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|完整BrainHGT／复用CPU参照|3307690|0.690140 ± 0.016670|0.673200|0.595757|0.353419|0.838095|0.273345|0.865824|
|仅训练标签平滑0.1|3307690|0.692705 ± 0.013648|0.673625|0.586355|0.434615|0.738095|0.280182|0.829129|
|仅解冻2048个社区原型参数|3309738|0.687576 ± 0.017424|0.668555|0.599664|0.385043|0.814286|0.268081|0.812455|


每seed先平均三个内折，再对五seed计算算术均值与样本SD；不是先集成概率，也不是五个独立队列。不同方法均使用最高内验证AUC选轮，因此这些数值是训练内开发结果，不能与历史完整OOF AUC0.6292直接相减。

## 实际改变的位置

两项分别改动，不叠加：训练CE固定epsilon0.1（真类0.95/另一类0.05），或仅令随机初始化的8个256维社区原型（共2048参数）可训练。原Dice、OMST、signed FC、展平encoder和作者网络容量保持，均从头训练100轮、batch32、Adam1e-4/wd1e-4、最高验证AUC最早选轮。总参数3309738；可训练参数标签平滑3307690，原型解冻3309738。多2048个可训练参数不等于整模型变成小模型。

原型初始状态不是已学到的疾病权重。解冻会改变注意力查询与社区残差，不能把这轮说成只改变Dice先验或新增医学预训练。原型解冻只增加可训练自由度，总参数不增加。

## 方法依据与旧失败区别

[标签平滑原始分析，NeurIPS2019](https://papers.nips.cc/paper/8717-when-does-label-smoothing-help)研究软目标对过度自信、泛化和校准的影响；它不保证在本项目改善，不能称新算法。只在训练损失临时计算软目标，原标签和硬标签评价不变。

[作者原型实现](https://github.com/null-cks/BrainHGT/blob/4f411fab1163e24f0b54e9cb398fbfe5928ce833/source/models/BrainHGT/components/clustering.py)默认freeze_centers=True，原型为随机初始化。q_proj本来就可学习，所以不能声称原模型社区完全固定；解冻也同时影响q_proj输入和社区残差，不是只改变查询。这里仅在模型实例上切换requires_grad，不修改作者核心源码。

这与AdamW、均衡CE、最低logloss选轮、ROI共享encoder不同。标签平滑不是样本类别权重；解冻原型不是调Dice空间先验的16系数；二者均未使用自监督、外部预训练或时间窗口。旧停止范围保留，不将普通训练策略称疼痛特异机制。


## 固定末轮补充

|方法|固定100轮AUC|固定100轮logloss↓|固定100轮Brier↓|所选轮均值|
|---|---:|---:|---:|---:|
|完整BrainHGT／复用CPU参照|0.654792|1.591188|0.327115|18.27|
|仅训练标签平滑0.1|0.661203|0.907332|0.289713|17.13|
|仅解冻2048个社区原型参数|0.652106|1.576387|0.324864|12.93|


以上固定100轮数值来自已保存逐轮记录，用于观察选轮影响；不替换主分析，也不追加末轮选择。只有主要所选权重做了严格概率回放，末轮未另存权重，不把末轮记录说成独立权重回放。

## 复核与预算

45个保存模型严格加载重放，概率最大差0，logit最大差0；独立sklearn指标误差2.22e-16。逐模型原人员、100轮和最早最高AUC选轮核对；初始化3人logit差0。Dice保持，原型只有解冻臂出现梯度和参数变化；标签平滑损失与梯度经独立公式核对。复核未重拟合。

复核首次因服务器训练环境缺sklearn中断；另一服务器环境只读探测也缺该库。保留两项技术记录，在原Torch环境重放权重，再把小型预测记录私有读回本机已有sklearn环境独立复算。未安装软件、未传输原MRI或重训，公开仅含聚合。

30个新模型共3000轮；15个原参照的1500轮来自既有实验，新增原参照拟合0。CPU两线程实际1849.17秒，非隔离性能基准；新增权重397891772字节留私有服务器。科学拟合失败和自动重试0，MRI读取/转运0，外查询新评分0。逐人预测、成员与权重不公开。

## 结论和后续

当前两项设置没有同时出现至少4/5种子AUC改善、平均logloss与Brier不恶化的组合，停止这两个固定配置，不追加平滑强度或原型学习率搜索；后续调优需先有新的具体机制依据。

上述种子方向与均值用于描述本批结果，不是预注册的显著性检验或独立确认；不能把选中的内验证成绩称为无偏泛化估计。

本有限批次执行与复核完成，不代表诊断泛化、扫描同期痛、治疗反应、小样本稳健性或研究总目标完成。

[全部十五项种子](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-seeds.csv)、[全部四十五项模型指标](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-metrics.csv)、[三组均值](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-means.csv)、[配对差值](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-comparisons.csv)、[复核](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-verification.json)、[拟合前方案](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-plan.md)、[方法来源](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-literature.md)、[失败与复用](https://onephantomcat.github.io/neurograph-site/files/brainhgt-bounded-tuning-20261023-failures.csv)。

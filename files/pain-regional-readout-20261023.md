# BrainHGT疼痛相关区域读出与排序适配结果

2026-10-23。

45个新增区域残差头、五seed完成，15个诊断监督源直接复用。原模型／全脑／对照区域／疼痛相关区域的内层AUC为0.6901/0.6562/0.6411/0.6611。

疼痛相关读出对复用原诊断模型／无新增读出ΔAUC -0.029090，1/5种子正向，Δlogloss +0.052350，ΔBrier +0.006551。 疼痛相关读出对全90区均匀读出＋排序ΔAUC +0.004884，2/5种子正向，Δlogloss -0.042747，ΔBrier -0.014163。 疼痛相关读出对固定对照6区读出＋排序ΔAUC +0.019902，4/5种子正向，Δlogloss -0.050739，ΔBrier -0.014076。 疼痛分支训练AUC 1.0000，不能由训练拟合或胜过较弱对照声称改善。

SRPBS99诊断开发，仅原outer0训练79人的三个内折，训练52/53、验证27/26，五seed共享人员。来源检查点曾由当前内验证选轮，新头固定200步；非完整99人OOF、K-shot或独立临床验证。20名原外查询新评分0，原标签/QC、13人CoSpine留出与TN14停止不变。

## 四路结果

|方法|本轮新增可训练参数|内层AUC均值±SD|AP|BA|敏感性|特异性|Brier↓|logloss↓|
|---|---:|---:|---:|---:|---:|---:|---:|---:|
|复用原诊断模型／无新增读出|0|0.690140 ± 0.016670|0.673200|0.595757|0.353419|0.838095|0.273345|0.865824|
|全90区均匀读出＋排序|2064|0.656166 ± 0.020995|0.662504|0.597924|0.452991|0.742857|0.294060|0.960921|
|固定对照6区读出＋排序|2064|0.641148 ± 0.028258|0.614545|0.592521|0.485043|0.700000|0.293972|0.968913|
|疼痛相关6区读出＋排序|2064|0.661050 ± 0.023585|0.671079|0.610348|0.473077|0.747619|0.279896|0.918174|


三内折先平均，再五seed算术均值和样本SD，不是概率集成。三路新增读出均45个模型中的15个、2064参数和200更新；原模型本轮新增训练0、但来源已用约331万参数训练100轮，不能称原模型从未训练或四路同额外成本。

## 结构改动

保留完整作者BrainHGT、signed FC/OMST/Dice和冻结社区原型，复用当前内训练人的诊断监督检查点，主干及原分类头冻结并eval。从最后LSRA的90×256节点表征取区域均值，仅当前训练人标准化，再接256→8 tanh→1零输出残差，加到原患者logit。三路新增参数均2064，总参数3311802，同200全批Adam1e-3/wd1e-4，患者—对照成对logistic排序目标，不用验证选择新轮数。原来源模型约331万参数的历史监督训练成本仍存在。

原分类路径仍完整保留；新增分支只改患者logit。初始最后线性层为0，所有方法从相同原预测起步。原社区空间先验、原型、OMST及FC均不变。输入是诊断队列，区域名字不能把诊断标签变成扫描同期疼痛。

## 方法依据与适用限制

- [Jensen等，Pain2016，PMID26871535](https://pubmed.ncbi.nlm.nih.gov/26871535/)：实际核对可读原摘要，患者和健康者共同激活涉及丘脑、ACC、岛叶及小脑。本轮取前三类的AAL90粗粒度双侧子集，未使用原ALE体素权重；没有把激活元分析当FC诊断性能证据。双侧完整AAL区是本地适配选择，不是逐体素复现。
- [Mouraux等，NeuroImage2011作者PDF](https://iannettilab.net/pdfs/a_multisensory_investigation_into_the_pain_matrix.pdf)：实际打开正文，摘要/引言及研究结论说明这些反应大量涉及显著性和非伤害性过程。因此本轮只称疼痛相关区域先验，不称疼痛特异标志物、NPS或确定的疼痛网络。
- [RankNet原始论文，ICML2005](https://www.microsoft.com/en-us/research/publication/learning-to-rank-using-gradient-descent/)：成对logistic排序已有方法，本轮不是新损失，训练排序改善不保证留出AUC。排序分数的softmax值未单独校准，Brier/logloss作为误差对照，不宣称临床概率。
- [NERVE，MICCAI2026正式摘要](https://papers.miccai.org/miccai-2026/0708-Paper3895.html)：已有网络身份和解剖分块思想。本轮没有双线性tokenizer、MAE或作者的发育队列预训练，不冒称NERVE复现或机制原创。

Jensen/Duerden的PubMed/PMC正文和EuropePMC XML部分请求失败，范围仅上述可读摘要；不声称元分析全文精读。AAL名称核对来自项目已用标准图谱包的Node_AAL90，输入沿既有ROI1..90顺序；本轮未读取新患者MRI或重新配准。

主先验6区：INS.L/R、ACG.L/R、THA.L/R。拟合前种子20261023选择的6区对照为SFGmed.L/R、SOG.L/R、PUT.L/R，两组都是两个皮层双侧对加一个皮层下核团双侧对。对照区域也可能与疼痛相关，单一对照不能证明特异性。LSRA已整合全图信息，选定位置的表征不是纯局部活动；AAL整块岛叶和前扣带不能区分所有亚区。

与旧失败的差别：不调Dice16系数、不解冻原型、不叠标签平滑；不重开跨半SSL。本轮使用已有诊断监督源，读出位置在LSRA节点层，增加标量残差并统一成对排序。与历史SSL的来源和损失都不同，不能用跨阶段差值归因单因素；三路内部只改区域池化。


## 拟合与留出差距

原模型训练AUC 0.982540；全脑/对照/疼痛分支训练AUC 0.997321/0.995040/1.000000，但新增三路验证AUC均低于原模型。疼痛分支训练排序目标从0.120718降到0.015131，不能作为验证改善；表现支持当前设置仍过拟合，而非已证明解剖先验完全无效。

疼痛分支尚未稳定优于原模型和两个匹配读出，停止当前固定区域残差/排序设置，不追加区域、瓶颈、步数或排序权重搜索。训练拟合好而验证下降的记录保留；后续结构改动需要新的具体依据。

## 复核与执行预算

45头严格加载，修改后完整模型forward与缓存预测logit最大差0，概率回放差0；NumPy头logit差4.05e-07，成对排序梯度差3.62e-08，损失差6.36e-09。本机sklearn复算60组480指标最大差3.33e-16。零残差等价、三路首步损失一致、主干不变及训练侧尺度/人员核对通过。原CPU参照概率与历史保存值最大差1.19e-07，AUC未变。

区域池化独立NumPy误差9.54e-07，训练尺度误差0。当前原参照排序损失曾在私有汇总中填0，发布前按三个零残差分支完全相同的实算首步损失恢复为0.120718；原值与修复记录保留，没有更改预测或主要结论。

CPU两线程实际30.163秒，包含源前向、缓存及45头训练，不是隔离benchmark。新增45头×200=9000更新，15源零重训；新增头权重673920字节，缓存109270890字节均保留私有服务器。科学拟合失败/自动重试0，MRI读取/转运和外查询新评分0。只私有读回小预测，在已有本机sklearn复算，没有安装新软件。

本有限阶段完成，研究总目标与独立临床验证未完成。训练内多次开发和来源检查点选择的偏差不能由五seed消除。

[全部二十项种子](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-seeds.csv)、[全部六十项模型指标](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-metrics.csv)、[四组均值](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-means.csv)、[三组配对差值](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-comparisons.csv)、[区域名单](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-regions.csv)、[新增模型模块](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-code.py)、[执行说明](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-reproduction.md)、[复核](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-verification.json)、[拟合前方案](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-plan.md)、[方法依据](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-literature.md)、[失败与更正](https://onephantomcat.github.io/neurograph-site/files/pain-regional-readout-20261023-failures.csv)。

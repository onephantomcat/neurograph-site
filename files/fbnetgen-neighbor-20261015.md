# FBNetGen邻居聚合：四条件五种子对照

2026-10-15，20:05:59完成批次及比较。

SRPBS99、原五外折/三内折、seed0–4。新增150次内层和50次外层训练，复用原行和版本200次拟合。邻居聚合＋可学习图AUC 0.5844±0.0590，邻居聚合＋固定图0.5970±0.0406；原行和＋可学习图0.6678±0.0594，原行和＋固定图0.6098±0.0311。

| 方法 | 五种子平均AUC±样本SD | AP | BA | 敏感性 | 特异性 | Brier | logloss |
|---|---:|---:|---:|---:|---:|---:|---:|
| 原行和缩放＋可学习图 | 0.6678±0.0594 | 0.6113 | 0.5900 | 0.3913 | 0.7887 | 0.2371 | 0.6766 |
| 原行和缩放＋固定图 | 0.6098±0.0311 | 0.5606 | 0.5721 | 0.3783 | 0.7660 | 0.2611 | 0.7442 |
| 邻居聚合＋可学习图 | 0.5844±0.0590 | 0.5320 | 0.5661 | 0.4870 | 0.6453 | 0.2828 | 0.8487 |
| 邻居聚合＋固定图 | 0.5970±0.0406 | 0.5476 | 0.5776 | 0.5174 | 0.6377 | 0.2865 | 0.8827 |

本轮没有提高指标。邻居版本可学习图减固定图ΔAUC −0.0126，条件95%区间[−0.0530, 0.0285]，仅2/5种子为正；可学习图改为邻居聚合后比原行和版本低0.0833，条件区间[−0.1584, −0.0109]，仅1/5种子提高。不能把更合理的聚合运算直接称为性能改善。

| seed | 原行和可学习 | 原行和固定 | 邻居可学习 | 邻居固定 | 邻居可学习减固定 |
|---|---:|---:|---:|---:|---:|
| 0 | 0.5915 | 0.6116 | 0.6185 | 0.5808 | +0.0377 |
| 1 | 0.7203 | 0.5931 | 0.6501 | 0.6444 | +0.0057 |
| 2 | 0.6444 | 0.6079 | 0.5328 | 0.5566 | -0.0238 |
| 3 | 0.7354 | 0.5767 | 0.6083 | 0.6362 | -0.0279 |
| 4 | 0.6473 | 0.6596 | 0.5123 | 0.5669 | -0.0546 |

| 预先指定比较 | 平均ΔAUC | 同人条件95%区间 | 正方向seed |
|---|---:|---:|---:|
| 邻居：可学习图减固定图（主比较） | -0.0126 | [-0.0530, 0.0285] | 2/5 |
| 可学习图：邻居减行和 | -0.0833 | [-0.1584, -0.0109] | 1/5 |
| 固定图：邻居减行和 | -0.0128 | [-0.0872, 0.0623] | 2/5 |
| 图类型差异：邻居减行和（交互） | -0.0705 | [-0.1341, -0.0084] | 1/5 |

作者预测器三处行和缩放在本轮改为真正邻居聚合，其余既定训练设置不变。这是SRPBS诊断开发上的本地模型修改，不是PNC/ABCD论文原任务复现；条件区间不覆盖重训和历次开发选择，也不构成同期疼痛、治疗反应或独立临床验证。

200份新检查点严格读回，最大概率误差0，复核重拟合0；旧200份训练记录与OOF只读复用。20个条件×种子组合的全部指标用sklearn独立核算，最大差2.22e-16；2000次同人bootstrap用加权正负样本对独立核算，四个区间差0。病例46/99，阈值固定0.5。每个种子先计算99人的完整OOF AUC，再取五种子均值和样本SD，不用平均概率替代。四项区间是预先指定比较的逐项条件区间，未作多重比较校正，不代表覆盖重新训练、调参及历次研究选择。

本轮仅将作者预测器三处einsum从`ijk,ijp->ijp`改为`ijk,ikp->ijp`。合成同度、同对角、异拓扑反例中，旧输出差0，新logits差0.013021；这证明运算利用了邻居，不证明泛化性能改善。原图尺度、模型层、图生成器、初始化、优化器、损失和训练协议保持，未针对新运算重新调参，不能据此推断所有邻居聚合模型都无效。

输入AAL90时序[B,90,240]，signed FC节点特征[B,90,90]，二分类logits[B,2]；固定邻接abs(Pearson FC)，可学习邻接来自softmax ROI embedding内积，无新增度归一化。保留原FC节点输入的符号和对角。原GRU4层/window4/embedding8、batch16、Adam lr/weight_decay各1e-4、mixup alpha1、两倍CE、作者cluster loss和1e-4图L1。无协变量头；只用训练人员估计标量缩放，保持原99人身份、标签、QC和五外折/三内折；每个内层最多100轮，最高内层AUC、并列取最早轮，外层按三个选轮的中位数重训。

作者commit 3ed6c813920966a40fca9ffca41f90a6384e333c；原任务数据和训练脚本未在本轮完整复现。与论文设置的差异仍包括SRPBS诊断、原人员嵌套划分、训练内缩放、100轮内层上限及匹配的CE倍数。既有切空间FC＋4协变量参考AUC0.7526661198，本轮四种神经条件均更低；输入及模型选择设置不同，不作单因素归因，也不把该参考写成本轮新拟合。

本轮结束，不按外层分数追加配置。若继续，先在合成或训练内检查聚合尺度与优化稳定性，再另列有限方案；临床终点和独立人员验证仍待补齐。

作者来源：[FBNetGen论文](https://proceedings.mlr.press/v172/kan22a.html)、[作者代码](https://github.com/Wayfear/FBNETGEN)。

[拟合前方案](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-plan.md) · [全部种子指标](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-metrics.csv) · [均值与SD](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-means.csv) · [预指定四项差值](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-contrasts.csv) · [逐外折](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-folds.csv) · [内层](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-inner.csv) · [外层轮数](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-selection.csv) · [老师对照表](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-comparison.md) · [聚合](https://onephantomcat.github.io/neurograph-site/files/fbnetgen-neighbor-20261015-summary.json)

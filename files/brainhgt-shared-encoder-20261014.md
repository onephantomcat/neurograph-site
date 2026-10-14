# BrainHGT五种子共享encoder结构对照

SRPBS99原模型 0.6292±0.0280；ROI共享32未通过内层保留标准，未算新外层AUC，ROI共享994 0.5934±0.0299。偏头痛132原模型 0.4888±0.0581；ROI共享32未通过内层保留标准，未算新外层AUC，ROI共享994 0.5094±0.0468。

|队列|结构|五seed完整OOF AUC均值±SD|BA|敏感性|特异性|Brier↓|logloss↓|
|---|---|---:|---:|---:|---:|---:|---:|
|SRPBS99|原展平32|0.6292±0.0280|0.5597|0.3043|0.8151|0.2660|0.8049|
|SRPBS99|ROI共享994|0.5934±0.0299|0.5608|0.4348|0.6868|0.2977|0.9590|
|偏头痛132|原展平32|0.4888±0.0581|0.4964|0.9928|0.0000|0.1412|0.4845|
|偏头痛132|ROI共享994|0.5094±0.0468|0.4920|0.9459|0.0381|0.1644|0.5668|

SRPBS99ROI共享994 ΔAUC-0.0358，条件95%[-0.0783,0.0065]，1/5种子正方向。未获可靠判别增量。 偏头痛132ROI共享994 ΔAUC+0.0206，条件95%[-0.0322,0.0762]，3/5种子正方向。未获可靠判别增量。

|队列|候选|内层平均ΔAUC|5seed正方向|内层平均Δlogloss|保留外层评估|
|---|---|---:|---:|---:|---|
|srpbs|shared32|-0.0096|0/5|+0.0690|否，未计算新外层AUC|
|srpbs|shared994|+0.0043|4/5|-0.0198|是|
|migraine|shared32|+0.0500|5/5|+0.0486|否，未计算新外层AUC|
|migraine|shared994|+0.0743|5/5|+0.0192|是|

每seed完整OOF AUC再取五seed均值±样本SD。2000同人配对条件bootstrap不覆盖重训/选参/开发历史，不平均概率。

既有SRPBS99与偏头痛132诊断开发。共享结构仅替换社区encoder；原输入/OMST/先验/标签/QC/人级分区保持。无同期疼痛、疗效或独立临床验证。

停止未获得稳定增量的共享结构，不扩宽度或种子搜索；后续优先取得可对齐MRI的真实临床终点和独立人员证据。

## 实际改动与公平比较

原encoder为23040→32→32→23040，全90×256展平；共享变体只替换clustering_module.encoder，接受相同展平接口，在每个ROI的256维上共用三层MLP，再恢复展平。共享32参数17,728，总模型1,828,778；共享994参数1,499,208，总模型3,310,258；原encoder1,498,688，总3,309,738。共享994比原encoder多520参数，接近参数量不等于表达能力相同。其余46个初始tensor逐值相同、训练RNG状态保持；初始化新encoder不是加载已拟合权重。

原signed Pearson FC/真实OMST/AAL90顺序不动；解剖先验乘法、Entmax、冻结8×256原型、长短注意力/社区注意力/归一化/分类头保持。Adam lr/wd各1e-4、普通CE、batch32、最高内层AUC最早精确并列、100轮及中位轮数向下外层重训、阈值0.5保持。无协变量头、权重/阈值/校准搜索。共享32同时改变参数量与连接结构；共享994用来补充这个区分，不能证明全脑瓶颈是唯一过拟合原因。

SRPBS99：原5外折各3内折，外训练79/80、查询19/20，内训练52–54/验证26–27。偏头痛132：原3外折各2内折，外训练88/查询44、内训练44/验证44；111/132病例先验保留。各seed先完整拼OOF再平均AUC，不对概率先求平均。原模型的105内层轨迹及40外层权重复用，无刷新重训。

候选保留规则在任何新拟合前写明：每队列/变体相对原模型内层平均ΔAUC>0，至少3/5种子方向正，平均Δlogloss≤0.02。被选最高AUC的验证指标存在乐观偏差，仅用于有限可行性；不使用外层查询作保留判据。未通过不计算或虚填外层AUC。全部正负结果及未执行项保留。

实际新拟合：内层210，外层40，合计250；预先最多210/80，没有扩配置或自动重试。严格检查点读回250，引用原外层40；最大概率差1.1920928955078125e-07。人员成员、最早选轮/中位轮数、参数及冻结原型、全部指标回放通过；回放重拟合0。2000同人配对bootstrap的独立正负pair-count与AUROC误差3.3306690738754696e-16。区间条件于当前已拟合模型，不覆盖重新训练、选参或历次开发。

实际环境沿原Python3.10.20/PyTorch2.4.1+cu121/NumPy1.26.4/CUDA12.1、float32/TF32关闭/2CPU线程；两个固定队列在GPU1/2执行，服务器共享非隔离吞吐。MRI/权重/逐人预测留服务器，只传私有小JSON。无新人员/标签/专家报告/QC纳入改变，原Emo收缩、TN14、预训练及CoSpine停止与留出边界保持。

## 贡献与临床边界

ROI共享是常见参数共享设计，只是本地结构任务适配，不称原作者完整原任务复现、原创共享机制或新疼痛生物标志物。未做社区重测、疼痛关联、疗效或独立临床检验。诊断AUC升降不能填补原三个临床终点。[临床字段盘点](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-clinical.md)分别保留已有与缺失证据。

## 可核对材料

[拟合前方案](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-plan.md)、[全部seed指标](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-metrics.csv)、[均值与差值区间](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-means.csv)、[全部新内层指标](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-inner.csv)、[保留决定](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-decisions.csv)、[逐外折](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-folds.csv)、[外层重训轮数](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-selection.csv)、[必要代码片段](https://onephantomcat.github.io/neurograph-site/files/brainhgt-shared-encoder-20261014-code.py)。

方法来源：[作者模型固定版本](https://github.com/null-cks/BrainHGT/blob/4f411fab1163e24f0b54e9cb398fbfe5928ce833/source/models/BrainHGT/components/clustering.py)、[BrainHGT原论文](https://arxiv.org/html/2511.17604)、[Deep Sets](https://arxiv.org/abs/1703.06114)。它们支持方法身份，不提供本项目疼痛增量证据。

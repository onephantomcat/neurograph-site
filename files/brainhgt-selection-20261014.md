# BrainHGT五种子选轮对照

SRPBS99：AUC选轮 0.6292±0.0280，logloss选轮 0.6518±0.0261；偏头痛132：AUC选轮 0.4888±0.0581，logloss选轮 0.4851±0.0205。

|队列|选轮规则|五seed完整OOF AUC均值±SD|BA|敏感性|特异性|Brier↓|logloss↓|
|---|---|---:|---:|---:|---:|---:|---:|
|SRPBS99|最高验证AUC|0.6292±0.0280|0.5597|0.3043|0.8151|0.2660|0.8049|
|SRPBS99|最低验证logloss|0.6518±0.0261|0.6201|0.4478|0.7925|0.2403|0.6820|
|偏头痛132|最高验证AUC|0.4888±0.0581|0.4964|0.9928|0.0000|0.1412|0.4845|
|偏头痛132|最低验证logloss|0.4851±0.0205|0.5000|1.0000|0.0000|0.1380|0.4585|

SRPBS99 ΔAUC+0.0226，条件95%区间[-0.0466,0.0906]；Δlogloss-0.1229，ΔBrier-0.0258。判别差异未获可靠支持。 偏头痛132 ΔAUC-0.0037，条件95%区间[-0.0609,0.0537]；Δlogloss-0.0260，ΔBrier-0.0032。判别差异未获可靠支持。 两队列logloss差值的固定模型条件区间均低于0，支持本批概率损失降低；Brier差值区间均跨0。偏头痛仍全部预测患者，BA为0.5、特异性为0；较小seed波动不能当有效判别。

平均AUC是各seed完整OOF AUC的算术均值，SD为样本SD；没有平均预测概率。

SRPBS99与偏头痛132诊断开发；原完整模型/OMST、标签/QC/人员分区保持。五seed共享人员；无扫描同期疼痛、治疗响应或独立临床验证。

2000次同人配对条件重采样，每次分别计算五seed OOF AUC再平均；不平均概率、不覆盖重训/选轮或开发历史。

结束本次有限选轮对照，不扩选轮/优化器搜索；后续结构研究单列机制与公平消融，同时补真实临床终点和独立人员。

## 实际实施

完整作者模型3309738总参数/3307690可训练，256维、8头、1层、FF1024、社区encoder32、8社区、dropout.1；signed FC与原OMST均[B,90,90]，AAL90固定。原图内部仍二值化/hop，原型冻结；作者核心、图、标签、QC、人员分区无修改。无协变量头、温度/阈值/类别权重搜索。

Adam lr1e-4、wd1e-4、普通CE、batch32、每内层100轮。同一训练轨迹保存最高验证AUC与最低验证未加权logloss权重，精确并列取最早；各自内层轮数中位数向下取整重训外层全部训练人，阈值固定.5。最低logloss是既有float32概率转float64并按float32 epsilon裁剪的指标，未换logit损失实现。

原最高AUC选轮的105个内层权重逐张量完全复现，所有所选轮次一致，故复用40个原AUC外层模型。logloss中位轮次相同则共用原权重，不重复训练、不把引用计为独立拟合。实际预算：{"inner_trajectories": 105, "new_final": 38, "reused_auc_final": 40, "reused_logloss_final": 2}。两个worker累计墙钟0.3184小时，共享服务器非隔离吞吐，另有回放开销。环境沿既有Python3.10.20/PyTorch2.4.1+cu121/NumPy1.26.4/CUDA12.1，float32、TF32关闭、作者MHA fastpath关闭。

|队列|外层训练/查询人数|内层训练/验证人数|
|---|---|---|
|SRPBS99|[79, 79, 79, 79, 80] / [20, 20, 20, 20, 19]|[[52, 53, 53], [52, 53, 53], [52, 53, 53], [52, 53, 53], [53, 53, 54]] / [[27, 26, 26], [27, 26, 26], [27, 26, 26], [27, 26, 26], [27, 27, 26]]|
|偏头痛132|[88, 88, 88] / [44, 44, 44]|[[44, 44], [44, 44], [44, 44]] / [[44, 44], [44, 44], [44, 44]]|

## 全部seed与跨折口径

|队列|规则|seed|完整OOF AUC|折均AUC|BA|Brier|logloss|
|---|---|---:|---:|---:|---:|---:|---:|
|SRPBS99|auc|0|0.597211|0.620990|0.552092|0.256437|0.719200|
|SRPBS99|auc|1|0.665299|0.702121|0.579573|0.249524|0.740826|
|SRPBS99|auc|2|0.605824|0.676646|0.532404|0.279510|0.840480|
|SRPBS99|auc|3|0.632486|0.687212|0.578138|0.282098|0.940598|
|SRPBS99|auc|4|0.645201|0.680505|0.556399|0.262603|0.783566|
|SRPBS99|logloss|0|0.636587|0.715515|0.639664|0.240652|0.677322|
|SRPBS99|logloss|1|0.638638|0.685091|0.602748|0.235857|0.664471|
|SRPBS99|logloss|2|0.624282|0.681374|0.609311|0.250955|0.703887|
|SRPBS99|logloss|3|0.676784|0.687273|0.590443|0.232242|0.659213|
|SRPBS99|logloss|4|0.682527|0.699737|0.658532|0.241560|0.705344|
|偏头痛132|auc|0|0.456027|0.500644|0.486486|0.148866|0.489826|
|偏头痛132|auc|1|0.421707|0.477477|0.500000|0.138005|0.454301|
|偏头痛132|auc|2|0.573574|0.574003|0.495495|0.138520|0.463527|
|偏头痛132|auc|3|0.478335|0.469755|0.500000|0.141222|0.525027|
|偏头痛132|auc|4|0.514372|0.504505|0.500000|0.139191|0.489695|
|偏头痛132|logloss|0|0.502360|0.552124|0.500000|0.139906|0.467343|
|偏头痛132|logloss|1|0.492063|0.523810|0.500000|0.135592|0.445497|
|偏头痛132|logloss|2|0.469755|0.482625|0.500000|0.134466|0.440956|
|偏头痛132|logloss|3|0.503647|0.460746|0.500000|0.139455|0.479484|
|偏头痛132|logloss|4|0.457743|0.528958|0.500000|0.140516|0.459242|

主结果保留拼接完整OOF，折均同时公开；不同折概率尺度可影响拼接排序，不改口径掩盖结果。

## 配对差异与选轮偏差

|队列|指标|logloss规则−AUC规则|条件95%区间|
|---|---|---:|---|
|SRPBS99|auc|+0.022559|[-0.046614,0.090614]|
|SRPBS99|ba|+0.060418|[-0.002577,0.122005]|
|SRPBS99|brier|-0.025781|[-0.057062,0.004939]|
|SRPBS99|logloss|-0.122886|[-0.241960,-0.015162]|
|偏头痛132|auc|-0.003689|[-0.060923,0.053704]|
|偏头痛132|ba|+0.003604|[0.000870,0.007477]|
|偏头痛132|brier|-0.003174|[-0.007374,0.000680]|
|偏头痛132|logloss|-0.025971|[-0.053228,-0.001617]|

内层最低logloss及最高AUC均使用验证集合选轮，其验证分数有乐观偏差。两种规则全部固定seed/原外折仅评价一次，不用内层最低logloss值当泛化证据。条件区间仅针对当前人员和已保存模型，不包含重训、选轮或历史开发，不能称新增独立H-test。

既有同人员/原划分/全标签强FC＋4协变量参照（影像和协变量分支不同，不相减归因纯影像）：SRPBS99 AUC 0.752666；偏头痛132 AUC 0.538396。原AdamW/均衡CE阴性结果、ZAN/Emo旧五seed与其他停止分支继续保留，未追加这些队列或配置。

## 复核与失败

{"saved_checkpoints": 248, "reused_final_records": 42, "max_probability_error": 1.1920928955078125e-07, "original_inner_exact_weight_reproductions": 105, "max_original_weight_error": 0, "independent_bootstrap_auc_error": 2.220446049250313e-16, "refits_for_replay": 0}。检查点严格加载、实际人员成员、最早并列及中位重训轮数均核对；验证重拟合0。2000次每队列同人配对bootstrap，五seed各算AUROC再取均值，另以加权正负pair-count独立核对。MRI/权重/逐人预测不公开。

首次只读SSH检查使用系统Python3.6不支持的subprocess text参数，失败在任何科学拟合之前；改用universal_newlines后正常，不改训练Python环境。完整失败记录留私有操作目录，不自动重试科学拟合。

## 下一步与临床边界

结束本次有限选轮对照，不扩选轮/优化器搜索；后续结构研究单列机制与公平消融，同时补真实临床终点和独立人员。 选轮是训练方法检查，不能当新颖网络模块；结构研究须说明完整BrainHGT内的位置、机制、公平消融与新颖性，不能把旧32维缩小或Emo收缩换名。

本轮只有两个诊断开发队列，MRI同期疼痛、治疗响应、真实重测、药物/心理/FD/删帧/站点适用性和独立人员验证未完成。五seed离散度小不等于预测有效；只改善概率损失也不称判别增强。

## 材料

[五seed单值](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-metrics.csv)、[均值和差值区间](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-means.csv)、[逐折](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-folds.csv)、[训练内指标](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-inner.csv)、[选轮及重训轮数](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-selection.csv)、[拟合前方案](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-plan.md)、[选轮实现片段](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-code.py)。

![全部五seed与均值](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-auc-figure.png)

![选轮与验证logloss轨迹](https://onephantomcat.github.io/neurograph-site/files/brainhgt-selection-20261014-curve-figure.png)

方法依据：[BrainHGT作者论文](https://arxiv.org/html/2511.17604)、[固定作者源码](https://github.com/null-cks/BrainHGT/tree/4f411fab1163e24f0b54e9cb398fbfe5928ce833)、[logloss定义](https://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html)。

<Self-Audit>仅内层训练侧选择，原人/标签/QC/模型核心/停止状态保持；复用作者模型、原图、指标与传输，全部固定seed/负结果保留。无新增hash/contract/gate、Goal、自动化或作者联系。本阶段完成不等于原三临床终点与独立验证完成。</Self-Audit>

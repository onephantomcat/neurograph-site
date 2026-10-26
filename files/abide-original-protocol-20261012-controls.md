# BNT作者框架同数据对照复算

2026-10-12。接续论文方法与baseline核对，补齐同数据、同划分、同监督预算的官方原任务对照。本轮只回答代码原任务可执行性与复算差距，疼痛迁移尚未新增训练。

VanillaTF 与 BNT框架BrainNetCNN完成20次固定拟合、40份选中／末轮权重回读，复核重拟合0。 VanillaTF AUROC0.7731/0.7503；BrainNetCNN 0.7637/0.7554（当前／部分对齐）。

| 模型／协议 | 原文AUROC | 实测均值±样本SD | Δ原文pp | 同协议BNT | ΔBNTpp | Accuracy | BA | AP(label1) | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| VanillaTF · 作者当前代码 | 0.7640±0.0120 | 0.773148±0.030633 | +0.915 | 0.783560 | -1.041 | 0.710000 | 0.710214 | 0.771062 | 0.203931 |
| VanillaTF · 论文划分／批量部分对齐 | 0.7640±0.0120 | 0.750340±0.038060 | -1.366 | 0.778630 | -2.829 | 0.667980 | 0.666666 | 0.749179 | 0.213303 |
| BrainNetCNN · 当前代码训练／固定行读出 | 0.7490±0.0240 | 0.763733±0.029254 | +1.473 | 0.783560 | -1.983 | 0.706000 | 0.705246 | 0.731824 | 0.203086 |
| BrainNetCNN · 论文划分／批量部分对齐 | 0.7490±0.0240 | 0.755405±0.031327 | +0.641 | 0.778630 | -2.322 | 0.675862 | 0.674987 | 0.751835 | 0.214189 |


所有固定seed0–4同时纳入；样本SD采用ddof=1，不是置信区间，训练706行在五seed中固定。原文参考为BNT论文表1：VanillaTF0.764±0.012、BrainNetCNN0.749±0.024；BrainNetCNN自身原论文的任务与成绩不能用本表代替。Δ为本地减参照，描述性差距，不是因果或显著性结论。

## 全部固定种子

| 模型 | 协议 | seed | 主权重 | AUROC | AP(label1) | BA | Brier | Δ同seedBNTpp |
|---|---|---:|---|---:|---:|---:|---:|---:|
| VanillaTF | current_code | 0 | final | 0.818586 | 0.841643 | 0.746465 | 0.175916 | -2.061 |
| VanillaTF | current_code | 1 | final | 0.747090 | 0.753026 | 0.707146 | 0.210277 | +1.365 |
| VanillaTF | current_code | 2 | final | 0.786030 | 0.820400 | 0.710759 | 0.198184 | +0.763 |
| VanillaTF | current_code | 3 | final | 0.744298 | 0.745139 | 0.669668 | 0.223559 | -5.562 |
| VanillaTF | current_code | 4 | final | 0.769740 | 0.695104 | 0.717032 | 0.211717 | +0.289 |
| VanillaTF | paper_aligned | 0 | selected | 0.758617 | 0.781857 | 0.694526 | 0.199929 | -0.725 |
| VanillaTF | paper_aligned | 1 | selected | 0.735528 | 0.709501 | 0.667686 | 0.214770 | -4.235 |
| VanillaTF | paper_aligned | 2 | selected | 0.805631 | 0.802452 | 0.673155 | 0.210706 | +0.592 |
| VanillaTF | paper_aligned | 3 | selected | 0.700855 | 0.703366 | 0.629468 | 0.237545 | -3.652 |
| VanillaTF | paper_aligned | 4 | selected | 0.751068 | 0.748719 | 0.668495 | 0.203563 | -6.126 |
| BrainNetCNN | current_code | 0 | final | 0.757576 | 0.791844 | 0.684848 | 0.204260 | -8.162 |
| BrainNetCNN | current_code | 1 | final | 0.727820 | 0.702173 | 0.687073 | 0.221688 | -0.562 |
| BrainNetCNN | current_code | 2 | final | 0.761140 | 0.758405 | 0.682457 | 0.203461 | -1.726 |
| BrainNetCNN | current_code | 3 | final | 0.762705 | 0.743438 | 0.719888 | 0.206147 | -3.721 |
| BrainNetCNN | current_code | 4 | final | 0.809425 | 0.663260 | 0.751964 | 0.179874 | +4.258 |
| BrainNetCNN | paper_aligned | 0 | selected | 0.720721 | 0.779591 | 0.630239 | 0.241023 | -4.514 |
| BrainNetCNN | paper_aligned | 1 | selected | 0.762141 | 0.749770 | 0.667978 | 0.206894 | -1.573 |
| BrainNetCNN | paper_aligned | 2 | selected | 0.772621 | 0.771649 | 0.710534 | 0.203928 | -2.709 |
| BrainNetCNN | paper_aligned | 3 | selected | 0.726690 | 0.694686 | 0.668901 | 0.216772 | -1.068 |
| BrainNetCNN | paper_aligned | 4 | selected | 0.794854 | 0.763477 | 0.697282 | 0.202329 | -1.748 |


另存全部40个选中／末轮角色指标于聚合CSV，其中20个主结果、20个预声明辅助结果。不按测试成绩挑权重、协议或seed。

## 协议、输入与实现身份

BrainNetCNN自身原文是早产婴儿DTI结构脑网络的认知／运动发育评分预测，见[Kawahara等 NeuroImage2017](https://www.sciencedirect.com/science/article/pii/S1053811916305237)。本轮ABIDE与0.749参照值来自BNT作者框架和BNT表1，是另一任务；不列为BrainNetCNN自身原论文数据／任务复现。

两模型各两协议各5seed，每次200epoch，超参数搜索0。当前代码batch16、706/203/100、每epoch作者train/val/test，主权重末轮；部分论文划分／批量对齐batch64、706/100/203、只验证选择，主权重验证选中。原BNT逐seed划分直接读取、两模型与原BNT完全相同，不重新生成更有利分区。模型不同会改变训练随机序列，此比较不将两协议差距解释为单一机制改善。

VanillaTF原类GraphTransformer：2层、4头、FF1024、concat，实际1,564,602参数。BrainNetCNN：BNT框架E2E32/64、E2N、N2G、三层分类头，933,277参数；是BNT作者框架对照实现，不是BrainNetCNN自身作者原论文任务复现。原文件未修改层宽、forward、dropout或负边处理。共用原BNT Adam/mixup alpha1和学习率调度，Torch2.4.1+cu121。

作者1009行CC200 FC200×200及100帧接口时序原样保留；模型只使用FC。原19站点标识、label0=493/label1=516、总体label1先验51.14%、零对角、无人员ID、短时序不能重建存储FC及诊断方向冲突继续适用。各seed测试label1先验另列CSV／Excel，AP仍按label1，不命名已核实ASD AP。不能宣称完整论文数据／协议精确重现。

实际用时：VanillaTF current_code每次拟合平均2.87分钟，范围2.75–2.99；VanillaTF paper_aligned每次拟合平均2.01分钟，范围1.96–2.05；BrainNetCNN current_code每次拟合平均17.55分钟，范围17.47–17.63；BrainNetCNN paper_aligned每次拟合平均15.09分钟，范围15.07–15.13。包含读包、200epoch与结果读出，在三块GTX1080Ti并发条件下测得；不是隔离吞吐或FLOPs基准。两模型同706训练行、同200epoch；batch16/64均每epoch实际使用704行，分别8800/2200次优化更新。作者调度器按45/12步每epoch计算总步数，保留其与drop_last实际44/11步的差别，未据测试成绩修正。

## BrainNetCNN随机评估与回读

原源码三处F.dropout未传training，eval仍有随机dropout，不能以model.eval推断固定权重具有唯一预测。本轮保留该行为：每个权重角色按固定测试行读出一次，保存读出前CPU/CUDA状态，独立回读严格加载相同权重、恢复状态并重放该次概率。该回读验证已保存的单次读出，未覆盖其他dropout抽样，不是MC平均或确定性修正版。

VanillaTF仓库末轮打乱测试AUROC 0.773148±0.030633；BrainNetCNN仓库末轮打乱测试AUROC 0.762281±0.030416。上述为原循环末轮记录，逐seed值另存CSV的author_shuffled_last_test_auc。BrainNetCNN该次打乱读出未保存之前的随机状态，不能列为40份保存状态回放已核验的概率指标；它与主表固定行单次读出可能不同，主表当前组明确标为“当前代码训练／固定行读出”。VanillaTF为确定性eval，仓库末轮值与已回放固定行值一致。主比较与BNT使用相同权重角色和人员分区，但随机评估语义差异仍构成限制。

20次拟合、40份权重严格回读通过，概率最大误差0，独立指标最大误差3.33e-16，复核重拟合0。batch16/64合成前向、反向和优化步骤共4次，只记技术检查；BrainNetCNN重复eval最大logits差0.011909/0.022818、保存状态回放差0。首轮调度文件queue.py遮蔽标准库导致6次导入启动失败，患者读取和拟合0；确认旧进程退出后仅修正文件名，失败receipt／日志保留，不重做成功科学拟合。

## 作者回复与疼痛目标

两条已批准作者询问于北京时间19:15发送，最近于2026-10-12 20:42北京时间只读核对均无新增评论。本轮未发新消息。BrainHGT仍缺原OMST数组／调用、符号、GE/Cost、树数／停止、输出及人员ROI对应；ALTER仍缺原1012人DPARSF数组与BNT1009对应、表1代码版本／协议。两者新患者拟合0，不猜OMST或以1009替换1012。

直接复用既有BNT逐seed划分、1009行CC200作者数组和监督预算；两协议多因素不同，不作单因素归因。BrainNetCNN为BNT作者框架对照实现，原eval仍有随机dropout；成绩为保存随机状态的一次读出，回读仅重放该次读出。未确认完整论文协议、人员身份与诊断方向，AP按原label1。ABIDE成绩不证明疼痛或小样本鲁棒性，研究总目标未完成。

继续等BrainHGT原OMST及ALTER1012人原材料；疼痛路线先核同人CC200、强FC／协变量、临床终点时点和独立人员来源，再决定单因素有限迁移。Emo53未胜切空间0.5983，B阶段保持停止；不追加ABIDE搜索。

原文、官方原任务复算、官方疼痛适配和本地简化模型继续分列。Meta-matching增益归因按同AAL90／同人的独立强FC参照修正，不能把跨输入／跨预算差距算模块贡献。切空间是独立FC表征加预测器，不是自编码器上添加的模块。当前没有证据支持由ABIDE结果升级为疼痛创新成功。

## 来源

- [BNT论文表1/2](https://proceedings.neurips.cc/paper_files/paper/2022/file/a408234a9b80604a9cf6ca518e474550-Paper-Conference.pdf)
- [本轮固定作者版本](https://github.com/Wayfear/BrainNetworkTransformer/tree/8a588aadad0166209269fa114e5df4e42209e207)
- [BrainNetCNN方法原文 NeuroImage2017](https://www.sciencedirect.com/science/article/pii/S1053811916305237)
- [BrainHGT原输入询问](https://github.com/null-cks/BrainHGT/issues/5#issuecomment-6123162397)
- [ALTER原输入询问](https://github.com/yushuowiki/ALTER/issues/5#issuecomment-6123163771)

<Self-Audit>直接复用保存划分、作者数组／训练方法与独立评价；不按测试结果选方法，保留全部seed和原随机eval限制。科研身份、疼痛三终点及独立验证边界明确；没有新Goal、自动化、疼痛拟合、专家QC或额外搜索。</Self-Audit>

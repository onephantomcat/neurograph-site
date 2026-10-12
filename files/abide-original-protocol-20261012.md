# ABIDE原任务协议核对与执行方案

2026-10-12。本报告记录本次协议审计与技术训练步骤，正式患者训练尚未启动。

ABIDE原任务协议核对已完成：三套CC200作者模型通过真实训练步骤测试；BNT/Com当前代码的验证和测试人数与论文70/10/20不一致，BrainHGT的最佳权重浅拷贝问题已实测。

截至本次核对，ABIDE正式患者拟合0，原文成绩差距仍未测。作者数据包下载中断后正在分段恢复；BrainHGT完整OMST输入尚缺。合成输入的训练步骤不算原任务成绩复现，既有疼痛适配结果保留。

## 原文与复现成绩

|模型|原文AUROC（均值±SD）|本轮原任务AUROC|差距百分点|当前状态|
|---|---:|---:|---:|---|
|BNT|0.8020±0.0100|未测|未测|技术训练步骤通过，原任务患者成绩未测|
|Com-BrainTF|0.7960±0.0380|未测|未测|技术训练步骤通过，原任务患者成绩未测|
|BrainHGT|0.7665±0.0145|未测|未测|技术训练步骤通过，原任务患者成绩未测|

BrainHGT表1同时报告ACC0.7133±0.0191；BNT0.710±0.012，Com0.725±0.044。BNT在Com论文中的参照为0.783±0.044，与BNT自己原文0.802±0.010分开，不能跨论文归因社区模块增量。

来源：[BNT NeurIPS2022原文](https://proceedings.neurips.cc/paper_files/paper/2022/file/a408234a9b80604a9cf6ca518e474550-Paper-Conference.pdf)、[Com-BrainTF原文](https://arxiv.org/html/2307.10181)、[BrainHGT原文](https://arxiv.org/html/2511.17604)。这些均为作者报告的成绩，不是本轮实测。

## 实际协议差异

- 直接执行三者作者划分函数，输入为1009个合成行索引与17个模拟站点：BNT/Com的train/validation/test=706/203/100，HGT=706/100/203；各集合互斥、并集1009。并非真实ABIDE人群核对。BNT和Com第二次StratifiedShuffleSplit使用test_length，却把sklearn返回的训练索引赋给测试集合。第一层train固定random_state42，第二层依赖NumPy状态；多次运行不是五组完全不同的训练人员。
- BNT论文batch64，当前作者ABIDE配置16；Com64，HGT32。BNT论文验证选轮次，当前trainer保存最终模型；Com报告验证最佳轮次的指标，却保存最终权重。HGT只在零起始epoch>20时选择最佳验证AUC，即第22轮起；state_dict().copy()为浅拷贝。实际给模型参数加1后浅拷贝同步改变，逐tensor clone未变。不能把最终保存的权重当成最佳轮次重放证据。
- HGT原Dice CSV共201行，作者默认pandas读取得到200×8，真实CC200前向通过。header=None会得到201×8，不适用于200个节点。本轮保留作者读取规则；未独立验证每行解剖对齐，不擅自增删先验行。
- 三者官方模型核心保持CC200。服务器Torch2.4.1+cu121、NumPy1.26.4，BNT/Com只补新版Torch的is_causal接口形参并关闭绕过作者自定义注意力的融合快速路径；没有更改注意力头数、隐层、池化或社区映射。实际作者训练步骤、有限梯度和重复eval已通过；总参数BNT3,976,042、Com8,381,986、HGT5,168,298。Com优化器字典与HGT配置文件大小写的调度错误已修正，首轮失败保留，BNT成功步骤未重做。
- HGT需要OMST。作者在[图构建回复](https://github.com/null-cks/BrainHGT/issues/2)给出[OMST参考仓库](https://github.com/stdimitr/topological_filtering_networks)。参考Matlab实现与论文图公式的候选树数量、GE归一化及对称成本计算还需逐项对应，当前未取得作者完整预处理驱动或原预计算图。论文11.99%为报告的平均密度，不能调阈值追到该数字；不以稠密FC冒充OMST。

作者提交：BNT `8a588aadad0166209269fa114e5df4e42209e207`，Com `d5749461f74df3d1f5c3fb159e01d6dbeaa328b0`，HGT `4f411fab1163e24f0b54e9cb398fbfe5928ce833`。公开issue只是辅助定位；上述划分和浅拷贝结论来自本轮实际执行，不据此推断作者未公开训练代码或发表实验有误。

## 数据核对与有限执行

作者BNT和Com分别提供公开数组链接；首次完整传输均中断，返回预期文件长度807,240,999字节。保留部分文件，正在有时限的HTTP分段恢复；服务器直接访问超时。传输完成后核对keys、1009×200×200 FC、时序、标签分布、站点、有限值、FC对称性及两包逐数组一致性，保持原文件与行顺序。没有subject ID时只认作者行级数据，不声称已独立核定同一批生物学人员；标签1对应ASD还是HC必须另有表型依据，不能按论文人数倒推或翻转标签。

协议分两条：当前作者配置与论文对齐配置。后者对齐70/10/20及BNT batch64，所有轮次只按验证AUC选模，未公开项沿作者配置，明确不声称取得作者私有训练代码。采用作者模型、optimizer、scheduler、train_per_epoch/test_per_epoch，外层循环记录完整曲线与clone快照；当前配置还保留逐轮测试/随机顺序行为。BNT当前代码以最终轮次为作者保存结果，另列验证选择的补充读回；Com/HGT报告最佳轮次指标和最终保存权重分别登记。

BNT200epoch、Com50epoch，各协议seed0–4，20次拟合；HGT100epoch，各协议42、1042直到9042，另20次仅在输入图来源明确后执行。超参数搜索0、不加seed、不挑最好成绩。两协议同时改变多个因素，差异不能归因某个单独修正。报告所有seed、均值和样本SD，AUROC/ACC/BA/AP/Brier/logloss及按原文AUC的百分点差；原文SD不是置信区间。

普通固定批处理在完整数据和闲置GPU可用后接续BNT/Com，遇到下载、数据或训练错误保留失败并停止对应分支；不重启活跃worker、不恢复旧停止分支。HGT原图尚缺，不安排替代图自动训练。

## 历史模型与前沿候选

|模型|顺序|原任务|数据可得性|已有证据身份|下一步|
|---|---|---|---|---|---|
|[BNT](https://github.com/Wayfear/BrainNetworkTransformer)|1|ABIDE1009 ASD/HC CC200|官方作者数组公开；传输恢复中|官方Emo53适配已完成；原任务成绩尚无|先跑两协议各5seed|
|[Com-BrainTF](https://github.com/ubc-tea/Com-BrainTF)|1|ABIDE1009 ASD/HC CC200+8社区|官方作者数组公开；传输恢复中|官方Emo53适配已完成；原任务成绩尚无|先跑两协议各5seed|
|[BrainHGT](https://github.com/null-cks/BrainHGT)|1B|ABIDE1009 ASD/HC CC200+OMST+Dice|公开FC候选；作者OMST参考有，完整驱动/原图缺|OA/Emo官方适配与本地小HGT分开；原任务尚无|补图构建记录后各10seed|
|[ALTER](https://github.com/yushuowiki/ALTER)|2|ABIDE/ADNI疾病诊断|作者仓库已获取；默认abide.npy仍需对照原文人员/图构造|新增候选，未训练|优先下一项原任务审读|
|[Vanilla Transformer](https://github.com/Wayfear/BrainNetworkTransformer)|2|BNT论文ABIDE对照|BNT仓库自带；可以共用CC200作者数组|候选，未在本轮训练|三主模型后另立有限比较预算|
|[BrainNetCNN](https://github.com/Wayfear/BrainNetworkTransformer)|2|BNT论文ABIDE对照；自身原论文任务另查|BNT仓库自带；属于第三方对照实现|候选，未在本轮训练|标BNT框架对照，不称自身作者原任务|
|[FBNetGen](https://github.com/Wayfear/FBNETGEN)|2B|论文PNC/ABCD；官方另提供ABIDE示例|官方代码已获取；PNC/ABCD需授权，ABIDE示例可用|新增候选，未训练|ABIDE官方示例与原PNC/ABCD成绩分表|
|[BrainGNN](https://github.com/xxlya/BrainGNN_Pytorch)|2B|发表任务fMRI；官方仓库提供不同的ABIDE示例|官方初版仓库已获取，作者明确示例不同于发表数据|新增候选，未训练|可做作者示例复算，不能对标发表原成绩|
|[STAGIN](https://github.com/egyptdj/stagin)|3|原HCP静息态/任务态分类|本地代码已有；HCP授权与人员原划分待核对|99/79人官方任务适配，非HCP原任务成绩|HCP数据齐全后执行原任务|
|[BrainLM](https://huggingface.co/vandijklab/brainlm/tree/main/old_13M)|3|原文重建/回归及下游任务逐项核对|官方权重可得；原数据/标签/划分未齐核|官方13M权重下游适配，非原预训练复现|优先官方下游，不从零重做预训练|
|[Brain-JEPA](https://github.com/Eric-LRL/Brain-JEPA)|3|UKB预训练，HCP-Aging/ADNI及MACC下游|官方权重/配置；UKB等需访问权限，MACC非公开直接可得|450ROI官方权重适配，非原任务成绩|开放且授权的原下游优先；不新增4A100预训练|
|[NeuroSTORM](https://github.com/CUHK-AIM-Group/NeuroSTORM)|3|官方五任务benchmark，逐队列原配置待核对|官方权重及demo；完整原任务队列/标签/划分待齐|真实MRI官方288维适配；预训练/原任务未复现|demo仅技术验证；完整benchmark才对原成绩|
|[Omni-fMRI](https://github.com/OneMore1/Omni-fMRI)|3|原多数据集下游任务|官方权重与代码；任务原队列/划分待核对|一次真实前向接入，不等于多人原任务评价|原作者下游条件齐全后执行|
|[Meta-matching / multilayer](https://github.com/ThomasYeoLab/CBIG)|3|原HCP-YA/HCP-Aging表型回归/标签预算|官方CBIG表示；原标签和人员重叠需核定|部分官方表示下游适配；未完整多层stacking|对齐原回归及标签预算，不用疼痛AUC代替|
|[FMM](https://github.com/Shef-AIRE/FMM_TC)|4|原抑郁治疗反应|官方代码/权重；原疗效真值与完整患者队列未齐|诊断任务适配，未复现原治疗反应|需原终点和队列；当前不训练|
|[NeuroMamba / 儿科头痛路线](https://github.com/cavalab/pediatric-headache-foundation-models)|4|110人189扫描，按人留出头痛分类|作者代码可查；儿科原队列不是成人132人|成人任务文献指导/官方表示适配|原队列可得后才复算儿科成绩|
|DCSTN|4|原文疾病及有效连接任务待逐项核对|本轮未确认此前采用官方仓库|本地简化重实现，Gaussian TE替代|先核实现身份；不记官方复现|
|[ScaPT](https://arxiv.org/abs/2408.10567)|4|DiFuMo1024原提示下游任务|原论文正式页代码N/A；尚未核得可执行官方实现|候选/接口准备，没有作者真实训练|找真实代码/权重与原输入后再执行|
|[FastSurferVINN](https://github.com/Deep-MI/FastSurfer)|工具|脑组织分割任务|官方工具可用，原分割标准需另核|已有分割工具应用，不是疼痛分类baseline|用Dice/表面指标；不进入AUC模型榜|
|本地FC / AE / MLP / TCN|另列|本地诊断开发任务|本地实现；FC切空间需引文|本地参照或小模型，不具备作者模型复现身份|保留既有参照；不包装为大型模型复现|

官方ABIDE示例、论文原任务、第三方baseline实现、官方权重下游适配和本地小模型分开。BrainGNN作者README明确ABIDE示例不同于发表的任务fMRI数据；FBNetGen官方ABIDE示例也不能直接替代其PNC/ABCD原文成绩。STAGIN后来提供ABIDE加载器，不表示它的NeurIPS原任务就是ABIDE。

## 疼痛迁移判断

先完成作者1009人CC200数组核对，再执行BNT、Com两协议各5seed；BrainHGT补齐OMST后各10seed。历史模型与预训练模型按原任务数据可得性排序，原任务复现后再判断疼痛迁移。

当前暂不重开疼痛模型搜索。Emo53已完成官方适配的阴性结果保留，不能用ABIDE成功替代疼痛有效性。原任务稳定性和实现差距明确后，优先选择输入与标签最完整的同病种诊断队列做一次有限迁移对照；只有存在同期疼痛或治疗随访真实标签时，才讨论分级/疗效主任务。缺独立临床验证、未知预训练人员重叠和原QC限制照实保留，不承诺论文录用。

<Self-Audit>原文成绩、本轮技术步骤和未完成患者训练分列；全部固定预算，不使用测试选参。复用作者模型/训练步骤及既有部署运输组件；原图、人员身份、标签语义和原任务AUC仍有明确未测项。</Self-Audit>

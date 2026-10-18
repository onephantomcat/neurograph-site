# SPD与时序网络融合：同人同预算比较

K10 同构十SPD 0.723867→异构融合 0.672816，Δ-0.051051，条件95%[-0.120626, 0.017610]，0/5支持重复正向；K20 同构十SPD 0.755103→异构融合 0.724505，Δ-0.030598，条件95%[-0.102651, 0.043424]，2/5支持重复正向。

这次等权异构融合没有达到稳定、兼顾概率指标的增量条件。固定配置结束，保留原轻量SPD。 不追加查询选权重、lag或种子搜索。

pair成员均值指五个双专家配对平均AUC；对应集成实际十专家。单模型组对应五专家。

|每类K|模型|单网络或配对均值AUC|最终集成AUC|Brier|logloss|专家数|总更新/支持|
|---:|---|---:|---:|---:|---:|---:|---:|
|10|原SPD M5（背景，1000更新）|0.687097|0.731592|0.213984|0.620490|5|1000|
|10|新增SPD M5，seed5..9|0.660270|0.702133|0.228275|0.656346|5|1000|
|10|本地时序网络M5，seed0..4|0.584501|0.581758|0.303696|0.948815|5|1000|
|10|同构十SPD专家（2000更新）|0.695454|0.723867|0.218172|0.629851|10|2000|
|10|异构5SPD＋5时序（2000更新）|0.663230|0.672816|0.229921|0.652224|10|2000|
|20|原SPD M5（背景，1000更新）|0.712612|0.775604|0.202198|0.592684|5|1000|
|20|新增SPD M5，seed5..9|0.681240|0.713022|0.221199|0.640568|5|1000|
|20|本地时序网络M5，seed0..4|0.627171|0.629677|0.280226|0.878849|5|1000|
|20|同构十SPD专家（2000更新）|0.722759|0.755103|0.209048|0.609164|10|2000|
|20|异构5SPD＋5时序（2000更新）|0.707880|0.724505|0.209731|0.604524|10|2000|

|K|候选|参照|口径|ΔAUC|条件95%区间|正向支持重复|ΔBrier|Δlogloss|范围|
|---:|---|---|---|---:|---|---:|---:|---:|---|
|10|heterogeneous_pair|same_spd_pair|member_mean|-0.032224|[-0.090953, 0.030255]|0/5|+0.009439|+0.019115|matched_people_labels_10_experts_2000_updates|
|10|heterogeneous_pair|same_spd_pair|ensemble5|-0.051051|[-0.120626, 0.017610]|0/5|+0.011749|+0.022372|matched_people_labels_10_experts_2000_updates|
|10|heterogeneous_pair|original|member_mean|-0.023867|[-0.081052, 0.035126]|1/5|+0.001925|-0.007907|extra_5_experts_1000_updates|
|10|heterogeneous_pair|original|ensemble5|-0.058776|[-0.128757, 0.012906]|0/5|+0.015937|+0.031734|extra_5_experts_1000_updates|
|10|same_spd_pair|original|member_mean|+0.008357|[-0.014035, 0.029547]|4/5|-0.007514|-0.027022|extra_5_experts_1000_updates|
|10|same_spd_pair|original|ensemble5|-0.007725|[-0.037335, 0.023130]|2/5|+0.004187|+0.009362|extra_5_experts_1000_updates|
|10|temporal|original|member_mean|-0.102596|[-0.194040, -0.004476]|0/5|+0.078964|+0.334078|matched_people_labels_5_experts_1000_updates_different_optimizer|
|10|temporal|original|ensemble5|-0.149834|[-0.259736, -0.033674]|0/5|+0.089711|+0.328326|matched_people_labels_5_experts_1000_updates_different_optimizer|
|20|heterogeneous_pair|same_spd_pair|member_mean|-0.014879|[-0.077893, 0.051441]|2/5|-0.001344|-0.007808|matched_people_labels_10_experts_2000_updates|
|20|heterogeneous_pair|same_spd_pair|ensemble5|-0.030598|[-0.102651, 0.043424]|2/5|+0.000683|-0.004640|matched_people_labels_10_experts_2000_updates|
|20|heterogeneous_pair|original|member_mean|-0.004732|[-0.070041, 0.060714]|2/5|-0.006182|-0.023975|extra_5_experts_1000_updates|
|20|heterogeneous_pair|original|ensemble5|-0.051099|[-0.127200, 0.027097]|1/5|+0.007533|+0.011839|extra_5_experts_1000_updates|
|20|same_spd_pair|original|member_mean|+0.010147|[-0.012818, 0.033051]|4/5|-0.004837|-0.016167|extra_5_experts_1000_updates|
|20|same_spd_pair|original|ensemble5|-0.020501|[-0.048552, 0.005407]|0/5|+0.006850|+0.016480|extra_5_experts_1000_updates|
|20|temporal|original|member_mean|-0.085441|[-0.188689, 0.022874]|0/5|+0.067491|+0.305870|matched_people_labels_5_experts_1000_updates_different_optimizer|
|20|temporal|original|ensemble5|-0.145927|[-0.260110, -0.021650]|0/5|+0.078028|+0.286165|matched_people_labels_5_experts_1000_updates_different_optimizer|

K20的时序与SPD残差相关0.711，低于两个SPD的0.895；但时序单独M5只有0.629677。不同错误未带来足够有效判别；十SPD也未超过原五SPD的0.775604。这是固定摘要网络和等权配置的阴性，不否定所有融合方法。

同原99人、五外折×五支持重复和K10/20标签；主要双方均10专家×200更新=2000更新/支持。异构11730与同构15810参数，不等FLOPs或优化器；原M5只有1000更新，单列背景。pair的成员均值是五个双专家配对的平均AUC，不是单网络成绩。所有99人已有开发历史；区间仅覆盖固定预测人员抽样，不覆盖重训或多轮研究选择。时序摘要受滤波、头动和采集流程影响；支持置乱敏感性不证明疼痛相关或与FC条件独立。诊断不代替同期疼痛/疗效；OA/ZAN/Emo阴性、CoSpine13留出、TN14停止和QC边界不变。

[全部种子](https://onephantomcat.github.io/neurograph-site/files/spd-temporal-fusion-20261018-model-seeds.csv)；[全部1500评价](https://onephantomcat.github.io/neurograph-site/files/spd-temporal-fusion-20261018-model-panels.csv)；[全部配对](https://onephantomcat.github.io/neurograph-site/files/spd-temporal-fusion-20261018-model-paired.csv)；[计算前方案](https://onephantomcat.github.io/neurograph-site/files/spd-temporal-fusion-20261018-plan.md)。


<!-- brainlm-fc-audit-20261018 -->

## 2026-10-18：BrainLM＋FC：官方权重、A424与人员来源核查

已找到官方256维/4层/4头候选，安全张量检查通过；当前99人的真实A424与旧512特征仍可逐人对应。FMM论文具体权重身份、逐检查点预训练来源/人员排除和可复用缩放依据仍未核实，作者模型前向也未通过现有环境兼容检查。

本轮完成接入核查，新患者训练0、未产生新AUC。条件尚未满足，未启动K10/20比较；没有以512维旧适配、随机权重或90→424补零替代官方方法。历史79人FMM阴性与全部种子记录保留。

官方来源、结构相符、权重严格加载、真实人级输入、预训练无重叠和临床效度是不同结论。公开资料未列SRPBS不等于逐人无重叠已证实；未证实也不等于发现泄露。99人已有开发历史，旧79单基础seed/三外折OOF与当前五seed/K10/20指标分开。没有重读MRI、改QC/纳入、删ROI、重启旧停止实验或联系作者。

需要明确到候选检查点的预训练数据范围、可用人员排除依据与输入缩放记录，并完成作者模块兼容前向；随后才能判断是否批准一次固定的小样本适配。当前不自动恢复旧512结构的few-shot搜索，也不因缺文件而换成另一预训练模型。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018.md)。


<!-- brainlm-compatible-20261018 -->

## 2026-10-18：BrainLM256：严格加载、合成前向与缩放补查

独立Python3.12.13环境已配置，Torch2.5.1+cpu、Transformers4.40.2。官方256维检查点严格加载FMM作者BrainLM模块，缺失键/额外键均0；合成seed0—4的编码与完整重建前向全部通过，重复特征误差0。

技术兼容问题已解决；具体检查点的训练数据、无查询人员重叠依据及输入缩放仍未充分核实。新患者训练未启动，未产生新AUC；保留旧79人阴性、原240项训练seed及上轮ABI失败。

本轮是官方权重技术接入验证：作者网络与权重未改，CPU环境、mask=0编码及固定噪声属于本地推理设置；完整重建使用检查点原mask=0.2。合成数据无临床标签，不能证明疼痛预测有效、预训练充分或FMM原任务复现。来源未明不等于已发现泄露，库名不同也不证明个体交集为0。原99人为开发数据，QC、纳入、停止分支和并行疼痛研究均保持。

先取得检查点级训练来源说明、可用人员排除依据和实际输入列/缩放统计；公开代码的缩放分歧要先确认。满足后沿原同人K10/20、seed0—4和固定预算比较FC、FC＋冻结预训练、FC＋冻结随机。当前停止患者分支，独立环境可继续用于合成验证。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/brainlm-compatible-20261018.md)。


<!-- brainlm-scaling-20261018 -->

## 2026-10-18：BrainLM256：训练来源追溯与缩放语句实测

已追溯14次仓库提交及8项公开讨论。作者已有回复支持一般预训练来源为UKB，但未明确绑定256检查点；缩放笔误问题19与统计量请求23均为0回复，后者针对13M，不能充当256来源证明。

缩放运算差异已用实际源码语句和官方冻结权重核实。仍无法认定该检查点当时采用哪种输入列、预训练人员及缩放统计，患者同人同预算比较未启动，未产生新AUC。上轮严格加载与前向成功、旧训练seed、阴性和失败均保留。

公开脚本可执行与历史训练实际流程是不同证据。原始工具未改；规范公式只作为合成诊断对照，不能冒称官方纠正。0回复不等于作者承认错误或数据确实未保存。UKB一般来源说明不能替代检查点成员排除；没有证据断言已经泄露。全部新数据为合成，原99人开发属性、QC/纳入和并行疼痛研究保持。

本轮公开来源追溯已收尾。患者分支需要检查点对应的数据范围及查询排除依据、实际输入列、原缩放统计和运算确认；获得这些实际材料后再执行原定K10/20同人同预算比较。当前不继续改公式后试患者成绩，也不将HF512或大模型当作同一256版本。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/brainlm-scaling-20261018.md)。

# 固定支持收缩率：原SPDNet同人同预算对照

基于模型：本地单BiMap SPDNet任务适配（90→16，logSPD，四协变量）。改动：逐人Ledoit–Wolf λ改为支持集λ中位数；网络/优化器不变。代码整理：Codex（GPT-6系列；当前环境未提供具体子型号）。

250次原SPDNet固定支持收缩率训练完成。五成员集成AUC（原→固定）：K10 0.731592→0.734501，K20 0.775604→0.770218；两项差值区间均跨0。五seed成员均值K10 0.687097→0.675867，K20 0.712612→0.704115。

|每类K|统计口径|原AUC|固定收缩AUC|差值|差值条件95%区间|正向重复|
|---:|---|---:|---:|---:|---|---:|
|10|member_mean|0.687097|0.675867|-0.011229|[-0.027204, 0.004304]|0/5|
|10|ensemble5|0.731592|0.734501|+0.002909|[-0.019479, 0.027342]|3/5|
|20|member_mean|0.712612|0.704115|-0.008497|[-0.022068, 0.004490]|0/5|
|20|ensemble5|0.775604|0.770218|-0.005386|[-0.025819, 0.015142]|2/5|

原/固定logdet仍高度相关；固定支持收缩率没有带来稳定AUC增益，不能把既有退化归结为逐人收缩率。K20集成Brier和logloss略改善，但AUC下降；不以一个指标替代另一个指标。保留原SPDNet，停止本轮配置，不继续扫描收缩率。

当前99人（46病例/53对照）已用于模型开发；5外折×5支持重复×5初始化seed，不是125组独立人群。条件人员区间仅覆盖固定预测，不覆盖重训或研究选择。诊断、MRI时疼痛及治疗反应三个临床终点仍未完成；不改QC、CoSpine13留出或TN14停止。

[近期全部工作表](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-recent.md)；[完整成员均值](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-model-means.csv)；[全部种子](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-model-seeds.csv)；[每折每支持指标](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018-model-panels.csv)。

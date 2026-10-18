# 非线性SPD：支持验证与未执行的匹配比较

250个支持组合全部有非线性、正定且梯度有限；243个通过全部条件，7个第二层相对改变量>2（K10为5/125，K20为2/125），最大3.272392。按计算前方案停止此固定候选，新增监督拟合0、查询前向/新AUC0。

真正非线性已经生效，但中位对角尺度未控制少数大元素的逐层放大；不是数值崩溃，也未测到性能下降。保留原轻量模型和旧三层结果，未执行计划中的250次匹配训练，不调整系数或放宽上限重试。

|每类K|支持组合|满足全部条件|尺度超界|原轻量200步M5 AUC（历史）|原三层ReEig200步M5 AUC（历史）|本轮新AUC|
|---:|---:|---:|---:|---:|---:|---|
|10|125|120|5|0.731592|0.732388|未运行|
|20|125|123|2|0.775604|0.772776|未运行|

历史两模型来自相同原人员/支持/seed/200更新；当前候选未训练，不能计算相对AUC或用历史值充当新实验成绩。5997参数是当前定义的结构参数量，不代表已训练模型。

全部判断仅用原K10/20的50个人级支持集合与五seed；每集合20/40人，组合相互重叠，250不代表250人或250次训练。尺度使用支持初始化对角的下中位数，随后固定。当前SRPBS99持续是开发数据；旧条件区间不覆盖重训及研究选择。输入已逐ROI标准化，几何量不等于原始BOLD幅度。QC、三临床终点、全部旧阴性/停止与CoSpine13留出保持。

[全部250支持组合](https://onephantomcat.github.io/neurograph-site/files/spd-nonlinear-20261018-support.csv)；[750层记录](https://onephantomcat.github.io/neurograph-site/files/spd-nonlinear-20261018-geometry.csv)；[K10/20全部五seed汇总](https://onephantomcat.github.io/neurograph-site/files/spd-nonlinear-20261018-support-seeds.csv)；[拟合前方案](https://onephantomcat.github.io/neurograph-site/files/spd-nonlinear-20261018-plan.md)；[论文缺口与下一步](https://onephantomcat.github.io/neurograph-site/files/spd-nonlinear-20261018-paper.md)。

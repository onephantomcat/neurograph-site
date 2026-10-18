# 保持对角的有界SPD非线性：同人同预算比较

2026-10-18。

基于：本地三BiMap SPDNet（90→48→24→16，5997参数）。改动：前两ReEig改为对角保持、逐元素变化≤20%的相关形状三次激活。代码工具：Codex（GPT-6系列；具体子型号环境未提供）。

与原轻量200步比较：K10 M5 0.731592→0.717891，Δ-0.013701，条件95%[-0.034813, 0.004658]，1/5支持重复正向；K20 M5 0.775604→0.762760，Δ-0.012844，条件95%[-0.033037, 0.004746]，1/5支持重复正向。同结构ReEig参照：K10 M5 0.732388→0.717891，Δ-0.014497，条件95%[-0.036208, 0.003836]，1/5支持重复正向；K20 M5 0.772776→0.762760，Δ-0.010016，条件95%[-0.031616, 0.007914]，1/5支持重复正向。

主终点未满足稳定、兼顾概率指标的开发增量条件，保留原轻量模型。 本轮非线性确实生效且尺度边界在支持训练内通过；不因结果追加激活强度、层宽、轮数或种子搜索。固定候选结束，全部结果保留。

## 支持内机制与训练

250支持组合初始检查全部通过；250模型/50000支持更新、1500几何快照/4500层记录，全部支持条件满足后才查询。

快照最大对角相对误差1.39e-16，最大元素相对变化0.200000000000，最小特征值0.193849。初始化/终态最小中点非线性误差0.00196/0.00202；初始相对线性收缩的最小差0.00409。每步边界实测50000次，谱/曲率在六固定步测量，不冒称每步都做完整谱检查。

G(A)=D^(1/2)[(R+0.25 R⊙R⊙R)/1.25]D^(1/2)。对角参与反向，逐人矩阵自身归一化，不拟合查询组统计。保持的是潜在投影坐标中的对角和符号，不声称固定ROI生物连接全部保持。逐元素激活依赖所学坐标基，未主张一般旋转等变性或几何距离保持。

合成输入及三个W有限差分最大2.34e-11；250权重独立NumPy前向最大误差4e-15，严格重载误差0。完整每步边界和损失保留在私有检查点；公开250模型损失汇总与4500层记录。

本轮未训练线性收缩H的额外对照，性能差反映整个激活替换，不能单独归因非线性。原SRPBS99（46病例/53对照）已有开发历史，五外折/支持集合/seed不变。双方匹配人员、目标标签及200更新；轻量1581参数对三层5997参数，不匹配FLOPs和支持检查成本。全部250支持训练完成且条件满足后才查询。条件bootstrap只覆盖固定预测人员抽样，不覆盖重训或多轮研究选择。隐层对角保持不等于原始BOLD幅度保持；QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三个临床终点要求不变。

## 官方方法与本地适配

|项目|官方/文献|本地实现|身份|
|---|---|---|---|
|基础算子|SPDNet BiMap、ReEig、LogEig；MATLAB AFEW|三BiMap和末Log复用原自写实现；前两ReEig替换|官方框架参考；非原任务复现|
|激活依据|已有正系数Hadamard激活研究；非线性不是新概念|R相关形状上的固定0.25三次残差，除1.25后回到A尺度|本地归一化适配；依赖坐标基，原创性未建立|
|保持的量|原ReEig截断小特征值|逐矩阵对角、符号保持，元素相对变化≤20%；对角参与梯度|支持初始与训练过程实测；不等于原始BOLD幅度|
|训练方法|作者几何SGD/QR；示例500轮、batch30|同原本地200全批更新，lr.01、头L2.001、float64|官方优化参考；训练预算是本地适配|
|输入/任务|AFEW400维SPD，7类softmax|AAL90逐人LW、原支持白化/四协变量、136特征二分类|本地脑影像适配；官方原任务训练0，未改BrainHGT|
|公平范围|非作者原评价|原五折×五支持×五seed；K10/20、200步；旧参照复用|同人/标签/更新；轻量1581对5997，非等参数/FLOPs|
|隔离与诊断|非作者原流程|全250支持检查及200步完成后才查询；每步边界、六步谱/曲率|本地支持机制验证；额外诊断成本单列|

[SPDNet作者代码](https://github.com/zhiwu-huang/SPDNet)、[2026非线性激活文献](https://www.esann.org/sites/default/files/proceedings/2026/ES2026-312.pdf)。BiMap/LogEig及优化沿已核对作者算子方法；本轮新激活用独立合成测试，不冒充官方激活复现、官方原任务训练或已成立原创。

该固定激活配置不继续追分。下一步优先补齐一个真实疼痛终点的时点、上游处理及人员依据，并判断是否具备未参与开发的同终点评估条件；旧99人不重新命名独立测试。方法稿可纳入本轮正负结果，原创性与临床效度仍需单独论证。

[比较表](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-comparison.md)；[全种子](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-model-seeds.csv)；[近期组员表](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-recent.md)；[支持验证](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-support.csv)；[全部几何](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-geometry.csv)；[训练损失](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-losses.csv)；[官方与本地](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-origins.csv)；[项目论文更新](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-paper.md)；[计算前方案](https://onephantomcat.github.io/neurograph-site/files/spd-bounded-20261018-plan.md)。

<Self-Audit>支持全体检查与训练后才查询；原划分、标签、参考和种子保持。全正负结果保留；支持机制成功不代替泛化或临床证据。</Self-Audit>

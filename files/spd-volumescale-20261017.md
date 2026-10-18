# 协方差几何体积、ROI方差与流程混杂核查

2026-10-18，10月17日诊断后按预定条件完成250次训练。

更正上一轮的输入解释：99人每ROI时序已在上游按样本标准差归一化，当前ROI方差为1；旧SPD步骤未再标准化不代表上游未标准化。旧log行列式主要反映收缩相关矩阵的几何体积，不能称原始BOLD幅度。旧模型、AUC和固定权重干预数值全部保持。

从99个原ROI文件标准化后与当前输入逐位一致。50个K10/20支持面板内，几何体积与原ROI对数方差相关约−0.75，与收缩率约+0.94；调整流程后与FD约−0.19、censor约−0.29至−0.31。协议与站点关联，未完整记录的扫描仪增益和早期强度处理仍未知。

同站点两类差异未被现有站点、批次、年龄/性别编码和头动描述完全解释：K10/20调整后标准化病例系数0.594689/0.564954，五重复均正；OSU/CIN原几何体积病例差均正。分层置换平均尾比例约0.34/0.14，不能挑最小值声称显著；这些证据只支持有限开发实验，不排除未测混杂。

| 预算 | 原ROI对数方差r | 收缩率r | 流程残差FD r | 流程残差censor r | 调整病例系数/总体SD | 同流程交换面板 |
|---|---:|---:|---:|---:|---:|---:|
| 10 | -0.757615 | 0.942964 | -0.192452 | -0.287799 | 0.594689 | 24/25 |
| 20 | -0.754187 | 0.939739 | -0.196090 | -0.305608 | 0.564954 | 25/25 |

| 预算 | 站点 | 几何体积病例−对照 | 其SMD | 原ROI对数方差病例−对照 | 其SMD |
|---|---|---:|---:|---:|---:|
| 10 | OSU | 0.088569 | 0.881080 | -0.208544 | -0.857804 |
| 10 | CIN | 0.099929 | 0.689516 | -0.310256 | -0.794689 |
| 20 | OSU | 0.101977 | 0.857507 | -0.230205 | -0.674492 |
| 20 | CIN | 0.100024 | 0.618403 | -0.362493 | -0.771051 |

外层M5 AUC（原SPD→几何体积/形状分支）：K10 0.731592→0.683366，Δ-0.048226，条件区间[-0.099306, -0.000256]，0/5支持重复正向；K20 0.775604→0.716735，Δ-0.058869，条件区间[-0.107376, -0.015500]，0/5支持重复正向。

| 预算 | 模型 | 统计量 | AUC | 重复SD | AP | BA | Brier | logloss |
|---|---|---|---:|---:|---:|---:|---:|---:|
| 10 | 原SPD | 五seed指标均值 | 0.687097 | 0.013528 | 0.704757 | 0.635778 | 0.236559 | 0.686239 |
| 10 | 原SPD | M5概率均值 | 0.731592 | 0.023227 | 0.744153 | 0.665778 | 0.213984 | 0.620490 |
| 10 | 几何体积/形状分别正则 | 五seed指标均值 | 0.622717 | 0.013744 | 0.640725 | 0.596234 | 0.252002 | 0.713071 |
| 10 | 几何体积/形状分别正则 | M5概率均值 | 0.683366 | 0.020519 | 0.692326 | 0.630323 | 0.226336 | 0.645053 |
| 20 | 原SPD | 五seed指标均值 | 0.712612 | 0.015759 | 0.723608 | 0.660485 | 0.224081 | 0.650549 |
| 20 | 原SPD | M5概率均值 | 0.775604 | 0.015555 | 0.800128 | 0.710949 | 0.202198 | 0.592684 |
| 20 | 几何体积/形状分别正则 | 五seed指标均值 | 0.649547 | 0.013546 | 0.666357 | 0.615079 | 0.240676 | 0.682173 |
| 20 | 几何体积/形状分别正则 | M5概率均值 | 0.716735 | 0.028350 | 0.728110 | 0.679475 | 0.215869 | 0.620704 |

| 预算 | 比较 | ΔAUC | 条件人员区间 | 正向重复 | ΔBrier | Δlogloss |
|---|---|---:|---|---:|---:|---:|
| 10 | 新分支−原SPD／member_mean（次要） | -0.064380 | [-0.098429, -0.029984] | 0/5 | +0.015444 | +0.026832 |
| 10 | 新分支−原SPD／ensemble5（次要） | -0.048226 | [-0.099306, -0.000256] | 0/5 | +0.012352 | +0.024563 |
| 20 | 新分支−原SPD／member_mean（次要） | -0.063065 | [-0.095701, -0.030398] | 0/5 | +0.016595 | +0.031624 |
| 20 | 新分支−原SPD／ensemble5（主要） | -0.058869 | [-0.107376, -0.015500] | 0/5 | +0.013671 | +0.028019 |

| 预算 | seed | 原SPD AUC | 新分支AUC |
|---|---|---:|---:|
| 10 | 0 | 0.668194 | 0.591543 |
| 10 | 1 | 0.715644 | 0.627083 |
| 10 | 2 | 0.665442 | 0.628416 |
| 10 | 3 | 0.709119 | 0.656840 |
| 10 | 4 | 0.677083 | 0.609701 |
| 20 | 0 | 0.684428 | 0.584202 |
| 20 | 1 | 0.736343 | 0.653741 |
| 20 | 2 | 0.678493 | 0.646857 |
| 20 | 3 | 0.769859 | 0.736012 |
| 20 | 4 | 0.693935 | 0.626921 |

支持内四项预定条件全部满足，已完成唯一250次几何体积与形状分支实验；原始物理幅度分支因上游标准化而不成立。这次分别正则化明确变差：两预算五次支持重复均下降，ΔAUC条件区间均低于0，Brier和logloss也变差。停止该配置，保留原SPD和全部阴性，不追加正则值或挑seed。

几何体积不是原始ROI幅度或平均BOLD。与收缩率高度相关，疾病、网络相关结构、采集和处理影响尚不能因果区分。OLS为支持内描述，R²为样本内拟合，置换/面板/seed相互重叠。新模型同时改变标量分支和正则强度，不能把差值归因于单一因素。当前99人已开发，人员区间只覆盖固定预测，不是独立临床验证。


10月17日完成来源与支持内诊断，10月18日完成250个模型。原5外折×5支持重复×K10/20×seed0..4，原支持参考/尺度/四协变量、200步SGD0.01不变；只增加1个几何体积系数，部署1582、M5 7910参数。支持内决定先于本轮外层评价，外层结果不用于选正则或seed。

原ROI均值去除并按每ROI样本标准差归一化发生在历史输入准备阶段；代码可定位到既有run_refinement.py的load函数，99个原始ROI时序标准化后与实际输入逐位相等。Nilearn/后续Ledoit-Wolf不再标准化的事实没有错，但上一轮把整个来源描述为“未逐ROI标准化”不准确，本轮明确更正。原ROI方差不同不等于模型还保留这些方差。

C的每个对角为239/240，logdet(C)/90=mean(log diag C)+logdet(corr C)/90；第一项几乎常量。因此本轮“几何体积”反映标准化后收缩相关谱，不能直接当原始BOLD幅度。对原时序整体乘2再标准化，当前输入逐位不变，这仅说明乘法尺度消去，不排除重建、滤波、噪声等对相关结构的影响。原ROI尺度与几何体积约−0.75相关，说明仍有共变来源，不能据标准化断言所有处理影响消失。

99人TR均2.5秒、240时点、90ROI。protocol13覆盖OSU和NKN、14覆盖CIN，与站点不可独立辨识。处理策略91个既有流程/8个保留完整T1修复，实际批次pilot-v6/v7/v8/v9和repair混合；这些是记录的执行批次，不等于真实扫描日期。扫描仪增益、早期强度归一化、完整采集参数并未由现有记录逐项核实；不从FunImgRCWF目录推断GSR相同。NKN病例/对照不足，不报告个人/小站点差异，其不适用原因保留。

每支持面板同站点两类各至少2人才能算差。调整为普通最小二乘病例系数，包含年龄、sex_code2、FD、censor及站点/处理策略/批次，按实际秩判自由度；50面板全部可估，标准化系数为病例系数除该支持a总体SD，不是Cohen d或因果效应。流程R²在K10/20约0.305/0.238，加入人口学和头动后约0.576/0.434，均为样本内拟合且小样本可能偏高。

支持内按站点×处理策略×批次分层置换999次，seed0..4全部保留；平均可交换人数K10 16.08/K20 35.72，两主要站点均可交换覆盖24/25和25/25。五置换seed的尾比例均值分别约0.338–0.349和0.137–0.140，不能合并为独立p值，也没有挑个别最小值宣称显著。描述性同站点信号和有限条件足够启动预定开发实验，尚不代表排除所有混杂。

唯一候选把原136维投影log拆成形状log(WᵀXW)−aI与支持标准化a，保留原RMS、协变量、W/头初始化和原支持参考。标量初始权重取原对角头之和×a标准差/RMS，初始logit与原网络一致。形状头L2从0.001改为0.01，几何体积与协变量头0.001，200步SGD0.01/正QR；部署1582比原1581多1系数，M5 7910比7905多5系数。投影形状不保证零迹，两个分支不等于统计独立，也未分别消融新增系数和正则强度。没有按外层选择λ、参考、seed或训练轮数。

250权重和50000有限损失保留，严格重载概率差0，NumPy独立谱前向差2.44e-15，250初始logit差1.11e-16、原支持尺度差0；250次实际首步体积梯度解析及分支L2更新复核最大1.11e-16。600项新旧指标重算差2.22e-16、100个M5混合差0、独立秩bootstrap区间差0；2000次共同人员抽样1999有效/1无效。CPU两线程Torch1.13.1/NumPy1.26.0训练196.26秒。诊断OLS系数独立复核2.03e-15；99人本机sklearn1.8.0独立Ledoit-Wolf收缩率差3.75e-16、logdet差1.33e-15。来源尺度等式不是临床验证。

诊断第一次在JSON保存时遇到NumPy布尔类型序列化失败，原日志/状态/部分结果完整保留，修正类型后同种子重算，未更换数据/参数或按成绩重跑；训练没有追加变体。原4715个PyTorch权重和930协变量头、新250权重都保留。原始ROI/矩阵/权重保留服务器，仅私有小统计和预测用于评价，无GPU或他人进程修改。

[LedoitWolf官方文档](https://scikit-learn.org/stable/modules/generated/sklearn.covariance.LedoitWolf.html)给出收缩形式；本轮实际从旧C推回收缩率，再独立重算核对，没有把官方文档当本数据疾病证据或声称官方原任务复现。

停止当前分支正则假设，保留原SPD。下一步先用同一支持划分检查收缩估计敏感性与同站点结果稳定性，再决定一个有限的估计器因素实验；不把缺失采集记录补成一致，不继续扫描正则。 原QC、OA/ZAN/Emo阴性、CoSpine13留出、TN14停止及三个临床终点保持。

[adjusted_panels](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-adjusted-panels.csv) · [adjusted_repeats](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-repeats.csv) · [adjusted_summary](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-adjusted.csv) · [coverage](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-coverage.csv) · [identifiability](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-identifiability.csv) · [model_contrasts](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-model-contrasts.csv) · [model_diagnostics](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-model-diagnostics.csv) · [model_mean_metrics](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-model-means.csv) · [model_paired_panels](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-model-paired.csv) · [model_panel_metrics](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-model-panels.csv) · [model_seed_metrics](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-model-seeds.csv) · [permutation_panels](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-panels.csv) · [permutation_seeds](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-seeds.csv) · [processing_inventory](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-inventory.csv) · [relationships](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-relations.csv) · [relationships_panels](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-relation-panels.csv) · [site_differences](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-sites.csv) · [technical_audit](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-technical.csv) · [诊断前方案](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-plan.md) · [聚合](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-summary.json) · [对比表](https://onephantomcat.github.io/neurograph-site/files/spd-volumescale-20261017-comparison.md)

<Self-Audit>支持内决定先于外层评价；更正输入物理含义而保留旧数值。全seed/阴性/不适用/失败与权重保留，复用原组件，不把关联和固定预测区间当临床因果或独立验证。</Self-Audit>


<!-- spd-fixedshrink-20261018 -->

## 2026-10-18：本地SPDNet固定支持收缩率与近期工作对照

250次原SPDNet固定支持收缩率训练完成。五成员集成AUC（原→固定）：K10 0.731592→0.734501，K20 0.775604→0.770218；两项差值区间均跨0。五seed成员均值K10 0.687097→0.675867，K20 0.712612→0.704115。

原/固定logdet仍高度相关；固定支持收缩率没有带来稳定AUC增益，不能把既有退化归结为逐人收缩率。K20集成Brier和logloss略改善，但AUC下降；不以一个指标替代另一个指标。保留原SPDNet，停止本轮配置，不继续扫描收缩率。

当前99人（46病例/53对照）已用于模型开发；5外折×5支持重复×5初始化seed，不是125组独立人群。条件人员区间仅覆盖固定预测，不覆盖重训或研究选择。诊断、MRI时疼痛及治疗反应三个临床终点仍未完成；不改QC、CoSpine13留出或TN14停止。

下一步优先检验原模型在同站点、病例对照均可评估的人员中的排序及错误是否集中于采集/处理层；先复用已有固定预测做描述与不确定性分析，不按测试结果选择新结构。若站点内信息也弱，需补充与疼痛相关的独立训练来源及可信标签，再决定预训练或模型改动。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/spd-fixedshrink-20261018.md)。

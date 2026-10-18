# BrainLM＋FC核查对照

已找到官方256维/4层/4头候选，安全张量检查通过；当前99人的真实A424与旧512特征仍可逐人对应。FMM论文具体权重身份、逐检查点预训练来源/人员排除和可复用缩放依据仍未核实，作者模型前向也未通过现有环境兼容检查。

本轮完成接入核查，新患者训练0、未产生新AUC。条件尚未满足，未启动K10/20比较；没有以512维旧适配、随机权重或90→424补零替代官方方法。历史79人FMM阴性与全部种子记录保留。

|核查项目|状态|已确认|仍缺|
|---|---|---|---|
|FMM作者版本与权重|SOURCE_VERIFIED_WEIGHT_UNBOUND|当前作者commit仍为d68a776e9f7ee2b4518f9b056a3263668577547a；教程加载pretrained_models/brainlm，本仓库未含模型权重或明确外部文件映射|需论文所用检查点的确切标识、对应预训练数据与预处理记录|
|官方256维候选|SAFE_TENSOR_INSPECTION_PASS|BrainLM官方旧checkpoint-1400：256维/4层/4头、424区/200点/patch20；30471369字节，124张量均有限，配置与主要形状相符|不能由配置相符证明它就是FMM论文所用权重；未冒称严格模型加载或前向成功|
|公开HF权重|VARIANTS_DISTINGUISHED|old_13M为512维/4层/4头；111M为768维/12层/12头，650M为另一大模型|不能用投影成256维或换大模型冒称同一官方检查点|
|当前99人与A424|LIVE_IDENTITY_AND_NUMERIC_MATCH|服务器99份真实240×424、TR2.5s；去掉已知SRPBS1600命名空间后与当前99人一一对应；旧预训练/随机512特征均99×512，权重仍在|数值存在不等于空间信号质量充分；每人2个ROI少于5体素，最小1体素，analysis-mask零覆盖0—3区|
|官方图谱/时间/坐标|INTERFACE_KNOWN_LOCAL_ADAPTATION_REMAINS|官方424标签/坐标与200点、20点patch；当前AAL90模型不能补零恢复424区；本轮使用已有真实A424作核查|旧输入TR2.5s、逐人zscore/固定三窗与官方UKB时间尺度/群体robust scaling不同；不能复制查询组缩放|
|预训练来源与人员重叠|COHORT_DISTINCT_PERSON_LEVEL_UNRESOLVED|论文方法段及官方README指UKB预训练/HCP外部评价；模型卡另有UKB+HCP混合训练措辞；未见SRPBS列入所述训练来源|公开候选未附逐检查点训练人员清单或跨库身份映射；来源不同不证明生物个体交集为0，也不证明发生泄露|
|256候选训练充分性|NOT_PROVEN_BY_LOGS|公开trainer_state为global_step1400、epoch448、计划500轮；论文通述100轮。无逐检查点数据清单或归一化参数|不能从步数/轮数反推训练人数、充分性或其与FMM论文一致|
|作者模型前向环境|NOT_EXECUTED_ABI_MISMATCH|权重以weights_only=True安全读入并查全部张量；作者模块加载遇现存tokenizers的CPython3.12二进制与当前3.13运行时不兼容|作者模型严格load_state_dict与合成前向尚未完成；服务器既有环境也没有transformers/tokenizers；未安装或伪造导入|
|旧FMM适配训练|PREVIOUS_NEGATIVE_RETAINED|9月25日79人三外折/三内折、单基础seed20260924：27内层+9最终，另9独立重训；FC .536036、FC+512预训练 .501287、FC+随机 .517375|非当前K10/20，不直接与原SPD .775604排名；旧结构扩参/few-shot停止不自动解除|

## 历史结果：单列79人适配，不是本轮新成绩

|历史方法|79人三折OOF AUC|Brier|
|---|---:|---:|
|fc_only|0.536036|0.338389|
|fc_pretrained|0.501287|0.388552|
|fc_random|0.517375|0.339520|
|aal90_reference|0.717503|0.219199|

官方来源、结构相符、权重严格加载、真实人级输入、预训练无重叠和临床效度是不同结论。公开资料未列SRPBS不等于逐人无重叠已证实；未证实也不等于发现泄露。99人已有开发历史，旧79单基础seed/三外折OOF与当前五seed/K10/20指标分开。没有重读MRI、改QC/纳入、删ROI、重启旧停止实验或联系作者。

[旧完整结果](https://onephantomcat.github.io/neurograph-site/files/fmm-results-20260925.md)；[本轮条件方案](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018-plan.md)。

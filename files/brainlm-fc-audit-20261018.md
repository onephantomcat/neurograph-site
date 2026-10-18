# BrainLM＋FC：官方权重、A424与人员来源核查

2026-10-18。核查完成，新患者训练未启动。

已找到官方256维/4层/4头候选，安全张量检查通过；当前99人的真实A424与旧512特征仍可逐人对应。FMM论文具体权重身份、逐检查点预训练来源/人员排除和可复用缩放依据仍未核实，作者模型前向也未通过现有环境兼容检查。

本轮完成接入核查，新患者训练0、未产生新AUC。条件尚未满足，未启动K10/20比较；没有以512维旧适配、随机权重或90→424补零替代官方方法。历史79人FMM阴性与全部种子记录保留。

## 历史描述更正

9月15日早期方案的“尚无A424/只有不匹配权重”不能代表当前状态：9月15日已完成真实99人A424与512特征，9月25日79人FMM适配已执行且阴性。本轮在服务器实读99份时序与两套冻结特征，按现有SRPBS1600命名空间作一一对应；迁移卷正常，只读权限需求不能当作数据缺失。旧79是当前99的子集。

## 官方检查点与脑区接口

公开官方GitHub另有256维旧checkpoint-1400，其4层/4头、424区/200点/patch20与FMM描述一致。本轮只下载该30.47MB权重，weights_only=True读取124张量并检查有限值与关键形状；没有下载111M/650M大权重。FMM作者目录本身没有权重，教程路径未绑定到具体外部checkpoint；配置相符不证明相同训练。公开trainer_state的轮数也不能证明完成原论文完整预训练。

现有A424来自真实空间提取，没有由AAL90补零。已有极小区383/405及每人0—3个analysis-mask零覆盖区保留；本轮不按疾病成绩删区。当前TR2.5s与预训练UKB的0.735s不同，200点不等于相同物理时长。旧逐人zscore/固定三个窗口是本地适配；官方群体robust scaling的训练参数未随候选提供，不能用查询组估计替代。

## 预训练来源与人员重叠

BrainLM正式论文方法段与README主要描述UKB训练、HCP外部评价；同一论文及模型卡还含两库总时长/训练措辞。未见公开说明将SRPBS作为预训练来源，但没有逐checkpoint训练清单或跨库个体映射，不能从前缀、不同研究名称或两组ID字符串不相交证明生物个体无交集。既不声称已发现泄露，也不将来源层面不同升级为逐人排除成功。

官方来源、结构相符、权重严格加载、真实人级输入、预训练无重叠和临床效度是不同结论。公开资料未列SRPBS不等于逐人无重叠已证实；未证实也不等于发现泄露。99人已有开发历史，旧79单基础seed/三外折OOF与当前五seed/K10/20指标分开。没有重读MRI、改QC/纳入、删ROI、重启旧停止实验或联系作者。

## 实际技术执行与未启动部分

现存作者依赖包含CPython3.12 tokenizers二进制，当前已装Torch运行于3.13，作者模块加载在二进制导入时失败；服务器原环境无transformers/tokenizers。已保留失败记录。安全张量检查通过不等于严格load_state_dict或作者前向完成。本轮没有安装、替换依赖或用导入占位冒称模型验证。新患者前向0、训练0、未产生新AUC，未启动不是新的性能阴性。

[官方FMM论文](https://papers.miccai.org/miccai-2025/paper/1399_paper.pdf)、[作者源码](https://github.com/Shef-AIRE/FMM_TC/tree/d68a776e9f7ee2b4518f9b056a3263668577547a)、[官方256候选](https://github.com/vandijklab/BrainLM/tree/eded39c86c27e03f5ead1d6a14311e92d1305e5e/pretrained_models/2023-06-06-22_15_00-checkpoint-1400)、[BrainLM正式论文](https://proceedings.iclr.cc/paper_files/paper/2024/file/029ce70401321de3808b3ac39e1ab167-Paper-Conference.pdf)、[HF模型卡](https://huggingface.co/vandijklab/brainlm)。

需要明确到候选检查点的预训练数据范围、可用人员排除依据与输入缩放记录，并完成作者模块兼容前向；随后才能判断是否批准一次固定的小样本适配。当前不自动恢复旧512结构的few-shot搜索，也不因缺文件而换成另一预训练模型。

[完整核查表](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018-comparison.md)；[全部检查](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018-checks.csv)；[历史79人指标](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018-history.csv)；[历史9个选轮记录](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018-history-selections.csv)；[近期工作](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018-recent.md)；[条件方案](https://onephantomcat.github.io/neurograph-site/files/brainlm-fc-audit-20261018-plan.md)。

<Self-Audit>复用真实历史和当前缓存，不改原人级划分、QC或旧停止；全seed与阴性保留。新核查与已训练结果分开，预训练人员交集未知没有伪造为0。</Self-Audit>


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


<!-- cortexmae-transfer-20261018 -->

## 2026-10-18：CortexMAE-A424：固定预训练迁移与随机对照

完成500个神经分类头、100000次更新及全部保存头重放。五成员集成AUC：K10预训练0.6048、随机0.4722、原SPD0.7316；K20预训练0.6652、随机0.5528、原SPD0.7756。

相对同结构固定随机编码器，K10集成AUC提高0.1326、5/5支持重复正向；K20集成AUC提高0.1125、5/5支持重复正向。两个预算的条件区间均排除0。两预算仍低于原SPD集成，本轮不替换轻量SPD主线。 全部seed和阴性保留，停止该配置。

原99人（46病例/53对照）反复参与过开发，不是独立验证。HCP-YA检查点与SRPBS目标队列按已声明来源成员排除；缺跨匿名库身份映射，不能证明生物个体交集为零。图谱与原SPD不同；只在预训练对随机的同输入比较中识别预训练贡献。条件bootstrap不覆盖重训、选方法或新队列。原体积DPABI与HCP处理差异、最小ROI 1体素/每人2区少于5体素、既有QC及临床终点缺口保留。

停止这一固定CortexMAE配置，不根据查询分数追加窗口、池化或融合权重。下一项先在支持集内部核查分类头正则化及与SPD的互补信息；有训练内依据后，再另定一次固定收缩残差融合比较。独立诊断、扫描同期疼痛与治疗随访仍分别需要合适数据。

[完整报告](https://onephantomcat.github.io/neurograph-site/files/cortexmae-transfer-20261018.md)。

# A16.01 研究原型请求与结果字段

2026-11-06 · 研究接口草案，供组内复核。

研究原型按同一研究编号与访视关联影像、临床终点和结果。NeuroGraph 的 mini TM Chat 用于项目资料问答，Work 用于提交和追踪工作。研究请求由受控研究程序读取，逐人输入与输出留在获准的研究环境。

## 请求字段

| 字段 | 何时必需 | 核查方式 |
| --- | --- | --- |
| `request_id`、`schema_version` | 所有请求 | 请求编号唯一，格式版本受调用端支持。重复提交时，按编号核对是否为同一请求。 |
| `study_id`、`person_key`、`visit_key` | 所有逐人请求 | 使用研究编号。访视须属于该研究人员，影像和量表通过同一次访视关联。保留同一人重复访视的归属。 |
| `site_code`、`scanner_protocol_id`、`scan_key` | 所有影像请求 | 关联已有站点、采集协议和扫描登记。实际厂商、设备、序列参数与协议版本由原始记录提供。 |
| `input.kind`、`input.ref`、`input.preprocessing_version`、`input.qc_ref` | 所有模型请求 | 引用受控目录中的研究产物。核对来源、处理版本、质控记录及该模型对输入类型的支持。请求中只传引用。 |
| `input.atlas_version`、`input.feature_layout` | 区域时序、FC 或图输入 | 核对图谱、脑区顺序、矩阵维度和特征版本。使用固定 OMST 时再核对拓扑来源和版本。 |
| `outputs`、`model_ref`、`protocol_ref` | 所有模型请求 | 逐项声明分类、连续疼痛预测或解释。绑定模型权重版本和研究协议，便于追查输出的适用范围。 |
| `classification.label_set_ref` | 请求分类 | 固定标签集合、阳性定义和决策阈值来源。开发阶段的 Pain/HC 与未来病种、亚型标签分别登记。 |
| `severity.endpoint_ref`、`severity.scale_version`、`severity.window_ref` | 请求程度预测 | 记录量表、取值范围和相对扫描的时间窗口。扫描前七日日最严重 NRS 均值是 PTN 研究侧建议。扫描即时 NRS 单列，5/7 有效日规则待院方确认。 |
| `explanation.method_ref`、`explanation.target_ref` | 请求解释 | 标明解释所对应的模型输出、特征空间、方法和拓扑处理。固定 OMST 的局部梯度按当前方法解释。 |
| `evaluation.labels_ref`、`evaluation.split_ref` | 仅在授权的评价流程中 | 真值和划分由评价程序单独读取，记录尺度、访视及缺失原因。预测输入中排除直接透露目标诊断、目标评分或治疗结局的字段。 |

## 响应字段

响应外层包含 `request_id`、`schema_version`、`run_id` 和 `input_checks`。每项输入检查登记字段、结果、原因及核验依据。每个请求分支分别返回 `status`、`reason_code`、`provenance` 和 `limitations`。状态取 `ok`、`invalid_input`、`unavailable` 或 `failed`。分支未请求时省略，已请求但无可用结果时返回原因和空结果。

| 分支 | 可返回字段 | 当前证据和限制 |
| --- | --- | --- |
| 分类 | `label_set_ref`、`class_scores`、`decision_threshold`、`calibration_status` | 已有证据限于开发数据和已保存模型的回放。需按指定标签集合和模型版本解释分数。临床病种或亚型诊断仍缺独立验证。 |
| 程度 | `endpoint_ref`、`scale_version`、`window_ref`、`estimated_score` | 只有绑定了相应终点且已有可用模型时才返回数值。当前院方 PTN 七日终点和对应模型均待落实，该组合返回 `unavailable`。 |
| 解释 | `target_ref`、`method_ref`、`atlas_version`、`topology_mode`、`artifact_ref`、`stability_note` | 已有 90 个权重状态的解释复核及 54 个保存模型的独立推理回放。固定拓扑局部敏感性按模型解释报告，跨支持和初始化的稳定性证据分开保留。 |

`provenance` 至少能定位输入处理版本、模型版本和执行记录。向站点发布时只导出已批准的汇总证据及其来源。

## 字段核对清单

| 核对情形 | 接口应有的行为 | 对照依据 |
| --- | --- | --- |
| 影像与量表属于不同访视，或访视归属缺失 | 受影响分支返回 `invalid_input`，提示补交关联信息 | 院方数据需求的关联与时间字段 |
| 输入缺少图谱版本，或 FC 的脑区顺序与模型不同 | 对应分支返回 `invalid_input`，记录不匹配项 | 解释报告中的既有 FC 与固定 OMST 输入范围 |
| 请求 PTN 七日程度，材料只有扫描即时 NRS | 保留即时测量的独立字段；程度分支按缺少目标终点返回 `invalid_input`。如果终点输入齐全但模型尚不可用，返回 `unavailable` | 院方初审的七日日记及扫描即时 NRS 定义 |
| 终点评分缺失，或诊断结果出现在预测输入 | 保留缺失原因并拒绝泄漏字段；缺失评分保持空值 | 院方数据需求的标签与输入约定 |
| 同一请求包含分类与程度，只有分类有合格模型 | 分别返回分类结果与程度不可用原因 | 已有研究分类证据和临床终点缺口 |
| 请求固定拓扑解释 | 返回解释方法和稳定性说明，注明是否重估 FC 或拓扑 | 解释报告的局部梯度定义与稳定性结果 |
| 在 mini TM 提问或提交实验 | 生成问答或 Work 任务记录。研究结果字段仅由受控研究流程写入 | 现有网站服务与 Work 接口职责 |

院方待确认项包括正式病种与分型、诊断依据、量表及有效日规则、扫描协议和院内数据使用范围。组内复核后，由 A16.02 接续实现输入校验，并用已有授权的真实输入核查。

依据见 [解释稳定性与研究软件复现](https://onephantomcat.github.io/neurograph-site/files/explanation-reproduction-20261029.md)、`docs/HOSPITAL_DATA_REQUIREMENTS_2026-09-09.md`、`docs/HOSPITAL_INITIAL_REVIEW_2026-09-09.md` 和 `progress-dashboard/server.py`。

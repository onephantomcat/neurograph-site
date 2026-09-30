> 操作记录按原日期保留；本地私有输入及模型文件不随归档公开。

# 同规则来源分析执行记录

最终运行：repository-local/tmp/matched-source-analysis-20260909-v2。状态COMPLETE，750模型和3000内外折记录独立回读PASS，预测误差0。

本目录RESULTS.md、dashboard.json、summary.json、paired_contrasts.json、selection.json、verification.json均为聚合产物。逐人输入、划分、协变量、OOF和模型保留私有tmp运行目录，不纳入Git。

研究代码：src/oa_rebuild/confound_transfer.py；运行/回读/聚合报告入口scripts/run_matched_source_analysis.py、verify_matched_source_analysis.py、report_matched_source_analysis.py。依赖原有native SRPBS载入、FC预训练及嵌套分类组件。CLI参数通过--help查看，输出选择未存在的目录。

运行使用批准99/96和既有5×5划分，未更改目标标签或科学QC。来源7人重新预训练；原9人表示复用。15方法×50外折=750。Raw k16/32/64/128、latent k8/16/32，C0.1/1/10在内层选择。全部调整为age/site/mean_fd/censor_fraction；仅在每个训练折拟合，输出为敏感性分析，不能称因果去混杂。

网站：http://127.0.0.1:8877/#datasets。公开报告、近期历史和数据集角色补充已同步到运行工作区与实际Git检出。Git交付结果另附任务记录。

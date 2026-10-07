"""Build a current reading manuscript while retaining the complete prior review.

No statistics, model fitting, resampling or subject-level data are generated.
"""
from pathlib import Path
import argparse,json,re
BASE='https://onephantomcat.github.io/neurograph-site/files/'
MARK='<!-- original-review-begins -->'
def build(source,out):
 raw=source.split(MARK+'\n',1)[1] if MARK+'\n' in source else source
 assert 'manuscript-normalization-integration-20261007-methods' in raw
 out.mkdir(parents=True,exist_ok=True);text=raw;removed=[]
 def cut(start,end):
  nonlocal text
  assert text.count(start)==text.count(end)==1,(start,end)
  a=text.index(start);b=text.index(end,a);assert b>a;chunk=text[a:b];removed.append(dict(section=start,characters=len(chunk),lines=len(chunk.splitlines())));text=text[:a]+text[b:]
 # Preserve earlier L1 evidence in the main Results, with its own scope.
 l1=raw.split('## L1训练头、正则尺度与监督预算诊断\n\n',1)[1].split('### 正则尺度的实际问题',1)[0]
 precision=raw.split('### 数值精度与保留的负结果\n\n',1)[1].split('### 与正式论文的关系',1)[0]
 cut('#### 10月5日至10月6日早期的DEIPP准备与适配（历史）','### 官方冻结与随机288维表示')
 cut('<!-- migraine-temporal-audit-20261004 -->','### 已完成的双向FC来源借用')
 cut('以下保留早期截点和原程序执行证据，均按历史日期理解，不表示当前仍有分类阻塞。','<!-- deipp-rest-main-results-20261005 -->')
 cut('### 10月5日至10月6日早期的DEIPP结果（历史）','### 历史阴性结果与临床程序准备')
 cut('<!-- deipp-rest-main-discussion-20261005 -->','## 代码、数据与报告')
 assert text.count('<!-- migraine-support-l1-20261007 -->')==1
 chunk=text.split('<!-- migraine-support-l1-20261007 -->',1)[1];removed.append(dict(section='完整按阶段训练记录',characters=len(chunk),lines=len(chunk.splitlines())));text=text.split('<!-- migraine-support-l1-20261007 -->',1)[0]
 old_header=text.split('## 摘要',1)[0]
 header='# 来源借用与冻结表示在小样本疼痛诊断中的条件性增量\n\n本稿是现有开发研究的投稿阅读材料，尚非提交就绪稿。主文呈现当前方法、全部主要比较和限制；完整旧审阅稿、历史截点与原失败见[历史附录]('+BASE+'manuscript-reading-history-20261007.md)。132人训练按用户授权纳入，实际新增专家报告0；独立临床真值、准确日期和H-test仍缺，不声明独立临床验证。作者、伦理、数据许可及利益冲突声明需据真实资料补齐，不预填。\n\n'
 text=header+text[len(old_header):]
 text=text.replace('\n#\n','\n').replace('## 最终功能CIFTI：完整数值与轴核对','### 最终功能CIFTI：完整数值与轴核对').replace('### 独立临床增量：三个终点','### 三个独立临床终点的预定评价（尚未执行）')
 text=text.replace('原Caret解析警告原因未知，警告保留；未核对完整最终时序','原Caret解析警告原因未知，警告保留；该项仅核对中间映射，最终时序见下文')
 preliminary='''### 先前L1与监督预算的有限诊断

在原固定K5完成后，另开展绝对L1、求解精化、训练梯度阈值缩放和较大监督预算诊断，实际新增480、169、480和96头，共1225次拟合，六个新FC参考。原模型与精化版本分别保留；1536个保存头和11424内层概率已独立重放。两类训练权重质量各0.5、总1，训练内加权标准化与受罚截距保持；lambda_max仅由当前训练特征和标签估计，比例固定1/.3/.1/.03。较大预算仅在原外层88训练人内形成44/44内折，与K5验证人员不同，不作配对效果比较。全部条件与失败保留，不新增外层查询评价。

另完成作者默认头96拟合（四方法×两尺度×L1/L2×六分区）与复用原中央窗口特征48拟合（两特征×两尺度×L1/L2×六分区），均报告全配置且没有查询新评分。它们与下节240头合计1609次新开发拟合，原固定K5 540另列。[全部旧L1诊断](https://onephantomcat.github.io/neurograph-site/files/migraine-support-l1-20261007.md)、[作者默认头](https://onephantomcat.github.io/neurograph-site/files/migraine-author-head-20261007.md)与[原中央窗口比较](https://onephantomcat.github.io/neurograph-site/files/migraine-author-input-20261007.md)提供完整参数与结果。

'''
 anchor='<!-- manuscript-normalization-integration-20261007-methods -->';assert text.count(anchor)==1;text=text.replace(anchor,preliminary+anchor,1)
 results='### 先前L1与监督预算诊断的结果\n\n'+l1+precision+'这部分是支持内选择与数值诊断，不形成新的独立患者成绩，完整细节与正式论文口径差异保留在历史附录和专题报告。\n\n'
 anchor='<!-- manuscript-normalization-integration-20261007-results -->';assert text.count(anchor)==1;text=text.replace(anchor,results+anchor,1)
 discussion='DEIPP完整结构整数适配与两份最终功能后缀已完成，四份CIFTI的数值、1304帧/0.46秒时间轴及标签对应已经核对。此前浮点标签损失、CRAS格式、缺模板内部失败却exit0、两处名称错误、MATLAB pca缺失的SVD适配，以及AFNI固定12位置实测差超过旧合成阈值均保留。它们支持明确范围的程序与数值结论，未证明全空间专家配准准确、完整作者版本复现或临床有效性。跨访视T2和未知Workbench警告原因仍限制解释；帧标记0时NTRP保留1304帧，没有物理删帧，不能推断非零标记时的插值效果。历史原文见附录。\n\n'
 assert text.count('## 代码、数据与报告')==1;text=text.replace('## 代码、数据与报告',discussion+'## 代码、数据与报告',1)
 swaps={
 '../reports/migraine-input-review132-2026-10-06/fixed-k5-training-comparison.png':BASE+'migraine-k5-training-20261006-figure.png',
 '../reports/migraine-input-review132-2026-10-06/fixed-k5-training-comparison.pdf':BASE+'migraine-k5-training-20261006-figure-pdf.pdf',
 '../reports/migraine-input-review132-2026-10-06/fixed-k5-training-comparison.svg':BASE+'migraine-k5-training-20261006-figure-svg.svg',
 }
 for old,new in swaps.items():assert old in text;text=text.replace(old,new)
 # Resolve only known local report links to their registered public source IDs.
 links={'CHRONIC_PAIN_IPD_COMPARISON_2026-10-04.md': 'https://onephantomcat.github.io/neurograph-site/files/chronic-pain-ipd-20261004.md', 'CLINICAL_INCREMENT_DESIGN_2026-10-02.md': 'https://onephantomcat.github.io/neurograph-site/files/migraine-readiness-20261002-clinical.md', 'FC_OBJECTIVE_REVIEW_2026-10-04.md': 'https://onephantomcat.github.io/neurograph-site/files/fc-objective-review-20261004.md', 'FC_REFERENCE_SELECTION_REVIEW_2026-10-04.md': 'https://onephantomcat.github.io/neurograph-site/files/fc-reference-selection-20261004.md', 'FC_TARGET_SCALING_SENSITIVITY_RESULTS_2026-10-04.md': 'https://onephantomcat.github.io/neurograph-site/files/fc-target-scaling-20261004.md', 'FC_TRANSFER_CONDITIONS_RESULTS_2026-10-02.md': 'https://onephantomcat.github.io/neurograph-site/files/fc-transfer-conditions-20261002.md', 'LITERATURE_COMPARISON_2026-10-02.md': 'https://onephantomcat.github.io/neurograph-site/files/migraine-input-pilot-20261002-literature.md', 'MIGRAINE_BATCH_INPUTS_2026-10-03.md': 'https://onephantomcat.github.io/neurograph-site/files/migraine-batch-inputs-20261003.md', 'MIGRAINE_FINITE_PROTOCOL_2026-10-02.md': 'https://onephantomcat.github.io/neurograph-site/files/migraine-readiness-20261002-protocol.md', 'MIGRAINE_INPUT_PILOT_2026-10-02.md': 'https://onephantomcat.github.io/neurograph-site/files/migraine-input-pilot-20261002.md', 'MIGRAINE_INPUT_REVIEW132_2026-10-06.md': 'https://onephantomcat.github.io/neurograph-site/files/migraine-input-review132-20261006.md', 'MIGRAINE_READINESS_2026-10-02.md': 'https://onephantomcat.github.io/neurograph-site/files/migraine-readiness-20261002.md', 'TRAINING_RESULTS_INDEX.md': 'https://onephantomcat.github.io/neurograph-site/files/training-results-index.md', 'UNSEEN_CLINICAL_SOURCE_AUDIT_2026-10-03.md': 'https://onephantomcat.github.io/neurograph-site/files/unseen-clinical-sources-20261003.md'}
 for old,new in links.items():text=text.replace('('+old+')','('+new+')')
 text+='\n## 材料使用与尚缺声明\n\n[复现与材料说明]('+BASE+'manuscript-reading-materials-20261007.md)列出公开代码/聚合、原始数据入口和未补声明。影像、逐人标签/评分、特征、预测、模型和QC库未随稿公开。保留原20未评分、Emo13失败及TN14/结构535/CLIP停止决定；论文整理不改变这些状态。\n'
 history='# 历史审阅稿与原始阶段记录\n\n以下完整保留本次整理前的审阅稿。早期“仍0”“待执行”“RUNNING”等按原日期理解，当前状态见阅读版；任何历史失败、阴性结果、版本或质量注意均不删除。\n\n'+MARK+'\n'+raw
 readme='''# 投稿阅读材料与复现说明

这套材料整理现有开发研究，不表示可以提交，也不表示已完成独立临床验证。论文正文含双向FC来源借用、原132人K5四方法和全部后续诊断；完整历史原文保留，原数字、图及条件区间不变，本次新增拟合、前向、重采样和查询评分均0。

| 文件 | 用途 |
| --- | --- |
| 论文阅读版 | 当前Methods、Results、Discussion与全部主要比较 |
| 历史审阅稿 | 完整保留早期截点、失败、技术版本与阶段诊断 |
| 训练40配置附录及CSV | 新归一化默认48/精度48/类均衡48/相对L1 96，240头与10560训练内概率 |
| 原K5图PNG/PDF/SVG | 五支持OOF指标、冻结相对三对照AUC/Brier及条件区间 |

## 可复现范围

公开聚合与必要代码支持重建表格和图。代码、参数、划分与实际独立核对范围分别保存在原专题；表格重现不能代替原模型或影像重放。原K5 540拟合/45参考与开发诊断1609次新拟合单列，不能把内层最高AUC替代主分析。个体数据和模型不公开，MRI保留服务器；下载公开汇总不能完整重训患者模型。数据访问许可、预训练成员与环境版本需据真实来源另行核对，不推断授权或无重叠。

训练附录可用已公开生成代码与summary.json运行：

```shell
python build_training_appendix.py --summary summary.json --output-dir tables
```

阅读稿可从历史审阅稿与当前整理代码生成：

```shell
python build_reading_materials.py --source historical-review.md --output-dir reading
```

实际运行环境与原作者有版本适配，详见各报告；本文整理不声称精确作者CONN/空间/时间流程复现或独立泛化。与儿科论文的任务、人群和评价单位不同，不作AUC跨研究排名。

## 尚缺材料

作者与单位、贡献、联系人、伦理/同意的实际依据、数据与checkpoint使用许可、经真实作者确认的资助和利益冲突声明尚未填报，不编造编号或声明“无冲突”。用户授权132训练QC不替代专家报告；原25项注意仍保留。准确扫描日期、同期疼痛、治疗随访和真正未参与开发的H-test尚缺，对应终点不执行。以上缺口使总研究与可提交状态均未完成；已有开发结果仍可阅读和复现其公开聚合。

## 原始来源与完整结果

'''
 refs=[('manuscript-current-review-20261007.md','论文阅读版'),('manuscript-reading-history-20261007.md','完整历史审阅稿'),('migraine-normalization-20261007-manuscript-appendix.md','40配置附录'),('migraine-normalization-20261007-manuscript-table.csv','全部40配置CSV'),('migraine-normalization-20261007-summary.json','训练完整聚合'),('migraine-normalization-20261007-code12.py','训练表生成代码'),('manuscript-reading-code-20261007.py','阅读稿整理代码'),('migraine-k5-training-20261006-figure.png','原K5图PNG'),('migraine-k5-training-20261006-figure-pdf.pdf','原K5图PDF'),('migraine-k5-training-20261006-figure-svg.svg','原K5图SVG'),('migraine-support-l1-20261007.md','全部L1诊断'),('training-results-index.md','全部结果索引')]
 readme+='\n'.join('- ['+label+']('+BASE+name+')' for name,label in refs)+'\n'
 (out/'MANUSCRIPT_REVIEW_COPY_2026-10-07.md').write_text(text,encoding='utf8');(out/'historical-review.md').write_text(history,encoding='utf8');(out/'README.md').write_text(readme,encoding='utf8')
 summary=dict(state='EXISTING_DEVELOPMENT_MANUSCRIPT_READING_MATERIALS',historical_review_preserved_complete=True,moved_sections=removed,old_characters=len(raw),reading_characters=len(text),new_classifier_fits=0,new_encoder_forwards=0,new_resampling=0,new_query_scores=0,original_k5_models=540,original_k5_FC_references=45,diagnostic_new_fits=1609,independent_clinical_validation=False,submission_ready=False,expert_reports_added=0)
 (out/'reading-materials-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n',encoding='utf8');return summary
if __name__=='__main__':
 p=argparse.ArgumentParser(description=__doc__);p.add_argument('--source',type=Path,required=True);p.add_argument('--output-dir',type=Path,required=True);a=p.parse_args();v=build(a.source.read_text(encoding='utf8'),a.output_dir);print(json.dumps(dict(moved_sections=len(v['moved_sections']),old_characters=v['old_characters'],reading_characters=v['reading_characters'],new_classifier_fits=0,submission_ready=False)))

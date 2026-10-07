# 投稿阅读材料与复现说明

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

- [论文阅读版](https://onephantomcat.github.io/neurograph-site/files/manuscript-current-review-20261007.md)
- [完整历史审阅稿](https://onephantomcat.github.io/neurograph-site/files/manuscript-reading-history-20261007.md)
- [40配置附录](https://onephantomcat.github.io/neurograph-site/files/migraine-normalization-20261007-manuscript-appendix.md)
- [全部40配置CSV](https://onephantomcat.github.io/neurograph-site/files/migraine-normalization-20261007-manuscript-table.csv)
- [训练完整聚合](https://onephantomcat.github.io/neurograph-site/files/migraine-normalization-20261007-summary.json)
- [训练表生成代码](https://onephantomcat.github.io/neurograph-site/files/migraine-normalization-20261007-code12.py)
- [阅读稿整理代码](https://onephantomcat.github.io/neurograph-site/files/manuscript-reading-code-20261007.py)
- [原K5图PNG](https://onephantomcat.github.io/neurograph-site/files/migraine-k5-training-20261006-figure.png)
- [原K5图PDF](https://onephantomcat.github.io/neurograph-site/files/migraine-k5-training-20261006-figure-pdf.pdf)
- [原K5图SVG](https://onephantomcat.github.io/neurograph-site/files/migraine-k5-training-20261006-figure-svg.svg)
- [全部L1诊断](https://onephantomcat.github.io/neurograph-site/files/migraine-support-l1-20261007.md)
- [全部结果索引](https://onephantomcat.github.io/neurograph-site/files/training-results-index.md)

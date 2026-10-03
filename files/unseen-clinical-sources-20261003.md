# 独立临床来源补查：访问状态与任务适用性

2026-10-03。本轮实际读取六个来源的官方元数据、完整文件清单或作者说明。没有取得新增逐人MRI或临床真值文件，没有新增训练纳入、分类拟合或独立临床验证。当前偏头痛输入处理继续按原方案执行。

| 来源 | 实际读取与结论 | 下一步 |
| --- | --- | --- |
| [Dataset related to article:Triple network disruption in medication overuse headache functional signatures and clinical impact](https://zenodo.org/records/20543967) | 官方API实际返回restricted，匿名files为空；126人为记录描述人数，未取得逐人工作簿。 | 取得有权使用的临床与影像文件后再核对实际人数、时间、身份和输入。 |
| [Dataset related to article: Longitudinal neurofunctional changes in medication overuse headache patients after mindfulness practice in a randomized controlled trial (the MIND-CM study)](https://zenodo.org/records/14811536) | 官方API实际返回restricted，匿名files为空；描述列出网络种子和组间统计图，未取得逐人预测输入/结局。 | 不能把组间统计图作为逐人治疗预测的MRI与真值。 |
| [Data from: An fMRI-based neural marker for migraine without aura](https://datadryad.org/dataset/doi:10.5061/dryad.2f82381) | 版本32231的完整文件清单仅一份493,920字节DOCX；网页下载403、官方API下载401，正文未取得。 | 论文的逐人表描述不等于本项目已取得表，更不等于取得T1/BOLD、身份或MRI时间。 |
| [OpenPain](https://www.openpain.org/html/agreement.html) | 首页和使用协议均实际HTTP200；下载入口经使用协议进入注册，尚无本项目可配对清单。 | 需要已有授权访问的文件/清单；本轮未提交身份、接受协议或联系他人。 |
| [CoSpine Pain-dataset](https://github.com/OpenNeuroDatasets/ds005883) | 作者README实际读取：39名健康人，热刺激任务及疼痛/不愉快度评分；没有据此取得临床患者队列。 | 若另做实验热痛研究需单列设计，不能替代慢性疼痛诊断或治疗验证。 |
| [Antithrombotic therapy for migraine in patients with patent foramen ovale: A randomized clinical trial](https://datadryad.org/dataset/doi:10.5061/dryad.2rbnzs84m) | 官方元数据和完整4文件清单实际读取：临床/日记、字典和SAS代码；当前说明未列MRI，未下载逐人数据。 | 可参考终点与临床字段，不能称为已经具备影像增量验证输入。 |

这些结果缩小了当前可直接运行的来源范围。两条Zenodo记录限制文件访问；Dryad脑影像标记记录当前只列补充文档，正文尚未取得；OpenPain需访问手续。健康实验热痛和未列MRI的临床试验不能直接替代慢性疼痛影像增量研究。

已有Emo/ds004144仍属于开发数据。近期检索到的三叉神经痛数据论文指向既有ds005713，未证明新增独立人员，不恢复TN14或其他停止/暂停路线。

## 临床任务如何继续

诊断需要可靠诊断及同访视影像；扫描同期程度需要量表、填写时间和MRI时间；治疗反应需要治疗前MRI、基线及预定随访结局。每项均需实际可读文件、用药/临床参照、按人身份去重和使用依据。H-test在开发选择结束后用于评价，不能用这些元数据记录中的论文人数代替独立验证人数。

先完成正在执行的候选真实输入和有限对照。同时优先接入已有访问权限的逐人临床—MRI配对文件；本轮不以扩大模型搜索或换成另一任务来代替临床证据。论文保留强FC迁移条件、阴性结果与三终点缺口。

## 可复核范围

Zenodo两条官方JSON、Dryad正式版本及全文件清单、OpenPain首页/协议和CoSpine作者README均保留原读取材料与失败回执。Dryad首次网页下载403、API下载401仍保留；CoSpine下载后首次终端输出的GBK编码错误不影响已经保存的README，后续UTF-8读取成功。本报告只公开来源级结论，不公开逐人数据或私有运行路径。

[2020标记原论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC7176301/)；[既有ds005713的正式数据论文](https://pmc.ncbi.nlm.nih.gov/articles/PMC12749398/)。研究对象、任务及时间方向分别解释，已发表的相关性或分类结果不作为本项目新增成绩。

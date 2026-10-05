# 实际NeuroSTORM checkpoint：预训练参数与人员证据

2026年10月4日。对当前132人worker使用的作者checkpoint进行独立参数复核；不是新预训练或临床验证。

实际checkpoint保存MAE预训练、五来源、seed1234及训练/验证比例0.8/0.1，154项参数与此前检查一致。运行名含topk100，但未保存topk；当前源码默认10000，实际采样预算和人员不能由名称重建。尚需原训练源码、实际划分和逐轮训练/验证名单；个人重叠未知，H-test仍未建立。

| 证据 | 实际读取与结果 | 能支持的结论 |
| --- | --- | --- |
| 当前消费路径 | 只读worker及其冻结/随机提取程序，确认加载pt_neurostorm_mae_5ds.ckpt | 本次核查对象是正在使用的checkpoint，未更换模型或worker |
| 文件与元数据 | checkpoint 93,061,240字节；ZIP内data.pkl为200,359字节，前后文件大小/mtime保持 | 此轮只读取元数据，没有重新读完全部tensor；旧LFS匹配记录保留 |
| 保存训练参数 | 154项；模型与datamodule字典相同，与此前checkpoint检查一致 | 静态复核既有参数，补充公开说明，不当作新训练 |
| 直接字面量核对 | 12个标量与原pickle opcode对应一致 | 没有调用pickle中的GLOBAL/REDUCE对象、加载storage或做前向 |
| 原预训练目标 | pretraining=true，use_mae=true，use_contrastive=false | checkpoint声明MAE预训练；其它任务默认字段不代表额外监督训练 |
| 数据与划分参数 | HCP1200/HCPA/HCPD/ABCD/UKB；seed1234，train_split=0.8，val_split=0.1，split_num=1 | 配置和比例，不等于实际参与者名单或确切人数 |
| 训练状态字段 | 保存epoch18；批量训练16、评估8 | 单个保存状态，不证明完整训练复现或所有人员均参加 |
| 采样 | reweighting_strategy=hard_random；运行名含topk100，字典无topk | 实际topk未确立，不能把名称当每轮100人/总共500人的证明 |
| 编码器配置 | 起始36维，depths=2/2/6/2，heads=3/6/12/24；输入96³×20 | 与既有严格加载的288维编码器配置相容，原冻结/随机比较不变 |

## 原训练版本仍需取得

当前消费的公开源码会读取各来源划分文件；没有文件时按当前人员目录生成划分，采样索引还依赖数据顺序、每轮seed与实现。其采样工厂在topk缺失时回退10000，当前参数解析器同样默认10000。该实现与保存运行名中的topk100不足以重建原训练；这不是已证明的训练错误，也不能通过替原模型补入topk100来“修复”。原训练源码版本、当时人员目录顺序与实际采样记录尚未取得。

作者原五来源列表不含当前偏头痛库，只能说明未列名。此前HCP下载候选1206个ID、模型仓库文件清单、保存seed和划分比例均不能替代真实预训练、验证、模型选择或微调成员。此次元数据没有取得对应人员名册；跨库生物学人员重叠仍未知。当前偏头痛按开发候选管理，不升级为独立H-test。

## 模型来源资料申请草稿（尚未发送）

拟向模型作者申请该发布checkpoint对应的原训练源码commit和完整配置、各来源实际人员/访视清单及顺序、训练/验证/测试划分文件、逐轮被采样的训练成员与用于模型选择的验证成员、恢复训练链及任何微调或下游选择使用情况。尤其请确认运行名topk100对应的实际预算和采样实现，以及参数字典未保存topk的原因。若人员信息受限制，可由作者在其许可范围内执行跨库重叠核查，返回适用范围和方法；匿名编号不同本身不能证明不同人员。本任务未发送消息或联系作者。

研究仍用原冻结编码器、同结构随机seed20261004和相同输入。没有新模型选择、重训、阈值/窗口/池化修改、人员排除、专家QC或分类拟合。独立输入复核原58人、4408窗口与六例待专家注意保持原截点；全132人完成必要输入与质量复核后才按原K5四方法540拟合/45训练参考比较，真实临床三个终点和独立H-test仍待取得。

来源：[官方模型仓库固定版本](https://huggingface.co/zxcvb20001/NeuroSTORM/tree/90ab5a43b07c54482af900a0df31545f7c0644af)；[实际发布checkpoint](https://huggingface.co/zxcvb20001/NeuroSTORM/blob/90ab5a43b07c54482af900a0df31545f7c0644af/pretraining/pt_neurostorm_mae_5ds.ckpt)；[当前消费的数据划分与采样源码](https://github.com/CUHK-AIM-Group/NeuroSTORM/blob/d43114c97deaf3e53ea051d2512b36ef8fcb748d/datasets/data_module.py)。本次网页版checkpoint入口读取失败后，官方模型API元数据成功读回；没有把失败页面当作checkpoint内容。

[聚合JSON](neurostorm-checkpoint-provenance-20261004-summary.json)；[原有限比较方案](migraine-readiness-20261002-protocol.md)；[临床增量设计](migraine-readiness-20261002-clinical.md)。

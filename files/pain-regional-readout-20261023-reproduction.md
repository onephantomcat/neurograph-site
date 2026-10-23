# 区域残差读出执行说明

modules.py提供RegionalResidual、capture和ranking_loss，可直接包裹固定版本作者BrainHGT。输入为同一人员顺序的signed FC和OMST，均为[B,90,90]。区域列号见regions.csv，只有当前训练人的池化表征可用于fit_scale。初始化后残差严格为0；freeze原诊断主干，eval模式提取节点表征，三个读出使用相同初始化和200次全批Adam，lr0.001、weight_decay0.0001。完整forward用原输入重新计算，与缓存训练头结果核对。

本批复用15个本地诊断监督检查点，每个仅由当前内训练52/53人训练，历史检查点曾由当前内验证选轮。它们不是官方原任务预训练权重。为了复现精确数值，需要相同受限输入、原人级划分及源检查点；本公开包不包含这些逐人材料，不是一键官方原任务复现。

作者固定版本：https://github.com/null-cks/BrainHGT/tree/4f411fab1163e24f0b54e9cb398fbfe5928ce833 。本轮不修改作者文件。来源监督成本与额外9000次排序更新分开报告，不能把整条学习管线称仅2064参数。

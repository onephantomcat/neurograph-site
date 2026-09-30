# ZAN时序增强与两视图对比学习结果

2026-09-17。两项实验已完成并通过独立回读；属于现有开发队列的方法探索。

**本轮配置与预算下，未取得可替换原切空间方法的稳定整体改善。**

- ZAN增强：原始FC AUC0.4163→0.3796，旧50人来源冻结表示0.5526→0.5236。随机表示0.5964→0.6006的小幅变化区间跨0，不能解释为预训练知识收益。
- 99人对比学习AUC：原50来源0.6012、ZAN来源0.6209、合并来源0.5968，均低于原切空间0.7525；96人也没有反转。
- 对比学习相对相同裁剪、采样与初始化的两视图重建，3种来源×4任务的12个AUC差值条件区间全部跨0。旧50来源CIN→OSU AUC0.6350高于切空间0.6129，但反向0.5968低于0.6078，不构成双向改善。ZAN来源的两个跨站点BA均下降，其未校正条件区间低于0。
- 以上只评价此固定60步、温度0.2及既定编码器的有限实验；没有据此判定所有增强或对比学习方法无效，也没有根据本轮测试分数追加调参。

## 实际执行

- ZAN54分类：3类表示各比较完整/增强，25个既有外折，共150个最终分类头、1800次内层拟合。
- 来源目标比较：3种来源×3种子×2种目标，共18个新预训练模型；60个既有评估单元，共1080个新分类头、12960次内层拟合。
- 合计1230个新分类头、14760次内层拟合；旧完整FC重建、随机表示及原始FC/切空间参照只复用已有验证结果，不重复计入新训练数量。

## ZAN54：训练折时序增强

完整236帧与起点0/24/48的188帧裁剪；每位训练者总权重1。所有视图按人绑定到既有内外折，缩放只拟合训练者完整视图；验证和测试使用完整视图。使用独立旧50人编码器，ZAN未在全体预训练后测试自身。

![ZAN增强比较](../reports/research-update-2026-09-20/20260917-zan-augmentation-contrastive/zan_augmentation.png)

| 任务 | 方法 | AUC | BA | 患者召回 | 健康召回 | 准确率 | Brier |
|---|---|---:|---:|---:|---:|---:|---:|
| zan54 | raw_fc | 0.4163 | 0.4368 | 0.3840 | 0.4897 | 0.4407 | 0.3288 |
| zan54 | raw_fc_aug | 0.3796 | 0.4466 | 0.3760 | 0.5172 | 0.4519 | 0.3364 |
| zan54 | source_frozen_logistic | 0.5526 | 0.5343 | 0.4480 | 0.6207 | 0.5407 | 0.2567 |
| zan54 | source_frozen_logistic_aug | 0.5236 | 0.5223 | 0.4240 | 0.6207 | 0.5296 | 0.2593 |
| zan54 | random_frozen_logistic | 0.5964 | 0.5644 | 0.5840 | 0.5448 | 0.5630 | 0.2745 |
| zan54 | random_frozen_logistic_aug | 0.6006 | 0.5868 | 0.6080 | 0.5655 | 0.5852 | 0.2763 |

| 任务 | 比较 | ΔAUC | 条件95%区间 | ΔBA | 条件95%区间 |
|---|---|---:|---|---:|---|
| zan54 | raw_fc_aug − raw_fc | -0.0367 | [-0.0720, -0.0058] | +0.0098 | [-0.0291, +0.0499] |
| zan54 | source_frozen_logistic_aug − source_frozen_logistic | -0.0290 | [-0.0557, -0.0039] | -0.0120 | [-0.0407, +0.0183] |
| zan54 | random_frozen_logistic_aug − random_frozen_logistic | +0.0041 | [-0.0381, +0.0532] | +0.0223 | [-0.0225, +0.0727] |

## 原99/96及跨站点：学习目标比较

相同来源、编码器初始化、来源缩放器、每步32位不同受试者、每人两个不同裁剪，共60步Adam更新；合并来源每步各16人。比较平均两视图自重建MSE与对称NT-Xent（温度0.2）。投影头32→32→16；下游使用投影前32维冻结表示与Logistic，C在训练内折选择，阈值0.5。

实现借鉴[SimCLR方法](https://proceedings.mlr.press/v119/chen20j.html)，是针对本地FC编码器的有限适配，不是图网络或原论文配置复现。60步是沿用本次公平比较的预算，不代表对比学习已充分优化。

旧完整FC重建（trained）使用单视图、有放回抽样；本次crop_reconstruction与contrastive使用相同的双视图和无重复批次。因此，只有后两者的差异可用于隔离目标函数；相对旧trained的变化还包含裁剪和采样变化。

![来源学习目标比较](../reports/research-update-2026-09-20/20260917-zan-augmentation-contrastive/source_contrastive.png)

| 任务 | 方法 | AUC | BA | 患者召回 | 健康召回 | 准确率 | Brier |
|---|---|---:|---:|---:|---:|---:|---:|
| CIN-to-OSU | raw_fc | 0.5326 | 0.5558 | 0.7852 | 0.3263 | 0.5957 | 0.2680 |
| CIN-to-OSU | tangent | 0.6129 | 0.5760 | 0.8889 | 0.2632 | 0.6304 | 0.2410 |
| CIN-to-OSU | srpbs50_crop_reconstruction | 0.6224 | 0.5846 | 0.7481 | 0.4211 | 0.6130 | 0.2699 |
| CIN-to-OSU | srpbs50_contrastive | 0.6350 | 0.5923 | 0.6864 | 0.4982 | 0.6087 | 0.2542 |
| CIN-to-OSU | srpbs50_trained | 0.5617 | 0.5274 | 0.6617 | 0.3930 | 0.5507 | 0.2859 |
| CIN-to-OSU | srpbs50_random | 0.5331 | 0.4981 | 0.3926 | 0.6035 | 0.4797 | 0.3559 |
| CIN-to-OSU | zan54_crop_reconstruction | 0.6259 | 0.5945 | 0.7259 | 0.4632 | 0.6174 | 0.2407 |
| CIN-to-OSU | zan54_contrastive | 0.5539 | 0.4888 | 0.6617 | 0.3158 | 0.5188 | 0.2735 |
| CIN-to-OSU | zan54_trained | 0.6105 | 0.5548 | 0.7062 | 0.4035 | 0.5812 | 0.2505 |
| CIN-to-OSU | zan54_random | 0.6006 | 0.5469 | 0.4938 | 0.6000 | 0.5377 | 0.3008 |
| CIN-to-OSU | joint104_crop_reconstruction | 0.5763 | 0.5379 | 0.7531 | 0.3228 | 0.5754 | 0.2575 |
| CIN-to-OSU | joint104_contrastive | 0.6274 | 0.5900 | 0.7309 | 0.4491 | 0.6145 | 0.2669 |
| CIN-to-OSU | joint104_trained | 0.5253 | 0.4808 | 0.6247 | 0.3368 | 0.5058 | 0.2745 |
| CIN-to-OSU | joint104_random | 0.5695 | 0.5424 | 0.4568 | 0.6281 | 0.5275 | 0.3287 |
| OSU-to-CIN | raw_fc | 0.5504 | 0.5371 | 0.3529 | 0.7212 | 0.5960 | 0.2563 |
| OSU-to-CIN | tangent | 0.6078 | 0.5770 | 0.5176 | 0.6364 | 0.5960 | 0.2426 |
| OSU-to-CIN | srpbs50_crop_reconstruction | 0.5879 | 0.5938 | 0.4745 | 0.7131 | 0.6320 | 0.2415 |
| OSU-to-CIN | srpbs50_contrastive | 0.5968 | 0.5856 | 0.5529 | 0.6182 | 0.5960 | 0.2722 |
| OSU-to-CIN | srpbs50_trained | 0.5803 | 0.5977 | 0.4863 | 0.7091 | 0.6333 | 0.2413 |
| OSU-to-CIN | srpbs50_random | 0.5601 | 0.5588 | 0.5216 | 0.5960 | 0.5707 | 0.2971 |
| OSU-to-CIN | zan54_crop_reconstruction | 0.6080 | 0.6496 | 0.5294 | 0.7697 | 0.6880 | 0.2434 |
| OSU-to-CIN | zan54_contrastive | 0.5615 | 0.5585 | 0.4706 | 0.6465 | 0.5867 | 0.2682 |
| OSU-to-CIN | zan54_trained | 0.6175 | 0.6450 | 0.4941 | 0.7960 | 0.6933 | 0.2405 |
| OSU-to-CIN | zan54_random | 0.5832 | 0.5551 | 0.5608 | 0.5495 | 0.5533 | 0.2820 |
| OSU-to-CIN | joint104_crop_reconstruction | 0.5323 | 0.5507 | 0.3843 | 0.7172 | 0.6040 | 0.2516 |
| OSU-to-CIN | joint104_contrastive | 0.5520 | 0.5623 | 0.4235 | 0.7010 | 0.6067 | 0.2585 |
| OSU-to-CIN | joint104_trained | 0.5046 | 0.5459 | 0.3686 | 0.7232 | 0.6027 | 0.2589 |
| OSU-to-CIN | joint104_random | 0.5855 | 0.5888 | 0.6078 | 0.5697 | 0.5827 | 0.2810 |
| primary99 | raw_fc | 0.6448 | 0.6084 | 0.6130 | 0.6038 | 0.6081 | 0.2669 |
| primary99 | tangent | 0.7525 | 0.6866 | 0.6826 | 0.6906 | 0.6869 | 0.2035 |
| primary99 | srpbs50_crop_reconstruction | 0.6283 | 0.6017 | 0.5971 | 0.6063 | 0.6020 | 0.2448 |
| primary99 | srpbs50_contrastive | 0.6012 | 0.5859 | 0.5957 | 0.5761 | 0.5852 | 0.2576 |
| primary99 | srpbs50_trained | 0.6007 | 0.5825 | 0.6116 | 0.5535 | 0.5805 | 0.2474 |
| primary99 | srpbs50_random | 0.5751 | 0.5694 | 0.5652 | 0.5736 | 0.5697 | 0.2615 |
| primary99 | zan54_crop_reconstruction | 0.6183 | 0.6066 | 0.6232 | 0.5899 | 0.6054 | 0.2471 |
| primary99 | zan54_contrastive | 0.6209 | 0.5992 | 0.5681 | 0.6302 | 0.6013 | 0.2528 |
| primary99 | zan54_trained | 0.6300 | 0.6216 | 0.6507 | 0.5925 | 0.6195 | 0.2450 |
| primary99 | zan54_random | 0.5929 | 0.5817 | 0.5710 | 0.5925 | 0.5825 | 0.2552 |
| primary99 | joint104_crop_reconstruction | 0.6084 | 0.6010 | 0.6246 | 0.5774 | 0.5993 | 0.2496 |
| primary99 | joint104_contrastive | 0.5968 | 0.5862 | 0.5812 | 0.5912 | 0.5865 | 0.2543 |
| primary99 | joint104_trained | 0.5807 | 0.5868 | 0.5899 | 0.5836 | 0.5865 | 0.2536 |
| primary99 | joint104_random | 0.5876 | 0.5917 | 0.5797 | 0.6038 | 0.5926 | 0.2563 |
| sensitivity96 | raw_fc | 0.6402 | 0.6009 | 0.5864 | 0.6154 | 0.6021 | 0.2639 |
| sensitivity96 | tangent | 0.7562 | 0.7054 | 0.6955 | 0.7154 | 0.7063 | 0.2044 |
| sensitivity96 | srpbs50_crop_reconstruction | 0.6303 | 0.6071 | 0.6000 | 0.6141 | 0.6076 | 0.2445 |
| sensitivity96 | srpbs50_contrastive | 0.6001 | 0.5886 | 0.5939 | 0.5833 | 0.5882 | 0.2594 |
| sensitivity96 | srpbs50_trained | 0.6018 | 0.5939 | 0.6045 | 0.5833 | 0.5931 | 0.2510 |
| sensitivity96 | srpbs50_random | 0.5778 | 0.5782 | 0.5833 | 0.5731 | 0.5778 | 0.2608 |
| sensitivity96 | zan54_crop_reconstruction | 0.6436 | 0.6160 | 0.6242 | 0.6077 | 0.6153 | 0.2432 |
| sensitivity96 | zan54_contrastive | 0.6212 | 0.6155 | 0.5848 | 0.6462 | 0.6181 | 0.2483 |
| sensitivity96 | zan54_trained | 0.6427 | 0.6215 | 0.6545 | 0.5885 | 0.6188 | 0.2427 |
| sensitivity96 | zan54_random | 0.5794 | 0.5861 | 0.5864 | 0.5859 | 0.5861 | 0.2650 |
| sensitivity96 | joint104_crop_reconstruction | 0.6226 | 0.6110 | 0.6258 | 0.5962 | 0.6097 | 0.2474 |
| sensitivity96 | joint104_contrastive | 0.5749 | 0.5775 | 0.5576 | 0.5974 | 0.5792 | 0.2626 |
| sensitivity96 | joint104_trained | 0.5925 | 0.5968 | 0.6000 | 0.5936 | 0.5965 | 0.2513 |
| sensitivity96 | joint104_random | 0.5842 | 0.5956 | 0.6015 | 0.5897 | 0.5951 | 0.2614 |

## 全部配对比较

2000次分层按人重采样，每个人的全部5次预测及3种子一起抽取。下列区间条件于现有模型，不含重训不确定性，也未做多重比较校正；不凭个别区间或单向结果宣布临床有效。全部候选和种子均保留。

| 任务 | 比较 | ΔAUC | 条件95%区间 | ΔBA | 条件95%区间 |
|---|---|---:|---|---:|---|
| CIN-to-OSU | srpbs50_contrastive − srpbs50_crop_reconstruction | +0.0126 | [-0.0833, +0.1087] | +0.0077 | [-0.0793, +0.1005] |
| CIN-to-OSU | srpbs50_contrastive − srpbs50_trained | +0.0733 | [-0.0407, +0.1775] | +0.0650 | [-0.0333, +0.1572] |
| CIN-to-OSU | srpbs50_contrastive − srpbs50_random | +0.1019 | [-0.0592, +0.2529] | +0.0943 | [-0.0233, +0.2077] |
| CIN-to-OSU | srpbs50_contrastive − tangent | +0.0221 | [-0.1764, +0.2185] | +0.0163 | [-0.1196, +0.1584] |
| CIN-to-OSU | zan54_contrastive − zan54_crop_reconstruction | -0.0720 | [-0.1757, +0.0394] | -0.1058 | [-0.1918, -0.0191] |
| CIN-to-OSU | zan54_contrastive − zan54_trained | -0.0567 | [-0.1497, +0.0425] | -0.0661 | [-0.1400, +0.0165] |
| CIN-to-OSU | zan54_contrastive − zan54_random | -0.0468 | [-0.2048, +0.1008] | -0.0582 | [-0.1741, +0.0523] |
| CIN-to-OSU | zan54_contrastive − tangent | -0.0590 | [-0.2381, +0.1234] | -0.0873 | [-0.2081, +0.0349] |
| CIN-to-OSU | joint104_contrastive − joint104_crop_reconstruction | +0.0511 | [-0.0851, +0.1853] | +0.0520 | [-0.0704, +0.1703] |
| CIN-to-OSU | joint104_contrastive − joint104_trained | +0.1021 | [-0.0468, +0.2398] | +0.1092 | [-0.0046, +0.2259] |
| CIN-to-OSU | joint104_contrastive − joint104_random | +0.0580 | [-0.0968, +0.1988] | +0.0476 | [-0.0691, +0.1620] |
| CIN-to-OSU | joint104_contrastive − tangent | +0.0146 | [-0.1605, +0.2021] | +0.0140 | [-0.1240, +0.1528] |
| OSU-to-CIN | srpbs50_contrastive − srpbs50_crop_reconstruction | +0.0089 | [-0.0676, +0.0809] | -0.0083 | [-0.0767, +0.0548] |
| OSU-to-CIN | srpbs50_contrastive − srpbs50_trained | +0.0165 | [-0.0617, +0.0939] | -0.0121 | [-0.0802, +0.0577] |
| OSU-to-CIN | srpbs50_contrastive − srpbs50_random | +0.0367 | [-0.0933, +0.1727] | +0.0268 | [-0.0881, +0.1455] |
| OSU-to-CIN | srpbs50_contrastive − tangent | -0.0111 | [-0.1480, +0.1408] | +0.0086 | [-0.1004, +0.1142] |
| OSU-to-CIN | zan54_contrastive − zan54_crop_reconstruction | -0.0465 | [-0.1324, +0.0462] | -0.0910 | [-0.1594, -0.0217] |
| OSU-to-CIN | zan54_contrastive − zan54_trained | -0.0560 | [-0.1526, +0.0416] | -0.0865 | [-0.1544, -0.0203] |
| OSU-to-CIN | zan54_contrastive − zan54_random | -0.0217 | [-0.1413, +0.1067] | +0.0034 | [-0.0883, +0.1004] |
| OSU-to-CIN | zan54_contrastive − tangent | -0.0463 | [-0.2054, +0.1292] | -0.0185 | [-0.1475, +0.1035] |
| OSU-to-CIN | joint104_contrastive − joint104_crop_reconstruction | +0.0197 | [-0.0708, +0.1212] | +0.0115 | [-0.0488, +0.0735] |
| OSU-to-CIN | joint104_contrastive − joint104_trained | +0.0474 | [-0.0367, +0.1390] | +0.0163 | [-0.0399, +0.0835] |
| OSU-to-CIN | joint104_contrastive − joint104_random | -0.0335 | [-0.1726, +0.1202] | -0.0265 | [-0.1345, +0.0927] |
| OSU-to-CIN | joint104_contrastive − tangent | -0.0559 | [-0.1938, +0.0977] | -0.0147 | [-0.1167, +0.0859] |
| primary99 | srpbs50_contrastive − srpbs50_crop_reconstruction | -0.0271 | [-0.0790, +0.0263] | -0.0158 | [-0.0608, +0.0301] |
| primary99 | srpbs50_contrastive − srpbs50_trained | +0.0005 | [-0.0612, +0.0616] | +0.0033 | [-0.0474, +0.0560] |
| primary99 | srpbs50_contrastive − srpbs50_random | +0.0261 | [-0.0506, +0.1029] | +0.0165 | [-0.0508, +0.0841] |
| primary99 | srpbs50_contrastive − tangent | -0.1513 | [-0.2328, -0.0706] | -0.1007 | [-0.1789, -0.0224] |
| primary99 | zan54_contrastive − zan54_crop_reconstruction | +0.0026 | [-0.0491, +0.0587] | -0.0074 | [-0.0608, +0.0445] |
| primary99 | zan54_contrastive − zan54_trained | -0.0091 | [-0.0620, +0.0483] | -0.0224 | [-0.0724, +0.0295] |
| primary99 | zan54_contrastive − zan54_random | +0.0280 | [-0.0424, +0.0999] | +0.0174 | [-0.0394, +0.0757] |
| primary99 | zan54_contrastive − tangent | -0.1316 | [-0.2114, -0.0506] | -0.0874 | [-0.1586, -0.0177] |
| primary99 | joint104_contrastive − joint104_crop_reconstruction | -0.0117 | [-0.0585, +0.0343] | -0.0148 | [-0.0519, +0.0249] |
| primary99 | joint104_contrastive − joint104_trained | +0.0161 | [-0.0301, +0.0635] | -0.0006 | [-0.0382, +0.0387] |
| primary99 | joint104_contrastive − joint104_random | +0.0092 | [-0.0609, +0.0794] | -0.0056 | [-0.0714, +0.0544] |
| primary99 | joint104_contrastive − tangent | -0.1557 | [-0.2367, -0.0801] | -0.1004 | [-0.1791, -0.0283] |
| sensitivity96 | srpbs50_contrastive − srpbs50_crop_reconstruction | -0.0302 | [-0.0924, +0.0256] | -0.0184 | [-0.0657, +0.0283] |
| sensitivity96 | srpbs50_contrastive − srpbs50_trained | -0.0017 | [-0.0659, +0.0580] | -0.0053 | [-0.0555, +0.0434] |
| sensitivity96 | srpbs50_contrastive − srpbs50_random | +0.0223 | [-0.0547, +0.1036] | +0.0104 | [-0.0534, +0.0787] |
| sensitivity96 | srpbs50_contrastive − tangent | -0.1561 | [-0.2393, -0.0684] | -0.1168 | [-0.1917, -0.0421] |
| sensitivity96 | zan54_contrastive − zan54_crop_reconstruction | -0.0224 | [-0.0746, +0.0324] | -0.0005 | [-0.0464, +0.0486] |
| sensitivity96 | zan54_contrastive − zan54_trained | -0.0214 | [-0.0790, +0.0370] | -0.0060 | [-0.0579, +0.0495] |
| sensitivity96 | zan54_contrastive − zan54_random | +0.0418 | [-0.0281, +0.1139] | +0.0294 | [-0.0301, +0.0869] |
| sensitivity96 | zan54_contrastive − tangent | -0.1350 | [-0.2164, -0.0512] | -0.0899 | [-0.1598, -0.0151] |
| sensitivity96 | joint104_contrastive − joint104_crop_reconstruction | -0.0476 | [-0.1004, +0.0024] | -0.0334 | [-0.0724, +0.0068] |
| sensitivity96 | joint104_contrastive − joint104_trained | -0.0175 | [-0.0675, +0.0310] | -0.0193 | [-0.0590, +0.0207] |
| sensitivity96 | joint104_contrastive − joint104_random | -0.0093 | [-0.0720, +0.0564] | -0.0181 | [-0.0746, +0.0402] |
| sensitivity96 | joint104_contrastive − tangent | -0.1813 | [-0.2562, -0.1059] | -0.1279 | [-0.1970, -0.0563] |

## 核验与限制

增强：150个模型手算回读、150个模型重拟合、72次内层重拟合；所有候选得分回算。未增强分支与旧实验预测最大差2.77e-08。
来源目标：18个来源模型同种子重训、18组特征重算；1080个分类头手算回读、72个代表头重拟合、216次内层重拟合。全部内层选择复核；没有重训全部14760次内层候选。
损失手算、正样本对应与批次唯一性3项测试通过。首轮增强输入加载的浮点批次舍入差异已处理：保留旧完整视图表示，裁剪表示独立计算；原失败记录保留，QC规则未变。
原来源50例帧数/TR不同（40例240/2.5s、8例177/2s、2例107/2.7s）；其80%裁剪最短85帧，不人为填充。ZAN为7T/236帧/TR2s。无GSR与AAL90一致不意味着采集相同。
没有新增受试者或VAS标签，没有将ZAN组别拼入旧Pain标签，没有修改远端OA/SRPBS或QC审核。54人与99/96任务不同，不跨任务比较AUC宣布改善。网站与Git本轮未修改。

私有模型/划分/逐人预测：本地研究材料（未公开）。完整聚合CSV、种子表、配对区间与图：本地研究材料（未公开）。

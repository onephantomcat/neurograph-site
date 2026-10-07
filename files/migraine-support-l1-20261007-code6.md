# L1训练内诊断

本目录实现冻结特征的L1分类头、仅对优化残差偏大的头做数值精化、训练折内梯度阈值缩放，以及较大监督预算的内层实验。所有选择只使用训练人员；原固定K5四方法的540次拟合、45个FC参考及外层成绩保持。

`support_l1.run(data, parent_run, new_output)`接收原输入包与原K5保存目录。输入包字段为subject_ids、labels、time_series、pretrained、random、covariates。训练代码只索引当前支持人员。它复用原内层模型的训练人员FC参考、加权标准化与类权重，不读取原外层预测表。原每类K5支持内两折、四λ及强正则优先的并列处理保留。

其余脚本通过本目录的运行receipt定位私有输入和既有输出；receipt、模型、时序、人员划分、设计矩阵和逐人概率不能公开。`refine_numerics.py`只处理首轮KKT残差超过原tol=1e-4的头，以固定tol=1e-8、max_iter=50000重算，保留原480头。`relative_lambda_training.py`在每个内层训练折计算零解阈值lambda_max，再用固定比例1/.3/.1/.03。`full_training_budget.py`复用原三外折，每折88名训练人员内部做两折，内层44人；它新估计六个训练人员FC参考，没有拟合外层最终头。

`replay_support_l1.py --run <本次输出> --parent <原固定K5输出> [--source <原输入包>]`独立重建sigmoid、平衡logloss、选参、梯度阈值和L1 KKT残差；较大预算还检查新FC参考的训练人员、正定性及平均矩阵对数残差。重放不拟合新模型。

已执行环境：Python3.13、scikit-learn1.8.0，L1使用l1_ratio=1与liblinear。真实临床验证、外层AUC改善及完整儿科论文复现均未完成。内层选参后的损失有选择偏差；不同预算的验证人群不同，不能将其损失差作配对效果。

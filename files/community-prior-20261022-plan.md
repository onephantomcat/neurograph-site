# BrainHGT社区先验基适配：拟合前有限方案

2026-10-22。用户授权查新、核对代码、同人同预算有限实验、全seed与阴性保留、对比表和网站发布。

## 身份与查新
完整BrainHGT作者固定版本4f411fab1163e24f0b54e9cb398fbfe5928ce833，原AAL90 signed FC/个体OMST、Dice90×8、256维/8头/1层/FF1024/展平encoder32/冻结原型均保持。本地疼痛任务适配，不是作者ABIDE/ADNI原协议复现。

已查最近原始来源：BrainHGT AAAI2026（https://ojs.aaai.org/index.php/AAAI/article/view/38817）、TC-BrainTF（https://arxiv.org/html/2403.08203；本次只按可读预印本标注）、CAGT IJCAI2025（https://www.ijcai.org/proceedings/2025/0467.pdf）、BrainPrompt MICCAI2025（https://papers.miccai.org/miccai-2025/0115-Paper1562.html）、NERVE MICCAI2026（https://papers.miccai.org/miccai-2026/0708-Paper3895.html）。这些已有社区/先验/提示/低参数机制；本候选仅为可辨识机制实验，不主张通用低秩或先验适配原创，更没有疼痛生物标志物新颖性结论。作者clustering网页请求超时后使用已保存原源码，并核对服务器实际文件；不执行新下载第三方代码。

## 原代码事实与新问题
原clustering先全脑展平encoder，再计算community prototypes到ROI的q/k/v；归一化Dice乘原attention energies，entmax15沿ROI轴（dim=-1）归一化，最后社区自注意力和FFN。soft_assignment为[B,90,8]但每社区沿90ROI归一化，不能误称每ROI的8社区概率之和为1。Dice零值也不是硬mask，零logit仍可分到注意力。

固定空间先验的有限适配能否改变训练内泛化和分配稳定性？假设尚未证明。当前没有新增独立的疼痛特异空间权重，不将本候选称疼痛专属先验。不是重复ROI共享encoder、不是改变LSRA乘法/log偏置、不是重开旧收缩/时序/增强搜索。

## 唯一适配公式和对照
D为作者L2行归一化先验。SVD只对这个固定解剖矩阵，不对患者特征；取前两左奇异向量，每列最大绝对值位置设正，再按最大行L2范数缩放得到Q[90,2]。guided使用真实ROI顺序Q；shuffled使用固定numpy RNG20261022产生的同一90行排列Q，保留奇异值/列范数/全部参数量。原D本身不打乱。

两候选均新增B[2,8]，零初始化，D_eff = D * exp(0.5*tanh(Q @ B))。增益范围exp(-.5)—exp(.5)，符号/零支持保留；继续使用作者energy乘D_eff与原entmax，不宣称修复乘法对负energy的含义，也不硬禁原零先验位置。无行再归一化，以B=0准确保持原起点。Q/B均非患者自监督或跨人统计。

总参数原3309738→估算3309754，可训练3307690→估算3307706（实际运行核实）。原全部tensor初始化和训练RNG保持；新模块零初始化，不加载已拟合患者主干。原Adam lr/wd各1e-4，新增B固定lr1e-3/wd1e-4，另加0.01*mean(B²)，两个候选完全相同，不扫描rank/scale/lr/loss。完整可训练模型不因新增16参数就变成16自由度系统。hook仅作用该新model实例，不修改作者文件。

## 人员、训练预算和指标
唯一主队列SRPBS99，46患者/53对照；按索引机械选原outer0的全部3内折，seed0—4，不按成绩选择外折。这3内折只覆盖原外训练79人，每内层训练52/53、验证27/26，原外查询20人不作新评分。全标签监督，不是K-shot或支持内K10/20。GPU原基线已保存，作为历史背景；由于GPU被其他账号使用，本轮CPU的随机dropout与GPU不等价，必须增加同设备原模型参照，才能单独归因模块。这不是刷新历史OOF，也不覆盖旧结果。

original/guided/shuffled各15模型×100epoch，batch32/普通CE/原最高内层AUROC最早并列选轮；总45新内层拟合，CPU两线程。记录所有逐轮指标、全seed、选轮、B、实际D变化、分配变化、失败。CPU原模型与两个候选必须同tr/va成员、seed、全部原tensor初始化、训练dropout随机流、选轮与训练配置；不能把历史GPU外层0.6292当内层参照。

拟合前继续条件沿既有有限比较：guided相对原平均内层ΔAUC>0、至少3/5seed正方向、平均Δlogloss<=0.02；另外guided相对shuffled平均ΔAUC>0、至少3/5seed正方向且平均Δlogloss<=0.02。验证参与选轮，读数有乐观偏差，仅决定后续；不把重叠内分区当独立队列或临床显著性。不满足即停止；满足也仅说明本次有限可行性，下一步先补原其余训练分区，不直接升级泛化。

本批仅上述45内层拟合，不运行任何新外层或单外折成绩，不把3重叠内折或五seed当独立队列。主要为每seed三内折的均值，再五seed均值/样本SD；不是OOF，不新增看查询。完成后根据全部结果判断停止或是否有必要另行扩充未覆盖原训练分区，不继续调rank/scale/lr到出现好分。无新传统模型拟合。

## 执行与验证
原项目私有数据与已有运行环境；仅新任务作用域执行。拟合前权限、Python版本及传输错误保留在技术失败记录，不改变数据权限或全局配置。新程序CPU2线程、GPU0、MRI转运0；总执行最长3600秒、失败不自动重试。其他账号GPU作业及音乐QC不触碰。

必要普通检查：零初始化与原模型输出/全原tensor一致；非零有限梯度、固定原型、hook在train/eval一致、查询批次/顺序、严格保存加载；固定Q/乱序匹配。科学拟合后逐个saved模型回放、成员/选轮/全部指标和继续决定复算；稳定性仅分配变化/seed方向等开发描述，不称真实重测。预训练重叠、身份/临床三终点/QC/原停止边界保持。

结果后按fmri-results-publisher和de-ai-web-writing同步真实聚合，公开不含逐人数据、权重或实际私有路径；保护共享脏区，普通Git发布与实际部署分别核对。不新增Goal、自动化、hash/contract/gate、作者联系或memory。

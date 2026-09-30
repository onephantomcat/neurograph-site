# 通用脑科学医学影像项目：学校服务器与 Mac 交接手册

最后核验：2026-07-27

适用范围：rs-fMRI、task-fMRI、T1w、DWI/DTI、脑连接组、脑图神经网络及相关多模态研究

使用边界：研究用途；涉及真实患者数据时，须先满足伦理、授权、去标识化和访问控制要求

> [!IMPORTANT]
> 本文把“当前机器上已核验的事实”与“新项目建议采用的协议”分开记录：
>
> - `OBSERVED`：2026-07-27 在当前 Mac 或学校服务器上直接核验。
> - `PROPOSAL`：可复用的建议；必须按新项目的数据、伦理和终点重新冻结。
> - `EXTERNALLY VERIFIED`：由明确外部来源独立核验；本文不据此声明任何模型性能。

---

## 1. 一页交接结论

### 1.1 两台机器的推荐分工

| 机器 | 推荐职责 | 不应默认承担 |
|---|---|---|
| Mac | Git/GitHub、代码开发、联网下载依赖、制作 Linux 离线 wheelhouse、轻量测试、可视化、审计、报告、小型确定性 CPU 模型 | 长期保存大规模原始影像；直接复用 arm64 wheel 到 Linux；未经核验运行 MATLAB/DPABI |
| 学校服务器 | 大体积数据、BIDS/衍生物、CPU 预处理、经批准的 GPU 训练、检查点、批量 QC、最终可复现运行 | 在线安装依赖；把 Python 环境放到 NTFS；默认占用 GPU0；无授权使用共享目录 |

### 1.2 必须长期遵守的硬边界

1. 原始数据只读保存；处理结果写入版本化 `derivatives/` 或 `runs/`，不得覆盖原始影像。
2. 直接身份信息与研究 ID 的对应表单独保护，不进入 Git、日志、模型、提示词或报告。
3. 服务器上的格式化、文件系统修复、强制卸载、提权、`/etc/fstab` 修改和广泛权限变更，不得擅自执行。
4. Python/Conda/uv 环境必须放在 Linux 原生文件系统；NTFS 只放数据、结果、检查点和可重建缓存。
5. Mac 与服务器架构不同：Mac 为 arm64，服务器为 x86_64；二进制环境不能直接复制。
6. 数据拆分必须早于任何会学习数据分布的预处理；同一受试者的全部扫描、窗口和模态只能进入同一外层折。
7. 标签与站点/队列完全共线时，任何 harmonization、加权或深度“去混杂”都不能识别疾病效应；必须换终点、补数据单元格或降低结论。
8. 所有临床相关输出标注：`Research use only - clinician review required`。

### 1.3 新项目的最小交付物

```text
PROJECT_CONTRACT.md
DATA_DICTIONARY.tsv
config/
data_manifest.tsv
fold_assignments.tsv
environment/
qc/
runs/<experiment_id>/
reports/FINAL_REPORT.md
```

缺少研究契约、数据清单、固定折分或运行哈希时，不进入正式建模。

---

## 2. 当前基础设施快照

以下数字会变化，每次接手或运行前都应重新检查。

### 2.1 Mac：`OBSERVED`

| 项目 | 当前状态 |
|---|---|
| 系统 | macOS 26.2，Apple Silicon `arm64`，型号 `Mac16,11` |
| 内存 | 24 GiB |
| 当前可用磁盘 | 约 32 GiB |
| 全局 Python | 3.14.2；不能替代项目要求的 Python 3.12 |
| 当前项目 Python | `.venv/bin/python` 3.12.13，arm64 |
| uv | 0.11.28 |
| Git | Apple Git 2.50.1 |
| 当前项目 PyTorch | 2.13.0，`torch.cuda.is_available() == False` |
| 已在 PATH | R、Docker CLI、tmux、rsync、shasum |
| 未在 PATH | MATLAB、dcm2niix、FSL、FreeSurfer、AFNI、ANTs、Conda/Mamba |

“未在 PATH”不等于机器上绝对不存在，但接班人不得假定可以直接调用。

### 2.2 学校服务器：`OBSERVED`

| 项目 | 当前状态 |
|---|---|
| SSH | `user001@[处理服务器地址已省略]` |
| 主机 | `TM-new` |
| 系统 | Ubuntu 18.04.6 LTS，Linux 4.15，x86_64 |
| glibc | 2.27 |
| CPU / 内存 | 32 逻辑 CPU，125 GiB RAM，238 GiB swap |
| GPU | 4 × NVIDIA GeForce GTX 1080 Ti，每张约 11 GiB |
| 调度器 | `squeue` 不在 PATH；按无集群调度器处理 |
| 用户权限 | `uid=1020(user001)`；无密码 sudo 不可用 |
| `/home` | ext4，约 32 GiB 可用，使用率约 99% |
| 数据盘 | `/dev/sdd2`，NTFS/fuseblk，挂载于 `[本机路径已省略]`，约 2.6 TiB 可用 |
| 数据盘入口权限 | `700 user001:user001` |
| 当前项目环境 | `[本机路径已省略]`，Python 3.12.13 |
| 服务器 uv | `[本机路径已省略]` 0.11.32；非交互 SSH 中不要依赖 PATH |
| 当前项目环境包 | numpy 2.2.6、scipy 1.16.3、pandas 2.3.2、scikit-learn 1.7.2、nibabel 5.4.2；未安装 torch |
| 已在 PATH | tmux、rsync、sha256sum、nvidia-smi |
| 未在 PATH | dcm2niix、FSL、FreeSurfer、AFNI、ANTs、MATLAB、R、Docker、Singularity/Apptainer、Conda/Mamba |

2026-07-27 核验时 GPU0 报告 100% 利用率，其他三张为 0%。这是瞬时状态，不是永久分配；每次运行必须重新检查并与其他使用者协调。

### 2.3 存储解释

- `[本机路径已省略]` 是原生 ext4，适合代码和少量环境，但目前空间紧张。
- `[本机路径已省略]` 容量充足，适合原始数据、BIDS、衍生物、结果和检查点。
- NTFS/fuseblk 对大量小文件、执行位、链接和原子重命名的语义不如 Linux 原生文件系统，不适合 Python 环境。
- `/data` 与 `/DATA` 当前可写且为 ext4，但属于共享系统目录。没有项目负责人或管理员明确分配前，不得把它们当作私人 scratch。
- 当前数据盘是手动挂载边界；重启后不得假定仍在同一路径、仍为同一权限或仍可写。

---

## 3. 新项目启动前先冻结研究契约

每个项目先创建 `PROJECT_CONTRACT.md`，至少回答以下问题。

### 3.1 研究问题

- 分析单位：受试者、访视、扫描还是 session？
- 目标人群、对照定义和纳入/排除标准是什么？
- 主终点是什么？标签来源、量表版本、阈值和测量时间是什么？
- 连续严重度终点与分类终点是否混为一谈？
- 是关联、预测、内部验证、外部验证还是临床效用研究？
- 允许使用哪些模态：T1w、rs-fMRI、task-fMRI、DWI、临床量表、文本或生理信号？
- 是否存在重复扫描、亲属、跨站点、跨扫描仪或治疗前后数据？

### 3.2 治理与授权

- 伦理审批、知情同意、数据许可和允许用途是否有书面依据？
- 数据能否离开服务器？哪些衍生物可以复制到 Mac？
- 直接标识符在哪里保存，谁可以访问？
- 保存期限、删除责任和备份责任是什么？
- 是否允许外部云服务、外部 LLM 或第三方模型接触数据？

### 3.3 预注册的主分析

预先固定：

- 一个主终点；
- 一个主指标；
- 外层分组单位；
- 内外层拆分方法；
- 模型选择指标和停止规则；
- 基线、混杂对照、消融、置换和置信区间方法；
- 主分析队列与敏感性队列；
- 允许和禁止的结论。

完成后给契约文件计算 SHA-256。修改契约必须产生新版本和新的实验 ID，不能静默覆盖。

---

## 4. 数据治理与目录布局

### 4.1 推荐物理布局：`PROPOSAL`

Mac 代码目录建议放在非 iCloud 路径：

```text
[本机路径已省略]<project_slug>/
```

如果继续使用当前习惯，也可以放在：

```text
[本机路径已省略]<project_slug>/
```

不要把大型影像、模型或环境放入 `~/Documents` 等可能同步到 iCloud 的目录。

服务器建议：

```text
[本机路径已省略]<project_slug>/       # 代码与小型配置
[本机路径已省略]<project_slug>/           # Python 环境
[本机路径已省略]<project_slug>/
├── raw/                                     # 原始、只读
├── bids/                                    # 标准化数据
├── derivatives/                             # 预处理衍生物
├── work/                                    # 可重建中间文件
├── runs/                                    # 不可变实验运行
├── checkpoints/                             # 大模型权重
├── manifests/                               # 数据/哈希/排除清单
├── qc/                                      # 受试者级 QC
└── wheelhouse/                              # Linux 离线安装包
```

由于 `/home` 只剩约 32 GiB，新环境创建前必须估算空间。大型 GPU 环境应先请求原生 ext4 项目空间，不能直接放到 NTFS。

### 4.2 Git 中允许和禁止的内容

允许：

- 源码、测试、配置模板；
- 去标识化的小型清单；
- 数据字典、折分、哈希、指标和报告；
- 可公开或经授权的小型示例。

默认禁止：

- DICOM 和大型 NIfTI；
- 直接身份信息及研究 ID 对照表；
- SSH 私钥、token、密码、`.env`；
- 未经授权的临床文本；
- 大型检查点、缓存和临时工作目录；
- 带嵌套 `.git` 的导出目录。

私有 GitHub 仓库也不是存放身份信息的充分理由。

### 4.3 数据清单

`data_manifest.tsv` 至少包含：

| 字段 | 含义 |
|---|---|
| `subject_id` | 去标识化且不可变的研究 ID |
| `session_id` / `visit_id` | 访视或扫描标识 |
| `site` / `scanner` | 站点、型号、场强和序列版本 |
| `modality` | T1w、BOLD、DWI 等 |
| `source_path` | 项目内相对路径或受控 URI |
| `source_sha256` | 原始文件或目录清单哈希 |
| `acquisition_timepoint` | 相对诊断/治疗的时间点 |
| `label_source` | 标签来源及版本 |
| `qc_status` | `PASS`、`FAIL`、`MANUAL` |
| `exclusion_reason` | 非重叠的排除原因 |
| `pipeline_version` | 产生衍生物的流程版本 |
| `missingness_reason` | 未采集、损坏、QC 失败或未知 |

同一受试者跨模态、跨访视的映射必须唯一。直接身份对应表应放在独立受控位置，不放进项目树。

---

## 5. 影像进入项目后的质量门禁

不应把一套固定预处理参数机械套用到所有研究。先记录设备、序列、任务和研究问题，再冻结参数。

### 5.1 通用完整性检查

- DICOM/NIfTI 可读性、文件数、压缩完整性；
- 方向、affine、体素大小、维度和单位；
- BOLD 的 TR、volume 数、丢帧和采集时长；
- T1w 是否存在，是否与功能像同一受试者；
- DWI 的 bval/bvec 数量、方向和图像维度；
- 重复文件、重复受试者和跨数据源重叠；
- 标签、扫描日期和治疗时间点是否一致；
- 原始文件 SHA-256 与传输前是否一致。

### 5.2 rs-fMRI / task-fMRI

至少保存：

- 头动：FD、DVARS、最大位移、剔除帧比例；
- 配准：EPI→T1、T1→模板及逆变换；
- 覆盖：全脑、图谱 ROI 和关键区域覆盖率；
- tSNR、时间点数和滤波后的有效自由度；
- nuisance regression、GSR、scrubbing、滤波和 smoothing 的明确配置；
- 受试者级 montage 或接触表，供人工复核。

动态窗口、数据增强和多个任务 run 仍属于同一受试者，不能跨训练/测试折。

### 5.3 T1w

至少检查：

- 运动伪影、bias field、颅骨剥离；
- 分割结果和脑组织边界；
- 模板配准、左右方向和关键结构；
- FreeSurfer/分割工具的版本、失败状态和人工修订记录。

### 5.4 DWI/DTI

至少检查：

- bval/bvec 一致性和方向旋转；
- susceptibility、eddy current、运动与 slice dropout；
- 配准到 T1/模板的合理性；
- tractography 参数、随机种子和过滤规则；
- 图边权定义、零值、负值及稀疏化规则。

### 5.5 图谱与 ROI

- 固定图谱必须记录名称、版本、空间、标签文件哈希和 affine。
- 受试者到模板的配准必须先于 ROI 汇总验收。
- 缺失体素不能默认为 0；“无测量”与“测量值为 0”语义不同。
- 若共同支持域随受试者变化，先建立统一掩膜或预注册排除规则。
- 从标签或全数据学习 ROI/边阈值时，只能在训练折内完成。

---

## 6. 环境管理：Mac 与 Linux 分开锁定

### 6.1 原则

1. 以 `pyproject.toml` 表达依赖范围。
2. 分别记录 Mac arm64 与 Linux x86_64 的实际解析结果。
3. 服务器 glibc 2.27 只能使用兼容 wheel；看到 `GLIBC_x.y not found` 时，不要反复重装同一包。
4. 不把 Mac 的 `.venv`、`.so`、wheel 或解释器复制到服务器。
5. 不向一个已经验证过的环境临时塞入大型 GPU 栈；为 GPU 实验建立独立环境。

### 6.2 Mac 项目环境示例

```bash
cd [本机路径已省略]<project_slug>
uv python install 3.12
uv venv --python 3.12 .venv
uv sync --frozen
.venv/bin/python --version
uv pip freeze --python .venv/bin/python
```

当前 Mac 的全局 Python 是 3.14.2，不能因为 `python3` 可用就跳过项目版本约束。

### 6.3 服务器项目环境示例

在获得项目目录许可并确认 `/home` 空间后：

```bash
SERVER_UV=[本机路径已省略]
SERVER_ENV=[本机路径已省略]<project_slug>

"$SERVER_UV" venv --python 3.12 "$SERVER_ENV"
"$SERVER_ENV/bin/python" --version
```

非交互 SSH 不一定加载用户 PATH，应调用绝对路径。

如果 wheel cache 位于 NTFS：

```bash
export UV_CACHE_DIR=[本机路径已省略]<project_slug>/wheelhouse/cache
export UV_LINK_MODE=copy
```

环境本身仍须位于原生 Linux 文件系统。

### 6.4 离线安装

过去的项目已验证服务器不能可靠访问外部软件源；新项目开始时应重新确认，但不要把解析失败直接归因于包不存在。

在联网 Mac 上先建立带 pip 的 Python 3.12 打包环境，再为服务器下载二进制 wheel：

```bash
WHEEL_BUILDER=[本机路径已省略]
uv venv --python 3.12 --seed "$WHEEL_BUILDER"

"$WHEEL_BUILDER/bin/python" -m pip download \
  --dest [本机路径已省略]<project_slug>/cp312-linux-x86_64 \
  --platform manylinux2014_x86_64 \
  --python-version 3.12 \
  --implementation cp \
  --abi cp312 \
  --only-binary=:all: \
  numpy scipy pandas scikit-learn nibabel pytest
```

下载器仍可能按本机解释器处理少数 environment marker。安装前应检查依赖闭包，并把目标 Python 3.12 需要但未下载的包显式加入清单。

先 dry-run 传输：

```bash
rsync -avhn --itemize-changes \
  [本机路径已省略]<project_slug>/cp312-linux-x86_64/ \
  user001@[处理服务器地址已省略]:/media/user001/fmriworking/projects/<project_slug>/wheelhouse/
```

确认后去掉 `-n`。不要默认使用 `--delete`。

服务器安装时明确指定解释器：

```bash
[本机路径已省略] pip install \
  --python [本机路径已省略]<project_slug>/bin/python \
  --no-index \
  --find-links [本机路径已省略]<project_slug>/wheelhouse \
  numpy scipy pandas scikit-learn nibabel pytest
```

PyTorch/CUDA、FreeSurfer、FSL、AFNI、ANTs、MATLAB/SPM/DPABI 或 dcm2niix 均不在当前通用环境中。若新项目需要，单独设计兼容性和许可方案，不要把上述示例当作完整影像环境。

---

## 7. 代码与数据在两端之间移动

### 7.1 代码

- Mac/GitHub 作为代码审阅与发布入口。
- 服务器只运行明确 commit 的代码。
- 上传前确认 `git status`、commit SHA、配置哈希和数据哈希。
- 服务器无法访问 GitHub 时，使用经过哈希验证的 `git bundle` 或 commit-specific archive；不要复制一个带未提交改动的工作目录。
- 不向服务器上正在使用的工作树强推，不使用 `git push --force`。

推荐每次运行记录：

```text
repository
commit_sha
dirty_worktree
config_sha256
data_manifest_sha256
fold_assignments_sha256
environment_lock_sha256
```

### 7.2 大数据和衍生物

先 dry-run：

```bash
rsync -avhn --itemize-changes --partial \
  /absolute/mac/source/ \
  user001@[处理服务器地址已省略]:/media/user001/fmriworking/projects/<project_slug>/incoming/
```

确认范围后再执行实际同步：

```bash
rsync -avh --itemize-changes --partial \
  /absolute/mac/source/ \
  user001@[处理服务器地址已省略]:/media/user001/fmriworking/projects/<project_slug>/incoming/
```

传输前后分别生成清单：

Mac：

```bash
find /absolute/mac/source -type f -print0 \
  | sort -z \
  | xargs -0 shasum -a 256
```

服务器：

```bash
find [本机路径已省略]<project_slug>/incoming -type f -print0 \
  | sort -z \
  | xargs -0 sha256sum
```

比较完整清单，不只比较文件数量。任何哈希不一致都先停止处理。

### 7.3 从服务器取回结果

只复制去标识化、经授权且足够小的结果：

```bash
rsync -avhn --itemize-changes \
  user001@[处理服务器地址已省略]:/media/user001/fmriworking/projects/<project_slug>/runs/<experiment_id>/ \
  [本机路径已省略]<project_slug>-results/<experiment_id>/
```

禁止为了方便把整份原始患者数据镜像到 Mac。

---

## 8. GPU 与长任务协议

### 8.1 启动前

```bash
ssh user001@[处理服务器地址已省略]
nvidia-smi
ps -u user001 -o pid,etime,cmd
df -h [本机路径已省略] [本机路径已省略]
free -h
```

要求：

- 确认目标 GPU 空闲并与共享服务器使用者协调；
- 不默认使用 GPU0；
- 明确预计显存、运行时长和输出位置；
- 先运行小样本 CPU smoke test；
- 再运行单折或单 batch GPU smoke test；
- smoke 通过后才进入完整任务。

指定已批准 GPU：

```bash
export CUDA_VISIBLE_DEVICES=<approved_gpu_index>
```

不要在文档或脚本中把 GPU 编号永久写死为 0。

### 8.2 长任务

服务器有 tmux，可使用：

```bash
tmux new -s <project_slug>-<experiment_id>
```

每个任务必须保存：

- 完整命令；
- 开始/结束时间；
- PID、主机、GPU；
- stdout/stderr；
- 每折或每阶段进度；
- 最后一个成功检查点；
- 退出码和失败原因。

断开 SSH 前确认任务位于 tmux 内，且日志和检查点写入项目运行目录。

### 8.3 当前 GPU 限制

- 服务器当前项目环境没有 torch。
- 4 张 GTX 1080 Ti 每张约 11 GiB，不能假定支持任意新 CUDA/PyTorch 组合。
- 创建 GPU 环境前先验证 Python、驱动、CUDA wheel、GPU 架构和一个最小 tensor 运算。
- GPU 不可用时，优先保留 CPU 可复现基线，不要为追求复杂模型破坏已验证环境。

---

## 9. 无泄漏建模协议

### 9.1 先拆分，后学习

外层折生成后立即持久化 `fold_assignments.tsv`。以下步骤只能在外层训练数据中拟合：

- imputation、scaling 和 nuisance regression；
- ComBat/harmonization；
- PCA、特征选择和 learned atlas；
- ROI/边阈值和图稀疏化参数；
- oversampling、synthetic samples 和 graph augmentation；
- 超参数、early stopping、概率校准和分类阈值。

外层测试折只允许在最终模型锁定后评估一次。

### 9.2 分组规则

- 同一受试者的所有 session、时间窗口、模态和增强视图归入同一外层折；
- 重复扫描、亲属和数据源重复按组处理；
- 多站点项目增加 leave-one-site-out；
- 纵向或治疗研究按时间点与受试者同时分组；
- 外部测试数据不能出现在预训练、检索库、合成提示或 teacher 监督中。

### 9.3 输入泄漏

必须排除或显式审计：

- 最终诊断、报告结论和标签名称；
- 治疗后结局作为治疗反应预测的输入；
- 作为回归目标的量表总分；
- 文件夹名、文件名或 pipeline failure 直接编码类别；
- 站点、扫描仪、扫描长度和缺失模式；
- 由全体数据选择的 ROI、边或阈值。

### 9.4 队列混杂

先生成“标签 × 站点/队列 × 扫描仪 × 药物/时间点”的列联表。

如果某一层内只有一个标签，即出现完全共线：

- 不得声称模型识别了疾病生物学；
- ComBat、残差化、逆概率加权或域对抗不能恢复不存在的信息；
- 可以改为层内存在正负标签的患者内终点；
- 或把原任务降级为“队列区分”的方法学实验；
- nuisance-only、扫描长度和站点预测作为负对照并列报告。

### 9.5 评估

分类至少报告：

- ROC AUC；
- 类别不平衡时的 PR AUC；
- balanced accuracy；
- 灵敏度、特异度及阈值来源；
- Brier score 或校准误差；
- 混淆矩阵和每类样本量；
- 受试者级 95% 置信区间。

回归至少报告：

- MAE、RMSE 和明确定义的 R²；
- 相关系数仅作为次要指标；
- 残差和量表范围内误差；
- 受试者级置信区间。

折不能被当作独立患者做朴素显著性检验。

### 9.6 模型阶梯

按顺序推进：

1. 人口学、临床、运动和站点 nuisance 基线；
2. 正则化线性/逻辑回归；
3. SVM 或固定连接组模型；
4. 简单 MLP；
5. GCN/GAT；
6. BrainGNN/BrainHGT 或更复杂图模型；
7. 多模态、多任务和 LLM 组件。

只有前一级可复现且稳定时才进入下一级。复杂模型必须与相同折、相同调参预算和相同输入的简单基线比较。

### 9.7 稳健性

至少包含：

- 标签置换；
- motion/site/scanner-only 负对照；
- 多随机种子和多外层拆分；
- 图谱、图密度、连接估计器和 QC 阈值敏感性；
- 年龄、性别、药物、病程和站点亚组；
- 缺失模态策略；
- 解释稳定性和参数随机化检查。

---

## 10. 可复现运行目录

每个正式实验使用不可变 ID，例如：

```text
20260727T120000Z_<git8>_<config8>_<data8>
```

建议目录：

```text
runs/<experiment_id>/
├── RUN_MANIFEST.json
├── config.lock.toml
├── environment.txt
├── data_manifest.sha256
├── fold_assignments.tsv
├── fold_assignments.sha256
├── command.txt
├── logs/
├── checkpoints/
├── predictions.tsv
├── metrics.json
├── qc/
└── REPORT.md
```

`RUN_MANIFEST.json` 至少记录：

| 字段 | 内容 |
|---|---|
| `experiment_id` | 不可变 ID |
| `evidence_status` | `PROPOSAL` 或 `OBSERVED` |
| `objective` | 单一研究问题 |
| `endpoint` | 标签定义和测量时间 |
| `cohort` | 样本、站点、类别、缺失模态 |
| `code_sha256` / `git_commit` | 代码身份 |
| `config_sha256` | 配置身份 |
| `dataset_sha256` | 数据集身份 |
| `fold_sha256` | 外层折身份 |
| `environment` | Python、包、OS、CUDA |
| `host` / `gpu` | 运行资源 |
| `seed` | 全部随机种子 |
| `started_at` / `finished_at` | 时间 |
| `exit_status` | 成功或明确失败 |
| `limitations` | 当前结论边界 |

不要覆盖旧运行。需要重跑时生成新实验 ID，并说明重跑原因。

---

## 11. 每日开工的只读检查

### 11.1 Mac

```bash
sw_vers
uname -m
df -h /
git status --short --branch
git log -5 --oneline --decorate
.venv/bin/python --version
uv --version
```

### 11.2 服务器

```bash
ssh -o BatchMode=yes -o ConnectTimeout=8 user001@[处理服务器地址已省略]
id
uname -srmo
findmnt [本机路径已省略]
df -h [本机路径已省略] [本机路径已省略]
nvidia-smi
ps -u user001 -o pid,etime,cmd
[本机路径已省略]<project_slug>/bin/python --version
git status --short --branch
```

先确认环境和数据身份，再执行任何构建或训练。

---

## 12. 常见故障与安全处理

| 现象 | 优先判断 | 安全处理 |
|---|---|---|
| SSH `Permission denied` | 密钥未授权，不等同于网络不通 | 核对主机与公钥；不要反复猜密码 |
| 数据盘路径不存在 | 重启后未挂载或设备身份变化 | 用 `lsblk -f`、`findmnt`、`udisksctl info` 只读核验；停止并请求批准 |
| 数据盘可读不可写 | 挂载选项或目录权限变化 | 只读核对；不要自行 sudo mount、chmod 整盘或改 fstab |
| 环境中的 Python 不能执行 | 环境放在 NTFS 或执行位丢失 | 在原生 ext4 重新创建环境；不要修补整个 NTFS 权限 |
| pip/uv 报 `no versions found` | 服务器离线、索引内容异常或 glibc 不兼容 | 在 Mac 制作目标平台 wheelhouse，服务器 `--no-index` 安装 |
| `Exec format error` | 把 arm64 二进制复制到 x86_64 | 为 Linux x86_64 重新下载或构建 |
| `GLIBC_x.y not found` | wheel 要求高于服务器 glibc 2.27 | 选择 manylinux2014/兼容版本或使用经批准的新运行环境 |
| `torch.cuda.is_available() == False` | CPU wheel、CUDA 不兼容或驱动问题 | 不修改已验证环境；建立独立 GPU 环境并做最小 smoke test |
| GPU 显存不足/占用高 | 共享 GPU 正在使用或模型过大 | 停止启动，重新协调 GPU；减小 batch/模型后再 smoke |
| 全量测试找不到 Windows 路径 | 使用了错误的 host path config | 显式指定 Linux 配置；不要创建假文件绕过 |
| NIfTI 出现 NaN/Inf | 覆盖、配准、除零或缺失测量 | 保留非有限语义，定位受试者/ROI；禁止静默补 0 |
| 性能异常高 | 标签、站点、缺失、阈值或外层测试泄漏 | 作废受影响分数，从干净折分重跑完整流程 |
| 训练中断 | SSH 断开、资源或代码错误 | 从已记录检查点恢复；保留失败日志和退出状态 |
| 传输后文件数相同但结果异常 | 文件损坏或内容版本不同 | 比较完整 SHA-256 清单 |
| Git 工作树不干净 | 运行代码身份不可确定 | 先提交、搁置或明确记录；不发布不可追踪结果 |

禁止用以下方式“快速修复”：

- `mkfs`、`fsck`；
- 强制卸载；
- 修改 `/etc/fstab`；
- 放宽整块设备权限；
- `git reset --hard` 或强推覆盖共享历史；
- 对 NaN/Inf 全局补 0；
- 在全体数据上先标准化/ComBat/PCA 再交叉验证；
- 使用测试集挑阈值、epoch 或最佳模型。

---

## 13. 正式运行门禁

### Gate 0：治理

- [ ] 数据用途与伦理状态已记录
- [ ] 数据可否离开服务器已确认
- [ ] 直接标识符完全隔离
- [ ] Git、日志和外部服务边界已确认

### Gate 1：数据

- [ ] subject/session 唯一
- [ ] 原始文件清单及哈希完整
- [ ] 标签来源、时间和缺失语义完整
- [ ] 站点/扫描仪/药物/时间点分布已审计
- [ ] QC 规则在看标签前冻结
- [ ] 受试者流图可从原始样本追踪到分析样本

### Gate 2：拆分

- [ ] 外层单位为受试者或更高层级
- [ ] 重复扫描、窗口和模态不跨折
- [ ] 外层折已持久化并哈希
- [ ] 所有学习型预处理仅在训练折拟合
- [ ] 完全混杂已排除或结论已降级

### Gate 3：环境

- [ ] commit、配置、数据和折分哈希一致
- [ ] 两端环境版本已记录
- [ ] CPU smoke test 通过
- [ ] GPU 环境另行 smoke test 通过
- [ ] 输出目录空间充足

### Gate 4：结果

- [ ] 简单基线与复杂模型使用相同折
- [ ] 阈值来源明确
- [ ] 置信区间、校准和每类支持已报告
- [ ] nuisance 和标签置换已运行
- [ ] 失败检查未被隐藏
- [ ] 结论没有超出验证级别

任一必要项失败即停止正式结果发布。

---

## 14. 最终交接包

下一位接班人应能仅凭以下内容复核项目：

1. `README.md`：目标、现状、最小运行方法；
2. `PROJECT_CONTRACT.md`：冻结问题、标签和主分析；
3. `DATA_DICTIONARY.tsv` 与 `data_manifest.tsv`；
4. 数据来源、许可、伦理与去标识化说明；
5. Mac/Linux 环境锁和离线安装说明；
6. 预处理配置、工具版本和受试者级 QC；
7. 固定 `fold_assignments.tsv`；
8. 基线、复杂模型、消融、置换和 nuisance 结果；
9. 运行清单、日志、预测和哈希；
10. `FINAL_REPORT.md`：结果、限制、失败项和 readiness；
11. 一组只读验收命令；
12. 最小且明确的下一步。

准备交接时，第一屏先给：

| 项目 | 当前值 |
|---|---|
| Git commit / branch |  |
| 数据版本 / SHA-256 |  |
| 主队列 / 敏感性队列 |  |
| 当前运行状态 |  |
| 最后通过的测试 |  |
| 已完成阶段 |  |
| 硬阻断 |  |
| 最小下一步 |  |

---

## 15. 当前仓库中可复用的实例

这些文件是实现范例，不是所有新项目都必须复制其参数：

- [`DATA_ACCESS.md`](DATA_ACCESS.md)：跨平台路径、NTFS 和离线安装经验；
- [`WINDOWS_TMP_RESCUE_2026-07-27.md`](WINDOWS_TMP_RESCUE_2026-07-27.md)：
  隔离传输、完整 SHA-256 比对和不覆盖正式归档的救援实例；
- [`phase1-n62-n64.toml`](../config/phase1-n62-n64.toml)：版本化分析契约；
- [`fold_assignments.tsv`](../data/generated/phase1-n62-primary/fold_assignments.tsv)：持久化受试者外层折；
- [`run_phase1_baselines.py`](../scripts/run_phase1_baselines.py)：复用固定折的经典基线；
- [`run_graph_baselines.py`](../scripts/run_graph_baselines.py)：固定折 GCN/GAT；
- [`audit_phase1_results.py`](../scripts/audit_phase1_results.py)：结果一致性门禁；
- [`FINAL_VALIDATION_REPORT.md`](../reports/phase1-n62-n64/FINAL_VALIDATION_REPORT.md)：结果、审计与限制的报告格式。

复用时只继承协议和结构；终点、图谱、QC、拆分、阈值、模型容量和结论必须针对新数据重新冻结。

---

## 16. 最小合理下一步

新项目第一次接手时，不应立即安装大型环境或启动预处理。先完成：

1. 只读盘点数据、许可、目录、模态、标签、站点和重复扫描；
2. 写出 `PROJECT_CONTRACT.md` 与 `data_manifest.tsv`；
3. 建立不含真实身份信息的 2–4 例 smoke 数据；
4. 在 Mac 和服务器分别验证最小 Python 环境；
5. 冻结 QC、拆分和输出命名；
6. smoke 通过并审阅后，再扩大到完整队列。

这六步完成前，项目就绪度最多为 `CONCEPT`；在公开或去标识化数据上完成可复现代码与 QC 后为 `TECHNICAL PROTOTYPE`；只有完成无泄漏内部验证后，才可称为 `INTERNAL VALIDATION`。

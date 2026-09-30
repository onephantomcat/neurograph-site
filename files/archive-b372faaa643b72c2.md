# Windows tmp provenance rescue（2026-07-27）

状态：`COPIED_AND_HASH_VERIFIED_NOT_PROMOTED`

本文只记录 Windows 临时目录中尚未进入学校服务器正式归档的流程证据。
影像本体不进入 Git；实际救援数据仍保存在服务器隔离区。

## 结论

从 Windows 原始 tmp 中识别并传输了：

- 12 个缺失的 attempt 目录，共 307 个文件、7,068,760,216 字节；
- 32 个 `staging_manifest.json`，共 193,269 字节；
- 合计 339 个载荷文件、7,068,953,485 字节，约 6.58 GiB。

12 个 attempt 为：

```text
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
[个体编号已省略]/attempt-01
```

其中 11 个是 `normalization_aal116` 阶段的终止失败；额外的
`[个体编号已省略]/attempt-01` 是已被后续 attempt 取代的
`coregistration_pca_spm` 失败证据。它们不是新增的成功结果。

## 传输与隔离位置

数据经雷电网桥从 Windows 流式传至 Mac，再直接写入学校服务器；Mac
没有保留 6.58 GiB 中间副本。

服务器隔离区：

```text
[本机路径已省略]
```

隔离区仅包含：

```text
SHA256SUMS.tsv
inputs/
work/
```

`SHA256SUMS.tsv` 为 339 条、47,011 字节，权限为 `600`，
所有者为 `user001:user001`。

## 完整性验证

Windows 原件与服务器隔离区分别对全部 339 个载荷文件计算 SHA-256。
比较记录时只移除了 Windows 清单行尾的 `CR`，没有改写任何载荷文件。
以下字段逐条完全一致：

```text
sha256<TAB>bytes<TAB>relative_path
```

结果：

```text
windows_records=339
server_records=339
exact_record_match=true
SHA256SUMS.tsv sha256=fc34cbbb06e509bd8cbf3b3506a6bc5217c55c78725471753309bd6b8afd0d5e
```

在隔离区内复核载荷可使用：

```bash
awk -F '\t' '{print $1 "  " $3}' SHA256SUMS.tsv | sha256sum -c -
```

## 未重复传输的内容

- 服务器已存在 21 个成功 attempt；其 `pipeline_status.json` 当前哈希与
  对应 `publication_manifest.json` 的记录一致。
- `manifests/`、`reports/`、`reviews/` 共 200 个文件已做逐文件 SHA-256
  比对，Windows 与服务器完全一致。
- 其余 224 个 staged input payload 在服务器均有对应源路径，按被试和角色
  比较的字节数一致，因此本次未复制第二份。此项只证明路径和大小一致；
  若以后要删除 Windows 副本，应先补做 224 个文件的全量哈希核验。

## 保持不变的边界

传输后，正式归档仍为：

| 目录 | 文件数 | 字节数 |
|---|---:|---:|
| `attempts/` | 1,176 | 25,950,107,438 |
| `manifests/` | 11 | 54,490 |
| `reports/` | 114 | 8,500,212 |
| `reviews/` | 75 | 1,936,718 |

本次没有：

- 覆盖或删除 Windows 原件；
- 把失败/废弃 attempt 合并进正式 `attempts/`；
- 改写 `cohort_terminal_states.tsv`、publication manifest 或现有报告；
- 将 NIfTI、MAT、PNG 或其他救援载荷加入 Git。

## 后续最小动作

在需要把溯源路径改为可移植形式时，先复核
`SHA256SUMS.tsv`，再为失败证据设计独立归档位置；不要把它们伪装成成功
attempt。随后用项目内相对路径或受控 URI 更新状态清单，并对新清单重新计算
SHA-256。完成这一步前，隔离区应保持只读、不删除。

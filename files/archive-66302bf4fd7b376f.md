# Data access and path configuration

No imaging data is tracked in this repository. Large NIfTI volumes (~25 GB of 4-D
volumes alone) are excluded by `.gitignore` and must be obtained or regenerated locally.

## 1. Source dataset

**OpenNeuro ds000208** — *Brain connectivity predicts placebo response across chronic pain
clinical trials*. Licensed **CC0**.

- DOI: `10.18112/openneuro.ds000208.v1.0.1`
- Cohort: 20 healthy controls, 17 osteoarthritis patients (study 1, 2-week placebo-only),
  39 osteoarthritis patients (study 2, 3-month placebo vs duloxetine). All scanned before
  treatment.
- Demographics and stratification are in `participants.tsv`.

Obtain it with DataLad:

```bash
datalad install https://github.com/OpenNeuroDatasets/ds000208.git
cd ds000208 && datalad get .
```

## 2. Upstream code

Both upstream checkouts are untracked and rebuilt from the commits pinned in
[`../UPSTREAMS.md`](../UPSTREAMS.md):

| Component | Pinned commit |
|---|---|
| BrainHGT | `4f411fab1163e24f0b54e9cb398fbfe5928ce833` |
| ds000208 metadata (sparse) | `f718509da3ac054fc9ab191c1bbdb984710a932e` |

```powershell
& .\scripts\restore_upstreams.ps1
& .\scripts\verify_upstreams.ps1
```

The metadata checkout is sparse — it contains only `participants.tsv`,
`dataset_description.json` and `CHANGES`. No NIfTI payload is downloaded.

### Optional ABIDE source for cross-disease self-supervision

The ABIDE transfer experiment uses the public **ABIDE I Preprocessed Connectomes
Project**, not raw ABIDE BIDS. The frozen selection is:

- S3 root: `s3:/fcp-indi/data/Projects/ABIDE_Initiative/`
- pipeline: `dparsf`
- strategy: `filt_global`
- derivatives: `rois_aal`, `alff`, `falff`, `reho`, `degree_binarize`, `func_mask`

Cyberduck can connect anonymously to the public Amazon S3 bucket and download this
selection. Keep the source outside the Git repository. On the current Windows machine it
is stored below:

```text
[本机路径已省略]
```

The external runner consumes the generated FC-only packages, not the 6,622 raw
derivative files directly:

```text
processed/fc_primary_n972/abide_aal90_fc_pretrain.npz
processed/fc_low_motion_n834/abide_aal90_fc_pretrain.npz
```

The package hashes are respectively
`61f6f986a29b6df8b7bc37f2d1b51eabcac5646a5bc1446f9433a3dbe24bf5d0` and
`d551ced75a79dd18f2b12d381ddda1e58ffd72dc84caec62ea002b44b5592453`.
Neither NPZ contains `label` or `dx_group`. See
[`ABIDE_TRANSFER.md`](ABIDE_TRANSFER.md) for the training and audit workflow.

## 3. Restricted external cohorts

SRPBS/DRMD payloads may be present in local controlled storage, but they are not
tracked or redistributed by this repository. Access requires the
official signed data-use application and eligible PI/supervisor information; keep
application documents containing personal information outside Git. Exact cohort counts,
atlas ordering, and FC definitions must be re-audited against the approved data
dictionary before any model input is created. See
[`SRPBS_ACCESS_AND_CONTRACT.md`](SRPBS_ACCESS_AND_CONTRACT.md).
The local BAL-140 ROI table itself remains excluded from Git; its non-voxel
name/order audit is published under
[`reports/srpbs-bal140-roi-evidence/20260824`](../reports/srpbs-bal140-roi-evidence/20260824/README.md).

HCP Young Adult and OpenPain remain deferred sources. Use the current
[ConnectomeDB](https://hcp-db.humanconnectome.org/) route for HCP and review the
[OpenPain data-use agreement](https://www.openpain.org/html/agreement.html) before
downloading. Do not combine either source with the frozen ABIDE DPARSF package under one
dataset version.

## 4. Preprocessing derivatives

The pipeline does **not** start from raw BIDS. It consumes DPARSF/DPABI derivatives:

| Input | Role |
|---|---|
| `Results/ROISignals_FunImgARglobalCWF/` | AAL116 ROI time series and Fisher-Z FC |
| `Results/fALFF_FunImgARglobalCW/` | `zfALFFMap_{id}.nii` |
| `Results/ALFF_FunImgARglobalCW/` | `zALFFMap_{id}.nii` |
| `Results/ReHo_FunImgARglobalCWF/` | `zReHoMap_{id}.nii` |
| `Results/DegreeCentrality_FunImgARglobalCWF/` | `zDegreeCentrality_PositiveBinarizedSumBrainMap_{id}.nii` |
| `FunImgARglobalCW/{id}/wCovRegressed_4DVolume.nii` | normalised, unfiltered — input for ALFF/fALFF |
| `FunImgARglobalCWF/{id}/Filtered_4DVolume.nii` | normalised, band-pass filtered — input for ReHo/DC |

The `GlobalC` branch (global signal regression) is the one used throughout. A parallel
non-GSR branch exists but is not the analysis path.

An AAL atlas at 61×73×61 (`AAL_61x73x61_YCG.nii`, shipped with DPABI) is required and
must match the derivative grid exactly — `_extract_roi_means` asserts both shape and affine.

## 5. Configuring paths

`config/paths.toml` holds absolute paths. It currently contains the original Windows
layout (`I:\` for data, `E:\` for the MATLAB toolbox and the uv environment).

`src/oa_rebuild/config.py` is platform-agnostic — `PROJECT_ROOT` is derived from the
source file location, and `assert_safe_output` rejects any output that does not resolve
below it. Only the values in `paths.toml` need changing per machine.

To move to Linux, replace the `[inputs]` roots, for example:

```toml
[inputs]
ds000208_root = '/media/<user>/<volume>/fmri/ds000208'
work2         = '/media/<user>/<volume>/fmri/work2'
aal_atlas     = '/path/to/AAL_61x73x61_YCG.nii'
```

Missing inputs fail loudly at `RebuildPaths.require_inputs()` with the full list — a
Windows path string on Linux is treated as a relative filename and will be reported as
missing rather than silently skipped.

### Environment location

Keep the Python environment off any NTFS/`fuseblk` volume. `ntfs-3g` strips the execute
bit, so `venv/bin/python` cannot run even though symlinks, hard links, permission bits and
case sensitivity all work correctly. Put the environment on a native filesystem and point
`uv` at it explicitly, otherwise its cache and managed interpreters default to `~/.cache`
and `~/.local/share/uv/python`:

```bash
export UV_PROJECT_ENVIRONMENT=/path/on/native/fs/envs/oa-rebuild
export UV_PYTHON_INSTALL_DIR=/path/on/native/fs/uv-python
export UV_CACHE_DIR=/path/on/native/fs/uv-cache
```

Run `uv cache prune` after installing to reclaim space.

Keep the cache and the environment on the **same** filesystem where possible so `uv` can
hard-link instead of copying. When they must differ, set `UV_LINK_MODE=copy`; `uv` then
re-derives file permissions from the wheel metadata, so executables and `.so` extensions
come out correct even when the cache sits on a filesystem that cannot represent them.

> When unpacking any archive, extract **onto the native filesystem**. Extracting onto
> `ntfs-3g` and then moving the tree preserves the stripped permissions, which silently
> produces a non-executable interpreter.

### Installing on an offline host

Some deployments run without outbound access. Package indexes may still answer with
HTTP 200 while returning something other than index content, in which case resolvers
report "no versions found" instead of failing cleanly — so confirm the host is genuinely
online before assuming a resolution error is a dependency problem.

To install offline, stage wheels on a machine that does have access:

```bash
# On a networked machine, targeting the analysis host's platform:
pip download --dest wheels \
  --platform manylinux2014_x86_64 --python-version 3.12 \
  --implementation cp --abi cp312 --only-binary=:all: \
  numpy scipy scikit-learn pandas nibabel pytest

# Transfer, then on the analysis host:
uv pip install --python "$UV_PROJECT_ENVIRONMENT/bin/python" \
  --no-index --find-links <wheel-dir> \
  numpy scipy scikit-learn pandas nibabel pytest
uv pip install --python "$UV_PROJECT_ENVIRONMENT/bin/python" \
  --no-index --find-links <wheel-dir> -e . --no-deps
```

`--no-deps` on the project install skips the graph-model dependencies (torch and the CUDA
runtime packages), which Phase 1 does not use.

Match the `--platform` tag to the host's glibc: `manylinux2014_x86_64` means glibc ≥ 2.17.
Newer releases of the compiled scientific packages have moved to `manylinux_2_28`, which an
older host cannot run — pip will silently resolve to an older version instead, so verify
what you actually got against `uv.lock`.

Environment markers are evaluated against the **downloading** interpreter for some
dependencies, so a dependency gated on `python_full_version < '3.13'` may be omitted when
downloading from a newer Python. Add such packages explicitly (`typing-extensions` is a
common one).

# Roadmap

> 本文保留早期迁移安排。当前研究执行状态见[项目计划](PROJECT_PLAN.md)及[2026-09-11目标与下一步核查](NEXT_PROCESSING_AND_TARGETS_2026-09-11.md)；下方未勾选项不能作为当前训练或Git状态。

Ordered by risk and dependency. Priority is infrastructure and reproducibility first,
scientific results following steadily behind.

## A — Version control and rescue ✅ / partial

- [x] Bring the project under version control (previously `git init` with zero commits)
- [x] Off-machine mirror
- [ ] Push to remote
- [ ] Rescue the off-volume provenance chain — every `publication_manifest.json` and
      `cohort_terminal_states.tsv` records a `status_path` pointing at a Windows scratch
      directory that is **not** on the data volume. If that machine's temp directory is
      cleared, the process evidence for all 21 repaired subjects is lost. This is the only
      remaining task that requires the Windows workstation.

## B — Linux migration ✅

- [x] Install `uv` and Python 3.12 on a native filesystem (see [DATA_ACCESS.md](DATA_ACCESS.md))
- [x] Port paths to Linux — added `config/paths.linux.toml`, selected via `OA_REBUILD_CONFIG`
- [x] Obtain the AAL atlas independently of any MATLAB installation. Fetched from the
      DPABI repository and verified **byte-identical** (sha256 `d5412c7d…4ccca5`) to the
      atlas recorded in the existing dataset's provenance — the project's own hash
      tracking made this checkable rather than assumed.
- [x] **Acceptance: 19/19 tests pass on Linux** against real data
- [ ] Add shell equivalents for `scripts/*.ps1`, keeping the PowerShell versions working

`src/oa_rebuild/config.py` was already platform-agnostic apart from the config-file
location; `DEFAULT_CONFIG` now honours `OA_REBUILD_CONFIG` so both platform tables coexist.

### Constraints discovered

**The analysis host has no outbound network access.** Package indexes answer with HTTP 200
but do not return index content, so resolvers report "no versions found" rather than
failing cleanly; the mirror settings in other accounts on the same host are stale and do
not work either. Install offline — see [DATA_ACCESS.md](DATA_ACCESS.md).

**glibc 2.27 (Ubuntu 18.04) caps compiled wheels at `manylinux_2_17`.** The versions in
`uv.lock` are unreachable on this host — `numpy` stops at 2.2.6 where the lock pins 2.5.1,
and `scipy` / `scikit-learn` / `pandas` are similarly capped. The installed versions still
satisfy every constraint declared in `pyproject.toml`, but they are **not** the locked
versions. A Linux-specific lock file is the proper fix; until then this divergence is a
known reproducibility gap between the two platforms.

## C — Removing the MATLAB dependency ✅ (implementation)

This is what unblocks the `n = 65` integration described in the README.

- [x] `src/oa_rebuild/features.py` — all four metrics in Python
- [x] `tests/test_features_vs_dpabi.py` — pinned against DPABI's own output
- [ ] Run the validated code over all 65 subjects (see stage D)

### Result

Agreement with DPABI, as maximum absolute difference in AAL90 ROI means across a
nine-subject sweep spanning 224, 275 and 280 time points:

| Metric | Max ROI difference | Voxelwise *r* |
|---|---:|---:|
| ALFF | 2.3e-05 | 1.000000 |
| fALFF | 1.1e-05 | 1.000000 |
| ReHo | 1.5e-05 | 1.000000 |
| Degree centrality | 7.4e-05 | 1.000000 |

Tolerance is 1e-4 in z units on features spanning roughly ±3.

Three implementation details were fixed by measurement, not by reading:

- **Band indices.** DPABI derives *both* bounds as `ceil(f · paddedLength · TR + 1)`
  on a 1-based axis, after zero-padding to the next power of two. Reading the lower
  bound as `fix` instead — equally plausible — shifts it one bin and moves ROI means
  by ~2e-2, three orders of magnitude outside tolerance.
- **ReHo normalisation.** The divisor is the number of neighbours actually inside the
  mask, not a fixed 27. Fixing it at 27 drops voxelwise agreement from 1.000 to 0.851.
- **z-scoring mask.** Statistics come from the brain mask, not from the non-zero
  voxels of the map. The latter disagrees by up to 3.0 in z units.

Degree centrality is the loosest of the four and sets the tolerance: it thresholds
~5e9 voxel pairs at r > 0.25, so pairs on the boundary flip under float32 rounding.
The residual is threshold sensitivity, not an algorithmic gap.

### Parameters recovered from the DPARSF configuration

Read out of `work2/DPARSFA_AutoSave_2026_5_25_21_25.mat` rather than assumed:
band 0.01–0.1 Hz (**not** the more common 0.01–0.08), ReHo cluster 27 voxels,
DC threshold r > 0.25, TR 2.5 s, smoothing FWHM 4 mm applied *after* these maps are
written — so the unsmoothed maps are the right comparison target.

### Original design notes

Implement `src/oa_rebuild/features.py` computing the four node-feature maps in Python:

| Metric | Input | Method |
|---|---|---|
| ALFF | `wCovRegressed_4DVolume.nii` | mean of √power spectrum over 0.01–0.08 Hz |
| fALFF | same | ALFF ÷ total spectral power |
| ReHo | `Filtered_4DVolume.nii` | Kendall's *W* over a 7/19/27-voxel neighbourhood |
| DC | same | thresholded voxel-to-voxel correlation, summed |
| z-scoring | each map | `(map − mask mean) / mask SD` |

### Validation strategy

The internals of DPABI do not need to be guessed. All 76 subjects have **both** the input
4-D volumes **and** DPABI's output maps, which gives a built-in ground-truth set.

Add `tests/test_features_vs_dpabi.py`:

- **Primary criterion:** max absolute difference in AAL90 ROI means < 1e-4. This is the
  quantity that actually enters the dataset — reuse `_extract_roi_means` from
  `src/oa_rebuild/aal90.py`.
- Secondary: within-brain voxelwise Pearson r > 0.999.
- Validate the pre- and post-z-scoring maps separately; the z-scoring mask is the most
  likely source of divergence.

Once it passes, run the same code over **all 65 subjects**, including the 44 that already
passed. Uniform recomputation removes the DPARSF-vs-`repair_v3` pipeline difference by
construction, rather than leaving it as a confound.

## D — n = 65 rebuild

- [ ] `src/oa_rebuild/quality.py` — `FEATURE_FILES` currently hard-codes the four features
      to `work2/Results/*`. Support a second source and record a `pipeline_version` column
      (`dparsf_original` | `repair_v3`) in the manifest.
- [ ] `src/oa_rebuild/aal90.py` — adapt `_feature_paths` / `_source_files`; provenance
      grows from 264 records (44 × 6) to ~390 (65 × 6).
- [ ] `src/oa_rebuild/baseline.py` — **persist fold assignments**. Only per-subject
      predictions are written today; fold membership is not a first-class artifact. Emit
      `fold_assignments.tsv` (`subject_id / repeat / outer_fold`). Without it the graph-model
      comparison cannot reuse the same outer folds and the comparison is not meaningful.
- [ ] Keep the n=44 and n=65 results side by side; do not overwrite.
- [ ] Re-run the scan-length nuisance baseline and report it alongside.
- [ ] Formalise the 11 exclusions with FD and coverage evidence; state explicitly in the
      limitations that complete-case selection is not missing-at-random.

## E — Graph models

Constraints, not yet scheduled:

- Start on **CPU**. All FC matrices for the full cohort total roughly 2 MB; an epoch is
  milliseconds. This avoids the CUDA/Pascal compatibility question entirely.
- If a GPU is required, first verify empirically that `torch.cuda.get_arch_list()` contains
  the target architecture and that a small matmul actually returns — do not rely on version
  tables. The CUDA index currently pinned in `pyproject.toml` targets a toolkit release that
  has dropped Pascal support.
- Reuse `fold_assignments.tsv` from stage D.
- Primary metric stays repeat-level OOF mean ± SD, not the cross-fit ensemble value.
- Architecture search is itself a source of optimism — fix the primary model in advance or
  report every architecture tried.
- The legacy `GAT.py` / `train_gcn.py` scripts use LOOCV with post-hoc threshold selection
  and are systematically optimistic. They are historical record only and must not be used
  for comparison.

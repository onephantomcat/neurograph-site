# Handoff

State of the project as of commit `c58def3`, and what the next person needs to know
before touching it. Read [ROADMAP.md](ROADMAP.md) for the plan and
[DATA_ACCESS.md](DATA_ACCESS.md) for environment mechanics; this file covers what those
two do not: the traps.

---

## 0. Context

This is data-engineering and reproducibility work on an openly published dataset.

The imaging data is OpenNeuro **ds000208**, licensed **CC0**, DOI
`10.18112/openneuro.ds000208.v1.0.1` — confirmed from the dataset's own
`dataset_description.json` rather than assumed. Participant demographics and clinical
scores are already published under that licence, and derivative works may be
redistributed.

Computation runs on a university research server assigned to this group. The working
account is an ordinary unprivileged one; every change made to it was approved by the
project owner in advance, and the legacy data directories are treated as read-only inputs
throughout.

No clinical claim is made anywhere in this project. The existing reports are careful that
ds000208's response / VAS / WOMAC fields describe *treatment response* rather than
neuropathic-pain severity, and that the cohort is a methods-development sample rather than
a validation cohort. Preserving that framing is part of the job — see the guardrails in §6.

---

## 1. Where things stand

| Stage | State |
|---|---|
| A — version control | done, except the remote push and the off-volume rescue below |
| B — Linux migration | done, 19/19 original tests pass on Linux |
| C — removing the MATLAB dependency | implementation done and validated, 37/37 tests pass |
| D — n=65 rebuild | not started |
| E — graph models | not started |

Seven commits. The repository exists in two places — the analysis host and a working
mirror — and has **never been pushed to the remote**; see §5.

**The scientific position has not moved.** All published numbers are still n=44,
ROC AUC 0.816 ± 0.018 on node features. What changed is that the blocker preventing
n=65 is now removed: the four node-feature maps can be produced without MATLAB.

---

## 2. What was actually built

`src/oa_rebuild/features.py` — ALFF, fALFF, ReHo and degree centrality in Python,
plus DPABI's z transform. `compute_node_feature_maps()` is the entry point.

`tests/test_features_vs_dpabi.py` — pins the implementation against DPABI's own output.

`config/paths.linux.toml` — Linux path table, selected via `OA_REBUILD_CONFIG`.

`src/oa_rebuild/config.py` — one line changed: `DEFAULT_CONFIG` now honours
`OA_REBUILD_CONFIG`. Nothing else in the original codebase was modified.

### The validation method is the valuable part

Do not treat `features.py` as code to be trusted on inspection. It is correct because
**all 76 subjects retain both the 4-D volumes DPABI consumed and the maps it produced
from them**, which makes DPABI a measurable reference rather than a documented one.
Three details were fixed this way and every one of them would have been guessed wrong:

- band indices use `ceil` at *both* ends, not `fix` at the lower one (→ 2e-2 ROI error)
- ReHo divides by in-mask neighbour count, not a fixed 27 (→ voxel *r* 0.851)
- z-scoring uses the brain mask, not the map's non-zero voxels (→ 3.0 z units)

If you change any metric, re-run the sweep rather than reasoning about it. The scratch
script used for the nine-subject sweep is not in the repository; the test file covers
two subjects and is the maintained version.

---

## 3. Landmines

**The stale-map trap — the most dangerous thing in this project.** The 21 spatially
repaired subjects still have z-maps sitting under `work2/Results/` from the *original,
mis-registered* preprocessing. Those files pass every finite-value, shape and affine
check in the codebase. Pointing the config at them produces a complete, contract-valid,
silently wrong dataset. The repaired subjects' correct inputs are the 4-D volumes under
`outputs/dpabi_aal116_realign/runs/repair_v3_*/attempts/[个体编号已省略]/attempt-NN/rerun_aligned/`
(`aligned_input/wCovRegressed_4DVolume.nii` and
`aligned_input_filtered/Filtered_4DVolume.nii`, present for all 21).

**The host has no outbound network access.** Package indexes appear to respond — requests
return HTTP 200 — but the body is not index content, so resolvers fail with confusing
"no versions found" errors rather than a clean connection error. The mirror settings in
other accounts' `pip.conf` on this host are stale and no longer work either. Treat the
host as offline: fetch wheels on a networked machine and install from a local directory.
Procedure in DATA_ACCESS.md.

**Extract archives onto the native filesystem.** `ntfs-3g` silently strips the execute
bit. Unpacking onto the data volume and moving the tree afterwards preserves the
stripped mode and yields a non-executable interpreter. This already happened once.

**glibc 2.27 caps compiled wheels at `manylinux_2_17`.** The versions in `uv.lock` are
unreachable on this host — installed numpy is 2.2.6 where the lock says 2.5.1, and
scipy / scikit-learn / pandas are similarly capped. Everything still satisfies
`pyproject.toml`, but the Linux environment does **not** reproduce the lock. A
Linux-specific lock is the proper fix and has not been done.

**Degree centrality has the thinnest margin.** ~7e-5 against a 1e-4 tolerance, an order
of magnitude looser than the other three, because it hard-thresholds ~5e9 voxel pairs at
r > 0.25 and boundary pairs flip under float32 rounding. Voxelwise agreement is still
1.000000. If a change pushes this over tolerance, suspect the threshold path first.

**`uv pip` ignores `UV_PROJECT_ENVIRONMENT`.** It resolves against whatever interpreter
it discovers, which on this host is the system Python 3.6. Always pass
`--python "$UV_PROJECT_ENVIRONMENT/bin/python"` explicitly.

**Do not `git push --force` or amend pushed commits.** The mirror and the host are two
independent checkouts of the same history with no third copy.

---

## 4. Working setup

Topology, forced by the network:

```
remote  <--HTTPS-->  mirror machine  <--SSH-->  analysis host (no internet)
```

The mirror machine is the only one that can reach the remote or download packages.
The analysis host holds the data and runs everything.

The host's repository has `receive.denyCurrentBranch=updateInstead` set, so pushing to
it updates its working tree directly. `git push origin main` from the mirror is the
normal way to move code across; `origin` there points at the host over SSH.

Environment lives on the native filesystem, data and caches on the data volume — this is
both an administrative requirement and a hard technical constraint (see the exec-bit
landmine). The relevant exports are in the host account's `~/.bashrc` under an
`oa-rebuild env` block. Note that a non-interactive `ssh host 'cmd'` does **not** pick
them up, because the distribution's `.bashrc` returns early for non-interactive shells;
set them inline or call the venv's binaries by absolute path.

Verify the whole thing with:

```bash
export OA_REBUILD_CONFIG=<repo>/config/paths.linux.toml
<venv>/bin/pytest -q          # expect: 37 passed, ~65 s
```

---

## 5. Blocked on a human

**Check repository visibility with the owner before pushing.** The staged content includes
derived features and per-subject predictions. Redistribution is permitted under the source
licence (§0), so the question is research timing rather than data protection: unpublished
results would become visible early.

At last check the repository was public while the owner intended it to be private. The
owner is aware and plans to have it changed. The automation account can push but cannot
change that setting. **Nothing has been pushed yet** — confirm the current state with the
owner, then push.

**`LICENSE` and `CITATION.cff` do not exist.** They need a real copyright holder and
author list. Placeholder legal text was deliberately not committed.

**The off-volume provenance chain has not been rescued.** Every
`publication_manifest.json` and `cohort_terminal_states.tsv` records a `status_path`
pointing into a scratch directory on the Windows workstation, not on the data volume. If
that temp directory is cleared, the process evidence for all 21 repaired subjects is gone
permanently. This is the only remaining task that requires the Windows machine.

---

## 6. Next: stage D

Full detail in [ROADMAP.md](ROADMAP.md). The shape of it:

1. **Recompute all 65 subjects uniformly**, including the 44 that already passed. Doing
   only the 21 would leave "processing pipeline" perfectly confounded with "was
   originally a QC failure" — a worse confound than the one the repair was meant to fix,
   because it is 100 % collinear with group membership. Budget ~30 s/subject,
   ~35 minutes total.
2. **`quality.py`** — `FEATURE_FILES` hard-codes the four features to `work2/Results/*`.
   It needs a second source and a `pipeline_version` column in the manifest.
3. **`aal90.py`** — adapt `_feature_paths` / `_source_files`; provenance grows from 264
   records to ~390.
4. **`baseline.py`** — emit `fold_assignments.tsv`. This file does not exist today and
   nothing downstream can be compared without it. *This module has never been read in
   full; read it before editing.*
5. **Keep n=44 and n=65 side by side.** Tag the n=44 state before generating anything —
   stage D writes into `data/generated/` and `reports/`, and the Linux config currently
   points at the same output paths as Windows, so it will overwrite. Git protects the
   files, but a tag makes the comparison honest rather than archaeological.
6. **Re-run the scan-length nuisance baseline.** It was 0.637 ± 0.033 at n=44. Group
   pass rates move from 65/29/67 % to 90/76/87 % after integration, so if that number
   drops it is the strongest available evidence that imaging performance reflects
   pathology rather than batch structure. This is the single most informative result
   available right now, and it is cheap.

### Guardrails that matter more than the code

- A graph model that beats 0.816 on 65 subjects should be assumed leaky until proven
  otherwise. Matching or slightly underperforming the classical baseline is a normal,
  publishable outcome.
- Primary metric stays repeat-level OOF mean ± SD. Not the 0.861 cross-fit ensemble.
- Architecture search is itself a source of optimism — fix the primary model in advance
  or report everything tried.
- The legacy `GAT.py` / `train_gcn.py` use LOOCV with post-hoc threshold selection and
  are systematically optimistic. Historical record only.
- ds000208's response / VAS / WOMAC fields are *treatment response*, not neuropathic-pain
  severity. The existing reports are careful about this. Keep it that way.

---

## 7. What was not done or verified

- `run_phase1` was never executed. No generated artifact was overwritten; every file
  under `data/generated/` and `reports/` is still the Windows-produced original.
- `src/oa_rebuild/baseline.py` and `src/oa_rebuild/audit.py` were never read in full.
- The 11 permanently excluded subjects were not examined beyond their manifest rows.
  They all fail at the same stage (`normalization_aal116`), which suggests a shared
  cause rather than eleven individual ones — worth a look if anyone reconsiders them.
- The Windows workstation was never touched.
- Hardware notes, unverified beyond `nvidia-smi`: one of the four GPUs reports Xid 62 at
  boot and returns garbage telemetry with a fake 100 % utilisation; it has been in that
  state for days. Use the other three. The driver caps at CUDA 12.1 and the cards are
  Pascal, while `uv.lock` pins a CUDA 13 build that has dropped Pascal support — so the
  locked torch cannot run on this host at all. Stage E should start on CPU anyway; the
  full cohort's connectivity matrices are about 2 MB.
- The host's `/home` is 99 % full, shared with 17 accounts, with no quota system. The
  environment added ~723 MB. A CUDA install later would add ~10 GB and should be raised
  with the administrator first.

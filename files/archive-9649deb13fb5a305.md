# Phase 1 independent review

Review date: 2026-07-14

## Verdict

The AAL90 Phase 1 engineering and methods-development gate is usable. No blocking error was found in the 76-subject QC, 44-subject dataset construction, finite-value contract, adjacency construction, or fold-local preprocessing. Results are exploratory and are not valid as a clinical-diagnostic or disease-specific performance claim.

## Findings resolved after independent review

1. The primary performance estimate is now the mean and sample SD of complete repeat-level nested-CV OOF metrics. For node features this is ROC AUC `0.816 +/- 0.018`.
2. The repeat-averaged cross-fit ensemble AUC `0.861` is retained only as a secondary exploratory estimate. Its subject bootstrap is explicitly a conditional descriptive interval and does not cover split, refit, feature-family, or external-cohort uncertainty.
3. Feature families are reported in parallel. Selecting the best observed family after evaluation is explicitly disallowed as a confirmatory conclusion.
4. Study-dependent QC attrition is reported: Study1 patients pass at `5/17`, Study2 patients at `26/39`; study is present for patients and absent for controls.
5. Scan length is stored in the dataset and evaluated as a nuisance-only baseline (`0.637 +/- 0.033` ROC AUC), demonstrating non-trivial acquisition/cohort signal.
6. The dataset stores 264 subject-source provenance records: ROI signals, FC, z-fALFF, z-ALFF, z-ReHo, and z-DC for all 44 accepted subjects, with path, size, mtime, and SHA-256. It also stores hashes for the atlas, labels, participants metadata, config, lock file, and generator code.
7. AAL90 Fisher-Z FC is recomputed from ROI signals as part of QC; the current data has zero disagreements.

## Remaining scientific blockers

- A nuisance baseline can expose but cannot remove study/acquisition confounding. Random subject-level CV cannot establish that imaging performance is OA pathology rather than cohort or batch structure.
- The 32 AAL90 coverage failures need isolated DPABI/SPM visual review and reprocessing; complete-case selection is not missing at random.
- Controls lack usable study mapping, and there is no matched external cohort.
- Available response/VAS/WOMAC fields are treatment-response outcomes, not neuropathic-pain severity labels.
- GCN/GAT/BrainHGT comparison is a later gate and must reuse the saved subject/fold assignments without post-hoc threshold selection.

## Verification

- Test suite: `19 passed`.
- Manifest: 76 unique subjects; 44 pass and 32 fail.
- Generated AAL90 data: 44 subjects, shape `[44, 90, 4]` for node features and `[44, 90, 90]` for FC/adjacency; all finite.
- Prediction coverage: 660 rows = 44 subjects x 3 repeats x 5 feature sets, with no duplicate or missing subject-repeat-feature key.
- Provenance: 264 rows = 44 subjects x 6 source roles.
- The four legacy-root mtimes remained unchanged before and after the production run.

## Read-only review incident

During the first independent review, an attempted legacy PyG import generated five transient `.pyc` files under `[本机路径已省略]`. The reviewer removed those exact five files and verified that no file with the review timestamp remains. No legacy data or code file changed, and the four legacy-root mtimes remained unchanged; the nested `__pycache__` directory mtime is now `2026-07-14T09:44:56.1311241Z`. The post-fix review used read-only text inspection only.

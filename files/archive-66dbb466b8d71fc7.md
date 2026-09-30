# Fixed DS005713 encoder: prespecified replication and SRPBS external validation

Local protocol fixed at **2026-08-24T11:42:33+08:00**, before computing any
new `phase1-n64-sensitivity` or SRPBS prediction metric. This is a time-stamped
local analysis record, not a claim of registration in an external registry.

## 1. Questions and evidence roles

This run has two ordered analyses.

1. **Prespecified robustness replication:** reuse the exact saved DS005713
   encoder on `phase1-n64-sensitivity`. This tests whether the positive
   fixed-encoder versus Raw-FC direction survives the already defined
   sensitivity cohort. It is not an independent replication: 62 of 64 people
   overlap `phase1-n62-primary`, and the two added people are patients.
2. **Independent external validation:** fit the Raw-FC and fixed-encoder
   classifiers on OA `phase1-n62-primary` only, infer once on SRPBS Osaka N82,
   and then evaluate the released pain labels. SRPBS participants do not enter
   encoder, scaler, feature-selection, hyperparameter, classifier, threshold,
   or calibration fitting.

The SRPBS result will always be labelled **approximate cross-atlas external
validation**. Only official BAL140 correlations are available; the experiment
does not pretend that projected FC equals AAL90 FC recomputed from ROI time
series.

## 2. Frozen encoder and training protocol

- Source: OpenNeuro `ds005713` v2.0.2, label-free AAL90 FC-only `n=36` package.
- Checkpoint file SHA-256:
  `9c88cb271eba739cc2019bd12d4a7f04131f8550c44a6005b9778570692089f4`.
- Encoder state SHA-256:
  `4abcb9679d1533e0453db5c18fcedc33f998282003dc8698251abda480a6e26b`.
- Source scaler SHA-256:
  `14669fbcb273083cd18c50b3276e73fe5340ddcc4105b68a2622b6991fbc0248`.
- Encoder input: 4,005 AAL90 upper-triangle Fisher-Z FC edges.
- Architecture/training contract: latent 32, hidden 64, source reconstruction
  30 epochs, learning rate 0.001, batch 32, seed 20260810, no early stopping.
- The saved checkpoint is reused; the source encoder is not retrained.

The classifier is balanced L2 logistic regression. Selection uses OA-only
three-fold stratified CV by ROC AUC. Scaling and `SelectKBest` remain inside the
pipeline. `C` candidates are 0.1, 1, and 10. Raw-FC `k` candidates are 16, 32,
64, and 128; latent `k` candidates are 8, 16, and all 32 dimensions. The fixed
decision threshold is 0.5; SRPBS labels are not used to recalibrate it.

## 3. Analysis A: n64 robustness replication

### Inputs and execution

- Target dataset: `phase1-n64-sensitivity`, 18 controls and 46 patients;
  SHA-256 `4554a559488c960731346cdef39898114e255d4584c1461221111edaaa91bfa3`.
- Existing 5-fold × 3-repeat assignments; SHA-256
  `9d595abc53aba00cd746a181570b2b71de7a0d2036324d3a111c98dc0ef175db`.
- Reuse the checkpoint above with the same classifier selection, OA-fold
  internal reconstruction (30 epochs), and OA-fold source fine-tuning
  sensitivity route (5 epochs).

### Primary replication criterion

The primary contrast is repeat-level OOF
`AUC(fixed DS005713 encoder) - AUC(Raw FC)`. The directional robustness result
is counted as replicated only if:

1. the mean of the three repeat-level AUC differences is greater than zero; and
2. all three repeat-level differences are greater than zero.

Balanced accuracy and Brier score are supporting metrics. The three repeats are
not three independent studies; no confirmatory p-value will treat them as such.
Even a successful result remains an overlapping-cohort robustness replication.

## 4. Analysis B: SRPBS Osaka external validation

### Frozen inputs

| Input | SHA-256 |
|---|---|
| OA `phase1-n62-primary` (`n=62`, 18 controls / 44 patients) | `e2a6fa729f6899c86a0829c58677d049c434188754bdf3063f0a4d609bfdf60e` |
| SRPBS Osaka BAL140 FC (`82 × 9,730`) | `7595b4b07cda1531dd34efae0a6faa2325062b9b0cda451d12c49c34aa59c48b` |
| SRPBS Osaka metadata (`43 pain / 29 healthy / 10 stroke-no-pain`) | `475d32b6222ca14cac3ffdb9593792451df7128843570d5c483d70de52c8fc4e` |
| `ROITBL_BAL.mat` probability maps and order | `d0acf3ce54d8e43f47da85e207c64b0b08d99de4d72f5609f4ecbbac4a3e1835` |
| DPABI AAL116 label atlas; labels 1..90 used | `d5412c7da63f75e0c0a7cd314e948fb655ae6cd6bd2e936b72b7fa81304ccca5` |

The official Osaka README establishes row-wise correspondence between the FC
matrix and adjacent metadata. The MAT itself contains no embedded participant
IDs; this remains a source limitation.

### BAL137-to-AAL90 transformation

1. Restore each 140 × 140 correlation matrix from the published strict lower
   triangle in MATLAB column-major order and require positive semidefiniteness
   within numerical tolerance.
2. Use BAL/BSA ROI 1..137. Exclude the released `L.CB`, `R.CB`, and `VERM`
   summaries because AAL90 excludes cerebellum.
3. Resample the DPABI AAL labels to the official BrainVISA BSA2011 2 mm MNI
   grid with nearest-neighbour interpolation.
4. Define `W[a,b]` as the integrated BAL probability mass of source ROI `b`
   inside AAL90 label `a`, normalized so each AAL row sums to one.
5. Treat BAL ROI signals as standardized and compute
   `C = W R_BAL W.T`; convert `C` to a correlation matrix by dividing every
   element by the corresponding projected standard deviations.
6. The official release flipped images for left-sided pain. For the documented
   21 left-pain rows, restore native AAL semantics after projection by swapping
   every consecutive AAL90 left/right node pair. Keeping the official flipped
   orientation is a prespecified sensitivity analysis.
7. Clip correlations to `±(1 - 1e-7)`, apply Fisher `atanh`, and set the
   diagonal to zero.

No SRPBS condition, VAS, SF-MPQ2, site, age, or sex is used to construct the
crosswalk or fit either model. Laterality is used only to reverse the documented
official image flip.

### Primary endpoint and success rule

- Population: 43 pain patients versus 29 healthy controls (`n=72`).
- Primary statistic: paired
  `AUC(fixed DS005713 encoder) - AUC(Raw FC)` from the two frozen OA-trained
  pipelines on the same 72 SRPBS participants.
- Inference: 10,000 subject-label permutations, seed 20260824, one-sided
  alternative `delta > 0`, add-one p-value.
- Uncertainty: 10,000 paired stratified subject bootstraps for each AUC and the
  AUC difference, 2.5th and 97.5th percentiles.
- Success requires both observed AUC difference greater than zero and
  one-sided permutation `p < 0.05`.

The fixed encoder's absolute AUC and its one-sided permutation p-value are
supporting evidence. If absolute AUC is above chance but the fixed-versus-Raw
contrast fails, the registered primary success criterion is **not met**.

### Secondary and sensitivity analyses

- Pain 43 versus all no-pain 39 (healthy 29 + stroke-no-pain 10): descriptive
  AUC, Brier, threshold metrics, and paired bootstrap interval; no second
  primary p-value.
- Site 1 pain versus healthy only: descriptive robustness check.
- Official pain-side-flipped orientation retained: descriptive robustness
  check against the native-orientation correction.
- The 10 stroke-no-pain rows remain a separate clinical subgroup and are never
  silently relabelled as healthy controls in the primary endpoint.

## 5. Interpretation rules

- Analysis A positive, Analysis B negative: internal direction is robust to the
  n64 sensitivity inclusion but does not externally transport.
- Analysis A negative, Analysis B positive: external result is reported, but the
  original internal improvement lacks the prespecified robustness replication.
- Both positive: report convergent research evidence, still limited by the
  BAL-to-AAL projection and OA cohort confounding.
- Both negative: the exploratory n62 gain is not confirmed.

No outcome-dependent change to atlas weights, hemisphere handling, classifier
grid, endpoint, seed, threshold, success rule, or subgroup definition is
allowed. A genuine implementation bug requires a dated amendment that describes
the bug without using outcome direction to choose the fix, followed by a fresh
non-overwriting run.

## 6. Code state before outcome evaluation

The following implementation hashes were recorded after unit and existing
external-transfer regression tests passed, and before new outcome metrics were
computed:

| File | SHA-256 |
|---|---|
| `src/oa_rebuild/atlas_crosswalk.py` | `154d174a07cf1c3ed0dc71d7554351e9df579dffb3c83c7027f93cfc7b4195a9` |
| `src/oa_rebuild/srpbs_external_validation.py` | `9c25bae152dcc84a0459e4821f5f50377b88429273ef17f3e9f9eaf2dc6f23ce` |
| `scripts/run_srpbs_external_validation.py` | `bb737713cbb832bc600c3899cac082d6a28ee1abd5ef915a0ed33a0708c54aba` |

Pre-outcome verification: 5 new crosswalk/inference tests passed; 12 existing
external-transfer tests passed and 1 real-source integration test was skipped
because its opt-in environment variable was not set. Python compilation passed.
No new SRPBS or n64 performance value had been calculated when this record was
written.

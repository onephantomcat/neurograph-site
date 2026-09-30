# OA fMRI Phase 1 data-quality report

Generated: 2026-07-14T09:54:25.926934+00:00

## Dataset and intended grain

- Grain: one row per ds000208 participant.
- Participants profiled: 76.
- Intended use: leakage-safe methods-development baseline, not final neuropathic-pain clinical validation.
- AAL90 acceptance is label-independent: non-zero ROI variance, finite off-diagonal FC, complete predefined feature maps, and consistent metadata.

## Checks performed

- Subject-key uniqueness and join coverage across local labels and official participants metadata.
- Label, age, and sex agreement between metadata sources.
- ROI-signal shape and zero-variance ROI count for AAL116 and the predefined AAL90 subset.
- Fisher-Z FC shape and non-finite off-diagonal entries.
- Presence of z-fALFF, z-ALFF, z-ReHo, and z-DC feature maps.
- Agreement between the independent AAL90 QC rule and the legacy 44-subject artifact.

## Findings

| Severity | Finding | Evidence | Downstream risk | Remediation |
|---|---|---|---|---|
| High | Severe ROI coverage/preprocessing failure | 32/76 subjects (42.1%) fail AAL90; failed subjects have 32-80 zero-variance AAL116 ROIs | FC becomes non-finite and silent imputation can create artificial graph structure | Inspect normalization, brain coverage, masks, and atlas alignment; re-run only failed subjects in isolated DPABI output |
| High | Legacy AAL116 graph requires undocumented handling | 12 accepted subjects still have cerebellar-only zero-variance ROIs | Replacing their NaN FC with zero changes edges without an explicit scientific rule | Use predefined AAL90 for the primary audit baseline; retain AAL116 only as a documented sensitivity analysis |
| High | Study/acquisition and QC attrition are entangled | Patient pass rates are Study1 5/17 and Study2 26/39; study is present for 56 patients and 0 controls | Imaging models may learn acquisition/cohort structure rather than diagnosis, and complete-case selection is not missing at random | Treat model results as exploratory; recover failed subjects, add nuisance sensitivity checks, and require matched external validation |
| Medium | Small and imbalanced accepted cohort | 13 controls and 31 patients | High variance and optimistic model selection are likely | Use nested subject-level CV, fixed decision threshold, confidence intervals, and no external-performance claim |
| Medium | Treatment-response labels are not pain-severity labels | 31 selected patients have response/VAS/WOMAC improvement fields | A response model cannot be described as neuropathic-pain severity grading | Label any multi-task response experiment as a methods prototype only |

## Integrity results

- Unique IDs: 76/76.
- Metadata disagreements: 0.
- Missing four-map feature sets: 0.
- Stored FC versus FC recomputed from ROI signals disagreements: 0.
- AAL90 QC passed: 44; failed: 32.
- AAL90 pass set exactly matches the legacy 44-subject set: True.
- Zero-variance ROI union among accepted subjects: [93, 94, 101, 102, 103, 104, 105, 106, 107, 108, 114, 115, 116] (all outside AAL90).
- Accepted control/patient timepoint distributions: {'control': {'275': 6, '280': 7}, 'patient': {'272': 1, '280': 30}}.

## Automated acceptance rules

1. Exactly one manifest row per subject and no metadata-key loss.
2. AAL90 node features and FC must be finite; no NaN/Inf imputation is permitted.
3. Every accepted subject must have all four predefined feature maps.
4. Subject IDs must be stored in every generated dataset and prediction file.
5. Preprocessing, feature selection, and hyperparameter selection must remain inside training folds.

## Assumptions and open issues

- AAL labels 1-90 are treated as the predefined cerebrum-only audit atlas; this is not a claim that cerebellar pain biology is irrelevant.
- The 32 failures require visual DPABI/SPM registration and coverage review before any salvage decision.
- The public OA dataset is a chronic-pain/placebo-response methods dataset, not the proposal's final neuropathic-pain cohort.

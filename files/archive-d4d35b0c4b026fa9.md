# DS005713 to OA exploratory FC-transfer protocol (2026-08-24)

## Analysis role and question

This is a post-hoc **exploratory** analysis. It asks whether the independently
prepared, label-free OpenNeuro DS005713 AAL90 FC package can participate in the
existing OA representation-transfer runner and whether its fixed representation
is descriptively competitive with existing target-only baselines. It is not a
preregistered or confirmatory analysis and is not an external OA/pain validation.

The earlier one-epoch real-data smoke run is used only as an execution-contract
check. Its performance values are not used to choose this protocol.

## Frozen inputs

- External source: OpenNeuro `ds005713` v2.0.2 FC-only package, 36 scans from
  33 people, including 7 follow-up scans. It contains no diagnosis, pain,
  outcome, or other supervised target fields.
- Target: `phase1-n62-primary`, 62 OA study participants.
- Outer evaluation: the existing target subject-level 5-fold x 3-repeat split
  file. No new split is generated.
- Feature family: AAL90 Fisher-Z functional-connectivity upper triangle only.
- Source/target subject namespaces must be disjoint. Every OA adaptation step is
  restricted to the current outer-training fold.

## Frozen methods

1. `raw_fc_logistic`: raw target AAL90 FC.
2. `oa_internal_fc_ssl_logistic`: reconstruction encoder fitted only on the
   current OA outer-training fold.
3. `abide_external_fc_ssl_logistic`: fixed DS005713 source encoder with no OA
   adaptation. The historical `abide` token is retained only for result-table
   compatibility; source metadata is authoritative.
4. `abide_external_fc_ssl_oa_finetune_logistic`: the same DS005713 encoder,
   reconstruction-finetuned only on the current OA outer-training fold.

## Frozen training and selection settings

- Source reconstruction epochs: 30.
- OA internal reconstruction epochs: 30.
- OA-fold source-encoder fine-tuning epochs: 5.
- Learning rate: 0.001; batch size: 32.
- Latent dimension: 32; hidden dimension: 64.
- Seed: 20260810.
- Classifier: balanced L2 logistic regression.
- Inner selection: 3-fold target-training-only stratified CV by ROC AUC.
- Logistic `C`: 0.1, 1, 10.
- Raw-FC `SelectKBest` candidates: 16, 32, 64, 128.
- Representation candidates: 8, 16, or all latent dimensions.
- Decision threshold: 0.5.
- No early stopping.

## Outcomes and interpretation

The primary descriptive comparison is repeat-level out-of-fold ROC AUC for the
fixed DS005713 encoder versus raw FC. Balanced accuracy and Brier score are
supporting metrics. The OA-internal encoder and DS005713-plus-OA-fold-finetuning
routes are secondary context.

Only descriptive repeat summaries and fold-level audit results will be reported.
No confirmatory p-value or formal permutation claim will be attached to this
post-hoc analysis. Subject-level probabilities, raw datasets, and encoder weights
remain local and are excluded from Git; the published report contains aggregate
results and reproducibility metadata only.

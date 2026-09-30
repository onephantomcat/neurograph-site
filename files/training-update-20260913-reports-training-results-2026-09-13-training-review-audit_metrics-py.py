"""Read existing results only; export aggregate diagnostics, never subject rows."""
import csv
import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

import numpy as np

REPO = Path('[本机路径已省略]
OUT = Path(__file__).resolve().parent
ARCHIVE = REPO / 'reports/training-results-2026-09-12'

def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

def table(path, delimiter=','):
    with path.open(encoding='utf-8-sig', newline='') as stream:
        return list(csv.DictReader(stream, delimiter=delimiter))

def metrics(rows):
    y = np.array([int(r['true_label']) for r in rows])
    p = np.array([float(r['probability']) for r in rows])
    assert set(y) == {0, 1} and np.isfinite(p).all() and ((0 <= p) & (p <= 1)).all()
    # Pairwise concordance is independent of the sklearn/rankdata reporting helper.
    comparisons = p[y == 1, None] - p[None, y == 0]
    auc = np.mean((comparisons > 0) + 0.5 * (comparisons == 0))
    sensitivity = np.mean(p[y == 1] >= .5)
    specificity = np.mean(p[y == 0] < .5)
    return dict(roc_auc=float(auc), accuracy=float(np.mean((p >= .5) == y)),
                sensitivity=float(sensitivity), specificity=float(specificity),
                balanced_accuracy=float((sensitivity + specificity) / 2),
                brier=float(np.mean((p-y)**2)))

inventory = read(ARCHIVE/'inventory.json')
json_errors = []
json_count = 0
missing_artifacts = []
for artifact in inventory['artifacts']:
    p = ARCHIVE/artifact['file']
    if not p.exists():
        missing_artifacts.append(artifact['file'])
    elif p.suffix == '.json':
        try:
            read(p)
            json_count += 1
        except Exception as e:
            json_errors.append(dict(file=artifact['file'], error=str(e)))
metric_rows = table(ARCHIVE/'metrics_long.csv')
catalog = table(REPO/'docs/TRAINING_REPORT_CATALOG_2026-09-12.csv')
missing_reports = [r['path'] for r in catalog if not (REPO/r['path']).exists()]
exported = datetime.fromisoformat(inventory['exported_at']).timestamp()
newer = []
for run in inventory['runs']:
    p = REPO/'tmp'/run['run']
    if p.exists():
        newer.extend(str(f.relative_to(REPO)) for f in p.rglob('*')
                     if f.is_file() and f.suffix in ('.json', '.tsv', '.csv', '.md')
                     and f.stat().st_mtime > exported)

run_names = ['clinical-classification-20260908', 'supervised-evaluation-20260909',
             'transfer-optimization-20260909', 'matched-source-analysis-20260909-v2',
             'matched-finetuning-20260909-v2', 'site-transfer-20260909',
             'source50-transfer-20260911', 'joint-source-target-20260911']
recomputed = []
checks = []
lookup = {}
for run in run_names:
    root = REPO/'tmp'/run
    files = sorted(p for p in (set(root.rglob('oof_predictions.tsv')) | set(root.rglob('predictions_private.tsv')))
                   if p.parent.name in ('primary99', 'sensitivity96', 'OSU_to_CIN', 'CIN_to_OSU'))
    for p in files:
        rows = table(p, '\t')
        grouped = defaultdict(list)
        seen = set()
        labels = {}
        for row in rows:
            key = row['method'], row['repeat'], row['subject_id']
            assert key not in seen, p
            seen.add(key)
            sid = row['subject_id']
            assert sid not in labels or labels[sid] == row['true_label']
            labels[sid] = row['true_label']
            grouped[(row['method'], row['repeat'])].append(row)
        methods = defaultdict(list)
        for (method, repeat), group in grouped.items():
            assert set(r['subject_id'] for r in group) == set(labels), p
            methods[method].append(metrics(group))
        expected = {}
        summary = p.parent/'summary.json'
        if summary.exists():
            j = read(summary)
            if 'methods' in j:
                expected = {r['method']: r for r in j['methods']}
        path = str(p.parent.relative_to(REPO/'tmp')).replace('\\', '/')
        max_error = 0.
        compared = 0
        for method, repeats in methods.items():
            assert len(repeats) == 5, (p, method)
            result = dict(run=run, section=path[len(run)+1:], method=method,
                          subjects=len(labels), repeats=len(repeats))
            for k in repeats[0]:
                value = float(np.mean([r[k] for r in repeats]))
                result[k] = value
                result[k+'_repeat_min'] = min(r[k] for r in repeats)
                result[k+'_repeat_max'] = max(r[k] for r in repeats)
                if method in expected and k+'_mean' in expected[method]:
                    error = abs(value-expected[method][k+'_mean'])
                    max_error = max(max_error, error)
                    compared += 1
                    assert error < 1e-12, (p, method, k, error)
            recomputed.append(result)
            lookup[(path, method)] = result
        checks.append(dict(file=str(p.relative_to(REPO)).replace('\\', '/'), rows=len(rows),
                           method_repeat_groups=len(grouped), compared_metrics=compared,
                           max_abs_error=max_error, unique_subject_repeat_method=True))

# Reconcile the 134-row joined report with the correct old/new experiment.
source_rows = table(REPO/'docs/SOURCE50_RESULTS_2026-09-11.csv')
max_report_error = 0.
old = dict(logistic='matched-source-analysis-20260909-v2',
           finetuning='matched-finetuning-20260909-v2', site_transfer='site-transfer-20260909')
for row in source_rows:
    stage, design, method = row['stage'], row['design'], row['method']
    keys = [(f'source50-transfer-20260911/{stage}/{design}', method),
            (f'{old[stage]}/{design}', method)]
    candidates = [lookup[k] for k in keys if k in lookup]
    assert candidates, row
    for calculated in candidates:
        for k in ('roc_auc','accuracy','balanced_accuracy','sensitivity','specificity'):
            error = abs(calculated[k]-float(row[k]))
            max_report_error = max(max_report_error, error)
            assert error < 1e-12, (row, k, error)

joint = read(REPO/'docs/JOINT_SOURCE_TARGET_RESULTS_2026-09-11.json')
joint_count = 0
for design, data in joint['results'].items():
    for row in data['rows']:
        calculated = lookup[(f'joint-source-target-20260911/{design}', row['method'])]
        for k in ('roc_auc','accuracy','balanced_accuracy','sensitivity','specificity'):
            assert abs(calculated[k]-row[k]) < 1e-12
        joint_count += 1

# Read selected inner-validation curves without selecting any new epoch.
curve_groups = defaultdict(list)
for p in (REPO/'tmp/source50-transfer-20260911/finetuning').glob('*/repeat*-fold*/fit_audits.json'):
    for method, info in read(p).items():
        candidate = info['candidates'][info['selected_candidate']]
        epoch = info['fit']['selected_epoch']
        histories = candidate['histories']
        curve_groups[(p.parent.parent.name, method)].append(dict(
            epoch=epoch, train=float(np.mean([h[epoch-1]['train_bce'] for h in histories])),
            validation=float(np.mean([h[epoch-1]['validation_bce'] for h in histories])),
            last_slope=float(np.mean(np.array(candidate['mean_validation_bce'])[-5:])-
                             np.mean(np.array(candidate['mean_validation_bce'])[-10:-5]))))
curves = []
for (design,method), items in sorted(curve_groups.items()):
    curves.append(dict(design=design,method=method,models=len(items),
        epochs_median=float(np.median([i['epoch'] for i in items])),
        epoch30=sum(i['epoch']==30 for i in items),
        warmup_only=sum(i['epoch']<=5 for i in items),
        train_bce_mean=float(np.mean([i['train'] for i in items])),
        validation_bce_mean=float(np.mean([i['validation'] for i in items])),
        validation_gap_mean=float(np.mean([i['validation']-i['train'] for i in items])),
        last5_minus_previous5_validation_mean=float(np.mean([i['last_slope'] for i in items]))))

summary = dict(as_of=datetime.now().astimezone().isoformat(),
    scope='Local result inventory and saved prediction recalculation; no model fitting or remote polling',
    artifacts=len(inventory['artifacts']), archive_json_readable=json_count,
    archive_json_errors=json_errors, missing_artifacts=missing_artifacts,
    metrics_long_rows=len(metric_rows), report_catalog_rows=len(catalog), missing_reports=missing_reports,
    run_categories=dict(Counter(r['category'] for r in inventory['runs'])),
    result_files_newer_than_archive=newer,
    prediction_files=len(checks), prediction_rows=sum(c['rows'] for c in checks),
    repeated_method_sections=len(recomputed), repeat_groups=sum(c['method_repeat_groups'] for c in checks),
    metrics_compared_to_run_summaries=sum(c['compared_metrics'] for c in checks),
    max_summary_abs_error=max(c['max_abs_error'] for c in checks),
    source_report_rows=len(source_rows), joint_report_rows=joint_count,
    max_source_report_abs_error=max_report_error, checks=checks, curves=curves)
(OUT/'audit_summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
with (OUT/'recomputed_metrics.csv').open('w',encoding='utf-8-sig',newline='') as stream:
    writer=csv.DictWriter(stream,fieldnames=list(recomputed[0]));writer.writeheader();writer.writerows(recomputed)
print(json.dumps({k:v for k,v in summary.items() if k not in ('checks','curves')},ensure_ascii=False,indent=2))
print('CURVES',json.dumps(curves,ensure_ascii=False))

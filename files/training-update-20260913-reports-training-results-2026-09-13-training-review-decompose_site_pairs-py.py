"""Describe within/between-site contributions to saved OOF AUC; no causal claim."""
import csv
import json
from collections import defaultdict
from pathlib import Path
import numpy as np

repo = Path('[本机路径已省略]
def rows(path):
    with path.open(encoding='utf-8-sig') as stream:
        return list(csv.DictReader(stream, delimiter='\t'))
reference = rows(repo/'tmp/clinical-classification-20260908/primary99/oof_predictions.tsv')
sites = {r['subject_id']: r['site'] for r in reference}
source = rows(repo/'tmp/matched-source-analysis-20260909-v2/primary99/oof_predictions.tsv')
output = []
for method in ('raw_fc__none','source9__none','source9__age_site_motion','nuisance__age'):
    groups = defaultdict(list)
    for row in source:
        if row['method'] == method:
            groups[row['repeat']].append(row)
    values = defaultdict(list)
    counts = {}
    for group in groups.values():
        p = np.array([float(r['probability']) for r in group])
        y = np.array([int(r['true_label']) for r in group])
        s = np.array([sites[r['subject_id']] for r in group])
        score = (p[y==1,None] > p[None,y==0]) + .5*(p[y==1,None] == p[None,y==0])
        same = s[y==1,None] == s[None,y==0]
        for key, mask in [('within_site_pairs',same), ('between_site_pairs',~same)]:
            values[key].append(float(score[mask].mean()))
            counts[key] = int(mask.sum())
        values['global_auc'].append(float(score.mean()))
    item = dict(method=method, **{k:float(np.mean(v)) for k,v in values.items()},
                pair_counts=counts, between_site_weight=counts['between_site_pairs']/sum(counts.values()))
    weight = item['between_site_weight']
    assert abs(item['global_auc']-(item['within_site_pairs']*(1-weight)+item['between_site_pairs']*weight)) < 1e-12
    output.append(item)
(Path(__file__).parent/'site_pair_decomposition.json').write_text(json.dumps(output,indent=2),encoding='utf-8')
print('Verified AUC decomposition for four methods; only aggregate results saved.')

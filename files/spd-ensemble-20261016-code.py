"""Five fixed initialized SPD members; average probabilities on identical queries.
Records contain private ordered validation indices, binary labels and probabilities.
This helper never fits a reference, model, calibrator or mixture weight.
"""
import numpy as np

def average_members(records):
    assert len(records)==5 and sorted(r['seed'] for r in records)==list(range(5))
    first=records[0]
    for r in records:
        assert all(r[k]==first[k] for k in ['k','outer','inner','repeat','validation','label'])
    p=np.asarray([r['probabilities'] for r in sorted(records,key=lambda r:r['seed'])],dtype=np.float64)
    assert p.ndim==2 and np.isfinite(p).all() and ((p>=0)&(p<=1)).all()
    return p.mean(axis=0)

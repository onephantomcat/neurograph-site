"""Proposed baseline-only normalization for a declared pre-report window.

No whole-run statistics are accepted. This cannot remove filtering already
applied upstream, and is a new local adaptation rather than author preprocessing.
"""
import numpy as np


def baseline_normalize_window(window, baseline_samples=7):
    x=np.asarray(window,dtype=np.float32)
    if x.ndim!=4 or x.shape[-1]!=20 or not np.isfinite(x).all():
        raise ValueError('Expected finite spatial volume with 20 declared times.')
    if not 1<baseline_samples<x.shape[-1]:
        raise ValueError('Complete declared prestimulus baseline required.')
    baseline=x[...,:baseline_samples]
    foreground=np.maximum(baseline[baseline!=0],0).astype(np.float64)
    if foreground.size<2:
        raise ValueError('Insufficient measured baseline foreground.')
    mean=float(foreground.mean());std=float(foreground.std(ddof=1))
    if not std>0:
        raise ValueError('Constant baseline must not be silently normalized.')
    minimum=float(foreground.min());maximum=float(foreground.max())
    background=(minimum-mean)/std
    scale=max(abs(background),abs((maximum-mean)/std))/127
    z=(np.maximum(x,0)-mean)/std
    z[x==0]=background
    clipped=int((np.abs(z)>127*scale).sum())
    quantized=np.clip(np.rint(z/scale),-127,127).astype(np.int8)
    return quantized.astype(np.float32)*scale,dict(mean=mean,std=std,scale=scale,
        baseline_samples=baseline_samples,foreground_values=int(foreground.size),
        clipped_values=clipped,whole_scan_statistics=False,
        upstream_filtering_causality_confirmed=False)

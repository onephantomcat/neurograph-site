"""Measured slice-time alignment and separately measured baseline statistics.

Local pain-task adaptation, not the author's whole-run preprocessing.
This module neither performs motion/field-map/physiology correction nor
establishes anatomical quality. Input time zero is the saved volume zero.
"""
import numpy as np

def align_volume_start(prefix, slice_times, tr):
    x=np.asarray(prefix,dtype=np.float32);st=np.asarray(slice_times,dtype=float)
    if x.ndim!=4 or st.shape!=(x.shape[2],) or x.shape[-1]<3:
        raise ValueError('Finite 4D prefix and one time for each acquired slice required.')
    if not np.isfinite(x).all() or not np.isfinite(st).all() or not tr>0 or (st<0).any() or (st>=tr).any():
        raise ValueError('Invalid acquisition times or nonfinite input.')
    out=np.empty(x.shape[:3]+(x.shape[-1]-1,),dtype=np.float32)
    for z,phase in enumerate(st/tr):
        out[:,:,z,:]=x[:,:,z,:-1]*phase+x[:,:,z,1:]*(1-phase)
    return out  # output k corresponds to (k+1)*TR; no boundary extrapolation

def normalize_from_measured_baseline(window, baseline):
    # Keep interpolation/rounding in float64 to avoid int8 boundary flips.
    x=np.asarray(window,dtype=np.float64);b=np.asarray(baseline,dtype=np.float32)
    if x.ndim!=4 or x.shape[-1]!=20 or b.ndim!=4 or b.shape[:3]!=x.shape[:3] or b.shape[-1]<2:
        raise ValueError('20-position window and at least two measured baseline volumes required.')
    if not np.isfinite(x).all() or not np.isfinite(b).all():raise ValueError('Nonfinite input.')
    fg=np.maximum(b[b!=0],0).astype(np.float64)
    if fg.size<2:raise ValueError('Empty baseline foreground.')
    mean=float(fg.mean());std=float(fg.std(ddof=1))
    if not std>0:raise ValueError('Constant baseline.')
    background=(float(fg.min())-mean)/std
    scale=max(abs(background),abs((float(fg.max())-mean)/std))/127
    z=(np.maximum(x,0)-mean)/std;z[x==0]=background
    clipped=int((np.abs(z)>127*scale).sum())
    quantized=np.clip(np.rint(z/scale),-127,127).astype(np.int8).astype(np.float32)*scale
    return quantized,dict(mean=mean,std=std,scale=scale,background=background,
        clipped_values=clipped,total_values=int(x.size),baseline_volumes=b.shape[-1],
        whole_run_statistics=False)

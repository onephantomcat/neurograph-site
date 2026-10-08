"""Finite event-design preparation; scores never enter imaging predictors.

Single-trial pain regressors, one report-period nuisance regressor, DCT drift
and intercept. Canonical double Gamma is a declared local temporal model.
Reference sample time 0 is provisional until acquisition/preprocessing timing
is resolved; this is not a complete SPM first-level workflow.
"""
import numpy as np
from scipy.stats import gamma

def canonical_hrf(dt):
    t=np.arange(int(np.ceil(32/dt))+1)*dt
    h=gamma.pdf(t,6)-gamma.pdf(t,16)/6
    return h/h.sum()

def event_design(events,frames=230,tr=2.680000066757202,oversample=16,highpass_seconds=128):
    if any(float(r['onset'])<0 or float(r['onset'])+float(r['duration'])>frames*tr for r in events):
        raise ValueError('Event lies outside the existing acquisition axis.')
    pain=[r for r in events if r['trial_type']=='pain'];report=[r for r in events if r['trial_type']=='rating']
    if len(pain)!=15 or len(report)!=15:
        raise ValueError('Use the actual 15 pain and 15 report events.')
    dt=tr/oversample;t=np.arange(frames*oversample+int(np.ceil(32/dt))+1)*dt
    inputs=[]
    for rows in [[r] for r in pain]+[report]:
        # Exact bin overlap, without rounding event onset to one imaging frame.
        u=np.zeros(t.size)
        for r in rows:
            start=float(r['onset']);end=start+float(r['duration'])
            u+=np.maximum(0,np.minimum(t+dt,end)-np.maximum(t,start))/dt
        inputs.append(u)
    h=canonical_hrf(dt);columns=[np.convolve(u,h)[:t.size][np.arange(frames)*oversample] for u in inputs]
    names=['pain_trial_%02d'%(i+1) for i in range(15)]+['report_period_nuisance']
    k=int(np.floor(2*frames*tr/highpass_seconds));n=np.arange(frames)
    for i in range(1,k+1):columns.append(np.sqrt(2/frames)*np.cos(np.pi*(n+.5)*i/frames));names.append('dct_%02d'%i)
    columns.append(np.ones(frames));names.append('intercept')
    return np.column_stack(columns),names,np.stack(inputs),h,dt

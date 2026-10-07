"""Independent saved-array reconstruction using float64 scalar formulas and NumPy rounding."""
from pathlib import Path
import json,numpy as np
O=Path(__file__).resolve().parent;p=O/'independent_normalization_private.json';assert not p.exists(),'Reuse completed independent measurement.'
r=json.loads((O/'normalization_measurement_private.json').read_text());z=np.load(O/'synthetic-private/arrays_private.npz');v=z['input'].astype(np.float64);bg=np.broadcast_to(z['mask'][...,None]==0,v.shape);clipped=np.maximum(v,0);clipped[bg]=0;f=clipped[~bg];mean=float(f.sum()/f.size);std=float(np.sqrt(np.sum((f-mean)**2)/(f.size-1)));norm=(clipped-mean)/std;norm[bg]=norm[~bg].min();scale=float(np.abs(norm).max()/127);q=np.rint(norm/scale).clip(-127,127).astype(np.int8).transpose(3,0,1,2);decoded=q.astype(np.float64).transpose(1,2,3,0)*scale
w=v[...,10:30];abg=w==0;af=w[~abg];am=float(af.sum()/af.size);astd=float(np.sqrt(np.sum((af-am)**2)/af.size)+1e-8);author=(w-am)/astd;author[abg]=author[~abg].min()
pre=float(abs(norm-z['runtime_pre_quant']).max());ad=float(abs(author-z['author_window_normalized']).max());qdiff=int(np.count_nonzero(q!=z['runtime_quantized']));dd=float(abs(decoded-z['runtime_decoded']).max())
assert pre<1e-5 and ad<1e-5 and qdiff==0 and dd<1e-5
assert r['runtime_decoded_negative_values']>0 and np.array_equal(clipped,z['raw_clipped'])
out=dict(state='INDEPENDENT_NORMALIZATION_ARRAYS_READ_BACK',finite_values_read=sum(a.size for a in z.values()),runtime_pre_quant_maximum_difference=pre,runtime_quantized_integer_changes=qdiff,runtime_decoded_maximum_difference=dd,runtime_scale_difference=abs(scale-r['runtime_scale']),author_window_maximum_difference=ad,raw_clipping_exact=True,negative_normalized_values_retained=True,source_functions_not_used_as_replay_oracle=True,patient_arrays=0,new_model_forwards=0,new_classifier_fits=0)
assert all(np.isfinite(a).all() for a in z.values());p.write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out),flush=True)

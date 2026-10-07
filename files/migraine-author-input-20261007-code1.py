"""Independent NumPy interpolation formula and saved NIfTI readback."""
from pathlib import Path
import json,nibabel as nib,numpy as np
O=Path(__file__).resolve().parent;v=json.loads((O/'measurement_private.json').read_text());rows=[];values_read=0;maximum=0.
for tr in [.46,1.,2.]:
 label=str(tr);source=nib.load(O/'arrays-private'/(label+'-input.nii.gz'));spatial=nib.load(O/'arrays-private'/(label+'-spatial.nii.gz'));s=spatial.get_fdata(dtype=np.float32);cases=[]
 for suffix,used_tr in [('literal',float(spatial.header.get_zooms()[3])),('preserved_tr_diagnostic',float(source.header.get_zooms()[3]))]:
  img=nib.load(O/'arrays-private'/(label+'-'+suffix+'.nii.gz'));actual=img.get_fdata(dtype=np.float32);n=max(int(np.rint(80*used_tr/.8)),20);indices=np.arange((n-20)//2,(n-20)//2+20);coords=(indices.astype(float)+.5)*80/n-.5;left=np.floor(coords).astype(int);right=left+1;weight=coords-left;expected=s[:,:,:,left]*(1-weight)+s[:,:,:,right]*weight;difference=float(abs(actual-expected).max());maximum=max(maximum,difference);assert difference<1e-5 and actual.shape==(5,6,11,20) and np.isfinite(actual).all();values_read+=actual.size
  cases.append(dict(branch=suffix,values=actual.size,max_independent_interpolation_difference=difference,actual_saved_tr=float(img.header.get_zooms()[3]),source_coordinates=[float(coords[0]),float(coords[-1])]))
 for volume in [source,spatial]:a=volume.get_fdata(dtype=np.float32);assert np.isfinite(a).all();values_read+=a.size
 assert source.header.get_zooms()[3]==np.float32(tr) and spatial.header.get_zooms()[3]==1
 rows.append(dict(input_tr=float(source.header.get_zooms()[3]),source_units=source.header.get_xyzt_units(),spatial_units=spatial.header.get_xyzt_units(),branches=cases))
out=dict(state='SAVED_AUTHOR_SMALL_ARRAY_TEMPORAL_SAMPLING_INDEPENDENTLY_READ_BACK',finite_values_read=values_read,maximum_independent_temporal_interpolation_difference=maximum,spatial_interpolation_independently_replayed=False,patient_arrays_used=0,patient_pipeline_failure_inferred=False,original_source_functions_unchanged=True,cases=rows)
(O/'independent_readback_private.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out),flush=True)

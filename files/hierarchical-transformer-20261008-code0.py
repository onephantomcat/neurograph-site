"""Person-local OMST-inspired topology; old signed AAL90 FC remains node input.

Repeated MSTs use 1/abs(r), removing previous edges. Cumulative complete trees
are candidates, selected by weighted GE minus undirected weight fraction. This
explicit reconstruction is not an exact reproduction of absent author graph
generation code. Hop distances for attention are unweighted. No signed degree
normalization, inter-person template, label threshold or artificial edges.
"""
import importlib.util,sys
from pathlib import Path
import numpy as np
from scipy.sparse.csgraph import minimum_spanning_tree, shortest_path, connected_components

old_path=Path(__file__).resolve().parent.parent/'20261008-static-graph/data.py'
spec=importlib.util.spec_from_file_location('existing_graph_data',old_path)
existing=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=existing
spec.loader.exec_module(existing)
TrainingTransforms=existing.TrainingTransforms


def sparse_topology(signed_fc):
    x=np.asarray(signed_fc,dtype='float64')
    if x.ndim!=2 or x.shape[0]!=x.shape[1] or not np.isfinite(x).all() or not np.allclose(x,x.T,atol=1e-12):
        raise ValueError('Finite symmetric person-local FC required.')
    n=len(x);w=np.abs(x).copy();np.fill_diagonal(w,0)
    if (w>1+1e-7).any() or n<2:
        raise ValueError('Require absolute Pearson weights <=1.')
    total=np.triu(w,1).sum()
    available=w>0
    if total<=0 or connected_components(available,directed=False)[0]!=1:
        raise ValueError('Zero/constant disconnected ROI: do not invent FC or spanning edges.')
    cumulative=np.zeros_like(available);candidates=[];curve=[];orthogonal=[]
    while connected_components(available,directed=False)[0]==1:
        distances=np.divide(1,w,out=np.zeros_like(w),where=available)
        tree=minimum_spanning_tree(distances).toarray()>0
        tree|=tree.T
        if np.count_nonzero(np.triu(tree,1))!=n-1 or (tree&~available).any():
            raise ValueError('MST does not span using only remaining positive-magnitude edges.')
        orthogonal.append(tree.copy());available&=~tree;cumulative|=tree
        length=np.divide(1,w,out=np.zeros_like(w),where=cumulative)
        d=shortest_path(length,directed=False,method='FW')
        inverse=np.divide(1,d,out=np.zeros_like(d),where=(d>0)&np.isfinite(d))
        efficiency=float(inverse.sum()/(n*(n-1)))
        cost=float(np.triu(w*cumulative,1).sum()/total)
        curve.append(dict(trees=len(orthogonal),edges=int(np.triu(cumulative,1).sum()),
                          global_efficiency=efficiency,cost=cost,objective=efficiency-cost))
        candidates.append(cumulative.copy())
    best=int(np.argmax([r['objective'] for r in curve]))
    adjacency=candidates[best]
    hops=shortest_path(adjacency,directed=False,unweighted=True,method='FW')
    if not np.isfinite(hops).all():raise ValueError('Selected cumulative graph disconnected.')
    return hops.astype('float32'),dict(selected=curve[best],candidate_trees=len(curve),
       density=float(np.triu(adjacency,1).sum()/(n*(n-1)/2)),maximum_hop=float(hops.max()),
       fraction_offdiagonal_beyond_hop2=float(np.count_nonzero(hops>2)/(n*(n-1))),
       selected_negative_edges=int(np.triu(adjacency&(x<0),1).sum()),curve=curve),adjacency,orthogonal


def graph(series):
    # Existing standardized person-local Pearson formula; discard old positive A.
    x,_=existing.graph(series)
    hops,diagnostic,_,_=sparse_topology(x)
    return x,hops,diagnostic


def partition(data,train,validation,query,cache):
    tr,va,qu=map(set,(train,validation,query))
    if len(tr)!=len(train) or len(va)!=len(validation) or tr&va or (tr|va)&qu:
        raise ValueError('Preserve existing unique person-level memberships.')
    if len(set(data['subject_ids']))!=len(data['subject_ids']):raise ValueError('Repeated people.')
    def rows(indices):
        for i in indices:
            if i not in cache:cache[i]=graph(data['time_series'][i])
        return (np.stack([cache[i][0] for i in indices]),np.stack([cache[i][1] for i in indices]),
                np.asarray(data['covariates'][indices],dtype='float32'),
                np.asarray(data['labels'][indices],dtype='float32'))
    xt,ht,ct,yt=rows(train);xv,hv,cv,yv=rows(validation)
    transforms=TrainingTransforms().fit(xt,ct)
    xt,ct=transforms.transform(xt,ct);xv,cv=transforms.transform(xv,cv)
    return (xt,ht,ct,yt),(xv,hv,cv,yv),transforms

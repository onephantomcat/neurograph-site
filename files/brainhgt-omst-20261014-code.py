"""BrainHGT paper Eqs. 1-3: edgewise orthogonal MST cost-efficiency.

Per-person signed R -> positive selected |R| adjacency; signed R remains X.
Unspecified implementation choices are recorded in experiment.json, not selected
from patient performance. This is a paper-definition implementation, not a claim
to reproduce the authors' unpublished preprocessing wrapper.
"""
import numpy as np
def build_omst(correlation):
 r=np.asarray(correlation,dtype=np.float64)
 assert r.ndim==2 and r.shape[0]==r.shape[1] and np.isfinite(r).all()
 assert np.max(np.abs(r-r.T))<1e-6
 n=len(r);r=(r+r.T)*.5;i,j=np.triu_indices(n,1);weights=np.abs(r[i,j])
 valid=weights>0;i=i[valid];j=j[valid];weights=weights[valid]
 assert len(weights)>0 and weights.max()<=1.000001
 distance=1./weights;order=np.lexsort((j,i,distance));available=np.ones(len(i),dtype=bool)
 denom=float(weights.sum());dist=np.full((n,n),np.inf);np.fill_diagonal(dist,0.)
 selected=np.zeros((n,n));best_selected=None;best=-np.inf;best_count=0;cost_sum=0.;trace=[];edge_order=[];trees=[]
 offdiag=~np.eye(n,dtype=bool);tree_index=0
 while True:
  parent=np.arange(n)
  def root(k):
   while parent[k]!=k:parent[k]=parent[parent[k]];k=parent[k]
   return k
  tree=[]
  for e in order:
   if not available[e]:continue
   a=root(int(i[e]));b=root(int(j[e]))
   if a!=b:parent[b]=a;tree.append(int(e))
   if len(tree)==n-1:break
  if len(tree)!=n-1:
   stopping=dict(reason='Residual graph has no complete spanning tree',unused_edges=int(available.sum()),residual_forest_edges=len(tree));break
  tree_index+=1;trees.append(tree)
  for e in tree:
   a=int(i[e]);b=int(j[e]);d=float(distance[e]);w=float(weights[e]);available[e]=False
   # Exact undirected shortest-path update after adding one positive-length edge.
   old=dist.copy();dist=np.minimum(old,np.minimum(old[:,a,None]+d+old[None,b,:],old[:,b,None]+d+old[None,a,:]))
   selected[a,b]=selected[b,a]=w;cost_sum+=w
   inverse=np.zeros_like(dist);np.divide(1.,dist,out=inverse,where=np.isfinite(dist)&(dist>0))
   ge=float(inverse[offdiag].sum()/(n*(n-1)));cost=cost_sum/denom;score=ge-cost
   edge_order.append([a,b]);trace.append([len(edge_order),tree_index,ge,cost,score])
   if score>best:best=score;best_count=len(edge_order);best_selected=selected.copy()
 assert best_selected is not None
 return best_selected,dict(nodes=n,possible_edges=n*(n-1)//2,nonzero_dense_edges=len(i),selected_edges=best_count,density=best_count/(n*(n-1)/2),trees_extracted=tree_index,selected_negative_edges=int(sum(r[a,b]<0 for a,b in edge_order[:best_count])),best_ge=trace[best_count-1][2],best_cost=trace[best_count-1][3],best_ge_minus_cost=best,stopping=stopping,edge_order=edge_order,curve=trace)

def test_definition():
 from scipy.sparse.csgraph import shortest_path,minimum_spanning_tree
 raw=np.array([[1,-.8,.4,.2],[-.8,1,.5,.3],[.4,.5,1,-.9],[.2,.3,-.9,1.]])
 adjacency,meta=build_omst(raw);n=len(raw);a=np.zeros_like(raw);scores=[];dense=np.abs(raw);np.fill_diagonal(dense,0)
 for k,(i,j) in enumerate(meta['edge_order']):
  a[i,j]=a[j,i]=1/abs(raw[i,j]);sp=shortest_path(a,directed=False)
  inv=np.zeros_like(sp);np.divide(1,sp,out=inv,where=np.isfinite(sp)&(sp>0))
  ge=inv.sum()/(n*(n-1));cost=sum(abs(raw[u,v]) for u,v in meta['edge_order'][:k+1])/np.triu(dense,1).sum()
  assert max(abs(ge-meta['curve'][k][2]),abs(cost-meta['curve'][k][3]))<1e-12
  scores.append(ge-cost)
 assert meta['selected_edges']==int(np.argmax(scores))+1
 first=meta['edge_order'][:n-1];d=np.zeros_like(raw);mask=~np.eye(n,dtype=bool);d[mask]=1/np.abs(raw[mask]);mst=minimum_spanning_tree(d).toarray()
 assert {tuple(sorted((i,j))) for i,j in first}=={tuple(sorted((int(i),int(j)))) for i,j in zip(*np.nonzero(mst))}
 # Global sign inversion must not change OMST; negative correlations are eligible.
 other,_=build_omst(-raw);assert np.array_equal(adjacency,other) and any(raw[i,j]<0 for i,j in first)
 tie=np.ones((4,4));tie_graph,tie_meta=build_omst(tie);assert tie_meta['edge_order'][:3]==[[0,1],[0,2],[0,3]]
 return dict(state='PAPER_EQUATIONS_INDEPENDENT_SHORTEST_PATH_AND_MST_PASS',negative_edges_supported=True,global_sign_invariant=True,deterministic_ties=True)

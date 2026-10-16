"""Own compact SPD adaptation: covariance [B,90,90], confounds [B,4] -> [B].
Rank four is fixed, not searched. Initial subspace/head coordinates nest in rank16.
"""
import torch
from models import GeometryClassifier

class CompactGeometry(GeometryClassifier):
    def __init__(self,seed,roi=90,rank=4,parent_rank=16):
        assert rank<=parent_rank<=roi
        original=GeometryClassifier('spd_log',seed,roi=roi,rank=parent_rank)
        super().__init__('spd_log',seed,roi=roi,rank=rank)
        mapping={(int(i),int(j)):k for k,(i,j) in enumerate(zip(original.ii,original.jj))}
        indices=[mapping[int(i),int(j)] for i,j in zip(self.ii,self.jj)]+list(range(len(original.ii),len(original.ii)+4))
        with torch.no_grad():
            self.W.copy_(original.W[:,:rank])
            self.head.weight.copy_(original.head.weight[:,indices])
            self.head.bias.copy_(original.head.bias)

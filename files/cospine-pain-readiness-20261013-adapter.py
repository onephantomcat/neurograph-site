"""Event-time residual on genuine B,C,D,H,W,T tokens.

The adapter's depthwise convolution reads only current/past token positions.
This property does not make a frozen encoder or upstream filtering causal.
Zero output initialization preserves the frozen representation at startup.
No AAL ROI interpretation, pain target, preprocessing or checkpoint is embedded.
"""
import torch
from torch import nn
from torch.nn import functional as F


class EventTimeResidualAdapter(nn.Module):
    def __init__(self, channels=288, bottleneck=8, baseline_samples=7):
        super().__init__()
        self.channels=channels
        self.baseline_samples=baseline_samples
        self.norm=nn.LayerNorm(channels)
        self.down=nn.Linear(channels,bottleneck)
        self.temporal=nn.Conv1d(bottleneck,bottleneck,3,groups=bottleneck,bias=False)
        self.up=nn.Linear(bottleneck,channels)
        nn.init.zeros_(self.up.weight)
        nn.init.zeros_(self.up.bias)

    def forward(self,tokens):
        if tokens.ndim!=6 or tokens.shape[1]!=self.channels:
            raise ValueError('Expected genuine B,C,D,H,W,T encoder tokens.')
        if not self.baseline_samples<tokens.shape[-1]:
            raise ValueError('A complete declared prestimulus baseline is required.')
        x=tokens.permute(0,2,3,4,5,1)
        # Baseline positions correspond to the fixed -5.36..-0.56 second grid.
        centered=x-x[...,:self.baseline_samples,:].mean(dim=-2,keepdim=True)
        z=F.gelu(self.down(self.norm(centered)))
        shape=z.shape
        z=z.reshape(-1,shape[-2],shape[-1]).transpose(1,2)
        z=self.temporal(F.pad(z,(2,0)))
        update=self.up(z.transpose(1,2).reshape(shape))
        # Baseline centering uses every baseline token. Only post-baseline
        # updates are used; no claim of causality within baseline positions.
        update=torch.cat((torch.zeros_like(update[...,:self.baseline_samples,:]),
                          update[...,self.baseline_samples:,:]),dim=-2)
        return (x+update).permute(0,5,1,2,3,4).contiguous()

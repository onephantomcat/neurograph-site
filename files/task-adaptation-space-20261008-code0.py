"""Bottleneck adapter on genuine penultimate NeuroSTORM tokens, not GAP or LoRA.

Input volumes B,1,96,96,96,20 follow the already verified author encoder.
Tokens B,288,2,2,2,20 remain spatial/temporal cells, never named AAL ROIs.
The supplied official encoder is frozen/eval; only the inserted adapter learns.
No event targets, participant normalization or source checkpoint is embedded.
"""
import torch
from torch import nn

class ResidualTokenAdapter(nn.Module):
    def __init__(self,channels=288,bottleneck=8):
        super().__init__()
        self.channels=channels
        self.norm=nn.LayerNorm(channels)
        self.down=nn.Linear(channels,bottleneck)
        self.up=nn.Linear(bottleneck,channels)
        nn.init.zeros_(self.up.weight);nn.init.zeros_(self.up.bias)

    def forward(self,tokens):
        if tokens.ndim!=6 or tokens.shape[1]!=self.channels:
            raise ValueError('Expected B,C,D,H,W,T genuine encoder tokens.')
        x=tokens.permute(0,2,3,4,5,1)
        update=self.up(torch.nn.functional.gelu(self.down(self.norm(x))))
        return (x+update).permute(0,5,1,2,3,4).contiguous()

class NeurostormTokenAdapter(nn.Module):
    def __init__(self,encoder,bottleneck=8):
        super().__init__()
        if len(encoder.layers)!=4:
            raise ValueError('This adapter targets the verified four-stage encoder.')
        self.encoder=encoder
        for parameter in encoder.parameters():parameter.requires_grad_(False)
        encoder.eval()
        self.adapter=ResidualTokenAdapter(288,bottleneck)

    def train(self,mode=True):
        super().train(mode);self.encoder.eval();return self

    def encode_prefix(self,volume):
        # All prefix parameters and activations are frozen. Cached prefixes must
        # retain person/window memberships and the original time axis.
        with torch.no_grad():
            x=self.encoder.pos_drop(self.encoder.patch_embed(volume.float()))
            for stage in range(3):
                x=self.encoder.pos_embeds[stage](x)
                x=self.encoder.layers[stage](x.contiguous())
        if x.shape[1:]!=(288,2,2,2,20):
            raise ValueError('Unexpected genuine penultimate feature shape.')
        return x.detach()

    def forward_from_prefix(self,prefix):
        if prefix.shape[1:]!=(288,2,2,2,20):
            raise ValueError('Do not pass pooled GAP or reconstructed ROI data.')
        x=self.adapter(prefix)
        x=self.encoder.pos_embeds[3](x)
        # Last stage is frozen, but activation derivatives must remain enabled
        # so a task loss can reach the inserted adapter.
        return self.encoder.layers[3](x.contiguous())

    def forward(self,volume):
        return self.forward_from_prefix(self.encode_prefix(volume))

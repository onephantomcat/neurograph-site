"""Small hierarchical graph Transformer, independently written from equations.

Paper reference: BrainHGT, AAAI 2026, DOI 10.1609/aaai.v40i21.38817.
This is a local adaptation, not the author's full reproduction. Inputs: signed
FC rows [B,N,N], topological hop distances [B,N,N], covariates [B,4], and an
explicit atlas-overlap prior [N,K] at construction. No MRI or global foundation
vector is broadcast to ROIs. No patient training is performed by this module.
"""
import math
import torch
from torch import nn
from torch.nn import functional as F


def topology_attention(scores, hops, mechanism, hop=2., gamma_logit=1.):
    """Normalize [B,H,N,N] scores with per-person topological distances.

    First half of heads: legacy energy multiplication / additive log prior /
    no topology. Second half always global. Positive attention weights pool
    signed FC embeddings; they are not a signed GCN propagation operator.
    Hop/gamma are fixed, so all three variants have identical trainable weights.
    """
    if scores.ndim != 4 or scores.shape[1] % 2 or scores.shape[-1] != scores.shape[-2]:
        raise ValueError('Require square scores and an even head count.')
    if hops.shape != (scores.shape[0], scores.shape[-1], scores.shape[-1]):
        raise ValueError('Distances must belong to the same persons and nodes.')
    if not torch.isfinite(scores).all() or not torch.isfinite(hops).all() or (hops < 0).any():
        raise ValueError('Require finite scores and nonnegative finite distances.')
    half = scores.shape[1] // 2
    log_decay = F.relu(hops.unsqueeze(1) - hop) * F.logsigmoid(scores.new_tensor(gamma_logit))
    local, global_scores = scores[:, :half], scores[:, half:]
    if mechanism == 'multiply':
        local = local * log_decay.exp()
    elif mechanism == 'log_prior':
        local = local + log_decay
    elif mechanism != 'none':
        raise ValueError('Unknown topology mechanism.')
    return torch.softmax(torch.cat((local, global_scores), dim=1), dim=-1)


class HierarchicalGraphTransformer(nn.Module):
    def __init__(self, atlas_prior, mechanism='log_prior', hidden=16, heads=2, dropout=.2):
        super().__init__()
        prior = torch.as_tensor(atlas_prior, dtype=torch.float32)
        if prior.ndim != 2 or not torch.isfinite(prior).all() or (prior < 0).any():
            raise ValueError('An actual nonnegative [ROI,community] atlas prior is required.')
        if (prior.sum(0) <= 0).any() or (prior.sum(1) <= 0).any():
            raise ValueError('Explicitly account for unsupported ROIs; do not silently drop/pad them.')
        if heads % 2 or hidden % heads or prior.shape[1] > hidden:
            raise ValueError('Require even heads, divisible width and K <= width.')
        if mechanism not in {'multiply', 'log_prior', 'none'}:
            raise ValueError('Unknown mechanism.')
        self.mechanism, self.nodes, self.hidden, self.heads = mechanism, prior.shape[0], hidden, heads
        self.register_buffer('atlas_prior', prior)
        self.node_embedding = nn.Linear(self.nodes, hidden)
        self.node_qkv = nn.Linear(hidden, 3*hidden)
        self.node_out = nn.Linear(hidden, hidden)
        self.node_norm = nn.LayerNorm(hidden)
        self.node_ff = nn.Sequential(nn.Linear(hidden, 2*hidden), nn.GELU(),
                                     nn.Dropout(dropout), nn.Linear(2*hidden, hidden))
        self.node_ff_norm = nn.LayerNorm(hidden)
        self.prototypes = nn.Parameter(torch.empty(prior.shape[1], hidden))
        nn.init.orthogonal_(self.prototypes)
        self.community_q = nn.Linear(hidden, hidden)
        self.community_kv = nn.Linear(hidden, 2*hidden)
        self.community_norm = nn.LayerNorm(hidden)
        self.community_attention = nn.MultiheadAttention(hidden, heads, dropout=dropout, batch_first=True)
        self.community_ff = nn.Sequential(nn.Linear(hidden, 2*hidden), nn.GELU(),
                                          nn.Dropout(dropout), nn.Linear(2*hidden, hidden))
        self.community_ff_norm = nn.LayerNorm(hidden)
        self.dropout = nn.Dropout(dropout)
        self.head = nn.Linear(hidden+4, 1)

    def forward(self, signed_fc, hops, covariates, return_attention=False):
        batch = len(signed_fc)
        if signed_fc.shape != (batch, self.nodes, self.nodes) or covariates.shape != (batch, 4):
            raise ValueError('Require FC [B,N,N] and covariates [B,4].')
        if not torch.isfinite(signed_fc).all() or not torch.isfinite(covariates).all():
            raise ValueError('Nonfinite input.')
        h = self.node_embedding(signed_fc)
        q, k, v = (z.view(batch, self.nodes, self.heads, self.hidden//self.heads).transpose(1, 2)
                   for z in self.node_qkv(h).chunk(3, dim=-1))
        scores = q @ k.transpose(-1, -2) / math.sqrt(self.hidden//self.heads)
        attention = topology_attention(scores, hops, self.mechanism)
        message = (attention @ v).transpose(1, 2).reshape(batch, self.nodes, self.hidden)
        h = self.node_norm(h + self.dropout(self.node_out(message)))
        h = self.node_ff_norm(h + self.dropout(self.node_ff(h)))
        proto = self.prototypes.unsqueeze(0).expand(batch, -1, -1)
        cq = self.community_q(proto)
        ck, cv = self.community_kv(h).chunk(2, dim=-1)
        # Constant across variants: conditional pooling over atlas-supported ROIs.
        # Not the author's energy*Dice+entmax module; this distinction is deliberate.
        prior = self.atlas_prior.T
        log_prior = prior.clamp_min(torch.finfo(prior.dtype).tiny).log()
        log_prior = log_prior.masked_fill(prior == 0, -torch.inf)
        assignments = torch.softmax(cq @ ck.transpose(-1, -2)/math.sqrt(self.hidden) + log_prior, dim=-1)
        communities = self.community_norm(proto + self.dropout(assignments @ cv))
        refinement, _ = self.community_attention(communities, communities, communities, need_weights=False)
        communities = self.community_ff_norm(communities + self.dropout(refinement)
                                             + self.dropout(self.community_ff(communities)))
        logits = self.head(torch.cat((communities.mean(1), covariates), dim=1)).squeeze(-1)
        return (logits, attention, assignments) if return_attention else logits

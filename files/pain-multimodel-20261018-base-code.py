"""Shared forward interface: x/A [B,90,90], covariates [B,4] -> [B] logits."""
import torch
from torch import nn


class BaseModel(nn.Module):
    def forward(self, x, a, covariates):
        raise NotImplementedError


class StaticGraphClassifier(BaseModel):
    def __init__(self, propagation=True, hidden=16, dropout=.2):
        super().__init__()
        self.propagation = propagation
        self.node1 = nn.Linear(90, hidden)
        self.node2 = nn.Linear(hidden, hidden)
        self.dropout = nn.Dropout(dropout)
        self.head = nn.Linear(hidden + 4, 1)

    def forward(self, x, a, covariates):
        if x.shape != a.shape or x.shape[1:] != (90, 90) or covariates.shape != (len(x), 4):
            raise ValueError('Incorrect graph/covariate shapes.')
        h = torch.bmm(a, x) if self.propagation else x
        h = self.dropout(torch.relu(self.node1(h)))
        h = torch.bmm(a, h) if self.propagation else h
        h = self.dropout(torch.relu(self.node2(h))).mean(dim=1)
        return self.head(torch.cat((h, covariates), dim=1)).squeeze(-1)

"""The isolated factors used by the intact BrainHGT experiment.

Keep model, OMST, split, initialization, learning rate, weight-decay number,
selection rule and parameter scope identical. These are existing training
methods, not a new brain-network metric. See the full result/plan for budgets.
"""
import numpy as np
import torch

def make_optimizer(model, variant):
    cls = torch.optim.AdamW if variant == 'adamw' else torch.optim.Adam
    # As in the original experiment, include biases and LayerNorm parameters.
    # Parameters with grad=None (frozen prototypes) receive no optimizer update.
    return cls(model.parameters(), lr=1e-4, weight_decay=1e-4)

def training_class_weight(training_labels, variant, device):
    if variant != 'balanced_ce':
        return None
    counts = np.bincount(training_labels, minlength=2)
    assert np.all(counts > 0)
    return torch.tensor(len(training_labels) / (2 * counts),
                        dtype=torch.float32, device=device)

def selection_score(validation_labels, patient_probabilities):
    pos = patient_probabilities[validation_labels == 1]
    neg = patient_probabilities[validation_labels == 0]
    return float(((pos[:, None] > neg).sum()
                  + .5 * (pos[:, None] == neg).sum()) / (len(pos) * len(neg)))

def final_epochs(inner_selected_epochs):
    return int(np.median(inner_selected_epochs))

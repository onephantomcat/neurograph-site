"""Executed selector logic; intact author model imported privately, not republished."""
import numpy as np

def improves(selector, metric, best_metric):
    # Strict comparisons retain earliest exact tie.
    return metric > best_metric if selector == "auc" else metric < best_metric

def refit_epochs(inner_selected_epochs):
    return int(np.median(inner_selected_epochs))

# One Adam/ordinary-CE training trajectory per inner partition.
# Save separate state_dict clones when each selector improves.
# Refit original outer training people for each median epoch count.
# Original AUC controls reused only after exact inner-weight reproduction.
# Same epoch count means same deterministic model; reuse explicitly.
# Query people never select epochs, threshold, temperature or configuration.

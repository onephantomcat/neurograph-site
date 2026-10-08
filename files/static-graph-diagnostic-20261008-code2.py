"""Fixed full-batch neural engine, independent of sklearn solver engines.

No validation-based stopping/selection: save epoch100 and evaluate once.
Class-balanced weights are derived only from current training labels.
"""
import torch
from torch.nn import functional as F
from models import StaticGraphClassifier


def tensors(rows):
    return tuple(torch.as_tensor(v, dtype=torch.float32) for v in rows)


def predict(model, rows):
    model.eval()
    with torch.no_grad():
        return torch.sigmoid(model(*tensors(rows)[:3])).numpy()


def fit(rows, seed, propagation, config):
    torch.manual_seed(seed)
    model = StaticGraphClassifier(propagation, config['hidden'], config['dropout'])
    x, a, c, y = tensors(rows)
    counts = torch.bincount(y.long(), minlength=2)
    if torch.any(counts == 0):
        raise ValueError('Both training classes required.')
    weights = .5 / counts[y.long()]
    optimizer = torch.optim.Adam(model.parameters(), lr=config['learning_rate'],
                                 weight_decay=config['weight_decay'])
    history = []
    for epoch in range(config['epochs']):
        model.train()
        optimizer.zero_grad(set_to_none=True)
        loss = (weights * F.binary_cross_entropy_with_logits(model(x, a, c), y, reduction='none')).sum()
        if not torch.isfinite(loss):
            raise ValueError('Nonfinite training loss.')
        loss.backward()
        optimizer.step()
        history.append(float(loss.detach()))
    return model, history


def save_model(path, model, transforms, metadata):
    torch.save(dict(state_dict=model.state_dict(), propagation=model.propagation,
                    transforms=transforms, metadata=metadata), path)


def load_model(path):
    # Only checkpoints written by this local experiment; no external pickle.
    saved = torch.load(path, weights_only=False, map_location='cpu')
    model = StaticGraphClassifier(saved['propagation'])
    model.load_state_dict(saved['state_dict'])
    return model, saved

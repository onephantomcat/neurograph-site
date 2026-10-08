"""Fixed full-batch neural fit for the new hierarchy; no validation selection."""
import torch
from torch.nn import functional as F
from models import HierarchicalGraphTransformer

def tensors(rows):return tuple(torch.as_tensor(x,dtype=torch.float32) for x in rows)
def predict(model,rows):
    model.eval()
    with torch.no_grad():return torch.sigmoid(model(*tensors(rows)[:3])).numpy()

def fit(rows,prior,seed,mechanism,config):
    torch.manual_seed(seed)
    model=HierarchicalGraphTransformer(prior,mechanism,config['hidden'],config['heads'],config['dropout'])
    x,h,c,y=tensors(rows);counts=torch.bincount(y.long(),minlength=2)
    if (counts==0).any():raise ValueError('Both training classes required.')
    weights=.5/counts[y.long()]
    optimizer=torch.optim.Adam(model.parameters(),lr=config['learning_rate'],weight_decay=config['weight_decay'])
    history=[]
    for epoch in range(config['epochs']):
        model.train();optimizer.zero_grad(set_to_none=True)
        loss=(weights*F.binary_cross_entropy_with_logits(model(x,h,c),y,reduction='none')).sum()
        if not torch.isfinite(loss):raise ValueError('Nonfinite training loss.')
        loss.backward();optimizer.step();history.append(float(loss.detach()))
    return model,history

def save_model(path,model,transforms,metadata,history):
    torch.save(dict(state_dict=model.state_dict(),mechanism=model.mechanism,transforms=transforms,
                    metadata=metadata,training_loss=history),path)

def load_model(path):
    saved=torch.load(path,weights_only=False,map_location='cpu')
    model=HierarchicalGraphTransformer(saved['state_dict']['atlas_prior'],saved['mechanism'])
    model.load_state_dict(saved['state_dict']);return model,saved

def attention_diagnostic(model,rows):
    model.eval()
    with torch.no_grad():
        _,weights,_=model(*tensors(rows)[:3],return_attention=True)
        hops=torch.as_tensor(rows[1]);far=hops>2
        short=weights[:,0];global_head=weights[:,1]
        return dict(mean_short_attention_beyond2=float((short*far).sum(-1).mean()),
                    mean_long_attention_beyond2=float((global_head*far).sum(-1).mean()))

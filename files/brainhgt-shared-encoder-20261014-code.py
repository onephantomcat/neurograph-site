"""Excerpt: only encoder replacement and reproducible initialization.
make_model is the original author-model factory. No private data in this file.
"""
import random
import numpy as np
import torch

class SharedROIEncoder(torch.nn.Module):
 def __init__(self,width):
  super().__init__()
  self.layers=torch.nn.Sequential(torch.nn.Linear(256,width),torch.nn.LeakyReLU(),torch.nn.Linear(width,width),torch.nn.LeakyReLU(),torch.nn.Linear(width,256))
 def forward(self,x):
  assert x.ndim==2 and x.shape[1]==90*256
  return self.layers(x.reshape(-1,90,256)).reshape(-1,90*256)

def initialize(seed,variant,device):
 random.seed(seed);np.random.seed(seed);torch.manual_seed(seed);torch.cuda.manual_seed_all(seed)
 model=make_model(device)
 if variant!='original':
  with torch.random.fork_rng(devices=list(range(torch.cuda.device_count()))):
   torch.manual_seed(20261014+seed);torch.cuda.manual_seed_all(20261014+seed)
   model.clustering_module.encoder=SharedROIEncoder(int(variant.removeprefix('shared'))).to(device)
 return model

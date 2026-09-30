# GCN/GAT label-permutation sanity analysis

| Model | Observed AUC | Permuted range | >= observed | Add-one p |
|---|---:|---:|---:|---:|
| GCN | 0.511 | 0.430-0.585 | 1/5 | 0.333 |
| GAT | 0.575 | 0.402-0.551 | 0/5 | 0.167 |

Five permutations are a low-resolution implementation sanity check (minimum attainable add-one p is 1/6), not a standalone significance test.

`Research use only - clinician review required`

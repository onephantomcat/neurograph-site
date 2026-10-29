import unittest,math,tempfile,csv
from pathlib import Path
from pain_network_report.core import binary_metrics,spearman,load_models,paired,aggregate
class ReportingTests(unittest.TestCase):
 def test_tied_probabilities(self):
  m=binary_metrics([0,1,0,1],[.5]*4)
  self.assertEqual(m['auc'],.5);self.assertEqual(m['ap'],.5);self.assertEqual(m['brier'],.25);self.assertAlmostEqual(m['logloss'],math.log(2))
 def test_perfect_ranking_and_bad_confidence_are_different(self):
  m=binary_metrics([0,0,1,1],[.8,.81,.82,.83]);self.assertEqual(m['auc'],1.);self.assertGreater(m['logloss'],.8)
 def test_tie_rank_agrees_with_hand_calculation(self):
  self.assertEqual(spearman([1,2,2,4],[4,2,2,1]),-1.)
 def test_probability_domain_rejected(self):
  with self.assertRaises(ValueError):binary_metrics([0,1],[.2,1.1])
 def sample(self):
  return [dict(variant=v,inner=i,repeat=0,seed=0,step=200,validation_n=4,auc=.6+(v=='new')*.1,ap=.5,ba=.5,brier=.3,logloss=1.) for v in ['old','new'] for i in [0,1]]
 def test_pairing_requires_identical_membership_keys(self):
  rows=self.sample();rows.pop()
  with self.assertRaises(ValueError):paired(rows,'old')
 def test_aggregation_is_row_order_invariant(self):
  rows=self.sample();self.assertEqual(aggregate(rows),aggregate(list(reversed(rows))))
 def test_duplicate_or_mixed_step_input(self):
  with tempfile.TemporaryDirectory() as d:
   p=Path(d)/'m.csv';rows=self.sample();rows.append(rows[0])
   with p.open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
   with self.assertRaises(ValueError):load_models(p)
   rows=self.sample();rows[0]['step']=50
   with p.open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
   with self.assertRaises(ValueError):load_models(p)
if __name__=='__main__':unittest.main()

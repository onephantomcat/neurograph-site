import tempfile, unittest
from pathlib import Path
import numpy as np, torch
from data import graph, partition
from models import StaticGraphClassifier
from engine import predict, save_model, load_model


class Behavior(unittest.TestCase):
    def test_signed_constant_and_self_loop(self):
        s = np.zeros((30,90));s[:,0] = np.arange(30);s[:,1] = -s[:,0]
        x,a = graph(s)
        self.assertAlmostEqual(float(x[0,1]),-1)
        self.assertEqual(a[0,1],0)
        self.assertTrue(np.isfinite(a).all())
        self.assertEqual(a[2,2],1)
        np.testing.assert_array_equal(a,a.T)

    def test_person_isolation_scaler_and_queries(self):
        rng=np.random.default_rng(17)
        d=dict(subject_ids=['a','b','c','q'],labels=np.array([0,1,1,0]),
               covariates=rng.normal(size=(4,4)),time_series=[rng.normal(size=(30,90)) for _ in range(4)])
        _,_,t=partition(d,[0,1],[2],[3])
        before=t.covariates.mean_.copy();nodes=t.nodes.mean_.copy()
        d['covariates'][2]=1e9;d['time_series'][2]=np.zeros((30,90))
        _,_,t2=partition(d,[0,1],[2],[3])
        np.testing.assert_array_equal(before,t2.covariates.mean_)
        np.testing.assert_array_equal(nodes,t2.nodes.mean_)
        with self.assertRaises(ValueError):partition(d,[0,1],[1],[3])
        with self.assertRaises(ValueError):partition(d,[0,1],[2],[2])

    def test_batch_induction_equal_capacity_and_reload(self):
        torch.manual_seed(7)
        m=StaticGraphClassifier(); n=StaticGraphClassifier(False)
        self.assertEqual(sum(p.numel() for p in m.parameters()),1749)
        self.assertEqual(sum(p.numel() for p in n.parameters()),1749)
        rng=np.random.default_rng(1);pairs=[graph(rng.normal(size=(30,90))) for _ in range(2)]
        rows=(np.stack([x for x,a in pairs]),np.stack([a for x,a in pairs]),np.zeros((2,4)),np.zeros(2))
        p=predict(m,rows)
        changed=tuple(v.copy() for v in rows);changed[0][1]=100
        self.assertEqual(p[0],predict(m,changed)[0])
        for i in range(2):np.testing.assert_allclose(p[i:i+1],predict(m,tuple(v[i:i+1] for v in rows)),rtol=1e-6)
        with tempfile.TemporaryDirectory() as tmp:
            path=Path(tmp)/'model.pt';save_model(path,m,None,{})
            loaded,_=load_model(path);np.testing.assert_array_equal(p,predict(loaded,rows))


if __name__=='__main__':unittest.main()

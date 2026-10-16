"""Keep budget in every evidence identity when merging the three learning budgets."""
def group_by_budget(records,expected_support_panels=75):
    assert {r['k'] for r in records}=={5,10,20}
    result={k:[r for r in records if r['k']==k] for k in [5,10,20]}
    for k,rows in result.items():
        identities=[tuple(r[key] for key in ['k','outer','inner','repeat','condition','seed']) for r in rows]
        assert len(identities)==len(set(identities))==expected_support_panels*6
        groups={tuple(r[key] for key in ['outer','inner','repeat']) for r in rows};assert len(groups)==expected_support_panels
        for identity in groups:
            panel=[r for r in rows if tuple(r[key] for key in ['outer','inner','repeat'])==identity]
            assert sorted(r['seed'] for r in panel if r['condition']=='member')==list(range(5))
            assert len([r for r in panel if r['condition']=='ensemble5' and r['seed'] is None])==1
    return result

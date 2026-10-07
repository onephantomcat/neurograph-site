"""Rebuild aggregate manuscript tables from the existing public stage summary.

No model fitting, subject data, resampling or query evaluation is performed.
Example: python build_training_appendix.py --summary summary.json --output-dir tables
"""
from pathlib import Path
import argparse,csv,json

STAGES=[
 ('followup_results','联合归一化','mean_inner_metrics','mean_old_normalization_window_inner_metrics','paired_inner_auc_difference_mean',48,'C1; unweighted; tol1e-4; max1000'),
 ('followup_solver_precision','求解精度','mean_refined_metrics','mean_original_metrics','paired_auc_difference_mean',48,'C1; unweighted; tol1e-10; max10000'),
 ('followup_class_balance','类别均衡','mean_balanced_metrics','mean_unweighted_metrics','paired_auc_difference_mean',48,'C1; balanced sum weights44; tol1e-10; max10000'),
 ('followup_relative_l1','相对L1正则','mean_relative_metrics','mean_fixed_C1_metrics','paired_auc_difference_mean',96,'C=1/(fraction*training_lambda_max); balanced sum weights44; tol1e-10; max10000'),
]
METRICS=['auc','average_precision','brier','balanced_accuracy','log_loss','balanced_log_loss']
BASE='https://onephantomcat.github.io/neurograph-site/'

def build(summary,output):
 output.mkdir(parents=True,exist_ok=True);rows=[];stages=[]
 for key,name,newkey,oldkey,deltakey,count,parameters in STAGES:
  stage=summary[key];replay=stage['training_replay'];assert stage['people']==132 and stage['new_classifier_fits']==count and replay['models']==count
  assert replay['inner_probabilities']==count*44 and replay['maximum_probability_difference']==0
  methods=replay['methods'];assert len(methods)==(16 if count==96 else 8)
  stages.append(dict(key=key,name=name,models=count,inner_probabilities=count*44,parameters=parameters,independent_probability_difference=0))
  for item in methods:
   assert item['groups']==6
   new,old=item[newkey],item[oldkey]
   row=dict(stage=key,stage_name=name,feature=item['method'],scale=item['scale'],penalty=item.get('penalty','l1'),fraction=item.get('fraction',''),models=6,inner_probabilities=264,parameters=parameters,constant_heads=item.get('constant_heads',''),reference_auc=old['auc'],reference_brier=old['brier'],paired_auc_difference=item[deltakey],paired_brier_difference=new['brier']-old['brier'])
   row.update((m,new[m]) for m in METRICS);rows.append(row)
 assert len(rows)==40 and sum(s['models'] for s in stages)==240
 with (output/'manuscript-training-stages.csv').open('w',encoding='utf8',newline='') as f:
  writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
 budgets=['| 阶段 | 保存头 | 训练内概率 | 参数 |','| --- | ---: | ---: | --- |']
 for s in stages:budgets.append(f"| {s['name']} | {s['models']} | {s['inner_probabilities']} | {s['parameters']} |")
 fixed=['| 特征 | 尺度 | 正则 | 新输入默认AUC | 精度AUC | 类均衡AUC | 精度Brier | 类均衡Brier |','| --- | --- | --- | ---: | ---: | ---: | ---: | ---: |']
 def ident(row):return row['feature'],row['scale'],row['penalty']
 maps=[{ident(r):r for r in rows if r['stage']==s[0]} for s in STAGES[:3]]
 for k,a in maps[0].items():
  b,c=maps[1][k],maps[2][k];fixed.append(f"| {'预训练' if k[0]=='pretrained' else '随机'} | {'原始' if k[1]=='raw' else '训练内标准化'} | {k[2].upper()} | {a['auc']:.6f} | {b['auc']:.6f} | {c['auc']:.6f} | {b['brier']:.6f} | {c['brier']:.6f} |")
 relative=['| 特征 | 尺度 | 比例 | 原C1 AUC | 相对L1 AUC | ΔAUC | Brier | ΔBrier | 常数头 |','| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |']
 for row in rows:
  if row['stage']!=STAGES[3][0]:continue
  relative.append(f"| {'预训练' if row['feature']=='pretrained' else '随机'} | {'原始' if row['scale']=='raw' else '训练内标准化'} | {row['fraction']:g} | {row['reference_auc']:.6f} | {row['auc']:.6f} | {row['paired_auc_difference']:+.6f} | {row['brier']:.6f} | {row['paired_brier_difference']:+.6f} | {row['constant_heads']}/6 |")
 links=[f"- [完整聚合JSON]({BASE}files/migraine-normalization-20261007-summary.json)",f"- [表格CSV]({BASE}files/migraine-normalization-20261007-manuscript-table.csv)",f"- [表格生成代码]({BASE}files/migraine-normalization-20261007-code12.py)"]
 for i in range(3,12):links.append(f"- [输入读回、训练或独立重放代码code{i}]({BASE}files/migraine-normalization-20261007-code{i}.py)")
 text='# 新归一化与训练诊断：可复现附录\n\n这份附录仅重排既有聚合结果，新增拟合、前向、重采样与查询评分均为0。132人为111病例/21对照；每个内层训练和验证各44人（37病例/7对照），六个分区人员重复，表中点值是六分区指标均值。原固定K5 540拟合/45参考及五支持OOF与条件区间单列，不能用这些内层数替换。\n\n'+ '\n'.join(budgets)+'\n\n四阶段合计240保存头、10,560训练内概率，共40个阶段配置；同一方法跨阶段仍分别保留，不构成40个独立实验。开发新拟合累计1609，原K5 540另列。\n\n## 固定C1的全部八配置\n\n'+ '\n'.join(fixed)+'\n\n联合归一化对照为旧归一化同中央窗口；求解精度对照为新输入默认头；类均衡对照为同精度未加权头。参考不同，不能将表列变化都归因到同一因素。CSV同时给出AP、BAcc、普通与平衡logloss；未给新泛化区间。\n\n## 相对L1的全部16配置\n\n'+ '\n'.join(relative)+'\n\nlambda_max=max(abs(A_train.T@(w_train*(0.5-y_train))))，A含受罚截距。w病例22/37、对照22/7，两类各22、总44。lambda=比例×lambda_max，C=1/lambda；标准化仍用原训练内未加权StandardScaler。比例1/.3/.1/.03拟合前已定，无比例选择。24个比例1零解参照保留，其余72头不再常数。固定阈值0.5、seed0、liblinear、不附加协变量，不临时校正概率或集成。\n\n## 独立核对与适用范围\n\n已保存的四阶段模型与概率分别独立重放，概率差0；本次不重新读取模型。输入独立读回未持久化编码器原特征图，不声称全部池化已独立重算。严格精度改善训练目标一致性；类均衡的八配置原分布Brier均变差；相对L1原始尺度随机优于预训练，标准化时关系相反，没有一致预训练优势。类均衡原概率不自动当人群患病风险。实际专家报告0、用户授权训练QC、原25注意/文件/标签/划分、未知预训练重叠、原2.5mm网格/中央窗口360对365（−4秒）/CONN差异、准确日期/临床真值/H-test缺失均保留。不宣称独立临床验证、完整作者复现或超越论文。\n\n## 复现聚合表\n\n下载聚合JSON和生成代码后运行：\n\n```shell\npython build_training_appendix.py --summary summary.json --output-dir regenerated\n```\n\n该命令复现表格与聚合整理，不执行模型训练；逐人数据、特征和模型未公开。\n\n'+ '\n'.join(links)+'\n'
 (output/'manuscript-training-appendix.md').write_text(text,encoding='utf8')
 aggregate=dict(state='EXISTING_240_HEADS_INTEGRATED_IN_MANUSCRIPT',people=132,cases=111,controls=21,stages=stages,rows=rows,existing_models=240,existing_inner_probabilities=10560,stage_configurations=40,new_classifier_fits=0,new_encoder_forwards=0,new_resampling=0,new_query_scores=0,parameter_selection=0,original_k5_models=540,original_k5_FC_references=45,original_k5_analysis_unchanged=True,expert_reports_added=0,training_qc='PASSED_BY_USER_AUTHORIZATION',clinical_validation=False)
 (output/'manuscript-integration.json').write_text(json.dumps(aggregate,ensure_ascii=False,indent=2)+'\n',encoding='utf8');return aggregate

if __name__=='__main__':
 parser=argparse.ArgumentParser(description=__doc__);parser.add_argument('--summary',type=Path,required=True);parser.add_argument('--output-dir',type=Path,required=True);args=parser.parse_args();result=build(json.loads(args.summary.read_text(encoding='utf8')),args.output_dir);print(json.dumps(dict(rows=len(result['rows']),existing_models=result['existing_models'],existing_inner_probabilities=result['existing_inner_probabilities'],new_classifier_fits=0)))

"""Plot the existing public aggregate; no fitting, resampling or participant data."""
from pathlib import Path
import argparse,json
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

def plot(summary_path,output_dir):
    public=json.loads(Path(summary_path).read_text(encoding='utf8'))['fixed_k5_training']
    means=public['mean_metrics_over_five_support_draws'];draws=public['metrics_by_support_draw'];pairs=public['pretrained_paired_improvements']
    assert public['people']==132 and len(draws)==5 and set(pairs)=={'fc','random','covariates'}
    output=Path(output_dir);output.mkdir(parents=True,exist_ok=True)
    methods=['fc','pretrained','random','covariates'];labels=['FC + covariates','Frozen + covariates','Random + covariates','Covariates only']
    colors=['#2b6ca3','#cf7532','#8290a0','#427c68']
    plt.rcParams.update({'font.family':'DejaVu Sans','font.size':11,'axes.spines.top':False,'axes.spines.right':False,'svg.fonttype':'none','pdf.fonttype':42})
    fig,axes=plt.subplots(1,3,figsize=(15.5,5.4),gridspec_kw={'width_ratios':[1.25,1,1]})
    ax=axes[0]
    for j,(method,color) in enumerate(zip(methods,colors)):
        values=[draw[method]['auc'] for draw in draws]
        ax.scatter(values,j+np.linspace(-.12,.12,5),s=27,color=color,alpha=.7,zorder=3)
        ax.scatter(means[method]['auc'],j,s=86,facecolors='white',edgecolors='black',marker='D',zorder=4)
        ax.text(.805,j,f"{means[method]['auc']:.3f}",va='center',fontsize=10)
    ax.set(yticks=range(4),yticklabels=labels,xlim=(.25,.88),ylim=(3.55,-.55),xlabel='AUROC (higher is better)',title='A  All five fixed support draws')
    ax.axvline(.5,color='#8e959e',lw=.9,linestyle='--');ax.grid(axis='x',alpha=.18);ax.text(.01,-.25,'Dots: individual draws; diamonds: mean of metrics',transform=ax.transAxes,fontsize=9)
    comparisons=['fc','random','covariates'];comparison_labels=['vs FC + covariates','vs random + covariates','vs covariates only']
    for ax,key,title in [(axes[1],'auc','B  Frozen − comparator AUROC'),(axes[2],'brier','C  Frozen − comparator Brier error')]:
        rows=[]
        for j,method in enumerate(comparisons):
            p=pairs[method][key];value=p['improvement'];low=p['interval']['lower'];high=p['interval']['upper']
            if key=='brier':value,low,high=-value,-high,-low
            assert low<=value<=high
            ax.errorbar(value,j,xerr=[[value-low],[high-value]],fmt='o',color='#2b6ca3',capsize=4,ms=6,lw=1.5)
            rows.append(dict(comparator=method,difference=value,lower=low,upper=high))
        ax.axvline(0,color='#4f5661',lw=1,linestyle='--');ax.grid(axis='x',alpha=.18)
        ax.set(yticks=range(3),yticklabels=comparison_labels,ylim=(2.5,-.5),xlabel='Paired difference\nconditional 95% interval',title=title)
        ax.set_xlim((-.27,.18) if key=='auc' else (-.025,.10))
        ax.text(.01,-.25,'Positive: better discrimination' if key=='auc' else 'Positive: higher probability error',transform=ax.transAxes,fontsize=9)
    fig.suptitle('Adult same-scanner migraine development comparison: n=132, K=5 per class',fontsize=15,y=1.03)
    fig.text(.02,-.065,'2,000 paired resamples of people and saved draw indices; fixed trained heads and outer partition, no retraining.',fontsize=10)
    fig.text(.02,-.108,'Inclusion by user authorization; 111 migraine / 21 controls. No new expert reports or independent clinical validation.',fontsize=10)
    fig.tight_layout(w_pad=2.0)
    for suffix in ['png','pdf','svg']:
        fig.savefig(output/('fixed-k5-training-comparison.'+suffix),dpi=240,bbox_inches='tight')
    svg=output/'fixed-k5-training-comparison.svg'
    svg.write_text('\n'.join(line.rstrip() for line in svg.read_text(encoding='utf8').splitlines())+'\n',encoding='utf8')
    plt.close(fig)
    return dict(people=132,methods=methods,draws=5,new_fits=0,new_bootstrap_resamples=0,plotted_existing_aggregate_only=True,brier_orientation='Frozen error minus comparator error; positive is worse.',interval_scope=public['uncertainty_scope'])

if __name__=='__main__':
    p=argparse.ArgumentParser();p.add_argument('--summary',type=Path,default=Path(__file__).with_name('summary.json'));p.add_argument('--output',type=Path,default=Path(__file__).parent);a=p.parse_args();print(json.dumps(plot(a.summary,a.output),indent=2))

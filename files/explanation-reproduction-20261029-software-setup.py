from setuptools import setup
setup(name='pain-network-report',version='0.1.0',packages=['pain_network_report'],python_requires='>=3.10',description='Reproduce saved-model aggregate comparisons without private imaging inputs',entry_points={'console_scripts':['pain-network-report=pain_network_report.cli:main']})

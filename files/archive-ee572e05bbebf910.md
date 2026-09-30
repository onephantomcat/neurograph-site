# 项目流程图

入口：网站侧栏「项目流程」或首页「查看流程图」，路由 `/#workflow`。

两张图分别展示研究执行主线，以及多模态和 Agent 扩展。可放大查看、下载 PNG 或 SVG；手机可横向滚动，文字版可折叠展开。

## 内容依据与时点

- 主线依据：[实施路线](../implementation_plan.md)及[目标计划](PROJECT_PLAN.md)的 G19。
- 执行状态依据：9月8日会议核对及会后研究记录，2026-09-09整理。来源预训练与99/96开发性分类完成；1000次置换及独立回读完成，10项Holm校正均未显著。医院病种、主要终点、需求与现场准备并行，不等待模型完成。图示只描述阶段，不用固定图片替代实时队列统计。
- 历史 SRPBS 外部主要检验未通过；新的独立队列尚待取得。
- 瞳孔、病历文本、多模态融合、复杂图网络、LLM 和临床系统均属后续扩展。数据、质控、实验、证据四类 Agent 为本次建议分工，未宣称已经实现；研究者保留审核及研究决策。

## 编辑与导出

可编辑生成源为 `progress-dashboard/tools/build_workflow_assets.py`。在仓库根运行：

```powershell
python progress-dashboard/tools/build_workflow_assets.py
python progress-dashboard/tools/build_workflow_assets.py --png
```

第一条仅生成 SVG；第二条需安装 Playwright 和 Chromium，生成对应 2 倍分辨率 PNG。中文字体使用运行机器上的 Microsoft YaHei。输出位于 `progress-dashboard/public/workflow-{execution,roadmap}.{svg,png}`；修改内容后应一并重新导出、查看图中文字和箭头，并更新图示日期。

## 本次验证

35 项现有单元测试通过；已有浏览器检查覆盖 7 个导航入口、6 个主站视图和 1440/980/390/360px 宽度。实际 8877 网站检查两张图片、四个下载、两个原图标签页、G19 依据、文字版、键盘横向滚动、返回导航及刷新，无 JavaScript 错误。此验证没有写入 QC 意见或启动训练。

## 2026-09-09会议后更新

两张SVG/PNG及网页文字版同步更新为会后状态；瞳孔先论证，三维场景重建列远期，Agent保持此前建议而非会议决定。新增会议核对与医院需求草案入口。上方35项验证为历史交付记录，本次验证见TASK_RECORD最近更新。

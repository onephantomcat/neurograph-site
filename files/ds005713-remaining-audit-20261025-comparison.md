# DS005713剩余102与原135终态对比

剩余102个候选登记键（74patient/28HC）当前可用于独立验证0：100条已有原QC排除，2条patient为原跨人员身份重复HOLD。结合此前33条，原135候选为133条原QC排除、2条身份待核，可直接验证仍0。

|剩余102的互斥终态|登记键数|原patient/HC|说明|
|---|---:|---|---|
|ORIGINAL_AUTOMATIC_QC_EXCLUDED|99|72/27|原自动QC排除，与当前原报告false项和完成marker相符|
|ORIGINAL_RECOVERY_QC_EXCLUDED|1|0/1|旧恢复后71/190扩展删帧，原20%要求仍未满足|
|CROSS_PERSON_BOLD_IDENTITY_HOLD|2|2/0|原hold_identity_duplicate，涉及同一跨人员BOLD对象；无现成处理/QC资格|


|范围/原分组|登记键|可直接验证|原QC排除|身份HOLD|
|---|---:|---:|---:|---:|
|remaining102 / patient|74|0|72|2|
|remaining102 / HC|28|0|28|0|
|original135 / patient|97|0|95|2|
|original135 / HC|38|0|38|0|


2条HOLD记录涉及同一组跨人员重复BOLD对象，不能当作2名独立验证人，也没有合格HC可组成病例/对照测试集。文件路径存在、旧成员清单未命中，都不能解除原身份和QC限制。

仅读既有metadata、配置、源文件存在/大小、原报告、保存成员、Git/annex对象记录与SQLite；训练/前向/预测、MRI头/数组与FC数组读取、QC决定/纳入及专家报告均0。原阈值、原33排除、TN14与CoSpine留出保持；不把登记键或重复访视当作已证独立生物个体。

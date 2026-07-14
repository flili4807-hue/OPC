# 飞书线索承接权限检查清单

## 1. 飞书机器人卡片

- 已创建飞书群机器人 Webhook。
- `.env` 已配置 `FEISHU_WEBHOOK_URL`。
- 生产发送前设置 `FEISHU_CARD_ENABLED=true`、`FEISHU_CARD_MOCK=false`。
- 机器人所在群包含实际跟进负责人。

## 2. 多维表格

- 已创建飞书自建应用，并获得 `FEISHU_APP_ID`、`FEISHU_APP_SECRET`。
- 自建应用已开通多维表格记录写入权限。
- 自建应用已被添加为目标多维表格协作者，且具备可编辑权限。
- `.env` 已配置 `BITABLE_APP_TOKEN`、`BITABLE_TABLE_ID`。
- 生产写入前设置 `BITABLE_ENABLED=true`、`BITABLE_MOCK=false`。
- 多维表字段名与 `config/bitable-field-map.json` 保持一致。

## 3. 运营字段

- 多维表至少包含：线索ID、提交时间、公司/团队、姓名、联系方式、总分、风险等级、雷达图数据、Top短板、建议首问、建议跟进动作、跟进状态、写入状态。
- 建议把“联系方式”“项目背景”限制在授权人员可见范围内。

## 4. 验证步骤

1. 使用测试联系方式提交一次问卷。
2. 确认页面生成报告。
3. 确认飞书群收到线索卡片。
4. 确认多维表新增记录。
5. 执行导出，确认 CSV 包含 `notifyBitable`、`bitableRecordId`、`bitableError`。
6. 如写入失败，修正权限或字段后执行 `npm run retry:bitable -- --status failed --limit 20` 补录。

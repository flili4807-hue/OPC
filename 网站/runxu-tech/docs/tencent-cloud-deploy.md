# 腾讯云轻量服务器部署说明

## 1. 服务器安全组放行端口

先放行：

- TCP 22：SSH 登录
- TCP 8765：临时预览官网

后续绑定域名和 HTTPS 时再放行：

- TCP 80
- TCP 443

## 2. 上传代码

推荐先用 GitHub 拉代码到服务器：

```bash
mkdir -p /opt/runxu
cd /opt/runxu
git clone <你的 GitHub 仓库地址> .
cd OPC/网站/runxu-tech
```

如果仓库目录结构不是这样，就进入包含 `server.js` 和 `docker-compose.yml` 的目录。

## 3. 配置环境变量

```bash
cp .env.example .env
nano .env
```

生产环境至少确认：

```env
HOST=0.0.0.0
NODE_ENV=production
FEISHU_CARD_MOCK=false
FEISHU_MOCK=false
BITABLE_MOCK=false
FEISHU_WEBHOOK_URL=你的飞书机器人 Webhook
FEISHU_APP_ID=你的飞书应用 App ID
FEISHU_APP_SECRET=你的飞书应用 App Secret
BITABLE_APP_TOKEN=你的多维表 App Token
BITABLE_TABLE_ID=你的多维表 Table ID
BITABLE_VIEW_URL=你的多维表视图链接
```

如果暂时不发邮件，保持：

```env
EMAIL_MOCK=true
```

## 4. 启动服务

```bash
docker compose up -d --build
```

检查状态：

```bash
docker ps
docker logs -f runxu-tech
```

## 5. 访问验证

浏览器打开：

```text
http://服务器公网IP:8765/questionnaire.html
```

提交一条测试线索后，确认：

- 页面能解锁报告
- 飞书群能收到消息
- 飞书多维表能新增记录

## 6. 常用维护命令

重启：

```bash
docker compose restart
```

更新代码后重新部署：

```bash
git pull
docker compose up -d --build
```

查看日志：

```bash
docker logs -f runxu-tech
```

导出线索 CSV：

```bash
docker exec runxu-tech node scripts/export-leads.js
```

重试写入飞书多维表：

```bash
docker exec runxu-tech node scripts/retry-bitable.js --status failed --limit 20
```

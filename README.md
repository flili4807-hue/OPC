# Runxu Tech 官网

这是北京润序科技官网当前生产代码仓库。

## 当前保留目录

- `网站/runxu-tech/`：当前线上官网与项目诊断问卷代码，包含 Node 服务、静态页面、飞书机器人与多维表同步逻辑。
- `网站/文档/`：PRD、UI/UX 设计方案、技术方案与评审记录。

## 本地校验

```bash
cd 网站/runxu-tech
npm run check
```

## 部署

腾讯云 Docker 部署说明见：

```text
网站/runxu-tech/docs/tencent-cloud-deploy.md
```

## 清理说明

仓库已移除历史静态站点、旧 Next.js 版本、历史 Delivery-OS/注册材料包，仅保留当前可部署官网代码与项目文档。

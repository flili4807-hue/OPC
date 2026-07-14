# DeliveryOS 企业官网 + 客户增长后台

北京润序数智科技有限公司官网系统，覆盖官网获客、DSI项目成功率诊断、CMMI成熟度评估、PDF报告、999元服务购买、飞书销售同步和客户后台。

## 技术栈

- Next.js + React + TypeScript
- Tailwind CSS
- Node.js API Routes
- PostgreSQL / Supabase
- PDFKit
- Vercel / Docker

## 本地运行

```bash
cd 网站
npm install
cp .env.example .env.local
npm run dev
```

访问：

- 官网：http://localhost:3000
- 项目诊断：http://localhost:3000/diagnosis
- CMMI评估：http://localhost:3000/cmmi
- 999元服务：http://localhost:3000/service
- 客户后台：http://localhost:3000/admin

未配置 Supabase 时，系统使用内存存储，适合本地演示。重启后数据会清空。

## 数据库

在 Supabase SQL Editor 执行：

```sql
-- sql/schema.sql
```

然后配置：

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

## PDF 中文字体

PDFKit 默认字体不适合中文生产报告。建议下载 Noto Sans CJK，并配置：

```bash
PDF_FONT_PATH=/absolute/path/NotoSansCJKsc-Regular.otf
```

## 飞书多维表同步

配置环境变量：

```bash
FEISHU_APP_ID=
FEISHU_APP_SECRET=
BITABLE_TOKEN=
BITABLE_TABLE_ID=
```

客户提交诊断后，系统会异步写入飞书多维表。字段包括客户名称、公司、联系人、职位、手机号、邮箱、项目类型、员工规模、项目阶段、DSI评分、CMMI等级、购买状态、销售状态和跟进记录。

## 支付接口预留

`/api/payments/checkout` 已预留：

- 微信支付
- 支付宝
- Stripe

当前未配置商户参数时返回 mock checkout，可用于前端联调。

## Docker

```bash
cd 网站
docker build -t deliveryos .
docker run --env-file .env.local -p 3000:3000 deliveryos
```

## Vercel 部署

1. 将 `网站` 目录作为 Vercel Project Root。
2. 配置 `.env.example` 中的环境变量。
3. 部署后将 `NEXT_PUBLIC_SITE_URL` 设置为线上域名。

## 生产待办

- 接入 Supabase Auth 或企业SSO保护后台。
- 将PDF保存到 Supabase Storage。
- 接入真实微信、支付宝、Stripe支付回调。
- 接入邮件服务发送购买确认邮件。
- 按实际飞书多维表字段调整字段名。

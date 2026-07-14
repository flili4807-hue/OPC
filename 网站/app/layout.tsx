import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeliveryOS | 北京润序数智科技有限公司",
  description: "AI时代研发交付治理平台，提供项目成功率诊断、CMMI成熟度评估、AI项目治理Agent和研发效能度量。"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}

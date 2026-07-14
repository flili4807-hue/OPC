export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink">
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-10 text-sm text-slate-400 md:grid-cols-3">
        <div>
          <p className="font-semibold text-white">DeliveryOS</p>
          <p className="mt-2">AI时代研发交付治理平台，连接AI Agent、PMO方法论、CMMI成熟度模型与数据度量体系。</p>
        </div>
        <div>
          <p className="font-semibold text-white">服务</p>
          <p className="mt-2">项目诊断、CMMI评估、PMO咨询、研发效能提升、AI项目治理。</p>
        </div>
        <div>
          <p className="font-semibold text-white">联系</p>
          <p className="mt-2">扫码添加飞书联系人，获取免费项目成功率诊断。</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";

const nav = [
  ["产品能力", "/#product"],
  ["案例中心", "/cases"],
  ["专家团队", "/experts"],
  ["999元服务", "/service"]
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-400 text-lg font-black text-ink">D</span>
          <span>
            <span className="block text-sm font-semibold text-white">北京润序数智科技有限公司</span>
            <span className="block text-xs uppercase tracking-[0.22em] text-cyan-200">DeliveryOS</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-300 lg:flex">
          {nav.map(([label, href]) => (
            <Link key={label} href={href} className="hover:text-white">
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

import { Header } from "@/components/Header";

export default function LoginPage() {
  return (
    <main>
      <Header />
      <section className="mx-auto max-w-md px-5 py-20">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-panel">
          <h1 className="text-2xl font-black">客户后台登录</h1>
          <div className="mt-6 grid gap-4">
            <input className="field" placeholder="邮箱" />
            <input className="field" placeholder="密码" type="password" />
            <a href="/admin" className="btn-primary">进入后台</a>
          </div>
          <p className="mt-4 text-xs text-slate-500">生产环境建议接入 Supabase Auth 或企业SSO。</p>
        </div>
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import { useState } from "react";

export function ContactAssistant() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="w-72 rounded-xl border border-cyan-300/30 bg-slate-950/95 p-4 text-white shadow-panel backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-base font-black">联系我</p>
              <p className="mt-1 text-xs leading-5 text-slate-400">扫码添加飞书联系人，获取项目诊断和CMMI评估方案。</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 text-sm text-slate-400 transition hover:text-white"
              aria-label="关闭联系二维码"
            >
              ×
            </button>
          </div>
          <Image src="/feishu-qr.png" alt="飞书二维码" width={240} height={240} className="mt-4 w-full rounded-lg bg-white p-2" />
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-full bg-cyan-400 px-5 py-3 text-sm font-black text-ink shadow-panel transition hover:bg-cyan-300"
      >
        联系我
      </button>
    </div>
  );
}

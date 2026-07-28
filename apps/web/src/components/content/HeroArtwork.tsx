export function HeroArtwork() {
  return (
    <div
      aria-hidden="true"
      className="zi-grid-surface relative mx-auto aspect-[1.15/1] w-full max-w-xl overflow-hidden rounded-[2rem]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/20 via-transparent to-blue-200/30 dark:from-cyan-500/5 dark:to-blue-500/10" />
      <div className="absolute left-[17%] top-[19%] size-[48%] rotate-45 rounded-[18%] bg-gradient-to-br from-cyan-300 to-blue-600 shadow-[0_30px_80px_rgba(17,93,255,.28)]" />
      <div className="absolute left-[22%] top-[24%] size-[38%] rotate-45 rounded-[18%] border border-white/70 bg-gradient-to-br from-cyan-100/70 to-blue-500/70 backdrop-blur-sm" />
      <div className="absolute left-[27%] top-[29%] size-[28%] rotate-45 rounded-[18%] border border-white/70 bg-gradient-to-br from-cyan-200 to-blue-500" />

      <div className="absolute right-[2%] top-[12%] w-[42%] rounded-xl border border-slate-700 bg-[#071427] p-4 font-mono text-[0.62rem] leading-5 text-slate-300 shadow-2xl sm:text-xs">
        <div className="mb-3 flex gap-1.5">
          <span className="size-2 rounded-full bg-red-400" />
          <span className="size-2 rounded-full bg-amber-300" />
          <span className="size-2 rounded-full bg-emerald-400" />
        </div>
        <p className="text-cyan-300">architecture.ts</p>
        <p className="mt-2 text-slate-500">{'// modular boundaries'}</p>
        <p>
          <span className="text-purple-300">export</span>{' '}
          <span className="text-cyan-200">const</span> app = {'{'}
        </p>
        <p className="pl-3 text-amber-200">content, platform,</p>
        <p className="pl-3 text-amber-200">search, identity</p>
        <p>{'}'}</p>
      </div>

      <div className="absolute bottom-[9%] left-[2%] rounded-xl border border-border-subtle bg-surface/95 px-4 py-3 shadow-card backdrop-blur">
        <p className="text-[0.62rem] font-bold text-text-muted">PERFORMANCE</p>
        <p className="mt-1 text-sm font-black text-text-primary">Fast by design</p>
      </div>
      <div className="absolute left-[5%] top-[10%] rounded-xl border border-border-subtle bg-surface/95 px-4 py-3 shadow-card backdrop-blur">
        <p className="text-[0.62rem] font-bold text-text-muted">ARCHITECTURE</p>
        <p className="mt-1 text-sm font-black text-text-primary">Clear boundaries</p>
      </div>
    </div>
  )
}

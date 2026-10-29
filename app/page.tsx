import { HotdogMachine } from "@/components/HotdogMachine";

const BENCH = [
  { name: "HotdogGPT-1", score: 99.2, us: true },
  { name: "Average human", score: 97.0 },
  { name: "Your uncle at a BBQ", score: 61.4 },
  { name: "A golden retriever", score: 12.0 },
  { name: "Leading general-purpose models", score: null },
];

const CAPABILITIES = [
  { k: "01", t: "Hotdog", d: "Identifies hotdogs with state-of-the-art accuracy." },
  { k: "02", t: "Not hotdog", d: "Identifies everything else as not hotdog. Also state-of-the-art." },
  { k: "03", t: "That's it", d: "We deliberately removed all other capabilities. For safety." },
];

export default function Home() {
  return (
    <main className="relative min-h-dvh overflow-x-clip">
      {/* nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-medium tracking-tight">
          <span className="grid size-6 place-items-center rounded-full bg-text text-xs text-black">◐</span>
          HotdogGPT
        </span>
        <nav className="hidden gap-8 text-sm text-muted md:flex">
          <a href="#research" className="hover:text-text">Research</a>
          <a href="#benchmarks" className="hover:text-text">Benchmarks</a>
          <a href="#safety" className="hover:text-text">Safety</a>
        </nav>
        <a href="#try" className="btn-primary min-h-9 px-4 text-sm">
          Try it
        </a>
      </header>

      {/* hero */}
      <section className="relative mx-auto flex max-w-6xl flex-col items-center px-5 pt-20 pb-24 text-center md:pt-28">
        <div className="grid-bg absolute inset-0 -z-10" aria-hidden />
        <div className="orb -top-40 left-1/2 -z-10 size-[520px] -translate-x-1/2 opacity-40" aria-hidden />
        <p className="eyebrow mb-6">Research · October 2026</p>
        <h1 className="max-w-4xl font-serif text-6xl leading-[0.95] tracking-tight md:text-8xl">
          Introducing <span className="gradient-text italic">HotdogGPT‑1</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted md:text-xl">
          Our most capable model yet for answering one question. It cannot answer any other question.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <a href="#try" className="btn-primary">Try HotdogGPT</a>
          <a href="#research" className="btn-ghost">Read the paper ↗</a>
        </div>
      </section>

      {/* demo */}
      <section id="try" className="mx-auto max-w-5xl scroll-mt-10 px-5 pb-28">
        <HotdogMachine />
        <p className="mt-4 text-center text-xs text-muted">
          Runs entirely on your device. Your images are never uploaded. HotdogGPT can make mistakes; it will not admit them.
        </p>
      </section>

      {/* capabilities */}
      <section className="mx-auto max-w-6xl px-5 pb-28">
        <p className="eyebrow mb-8">Capabilities</p>
        <div className="grid gap-px overflow-hidden rounded-[1.25rem] border border-line bg-line md:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <div key={c.k} className="flex flex-col gap-10 bg-bg p-8">
              <span className="font-mono text-xs text-muted">{c.k}</span>
              <div>
                <h3 className="font-serif text-3xl">{c.t}</h3>
                <p className="mt-2 text-muted">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* benchmarks */}
      <section id="benchmarks" className="mx-auto max-w-6xl scroll-mt-10 px-5 pb-28">
        <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="eyebrow mb-4">Benchmarks</p>
            <h2 className="font-serif text-4xl leading-tight md:text-5xl">State of the art on HotdogBench.</h2>
            <p className="mt-4 text-muted">
              Evaluated on 10,000 images of hotdogs and 10,000 images of things that are, regrettably, not hotdogs.
            </p>
          </div>
          <div className="panel flex flex-col gap-5 p-6 md:p-8">
            {BENCH.map((b) => (
              <div key={b.name} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span className={b.us ? "text-text" : "text-muted"}>{b.name}</span>
                  <span className="font-mono text-muted">{b.score === null ? "refused to answer" : `${b.score.toFixed(1)}%`}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={`h-full rounded-full ${b.us ? "bg-gradient-to-r from-glow-b to-glow-a" : "bg-white/25"}`}
                    style={{ width: `${b.score ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
            <p className="font-mono text-[11px] text-muted">Higher is better. Results not peer reviewed. Peers declined.</p>
          </div>
        </div>
      </section>

      {/* research */}
      <section id="research" className="mx-auto max-w-3xl scroll-mt-10 px-5 pb-28">
        <p className="eyebrow mb-4">Abstract</p>
        <p className="font-serif text-2xl leading-snug md:text-3xl">
          We present HotdogGPT-1, a 14-million-parameter vision model that reduces the world to two categories.
          We find that <i>almost everything is not a hotdog</i>, a result with profound implications we have chosen
          not to explore.
        </p>
      </section>

      {/* safety */}
      <section id="safety" className="mx-auto max-w-6xl scroll-mt-10 px-5 pb-20">
        <div className="panel grid gap-6 p-8 md:grid-cols-[auto_1fr] md:p-10">
          <p className="eyebrow">Safety</p>
          <p className="max-w-2xl text-muted">
            HotdogGPT-1 underwent extensive red-teaming. Testers repeatedly asked it to be something other than a
            hotdog classifier. It refused every time. We consider this alignment.
          </p>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-wrap justify-between gap-4 border-t border-line px-5 py-8 text-xs text-muted">
        <span>© 2026 HotdogGPT. Responsible hotdog detection.</span>
        <span className="font-mono">Built in Ottawa · Stupid Ideas 2026</span>
      </footer>
    </main>
  );
}

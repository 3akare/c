"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { judge, loadModel, type Verdict } from "@/lib/model";

type Phase = "idle" | "thinking" | "done";
type Stats = { yes: number; no: number };

const ease = [0.22, 1, 0.36, 1] as const;

/* ---------- per-device counters (localStorage) ---------- */
const STATS_KEY = "hotdoggpt-stats";
const EMPTY = '{"yes":0,"no":0}';
function rawStats() {
  try {
    return localStorage.getItem(STATS_KEY) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}
function saveStats(s: Stats) {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(s));
  } catch {}
  window.dispatchEvent(new Event(STATS_KEY));
}
function subscribe(cb: () => void) {
  window.addEventListener(STATS_KEY, cb);
  return () => window.removeEventListener(STATS_KEY, cb);
}
function useStats(): Stats {
  const raw = useSyncExternalStore(subscribe, rawStats, () => EMPTY);
  try {
    return JSON.parse(raw) as Stats;
  } catch {
    return { yes: 0, no: 0 };
  }
}

/* ---------- very serious chain of thought ---------- */
function reasoning(v: Verdict) {
  const g = v.guess;
  const article = /^[aeiou]/i.test(g) ? "an" : "a";
  if (v.hotdog) {
    return [
      "Analyzing image.",
      "Detected: elongated protein cylinder.",
      "Detected: bun. Bun is load-bearing.",
      "Cross-referencing 14 million hotdogs.",
      "Conclusion: hotdog.",
    ];
  }
  return [
    "Analyzing image.",
    `The object appears to be ${article} ${g}.`,
    `${article === "an" ? "An" : "A"} ${g} is not typically served in a bun.`,
    "Checked anyway. No bun.",
    "Conclusion: not hotdog.",
  ];
}

export function HotdogMachine() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [src, setSrc] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [thoughtFor, setThoughtFor] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [modelReady, setModelReady] = useState(false);
  const [dragging, setDragging] = useState(false);
  const stats = useStats();
  const imgRef = useRef<HTMLImageElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const started = useRef(0);

  useEffect(() => {
    let live = true;
    loadModel()
      .then(() => live && setModelReady(true))
      .catch(() => live && setError("Model failed to load. Please refresh."));
    return () => {
      live = false;
    };
  }, []);

  function pick(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Unsupported input. HotdogGPT-1 only accepts images.");
    setError(null);
    setVerdict(null);
    if (src) URL.revokeObjectURL(src);
    setSrc(URL.createObjectURL(file));
    started.current = performance.now();
    setPhase("thinking");
  }

  async function onImageLoad() {
    if (phase !== "thinking" || !imgRef.current) return;
    try {
      const [v] = await Promise.all([judge(imgRef.current), new Promise((r) => setTimeout(r, 1800))]);
      setThoughtFor((performance.now() - started.current) / 1000);
      setVerdict(v);
      setPhase("done");
      saveStats({ yes: stats.yes + (v.hotdog ? 1 : 0), no: stats.no + (v.hotdog ? 0 : 1) });
    } catch {
      setError("Inference failed. Please try a different image.");
      setPhase("idle");
    }
  }

  function reset() {
    setPhase("idle");
    setVerdict(null);
    if (src) URL.revokeObjectURL(src);
    setSrc(null);
  }

  const total = stats.yes + stats.no;

  return (
    <div className="panel overflow-hidden">
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => pick(e.target.files?.[0])} />
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />

      {/* window chrome */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">HotdogGPT-1</span>
          <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[10px] text-muted">on-device</span>
        </div>
        <span className="flex items-center gap-2 font-mono text-xs text-muted">
          <span className={`size-1.5 rounded-full ${modelReady ? "bg-yes" : "animate-pulse bg-glow-b"}`} />
          {modelReady ? "ready" : "loading weights"}
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-2">
        {/* input */}
        <div
          className={`relative aspect-square border-b border-line md:border-r md:border-b-0 ${dragging ? "bg-white/[0.04]" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            pick(e.dataTransfer.files?.[0]);
          }}
        >
          {src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img ref={imgRef} src={src} alt="Input image" onLoad={onImageLoad} className="h-full w-full object-cover" />
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex h-full w-full flex-col items-center justify-center gap-4 p-8 text-center"
            >
              <span className="grid size-14 place-items-center rounded-2xl border border-line text-2xl">↑</span>
              <span className="text-[15px]">Drop an image, or click to upload</span>
              <span className="eyebrow">JPG · PNG · HEIC · any object</span>
            </button>
          )}
          <AnimatePresence>
            {phase === "thinking" && (
              <motion.div
                className="pointer-events-none absolute inset-0 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-glow-b/25 to-transparent"
                  animate={{ top: ["-20%", "100%"] }}
                  transition={{ type: "tween", duration: 1.4, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* output */}
        <div className="flex min-h-72 flex-col justify-between gap-6 p-6 md:p-8">
          <AnimatePresence mode="wait">
            {phase === "idle" && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3">
                <p className="eyebrow">Prompt</p>
                <p className="font-serif text-3xl leading-tight md:text-4xl">Is it a hotdog?</p>
                <p className="text-sm text-muted">This is the only prompt. It cannot be changed.</p>
              </motion.div>
            )}

            {phase === "thinking" && (
              <motion.div key="thinking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-3" role="status">
                <p className="eyebrow">Reasoning</p>
                <p className="shimmer text-lg font-medium">Thinking very hard…</p>
              </motion.div>
            )}

            {phase === "done" && verdict && (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="flex flex-col gap-5">
                <details className="group text-sm text-muted">
                  <summary className="cursor-pointer list-none select-none">
                    Thought for {thoughtFor.toFixed(1)}s <span className="inline-block transition-transform group-open:rotate-90">›</span>
                  </summary>
                  <ol className="mt-3 flex flex-col gap-1.5 border-l border-line pl-4 font-mono text-xs">
                    {reasoning(verdict).map((line, i) => (
                      <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.12 }}>
                        {line}
                      </motion.li>
                    ))}
                  </ol>
                </details>

                <motion.p
                  aria-live="assertive"
                  className={`font-serif text-6xl leading-none md:text-7xl ${verdict.hotdog ? "text-yes" : "text-no"}`}
                  initial={{ opacity: 0, filter: "blur(12px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease }}
                >
                  {verdict.hotdog ? "Hotdog." : <>Not <i>hotdog.</i></>}
                </motion.p>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between font-mono text-xs text-muted">
                    <span>p(hotdog)</span>
                    <span>{(verdict.score * 100).toFixed(verdict.score < 0.01 ? 4 : 2)}%</span>
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-glow-b to-glow-a"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(verdict.score * 100, 0.6)}%` }}
                      transition={{ duration: 1, ease, delay: 0.3 }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p role="alert" className="text-sm text-no">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {phase === "done" ? (
              <button type="button" className="btn-primary" onClick={reset}>
                New inference
              </button>
            ) : (
              <>
                <button type="button" className="btn-primary" disabled={phase === "thinking"} onClick={() => cameraRef.current?.click()}>
                  Use camera
                </button>
                <button type="button" className="btn-ghost" disabled={phase === "thinking"} onClick={() => fileRef.current?.click()}>
                  Upload image
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-line px-5 py-3 font-mono text-xs text-muted">
        <span>inferences on this device: {total}</span>
        <span>hotdogs: {stats.yes}</span>
        <span>not hotdogs: {stats.no}</span>
      </div>
    </div>
  );
}

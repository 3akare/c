"use client";

import type { MobileNet } from "@tensorflow-models/mobilenet";

const HOTDOG = 934; // ImageNet class "hotdog, hot dog, red hot"

let modelPromise: Promise<MobileNet> | null = null;

/** Loads MobileNet v2 from /public/model (works offline). Cached after first call. */
export function loadModel() {
  modelPromise ??= (async () => {
    const [tf, mobilenet] = await Promise.all([import("@tensorflow/tfjs"), import("@tensorflow-models/mobilenet")]);
    await tf.ready();
    return mobilenet.load({ version: 2, alpha: 1.0, modelUrl: "/model/model.json", inputRange: [0, 1] });
  })();
  return modelPromise;
}

export type Verdict = {
  hotdog: boolean;
  /** 0–1, how sure we are it's a hotdog */
  score: number;
  /** what the AI thinks it actually is */
  guess: string;
  guessScore: number;
};

export async function judge(img: HTMLImageElement): Promise<Verdict> {
  const [model, tf] = await Promise.all([loadModel(), import("@tensorflow/tfjs")]);
  const probs = tf.tidy(() => tf.softmax(model.infer(img, false) as import("@tensorflow/tfjs").Tensor2D).dataSync());
  const top = await model.classify(img, 1);
  const score = probs[HOTDOG];
  const guess = (top[0]?.className ?? "mystery object").split(",")[0];
  return {
    hotdog: score > 0.25 || guess.startsWith("hotdog"),
    score,
    guess,
    guessScore: top[0]?.probability ?? 0,
  };
}

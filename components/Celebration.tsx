"use client";

import confetti from "canvas-confetti";
import { useEffect } from "react";

// Bright party colours: the moment should feel like good news.
const COLORS = ["#22c55e", "#facc15", "#3b82f6", "#ec4899", "#f97316", "#a855f7"];
const BURST = { particleCount: 70, spread: 65, startVelocity: 55, colors: COLORS, disableForReducedMotion: true };

// A short "tada" when a document looks good: one burst from each lower corner.
export function Celebration() {
  useEffect(() => {
    confetti({ ...BURST, angle: 60, origin: { x: 0, y: 0.9 } });
    confetti({ ...BURST, angle: 120, origin: { x: 1, y: 0.9 } });
    return () => {
      confetti.reset();
    };
  }, []);

  return null;
}

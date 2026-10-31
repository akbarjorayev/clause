"use client";

import { useEffect, useRef } from "react";

// "AI is working on it" shimmer over the photo: lots of small dots, scattered (not in rows), that
// drift and glow in organic groups. Movement comes from Perlin noise (the smooth "random but
// grouped" noise used for terrain in games): neighbouring dots get similar values, so patches of
// dots move together while different areas wander their own way.
// No cursor interaction; a single still frame for reduced motion.

interface DotSettings {
  spacing: number; // CSS px, average distance between dots
  dotRadius: number; // CSS px
  drift: number; // CSS px, how far a dot wanders from its home spot
  noiseScale: number; // smaller = bigger groups moving together
  timeScale: number; // how fast the patterns evolve
  glowScale: number; // size of the brightness patches at the start (bigger value = finer patches)
  glowGrowth: number; // added to glowScale every second, so the glow pattern keeps getting finer
  minAlpha: number; // opacity of the dimmest dots
  maxAlpha: number; // opacity of the brightest dots
  color: string; // hex
}

// Tuned by eye.
const SETTINGS: DotSettings = {
  spacing: 18,
  dotRadius: 1,
  drift: 35,
  noiseScale: 0.015,
  timeScale: 0.00055,
  glowScale: 3,
  glowGrowth: 0.1,
  minAlpha: 0.25,
  maxAlpha: 1,
  color: "#ffdcc2",
};

// --- 3D Perlin noise (x, y, time), values roughly in [-1, 1] ---------------------------------
const PERMUTATION = (() => {
  const p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = p.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  return [...p, ...p];
})();

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
const lerp = (a: number, b: number, t: number) => a + t * (b - a);

function gradient(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function perlin(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  const p = PERMUTATION;
  const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
  const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
  return lerp(
    lerp(lerp(gradient(p[AA], x, y, z), gradient(p[BA], x - 1, y, z), u),
      lerp(gradient(p[AB], x, y - 1, z), gradient(p[BB], x - 1, y - 1, z), u), v),
    lerp(lerp(gradient(p[AA + 1], x, y, z - 1), gradient(p[BA + 1], x - 1, y, z - 1), u),
      lerp(gradient(p[AB + 1], x, y - 1, z - 1), gradient(p[BB + 1], x - 1, y - 1, z - 1), u), v),
    w,
  );
}
// ---------------------------------------------------------------------------------------------

interface Dot {
  homeX: number;
  homeY: number;
}

// Scattered but evenly spread: one dot per grid cell at a random spot inside it (no rows, no clumps).
function scatterDots(width: number, height: number, spacing: number): Dot[] {
  const dots: Dot[] = [];
  for (let y = 0; y < height; y += spacing) {
    for (let x = 0; x < width; x += spacing) {
      dots.push({ homeX: x + Math.random() * spacing, homeY: y + Math.random() * spacing });
    }
  }
  return dots;
}

function hexToRgb(hex: string): string {
  const value = parseInt(hex.replace("#", ""), 16);
  return `${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}`;
}

export function DotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots: Dot[] = [];
    let scatteredWith = 0;
    let width = 0;
    let height = 0;
    let frame = 0;
    let startedAt: number | null = null;

    function resize() {
      const ratio = window.devicePixelRatio || 1;
      width = canvas!.clientWidth;
      height = canvas!.clientHeight;
      canvas!.width = width * ratio;
      canvas!.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      scatteredWith = 0; // re-scatter on the next frame
    }

    function draw(time: number) {
      const s = SETTINGS;
      if (scatteredWith !== s.spacing) {
        dots = scatterDots(width, height, s.spacing);
        scatteredWith = s.spacing;
      }
      const rgb = hexToRgb(s.color);
      const t = time * s.timeScale;
      startedAt ??= time;
      // Glow patches start at glowScale and grow linearly with time since the animation began.
      const glowScale = s.glowScale + s.glowGrowth * ((time - startedAt) / 1000);

      context.clearRect(0, 0, width, height);
      for (const { homeX, homeY } of dots) {
        const nx = homeX * s.noiseScale;
        const ny = homeY * s.noiseScale;
        // Separate noise channels (offset in space) for drift x, drift y and glow.
        const x = homeX + perlin(nx, ny, t) * s.drift;
        const y = homeY + perlin(nx + 31.7, ny + 17.3, t) * s.drift;
        const glow = Math.min(1, Math.max(0, 0.5 + perlin(nx * glowScale + 63.1, ny * glowScale, t * 1.4)));
        context.fillStyle = `rgba(${rgb}, ${s.minAlpha + (s.maxAlpha - s.minAlpha) * glow * glow})`;
        context.beginPath();
        context.arc(x, y, s.dotRadius * (0.7 + 0.7 * glow), 0, Math.PI * 2);
        context.fill();
      }
      if (!reduceMotion) frame = requestAnimationFrame(draw);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 size-full" />;
}

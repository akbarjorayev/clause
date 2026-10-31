"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

// Smoothly animates its height to fit whatever is inside, so swapping content (tiles, camera,
// photo) grows or shrinks the area instead of jumping. Pair the content with a key and the
// `enter` class so the new content fades in while the box resizes.
export function AnimatedHeight({ children }: { children: ReactNode }) {
  const inner = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const element = inner.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // The negative margin + padding leaves room so card shadows and focus rings aren't clipped.
  return (
    <div className="auto-height -m-2 overflow-hidden" style={{ height: height === undefined ? undefined : height + 16 }}>
      <div ref={inner} className="p-2">
        {children}
      </div>
    </div>
  );
}

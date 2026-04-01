import { useState, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

function cubicEaseOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Counts up from 0 to `target` over `duration` ms using cubic ease-out.
 * Returns null until the target is first provided, then animates to it.
 * Respects prefers-reduced-motion — skips animation and shows final value immediately.
 * Only ever runs once per component mount (ignores subsequent target changes).
 */
export function useCountUp(target: number | null, duration = 1200): number | null {
  const [count, setCount] = useState<number | null>(null);
  const hasRun = useRef(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (target == null) return;
    if (hasRun.current) return;
    hasRun.current = true;

    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(cubicEaseOut(progress) * target));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [target, duration, prefersReducedMotion]);

  return count;
}

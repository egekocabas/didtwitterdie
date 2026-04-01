import { motion, useReducedMotion } from "framer-motion";
import { useRef, useState, useEffect } from "react";

// One beat cycle is 200 SVG units wide. The path is generated dynamically
// so that each beat stays at its natural width regardless of card/screen width.
const BEAT_WIDTH = 200;

const FLATLINE_D = "M 0,30 L 400,30";

function buildHeartbeatPath(numBeats: number): string {
  let d = "M 0,30";
  for (let i = 0; i < numBeats; i++) {
    const o = i * BEAT_WIDTH;
    d += ` L ${o + 80},30`;   // flat entry
    d += ` L ${o + 88},4`;    // R peak
    d += ` L ${o + 96},52`;   // S dip
    d += ` L ${o + 104},30`;  // back to baseline
    d += ` L ${o + BEAT_WIDTH},30`; // flat exit
  }
  return d;
}

interface EcgLineProps {
  alive: boolean;
}

export default function EcgLine({ alive }: EcgLineProps) {
  const prefersReducedMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [numBeats, setNumBeats] = useState(2);

  useEffect(() => {
    if (!alive) return;
    const el = svgRef.current;
    if (!el) return;
    const update = (width: number) =>
      setNumBeats(Math.max(1, Math.round(width / BEAT_WIDTH)));
    const ro = new ResizeObserver((entries) => { if (entries[0]) update(entries[0].contentRect.width); });
    ro.observe(el);
    update(el.clientWidth);
    return () => ro.disconnect();
  }, [alive]);

  if (!alive) {
    // Flatline: one-shot draw, stays (dead things don't cycle).
    return (
      <svg
        viewBox="0 0 400 60"
        preserveAspectRatio="none"
        className="w-full"
        height={44}
        aria-hidden="true"
      >
        {prefersReducedMotion ? (
          <path d={FLATLINE_D} stroke="#EF4444" strokeWidth={1.5} strokeLinecap="round" fill="none" opacity={0.45} />
        ) : (
          <motion.path
            d={FLATLINE_D}
            stroke="#EF4444"
            strokeWidth={1.5}
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 0 }}
            whileInView={{ pathLength: 1, opacity: 0.45 }}
            viewport={{ once: true }}
            transition={{
              pathLength: { duration: 1.0, delay: 0.5, ease: "easeInOut" },
              opacity: { duration: 0.2, delay: 0.5 },
            }}
          />
        )}
      </svg>
    );
  }

  const heartbeatPath = buildHeartbeatPath(numBeats);
  const viewBoxWidth = numBeats * BEAT_WIDTH;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${viewBoxWidth} 60`}
      preserveAspectRatio="none"
      className="w-full"
      height={44}
      aria-hidden="true"
    >
      {prefersReducedMotion ? (
        <path
          d={heartbeatPath}
          stroke="#1DA1F2"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity={0.55}
        />
      ) : (
        // Loops cleanly: fades out before the snap-back reset so the instant
        // pathLength → 0 is invisible. Duration scales with numBeats so each
        // beat always takes the same time regardless of screen width.
        <motion.path
          key={numBeats}
          d={heartbeatPath}
          stroke="#1DA1F2"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1],
            opacity: [0, 0.55, 0.55, 0],
          }}
          transition={{
            pathLength: {
              duration: numBeats * 1.6,
              times: [0, 0.8, 1],
              ease: ["easeInOut", "easeInOut"],
              repeat: Infinity,
            },
            opacity: {
              duration: numBeats * 1.6,
              times: [0, 0.3, 0.8, 1],
              ease: "easeInOut",
              repeat: Infinity,
            },
          }}
        />
      )}
    </svg>
  );
}

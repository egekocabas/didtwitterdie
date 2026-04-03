import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface HeroBloodArtProps {
  title: string;
}

interface ConnectorGeometry {
  width: number;
  height: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

const MAX_PUDDLE_STAGE = 5;
const INITIAL_DROP_DELAY_MS = 600;
const DROP_TRAVEL_MS = 1300;
const LOOP_PAUSE_MS = 2000;
const PUDDLE_IMPACT_Y = 50 / 90;
const PUDDLE_STAGES = [
  {
    shadowRx: 0,
    shadowRy: 0,
    shadowOpacity: 0,
    baseRx: 0,
    baseRy: 0,
    baseOpacity: 0,
    innerRx: 0,
    innerRy: 0,
    innerOpacity: 0,
    sheenRx: 0,
    sheenRy: 0,
    sheenOpacity: 0,
  },
  {
    shadowRx: 27,
    shadowRy: 5.2,
    shadowOpacity: 0.1,
    baseRx: 27,
    baseRy: 4.7,
    baseOpacity: 0.8,
    innerRx: 18,
    innerRy: 3.6,
    innerOpacity: 0.62,
    sheenRx: 8.5,
    sheenRy: 1.25,
    sheenOpacity: 0.2,
  },
  {
    shadowRx: 47,
    shadowRy: 8.6,
    shadowOpacity: 0.18,
    baseRx: 47,
    baseRy: 7.8,
    baseOpacity: 0.92,
    innerRx: 34,
    innerRy: 5.9,
    innerOpacity: 0.78,
    sheenRx: 15.5,
    sheenRy: 2.15,
    sheenOpacity: 0.3,
  },
  {
    shadowRx: 68,
    shadowRy: 12.1,
    shadowOpacity: 0.21,
    baseRx: 68,
    baseRy: 10.9,
    baseOpacity: 0.95,
    innerRx: 51,
    innerRy: 8.4,
    innerOpacity: 0.83,
    sheenRx: 24,
    sheenRy: 3.1,
    sheenOpacity: 0.35,
  },
  {
    shadowRx: 92,
    shadowRy: 16.4,
    shadowOpacity: 0.24,
    baseRx: 92,
    baseRy: 14.8,
    baseOpacity: 0.97,
    innerRx: 70,
    innerRy: 11.4,
    innerOpacity: 0.87,
    sheenRx: 36,
    sheenRy: 4.5,
    sheenOpacity: 0.39,
  },
  {
    shadowRx: 116,
    shadowRy: 20.6,
    shadowOpacity: 0.25,
    baseRx: 116,
    baseRy: 18.6,
    baseOpacity: 0.99,
    innerRx: 88,
    innerRy: 14.2,
    innerOpacity: 0.9,
    sheenRx: 49,
    sheenRy: 5.8,
    sheenOpacity: 0.43,
  },
] as const;
const FINAL_PUDDLE_STAGE = PUDDLE_STAGES[PUDDLE_STAGES.length - 1]!;

function clampPuddleStage(stage: number): number {
  return Math.min(Math.max(stage, 0), MAX_PUDDLE_STAGE);
}

export default function HeroBloodArt({ title }: HeroBloodArtProps) {
  const prefersReducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const puddleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.45 });
  const [puddleStage, setPuddleStage] = useState(0);
  const [dropKey, setDropKey] = useState(0);
  const [dropVisible, setDropVisible] = useState(false);
  const [rippleKey, setRippleKey] = useState(0);
  const [connectorGeometry, setConnectorGeometry] = useState<ConnectorGeometry | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const logo = logoRef.current;
    const puddle = puddleRef.current;
    if (!container || !logo || !puddle) return;

    const updateGeometry = () => {
      const containerRect = container.getBoundingClientRect();
      const logoRect = logo.getBoundingClientRect();
      const puddleRect = puddle.getBoundingClientRect();

      const startX = logoRect.left - containerRect.left + logoRect.width * ((205 - 110) / 175);
      const startY = logoRect.top - containerRect.top + logoRect.height * ((224 - 160) / 150);
      const endX = puddleRect.left - containerRect.left + puddleRect.width * 0.5;
      const endY = puddleRect.top - containerRect.top + puddleRect.height * PUDDLE_IMPACT_Y;

      setConnectorGeometry((prev) => {
        if (
          prev &&
          Math.abs(prev.width - containerRect.width) < 0.5 &&
          Math.abs(prev.height - containerRect.height) < 0.5 &&
          Math.abs(prev.startX - startX) < 0.5 &&
          Math.abs(prev.startY - startY) < 0.5 &&
          Math.abs(prev.endX - endX) < 0.5 &&
          Math.abs(prev.endY - endY) < 0.5
        ) {
          return prev;
        }

        return {
          width: containerRect.width,
          height: containerRect.height,
          startX,
          startY,
          endX,
          endY,
        };
      });
    };

    const frameId = window.requestAnimationFrame(updateGeometry);
    const observer = new ResizeObserver(() => {
      window.requestAnimationFrame(updateGeometry);
    });

    observer.observe(container);
    observer.observe(logo);
    observer.observe(puddle);

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || !isInView) return;

    let cancelled = false;
    let launchTimer: number | undefined;
    let impactTimer: number | undefined;

    const scheduleDrop = (delay: number) => {
      launchTimer = window.setTimeout(() => {
        if (cancelled) return;

        setDropKey((key) => key + 1);
        setDropVisible(true);

        impactTimer = window.setTimeout(() => {
          if (cancelled) return;

          setDropVisible(false);
          setPuddleStage((stage) => Math.min(MAX_PUDDLE_STAGE, stage + 1));
          setRippleKey((key) => key + 1);
          scheduleDrop(LOOP_PAUSE_MS);
        }, DROP_TRAVEL_MS);
      }, delay);
    };

    scheduleDrop(puddleStage === 0 ? INITIAL_DROP_DELAY_MS : LOOP_PAUSE_MS);

    return () => {
      cancelled = true;
      if (launchTimer) window.clearTimeout(launchTimer);
      if (impactTimer) window.clearTimeout(impactTimer);
      setDropVisible(false);
    };
  }, [isInView, prefersReducedMotion, puddleStage]);

  const settledStage = clampPuddleStage(prefersReducedMotion ? MAX_PUDDLE_STAGE : puddleStage);
  const puddle = PUDDLE_STAGES[settledStage] ?? FINAL_PUDDLE_STAGE;
  const showAnimatedTrail = dropVisible && !prefersReducedMotion && isInView;

  return (
    <div ref={containerRef} className="relative mx-auto flex max-w-3xl flex-col items-center">
      <BloodConnector
        dropKey={dropKey}
        geometry={connectorGeometry}
        showAnimatedTrail={showAnimatedTrail}
      />
      <AnimatedLogo containerRef={logoRef} />

      <div className="relative z-40 mt-3 flex flex-col items-center gap-1.5 sm:gap-2">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1>
        <div ref={puddleRef}>
          <Puddle
            puddle={puddle}
            rippleKey={rippleKey}
            showRipple={!prefersReducedMotion && settledStage > 0 && rippleKey > 0 && isInView}
          />
        </div>
      </div>
    </div>
  );
}

interface AnimatedLogoProps {
  containerRef: RefObject<HTMLDivElement | null>;
}

function AnimatedLogo({ containerRef }: AnimatedLogoProps) {
  return (
    <div ref={containerRef} className="relative z-20 w-36 sm:w-40 md:w-44 lg:w-48" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="110 160 175 150"
        className="h-auto w-full overflow-visible"
      >
        <g transform="translate(200,200) rotate(180) translate(-65,-55)">
          <ellipse cx="68" cy="38" rx="42" ry="28" fill="#4A99E9" opacity="0.93" />
          <circle cx="112" cy="28" r="20" fill="#4A99E9" opacity="0.93" />
          <path d="M 128,22 L 144,28 L 128,32 Z" fill="#3878BE" opacity="0.85" />
          <line
            x1="128"
            y1="27"
            x2="142"
            y2="28"
            stroke="#2C5A8E"
            strokeWidth="0.8"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M 50,28 C 40,18 20,4 2,0 C 8,8 18,18 30,24 C 22,20 10,10 -4,2 C 6,14 20,26 36,30 C 42,32 48,32 50,28 Z"
            fill="#3A7DC8"
            opacity="0.7"
          />
          <path
            d="M 28,44 C 18,52 6,64 -2,76 C 4,68 12,56 22,48"
            fill="none"
            stroke="#4A99E9"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.8"
          />
          <path
            d="M 32,48 C 26,58 18,72 14,82 C 18,72 24,60 32,50"
            fill="none"
            stroke="#4A99E9"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity="0.65"
          />
          <path
            d="M 24,46 C 12,56 0,68 -8,80 C -2,70 8,56 20,46"
            fill="none"
            stroke="#3A7DC8"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.5"
          />
          <circle cx="118" cy="24" r="6" fill="#0D0D0F" opacity="0.9" />
          <line x1="115" y1="21" x2="121" y2="27" stroke="#8AB8E8" strokeWidth="2" strokeLinecap="round" />
          <line x1="121" y1="21" x2="115" y2="27" stroke="#8AB8E8" strokeWidth="2" strokeLinecap="round" />
        </g>

        <ellipse cx="205" cy="219" rx="7" ry="5" fill="#7A1024" opacity="0.9" />
        <ellipse cx="205" cy="219" rx="5" ry="3.5" fill="#9B1B30" opacity="0.9" />
        <ellipse cx="204" cy="218" rx="2.5" ry="1.8" fill="#C41E3A" opacity="0.8" />

        <circle cx="213" cy="224" r="1.2" fill="#9B1B30" opacity="0.45" />
        <circle cx="198" cy="226" r="0.9" fill="#9B1B30" opacity="0.35" />
        <circle cx="211" cy="230" r="0.7" fill="#9B1B30" opacity="0.3" />
      </svg>
    </div>
  );
}

interface BloodConnectorProps {
  dropKey: number;
  geometry: ConnectorGeometry | null;
  showAnimatedTrail: boolean;
}

function BloodConnector({ dropKey, geometry, showAnimatedTrail }: BloodConnectorProps) {
  if (!geometry) return null;

  const launchX = geometry.startX + 1.2;
  const launchY = geometry.startY + 2;
  const collectX = geometry.startX + 1.8;
  const collectY = geometry.startY + 18;
  const midX = geometry.startX + (geometry.endX - geometry.startX) * 0.22;
  const midY = geometry.startY + (geometry.endY - geometry.startY) * 0.5;
  const impactX = geometry.endX;
  const impactY = geometry.endY;
  const strandPath = `M ${geometry.startX},${geometry.startY} C ${geometry.startX + 1.5},${geometry.startY + 6} ${geometry.startX + 2.5},${geometry.startY + 11} ${collectX},${collectY}`;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 overflow-visible"
      aria-hidden="true"
    >
      <svg viewBox={`0 0 ${geometry.width} ${geometry.height}`} className="h-full w-full overflow-visible">
        {showAnimatedTrail && (
          <>
            <motion.path
              key={`strand-${dropKey}`}
              d={strandPath}
              fill="none"
              stroke="#8d1530"
              strokeWidth="1.7"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: [0, 1, 1, 0],
                opacity: [0, 0.8, 0.5, 0],
              }}
              transition={{
                duration: DROP_TRAVEL_MS / 1000,
                times: [0, 0.14, 0.28, 0.38],
                ease: "easeInOut",
              }}
            />

            <motion.ellipse
              key={`blood-drop-${dropKey}`}
              cx={launchX}
              cy={launchY}
              rx="0.9"
              ry="1.2"
              fill="#a91634"
              initial={{ opacity: 0, scale: 0.18 }}
              animate={{
                cx: [launchX, launchX, collectX, midX, impactX, impactX],
                cy: [launchY, launchY + 7, collectY, midY, impactY, impactY + 1],
                opacity: [0, 0.88, 0.98, 0.98, 0.94, 0],
                scale: [0.18, 0.65, 1.28, 1.06, 0.92, 0.72],
                rx: [0.8, 1.6, 3.0, 2.55, 2.15, 1.7],
                ry: [1.0, 2.6, 4.9, 4.15, 3.45, 2.6],
              }}
              transition={{
                duration: DROP_TRAVEL_MS / 1000,
                times: [0, 0.12, 0.28, 0.72, 0.92, 1],
                ease: "easeIn",
              }}
            />

            <motion.ellipse
              key={`blood-drop-highlight-${dropKey}`}
              cx={launchX - 0.15}
              cy={launchY - 0.7}
              rx="0.3"
              ry="0.5"
              fill="#f3a4b3"
              initial={{ opacity: 0, scale: 0.18 }}
              animate={{
                cx: [launchX - 0.15, launchX - 0.15, collectX - 0.25, midX - 0.35, impactX - 0.3, impactX - 0.15],
                cy: [launchY - 0.7, launchY + 5.4, collectY - 1.5, midY - 1.7, impactY - 1.5, impactY - 1.2],
                opacity: [0, 0.18, 0.34, 0.28, 0.2, 0],
                scale: [0.18, 0.58, 1.1, 0.96, 0.82, 0.6],
                rx: [0.22, 0.45, 0.95, 0.8, 0.68, 0.45],
                ry: [0.35, 0.75, 1.7, 1.45, 1.18, 0.75],
              }}
              transition={{
                duration: DROP_TRAVEL_MS / 1000,
                times: [0, 0.12, 0.28, 0.72, 0.92, 1],
                ease: "easeIn",
              }}
            />
          </>
        )}
      </svg>
    </div>
  );
}

interface PuddleProps {
  puddle: (typeof PUDDLE_STAGES)[number];
  rippleKey: number;
  showRipple: boolean;
}

function Puddle({ puddle, rippleKey, showRipple }: PuddleProps) {
  const gradientSeed = useId().replace(/:/g, "");
  const puddleGradientId = `${gradientSeed}-puddle`;
  const innerGradientId = `${gradientSeed}-puddle-inner`;
  const impactCx = 120;
  const impactCy = 50;
  const primaryRippleStartRx = Math.max(puddle.baseRx * 0.12, 7);
  const primaryRippleStartRy = Math.max(puddle.baseRy * 0.14, 1.6);
  const primaryRippleEndRx = Math.max(puddle.baseRx * 0.78, 18);
  const primaryRippleEndRy = Math.max(puddle.baseRy * 0.66, 4);
  const secondaryRippleStartRx = Math.max(puddle.baseRx * 0.2, 10);
  const secondaryRippleStartRy = Math.max(puddle.baseRy * 0.2, 2.2);
  const secondaryRippleEndRx = Math.max(puddle.baseRx * 1.02, 24);
  const secondaryRippleEndRy = Math.max(puddle.baseRy * 0.84, 5.2);
  const showImpactEffects = rippleKey > 1;

  return (
    <svg
      viewBox="0 0 240 90"
      className="pointer-events-none block h-14 w-[15rem] max-w-[82vw] overflow-visible sm:h-16 sm:w-[18rem] md:h-20 md:w-[21rem]"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={puddleGradientId} x1="120" y1="30" x2="120" y2="76" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#981b31" />
          <stop offset="100%" stopColor="#4d0d1b" />
        </linearGradient>
        <linearGradient id={innerGradientId} x1="120" y1="34" x2="120" y2="65" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c6314c" />
          <stop offset="100%" stopColor="#7b1024" stopOpacity="0.92" />
        </linearGradient>
      </defs>

      <g>
        <motion.ellipse
          cx="120"
          cy="62"
          fill="#1c040c"
          animate={{
            rx: puddle.shadowRx,
            ry: puddle.shadowRy,
            opacity: puddle.shadowOpacity,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />

        <motion.ellipse
          cx="120"
          cy="56"
          fill={`url(#${puddleGradientId})`}
          animate={{
            rx: puddle.baseRx,
            ry: puddle.baseRy,
            opacity: puddle.baseOpacity,
          }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />

        <motion.ellipse
          cx="120"
          cy="54"
          fill={`url(#${innerGradientId})`}
          animate={{
            rx: puddle.innerRx,
            ry: puddle.innerRy,
            opacity: puddle.innerOpacity,
          }}
          transition={{ duration: 0.85, ease: "easeOut" }}
        />

        <motion.ellipse
          cx="102"
          cy="50"
          fill="#f2a5b4"
          animate={{
            rx: puddle.sheenRx,
            ry: puddle.sheenRy,
            opacity: puddle.sheenOpacity,
          }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />

        {showRipple && (
          <>
            {showImpactEffects && (
              <motion.ellipse
                key={`impact-flash-${rippleKey}`}
                cx={impactCx}
                cy={impactCy}
                fill="#f5bcc8"
                initial={{ rx: 4, ry: 0.9, opacity: 0 }}
                animate={{
                  rx: [4, 16, 24],
                  ry: [0.9, 2.6, 1.7],
                  opacity: [0, 0.28, 0],
                }}
                transition={{ duration: 0.42, times: [0, 0.35, 1], ease: "easeOut" }}
              />
            )}

            {showImpactEffects && (
              <>
                <motion.ellipse
                  key={`impact-dimple-${rippleKey}`}
                  cx={impactCx}
                  cy={impactCy + 0.4}
                  fill="#6d0f23"
                  initial={{ rx: 1.6, ry: 0.45, opacity: 0 }}
                  animate={{
                    rx: [1.6, 8.5, 5.5],
                    ry: [0.45, 1.7, 0.9],
                    opacity: [0, 0.36, 0],
                  }}
                  transition={{ duration: 0.48, times: [0, 0.42, 1], ease: "easeOut" }}
                />

                <motion.ellipse
                  key={`ripple-primary-${rippleKey}`}
                  cx={impactCx}
                  cy={impactCy}
                  fill="none"
                  stroke="#f1a7b6"
                  strokeWidth="1.15"
                  initial={{
                    rx: primaryRippleStartRx,
                    ry: primaryRippleStartRy,
                    opacity: 0,
                  }}
                  animate={{
                    rx: [primaryRippleStartRx, primaryRippleEndRx],
                    ry: [primaryRippleStartRy, primaryRippleEndRy],
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{ duration: 0.82, times: [0, 0.22, 1], ease: "easeOut" }}
                />

                <motion.ellipse
                  key={`ripple-secondary-${rippleKey}`}
                  cx={impactCx}
                  cy={impactCy}
                  fill="none"
                  stroke="#f6c5cf"
                  strokeWidth="0.9"
                  initial={{
                    rx: secondaryRippleStartRx,
                    ry: secondaryRippleStartRy,
                    opacity: 0,
                  }}
                  animate={{
                    rx: [secondaryRippleStartRx, secondaryRippleEndRx],
                    ry: [secondaryRippleStartRy, secondaryRippleEndRy],
                    opacity: [0, 0, 0.34, 0],
                  }}
                  transition={{ duration: 1.02, times: [0, 0.18, 0.44, 1], ease: "easeOut" }}
                />
              </>
            )}
          </>
        )}
      </g>
    </svg>
  );
}

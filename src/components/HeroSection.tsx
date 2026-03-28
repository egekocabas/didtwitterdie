import { motion } from "framer-motion";
import type { RadarData, TrancoData } from "../types";

interface HeroSectionProps {
  radar: RadarData | null;
  tranco: TrancoData | null;
}

export default function HeroSection({ radar, tranco }: HeroSectionProps) {
  const twitterRank = tranco?.twitter?.at(-1)?.rank ?? null;
  const xRank = tranco?.x?.at(-1)?.rank ?? null;
  const twitterBucket = radar?.twitter?.bucket ?? null;
  const xBucket = radar?.x?.bucket ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6 py-12"
    >
      <img src="/icon.svg" alt="" width="100" height="100" className="mx-auto" />
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
        Did Twitter Die?
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
        Tracking the slow death (or survival) of Twitter since the rebrand to X on July 24, 2023.
      </p>
      <div className="flex justify-center gap-8 sm:gap-16 flex-wrap">
        <div className="space-y-2">
          <p className="text-5xl sm:text-7xl font-bold text-[#1DA1F2]">
            {twitterRank != null ? `#${twitterRank}` : "—"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">twitter.com rank</p>
          {twitterBucket && (
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              DNS: Top {twitterBucket}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <p className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-gray-100">
            {xRank != null ? `#${xRank}` : "—"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">x.com rank</p>
          {xBucket && (
            <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              DNS: Top {xBucket}
            </span>
          )}
        </div>
      </div>
    </motion.section>
  );
}

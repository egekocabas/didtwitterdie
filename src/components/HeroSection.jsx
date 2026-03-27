import { motion } from "framer-motion";

export default function HeroSection({ radar }) {
  const twitterRank = radar?.twitter?.at(-1)?.rank ?? null;
  const xRank = radar?.x?.at(-1)?.rank ?? null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-6 py-12"
    >
      <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
        Did Twitter Die?
      </h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
        Tracking the slow death (or survival) of Twitter since the rebrand to X on July 24, 2023.
      </p>
      <div className="flex justify-center gap-8 sm:gap-16 flex-wrap">
        <div className="space-y-1">
          <p className="text-5xl sm:text-7xl font-bold text-[#1DA1F2]">
            {twitterRank != null ? `#${twitterRank}` : "—"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">twitter.com today</p>
        </div>
        <div className="space-y-1">
          <p className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-gray-100">
            {xRank != null ? `#${xRank}` : "—"}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">x.com today</p>
        </div>
      </div>
    </motion.section>
  );
}

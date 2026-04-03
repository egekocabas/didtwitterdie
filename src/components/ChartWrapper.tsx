import { useId, type ReactNode } from "react";
import { motion } from "framer-motion";

interface ChartWrapperProps {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
}

export default function ChartWrapper({ title, description, children }: ChartWrapperProps) {
  const titleId = useId();

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      role={title ? "region" : undefined}
      aria-labelledby={title ? titleId : undefined}
      className="space-y-4"
    >
      {title && <h2 id={titleId} className="text-2xl font-bold">{title}</h2>}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {children}
    </motion.section>
  );
}

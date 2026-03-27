import { motion } from "framer-motion";

export default function ChartWrapper({ title, description, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {title && <h2 className="text-2xl font-bold">{title}</h2>}
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      )}
      {children}
    </motion.section>
  );
}

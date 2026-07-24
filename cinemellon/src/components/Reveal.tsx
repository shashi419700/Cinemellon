import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
  distance = 28,
  amount = 0.2,
  className,
}: {
  children: ReactNode;
  /** Stagger delay in seconds — handy for a list of siblings revealing in sequence. */
  delay?: number;
  /** How far below its resting position the content starts, in pixels. */
  distance?: number;
  /** Fraction of the element that must enter the viewport before it triggers. */
  amount?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

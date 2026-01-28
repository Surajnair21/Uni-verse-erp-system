"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export default function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { margin: "-80px", once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 18, filter: "blur(10px)" }}
      animate={
        inView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 18, filter: "blur(10px)" }
      }
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

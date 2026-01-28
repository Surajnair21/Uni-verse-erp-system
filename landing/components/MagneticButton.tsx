"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { clsx } from "clsx";
import { useRef } from "react";

export default function MagneticButton({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 240, damping: 18, mass: 0.2 });
  const sy = useSpring(y, { stiffness: 240, damping: 18, mass: 0.2 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    x.set(dx * 0.18);
    y.set(dy * 0.18);
  }

  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={{ x: sx, y: sy }}
      className={clsx(
        "relative inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition will-change-transform",
        "focus:outline-none focus:ring-2 focus:ring-white/20",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState(
    "perspective(900px) rotateX(0deg) rotateY(0deg)"
  );

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;

    const rotY = (px - 0.5) * 8;
    const rotX = (0.5 - py) * 8;

    setTransform(`perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`);
  }

  function onLeave() {
    setTransform("perspective(900px) rotateX(0deg) rotateY(0deg)");
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
      animate={{ transform }}
      className={className}
      style={{ transformStyle: "preserve-3d" }}
    >
      {children}
    </motion.div>
  );
}

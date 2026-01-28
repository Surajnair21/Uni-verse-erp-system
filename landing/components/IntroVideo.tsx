"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function IntroVideo({
  oncePerSession = true,
}: {
  oncePerSession?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Play only once per session
  useEffect(() => {
    if (!mounted || !oncePerSession) return;

    const played = sessionStorage.getItem("universe_intro_played");
    if (played === "1") setShow(false);
  }, [mounted, oncePerSession]);

  // Lock scroll
  useEffect(() => {
    if (!mounted) return;
    document.body.style.overflow = show ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted, show]);

  const finish = () => {
    if (oncePerSession) {
      sessionStorage.setItem("universe_intro_played", "1");
    }
    setShow(false);
  };

  // ⏱ Timeline control
  useEffect(() => {
    if (!mounted || !show) return;

    // start fade after 3s
    const fadeStart = setTimeout(() => {
      setFading(true);
    }, 3000);

    // fully remove after fade completes
    const endIntro = setTimeout(() => {
      finish();
    }, 4800); // 3s wait + 1.8s fade

    return () => {
      clearTimeout(fadeStart);
      clearTimeout(endIntro);
    };
  }, [mounted, show]);

  if (!mounted || !show) return null;

  return createPortal(
    <motion.div
      style={{ zIndex: 2147483647 }}
      className="fixed inset-0 bg-black"
      initial={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
      animate={{
        opacity: fading ? 0 : 1,
        filter: fading ? "blur(14px)" : "blur(0px)",
        scale: fading ? 1.02 : 1,
      }}
      transition={{
        duration: 1.8,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <video
        className="h-full w-full object-cover"
        src="/hero.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={finish}
        onError={() => setTimeout(finish, 1200)}
      />

      {/* Vignette */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(1200px 800px at 50% 50%, transparent 55%, rgba(0,0,0,0.75) 100%)",
        }}
      />

      {/* Skip */}
      <div className="absolute top-6 right-6">
        <button
          onClick={finish}
          className="rounded-full glass px-4 py-2 text-xs text-white/90 hover:bg-white/10 transition"
        >
          Skip
        </button>
      </div>

      {/* Brand */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs text-white/70 glass px-4 py-2 rounded-full">
        UniVerse • AI-enabled Academic OS
      </div>
    </motion.div>,
    document.body
  );
}

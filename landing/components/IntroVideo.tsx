"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function IntroVideo({
  oncePerSession = true,
  fadeAtMs = 4400,
}: {
  oncePerSession?: boolean;
  fadeAtMs?: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(true);

  const fadeTimer = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  // Play only once per session
  useEffect(() => {
    if (!mounted) return;
    if (!oncePerSession) return;

    const played = sessionStorage.getItem("universe_intro_played");
    if (played === "1") setShow(false);
  }, [mounted, oncePerSession]);

  // Lock scroll while intro visible
  useEffect(() => {
    if (!mounted) return;
    if (show) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mounted, show]);

  const finish = () => {
    if (oncePerSession) sessionStorage.setItem("universe_intro_played", "1");
    setShow(false);
  };

  // Start fade near 4s
  useEffect(() => {
    if (!mounted) return;
    if (!show) return;

    fadeTimer.current = window.setTimeout(() => {
      finish();
    }, fadeAtMs);

    return () => {
      if (fadeTimer.current) window.clearTimeout(fadeTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, show, fadeAtMs]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          style={{ zIndex: 2147483647 }}
          className="fixed inset-0 bg-black"
          initial={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(14px)", scale: 1.02 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <video
            className="h-full w-full object-cover"
            src="/hero.mp4"
            autoPlay
            muted
            playsInline
            preload="auto"
            onError={() => setTimeout(finish, 1200)}
            // optional: if user watches longer somehow, still finish when it ends
            onEnded={finish}
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
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

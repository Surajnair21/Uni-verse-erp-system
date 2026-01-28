"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

function roleHome(role?: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "HOD") return "/hod";
  if (role === "FACULTY") return "/faculty";
  return "/student";
}

export default function Home() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/login");
    else router.replace(roleHome(user.role));
  }, [ready, user, router]);

  return null;
}

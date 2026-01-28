"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

type Role = "ADMIN" | "HOD" | "FACULTY" | "STUDENT";

export default function Protected({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!allow.includes(user.role)) {
      router.replace("/login");
    }
  }, [ready, user, allow, router]);

  if (!ready) return null;
  if (!user) return null;
  if (!allow.includes(user.role)) return null;

  return <>{children}</>;
}

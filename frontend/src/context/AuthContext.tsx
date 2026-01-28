"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, clearToken, getToken, getUser, setToken, setUser } from "../lib/api";

type Role = "ADMIN" | "HOD" | "FACULTY" | "STUDENT";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  departmentId?: string | null;
};

type AuthState = {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  ready: boolean;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTok] = useState<string | null>(null);
  const [user, setUsr] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = getToken();
    const u = getUser();
    setTok(t);
    setUsr(u);
    setReady(true);
  }, []);

  async function login(email: string, password: string) {
    const res = await apiFetch<{ token: string; user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setToken(res.token);
    setUser(res.user);
    setTok(res.token);
    setUsr(res.user);
  }

  function logout() {
    clearToken();
    setTok(null);
    setUsr(null);
  }

  const value = useMemo(() => ({ token, user, login, logout, ready }), [token, user, ready]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

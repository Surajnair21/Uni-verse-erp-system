export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("uv_token");
}

export function setToken(token: string) {
  localStorage.setItem("uv_token", token);
}

export function clearToken() {
  localStorage.removeItem("uv_token");
  localStorage.removeItem("uv_user");
}

export function setUser(user: any) {
  localStorage.setItem("uv_user", JSON.stringify(user));
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("uv_user");
  return raw ? JSON.parse(raw) : null;
}

export async function apiFetch<T>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const isFormData = typeof FormData !== 'undefined' && opts.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(opts.headers as Record<string, string> || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
    cache: "no-store",
  });

  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch {}
    throw new Error(msg);
  }

  // 204 No Content / 205 Reset Content have no body — don't call .json()
  if (res.status === 204 || res.status === 205) {
    return null as unknown as T;
  }

  return res.json();
}

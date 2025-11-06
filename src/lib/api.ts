const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const TOKEN_STORAGE_KEY = "auth_jwt";

export function saveAuthToken(token: string) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: "include",
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await res.json() : (await res.text() as any);

  if (!res.ok) {
    const message = (data && (data.message || data.error)) || res.statusText;
    throw new Error(message);
  }

  return data as T;
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) => request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) => request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) => request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) => request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) => request<T>(path, { ...options, method: "DELETE" }),
};



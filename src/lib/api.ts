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

/**
 * Streams LLM response using SSE (Server-Sent Events)
 * @param prompt - The user's prompt
 * @param onDelta - Callback for each text delta (chunk)
 * @param onMeta - Callback for metadata events
 * @param onDone - Callback when stream completes
 * @param onError - Callback for errors
 * @param signal - AbortSignal for cancellation
 * @param timeout - Request timeout in milliseconds (default: 120000)
 */
export async function streamGenerate(
  prompt: string,
  onDelta: (text: string) => void,
  onMeta?: (meta: any) => void,
  onDone?: () => void,
  onError?: (error: Error) => void,
  signal?: AbortSignal,
  timeout: number = 120000
): Promise<void> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  // Create timeout abort controller
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, timeout);

  // Combine signals
  const combinedSignal = signal
    ? (() => {
        const controller = new AbortController();
        signal.addEventListener("abort", () => controller.abort());
        timeoutController.signal.addEventListener("abort", () => controller.abort());
        return controller.signal;
      })()
    : timeoutController.signal;

  try {
    const response = await fetch(`${BASE_URL}/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify({ prompt }),
      signal: combinedSignal,
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        // Process remaining buffer
        if (buffer.trim()) {
          processBuffer(buffer, onDelta, onMeta);
        }
        clearTimeout(timeoutId);
        onDone?.();
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || ""; // Keep incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonStr = line.slice(6); // Remove "data: " prefix
          try {
            const data = JSON.parse(jsonStr);
            processEvent(data, onDelta, onMeta);
          } catch (e) {
            console.warn("Failed to parse SSE data:", jsonStr, e);
          }
        }
      }
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      const abortError = new Error("Запрос прерван");
      abortError.name = "AbortError";
      onError?.(abortError);
    } else {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
    throw error;
  }
}

function processEvent(
  data: any,
  onDelta: (text: string) => void,
  onMeta?: (meta: any) => void
) {
  if (data.type === "delta" && data.text) {
    onDelta(data.text);
  } else if (data.type === "meta" && onMeta) {
    onMeta(data);
  }
}

function processBuffer(
  buffer: string,
  onDelta: (text: string) => void,
  onMeta?: (meta: any) => void
) {
  const lines = buffer.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      const jsonStr = line.slice(6);
      try {
        const data = JSON.parse(jsonStr);
        processEvent(data, onDelta, onMeta);
      } catch (e) {
        // Ignore parse errors for incomplete data
      }
    }
  }
}



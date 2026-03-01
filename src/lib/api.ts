const AUTH_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  signal?: AbortSignal;
}

const normalizePath = (path: string) => (path.startsWith("/") ? path : `/${path}`);

const parseResponse = async (response: Response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  return text || null;
};

import { DISABLE_BACKEND } from "@/config/dev";

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  // В режиме без бэкенда возвращаем пустые ответы для GET и успешные для POST
  if (DISABLE_BACKEND) {
    if (options.method === "GET") {
      return {} as T;
    }
    // Для POST/PUT/PATCH возвращаем успешный ответ
    return {} as T;
  }

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const fullUrl = `${AUTH_BASE_URL}${normalizePath(path)}`;

  try {
    const response = await fetch(fullUrl, {
      method: options.method || "GET",
      headers,
      body:
        options.body === undefined || isFormData
          ? options.body
          : JSON.stringify(options.body),
      signal: options.signal,
      credentials: "include",
    });

    const data = await parseResponse(response);

    if (!response.ok) {
      const message =
        (data && typeof data === "object" && "detail" in data && (data as any).detail) ||
        (data && typeof data === "object" && "message" in data && (data as any).message) ||
        (typeof data === "string" && data) ||
        response.statusText;

      throw new ApiError(String(message || "Request failed"), response.status, data);
    }

    return data as T;
  } catch (error) {
    // Если это ошибка сети и бэкенд отключен, просто возвращаем пустой ответ
    if (DISABLE_BACKEND && error instanceof TypeError) {
      return {} as T;
    }
    // Улучшенная обработка сетевых ошибок
    if (error instanceof TypeError) {
      if (error.message.includes("fetch") || error.message.includes("Failed to fetch")) {
        const corsHint = error.message.includes("CORS") 
          ? " Возможно, проблема с настройками CORS на сервере."
          : "";
        throw new ApiError(
          `Не удалось подключиться к серверу ${AUTH_BASE_URL}.${corsHint} Проверьте интернет-соединение и настройки сервера.`,
          0,
          { originalError: error.message, url: fullUrl }
        );
      }
    }
    throw error;
  }
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PUT", body }),
  patch: <T>(path: string, body?: any, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, { ...options, method: "DELETE" }),
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
  timeout: number = 600000
): Promise<void> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Accept": "text/event-stream",
  };

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
    const response = await fetch(`${AUTH_BASE_URL}/chat/stream`, {
      method: "POST",
      headers,
      body: JSON.stringify({ message: prompt }),
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
    
    // Проверяем, был ли запрос прерван через AbortSignal
    if (error.name === "AbortError" || error.message?.includes("aborted")) {
      // Это ожидаемое прерывание (пользователь отменил, вкладка скрыта, компонент размонтирован)
      // Не логируем как ошибку, просто вызываем onError с информативным сообщением
      const abortError = new Error("Запрос прерван");
      abortError.name = "AbortError";
      onError?.(abortError);
      // Не пробрасываем ошибку дальше, так как это ожидаемое поведение
      return;
    } else {
      // Это реальная ошибка - логируем и пробрасываем
      onError?.(error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }
}

export async function stopGeneration() {
  return api.post("/chat/stop");
}

export async function changePassword(data: any) {
  return api.put("/users/change-password", data);
}

export async function resetPasswordRequest(email: string) {
  return api.post("/auth/send-password-reset-code", { email });
}

export async function resetPasswordConfirm(data: any) {
  return api.post("/auth/reset-password", data);
}

function processEvent(
  data: any,
  onDelta: (text: string) => void,
  onMeta?: (meta: any) => void
) {
  switch (data.type) {
    case "start":
      onMeta?.({ type: "start", message_id: data.message_id });
      break;
    case "chunk":
      if (data.text) {
        onDelta(data.text);
      }
      break;
    case "end":
      onMeta?.({ type: "end", full_response: data.full_response });
      break;
    case "error":
      throw new Error(data.message || "Unknown stream error");
    case "cancelled":
      onMeta?.({ type: "cancelled" });
      break;
    default:
      break;
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

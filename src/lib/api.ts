// Базовый URL API - можно переопределить через переменную окружения VITE_API_URL
const AUTH_BASE_URL = import.meta.env.VITE_API_URL || "http://194.67.99.120:8000";

// Маппинг английских сообщений от FastAPI → русские
const ERROR_TRANSLATIONS: Record<string, string> = {
  // Валидация полей
  "field required": "Поле обязательно для заполнения",
  "value is not a valid email": "Некорректный адрес электронной почты",
  "value is not a valid string": "Некорректное значение",
  "ensure this value has at least 12 characters": "Пароль должен содержать минимум 12 символов",
  "ensure this value has at least 8 characters": "Пароль должен содержать минимум 8 символов",
  "ensure this value has at least 2 characters": "Значение должно содержать минимум 2 символа",
  "ensure this value has at most 50 characters": "Значение не должно превышать 50 символов",
  "ensure this value has at most 128 characters": "Значение не должно превышать 128 символов",
  "ensure this value is greater than or equal to 1": "Значение должно быть не менее 1",
  "ensure this value is less than or equal to 11": "Значение должно быть не более 11",
  "string does not match regex": "Некорректный формат",
  "value is not a valid integer": "Должно быть числом",
  // Авторизация
  "invalid credentials": "Неверный email или пароль",
  "incorrect email or password": "Неверный email или пароль",
  "unauthorized": "Необходима авторизация",
  "not authenticated": "Необходима авторизация",
  "could not validate credentials": "Ошибка проверки данных",
  // Пользователи
  "user already exists": "Пользователь с таким email уже существует",
  "email already registered": "Этот email уже зарегистрирован",
  "user not found": "Пользователь не найден",
  "email not found": "Email не найден",
  // Коды подтверждения
  "invalid code": "Неверный код подтверждения",
  "code expired": "Срок действия кода истёк",
  "invalid or expired code": "Неверный или просроченный код",
  "code not found": "Код не найден",
  // HTTP статусы
  "not found": "Ресурс не найден",
  "internal server error": "Ошибка сервера. Попробуйте позже",
  "bad request": "Некорректный запрос",
  "forbidden": "Доступ запрещён",
};

function translateError(message: string): string {
  const lower = message.toLowerCase().trim();
  // Точное совпадение
  if (ERROR_TRANSLATIONS[lower]) return ERROR_TRANSLATIONS[lower];
  // Частичное совпадение
  for (const [key, value] of Object.entries(ERROR_TRANSLATIONS)) {
    if (lower.includes(key)) return value;
  }
  return message;
}

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
      let message: string = response.statusText || "Request failed";

      if (data && typeof data === "object") {
        const detail = (data as any).detail;

        if (Array.isArray(detail)) {
          // FastAPI validation errors: [{loc: [...], msg: "...", type: "..."}]
          message = detail
            .map((err: any) => translateError(err.msg || err.message || JSON.stringify(err)))
            .join("; ");
        } else if (typeof detail === "string") {
          message = translateError(detail);
        } else if (typeof (data as any).message === "string") {
          message = translateError((data as any).message);
        }
      } else if (typeof data === "string" && data) {
        message = translateError(data);
      } else {
        message = translateError(message);
      }

      throw new ApiError(message, response.status, data);
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

// TODO: Эндпоинт /users/change-password НЕ СУЩЕСТВУЕТ в текущем API бэкенда!
// Когда бэкенд добавит этот эндпоинт, убрать этот комментарий.
// Ожидаемый формат: { email, current_password, new_password }
export async function changePassword(data: any) {
  return api.put("/users/change-password", data);
}

export async function resetPasswordRequest(email: string) {
  return api.post("/auth/send-password-reset-code", { email });
}

export async function resetPasswordConfirm(data: any) {
  return api.post("/auth/reset-password", data);
}

/**
 * Получить историю чата текущего пользователя
 * GET /chat/history
 */
export async function getChatHistory() {
  return api.get("/chat/history");
}

/**
 * Получить список активных стримов пользователя
 * GET /chat/active
 */
export async function getActiveStreams() {
  return api.get("/chat/active");
}

/**
 * Очистить все чаты пользователя
 * DELETE /chat/cleanup
 */
export async function cleanupChats() {
  return api.delete("/chat/cleanup");
}

/**
 * Удалить аккаунт пользователя
 * POST /auth/delete
 * @param password - текущий пароль для подтверждения
 */
export async function deleteAccount(password: string) {
  return api.post("/auth/delete", { password });
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

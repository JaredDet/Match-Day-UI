export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface HttpClient {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  ensureCsrf(): Promise<void>;
}

interface ApiErrorPayload {
  code?: string;
  message?: string;
  detail?: string;
  errors?: Record<string, string[] | string>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
    readonly fields?: Record<string, string[] | string>,
  ) {
    super(message);
  }
}

function cookie(name: string) {
  if (import.meta.server) return undefined;
  const prefix = `${encodeURIComponent(name)}=`;
  return document.cookie
    .split(";")
    .map((value) => value.trim())
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length);
}

export function createHttpClient(baseUrl: string): HttpClient {
  const base = baseUrl.replace(/\/$/, "");

  async function execute<T>(path: string, options: RequestOptions = {}) {
    const method = options.method ?? "GET";
    const headers = { ...options.headers };
    const csrf = cookie("csrftoken");
    if (csrf && !["GET"].includes(method)) headers["X-CSRFToken"] = decodeURIComponent(csrf);

    try {
      return await $fetch<T>(`${base}/${path.replace(/^\//, "")}`, {
        method,
        query: options.query,
        body: options.body as never,
        headers,
        signal: options.signal,
        credentials: "include",
      });
    } catch (error) {
      const failure = error as {
        status?: number;
        statusCode?: number;
        data?: ApiErrorPayload;
        message?: string;
      };
      const payload = failure.data;
      throw new ApiError(
        payload?.message ?? payload?.detail ?? "No se pudo completar la solicitud.",
        failure.statusCode ?? failure.status ?? 0,
        payload?.code,
        payload?.errors,
      );
    }
  }

  return {
    request: execute,
    async ensureCsrf() {
      if (cookie("csrftoken")) return;
      await execute("recommendations/");
    },
  };
}

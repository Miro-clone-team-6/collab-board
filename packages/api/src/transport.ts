export interface RequestConfig {
  url: string;
  method: string;
  params?: Record<string, unknown>;
  data?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export async function customInstance<TResponse>(
  configOrUrl: string | RequestConfig,
  options?: RequestInit & { params?: Record<string, unknown> },
): Promise<TResponse> {
  let url = "";
  let method: string | undefined;
  let params: Record<string, unknown> | undefined;
  let data: unknown;
  let headers: HeadersInit | undefined;
  let signal: AbortSignal | undefined;
  let restOptions: RequestInit = {};

  if (typeof configOrUrl === "string") {
    url = configOrUrl;
    params = options?.params;
    method = options?.method;
    headers = options?.headers;
    signal = options?.signal ?? undefined;
    restOptions = options || {};
  } else {
    url = configOrUrl.url;
    method = configOrUrl.method;
    params = { ...configOrUrl.params, ...options?.params };
    data = configOrUrl.data;
    headers = {
      ...(configOrUrl.headers as Record<string, string>),
      ...(options?.headers as Record<string, string>),
    };
    signal = configOrUrl.signal ?? options?.signal ?? undefined;
    const {
      url: _u,
      method: _m,
      params: _p,
      data: _d,
      headers: _h,
      signal: _s,
      ...rest
    } = configOrUrl as RequestConfig & RequestInit;
    restOptions = { ...rest, ...options };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  let targetUrl = `${baseUrl.replace(/\/+$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;

  if (params) {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }
    const qs = searchParams.toString();
    if (qs) targetUrl += `?${qs}`;
  }

  const fetchHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  const fetchInit: RequestInit = {
    ...restOptions,
    method: method || restOptions.method || "GET",
    credentials: "include",
    headers: fetchHeaders,
    signal,
  };

  if (data !== undefined && fetchInit.method !== "GET" && fetchInit.method !== "HEAD") {
    fetchInit.body = typeof data === "string" ? data : JSON.stringify(data);
  }

  const response = await fetch(targetUrl, fetchInit);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { message?: string })?.message || `HTTP error ${response.status}`,
    );
  }

  return response.json() as Promise<TResponse>;
}

import { type HealthResponse, HealthResponseSchema } from "@packages/contracts";

export async function getHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch("/api/v1/health", { signal: signal ?? null });

  if (!response.ok) {
    throw new Error(`Health check failed: HTTP ${response.status}`);
  }

  return HealthResponseSchema.parse(await response.json());
}

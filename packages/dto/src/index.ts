import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
  database: z.enum(["connected", "disconnected"]),
});

export type HealthResponseDto = z.infer<typeof HealthResponseSchema>;

export const CreateUserSchema = z.object({
  email: z.email(),
  name: z.string().min(2),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

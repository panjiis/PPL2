import { z } from "zod";

export const RoleSchema = z.object({
    id: z.number(),
    role_name: z.string(),
    access_level: z.number(),
    permissions: z.string().optional(),
    created_at: z.object({ seconds: z.number() }),
    updated_at: z.object({ seconds: z.number() }),
});

export type Role = z.infer<typeof RoleSchema>;

export const RolesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(RoleSchema),
  meta: z
    .object({
      total_count: z.number(),
    })
    .optional(),
});

export type RolesResponse = z.infer<typeof RolesResponseSchema>;

export const RoleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: RoleSchema,
});

export type RoleResponse = z.infer<typeof RoleResponseSchema>;

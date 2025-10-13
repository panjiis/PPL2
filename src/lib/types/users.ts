import { z } from "zod";

export const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  password: z.string().optional(),
  firstname: z.string(),
  lastname: z.string(),
  role_id: z.number(),
  is_active: z.boolean(),
  created_at: z.object({
    seconds: z.number(),
    nanos: z.number(),
  }),
  updated_at: z.object({
    seconds: z.number(),
    nanos: z.number(),
  }),
  last_login: z
    .object({
      seconds: z.number(),
      nanos: z.number(),
    })
    .optional(),
  role: z
    .object({
      id: z.number(),
      role_name: z.string(),
      access_level: z.number(),
      created_at: z.object({ seconds: z.number() }),
      updated_at: z.object({ seconds: z.number() }),
    })
    .optional(),
});

export const UsersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(UserSchema),
  meta: z
  .object({
    total_count: z.number(),
  })
  .optional(),
});

export const UserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: UserSchema,
});

export type User = z.infer<typeof UserSchema>;
export type UserResponse = z.infer<typeof UserResponseSchema>;
export type UsersResponse = z.infer<typeof UsersResponseSchema>;
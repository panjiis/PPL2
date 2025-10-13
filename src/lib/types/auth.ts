import { z } from "zod";
import { UserSchema, User } from "./users";

export const LoginResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    expires_at: z
      .object({
        seconds: z.number(),
        nanos: z.number(),
      })
      .optional(),
    token: z.string().optional(),
    user: UserSchema,
  }),
});

export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export type Session = {
  token: string;
  user: User;
  expiresAt: number;
};

export type PublicSession = {
  user: User;
  expiresAt: number;
};

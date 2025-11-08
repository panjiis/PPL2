// === Auth ===

import { LoginResponseSchema, LoginResponse, Session } from "@/lib/types/auth";
import { BASE_URL } from "../config";

export async function login(username: string, password: string): Promise<Session> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const raw = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Response is not valid JSON");
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : "Login failed";
    throw new Error(message);
  }

  const validated = LoginResponseSchema.parse(parsed) as LoginResponse;

  if (!validated.data.token) {
    throw new Error("Login response missing token");
  }

  const expiresAt = validated.data.expires_at
    ? validated.data.expires_at.seconds * 1000
    : Date.now() + 60 * 60 * 1000;

  return {
    token: validated.data.token,
    user: validated.data.user,
    expiresAt,
  };
}
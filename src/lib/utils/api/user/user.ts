// === Users ===

import { User, UsersResponse, UserResponse } from "@/lib/types/user/users";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchUsers(token: string): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<UsersResponse>(res);
  return json.data;
}

export async function fetchUserById(token: string, id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<UserResponse>(res);
  return json.data;
}

export async function createUser(token: string, user: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const json = await handleResponse<UserResponse>(res);
  return json.data;
}

export async function updateUserById(token: string, id: number, payload: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<UserResponse>(res);
  return json.data;
}
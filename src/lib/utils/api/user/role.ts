// === Roles ===

import { Role, RolesResponse, RoleResponse } from "@/lib/types/user/roles";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchRoles(token: string): Promise<Role[]> {
  const res = await fetch(`${BASE_URL}/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<RolesResponse>(res);
  return json.data;
}

export async function fetchRoleById(token: string, role_id: number): Promise<Role> {
  const res = await fetch(`${BASE_URL}/roles/${role_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await handleResponse<RoleResponse>(res);
  return json.data;
}

export async function createRole(token: string, role: Partial<Role>): Promise<Role> {
  const res = await fetch(`${BASE_URL}/roles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });
  const json = await handleResponse<RoleResponse>(res);
  return json.data;
}

export async function updateRoleById(token: string, role_id: number, role: Partial<Role>): Promise<Role> {
  const res = await fetch(`${BASE_URL}/roles/${role_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });
  const json = await handleResponse<RoleResponse>(res);
  return json.data;
}
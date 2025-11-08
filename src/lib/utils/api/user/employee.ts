// === Employees ===

import { Employee, EmployeesResponse, EmployeeResponse } from "@/lib/types/user/employees";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchEmployees(token: string): Promise<Employee[]> {
  const res = await fetch(`${BASE_URL}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<EmployeesResponse>(res);
  return json.data;
}

export async function fetchEmployeeById(token: string, id: number): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<EmployeeResponse>(res);
  return json.data;
}

export async function createEmployee(token: string, payload: Omit<Employee, "id">): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<EmployeeResponse>(res);
  return json.data;
}

export async function updateEmployee(
  token: string,
  id: number,
  payload: Partial<Employee>
): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<EmployeeResponse>(res);
  return json.data;
}
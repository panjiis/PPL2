// === Warehouses ===

import { Warehouse, WarehousesResponse, WarehouseResponse } from "@/lib/types/inventory/warehouses";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchWarehouses(token: string): Promise<Warehouse[]> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<WarehousesResponse>(res);
  return json.data;
}

export async function fetchWarehouseByCode(token: string, warehouse_code: string): Promise<Warehouse> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses/${warehouse_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<WarehouseResponse>(res);
  return json.data;
}

export async function createWarehouse(token: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouse),
  });
  const json = await handleResponse<WarehouseResponse>(res);
  return json.data;
}

export async function updateWarehouseByCode(token: string, warehouse_code: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses/${warehouse_code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouse),
  });
  const json = await handleResponse<WarehouseResponse>(res);
  return json.data;
}
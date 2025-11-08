// === Suppliers ===

import { Supplier, SuppliersResponse, SupplierResponse } from "@/lib/types/inventory/suppliers";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchSuppliers(token: string): Promise<Supplier[]> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<SuppliersResponse>(res);
  return json.data;
}

export async function fetchSupplierById(token: string, supplier_id: number): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function fetchSupplierByCode(token: string, supplier_code: string): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function createSupplier(token: string, supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function updateSupplierById(token: string, supplier_id: number, supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function updateSupplierByCode(token: string, supplier_code: string, supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}
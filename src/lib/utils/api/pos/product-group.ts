// === Product Groups (POS) ===

import { POSProductGroup, POSProductGroupsResponse, POSProductGroupResponse } from "@/lib/types/pos/product-groups";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchPOSProductGroups(token: string): Promise<POSProductGroup[]> {
  const res = await fetch(`${BASE_URL}/pos/product-groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductGroupsResponse>(res);
  return json.data;
}

export async function fetchPOSProductGroupByCode(token: string, product_code: string): Promise<POSProductGroup> {
  const res = await fetch(`${BASE_URL}/pos/product-groups/${product_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductGroupResponse>(res);
  return json.data;
}

export async function createPOSProductGroup(token: string, product: Partial<POSProductGroup>): Promise<POSProductGroup> {
  const res = await fetch(`${BASE_URL}/pos/product-groups`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductGroupResponse>(res);
  return json.data;
}

export async function updatePOSProductGroupById(token: string, id: number, product: Partial<POSProductGroup>): Promise<POSProductGroup> {
  const res = await fetch(`${BASE_URL}/pos/product-groups/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductGroupResponse>(res);
  return json.data;
}
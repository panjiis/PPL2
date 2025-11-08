// === Discounts ===

import { Discount, DiscountsResponse, DiscountResponse, DiscountRequest } from "@/lib/types/pos/discounts";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchDiscounts(token: string): Promise<Discount[]> {
  const res = await fetch(`${BASE_URL}/pos/discounts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<DiscountsResponse>(res);
  return json.data;
}

export async function fetchDiscountById(token: string, id: number): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}

export async function createDiscount(token: string, discount: DiscountRequest): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(discount),
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}

export async function updateDiscountById(token: string, id: number, discount: DiscountRequest): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(discount),
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}

export async function deleteDiscountById(token: string, id: number): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}
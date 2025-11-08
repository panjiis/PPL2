// === Product (POS) ===

import { POSProduct, POSProductsResponse, POSProductResponse } from "@/lib/types/pos/products";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchPOSProducts(token: string): Promise<POSProduct[]> {
  const res = await fetch(`${BASE_URL}/pos/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductsResponse>(res);
  return json.data;
}

export async function fetchPOSProductByCode(token: string, product_code: string): Promise<POSProduct> {
  const res = await fetch(`${BASE_URL}/pos/products/${product_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductResponse>(res);
  return json.data;
}

export async function createPOSProduct(token: string, product: Partial<POSProduct>): Promise<POSProduct> {
  const res = await fetch(`${BASE_URL}/pos/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductResponse>(res);
  return json.data;
}

export async function updatePOSProductByCode(token: string, code: string, product: Partial<POSProduct>): Promise<POSProduct> {
  const res = await fetch(`${BASE_URL}/pos/products/${code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductResponse>(res);
  return json.data;
}
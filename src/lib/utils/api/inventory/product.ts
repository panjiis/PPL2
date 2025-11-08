// === Product ===

import { Product, ProductsResponse, ProductResponse } from "@/lib/types/inventory/products";
import { handleResponse } from "../utils";
import { BASE_URL } from "../config";

export async function fetchProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/inventory/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductsResponse>(res);
  return json.data;
}

export async function fetchProductByCode(token: string, product_code: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${product_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductResponse>(res);
  return json.data;
}

export async function createProduct(token: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<ProductResponse>(res);
  return json.data;
}
// DEPRECATED
// export async function updateProductById(token: string, id: number, product: Partial<Product>): Promise<Product> {
//   const res = await fetch(`${BASE_URL}/inventory/products/${id}`, {
//     method: "PUT",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(product),
//   });
//   const json = await handleResponse<ProductResponse>(res);
//   return json.data;
// }

export async function updateProductByCode(token: string, product_code: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${product_code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<ProductResponse>(res);
  return json.data;
}
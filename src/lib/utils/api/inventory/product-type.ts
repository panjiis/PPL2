// === Product Type ===

import { ProductType, ProductTypesResponse, ProductTypeResponse } from "@/lib/types/inventory/product-types";
import { Product, ProductsResponse } from "@/lib/types/inventory/products";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchProductTypes(token: string): Promise<ProductType[]> {
  const res = await fetch(`${BASE_URL}/inventory/product-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductTypesResponse>(res);
  return json.data;
}

// export async function fetchProductTypeById(token: string, product_type_id: number): Promise<ProductType> {
//   const res = await fetch(`${BASE_URL}/inventory/product-types/${product_type_id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   const json = await handleResponse<ProductTypeResponse>(res);
//   return json.data;
// }

export async function fetchProductsByProductTypeId(token: string, product_type_id: number): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/inventory/product-types/${product_type_id}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductsResponse>(res);
  return json.data;
}

export async function fetchProductTypeByCode(token: string, product_type_code: string): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/inventory/product-types/code/${product_type_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductTypeResponse>(res);
  return json.data;
}

export async function createProductType(token: string, product_type: Partial<ProductType>): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/inventory/product-types`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product_type),
  });
  const json = await handleResponse<ProductTypeResponse>(res);
  return json.data;
}

export async function updateProductTypeById(token: string, product_type_id: number, product_type: Partial<ProductType>): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/inventory/product-types/${product_type_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product_type),
  });
  const json = await handleResponse<ProductTypeResponse>(res);
  return json.data;
}
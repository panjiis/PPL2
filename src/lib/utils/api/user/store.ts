import { CreateStoreRequest, StoreResponse, StoreResponseWrapperSchema, StoresResponseWrapperSchema, UpdateStoreRequest } from "@/lib/types/user/store";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function createStore(
  token: string,
  payload: CreateStoreRequest
): Promise<StoreResponse> {
  const res = await fetch(`${BASE_URL}/store`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await handleResponse(res);
  return StoreResponseWrapperSchema.parse(json).data;
}

export async function updateStore(
  token: string,
  storeId: number,
  payload: UpdateStoreRequest
): Promise<StoreResponse> {
  const res = await fetch(`${BASE_URL}/store/${storeId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await handleResponse(res);
  return StoreResponseWrapperSchema.parse(json).data;
}

export async function fetchStoreById(
  token: string,
  storeId: number
): Promise<StoreResponse> {
  const res = await fetch(`${BASE_URL}/store/${storeId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const json = await handleResponse(res);
  return StoreResponseWrapperSchema.parse(json).data;
}

export async function fetchStores(): Promise<StoreResponse[]> {
  const res = await fetch(`${BASE_URL}/store`);
  const json = await handleResponse(res);
  return StoresResponseWrapperSchema.parse(json).data;
}
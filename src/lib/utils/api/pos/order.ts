// === Orders ===

import { Order, OrderResponse, OrdersResponse } from "@/lib/types/pos/orders";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/pos/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<OrdersResponse>(res);
  return json.data;
}

export async function fetchOrderByID(token: string, id: number): Promise<Order> {
  const res = await fetch(`${BASE_URL}/pos/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<OrderResponse>(res);
  return json.data;
}
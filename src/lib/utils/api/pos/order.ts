// === Orders ===

import { Order, OrdersResponse } from "@/lib/types/pos/orders";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/pos/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<OrdersResponse>(res);
  return json.data;
}
// === Payment Types ===

import { PaymentType, PaymentTypesResponse, PaymentTypeResponse } from "@/lib/types/pos/payment-types";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

export async function fetchPaymentTypes(token: string): Promise<PaymentType[]> {
  const res = await fetch(`${BASE_URL}/pos/payment-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<PaymentTypesResponse>(res);
  return json.data;
}

export async function createPaymentType(token: string, payment_type: Partial<PaymentType>): Promise<PaymentType> {
  const res = await fetch(`${BASE_URL}/pos/payment-types`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment_type),
  });
  const json = await handleResponse<PaymentTypeResponse>(res);
  return json.data;
}

export async function updatePaymentTypeById(token: string, id: number, payment_type: Partial<PaymentType>): Promise<PaymentType> {
  const res = await fetch(`${BASE_URL}/pos/payment-types/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment_type),
  });
  const json = await handleResponse<PaymentTypeResponse>(res);
  return json.data;
}
// === Commission ===

import {
  CommissionCalculation,
  CommissionCalculationsResponse,
  CommissionCalculationResponse,
} from "@/lib/types/commission/commissions";
import { handleResponse } from "../utils";
import { BASE_URL } from "../config";

// Fetch all commission calculations
export async function fetchCommissions(token: string): Promise<CommissionCalculation[]> {
  const res = await fetch(`${BASE_URL}/commissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<CommissionCalculationsResponse>(res);
  return json.data;
}

// Create a new commission calculation
export async function calculateCommission(token: string, payload: object): Promise<CommissionCalculation> {
  const res = await fetch(`${BASE_URL}/commissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<CommissionCalculationResponse>(res);
  return json.data;
}

// Recalculate a specific commission
export async function recalculateCommission(
  token: string,
  id: number,
  payload: { recalculated_by: number; notes: string }
) {
  const res = await fetch(`${BASE_URL}/commissions/${id}/recalculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const json = await handleResponse<CommissionCalculationResponse>(res);
  return json.data;
}

// Approve a commission calculation
export async function approveCommission(token: string, id: number, payload: object): Promise<CommissionCalculation> {
  const res = await fetch(`${BASE_URL}/commissions/${id}/approve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<CommissionCalculationResponse>(res);
  return json.data;
}

// Reject a commission calculation
export async function rejectCommission(token: string, id: number, payload: object): Promise<CommissionCalculation> {
  const res = await fetch(`${BASE_URL}/commissions/${id}/reject`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<CommissionCalculationResponse>(res);
  return json.data;
}

// Bulk calculate commissions by month or payload criteria
export async function bulkCalculateCommissions(
  token: string,
  payload: Record<string, unknown>
): Promise<CommissionCalculation[]> {
  const res = await fetch(`${BASE_URL}/commissions/bulk-calculate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<CommissionCalculationsResponse>(res);
  return json.data;
}

interface BulkApprovePayload {
  commission_calculation_ids: number[];
  approved_by: number;
  approval_notes: string;
}

// Bulk approve multiple commissions
export async function bulkApproveCommissions(
  token: string,
  payload: BulkApprovePayload
): Promise<CommissionCalculation[]> {
  const res = await fetch(`${BASE_URL}/commissions/bulk-approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<CommissionCalculationsResponse>(res);
  return json.data;
}
// Pay a commission
export async function payCommission(token: string, id: number, payload: object): Promise<CommissionCalculation> {
  const res = await fetch(`${BASE_URL}/commissions/${id}/pay`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<CommissionCalculationResponse>(res);
  return json.data;
}

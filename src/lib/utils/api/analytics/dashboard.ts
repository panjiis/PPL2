// === Dashboard ===

import { DashboardResponseSchema, type DashboardResponse } from "@/lib/types/analytics/dashboard";
import { handleResponse } from "../utils";
import { BASE_URL } from "../config";

export async function fetchDashboard(token: string): Promise<DashboardResponse> {
  const currentDate = new Date().toISOString().split("T")[0];
  const res = await fetch(`${BASE_URL}/analytics/dashboard?date=2025-11-12`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await handleResponse<DashboardResponse>(res);
  return DashboardResponseSchema.parse(json);
}
// === Customer ===

import {
  PeakHoursResponseSchema,
  type PeakHoursResponse,
} from "@/lib/types/analytics/customer";
import { handleResponse } from "../utils";
import { BASE_URL } from "../config";

export async function fetchPeakHours(
  token: string
): Promise<PeakHoursResponse> {
  const res = await fetch(`${BASE_URL}/analytics/customers/peak-hours`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const json = await handleResponse<PeakHoursResponse>(res);
  return PeakHoursResponseSchema.parse(json);
}

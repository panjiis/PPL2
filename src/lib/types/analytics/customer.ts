import { z } from "zod";

export const HourlyRevenueSchema = z.object({
  hour: z.string(), // "08:00"
  total_revenue: z.string(), // "123456.00"
  transaction_count: z.number().optional(), // "123456.00"
});

export const PeakHoursDaySchema = z.object({
  day_of_week: z.number(), // "Monday"
  hourly_data: z.array(HourlyRevenueSchema).default([]),
});

export const PeakHoursResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(PeakHoursDaySchema).default([]),
});

export type HourlyRevenue = z.infer<typeof HourlyRevenueSchema>;
export type PeakHoursDay = z.infer<typeof PeakHoursDaySchema>;
export type PeakHoursResponse = z.infer<typeof PeakHoursResponseSchema>;

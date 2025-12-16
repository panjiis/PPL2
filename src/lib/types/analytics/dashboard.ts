import { z } from "zod";

export const LowStockAlertSchema = z.union([
  z.string(),
  z.object({
    product_id: z.number().optional(),
    product_name: z.string().optional(),
    name: z.string().optional(),
    remaining_quantity: z.number().optional(),
    left: z.number().optional(),
    limit: z.number().optional(),
    limit_value: z.number().optional(),
  }),
]);

export const TopProductSchema = z.object({
  product_code: z.string(),
  net_sales: z.string(),
});

export const TopPerformerSchema = z.object({
  employee_id: z.number(),
  total_sales: z.string(),
});

export const DashboardDataSchema = z.object({
  today_revenue: z.string(),
  today_transactions: z.number().optional(),
  today_items_sold: z.number().optional(),
  today_profit: z.string(),
  revenue_change_percentage: z.string(),
  transaction_change_percentage: z.string(),
  top_products_today: z.array(TopProductSchema).default([]).optional(),
  top_performers_today: z.array(TopPerformerSchema).default([]).optional(),
  low_stock_alerts: z.array(LowStockAlertSchema).default([]).optional(),
  pending_commissions_count: z.number().optional(),
});

export const DashboardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: DashboardDataSchema,
});

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
export type LowStockAlert = z.infer<typeof LowStockAlertSchema>;
export type TopProduct = z.infer<typeof TopProductSchema>;
export type TopPerformer = z.infer<typeof TopPerformerSchema>;
export type DashboardData = z.infer<typeof DashboardDataSchema>;
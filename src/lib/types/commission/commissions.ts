import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";
import { EmployeeSchema } from "@/lib/types/user/employees";

export const CommissionDetailSchema = z.object({
  id: z.number(),
  commission_calculation_id: z.number(),
  order_item_id: z.number(),
  product_code: z.string(),
  sales_amount: z.string(),
  commission_rate: z.string(),
  commission_amount: z.string(),
  created_at: TimestampSchema,
});

export const CommissionPaymentSchema = z.object({
  id: z.number(),
  commission_calculation_id: z.number(),
  employee_id: z.number(),
  payment_amount: z.string(),
  payment_date: z.string(),
  payment_method: z.string(),
  reference_number: z.string().optional(),
  paid_by: z.number(),
  notes: z.string().optional(),
  created_at: TimestampSchema,
});

export const CommissionCalculationSchema = z.object({
  id: z.number(),
  employee_id: z.number(),
  employee: EmployeeSchema,
  calculation_period_start: z.string(),
  calculation_period_end: z.string(),
  total_sales: z.string(),
  base_commission: z.string(),
  bonus_commission: z.string(),
  total_commission: z.string(),
  status: z.number(),
  calculated_by: z.number(),
  approved_by: z.number().optional(),
  notes: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  commission_details: z.array(CommissionDetailSchema),
  commission_payment: CommissionPaymentSchema.optional(),
});

export const SalesDataItemSchema = z.object({
  id: z.number(),
  order_item_id: z.number(),
  order_document_number: z.string().optional(),
  order_date: TimestampSchema,
  employee_id: z.number(),
  product_code: z.string(),
  product_name: z.string().optional(),
  sales_amount: z.string(),
  is_returned: z.boolean(),
  created_at: TimestampSchema,
});

export const CommissionCalculationsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(CommissionCalculationSchema),
  meta: z
    .object({
      total_count: z.number(),
    })
    .optional(),
});

export const CommissionCalculationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: CommissionCalculationSchema,
});

export const SalesDataItemsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(SalesDataItemSchema),
  meta: z
    .object({
      total_count: z.number(),
    })
    .optional(),
});

export const SalesDataItemResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: SalesDataItemSchema,
});

export type CommissionDetail = z.infer<typeof CommissionDetailSchema>;
export type CommissionPayment = z.infer<typeof CommissionPaymentSchema>;
export type CommissionCalculation = z.infer<typeof CommissionCalculationSchema>;
export type SalesDataItem = z.infer<typeof SalesDataItemSchema>;
export type CommissionCalculationsResponse = z.infer<typeof CommissionCalculationsResponseSchema>;
export type CommissionCalculationResponse = z.infer<typeof CommissionCalculationResponseSchema>;
export type SalesDataItemsResponse = z.infer<typeof SalesDataItemsResponseSchema>;
export type SalesDataItemResponse = z.infer<typeof SalesDataItemResponseSchema>;

export enum CommissionStatus {
  COMMISSION_STATUS_UNSPECIFIED = 0,
  COMMISSION_STATUS_DRAFT = 1,
  COMMISSION_STATUS_CALCULATED = 2,
  COMMISSION_STATUS_APPROVED = 3,
  COMMISSION_STATUS_PAID = 4,
}

export function getCommissionStatusLabel(status: number): string {
  switch (status) {
    case CommissionStatus.COMMISSION_STATUS_DRAFT:
      return "Rejected";
    case CommissionStatus.COMMISSION_STATUS_CALCULATED:
      return "Pending";
    case CommissionStatus.COMMISSION_STATUS_APPROVED:
      return "Approved";
    case CommissionStatus.COMMISSION_STATUS_PAID:
      return "Paid";
    default:
      return "Unspecified";
  }
}

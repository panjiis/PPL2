import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";

export const PaymentTypeSchema = z.object({
  id: z.number(),
  payment_name: z.string(),
  processing_fee_rate: z.string(),
  is_active: z.boolean(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const PaymentTypeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: PaymentTypeSchema,
});

export const PaymentTypesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(PaymentTypeSchema),
  meta: z
    .object({
      total_count: z.number(),
    })
    .optional(),
});

export type PaymentType = z.infer<typeof PaymentTypeSchema>;
export type PaymentTypeResponse = z.infer<typeof PaymentTypeResponseSchema>;
export type PaymentTypesResponse = z.infer<typeof PaymentTypesResponseSchema>;

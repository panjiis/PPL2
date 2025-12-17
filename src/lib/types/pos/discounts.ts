import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";

export const DiscountSchema = z.object({
  id: z.number(),
  discount_name: z.string(),
  discount_type: z.number(),
  discount_type_label: z.string(),
  discount_value: z.string().optional(),
  product_code: z.string().optional(),
  product_group_id: z.number().optional(),
  buy_quantity: z.number().optional(),
  get_quantity: z.number().optional(),
  min_quantity: z.number(),
  max_usage_per_transaction: z.string().optional(),
  valid_from: z.union([z.date(), TimestampSchema]).optional(),
  valid_until: z.union([z.date(), TimestampSchema]).optional(),
  is_active: z.boolean(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const DiscountsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(DiscountSchema),
  meta: z
  .object({
    total_count: z.number(),
  })
  .optional(),
});

export const DiscountResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: DiscountSchema,
});

export type Discount = z.infer<typeof DiscountSchema>;
export type DiscountResponse = z.infer<typeof DiscountResponseSchema>;
export type DiscountsResponse = z.infer<typeof DiscountsResponseSchema>;

export type DiscountRequest = Omit<Partial<Discount>, "valid_from" | "valid_until"> & {
  valid_from?: string;
  valid_until?: string;
};
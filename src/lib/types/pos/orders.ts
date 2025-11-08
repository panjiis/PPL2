import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";
import { ProductSchema } from "../inventory/products";
import { DiscountSchema } from "./discounts";
import { PaymentTypeSchema } from "./payment-types";

export const OrderItemSchema = z.object({
  id: z.number(),
  document_id: z.number(),
  product_code: z.string(),
  quantity: z.number(),
  unit_price: z.string(),
  price_before_discount: z.string(),
  discount_id: z.number().optional(),
  discount_amount: z.string(),
  line_total: z.string(),
  commission_amount: z.string(),
  created_at: TimestampSchema,
  product: ProductSchema,
  discount: DiscountSchema.optional(),
  payment_type: PaymentTypeSchema.optional()
});

export const OrderSchema = z.object({
  id: z.number(),
  document_number: z.string(),
  cashier_id: z.number(),
  orders_date: TimestampSchema,
  document_type: z.number(),
  subtotal: z.string(),
  tax_amount: z.string(),
  discount_amount: z.string(),
  total_amount: z.string(),
  paid_amount: z.string(),
  change_amount: z.string(),
  additional_info: z.string().optional(),
  notes: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  order_items: z.array(OrderItemSchema),
});

export const OrderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: OrderSchema,
});

export const OrdersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(OrderSchema),
  meta: z
    .object({
      total_count: z.number(),
    })
    .optional(),
});

export type OrderItem = z.infer<typeof OrderItemSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type OrderResponse = z.infer<typeof OrderResponseSchema>;
export type OrdersResponse = z.infer<typeof OrdersResponseSchema>;

import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";
import { POSProductGroupSchema } from "./product-groups";

// export type POSProduct = {
//   product_code: string;
//   product_name: string;
//   product_price: string;
//   cost_price: string;
//   created_at: { seconds: number; nanos: number };
//   updated_at: { seconds: number; nanos: number };
// };

export const POSProductSchema = z.object({
  product_code: z.string(),
  product_name: z.string(),
  product_group_id: z.number(),
  product_price: z.string(),
  cost_price: z.string(),
  color: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,

  product_group: POSProductGroupSchema,
});

export const POSProductsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(POSProductSchema),
  meta: z
  .object({
    total_count: z.number(),
  })
  .optional(),
});

export const POSProductResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: POSProductSchema,
});

export type POSProduct = z.infer<typeof POSProductSchema>;
export type POSProductResponse = z.infer<typeof POSProductResponseSchema>;
export type POSProductsResponse = z.infer<typeof POSProductsResponseSchema>;
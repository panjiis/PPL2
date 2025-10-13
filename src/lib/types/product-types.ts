import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";

export const ProductTypeSchema = z.object({
  id: z.number(),
  product_type_name: z.string(),
  description: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
})

export const ProductTypesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(ProductTypeSchema),
  meta: z
  .object({
    total_count: z.number(),
  })
  .optional(),
});

export const ProductTypeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: ProductTypeSchema,
});

export type ProductType = z.infer<typeof ProductTypeSchema>;
export type ProductTypeResponse = z.infer<typeof ProductTypeResponseSchema>;
export type ProductTypesResponse = z.infer<typeof ProductTypesResponseSchema>;
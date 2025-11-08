import { z } from "zod";
import { ProductTypeSchema } from "@/lib/types/inventory/product-types";
import { SupplierSchema } from "@/lib/types/inventory/suppliers";
import { StockSchema } from "@/lib/types/inventory/stocks";
import { TimestampSchema } from "@/lib/types/timestamp";

export type Product = {
  id: number;
  product_code: string;
  product_name: string;
  product_type_id: number;
  supplier_id: number;
  unit_of_measure: string;
  reorder_level: number;
  max_stock_level: number;
  is_active: boolean;
  created_at: { seconds: number; nanos: number };
  updated_at: { seconds: number; nanos: number };
  product_type?: z.infer<typeof ProductTypeSchema>;
  supplier?: z.infer<typeof SupplierSchema>;
  stocks: z.infer<typeof StockSchema>[];
};

export const ProductSchema: z.ZodType<Product> = z.lazy(() =>
  z.object({
    id: z.number(),
    product_code: z.string(),
    product_name: z.string(),
    product_type_id: z.number(),
    supplier_id: z.number(),
    unit_of_measure: z.string(),
    reorder_level: z.number(),
    max_stock_level: z.number(),
    is_active: z.boolean(),
    created_at: TimestampSchema,
    updated_at: TimestampSchema,
    product_type: ProductTypeSchema.optional(),
    supplier: SupplierSchema.optional(),
    stocks: z.array(StockSchema),
  })
);

export const ProductsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(ProductSchema),
  meta: z
  .object({
    total_count: z.number(),
  })
  .optional(),
});

export const ProductResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: ProductSchema,
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;
export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;
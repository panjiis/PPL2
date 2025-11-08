import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";
import { Product } from "@/lib/types/inventory/products";

export type POSProductGroup = {
  id: number;
  product_group_name: string;
  parent_group_id: number | null;
  color: string | null;
  image_url: string | null;
  is_active: boolean;
  created_at: { seconds: number; nanos: number };
  updated_at: { seconds: number; nanos: number };
  parent_group?: POSProductGroup | null;
  child_groups?: POSProductGroup[];
  products?: Product[];
};

export const POSProductGroupSchema: z.ZodType<POSProductGroup> = z.lazy(() =>
  z.object({
    id: z.number(),
    product_group_name: z.string(),
    parent_group_id: z.number().nullable(),
    color: z.string().nullable(),
    image_url: z.string().nullable(),
    is_active: z.boolean(),
    created_at: TimestampSchema,
    updated_at: TimestampSchema,
    parent_group: POSProductGroupSchema.nullable().optional(),
    child_groups: z.array(POSProductGroupSchema).optional(),
    products: z.array(z.any()).optional(), // replace with ProductSchema if available
  })
);

export const POSProductGroupsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(POSProductGroupSchema),
  meta: z
    .object({
      total_count: z.number(),
    })
    .optional(),
});

export const POSProductGroupResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: POSProductGroupSchema,
});

export type POSProductGroupResponse = z.infer<typeof POSProductGroupResponseSchema>;
export type POSProductGroupsResponse = z.infer<typeof POSProductGroupsResponseSchema>;

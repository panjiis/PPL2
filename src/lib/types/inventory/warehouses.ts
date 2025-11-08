import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";

export const WarehouseSchema = z.object({
  id: z.number(),
  warehouse_code: z.string(),
  warehouse_name: z.string(),
  location: z.string().optional(),
  manager_id: z.number().optional(),
  manager_name: z.string().optional(),
  is_active: z.boolean(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const WarehousesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(WarehouseSchema),
  meta: z
  .object({
    total_count: z.number(),
  })
  .optional(),
});

export const WarehouseResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: WarehouseSchema,
});

export type Warehouse = z.infer<typeof WarehouseSchema>;
export type WarehouseResponse = z.infer<typeof WarehouseResponseSchema>;
export type WarehousesResponse = z.infer<typeof WarehousesResponseSchema>;
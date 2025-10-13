import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";

export const SupplierSchema = z.object({
  id: z.number(),
  supplier_code: z.string(),
  supplier_name: z.string(),
  contact_person: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  is_active: z.boolean(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
});

export const SuppliersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(SupplierSchema),
  meta: z
  .object({
    total_count: z.number(),
  })
  .optional(),
});

export const SupplierResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: SupplierSchema,
});

export type Supplier = z.infer<typeof SupplierSchema>;
export type SupplierResponse = z.infer<typeof SupplierResponseSchema>;
export type SuppliersResponse = z.infer<typeof SuppliersResponseSchema>;
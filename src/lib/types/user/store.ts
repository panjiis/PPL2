import z from "zod";
import { TimestampSchema } from "../timestamp";

export const CreateStoreRequestSchema = z.object({
  name: z.string(),
  image_url: z.string().optional(),
  store_preferences: z.string().optional(),
  management_preferences: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  is_active: z.boolean(),
});

export const UpdateStoreRequestSchema = z.object({
    name: z.string().optional(),
    image_url: z.string().optional(),
    store_preferences: z.string().optional(),
    management_preferences: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    is_active: z.boolean().optional(),
});

export const StoreResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    image_url: z.string().optional(),
    store_preferences: z.string().optional(),
    management_preferences: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postal_code: z.string().optional(),
    is_active: z.boolean(),
    created_at: TimestampSchema,
    updated_at: TimestampSchema,
});

export const StoreResponseWrapperSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: StoreResponseSchema,
});

export const StoresResponseWrapperSchema = z.object({
    success: z.boolean(),
    message: z.string(),
    data: z.array(StoreResponseSchema),
    meta: z.object({ total_count: z.number() }).optional(),
});

export type CreateStoreRequest = z.infer<typeof CreateStoreRequestSchema>;
export type UpdateStoreRequest = z.infer<typeof UpdateStoreRequestSchema>;
export type StoreResponse = z.infer<typeof StoreResponseSchema>;
export type StoreResponseWrapper = z.infer<typeof StoreResponseWrapperSchema>;
export type StoresResponseWrapper = z.infer<typeof StoresResponseWrapperSchema>;
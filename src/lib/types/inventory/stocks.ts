import { z } from "zod";
import { TimestampSchema } from "@/lib/types/timestamp";
import { WarehouseSchema } from "@/lib/types/inventory/warehouses";
import { ProductSchema } from "@/lib/types/inventory/products";
import { PaginationRequestSchema, PaginationResponseSchema } from "@/lib/types/pagination";
import { DateRangeSchema } from "@/lib/types/date-range";

// --- ENUMS ---

export const MovementTypeSchema = z.enum(["UNSPECIFIED","INBOUND", "OUTBOUND", "ADJUSTMENT", "TRANSFER"]);
export type MovementType = z.infer<typeof MovementTypeSchema>;

export const MovementTypeMap: Record<MovementType, number> = {
  UNSPECIFIED: 0,
  INBOUND: 1,
  OUTBOUND: 2,
  ADJUSTMENT: 3,
  TRANSFER: 4,
};

export const ReferenceTypeSchema = z.enum(["UNSPECIFIED", "PURCHASE", "SALE", "ADJUSTMENT", "TRANSFER", "RETURN"]);
export type ReferenceType = z.infer<typeof ReferenceTypeSchema>;

export const ReferenceTypeMap: Record<ReferenceType, number> = {
  UNSPECIFIED: 0,
  PURCHASE: 1,
  SALE: 2,
  ADJUSTMENT: 3,
  TRANSFER: 4,
  RETURN: 5,
};

// --- STOCK ---

export const StockSchema = z.object({
  product_code: z.string(),
  warehouse_id: z.number(),
  available_quantity: z.number(),
  reserved_quantity: z.number(),
  unit_cost: z.string(),
  last_restock_date: z.string().optional(),
  created_at: TimestampSchema,
  updated_at: TimestampSchema,
  product: ProductSchema.optional(),
  warehouse: WarehouseSchema.optional(),
});

export type Stock = z.infer<typeof StockSchema>;

export type AggregatedStock = {
  product_code: string;
  product_name: string;
  total_available: number;
  total_reserved: number;
  last_restock_date?: string;
  warehouses: {
    name: string;
    available: number;
    reserved: number;
  }[];
};

// --- STOCK MOVEMENT ---

export const StockMovementSchema = z.object({
  id: z.number(),
  product_code: z.string(),
  warehouse_id: z.number(),
  movement_type: MovementTypeSchema,
  quantity: z.number(),
  unit_cost: z.string().optional(),
  reference_type: ReferenceTypeSchema,
  reference_id: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.number(),
  manager_name: z.string().optional(),
  created_at: TimestampSchema,
});

export type StockMovement = z.infer<typeof StockMovementSchema>;

// --- REQUESTS & RESPONSES ---

export const CheckStockRequestSchema = z.object({
  product_id: z.number(),
  warehouse_id: z.number().optional(),
  required_quantity: z.number(),
});

export const CheckStockResponseSchema = z.object({
  is_available: z.boolean(),
  total_available_quantity: z.number(),
  stock_details: z.array(StockSchema),
});

export const ReserveStockRequestSchema = z.object({
  product_code: z.string(),
  warehouse_id: z.number(),
  quantity: z.number(),
  reference_id: z.string(),
  reserved_by: z.number(),
});

export const ReserveStockResponseSchema = z.object({
  data: StockSchema,
  success: z.boolean(),
  message: z.string().optional(),
});

export const ReleaseStockRequestSchema = z.object({
  product_code: z.string(),
  warehouse_id: z.number(),
  quantity: z.number(),
  reference_id: z.string(),
  released_by: z.number(),
});

export const ReleaseStockResponseSchema = z.object({
  data: StockSchema,
  success: z.boolean(),
  message: z.string().optional(),
});

export const TransferStockRequestSchema = z.object({
  product_code: z.string(),
  from_warehouse_id: z.number(),
  to_warehouse_id: z.number(),
  quantity: z.number(),
  notes: z.string().optional,
  transferred_by: z.number(),
});

export const TransferStockResponseSchema = z.object({
  data: z.object({
    source_stock: StockSchema,
    destination_stock: StockSchema,
    stock_movements: z.array(StockMovementSchema),
  }),
  success: z.boolean(),
  message: z.string().optional(),
});

export const UpdateStockRequestSchema = z.object({
  product_code: z.string(),
  warehouse_id: z.number(),
  movement_type: MovementTypeSchema,
  quantity: z.number(),
  unit_cost: z.string().optional(),
  reference_type: ReferenceTypeSchema,
  reference_id: z.string().optional(),
  notes: z.string().optional(),
  created_by: z.number(),
});

export const UpdateStockResponseSchema = z.object({
  data: z.object({
    stock_movement: StockMovementSchema,
    updated_stock: StockSchema,
  }),
  success: z.boolean(),
  message: z.string().optional(),
});

export const GetStockRequestSchema = z.object({
  product_id: z.number(),
  warehouse_id: z.number().optional(),
});

export const GetStockResponseSchema = z.object({
  stocks: z.array(StockSchema),
});

export const ListLowStockRequestSchema = z.object({
  warehouse_id: z.number().optional(),
  pagination: PaginationRequestSchema,
});

export const ListLowStockResponseSchema = z.object({
  low_stocks: z.array(StockSchema),
  pagination: PaginationResponseSchema,
});

export const ListStockMovementsRequestSchema = z.object({
  pagination: PaginationRequestSchema,
  product_id: z.number().optional(),
  warehouse_id: z.number().optional(),
  movement_type: MovementTypeSchema.optional(),
  date_range: DateRangeSchema.optional(),
});

export const ListStockMovementsResponseSchema = z.object({
  stock_movements: z.array(StockMovementSchema),
  pagination: PaginationResponseSchema,
});

// --- GENERAL RESPONSES ---

export const StockResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: StockSchema,
});

export const StockMovementResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: StockMovementSchema,
});

export const StocksResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(StockSchema),
  meta: z.object({
    total_count: z.number(),
  }).optional(),
});

// --- TYPES ---

export type CheckStockRequest = z.infer<typeof CheckStockRequestSchema>;
export type CheckStockResponse = z.infer<typeof CheckStockResponseSchema>;
export type ReserveStockRequest = z.infer<typeof ReserveStockRequestSchema>;
export type ReserveStockResponse = z.infer<typeof ReserveStockResponseSchema>;
export type ReleaseStockRequest = z.infer<typeof ReleaseStockRequestSchema>;
export type ReleaseStockResponse = z.infer<typeof ReleaseStockResponseSchema>;
export type TransferStockRequest = z.infer<typeof TransferStockRequestSchema>;
export type TransferStockResponse = z.infer<typeof TransferStockResponseSchema>;
export type UpdateStockRequest = z.infer<typeof UpdateStockRequestSchema>;
export type UpdateStockResponse = z.infer<typeof UpdateStockResponseSchema>;
export type GetStockRequest = z.infer<typeof GetStockRequestSchema>;
export type GetStockResponse = z.infer<typeof GetStockResponseSchema>;
export type ListLowStockRequest = z.infer<typeof ListLowStockRequestSchema>;
export type ListLowStockResponse = z.infer<typeof ListLowStockResponseSchema>;
export type ListStockMovementsRequest = z.infer<typeof ListStockMovementsRequestSchema>;
export type ListStockMovementsResponse = z.infer<typeof ListStockMovementsResponseSchema>;
export type StockMovementResponse = z.infer<typeof StockMovementResponseSchema>;
export type StockResponse = z.infer<typeof StockResponseSchema>;
export type StocksResponse = z.infer<typeof StocksResponseSchema>;

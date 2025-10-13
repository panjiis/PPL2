import { z } from "zod";

export const PaginationRequestSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1),
});

export const PaginationResponseSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total_count: z.number(),
  total_pages: z.number(),
});

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>;
export type PaginationResponse = z.infer<typeof PaginationResponseSchema>;

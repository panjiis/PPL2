import { z } from "zod";

export const DateRangeSchema = z.object({
  start: z.string(),
  end: z.string(),
});

export type DateRange = z.infer<typeof DateRangeSchema>;
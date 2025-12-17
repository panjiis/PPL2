import { z } from "zod";

export const TimestampSchema = z.object({
  seconds: z.number(),
  nanos: z.number().optional().default(0),
});

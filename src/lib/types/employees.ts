import { z } from "zod";

export const CommissionTypeSchema = z.union([z.literal(1), z.literal(2)]);

export const EmployeeSchema = z.object({
  id: z.number(),
  employee_name: z.string(),
  position: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
  hire_date: z.string().optional(),
  base_salary: z.string(),
  commission_rate: z.string(),
  commission_type: CommissionTypeSchema,
  is_active: z.boolean().optional(),
});

export const EmployeesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(EmployeeSchema),
  meta: z
    .object({
      total_count: z.number(),
    })
    .optional(),
});

export const EmployeeResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: EmployeeSchema,
});

// Types
export type CommissionType = z.infer<typeof CommissionTypeSchema>;
export type Employee = z.infer<typeof EmployeeSchema>;
export type EmployeeResponse = z.infer<typeof EmployeeResponseSchema>;
export type EmployeesResponse = z.infer<typeof EmployeesResponseSchema>;

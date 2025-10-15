"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { updateEmployee } from "@/lib/utils/api";
import type { CommissionType, Employee } from "@/lib/types/employees";
import { useSession } from "@/lib/context/session";
import { Select, type SelectOption } from "../ui/select";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export function UpdateEmployeeModal({
  open,
  onClose,
  onUpdated,
  employee,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (employee: Employee) => void;
  employee: Employee | null;
}) {
  const { session } = useSession();
  const { toast } = useToast();
  const [form, setForm] = useState<Partial<Employee>>({});
  const [loading, setLoading] = useState(false);

  const commissionOptions: SelectOption[] = [
    { value: "1", label: "Percentage" },
    { value: "2", label: "Fixed" },
  ];

  useEffect(() => {
    if (employee) setForm(employee);
  }, [employee]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const phoneNumber = parsePhoneNumberFromString(raw, "ID"); // default region = Indonesia
    setForm({
        ...form,
        phone: phoneNumber ? phoneNumber.formatInternational() : raw,
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      const intValue = parseInt(value, 10);
      setForm({ ...form, [name]: isNaN(intValue) ? 0 : intValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !employee) return;
    setLoading(true);
    try {
      const res = await updateEmployee(session.token, employee.id, form);
      onUpdated(res);
      toast({ variant: "success", title: "Employee updated", description: `Employee ${employee.employee_name} updated.` });
      onClose();
    } catch (err: unknown) {
        if (err instanceof Error) {
            console.error(err);
            toast({ variant: "danger", title: "Update Failed", description: err.message || "An unknown error occurred." });
        }
    } finally {
      setLoading(false);
    }
  };

  if (!employee) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <Card>
        <CardHeader><CardTitle>Update Employee</CardTitle></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-3">
            <Input label="Employee Name" name="employee_name" placeholder="Name" value={form.employee_name || ""} onChange={handleChange} required />
            <Input label="Position" name="position" placeholder="Position" value={form.position || ""} onChange={handleChange} />
            <Input
                label="Phone"
                value={form.phone || ""}
                onChange={handlePhoneChange}
                placeholder="+XX XXX XXXX XXXX"
            />
            <Input label="Email" name="email" placeholder="Email" value={form.email || ""} onChange={handleChange} />
            <Input label="Address" name="address" placeholder="Address" value={form.address || ""} onChange={handleChange} />
            <Input label="Hire Date" name="hire_date" type="date" placeholder="Hire Date" value={form.hire_date || ""} onChange={handleChange} />
            <Input label="Base Salary" name="base_salary" placeholder="Base Salary" value={form.base_salary || ""} onChange={handleChange} />
            <Select
                label="Commission Type"
                options={commissionOptions}
                value={String(form.commission_type)}
                onChange={(value) =>
                    setForm({
                    ...form,
                    commission_type: Number(value) as CommissionType,
                    commission_rate: Number(value) === 1 ? form.commission_rate : "0",
                    })
                }
                placeholder="Select Commission Type"
            />
            {form.commission_type === 1 && (
                <Input
                    label="Commission Rate"
                    type="number"
                    value={form.commission_rate}
                    onChange={(e) =>
                    setForm({ ...form, commission_rate: e.target.value })
                    }
                    placeholder="Enter commission rate"
                />
            )}
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update"}</Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}

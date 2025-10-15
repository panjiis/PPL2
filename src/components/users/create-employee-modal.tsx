"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Select, type SelectOption } from "@/components/ui/select";
import type { Employee, CommissionType } from "@/lib/types/employees";
import { createEmployee } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";
import { parsePhoneNumberFromString } from "libphonenumber-js";

export function CreateEmployeeModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (employee: Employee) => void;
}) {
  // form = Employee without "id" and "is_active"
  const [form, setForm] = useState<Omit<Employee, "id" | "is_active">>({
    employee_name: "",
    position: "",
    phone: "",
    email: "",
    address: "",
    hire_date: "",
    base_salary: "",
    commission_rate: "",
    commission_type: 1,
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();

    const commissionOptions: SelectOption[] = [
        { value: "1", label: "Percentage" },
        { value: "2", label: "Fixed" },
    ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      const intValue = parseInt(value, 10);
      setForm({ ...form, [name]: isNaN(intValue) ? 0 : intValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const phoneNumber = parsePhoneNumberFromString(raw, "ID"); // default region = Indonesia
    setForm({
        ...form,
        phone: phoneNumber ? phoneNumber.formatInternational() : raw,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) {
      return toast({ variant: "danger", title: "Unauthorized", description: "You must be logged in." });
    }
    setLoading(true);
    try {
      const res = await createEmployee(session.token, form);
      onCreated(res);
      setForm({
        employee_name: "",
        position: "",
        phone: "",
        email: "",
        address: "",
        hire_date: "",
        base_salary: "",
        commission_rate: "",
        commission_type: 1,
      });
      toast({ variant: "success", title: "Employee created", description: `Employee successfully created` });
      onClose();
    } catch (err) {
      toast({
        variant: "danger",
        title: "Failed to create employee",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card>
        <CardHeader><CardTitle>Create Employee</CardTitle></CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}

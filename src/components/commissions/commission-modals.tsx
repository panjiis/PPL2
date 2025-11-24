"use client";

import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useSession } from "@/lib/context/session";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { fetchEmployees, calculateCommission, bulkCalculateCommissions, payCommission, fetchPaymentTypes } from "@/lib/utils/api";
import { toApiISOString } from "@/lib/utils/string";
import { Employee } from "@/lib/types/user/employees";
import { Input } from "../ui/input";

function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card className="min-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </Modal>
  );
}

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export function CalculateCommissionModal({
  open,
  onClose,
  onCalculated,
  disabledMonths = [], // array of "MM" strings like ["10", "11"]
}: {
  open: boolean;
  onClose: () => void;
  onCalculated: () => void;
  disabledMonths?: string[];
}) {
  const { session } = useSession();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    employee_id: "",
    month: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadEmployees = async () => {
      try {
        const res = await fetchEmployees(session.token);
        setEmployees(res.map((e: Employee) => ({ value: e.id.toString(), label: e.employee_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load employees",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    loadEmployees();
  }, [session?.token, open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;

    const { employee_id, month } = form;
    if (!employee_id || !month) {
      toast({ variant: "danger", title: "Missing fields", description: "All fields are required." });
      return;
    }

    const year = new Date().getFullYear();
    const period_start = new Date(`${year}-${month}-01`);
    const period_end = new Date(year, parseInt(month), 0); // last day of month

    setLoading(true);
    try {
      await calculateCommission(session.token, {
        employee_id: Number(employee_id),
        period_start: toApiISOString(period_start),
        period_end: toApiISOString(period_end),
        calculated_by: session.user.id,
        save_calculation: true,
      });
      toast({ variant: "success", title: "Commission Calculated" });
      onCalculated();
      onClose();
    } catch (err) {
      toast({
        variant: "danger",
        title: "Calculation failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const availableMonths = MONTHS.map((m) => ({
    ...m,
    disabled: disabledMonths.includes(m.value),
  }));

  return (
    <ModalShell open={open} onClose={onClose} title="Calculate Commission">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Employee"
          options={employees}
          value={form.employee_id || null}
          onChange={(v) => setForm((prev) => ({ ...prev, employee_id: v || "" }))}
          placeholder="Select employee"
          searchable
        />

        <Select
          label="Select Month"
          options={availableMonths.map((m) => ({
            value: m.value,
            label: m.label,
            disabled: m.disabled,
          }))}
          value={form.month || null}
          onChange={(v) => setForm((prev) => ({ ...prev, month: v || "" }))}
          placeholder="Select month"
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Calculating..." : "Calculate"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function BulkCalculateCommissionModal({
  open,
  onClose,
  onCalculated,
}: {
  open: boolean;
  onClose: () => void;
  onCalculated: () => void;
}) {
  const { session } = useSession();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<{ value: string; label: string }[]>([]);
  const [disabledMonths, setDisabledMonths] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [form, setForm] = useState({
    employee_ids: [] as string[],
    period_start: null as Date | null,
    period_end: null as Date | null,
  });
  const [loading, setLoading] = useState(false);

  // Load employees
  useEffect(() => {
    if (!session?.token || !open) return;
    const loadEmployees = async () => {
      try {
        const res = await fetchEmployees(session.token);
        setEmployees(res.map((e: Employee) => ({ value: e.id.toString(), label: e.employee_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load employees",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    loadEmployees();
  }, [session?.token, open, toast]);

  // Load already calculated months
  // useEffect(() => {
  //   if (!session?.token || !open) return;
  //   const loadCalculatedMonths = async () => {
  //     try {
  //       const res = await fetchCommissionMonths(session.token);
  //       setDisabledMonths(res); // e.g. ["2025-09", "2025-10"]
  //     } catch (err) {
  //       console.error("Failed to load calculated months", err);
  //     }
  //   };
  //   loadCalculatedMonths();
  // }, [session?.token, open]);

  // Handle month selection
  const handleMonthSelect = (monthValue: string) => {
    const [year, month] = monthValue.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    setSelectedMonth(monthValue);
    setForm((prev) => ({ ...prev, period_start: start, period_end: end }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return;

    if (form.employee_ids.length === 0 || !form.period_start || !form.period_end) {
      toast({ variant: "danger", title: "Missing fields", description: "All fields are required." });
      return;
    }

    setLoading(true);
    try {
      await bulkCalculateCommissions(session.token, {
        employee_ids: form.employee_ids.map((id) => Number(id)),
        period_start: toApiISOString(form.period_start),
        period_end: toApiISOString(form.period_end),
        calculated_by: session.user.id,
      });
      toast({ variant: "success", title: "Bulk Commission Calculated" });
      onCalculated();
      onClose();
    } catch (err) {
      toast({
        variant: "danger",
        title: "Calculation failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }).map((_, i) => {
    const month = i + 1;
    const label = new Date(2025, month - 1).toLocaleString("default", { month: "long" });
    const value = `2025-${String(month).padStart(2, "0")}`;
    return { value, label, disabled: disabledMonths.includes(value) };
  });

  return (
    <ModalShell open={open} onClose={onClose} title="Bulk Calculate Commission">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Employees"
          options={employees}
          value={form.employee_ids}
          onChange={(v) =>
            setForm((prev) => ({
              ...prev,
              employee_ids: Array.isArray(v)
                ? v.map((x) => String(x))
                : [String(v)],
            }))
          }
          placeholder="Select one or more employees"
          multiple
          searchable
        />
        <Select
          label="Select Month"
          options={months.map((m) => ({
            value: m.value,
            label: m.disabled ? `${m.label} (Already calculated)` : m.label,
            disabled: m.disabled,
          }))}
          value={selectedMonth}
          onChange={(v) => v && handleMonthSelect(v)}
          placeholder="Select a month"
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading || !selectedMonth}>{loading ? "Calculating..." : "Bulk Calculate"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function PayCommissionModal({
  open,
  onClose,
  onPaid,
  commissionCalculationId,
}: {
  open: boolean;
  onClose: () => void;
  onPaid: () => void;
  commissionCalculationId: number | null;
}) {
  const { session } = useSession();
  const { toast } = useToast();
  const [paymentTypes, setPaymentTypes] = useState<{ value: string; label: string }[]>([]);
  const [form, setForm] = useState({
    commission_calculation_id: commissionCalculationId || "",
    payment_type_id: "",
    reference_number: "",
    notes: "",
    payment_date: new Date().toISOString().split("T")[0], // YYYY-MM-DD
  });
  const [loading, setLoading] = useState(false);

  // Update commission_calculation_id when modal opens
  useEffect(() => {
    if (commissionCalculationId !== null) {
      setForm((prev) => ({ ...prev, commission_calculation_id: commissionCalculationId }));
    }
  }, [commissionCalculationId]);

  // Fetch payment types dynamically
  useEffect(() => {
    if (!session?.token || !open) return;

    const loadPaymentTypes = async () => {
      try {
        const res = await fetchPaymentTypes(session.token); // your API call
        setPaymentTypes(res.map((p) => ({ value: p.id.toString(), label: p.payment_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load payment types",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };

    loadPaymentTypes();
  }, [session?.token, open, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !commissionCalculationId) return;

    const { payment_type_id, reference_number, notes, payment_date } = form;

    if (!payment_type_id || !reference_number) {
      toast({ variant: "danger", title: "Missing fields", description: "Payment type and reference number are required." });
      return;
    }

    const payload = {
      commission_calculation_id: commissionCalculationId,
      payment_type_id: Number(payment_type_id),
      reference_number,
      paid_by: session.user.id,
      notes,
      payment_date,
    };

    setLoading(true);
    try {
      await payCommission(session.token, commissionCalculationId, payload);
      toast({ variant: "success", title: "Commission Paid" });
      onPaid();
      onClose();
    } catch (err) {
      toast({
        variant: "danger",
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Pay Commission">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Payment Type"
          options={paymentTypes}
          value={form.payment_type_id || null}
          onChange={(v) => setForm((prev) => ({ ...prev, payment_type_id: v || "" }))}
          placeholder="Select payment type"
          searchable
        />

        <Input
          label="Reference Number"
          value={form.reference_number}
          onChange={(e) => setForm((prev) => ({ ...prev, reference_number: e.target.value }))}
          placeholder="Enter reference number"
        />

        <Input
          label="Notes"
          value={form.notes}
          onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
          placeholder="Optional notes"
        />

        <Input
          label="Payment Date"
          type="date"
          value={form.payment_date}
          onChange={(e) => setForm((prev) => ({ ...prev, payment_date: e.target.value }))}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Processing Payment..." : "Pay"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
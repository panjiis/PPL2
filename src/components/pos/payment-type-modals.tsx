"use client";

import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { useToast } from "../ui/use-toast";
import { useSession } from "@/lib/context/session";
import { useEffect, useState } from "react";
import { createPaymentType, updatePaymentTypeById } from "@/lib/utils/api";
import { PaymentType } from "@/lib/types/pos/payment-types";

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

const initialForm = {
  payment_name: "",
  processing_fee_rate: "",
  is_active: true,
};

export function CreatePaymentTypeModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (payment: PaymentType) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...initialForm });
  const { session } = useSession();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) {
      toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to create a payment type.",
      });
      return;
    }
    setLoading(true);
    try {
      const created = await createPaymentType(session.token, form);
      onCreated(created);
      toast({
        variant: "success",
        title: "Payment Type Created",
        description: `${created.payment_name} was created successfully.`,
      });
      setForm({ ...initialForm });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to create payment type",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Create Payment Type">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Payment Name"
          name="payment_name"
          value={form.payment_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Processing Fee Rate (%)"
          name="processing_fee_rate"
          value={form.processing_fee_rate}
          onChange={handleChange}
          type="number"
          min={0}
          max={100}
          step={0.01}
        />
        <Checkbox
          label="Active"
          name="is_active"
          checked={form.is_active}
          onChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function UpdatePaymentTypeModal({
  open,
  onClose,
  onUpdated,
  paymentType,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (payment: PaymentType) => void;
  paymentType: PaymentType | null;
}) {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...initialForm, ...paymentType });

  useEffect(() => {
    if (paymentType) {
      setForm({ ...initialForm, ...paymentType });
    }
  }, [paymentType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) {
      toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a payment type.",
      });
      return;
    }
    if (!paymentType) return;
    setLoading(true);
    try {
      const updated = await updatePaymentTypeById(session.token, paymentType.id, form);
      onUpdated(updated);
      toast({
        variant: "success",
        title: "Payment Type Updated",
        description: `${updated.payment_name} was updated successfully.`,
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update payment type",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Update Payment Type">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Payment Name"
          name="payment_name"
          value={form.payment_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Processing Fee Rate (%)"
          name="processing_fee_rate"
          value={form.processing_fee_rate}
          onChange={handleChange}
          type="number"
          min={0}
          max={100}
          step={0.01}
        />
        <Checkbox
          label="Active"
          name="is_active"
          checked={form.is_active}
          onChange={(checked) => setForm((prev) => ({ ...prev, is_active: checked }))}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

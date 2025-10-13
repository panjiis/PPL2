"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Supplier } from "@/lib/types/suppliers";
import { fetchSupplierById, updateSupplierById } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

export function UpdateSupplierModal({
  open,
  onClose,
  onUpdated,
  supplier,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (supplier: Supplier) => void;
  supplier: Supplier | null;
}) {
  const [form, setForm] = useState({
    supplier_code: "",
    supplier_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();

  // Prefill form when modal opens or supplier changes
  useEffect(() => {
    if (supplier) {
      setForm({
        supplier_code: supplier.supplier_code || "",
        supplier_name: supplier.supplier_name || "",
        contact_person: supplier.contact_person || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
      });
    }
  }, [supplier, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") {
      value = value === "" ? "" : Number(value);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.token || !supplier) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a supplier.",
      });
    }

    setLoading(true);
    try {
      // Update the supplier
      await updateSupplierById(session.token, supplier.supplier_code, {
        ...form
      });

      // Re-fetch to ensure we have latest fields (role, timestamps, etc.)
      const updatedSupplier = await fetchSupplierById(session.token, supplier.supplier_code);

      onUpdated(updatedSupplier);

      toast({
        variant: "success",
        title: "Supplier Updated",
        description: `${updatedSupplier.supplier_code} ${updatedSupplier.supplier_name} was updated successfully.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update supplier",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card>
        <CardHeader>
          <CardTitle>Update Supplier</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Supplier Code"
              name="supplier_code"
              placeholder="Supplier Code"
              value={form.supplier_code}
              onChange={handleChange}
              required
            />
            <Input
              label="Supplier Name"
              name="contact_person"
              placeholder="Supplier Name"
              value={form.contact_person}
              onChange={handleChange}
            />
            <Input
              label="Phone"
              name="phone"
              placeholder="Supplier Name"
              value={form.phone}
              onChange={handleChange}
            />
            <Input
              label="Email"
              name="email"
              placeholder="Supplier Name"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              label="Address"
              name="address"
              placeholder="Supplier Name"
              value={form.address}
              onChange={handleChange}
            />
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Updating..." : "Update"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}
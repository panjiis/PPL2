"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Supplier } from "@/lib/types/suppliers";
import { createSupplier, fetchSupplierByCode } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

export function CreateStockModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (supplier: Supplier) => void;
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number = e.target.value;
        if (e.target.type === "number") {
            value = value === "" ? "" : Number(value);
        }
        setForm({ ...form, [e.target.name]: value });
    };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!session?.token) {
    return toast({
      variant: "danger",
      title: "Unauthorized",
      description: "You must be logged in to create a supplier.",
    });
  }

  setLoading(true);
    try {
        const created = await createSupplier(session.token, {
            ...form
        });

        const newSupplier = await fetchSupplierByCode(session.token, created.supplier_code);

        onCreated(newSupplier);

        toast({
            variant: "success",
            title: "Supplier Created",
            description: `${newSupplier.supplier_name} was added successfully.`,
            });

            setForm({ 
              supplier_code: "",
              supplier_name: "",
              contact_person: "",
              phone: "",
              email: "",
              address: "",
             });
            onClose();
        } catch (err) {
            console.error(err);
            toast({
            variant: "danger",
            title: "Failed to create supplier",
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
          <CardTitle>Create Supplier</CardTitle>
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
              {loading ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}

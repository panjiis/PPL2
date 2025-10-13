"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Warehouse } from "@/lib/types/warehouses";
import { createWarehouse, fetchWarehouseByCode } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

export function CreateWarehouseModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (warehouse: Warehouse) => void;
}) {
  const [form, setForm] = useState({
    warehouse_code: "",
    warehouse_name: "",
    location: "",
    manager_id: 1,
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
      description: "You must be logged in to create a warehouse.",
    });
  }

  if (!Number.isInteger(form.manager_id) || form.manager_id <= 0) {
    return toast({
      variant: "warning",
      title: "Invalid Manager ID",
      description: "Manager ID must be a positive integer.",
    });
  }

  setLoading(true);
    try {
        const created = await createWarehouse(session.token, {
            ...form,
            manager_id: Number(form.manager_id),
        });

        const newWarehouse = await fetchWarehouseByCode(session.token, created.warehouse_code);

        onCreated(newWarehouse);

        toast({
            variant: "success",
            title: "Warehouse Created",
            description: `${newWarehouse.warehouse_name} was added successfully.`,
            });

            setForm({ warehouse_code: "", warehouse_name: "", location: "", manager_id: 1 });
            onClose();
        } catch (err) {
            console.error(err);
            toast({
            variant: "danger",
            title: "Failed to create warehouse",
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
          <CardTitle>Create Warehouse</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Warehouse Code"
              name="warehouse_code"
              placeholder="Warehouse Code"
              value={form.warehouse_code}
              onChange={handleChange}
              required
            />
            <Input
              label="Warehouse Name"
              name="warehouse_name"
              placeholder="Warehouse Name"
              value={form.warehouse_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Location"
              name="location"
              placeholder="Location"
              value={form.location}
              onChange={handleChange}
              required
            />
            <Input
              label="Manager ID"
              name="manager_id"
              type="number"
              placeholder="Manager ID"
              value={form.manager_id}
              onChange={handleChange}
              required
              min={1}
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

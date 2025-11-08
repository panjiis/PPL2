"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Warehouse } from "@/lib/types/inventory/warehouses";
import { fetchUsers, fetchWarehouseByCode, updateWarehouseByCode } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";
import { Select, SelectOption } from "../ui/select";
import { User } from "@/lib/types/user/users";

export function UpdateWarehouseModal({
  open,
  onClose,
  onUpdated,
  warehouse,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (warehouse: Warehouse) => void;
  warehouse: Warehouse | null;
}) {
  const [form, setForm] = useState({
    warehouse_name: "",
    location: "",
    manager_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();

  // Prefill form when modal opens or warehouse changes
  useEffect(() => {
    if (warehouse) {
      setForm({
        warehouse_name: warehouse.warehouse_name || "",
        location: warehouse.location || "",
        manager_id: warehouse.manager_id || 1,
      });
    }
  }, [warehouse, open]);

  useEffect(() => {
      if (!session?.token || !open) return
      const loadManagers = async () => {
        try {
          const res = await fetchUsers(session.token)
          const opts = res.map((r: User) => ({ value: String(r.id), label: r.firstname + " " + r.lastname }))
          setManagers(opts)
        } catch (err) {
          toast({
            variant: "danger",
            title: "Failed to load managers",
            description: err instanceof Error ? err.message : "Unknown error",
          })
        }
      }
      loadManagers()
    }, [session?.token, open, toast])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") {
      value = value === "" ? "" : Number(value);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.token || !warehouse) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a warehouse.",
      });
    }

    setLoading(true);
    try {
      // Update the warehouse
      await updateWarehouseByCode(session.token, warehouse.warehouse_code, {
        ...form,
        manager_id: Number(form.manager_id),
      });

      // Re-fetch to ensure we have latest fields (role, timestamps, etc.)
      const updatedWarehouse = await fetchWarehouseByCode(session.token, warehouse.warehouse_code);

      onUpdated(updatedWarehouse);

      toast({
        variant: "success",
        title: "Warehouse Updated",
        description: `${updatedWarehouse.warehouse_code} ${updatedWarehouse.warehouse_name} was updated successfully.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update warehouse",
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
          <CardTitle>Update Warehouse</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
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
            <Select
              label="Manager"
              options={managers}
              value={String(form.manager_id)}
              onChange={(v) => setForm({ ...form, manager_id: Number(v) })}
              placeholder="Select a manager"
              searchable
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
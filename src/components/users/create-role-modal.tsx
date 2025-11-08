"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Role } from "@/lib/types/user/roles";
import { createRole } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

export function CreateRoleModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (role: Role) => void;
}) {
  const [form, setForm] = useState({
    role_name: "",
    permissions: "",
    access_level: 1,
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      const intValue = parseInt(value, 10);  // ensure integer
      setForm({ ...form, [name]: isNaN(intValue) ? 0 : intValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.token) {
        return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to create a role.",
        });
    }

    if (!Number.isInteger(form.access_level) || form.access_level <= 0) {
        return toast({
        variant: "warning",
        title: "Invalid Access Level",
        description: "Access Level must be a positive integer.",
        });
    }

    setLoading(true);
    try {
        // Use session token directly
        const newRole = await createRole(session.token, form);
        onCreated(newRole);
        setForm({ role_name: "", permissions: "", access_level: 1 });
        onClose();
    } catch (err) {
        console.error(err);
        toast({
        variant: "danger",
        title: "Failed to create role",
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
          <CardTitle>Create Role</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              name="role_name"
              label="Role Name"
              placeholder="Role Name"
              value={form.role_name}
              onChange={handleChange}
              required
            />
            <Input
              name="access_level"
              type="number"
              label="Access Level"
              placeholder="Access Level"
              value={form.access_level}
              onChange={handleChange}
              min={1}
              step={1}
              required
            />
            <Input
              name="permissions"
              label="Permissions"
              placeholder="Permissions"
              value={form.permissions}
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

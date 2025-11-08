"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { updateRoleById } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";
import { Select, type SelectOption } from "@/components/ui/select";
import { Role } from "@/lib/types/user/roles";

export function UpdateRoleModal({
  open,
  onClose,
  onUpdated,
  role,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (role: Role) => void;
  role: Role | null;
}) {
  const [form, setForm] = useState({
    role_name: "",
    permissions: "",
    access_level: 1,
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();

  // Prefill form when modal opens or role changes
  useEffect(() => {
    if (role) {
      setForm({
        role_name: role.role_name || "",
        permissions: role.permissions || "",
        access_level: role.access_level || 1,
      });
    }
  }, [role, open]);

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

    if (!session?.token || !role) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a role.",
      });
    }

    setLoading(true);
    try {
      // Update the role
      await updateRoleById(session.token, role.id, {
        ...form,
      });

      // Re-fetch to ensure we have latest fields (role, timestamps, etc.)
      // const updatedRole = await fetchRoleById(session.token, role.id);

      // onUpdated(updatedRole);

      // toast({
      //   variant: "success",
      //   title: "Role Updated",
      //   description: `${updatedRole.firstname} ${updatedRole.lastname} was updated successfully.`,
      // });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update role",
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
          <CardTitle>Update Role</CardTitle>
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
              {loading ? "Updating..." : "Update"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}
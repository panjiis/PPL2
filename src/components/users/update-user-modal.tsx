"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { User } from "@/lib/types/users";
import { fetchUserById, updateUserById } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

export function UpdateUserModal({
  open,
  onClose,
  onUpdated,
  user,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (user: User) => void;
  user: User | null;
}) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    email: "",
    role_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();

  // Prefill form when modal opens or user changes
  useEffect(() => {
    if (user) {
      setForm({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        email: user.email || "",
        role_id: user.role_id || 1,
      });
    }
  }, [user, open]);

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

    if (!session?.token || !user) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a user.",
      });
    }

    setLoading(true);
    try {
      // Update the user
      await updateUserById(session.token, user.id, {
        ...form,
        role_id: Number(form.role_id),
      });

      // Re-fetch to ensure we have latest fields (role, timestamps, etc.)
      const updatedUser = await fetchUserById(session.token, user.id);

      onUpdated(updatedUser);

      toast({
        variant: "success",
        title: "User Updated",
        description: `${updatedUser.firstname} ${updatedUser.lastname} was updated successfully.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update user",
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
          <CardTitle>Update User</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              name="firstname"
              placeholder="First Name"
              value={form.firstname}
              onChange={handleChange}
            />
            <Input
              name="lastname"
              placeholder="Last Name"
              value={form.lastname}
              onChange={handleChange}
            />
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
            />
            <Input
              name="role_id"
              type="number"
              placeholder="Role ID"
              value={form.role_id}
              onChange={handleChange}
              min={1}
              step={1} 
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
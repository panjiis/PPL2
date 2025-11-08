"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { User } from "@/lib/types/user/users";
import { createUser, fetchRoles, fetchUserById } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";
import { Role } from "@/lib/types/user/roles";
import { Select, SelectOption } from "@/components/ui/select";

export function CreateUserModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
}) {
  const [form, setForm] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    password: "",
    role_id: 1,
  });
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  
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

  if (!session?.token) {
    return toast({
      variant: "danger",
      title: "Unauthorized",
      description: "You must be logged in to create a user.",
    });
  }

  if (!Number.isInteger(form.role_id) || form.role_id <= 0) {
    return toast({
      variant: "warning",
      title: "Invalid Role ID",
      description: "Role ID must be a positive integer.",
    });
  }

  setLoading(true);
    try {
        const created = await createUser(session.token, {
            ...form,
            role_id: Number(form.role_id),
        });

        const newUser = await fetchUserById(session.token, created.id);

        onCreated(newUser);

        toast({
            variant: "success",
            title: "User Created",
            description: `${newUser.firstname} ${newUser.lastname} was added successfully.`,
            });

            setForm({ firstname: "", lastname: "", username: "", email: "", password: "", role_id: 1 });
            onClose();
        } catch (err) {
            console.error(err);
            toast({
            variant: "danger",
            title: "Failed to create user",
            description: err instanceof Error ? err.message : "Unknown error",
            });
        } finally {
            setLoading(false);
        }
    };

  useEffect(() => {
    if (!session?.token || !open) return
    const loadRoles = async () => {
      try {
        const res = await fetchRoles(session.token)
        const opts = res.map((r: Role) => ({ value: String(r.id), label: r.role_name }))
        setRoles(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load roles",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }
    loadRoles()
  }, [session?.token, open, toast])

  return (
    <Modal open={open} onClose={onClose}>
      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              name="firstname"
              label="First Name"
              placeholder="First Name"
              value={form.firstname}
              onChange={handleChange}
              required
            />
            <Input
              name="lastname"
              label="Last Name"
              placeholder="Last Name"
              value={form.lastname}
              onChange={handleChange}
              required
            />
            <Input
              name="username"
              label="Username"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              required
            />
            <Input
              name="email"
              type="email"
              label="Email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
            <Input
              name="password"
              type="password"
              label="Password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <Select
              label="Role"
              options={roles}
              value={String(form.role_id)}
              onChange={(v) => setForm({ ...form, role_id: Number(v) })}
              placeholder="Select a role"
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

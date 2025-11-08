"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchUsers } from "@/lib/utils/api";
import { User } from "@/lib/types/user/users";
import { Button } from "@/components/ui/button";
import { PlusIcon, MoreHorizontal } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DataView } from "@/components/ui/data-view";
import { CreateUserModal } from "@/components/users/create-user-modal";
import { UpdateUserModal } from "@/components/users/update-user-modal";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";

export default function UsersPage() {
  const { session, isLoading } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchUsers(session.token)
      .then(setUsers)
      .catch(console.error);
  }, [session, isLoading]);

  const refreshUsers = async () => {
    if (!session) return;
    const refreshed = await fetchUsers(session.token);
    setUsers(refreshed);
  };

  const handleUserCreated = async () => {
    refreshUsers();
  };

  const handleUserUpdated = async () => {
    refreshUsers();
    setEditingUser(null);
  };

  const userColumns: ColumnDef<User>[] = [
    { accessorKey: "id", header: "ID" },
    {
      accessorKey: "fullname",
      header: "Name",
      cell: ({ row }) => {
        const first = row.original.firstname || "";
        const last = row.original.lastname || "";
        return `${first} ${last}`.trim();
      },
    },
    { accessorKey: "username", header: "Username" },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => row.original.role?.role_name || "—",
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => (row.original.is_active ? "Yes" : "No"),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/personnel/users/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingUser(row.original);
                setEditModalOpen(true);
              }}
            >
              Edit User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return null;

  return (
    <div>
      <Breadcrumbs />

      <CreateUserModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleUserCreated}
      />

      <UpdateUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingUser(null);
        }}
        onUpdated={handleUserUpdated}
        user={editingUser}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your users here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={users}
        columns={userColumns}
        searchableColumn="username"
        caption="List of users in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(user) => (
          <div
            key={user.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/personnel/users/${user.id}`)}
          >
            <div className="flex items-center gap-4">
              <span className={`h-2 w-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`} />
              <div>
                <p className="font-semibold">{user.firstname} {user.lastname} <span className="font-normal text-[hsl(var(--muted-foreground))]">{user.role?.role_name}</span></p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{user.username} &middot; {user.email}</p>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(user) => (
          <div
            key={user.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/personnel/users/${user.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${user.is_active ? "bg-green-500" : "bg-red-500"}`} />
                <h3 className="font-bold text-lg">{user.firstname} {user.lastname} <span className="font-normal text-[hsl(var(--muted-foreground))]">{user.role?.role_name}</span></h3>
              </div>
              <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit max-w-full mt-2 truncate">{user.username} &middot; {user.email}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}
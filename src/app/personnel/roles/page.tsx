"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchRoles } from "@/lib/utils/api";
import { Role } from "@/lib/types/user/roles";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DataView } from "@/components/ui/data-view";
import { CreateRoleModal } from "@/components/users/create-role-modal";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { UpdateRoleModal } from "@/components/users/update-role-modal";

export default function RolesPage() {
  const { session, isLoading } = useSession();
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchRoles(session.token)
      .then(setRoles)
      .catch(console.error);
  }, [session, isLoading]);

  const handleRoleCreated = (newRole: Role) => {
    setRoles((prev) => [...prev, newRole]);
  };

  const handleRoleUpdated = (newRole: Role) => {
    setRoles((prev) => [...prev, newRole]);
  };

  const roleColumns: ColumnDef<Role>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "role_name", header: "Name" },
    { accessorKey: "access_level", header: "Access Level" },
    { accessorKey: "permissions", header: "Permissions" },
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
            <DropdownMenuItem onClick={() => router.push(`/personnel/roles/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingRole(row.original);
                setEditModalOpen(true);
              }}
            >
              Edit Role
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

      <CreateRoleModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleRoleCreated}
      />

      <UpdateRoleModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdated={handleRoleUpdated}
        role={editingRole}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Role Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your roles here.</p>
        </div>
        <Button size="icon" onClick={() => setModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={roles}
        columns={roleColumns}
        searchableColumn="role_name"
        caption="List of roles in system."
        onCreate={() => setModalOpen(true)}
        renderListItem={(role) => (
          <div
            key={role.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/roles/${role.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-[hsl(var(--muted-foreground))]"> Lv. {role.access_level}</span>
                <h3 className="font-semibold">{role.role_name}</h3>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{role.permissions}</p>
            </div>
          </div>
        )}
        renderGridItem={(role) => (
          <div
            key={role.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/roles/${role.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-normal text-lg text-[hsl(var(--muted-foreground))]"> Lv. {role.access_level}</span>
                <h3 className="font-bold text-lg">{role.role_name}</h3>
              </div>
              { role.permissions && 
                (<p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit max-w-full mt-2">{role.permissions}</p>)
              }
            </div>
          </div>
        )}
      />
    </div>
  );
}

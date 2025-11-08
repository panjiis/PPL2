"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchSuppliers } from "@/lib/utils/api";
import { Supplier } from "@/lib/types/inventory/suppliers";
import { CreateSupplierModal } from "@/components/inventory/create-supplier-modal";
import { UpdateSupplierModal } from "@/components/inventory/update-supplier-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

export default function SuppliersPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    if (isLoading || !session) return;
    (async () => {
      try {
        const fetched = await fetchSuppliers(session.token);
        setSuppliers(fetched);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session, isLoading]);

  const handleSupplierCreated = (newSupplier: Supplier) => {
    setSuppliers((prev) => [...prev, newSupplier]);
  };

  const handleSupplierUpdated = (updated: Supplier) => {
    setSuppliers((prev) =>
      prev.map((w) => (w.id === updated.id ? updated : w))
    );
    setEditingSupplier(null);
  };

  const supplierColumns: ColumnDef<Supplier>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { type: "number" as const },
    },
    {
      accessorKey: "supplier_code",
      header: "Code",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span className="font-mono">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "supplier_name",
      header: "Name",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "phone",
      header: "Phone",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "email",
      header: "Email",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "address",
      header: "Address",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "is_active",
      header: "Active",
      meta: { type: "string" as const },
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
            <DropdownMenuItem onClick={() => router.push(`/inventory/suppliers/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingSupplier(row.original);
                setEditModalOpen(true);
              }}
            >
              Edit Supplier
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return <p className="text-center p-10">Loading...</p>;

  return (
    <div>
      <Breadcrumbs />

      <CreateSupplierModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleSupplierCreated}
      />

      <UpdateSupplierModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onUpdated={handleSupplierUpdated}
        supplier={editingSupplier}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Supplier Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your suppliers here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView<Supplier, unknown>
        data={suppliers}
        columns={supplierColumns}
        searchableColumn="supplier_name"
        itemsPerPage={5}
        initialView="table"
        caption="List of suppliers in system."
        renderListItem={(supplier) => (
          <div
            key={supplier.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/suppliers/${supplier.supplier_code}`)}
          >
            <div className="flex items-center gap-4">
              <span className={`h-2 w-2 rounded-full ${supplier.is_active ? "bg-green-500" : "bg-red-500"}`} />
              <div>
                <div className="flex gap-2">
                  <p className="font-semibold">{supplier.supplier_name}</p>
                  <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{supplier.supplier_code}</p>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">{supplier.phone} {supplier.email && ('\u00B7')} {supplier.email}</p>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(supplier) => (
          <div
            key={supplier.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card text-card-foreground cursor-pointer"
            onClick={() => router.push(`/inventory/suppliers/${supplier.supplier_code}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full shrink-0 ${supplier.is_active ? "bg-green-500" : "bg-red-500"}`} />
                <h3 className="font-bold text-lg truncate">{supplier.supplier_name}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{supplier.supplier_code}</p>
              </div>
              <div className="flex flex-col gap-8">
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{supplier.contact_person}</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">{supplier.phone} {supplier.email && ('\u00B7')} {supplier.email}</p>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

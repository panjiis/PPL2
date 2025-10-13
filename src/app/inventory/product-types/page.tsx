"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { fetchProductTypes } from "@/lib/utils/api";
import { ProductType } from "@/lib/types/product-types";
import { CreateProductTypeModal } from "@/components/inventory/create-product-type-modal";
import { UpdateProductTypeModal } from "@/components/inventory/update-product-type-modal";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

export default function ProductTypesPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [productType, setProductTypes] = useState<ProductType[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [editingProductType, setEditingProductType] = useState<ProductType | null>(null);

  useEffect(() => {
    if (isLoading || !session) return;
    (async () => {
      try {
        const fetched = await fetchProductTypes(session.token);
        setProductTypes(fetched);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session, isLoading]);

  const handleProductTypeCreated = (newProductType: ProductType) => {
    setProductTypes((prev) => [...prev, newProductType]);
  };

  const handleProductTypeUpdated = (updated: ProductType) => {
    setProductTypes((prev) =>
      prev.map((w) => (w.id === updated.id ? updated : w))
    );
    setEditingProductType(null);
  };

  const productTypeColumns: ColumnDef<ProductType>[] = [
    {
      accessorKey: "id",
      header: "ID",
      meta: { type: "number" as const },
    },
    {
      accessorKey: "product_type_name",
      header: "Name",
      meta: { type: "string" as const },
    },
    {
      accessorKey: "description",
      header: "Description",
      meta: { type: "string" as const },
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
            <DropdownMenuItem onClick={() => router.push(`product-types/${row.original.id}`)}>
              View Details
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

      <CreateProductTypeModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleProductTypeCreated}
      />

      <UpdateProductTypeModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdated={handleProductTypeUpdated}
        product_type={editingProductType}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Product Type Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your product types here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView<ProductType, unknown>
        data={productType}
        columns={productTypeColumns}
        searchableColumn="product_type_name"
        itemsPerPage={5}
        initialView="table"
        caption="List of product types in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(product_type) => (
          <div
            key={product_type.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/product-types/${product_type.id}`)}
          >
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <p className="font-semibold">{product_type.product_type_name}</p>
                <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{product_type.id}</p>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(product_type) => (
          <div
            key={product_type.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/product_types/${product_type.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg truncate">{product_type.product_type_name}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{product_type.id}</p>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{product_type.description}</p>
            </div>
          </div>
        )}
      />
    </div>
  );
}

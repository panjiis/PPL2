"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { useSession } from "@/lib/context/session";
import { fetchPOSProductGroups } from "@/lib/utils/api";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";
import { CreatePOSProductGroupModal, UpdatePOSProductGroupModal } from "@/components/pos/product-group-modals";
import { POSProductGroup } from "@/lib/types/pos/product-groups";

export default function ProductPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [productGroups, setProductGroups] = useState<POSProductGroup[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProductGroup, setEditingProductGroup] = useState<POSProductGroup | null>(null);

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchPOSProductGroups(session.token)
      .then(setProductGroups)
      .catch(console.error);
  }, [session, isLoading]);

  const refreshProductGroups = async () => {
    if (!session) return;
    const refreshed = await fetchPOSProductGroups(session.token);
    setProductGroups(refreshed);
  };

  const handleProductCreated = async () => {
    await refreshProductGroups();
  };

  const handleProductUpdated = async () => {
    await refreshProductGroups();
    setEditingProductGroup(null);
  };

  const productGroupColumns: ColumnDef<POSProductGroup>[] = [
    // DEPRECATED
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   meta: { type: "number" as const },
    // },
    // { 
    //   accessorKey: "id",
    //   header: "Product Group ID",
    //   meta: { type: "string" as const },
    //   cell: ({ getValue }) => (
    //     <span className="font-mono">{getValue<string>()}</span>
    //   ),
    // },
    { 
      accessorKey: "image_url",
      header: "Product Group Image",
      meta: { type: "string" as const },
      cell: ({ row }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={
              row.original.image_url && row.original.image_url.trim() !== ""
                ? row.original.image_url
                : `https://placehold.co/64/${encodeURIComponent(row.original.color ?? "")}/000?text=${encodeURIComponent(row.original.product_group_name)}`
            } alt="Product Group" className="w-16 h-16 object-cover rounded" />
      ),
    },
    { 
      accessorKey: "product_group_name",
      header: "Product Group Name",
      meta: { type: "string" as const },
    },
    // { 
    //   accessorKey: "parent_group_id",
    //   header: "Parent Product Group",
    //   meta: { type: "number" as const },
    // },
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
            <DropdownMenuItem onClick={() => router.push(`/pos/product-groups/${row.original.products?.[0]?.product_code}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingProductGroup(row.original);
                setEditModalOpen(true);
              }}>
              Edit Product
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs />

      <CreatePOSProductGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleProductCreated}
      />

      <UpdatePOSProductGroupModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingProductGroup(null);
        }}
        onUpdated={handleProductUpdated}
        productGroup={editingProductGroup}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">POS Product Group Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your point of sale product groups here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={productGroups}
        columns={productGroupColumns}
        searchableColumn="product_group_name"
        caption="List of point of sale products in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(product_group) => (
          <div
            key={product_group.id}
            className="border border-[hsl(var(--border))] rounded-lg flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer overflow-clip"
            onClick={() => router.push(`/pos/product-groups/${product_group.id}`)}
          >
            <img src={
              product_group.image_url && product_group.image_url.trim() !== ""
                ? product_group.image_url
                : `https://placehold.co/64?text=${encodeURIComponent(product_group.product_group_name)}`
            }
            alt={product_group.product_group_name} className="w-16 h-16 aspect-square object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-4">
                {/* <span className={`h-2 w-2 rounded-full ${product_group.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
                <div>
                  <div className="flex gap-2">
                    <p className="font-semibold">{product_group.product_group_name}</p>
                    <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{product_group.id}</p>
                  </div>
                  {/* <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">{product.product_type?.product_type_name} {product.supplier?.supplier_name && ('\u00B7')} {product.supplier?.supplier_name}</p> */}
                </div>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(product_group) => (
          <div
            key={product_group.id}
            className="border border-[hsl(var(--border))] rounded-lg flex flex-col justify-between bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer overflow-clip"
            onClick={() => router.push(`/pos/product-groups/${product_group.id}`)}
          >
            {/* <img src={product_group.image_url} alt="Product Group" className="h-full object-cover" /> */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={
              product_group.image_url && product_group.image_url.trim() !== ""
                ? product_group.image_url
                : `https://placehold.co/64?text=${encodeURIComponent(product_group.product_group_name)}`
            }
            alt={product_group.product_group_name} className="w-full h-full aspect-square object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-2">
                {/* <span className={`h-2 w-2 rounded-full shrink-0 ${product_group.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
                <h3 className="font-bold text-lg truncate">{product_group.product_group_name}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{product_group.id}</p>
              </div>
              {/* <p className="text-sm text-[hsl(var(--muted-foreground))]">{product.product_type?.product_type_name} {product.supplier?.supplier_name && ('\u00B7')} {product.supplier?.supplier_name}</p> */}
            </div>
          </div>
        )}
      />
    </div>
  );
}

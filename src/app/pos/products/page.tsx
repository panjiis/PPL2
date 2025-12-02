"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { useSession } from "@/lib/context/session";
import { fetchPOSProducts } from "@/lib/utils/api";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";
import { POSProduct } from "@/lib/types/pos/products";
import { formatCurrency } from "@/lib/utils/string";
import { CreatePOSProductModal, UpdatePOSProductModal } from "@/components/pos/product-modals";
import { Badge } from "@/components/ui/badge";

export default function ProductPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [products, setProducts] = useState<POSProduct[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<POSProduct | null>(null);

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchPOSProducts(session.token)
      .then(setProducts)
      .catch(console.error);
  }, [session, isLoading]);

  const refreshProducts = async () => {
    if (!session) return;
    const refreshed = await fetchPOSProducts(session.token);
    setProducts(refreshed);
  };

  const handleProductCreated = async () => {
    await refreshProducts();
  };

  const handleProductUpdated = async () => {
    await refreshProducts();
    setEditingProduct(null);
  };

  const productColumns: ColumnDef<POSProduct>[] = [
    // DEPRECATED
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   meta: { type: "number" as const },
    // },
    {
      accessorKey: "image_url",
      header: "Product Image",
      meta: { type: "string" as const },
      cell: ({ getValue, row }) => {
        const src = getValue<string>();
        const productName = row.original.product_name || "No Name";
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={
              src && src.trim() !== ""
                ? src
                : `https://placehold.co/64?text=${encodeURIComponent(productName)}`
            }
            alt={productName}
            className="w-16 h-16 object-cover rounded"
          />
        );
      },
    },
    { 
      accessorKey: "product_code",
      header: "Product Code",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span className="font-mono">{getValue<string>()}</span>
      ),
    },
    { 
      accessorKey: "product_name",
      header: "Product Name",
      meta: { type: "string" as const },
    },
    { 
      accessorKey: "product_group",
      header: "Product Group",
      meta: { type: "string" as const },
      cell: ({ row }) => {
        const group = row.original.product_group;
        const name = group?.product_group_name ?? "N/A";

        return (
          <Badge variant="secondary">
            {name}
          </Badge>
        );
      },
    },
    { 
      accessorKey: "product_price",
      header: "Product Price",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span>{formatCurrency(Number(getValue<string>()))}</span>
      ),
    },
    { 
      accessorKey: "cost_price",
      header: "Product Cost",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span>{formatCurrency(Number(getValue<string>()))}</span>
      ),
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
            <DropdownMenuItem onClick={() => router.push(`/inventory/products/${row.original.product_code}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingProduct(row.original);
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

      <CreatePOSProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleProductCreated}
      />

      <UpdatePOSProductModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingProduct(null);
        }}
        onUpdated={handleProductUpdated}
        product={editingProduct}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">POS Product Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your point of sale products here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={products}
        columns={productColumns}
        enableAdvancedSearch
        searchableColumn="product_name"
        searchableGroup="product_group.product_group_name"
        searchableIcon="image_url"
        caption="List of point of sale products in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(product) => (
          <div
            key={product.product_code}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/products/${product.product_code}`)}
          >
            <div className="flex items-center gap-4">
              {/* <span className={`h-2 w-2 rounded-full ${product.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
              <div>
                <div className="flex gap-2">
                  <p className="font-semibold">{product.product_name}</p>
                  <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{product.product_code}</p>
                </div>
                {/* <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">{product.product_type?.product_type_name} {product.supplier?.supplier_name && ('\u00B7')} {product.supplier?.supplier_name}</p> */}
              </div>
            </div>
          </div>
        )}
        renderGridItem={(product) => (
          <div
            key={product.product_code}
            className="border border-[hsl(var(--border))] rounded-lg flex flex-col justify-between bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer overflow-clip"
            onClick={() => router.push(`/inventory/products/${product.product_code}`)}
          >
            <img src={
              product.image_url && product.image_url.trim() !== ""
                ? product.image_url
                : `https://placehold.co/64?text=${encodeURIComponent(product.product_name)}`
            }
            alt={product.product_name} className="w-full h-full aspect-square object-cover" />
            <div className="p-4">
              <div className="flex items-center gap-2">
                {/* <span className={`h-2 w-2 rounded-full shrink-0 ${product.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
                <h3 className="font-bold text-lg truncate">{product.product_name}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{product.product_code}</p>
              </div>
              {/* <p className="text-sm text-[hsl(var(--muted-foreground))]">{product.product_type?.product_type_name} {product.supplier?.supplier_name && ('\u00B7')} {product.supplier?.supplier_name}</p> */}
            </div>
          </div>
        )}
      />
    </div>
  );
}

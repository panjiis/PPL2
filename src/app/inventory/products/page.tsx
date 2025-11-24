"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { useSession } from "@/lib/context/session";
import { Product } from "@/lib/types/inventory/products";
import { fetchProducts } from "@/lib/utils/api";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";
import { CreateProductModal } from "@/components/inventory/create-product-modal";
import { UpdateProductModal } from "@/components/inventory/update-product-modal";
import { useTranslation } from "next-i18next";

export default function ProductPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const { t: tCommon } = useTranslation("common");
  const { t: tProducts } = useTranslation("inventory/products");

  const [products, setProducts] = useState<Product[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchProducts(session.token)
      .then(setProducts)
      .catch(console.error);
  }, [session, isLoading]);

  const refreshProducts = async () => {
    if (!session) return;
    const refreshed = await fetchProducts(session.token);
    setProducts(refreshed);
  };

  const handleProductCreated = async () => {
    await refreshProducts();
  };

  const handleProductUpdated = async () => {
    await refreshProducts();
    setEditingProduct(null);
  };

  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: "product_code",
      header: tProducts("productCode"),
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span className="font-mono">{getValue<string>()}</span>
      ),
    },
    {
      accessorKey: "product_name",
      header: tProducts("productName"),
      meta: { type: "string" as const },
    },
    {
      accessorKey: "product_type",
      header: tProducts("productType"),
      cell: ({ row }) => row.original.product_type?.product_type_name,
      filterFn: (row, _columnId, filterValue) => {
        const name =
          row.original.product_type?.product_type_name?.toLowerCase() ?? "";
        return name.includes(filterValue.toLowerCase());
      },
      meta: { type: "string" as const },
    },
    {
      accessorKey: "supplier",
      header: tProducts("supplier"),
      cell: ({ row }) => row.original.supplier?.supplier_name,
      filterFn: (row, _columnId, filterValue) => {
        const name =
          row.original.supplier?.supplier_name?.toLowerCase() ?? "";
        return name.includes(filterValue.toLowerCase());
      },
      meta: { type: "string" as const },
    },
    {
      accessorKey: "unit_of_measure",
      header: tProducts("unitOfMeasure"),
      meta: { type: "string" as const },
    },
    {
      accessorKey: "reorder_level",
      header: tProducts("reorderLevel"),
      meta: { type: "number" as const },
    },
    {
      accessorKey: "max_stock_level",
      header: tProducts("maxStockLevel"),
      meta: { type: "number" as const },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">{tCommon("openMenu")}</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/inventory/products/${row.original.product_code}`)
              }
            >
              {tProducts("viewDetails")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingProduct(row.original);
                setEditModalOpen(true);
              }}
            >
              {tProducts("editProduct")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs />

      <CreateProductModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleProductCreated}
      />

      <UpdateProductModal
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
          <h1 className="text-2xl font-bold">{tProducts("pageTitle")}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            {tProducts("pageDescription")}
          </p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={products}
        columns={productColumns}
        searchableColumn="product_name"
        caption={tProducts("tableCaption")}
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(product) => (
          <div
            key={product.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() =>
              router.push(`/inventory/products/${product.product_code}`)
            }
          >
            <div className="flex items-center gap-4">
              <span
                className={`h-2 w-2 rounded-full ${
                  product.is_active ? "bg-green-500" : "bg-red-500"
                }`}
              />
              <div>
                <div className="flex gap-2">
                  <p className="font-semibold">{product.product_name}</p>
                  <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">
                    {product.product_code}
                  </p>
                </div>
                <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">
                  {product.product_type?.product_type_name}{" "}
                  {product.supplier?.supplier_name && "·"}{" "}
                  {product.supplier?.supplier_name}
                </p>
              </div>
            </div>
          </div>
        )}
        renderGridItem={(product) => (
          <div
            key={product.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() =>
              router.push(`/inventory/products/${product.product_code}`)
            }
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${
                    product.is_active ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <h3 className="font-bold text-lg truncate">
                  {product.product_name}
                </h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">
                  {product.product_code}
                </p>
              </div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {product.product_type?.product_type_name}{" "}
                {product.supplier?.supplier_name && "·"}{" "}
                {product.supplier?.supplier_name}
              </p>
            </div>
          </div>
        )}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { useSession } from "@/lib/context/session";
import { deleteDiscountById, fetchDiscounts } from "@/lib/utils/api";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";
import { Discount } from "@/lib/types/pos/discounts";
import { formatCurrency, toDateTimeMinutes } from "@/lib/utils/string";
import { CreateDiscountModal, UpdateDiscountModal } from "@/components/pos/discount-modals";

export default function DiscountPage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchDiscounts(session.token)
      .then(setDiscounts)
      .catch(console.error);
  }, [session, isLoading]);

  const refreshDiscounts = async () => {
    if (!session) return;
    const refreshed = await fetchDiscounts(session.token);
    setDiscounts(refreshed);
  };

  const handleDiscountCreated = async () => {
    await refreshDiscounts();
  };

  const handleDiscountUpdated = async () => {
    await refreshDiscounts();
    setEditingDiscount(null);
  };

  const discountColumns: ColumnDef<Discount>[] = [
    // DEPRECATED
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   meta: { type: "number" as const },
    // },
    // { 
    //   accessorKey: "id",
    //   header: "Discount Code",
    //   meta: { type: "string" as const },
    //   cell: ({ getValue }) => (
    //     <span className="font-mono">{getValue<string>()}</span>
    //   ),
    // },
    { 
      accessorKey: "discount_name",
      header: "Discount Name",
      meta: { type: "string" as const },
    },
    { 
      accessorKey: "discount_type_label",
      header: "Discount Type",
      meta: { type: "string" as const },
    },
    { 
      accessorKey: "max_usage_per_transaction",
      header: "Max Usage per Transaction",
      meta: { type: "number" as const },
    },
    {
      accessorKey: "discount_value",
      header: "Discount Value",
      meta: { type: "string" as const },
      cell: ({ row }) => {
        const { discount_type_label, discount_value, buy_quantity, get_quantity } = row.original;
        const value = Number(discount_value);

        let displayValue = "";

        switch (discount_type_label) {
          case "Percentage":
            displayValue = `${value}%`;
            break;
          case "Fixed Amount":
            displayValue = formatCurrency(value);
            break;
          case "Buy X Get Y":
            displayValue = `Buy ${buy_quantity ?? 0}, Get ${get_quantity ?? 0}`;
            break;
          default:
            displayValue = "-";
        }

        return <span>{displayValue}</span>;
      },
    },
    {
      id: "validity",
      header: "Validity",
      meta: { type: "string" as const },
      cell: ({ row }) => {
        const { valid_from, valid_until } = row.original;

        // const toDate = (v: unknown): Date | null => {
        //   if (!v) return null;
        //   if (v instanceof Date) return v;
        //   if (typeof v === "object" && v !== null && "seconds" in v) {
        //     const ts = v as { seconds: number };
        //     return new Date(ts.seconds * 1000);
        //   }
        //   return null;
        // };

        const fromDate = toDateTimeMinutes(valid_from);
        const untilDate = toDateTimeMinutes(valid_until);

        const from = fromDate ? fromDate : "—";
        const until = untilDate ? untilDate : "—";

        return <span>{`${from} → ${until}`}</span>;
      },
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
            <DropdownMenuItem onClick={() => router.push(`/inventory/discounts/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingDiscount(row.original);
                setEditModalOpen(true);
              }}>
              Edit Discount
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                if (!session?.token) return;
                deleteDiscountById(session.token, row.original.id);
              }}
            >
              Delete Discount
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs />

      <CreateDiscountModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleDiscountCreated}
      />

      <UpdateDiscountModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingDiscount(null);
        }}
        onUpdated={handleDiscountUpdated}
        discount={editingDiscount}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Discount Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your discounts here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={discounts}
        columns={discountColumns}
        searchableColumn="discount_name"
        caption="List of point of sale discounts in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(discount) => (
          <div
            key={discount.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/discounts/${discount.id}`)}
          >
            <div className="flex items-center gap-4">
              {/* <span className={`h-2 w-2 rounded-full ${discount.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
              <div>
                <div className="flex gap-2">
                  <p className="font-semibold">{discount.discount_name}</p>
                  <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{discount.id}</p>
                </div>
                {/* <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">{discount.discount_type?.discount_type_name} {discount.supplier?.supplier_name && ('\u00B7')} {discount.supplier?.supplier_name}</p> */}
              </div>
            </div>
          </div>
        )}
        renderGridItem={(discount) => (
          <div
            key={discount.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/discounts/${discount.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                {/* <span className={`h-2 w-2 rounded-full shrink-0 ${discount.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
                <h3 className="font-bold text-lg truncate">{discount.discount_name}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{discount.id}</p>
              </div>
              {/* <p className="text-sm text-[hsl(var(--muted-foreground))]">{discount.discount_type?.discount_type_name} {discount.supplier?.supplier_name && ('\u00B7')} {discount.supplier?.supplier_name}</p> */}
            </div>
          </div>
        )}
      />
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { DataView } from "@/components/ui/data-view";
import { useSession } from "@/lib/context/session";
import { fetchPaymentTypes } from "@/lib/utils/api";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";
import { PaymentType } from "@/lib/types/pos/payment-types";
import { Checkbox } from "@/components/ui/checkbox";
import { CreatePaymentTypeModal, UpdatePaymentTypeModal } from "@/components/pos/payment-type-modals";

export default function PaymentTypePage() {
  const { session, isLoading } = useSession();
  const router = useRouter();

  const [payment_types, setPaymentTypes] = useState<PaymentType[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPaymentType, setEditingPaymentType] = useState<PaymentType | null>(null);

  useEffect(() => {
    if (isLoading || !session?.token) return;
    fetchPaymentTypes(session.token)
      .then(setPaymentTypes)
      .catch(console.error);
  }, [session, isLoading]);

  const refreshPaymentTypes = async () => {
    if (!session) return;
    const refreshed = await fetchPaymentTypes(session.token);
    setPaymentTypes(refreshed);
  };

  const handlePaymentTypeCreated = async () => {
    await refreshPaymentTypes();
  };

  const handlePaymentTypeUpdated = async () => {
    await refreshPaymentTypes();
    setEditingPaymentType(null);
  };

  const paymentTypeColumns: ColumnDef<PaymentType>[] = [
    // DEPRECATED
    // {
    //   accessorKey: "id",
    //   header: "ID",
    //   meta: { type: "number" as const },
    // },
    { 
      accessorKey: "payment_name",
      header: "Payment Type",
      meta: { type: "string" as const },
    },
    { 
      accessorKey: "processing_fee_rate",
      header: "Processing Fee",
      meta: { type: "string" as const },
      cell: ({ getValue }) => (
        <span>{getValue<string>()}%</span>
      ),
    },
    {
      accessorKey: "is_active",
      header: "Is Active?",
      meta: { type: "boolean" as const },
      cell: ({ getValue }) => {
        const value = getValue<boolean>();
        return <Checkbox checked={!!value} disabled />;
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
            <DropdownMenuItem onClick={() => router.push(`/pos/payment_types/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingPaymentType(row.original);
                setEditModalOpen(true);
              }}>
              Edit Payment Type
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumbs />

      <CreatePaymentTypeModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handlePaymentTypeCreated}
      />

      <UpdatePaymentTypeModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingPaymentType(null);
        }}
        onUpdated={handlePaymentTypeUpdated}
        paymentType={editingPaymentType}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">POS Payment Type Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your point of sale payment types here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={payment_types}
        columns={paymentTypeColumns}
        searchableColumn="payment_name"
        caption="List of point of sale payment types in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(payment_type) => (
          <div
            key={payment_type.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/pos/payment_types/${payment_type.id}`)}
          >
            <div className="flex items-center gap-4">
              {/* <span className={`h-2 w-2 rounded-full ${payment.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
              <div>
                <div className="flex gap-2">
                  <p className="font-semibold">{payment_type.payment_name}</p>
                  <p className="text-xs font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{payment_type.id}</p>
                </div>
                {/* <p className="text-sm text-[hsl(var(--muted-foreground))] text-wrap wrap-break-word">{payment.payment_type_type?.payment_type_type_name} {payment.supplier?.supplier_name && ('\u00B7')} {payment.supplier?.supplier_name}</p> */}
              </div>
            </div>
          </div>
        )}
        renderGridItem={(payment_type) => (
          <div
            key={payment_type.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/pos/payment-types/${payment_type.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                {/* <span className={`h-2 w-2 rounded-full shrink-0 ${payment.is_active ? "bg-green-500" : "bg-red-500"}`} /> */}
                <h3 className="font-bold text-lg truncate">{payment_type.payment_name}</h3>
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit">{payment_type.id}</p>
              </div>
              {/* <p className="text-sm text-[hsl(var(--muted-foreground))]">{payment.payment_type_type?.payment_type_type_name} {payment.supplier?.supplier_name && ('\u00B7')} {payment.supplier?.supplier_name}</p> */}
            </div>
          </div>
        )}
      />
    </div>
  );
}

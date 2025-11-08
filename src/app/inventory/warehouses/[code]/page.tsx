"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchWarehouseByCode } from "@/lib/utils/api";
import type { Warehouse } from "@/lib/types/inventory/warehouses";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import { UpdateWarehouseModal } from "@/components/inventory/update-warehouse-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function WarehousePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { session } = useSession();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    fetchWarehouseByCode(session.token, code).then(setWarehouse);
  }, [session, code]);

  if (!warehouse) return <div>Loading...</div>;

  const handleWarehouseUpdated = (updated: Warehouse) => {
    setWarehouse(updated)
  };

  return (
    <div>
      <Breadcrumbs />

      <UpdateWarehouseModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        onUpdated={handleWarehouseUpdated}
        warehouse={warehouse}
      />

      <div className="flex flex-col gap-8 items-start w-full mt-8 md:mt-16 mb-10">
        <div className="relative overflow-hidden rounded-xl w-full h-96">
          <Image src={`https://placehold.co/512?text=${warehouse.warehouse_name}`} alt="Warehouse Image" fill className="object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))]/60 to-[hsl(var(--background))]/0 p-4 flex items-end">
            <div className="flex justify-between items-end w-full">
              <div>
                <h1 className="text-2xl font-bold">{warehouse.warehouse_name}</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--background))] px-2 py-1 rounded w-fit font-mono">{warehouse.warehouse_code}</p>
              </div>
              <Button size="icon" onClick={() => setEditModalOpen(true)}>
                <SquarePenIcon />
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-2 w-full">

          <Card>
            <CardHeader>
              <h2 className="font-bold">General Info</h2>
            </CardHeader>
            <CardContent>
              <p>Location: {warehouse.location}</p>
              <p>Manager ID: {warehouse.manager_id}</p>
            </CardContent>
          </Card>

        </div>
      </div>
      
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchWarehouseByCode } from "@/lib/utils/api";
import type { Warehouse } from "@/lib/types/warehouses";

export default function WarehousePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { session } = useSession();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);

  useEffect(() => {
    if (!session?.token) return;
    fetchWarehouseByCode(session.token, code).then(setWarehouse);
  }, [session, code]);

  if (!warehouse) return <div>Loading...</div>;

  return (
    <div>
      <h1>{warehouse.warehouse_name}</h1>
      <p>Code: {warehouse.warehouse_code}</p>
    </div>
  );
}

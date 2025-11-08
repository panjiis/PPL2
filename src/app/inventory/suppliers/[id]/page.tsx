"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchSupplierById } from "@/lib/utils/api";
import type { Supplier } from "@/lib/types/inventory/suppliers";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import { UpdateSupplierModal } from "@/components/inventory/update-supplier-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SupplierPage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = use(params);
  const { session } = useSession();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    fetchSupplierById(session.token, id).then(setSupplier);
  }, [session, id]);

  if (!supplier) return <div>Loading...</div>;

  const handleSupplierUpdated = (updated: Supplier) => {
    setSupplier(updated)
  };

  return (
    <div>
      <Breadcrumbs />

      <UpdateSupplierModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        onUpdated={handleSupplierUpdated}
        supplier={supplier}
      />

      <div className="flex flex-col gap-8 items-start w-full mt-8 md:mt-16 mb-10">
        <div className="relative overflow-hidden rounded-xl w-full h-96">
          <Image src={`https://placehold.co/512?text=${supplier.supplier_name}`} alt="Supplier Image" fill className="object-cover"/>
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))]/60 to-[hsl(var(--background))]/0 p-4 flex items-end">
            <div className="flex justify-between items-end w-full">
              <div>
                <h1 className="text-2xl font-bold">{supplier.supplier_name}</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--background))] px-2 py-1 rounded w-fit font-mono">{supplier.supplier_code}</p>
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
              <p>Location: {supplier.address}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-bold">Contact Info</h2>
            </CardHeader>
            <CardContent>
              <p>Contact Person: {supplier.contact_person}</p>
              <p>Email: {supplier.email}</p>
              <p>Phone: {supplier.phone}</p>
            </CardContent>
          </Card>

        </div>
      </div>
      
    </div>
  );
}

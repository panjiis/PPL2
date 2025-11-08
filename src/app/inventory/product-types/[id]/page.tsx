"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchProductsByProductTypeId } from "@/lib/utils/api";
import type { ProductType } from "@/lib/types/inventory/product-types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import { UpdateProductTypeModal } from "@/components/inventory/update-product-type-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProductTypePage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = use(params);
  const { session } = useSession();
  const [productType, setProductType] = useState<ProductType | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    fetchProductsByProductTypeId(session.token, id);
  }, [session, id]);

  if (!productType) return <div>Loading...</div>;

  const handleProductTypeUpdated = (updated: ProductType) => {
    setProductType(updated)
  };

  return (
    <div>
      <Breadcrumbs />

      <UpdateProductTypeModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        onUpdated={handleProductTypeUpdated}
        product_type={productType}
      />

      <div className="flex items-center justify-center md:justify-start w-full mt-8 md:mt-16 mb-10">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <div className="relative overflow-hidden rounded-xl w-full aspect-square md:h-full">
            <Image src={`https://placehold.co/512?text=${productType.product_type_name}`} alt="ProductType Image" fill className="object-cover"/>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">{productType.product_type_name}</h1>
                <p className="text-[hsl(var(--muted-foreground))] font-mono">{productType.product_type_code}</p>
              </div>
              <Button size="icon" onClick={() => setEditModalOpen(true)}>
                <SquarePenIcon />
              </Button>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}

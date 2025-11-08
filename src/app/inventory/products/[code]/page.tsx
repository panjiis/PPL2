"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchProductByCode } from "@/lib/utils/api";
import type { Product } from "@/lib/types/inventory/products";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import { UpdateProductModal } from "@/components/inventory/update-product-modal";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProductPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const { session } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    fetchProductByCode(session.token, code).then(setProduct);
  }, [session, code]);

  if (!product) return <div>Loading...</div>;

  const handleProductUpdated = (updated: Product) => {
    setProduct(updated)
  };

  return (
    <div>
      <Breadcrumbs />

      <UpdateProductModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        onUpdated={handleProductUpdated}
        product={product}
      />

      <div className="flex items-center justify-center md:justify-start w-full mt-8 md:mt-16 mb-10">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <div className="relative overflow-hidden rounded-xl w-full aspect-square md:h-full">
            <Image src={`https://placehold.co/512?text=${product.product_name}`} alt="Product Image" fill className="object-cover"/>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">{product.product_name}</h1>
                <p className="text-[hsl(var(--muted-foreground))] font-mono">{product.product_code}</p>
              </div>
              <Button size="icon" onClick={() => setEditModalOpen(true)}>
                <SquarePenIcon />
              </Button>
            </div>

            <Card>
              <CardHeader>
                <h2 className="font-bold">General Info</h2>
              </CardHeader>
              <CardContent>
                <p>Category: {product.product_type?.product_type_name}</p>
                <p>Unit of Measure: {product.unit_of_measure}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-bold">Stock Info</h2>
              </CardHeader>
              <CardContent>
                <p>Reorder Level: {product.reorder_level}</p>
                <p>Max Stock Level: {product.max_stock_level}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="font-bold">Supplier Info</h2>
              </CardHeader>
              <CardContent>
                <p>Supplier: {product.supplier?.supplier_name}</p>
                <p>Contact person: {product.supplier?.contact_person}</p>
                <p>Phone: {product.supplier?.phone}</p>
                <p>Email: {product.supplier?.email}</p>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>
      
    </div>
  );
}

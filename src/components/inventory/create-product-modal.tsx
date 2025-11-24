"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/lib/types/inventory/products";
import { createProduct, fetchProductByCode, fetchProductTypes, fetchSuppliers } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";
import { Select, SelectOption } from "../ui/select";
import { ProductType } from "@/lib/types/inventory/product-types";
import { Supplier } from "@/lib/types/inventory/suppliers";

export function CreateProductModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (Product: Product) => void;
}) {
  const [form, setForm] = useState({
    product_code: "",
    product_name: "",
    product_type_id: 0,
    supplier_id: 0,
    unit_of_measure: "",
    reorder_level: 0,
    max_stock_level: 0
  });

  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();
  const router = useRouter();
  const [productTypes, setProductTypes] = useState<SelectOption[]>([]);
  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value: string | number = e.target.value;
      if (e.target.type === "number") {
          value = value === "" ? "" : Number(value);
      }
      setForm({ ...form, [e.target.name]: value });
  };

  useEffect(() => {
    if (!session?.token || !open) return
    const loadProductTypes = async () => {
      try {
        const res = await fetchProductTypes(session.token)
        const opts = res.map((r: ProductType) => ({ value: String(r.id), label: r.product_type_name }))
        setProductTypes(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load product types",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }
    loadProductTypes()
    const loadSuppliers = async () => {
      try {
        const res = await fetchSuppliers(session.token)
        const opts = res.map((r: Supplier) => ({ value: String(r.id), label: r.supplier_name }))
        setSuppliers(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load suppliers",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }
    loadSuppliers()
  }, [session?.token, open, toast])

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!session?.token) {
    return toast({
      variant: "danger",
      title: "Unauthorized",
      description: "You must be logged in to create a product type.",
    });
  }

  if (!Number.isInteger(form.product_type_id) || form.product_type_id <= 0) {
    return toast({
      variant: "warning",
      title: "Invalid Product Type ID",
      description: "Product Type ID must be a positive integer.",
    });
  }

  setLoading(true);

  if (form.reorder_level > form.max_stock_level) {
    setLoading(false);
    return toast({
      variant: "warning",
      title: "Invalid Reorder Level",
      description: "Reorder level cannot be higher than max stock level.",
    });
  }

    try {
        const created = await createProduct(session.token, {
            ...form
        });

        const newProduct = await fetchProductByCode(session.token, created.product_code);

        onCreated(newProduct);

        toast({
            variant: "success",
            title: "Product Created",
            description: `${newProduct.product_name} was added successfully.`,
            action: {
                label: "Add Stock",
                onClick: () => {
                  // Navigate to stocks page with query parameter
                  router.push(`/inventory/stocks?openUpdate=true&productCode=${encodeURIComponent(newProduct.product_code)}`);
                }
              }
            });

            setForm({ 
              product_code: "",
              product_name: "",
              product_type_id: 0,
              supplier_id: 0,
              unit_of_measure: "",
              reorder_level: 0,
              max_stock_level: 0
             });
            onClose();
        } catch (err) {
            console.error(err);
            toast({
            variant: "danger",
            title: "Failed to create product",
            description: err instanceof Error ? err.message : "Unknown error",
            });
        } finally {
            setLoading(false);
        }
    };

  const reorderLevelInvalid = form.reorder_level > form.max_stock_level;

  return (
    <Modal open={open} onClose={onClose}>
      <Card className="min-w-md">
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Product Name"
              name="product_name"
              placeholder="Product Name"
              value={form.product_name}
              onChange={handleChange}
              required
            />
            <Select
              label="Product Type"
              options={productTypes}
              value={String(form.product_type_id)}
              onChange={(v) => setForm({ ...form, product_type_id: Number(v) })}
              placeholder="Select a product type"
              searchable
            />
            <Select
              label="Supplier"
              options={suppliers}
              value={String(form.supplier_id)}
              onChange={(v) => setForm({ ...form, supplier_id: Number(v) })}
              placeholder="Select a supplier"
              searchable
            />
            <Input
              label="Unit of Measure"
              name="unit_of_measure"
              placeholder="Unit of Measure"
              value={form.unit_of_measure}
              onChange={handleChange}
              required
            />
            <Input
              label="Reorder Level"
              name="reorder_level"
              placeholder="Reorder Level"
              type="number"
              min={0}
              step={1}
              value={form.reorder_level}
              onChange={(e) => setForm(prev => ({
                ...prev,
                reorder_level: Number(e.target.value)
              }))}
            />
            {reorderLevelInvalid && (
              <p className="text-red-500 text-sm">Reorder level cannot be higher than max stock level.</p>
            )}
            <Input
              label="Max Stock Level"
              name="max_stock_level"
              placeholder="Max Stock Level"
              type="number"
              min={1}
              step={1}
              value={form.max_stock_level}
              onChange={(e) => setForm(prev => ({
                ...prev,
                max_stock_level: Number(e.target.value)
              }))}
            />
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || reorderLevelInvalid}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/lib/types/inventory/products";
import { fetchProductByCode, fetchProductTypes, fetchSuppliers, updateProductByCode } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";
import { Select, SelectOption } from "../ui/select";
import { ProductType } from "@/lib/types/inventory/product-types";
import { Supplier } from "@/lib/types/inventory/suppliers";

export function UpdateProductModal({
  open,
  onClose,
  onUpdated,
  product,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (product: Product) => void;
  product: Product | null;
}) {
  const [form, setForm] = useState({
    product_code: "",
    product_name: "",
    product_type_id: 0,
    supplier_id: 0,
    unit_of_measure: "",
    reorder_level: 0,
    max_stock_level: 1
  });
  const [loading, setLoading] = useState(false);
  const [productTypes, setProductTypes] = useState<SelectOption[]>([]);
  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();

  // Load initial product values
  useEffect(() => {
    if (product && open) {
      setForm({
        product_code: product.product_code || "",
        product_name: product.product_name || "",
        product_type_id: product.product_type_id || 0,
        supplier_id: product.supplier_id || 0,
        unit_of_measure: product.unit_of_measure || "",
        reorder_level: product.reorder_level || 0,
        max_stock_level: product.max_stock_level || 1
      });
    }
  }, [product, open]);

  // Load product types and suppliers
  useEffect(() => {
    if (!session?.token || !open) return;

    const loadProductTypes = async () => {
      try {
        const res = await fetchProductTypes(session.token);
        setProductTypes(res.map((r: ProductType) => ({ value: String(r.id), label: r.product_type_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load product types",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };

    const loadSuppliers = async () => {
      try {
        const res = await fetchSuppliers(session.token);
        setSuppliers(res.map((r: Supplier) => ({ value: String(r.id), label: r.supplier_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load suppliers",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };

    loadProductTypes();
    loadSuppliers();
  }, [session?.token, open, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "number") {
      const intValue = parseInt(value, 10);
      setForm(prev => ({ ...prev, [name]: isNaN(intValue) ? 0 : intValue }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.token || !product) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a product.",
      });
    }

    if (form.reorder_level > form.max_stock_level) {
      return toast({
        variant: "warning",
        title: "Invalid Reorder Level",
        description: "Reorder level cannot be higher than max stock level.",
      });
    }

    setLoading(true);
    try {
      await updateProductByCode(session.token, product.product_code, { ...form });

      const updatedProduct = await fetchProductByCode(session.token, product.product_code);
      onUpdated(updatedProduct);

      toast({
        variant: "success",
        title: "Product Updated",
        description: `${updatedProduct.product_name} was updated successfully.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update product",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const reorderLevelInvalid = form.reorder_level > form.max_stock_level;

  return (
    <Modal open={open} onClose={onClose}>
      <Card>
        <CardHeader>
          <CardTitle>Update {product?.product_name}</CardTitle>
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
              onChange={(v) => setForm(prev => ({ ...prev, product_type_id: Number(v) }))}
              placeholder="Select a product type"
              searchable
            />
            <Select
              label="Supplier"
              options={suppliers}
              value={String(form.supplier_id)}
              onChange={(v) => setForm(prev => ({ ...prev, supplier_id: Number(v) }))}
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
              {loading ? "Updating..." : "Update"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}

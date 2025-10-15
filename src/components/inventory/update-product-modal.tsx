"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { Product } from "@/lib/types/products";
import { fetchProductById, updateProductById } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

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
    max_stock_level: 0
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (product) {
      setForm({
        product_code: product.product_code || "",
        product_name: product.product_name || "",
        product_type_id: product.product_type_id || 0,
        supplier_id: product.supplier_id || 0,
        unit_of_measure: product.unit_of_measure || "",
        reorder_level: product.reorder_level || 0,
        max_stock_level: product.max_stock_level || 0
      });
    }
  }, [product, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "number") {
      const intValue = parseInt(value, 10);
      setForm({ ...form, [name]: isNaN(intValue) ? 0 : intValue });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.token || !product) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a product type.",
      });
    }

    setLoading(true);
    try {
      await updateProductById(session.token, product.id, {
        ...form
      });

      const updatedProduct = await fetchProductById(session.token, product.id);

      onUpdated(updatedProduct);

      toast({
        variant: "success",
        title: "Product  Updated",
        description: `${updatedProduct.id} ${updatedProduct.product_name} was updated successfully.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update product type",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card>
        <CardHeader>
          <CardTitle>Create Product</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Product Code"
              name="product_code"
              placeholder="Product Code"
              value={form.product_code}
              onChange={handleChange}
            />
            <Input
              label="Product Name"
              name="product_name"
              placeholder="Product Name"
              value={form.product_name}
              onChange={handleChange}
            />
            <Input
              label="Product Type ID"
              name="product_type_id"
              placeholder="Product Type ID"
              value={form.product_type_id}
              type="number"
              onChange={handleChange}
            />
            <Input
              label="Supplier ID"
              name="supplier_id"
              placeholder="Supplier ID"
              value={form.supplier_id}
              type="number"
              onChange={handleChange}
            />
            <Input
              label="Unit of Measure"
              name="unit_of_measure"
              placeholder="Unit of Measure"
              value={form.unit_of_measure}
              onChange={handleChange}
            />
            <Input
              label="Reorder Level"
              name="reorder_level"
              placeholder="Reorder Level"
              value={form.reorder_level}
              type="number"
              onChange={handleChange}
            />
            <Input
              label="Max Stock Level"
              name="max_stock_level"
              placeholder="Max Stock Level"
              value={form.max_stock_level}
              type="number"
              onChange={handleChange}
            />
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </Modal>
  );
}
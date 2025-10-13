"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { ProductType } from "@/lib/types/product-types";
import { fetchProductTypeById, updateProductTypeById } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

export function UpdateProductTypeModal({
  open,
  onClose,
  onUpdated,
  product_type,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (product_type: ProductType) => void;
  product_type: ProductType | null;
}) {
  const [form, setForm] = useState({
    product_type_name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();

  useEffect(() => {
    if (product_type) {
      setForm({
        product_type_name: product_type.product_type_name || "",
        description: product_type.description || "",
      });
    }
  }, [product_type, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") {
      value = value === "" ? "" : Number(value);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.token || !product_type) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a product type.",
      });
    }

    setLoading(true);
    try {
      await updateProductTypeById(session.token, product_type.id, {
        ...form
      });

      const updatedProductType = await fetchProductTypeById(session.token, product_type.id);

      onUpdated(updatedProductType);

      toast({
        variant: "success",
        title: "Product Type Updated",
        description: `${updatedProductType.id} ${updatedProductType.product_type_name} was updated successfully.`,
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
          <CardTitle>Create ProductType</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Product Type Name"
              name="product_type_name"
              placeholder="Product Type Name"
              value={form.product_type_name}
              onChange={handleChange}
            />
            <Input
              label="Description"
              name="description"
              placeholder="Description"
              value={form.description}
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
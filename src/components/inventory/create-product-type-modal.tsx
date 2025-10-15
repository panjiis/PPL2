"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import type { ProductType } from "@/lib/types/product-types";
import { createProductType, fetchProductTypeById } from "@/lib/utils/api";
import { useSession } from "@/lib/context/session";

export function CreateProductTypeModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (ProductType: ProductType) => void;
}) {
  const [form, setForm] = useState({
    product_type_name: "",
    description: ""
  });
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value: string | number = e.target.value;
        if (e.target.type === "number") {
            value = value === "" ? "" : Number(value);
        }
        setForm({ ...form, [e.target.name]: value });
    };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!session?.token) {
    return toast({
      variant: "danger",
      title: "Unauthorized",
      description: "You must be logged in to create a product type.",
    });
  }

  setLoading(true);
    try {
        const created = await createProductType(session.token, {
            ...form
        });

        const newProductType = await fetchProductTypeById(session.token, created.id);

        onCreated(newProductType);

        toast({
            variant: "success",
            title: "Product Type Created",
            description: `${newProductType.product_type_name} was added successfully.`,
            });

            setForm({ 
              product_type_name: "",
              description: "",
             });
            onClose();
        } catch (err) {
            console.error(err);
            toast({
            variant: "danger",
            title: "Failed to create product type",
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
          <CardTitle>Create Product Type</CardTitle>
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

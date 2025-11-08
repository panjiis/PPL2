"use client";

import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { useSession } from "@/lib/context/session";
import { createPOSProduct, fetchPOSProductGroups, fetchProducts, updatePOSProductByCode } from "@/lib/utils/api";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Select, SelectOption } from "../ui/select";
import { POSProduct } from "@/lib/types/pos/products";
import { Product } from "@/lib/types/inventory/products";
import { Checkbox } from "../ui/checkbox";
import { POSProductGroup } from "@/lib/types/pos/product-groups";

function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose}>
      <Card className="min-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </Modal>
  );
}

const initialForm: {
  product_group_id?: number;
  product_code: string;
  product_name: string;
  product_price: string;
  cost_price: string;
  commission_eligible: boolean;
  requires_service_employee: boolean;
  image_url: string;
  color: string;
  is_active: boolean;
} = {
  product_group_id: 1,
  product_code: "",
  product_name: "",
  product_price: "",
  cost_price: "",
  commission_eligible: false,
  requires_service_employee: false,
  image_url: "",
  color: "",
  is_active: false,
};

export function CreatePOSProductModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (product: POSProduct) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<SelectOption[]>([]);
  const [allProductGroups, setAllProductGroups] = useState<POSProductGroup[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...initialForm });

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProducts = async () => {
      try {
        const res = await fetchProducts(session.token);
        setAllProducts(res);
        setProducts(res.map((p) => ({ value: p.product_code, label: p.product_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load products",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    loadProducts();
  }, [session?.token, open, toast]);

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProductGroups = async () => {
      try {
        const res = await fetchPOSProductGroups(session.token);
        setAllProductGroups(res);
        setProductGroups(res.map((p) => ({ value: p.id.toString(), label: p.product_group_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load product groups",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    loadProductGroups();
  }, [session?.token, open, toast]);

  useEffect(() => {
    if (form.requires_service_employee) {
      setForm(prev => ({ ...prev, product_code: "", product_name: "" }));
    }
  }, [form.requires_service_employee]);

  const handleSelectProductGroup = (value: string | null) => {
    if (!value) return setForm(prev => ({ ...prev, product_group_id: undefined })); // or null if allowed
    const id = Number(value);
    const group = allProductGroups.find(p => p.id === id);
    if (group) {
      setForm(prev => ({
        ...prev,
        product_group_id: group.id,
        product_group_name: group.product_group_name,
      }));
    }
  };

  const handleSelectProduct = (product_code: string | null) => {
    if (!product_code) return setForm(prev => ({ ...prev, product_code: "", product_name: "" }));
    const product = allProducts.find(p => p.product_code === product_code);
    if (product) {
      setForm(prev => ({
        ...prev,
        product_code: product.product_code,
        product_name: product.product_name,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") value = value === "" ? "" : Number(value);
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to create a POS product.",
      });
    }
    setLoading(true);
    try {
      const { product_code, ...rest } = form;
      const payload = product_code ? { product_code, ...rest } : rest;
      const created = await createPOSProduct(session.token, payload);
      onCreated(created);

      toast({
        variant: "success",
        title: "POS Product Created",
        description: `${created.product_name} was created successfully.`,
      });

      setForm({ ...initialForm });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to create POS product",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Create POS Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Product Group"
          options={productGroups}
          value={form.product_group_id?.toString() || null}
          onChange={handleSelectProductGroup}
          placeholder="Select a product group"
          searchable
        />
        <span className="grid grid-cols-2">
          <Checkbox
            label="Commission Eligible"
            name="commission_eligible"
            checked={form.commission_eligible}
            onChange={(checked) => 
              setForm((prev) => ({ ...prev, commission_eligible: checked }))} 
          />
          <Checkbox
            label="Requires Service Employee"
            name="requires_service_employee"
            checked={form.requires_service_employee}
            onChange={(checked) => 
              setForm((prev) => ({ ...prev, requires_service_employee: checked }))}
          />
        </span>
        {!form.requires_service_employee && (
          <Select
            label="Select Product"
            options={products}
            value={form.product_code || null}
            onChange={handleSelectProduct}
            placeholder="Select a product"
            searchable
          />
        )}
        <Input 
          label="Product Code"
          name="product_code"
          value={form.product_code}
          onChange={handleChange}
          disabled
          required
        />
        <Input
          label="Product Name"
          name="product_name"
          value={form.product_name}
          onChange={handleChange}
          required
        />
        <Input
          label="Product Price"
          name="product_price"
          value={form.product_price}
          onChange={handleChange}
          variant="currency"
          required
        />
        <Input
          label="Cost Price"
          name="cost_price"
          value={form.cost_price}
          onChange={handleChange}
          variant="currency"
          required
        />
        <Input
          label="Image URL"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
        />
        {form.image_url && (
          <div className="mt-2 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.image_url}
              alt="Product Preview"
              className="w-100 aspect-square object-cover rounded border"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://via.placeholder.com/128?text=No+Image";
              }}
            />
          </div>
        )}
        <Input
          label="Color"
          name="color"
          value={form.color}
          onChange={handleChange}
        />
        <Checkbox
          label="Is Active?"
          name="is_active"
          checked={form.is_active}
          onChange={(checked) => 
            setForm((prev) => ({ ...prev, is_active: checked }))}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function UpdatePOSProductModal({
  open,
  onClose,
  onUpdated,
  product,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (product: POSProduct) => void;
  product: POSProduct | null;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<SelectOption[]>([]);
  const [allProductGroups, setAllProductGroups] = useState<POSProductGroup[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  const [form, setForm] = useState({ ...initialForm, ...product });

  useEffect(() => {
    if (product) {
      setForm({ ...initialForm, ...product });
    }
  }, [product]);

  useEffect(() => {
    if (form.requires_service_employee) {
      setForm(prev => ({ ...prev, product_code: "", product_name: "" }));
    }
  }, [form.requires_service_employee]);

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProducts = async () => {
      try {
        const res = await fetchProducts(session.token);
        setAllProducts(res);
        setProducts(res.map((p) => ({ value: p.product_code, label: p.product_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load products",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    loadProducts();
  }, [session?.token, open, toast]);

  const handleSelectProduct = (product_code: string | null) => {
    if (!product_code) return setForm(prev => ({ ...prev, product_code: "", product_name: "" }));
    const product = allProducts.find(p => p.product_code === product_code);
    if (product) {
      setForm(prev => ({
        ...prev,
        product_code: product.product_code,
        product_name: product.product_name,
      }));
    }
  };

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProductGroups = async () => {
      try {
        const res = await fetchPOSProductGroups(session.token);
        setAllProductGroups(res);
        setProductGroups(res.map((p) => ({ value: p.id.toString(), label: p.product_group_name })));
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load product groups",
          description: err instanceof Error ? err.message : "Unknown error",
        });
      }
    };
    loadProductGroups();
  }, [session?.token, open, toast]);

  const handleSelectProductGroup = (value: string | null) => {
    if (!value) return setForm(prev => ({ ...prev, product_group_id: undefined })); // or null if allowed
    const id = Number(value);
    const group = allProductGroups.find(p => p.id === id);
    if (group) {
      setForm(prev => ({
        ...prev,
        product_group_id: group.id,
        product_group_name: group.product_group_name,
      }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") value = value === "" ? "" : Number(value);
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a POS product.",
      });
    }
    setLoading(true);
    try {
      const updated = await updatePOSProductByCode(session.token, form.product_code, form);
      onUpdated(updated);

      toast({
        variant: "success",
        title: "POS Product Updated",
        description: `${updated.product_name} was updated successfully.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update POS product",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Update POS Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Product Group"
          options={productGroups}
          value={form.product_group_id?.toString() || null}
          onChange={handleSelectProductGroup}
          placeholder="Select a product group"
          searchable
        />
        <span className="grid grid-cols-2">
          <Checkbox label="Commission Eligible" name="commission_eligible" checked={form.commission_eligible} onChange={(checked) => setForm((prev) => ({ ...prev, commission_eligible: checked }))} />
          <Checkbox label="Requires Service Employee" name="requires_service_employee" checked={form.requires_service_employee} onChange={(checked) => setForm((prev) => ({ ...prev, requires_service_employee: checked }))} />
        </span>
        {!form.requires_service_employee && (
          <Select
            label="Select Product"
            options={products}
            value={form.product_code || null}
            onChange={handleSelectProduct}
            placeholder="Select a product"
            searchable
          />
        )}
        <Input label="Product Code" name="product_code" value={form.product_code} onChange={handleChange} disabled required />
        <Input label="Product Name" name="product_name" value={form.product_name} onChange={handleChange} required disabled />
        {/* <Input label="Product Price" name="product_price" value={form.product_price} variant="currency" onChange={handleChange} />
        <Input label="Cost Price" name="cost_price" value={form.cost_price} variant="currency"onChange={handleChange} /> */}
        <Input
          label="Product Price"
          name="product_price"
          variant="currency"
          value={form.product_price ? parseFloat(form.product_price) : 0}
          onValueChange={(val) => setForm(prev => ({ ...prev, product_price: val?.toString() || "" }))}
          required
        />
        <Input
          label="Cost Price"
          name="cost_price"
          variant="currency"
          value={form.cost_price ? parseFloat(form.cost_price) : 0}
          onValueChange={(val) => setForm(prev => ({ ...prev, cost_price: val?.toString() || "" }))}
          required
        />
        <Input label="Image URL" name="image_url" value={form.image_url} onChange={handleChange} />
        <Input label="Color" name="color" value={form.color} onChange={handleChange} />
        <Checkbox
          label="Is Active?"
          name="is_active"
          checked={form.is_active}
          onChange={(checked) => 
            setForm((prev) => ({ ...prev, is_active: checked }))}
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading || !form.product_code}>{loading ? "Updating..." : "Update"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}

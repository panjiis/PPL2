"use client";

import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { useSession } from "@/lib/context/session";
import { createDiscount, fetchPOSProducts, updateDiscountById } from "@/lib/utils/api";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Select, SelectOption } from "../ui/select";
import { Discount, DiscountRequest } from "@/lib/types/pos/discounts";
// CHANGED: Import the new string formatter
import { toDate, toApiISOString } from "@/lib/utils/string";
import { POSProduct } from "@/lib/types/pos/products";
import DatePicker from "../ui/date-picker";

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

const discountTypes: SelectOption[] = [
  { value: "1", label: "Percentage" },
  { value: "2", label: "Fixed Amount" },
  { value: "3", label: "Buy X get Y" },
];

export function CreateDiscountModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (discount: Discount) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [allProducts, setAllProducts] = useState<POSProduct[]>([]);
  const { session } = useSession();
  const { toast } = useToast();

  const [form, setForm] = useState({
    discount_name: "",
    discount_type: 1,
    discount_value: "",
    product_code: "",
    product_group_id: 0,
    min_quantity: 0,
    buy_quantity: 0,
    get_quantity: 0,
    max_usage_per_transaction: "",
    valid_from: null as Date | null,
    valid_until: null as Date | null,
  });

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProducts = async () => {
      try {
        const res = await fetchPOSProducts(session.token);
        setAllProducts(res);
        setProducts(
          res.map((p: POSProduct) => ({
            value: p.product_code,
            label: p.product_name,
          }))
        );
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
    if (!product_code) {
      setForm(prev => ({ ...prev, product_code: "" }))
      return
    }
    const product = allProducts.find(p => p.product_code === product_code)
    if (product) {
      setForm(prev => ({ ...prev, product_code: product.product_code }))
    }
  }

  const handleSelectDiscountType = (discount_type: number) => {
    setForm(prev => ({ ...prev, discount_type }));
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
        description: "You must be logged in to create a POS discount.",
      });
    }

    setLoading(true);
    try {
      const payload: DiscountRequest = {
        discount_name: form.discount_name,
        discount_type: Number(form.discount_type),
        product_code: form.product_code || undefined,
        product_group_id: form.product_group_id || undefined,
        min_quantity: form.min_quantity || undefined,
        max_usage_per_transaction: form.max_usage_per_transaction || undefined,
        // CHANGED: Convert Date object to API string format
        valid_from: toApiISOString(form.valid_from) || undefined,
        valid_until: toApiISOString(form.valid_until) || undefined,
      };

      if (payload.max_usage_per_transaction === "") {
        delete payload.max_usage_per_transaction;
      }

      if (form.discount_type === 3) {
        payload.buy_quantity = form.buy_quantity;
        payload.get_quantity = form.get_quantity;
      } else if (form.discount_value !== "") {
        payload.discount_value = form.discount_value;
      }

      const created = await createDiscount(session.token, payload);
      onCreated(created);

      toast({
        variant: "success",
        title: "POS Discount Created",
        description: `${created.discount_name} was created successfully.`,
      });

      setForm({
        discount_name: "",
        discount_type: 1,
        discount_value: "",
        product_code: "",
        product_group_id: 0,
        min_quantity: 0,
        buy_quantity: 0,
        get_quantity: 0,
        max_usage_per_transaction: "",
        valid_from: null,
        valid_until: null,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to create POS discount",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Create Discount">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Product"
          options={products}
          value={form.product_code || null}
          onChange={handleSelectProduct}
          placeholder="Select a product"
          searchable
        />
        <Input label="Product Code" name="product_code" value={form.product_code} disabled />
        <Input label="Discount Name" name="discount_name" value={form.discount_name} onChange={handleChange} />
        <Select
          label="Select Discount Type"
          options={discountTypes}
          value={form.discount_type.toString()}
          onChange={(v) => handleSelectDiscountType(Number(v))}
          placeholder="Select a discount type"
        />
        {form.discount_type === 1 && (
          <Input
            label="Discount Value (%)"
            name="discount_value"
            type="number"
            step={0.01}
            min={0}
            max={100}
            value={form.discount_value}
            onChange={e => {
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = 0;
              if (val < 0) val = 0;
              if (val > 100) val = 100;
              setForm(prev => ({ ...prev, discount_value: val.toString() }));
            }}
          />
        )}
        {form.discount_type === 2 && (
          <Input
            label="Discount Value"
            name="discount_value"
            value={form.discount_value}
            variant="currency"
            onChange={handleChange}
          />
        )}
        {form.discount_type === 3 && (
          <>
            <Input label="Buy Quantity" name="buy_quantity" type="number" value={form.buy_quantity} onChange={handleChange} />
            <Input label="Get Quantity" name="get_quantity" type="number" value={form.get_quantity} onChange={handleChange} />
          </>
        )}
        <Input label="Min. Quantity" name="min_quantity" type="number" value={form.min_quantity} onChange={handleChange} />
        <Input
          label="Max Usage Per Transaction"
          name="max_usage_per_transaction"
          variant="currency"
          value={form.max_usage_per_transaction}
          onChange={handleChange}
        />
        <DatePicker
          label="Valid From"
          mode="single"
          variant="timeToMinutes"
          value={form.valid_from}
          onConfirm={(date) =>
            setForm((prev) => ({
              ...prev,
              valid_from: date instanceof Date ? date : null,
            }))
          }
        />

        <DatePicker
          label="Valid Until"
          mode="single"
          variant="timeToMinutes"
          value={form.valid_until}
          onConfirm={(date) =>
            setForm((prev) => ({
              ...prev,
              valid_until: date instanceof Date ? date : null,
            }))
          }
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function UpdateDiscountModal({
  open,
  onClose,
  onUpdated,
  discount,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (discount: Discount) => void;
  discount: Discount | null;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();

  const [form, setForm] = useState({
    discount_name: "",
    discount_type: 1,
    discount_value: "",
    product_code: "",
    product_group_id: 0,
    min_quantity: 0,
    buy_quantity: 0,
    get_quantity: 0,
    max_usage_per_transaction: "",
    valid_from: null as Date | null,
    valid_until: null as Date | null,
  });

  useEffect(() => {
    if (discount) {
      setForm({
        discount_name: discount.discount_name || "",
        discount_type: Number(discount.discount_type) || 1,
        discount_value: discount.discount_value || "",
        product_code: discount.product_code || "",
        product_group_id: discount.product_group_id || 0,
        min_quantity: discount.min_quantity || 0,
        buy_quantity: discount.buy_quantity || 0,
        get_quantity: discount.get_quantity || 0,
        max_usage_per_transaction: discount.max_usage_per_transaction || "",
        valid_from: toDate(discount.valid_from),
        valid_until: toDate(discount.valid_until),
      });
    }
  }, [discount, open]);

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProducts = async () => {
      try {
        const res = await fetchPOSProducts(session.token);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") value = value === "" ? "" : Number(value);
    setForm(prev => ({ ...prev, [e.target.name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !discount) {
      return toast({
        variant: "danger",
        title: "Unauthorized",
        description: "You must be logged in to update a discount.",
      });
    }

    setLoading(true);
    try {
      const payload: DiscountRequest = {
        discount_name: form.discount_name,
        discount_type: Number(form.discount_type),
        product_code: form.product_code || undefined,
        product_group_id: form.product_group_id || undefined,
        min_quantity: form.min_quantity || undefined,
        max_usage_per_transaction: form.max_usage_per_transaction || undefined,
        // CHANGED: Convert Date object to API string format
        valid_from: toApiISOString(form.valid_from) || undefined,
        valid_until: toApiISOString(form.valid_until) || undefined,
      };

      if (payload.max_usage_per_transaction === "") {
        delete payload.max_usage_per_transaction;
      }

      if (form.discount_type === 3) {
        payload.buy_quantity = form.buy_quantity;
        payload.get_quantity = form.get_quantity;
      } else if (form.discount_value !== "") {
        payload.discount_value = form.discount_value;
      }

      const updated = await updateDiscountById(session.token, discount.id, payload);
      onUpdated(updated);

      toast({
        variant: "success",
        title: "POS Discount Updated",
        description: `${updated.discount_name} was updated successfully.`,
      });

      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to update POS discount",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Update Discount">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Product"
          options={products}
          value={form.product_code || null}
          onChange={(v: string | null) => setForm(prev => ({ ...prev, product_code: v || "" }))}
          placeholder="Select a product"
          searchable
        />
        <Input label="Product Code" name="product_code" value={form.product_code} disabled />
        <Input label="Discount Name" name="discount_name" value={form.discount_name} onChange={handleChange} />
        <Select
          label="Select Discount Type"
          options={discountTypes}
          value={form.discount_type.toString()}
          onChange={v => setForm(prev => ({ ...prev, discount_type: Number(v) }))}
          placeholder="Select a discount type"
        />
        {form.discount_type === 1 && (
          <Input
            label="Discount Value (%)"
            name="discount_value"
            type="number"
            step={0.01}
            min={0}
            max={100}
            value={form.discount_value}
            onChange={e => {
              let val = parseFloat(e.target.value);
              if (isNaN(val)) val = 0;
              if (val < 0) val = 0;
              if (val > 100) val = 100;
              setForm(prev => ({ ...prev, discount_value: val.toString() }));
            }}
          />
        )}
        {form.discount_type === 2 && (
          <Input
            label="Discount Value"
            name="discount_value"
            value={form.discount_value}
            variant="currency"
            onChange={handleChange}
          />
        )}
        {form.discount_type === 3 && (
          <>
            <Input label="Buy Quantity" name="buy_quantity" type="number" value={form.buy_quantity} onChange={handleChange} />
            <Input label="Get Quantity" name="get_quantity" type="number" value={form.get_quantity} onChange={handleChange} />
          </>
        )}
        <Input label="Min. Quantity" name="min_quantity" type="number" step={1} min={1} value={form.min_quantity} onChange={handleChange} />
        <Input
          label="Max Usage Per Transaction"
          name="max_usage_per_transaction"
          variant="currency"
          value={form.max_usage_per_transaction}
          onChange={(e) =>
            setForm(prev => ({
              ...prev,
              max_usage_per_transaction: e.target.value,
            }))
          }
        />
        <DatePicker
          label="Valid From"
          mode="single"
          variant="timeToMinutes"
          value={form.valid_from}
          onConfirm={(date) =>
            setForm((prev) => ({
              ...prev,
              valid_from: date instanceof Date ? date : null,
            }))
          }
        />

        <DatePicker
          label="Valid Until"
          mode="single"
          variant="timeToMinutes"
          value={form.valid_until}
          onConfirm={(date) =>
            setForm((prev) => ({
              ...prev,
              valid_until: date instanceof Date ? date : null,
            }))
          }
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}
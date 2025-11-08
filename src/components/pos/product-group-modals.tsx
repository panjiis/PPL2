"use client";

import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { useSession } from "@/lib/context/session";
import { createPOSProductGroup, fetchPOSProductGroups, updatePOSProductGroupById } from "@/lib/utils/api";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Select, SelectOption } from "../ui/select";
import { POSProductGroup } from "@/lib/types/pos/product-groups";

function ModalShell({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
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

export function CreatePOSProductGroupModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: (product: POSProductGroup) => void }) {
  const [loading, setLoading] = useState(false);
  const { session } = useSession();
  const { toast } = useToast();
  const [allProductGroups, setAllProductGroups] = useState<POSProductGroup[]>([]);
  const [productGroups, setProductGroups] = useState<SelectOption[]>([]);
  const [form, setForm] = useState({
    product_group_name: "",
    parent_group_id: null as number | null,
    color: "",
    image_url: "",
  });

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProductGroups = async () => {
      try {
        const res = await fetchPOSProductGroups(session.token);
        setAllProductGroups(res);
        setProductGroups([{ value: "", label: "No parent" }, ...res.map(p => ({ value: p.id.toString(), label: p.product_group_name }))]);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load product groups", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };
    loadProductGroups();
  }, [session?.token, open, toast]);

  const handleSelectParentGroup = (value: string | null) => {
    setForm(prev => ({
      ...prev,
      parent_group_id: value ? Number(value) : null
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") value = value === "" ? "" : Number(value);
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token) return toast({ variant: "danger", title: "Unauthorized", description: "You must be logged in to create a POS product." });

    setLoading(true);
    try {
      const created = await createPOSProductGroup(session.token, { ...form });
      onCreated(created);

      toast({ variant: "success", title: "POS Product Group Created", description: `${created.product_group_name} was created successfully.` });

      setForm({ product_group_name: "", parent_group_id: null, color: "", image_url: "" });
      onClose();
    } catch (err) {
      console.error(err);
      toast({ variant: "danger", title: "Failed to create POS product", description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Create POS Product Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Parent Product Group"
          options={productGroups}
          value={form.parent_group_id?.toString() ?? null}
          onChange={handleSelectParentGroup}
          placeholder="Select a parent group"
          searchable
        />
        <Input label="Product Group Name" name="product_group_name" value={form.product_group_name} onChange={handleChange} required />
        <Input label="Color" name="color" value={form.color} onChange={handleChange} />
        <Input label="Image URL" name="image_url" value={form.image_url} onChange={handleChange} />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function UpdatePOSProductGroupModal({ open, onClose, onUpdated, productGroup }: { open: boolean; onClose: () => void; onUpdated: (product: POSProductGroup) => void; productGroup: POSProductGroup | null }) {
  const [loading, setLoading] = useState(false);
  const [productGroups, setProductGroups] = useState<SelectOption[]>([]);
  const [allProductGroups, setAllProductGroups] = useState<POSProductGroup[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  const [form, setForm] = useState({
    product_group_name: "",
    parent_group_id: null as number | null,
    color: "",
    image_url: "",
  });

  useEffect(() => {
    if (productGroup) {
      setForm({
        product_group_name: productGroup.product_group_name || "",
        parent_group_id: productGroup.parent_group_id ?? null,
        color: productGroup.color || "",
        image_url: productGroup.image_url || "",
      });
    }
  }, [productGroup, open]);

  useEffect(() => {
    if (!session?.token || !open) return;
    const loadProductGroups = async () => {
      try {
        const res = await fetchPOSProductGroups(session.token);
        setAllProductGroups(res);
        setProductGroups([{ value: "", label: "No parent" }, ...res.map((p) => ({ value: p.id.toString(), label: p.product_group_name }))]);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load product groups", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };
    loadProductGroups();
  }, [session?.token, open, toast]);

  const handleSelectParentGroup = (value: string | null) => {
    setForm(prev => ({
      ...prev,
      parent_group_id: value ? Number(value) : null
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value: string | number = e.target.value;
    if (e.target.type === "number") value = value === "" ? "" : Number(value);
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.token || !productGroup) return toast({ variant: "danger", title: "Unauthorized", description: "You must be logged in to update a POS product group." });

    setLoading(true);
    try {
      const updated = await updatePOSProductGroupById(session.token, productGroup.id, { ...form });
      onUpdated(updated);

      toast({ variant: "success", title: "POS Product Group Updated", description: `${updated.product_group_name} was updated successfully.` });

      setForm({ product_group_name: "", parent_group_id: null, color: "", image_url: "" });
      onClose();
    } catch (err) {
      console.error(err);
      toast({ variant: "danger", title: "Failed to update POS product group", description: err instanceof Error ? err.message : "Unknown error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Update POS Product Group">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Select Parent Product Group"
          options={productGroups}
          value={form.parent_group_id?.toString() ?? null}
          onChange={handleSelectParentGroup}
          placeholder="Select a parent group"
          searchable
        />
        <Input label="Product Group Name" name="product_group_name" value={form.product_group_name} onChange={handleChange} required />
        <Input label="Color" name="color" value={form.color} onChange={handleChange} />
        <Input label="Image URL" name="image_url" value={form.image_url} onChange={handleChange} />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={loading}>{loading ? "Updating..." : "Update"}</Button>
        </div>
      </form>
    </ModalShell>
  );
}
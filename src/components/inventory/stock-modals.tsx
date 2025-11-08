"use client";

import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { MovementTypeMap, MovementTypeSchema, ReferenceTypeMap, ReferenceTypeSchema, type AggregatedStock, type Stock } from "@/lib/types/inventory/stocks";
import { Input } from "../ui/input";
import { useSession } from "@/lib/context/session";
import { fetchProducts, fetchUsers, fetchWarehouses, releaseStock, reserveStock, transferStock, updateStock } from "@/lib/utils/api";
import { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";
import { Warehouse } from "@/lib/types/inventory/warehouses";
import { Select, SelectOption } from "../ui/select";
import { User } from "@/lib/types/user/users";
import { Product } from "@/lib/types/inventory/products";

interface BaseProps {
  open: boolean;
  onClose: () => void;
  stock: AggregatedStock;
}

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

export function StocksWarehouse({ open, onClose, stock }: BaseProps) {
  const warehouses = stock.warehouses ?? [];
  const totalAvailable = warehouses.reduce((s, w) => s + (w.available ?? 0), 0);
  const totalReserved = warehouses.reduce((s, w) => s + (w.reserved ?? 0), 0);

  return (
    <ModalShell open={open} onClose={onClose} title={`Warehouses for ${stock.product_name}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Available</TableHead>
            <TableHead className="text-right">Reserved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((w, idx) => (
            <TableRow key={idx}>
              <TableCell>{w.name ?? `Warehouse ${idx + 1}`}</TableCell>
              <TableCell className="text-right font-mono">{w.available ?? 0}</TableCell>
              <TableCell className="text-right font-mono">{w.reserved ?? 0}</TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-border font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{totalAvailable}</TableCell>
            <TableCell className="text-right">{totalReserved}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </ModalShell>
  );
}

export function StocksAvailable({ open, onClose, stock }: BaseProps) {
  const warehouses = stock.warehouses ?? [];
  const total = warehouses.reduce((s, w) => s + (w.available ?? 0), 0);

  return (
    <ModalShell open={open} onClose={onClose} title={`Available quantity for ${stock.product_name}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Available</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((w, idx) => (
            <TableRow key={idx}>
              <TableCell>{w.name ?? `Warehouse ${idx + 1}`}</TableCell>
              <TableCell className="text-right font-mono">{w.available ?? 0}</TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-border font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{total}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </ModalShell>
  );
}

export function StocksReserved({ open, onClose, stock }: BaseProps) {
  const warehouses = stock.warehouses ?? [];
  const total = warehouses.reduce((s, w) => s + (w.reserved ?? 0), 0);

  return (
    <ModalShell open={open} onClose={onClose} title={`Reserved quantity for ${stock.product_name}`}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Warehouse</TableHead>
            <TableHead className="text-right">Reserved</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {warehouses.map((w, idx) => (
            <TableRow key={idx}>
              <TableCell>{w.name ?? `Warehouse ${idx + 1}`}</TableCell>
              <TableCell className="text-right font-mono">{w.reserved ?? 0}</TableCell>
            </TableRow>
          ))}
          <TableRow className="border-t border-border font-semibold">
            <TableCell>Total</TableCell>
            <TableCell className="text-right">{total}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="mt-6 flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </ModalShell>
  );
}

export function ReserveStock({
  open,
  onClose,
  onReserved,
}: {
  open: boolean;
  onClose: () => void;
  onReserved: (stock: Stock) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [form, setForm] = useState({
    product_code: "",
    warehouse_id: 1,
    quantity: 1,
    reference_id: "",
    reserved_by: session?.user?.id || 1
  });

  useEffect(() => {
    if (!session?.token || !open) return;

    const loadWarehouses = async () => {
      try {
        const res = await fetchWarehouses(session.token);
        const opts = res.map((r: Warehouse) => ({ value: String(r.id), label: r.warehouse_name }));
        setWarehouses(opts);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load warehouses", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };

    const loadUsers = async () => {
      try {
        const res = await fetchUsers(session.token);
        const opts = res.map((r: User) => ({ value: String(r.id), label: r.username }));
        setUsers(opts);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load users", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };

    const loadProducts = async () => {
      try {
        const res = await fetchProducts(session.token);
        const opts = res.map((r: Product) => ({ value: r.product_code, label: r.product_name }));
        setProducts(opts);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load products", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };

    loadWarehouses();
    loadUsers();
    loadProducts();
  }, [session?.token, open, toast]);

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
        description: "You must be logged in to reserve a stock.",
      });
    }

    setLoading(true);
    try {
      const reserved = await reserveStock(session.token, { ...form });
      onReserved(reserved);

      toast({
        variant: "success",
        title: "Stock Reserved",
        description: `${reserved.product?.product_name} was reserved successfully.`,
      });

      setForm({
        product_code: "",
        warehouse_id: 1,
        quantity: 1,
        reference_id: "",
        reserved_by: session.user?.id || 1
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to reserve stock",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Reserve Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Product"
          options={products}
          value={form.product_code}
          onChange={(v) => {
            if (v !== null) setForm({ ...form, product_code: v });
          }}
          placeholder="Select a product"
          searchable
        />
        <Select
          label="Warehouse"
          options={warehouses}
          value={form.warehouse_id ? String(form.warehouse_id) : ""}
          onChange={(v) => setForm({ ...form, warehouse_id: Number(v) })}
          placeholder="Select a warehouse"
        />
        <Input
          label="Quantity"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          type="number"
          onChange={handleChange}
        />
        <Input
          label="Reference ID"
          name="reference_id"
          placeholder="Reference ID"
          value={form.reference_id}
          onChange={handleChange}
          required
        />
        <Select
          label="Reserved By"
          options={users}
          value={form.reserved_by ? String(form.reserved_by) : ""}
          onChange={(v) => setForm({ ...form, reserved_by: Number(v) })}
          placeholder="Select a user"
          disabled
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Reserving..." : "Reserve"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function ReleaseStock({
  open,
  onClose,
  onReleased,
}: {
  open: boolean;
  onClose: () => void;
  onReleased: (stock: Stock) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  const [form, setForm] = useState({
    product_code: "",
    warehouse_id: 1,
    quantity: 1,
    reference_id: "",
    released_by: session?.user?.id || 1
  });
  
  useEffect(() => {
    if (!session?.token || !open) return
    const loadWarehouses = async () => {
      try {
        const res = await fetchWarehouses(session.token)
        const opts = res.map((r: Warehouse) => ({ value: String(r.id), label: r.warehouse_name }))
        setWarehouses(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load users",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }

    const loadUsers = async () => {
      try {
        const res = await fetchUsers(session.token)
        const opts = res.map((r: User) => ({ value: String(r.id), label: r.username }))
        setUsers(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load users",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }

    const loadProducts = async () => {
      try {
        const res = await fetchProducts(session.token);
        const opts = res.map((r: Product) => ({ value: r.product_code, label: r.product_name }));
        setProducts(opts);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load products", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };

    loadWarehouses()
    loadUsers()
    loadProducts()
  }, [session?.token, open, toast])

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
        description: "You must be logged in to release a stock.",
      });
    }

    setLoading(true);
    try {
      const released = await releaseStock(session.token, { ...form });
      onReleased(released);

      toast({
        variant: "success",
        title: "Stock Released",
        description: `${released.product?.product_name} was released successfully.`,
      });

      setForm({
        product_code: "",
        warehouse_id: 1,
        quantity: 1,
        reference_id: "",
        released_by: session.user?.id || 1
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to release stock",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Release Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* <Input
          label="Product Code"
          name="product_code"
          placeholder="Product Code"
          value={form.product_code}
          onChange={handleChange}
          required
        /> */}
        <Select
          label="Product"
          options={products}
          value={form.product_code}
          onChange={(v) => {
            if (v !== null) setForm({ ...form, product_code: v });
          }}
          placeholder="Select a product"
          searchable
        />
        <Select
          label="Warehouse"
          options={warehouses}
          value={form.warehouse_id ? String(form.warehouse_id) : ""}
          onChange={(v) => setForm({ ...form, warehouse_id: Number(v) })}
          placeholder="Select a warehouse"
        />
        <Input
          label="Quantity"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          type="number"
          onChange={handleChange}
        />
        <Input
          label="Reference ID"
          name="reference_id"
          placeholder="Reference ID"
          value={form.reference_id}
          onChange={handleChange}
          required
        />
        <Select
          label="Released By"
          options={users}
          value={form.released_by ? String(form.released_by) : ""}
          onChange={(v) => setForm({ ...form, released_by: Number(v) })}
          placeholder="Select a user"
          disabled
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Releasing..." : "Release"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function TransferStock({
  open,
  onClose,
  onTransferred,
}: {
  open: boolean;
  onClose: () => void;
  onTransferred: (stock: Stock) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [form, setForm] = useState({
    product_code: "",
    from_warehouse_id: 1,
    to_warehouse_id: 1,
    quantity: 1,
    notes: "",
    transferred_by: session?.user?.id || 1
  });

  useEffect(() => {
    if (!session?.token || !open) return
    const loadWarehouses = async () => {
      try {
        const res = await fetchWarehouses(session.token)
        const opts = res.map((r: Warehouse) => ({ value: String(r.id), label: r.warehouse_name }))
        setWarehouses(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load users",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }
    
    const loadUsers = async () => {
      try {
        const res = await fetchUsers(session.token)
        const opts = res.map((r: User) => ({ value: String(r.id), label: r.username }))
        setUsers(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load users",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }
  
    const loadProducts = async () => {
      try {
        const res = await fetchProducts(session.token);
        const opts = res.map((r: Product) => ({ value: r.product_code, label: r.product_name }));
        setProducts(opts);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load products", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };

    loadWarehouses()
    loadUsers()
    loadProducts()
  }, [session?.token, open, toast])

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
        description: "You must be logged in to transfer a stock.",
      });
    }

    setLoading(true);
    try {
      const transferred = await transferStock(session.token, { ...form });
      onTransferred(transferred.destination_stock);

      toast({
        variant: "success",
        title: "Stock Transferred",
        description: `${transferred.source_stock.product?.product_name} was transferred successfully.`,
      });

      setForm({
        product_code: "",
        from_warehouse_id: 1,
        to_warehouse_id: 1,
        quantity: 1,
        notes: "",
        transferred_by: session?.user?.id || 1
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to reserve stock",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Transfer Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* <Input
          label="Product Code"
          name="product_code"
          placeholder="Product Code"
          value={form.product_code}
          onChange={handleChange}
          required
        /> */}
        <Select
          label="Product"
          options={products}
          value={form.product_code}
          onChange={(v) => {
            if (v !== null) setForm({ ...form, product_code: v });
          }}
          placeholder="Select a product"
          searchable
        />
        <Select
          label="Origin Warehouse"
          options={warehouses}
          value={form.from_warehouse_id ? String(form.from_warehouse_id) : ""}
          onChange={(v) => setForm({ ...form, from_warehouse_id: Number(v) })}
          placeholder="Select a warehouse"
        />
        <Select
          label="Destination Warehouse"
          options={warehouses}
          value={form.to_warehouse_id ? String(form.to_warehouse_id) : ""}
          onChange={(v) => setForm({ ...form, to_warehouse_id: Number(v) })}
          placeholder="Select a warehouse"
        />
        <Input
          label="Quantity"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          type="number"
          onChange={handleChange}
        />
        <Input
          label="Notes"
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          required
        />
        <Select
          label="Transferred By"
          options={users}
          value={form.transferred_by ? String(form.transferred_by) : ""}
          onChange={(v) => setForm({ ...form, transferred_by: Number(v) })}
          placeholder="Select a user"
          disabled
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Transferring..." : "Transfer"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}

export function UpdateStock({
  open,
  onClose,
  onUpdated,
}: {
  open: boolean;
  onClose: () => void;
  onUpdated: (stock: Stock) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [users, setUsers] = useState<SelectOption[]>([]);
  const { session } = useSession();
  const { toast } = useToast();
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [form, setForm] = useState({
    product_code: "",
    warehouse_id: 1,
    movement_type: 1,
    quantity: 1,
    unit_cost: "",
    reference_type: 1,
    reference_id: "",
    notes: "",
    created_by: session?.user?.id || 1
  });

  const movementOptions: SelectOption[] = MovementTypeSchema.options.map((type) => ({
    value: String(MovementTypeMap[type]),
    label: type,
  }));

  const referenceOptions: SelectOption[] = ReferenceTypeSchema.options.map((type) => ({
    value: String(ReferenceTypeMap[type]),
    label: type,
  }));

  useEffect(() => {
    if (!session?.token || !open) return
    const loadWarehouses = async () => {
      try {
        const res = await fetchWarehouses(session.token)
        const opts = res.map((r: Warehouse) => ({ value: String(r.id), label: r.warehouse_name }))
        setWarehouses(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load users",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }
    
    const loadUsers = async () => {
      try {
        const res = await fetchUsers(session.token)
        const opts = res.map((r: User) => ({ value: String(r.id), label: r.username }))
        setUsers(opts)
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to load users",
          description: err instanceof Error ? err.message : "Unknown error",
        })
      }
    }
  
    const loadProducts = async () => {
      try {
        const res = await fetchProducts(session.token);
        const opts = res.map((r: Product) => ({ value: r.product_code, label: r.product_name }));
        setProducts(opts);
      } catch (err) {
        toast({ variant: "danger", title: "Failed to load products", description: err instanceof Error ? err.message : "Unknown error" });
      }
    };

    loadWarehouses()
    loadUsers()
    loadProducts()
  }, [session?.token, open, toast])

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
        description: "You must be logged in to transfer a stock.",
      });
    }

    setLoading(true);
    try {
      const updated = await updateStock(session.token, { ...form });
      onUpdated(updated.updated_stock);

      toast({
        variant: "success",
        title: "Stock Updated",
        description: `${updated.updated_stock.product?.product_name} was updated successfully.`,
      });

      setForm({
        product_code: "",
        warehouse_id: 1,
        movement_type: 1,
        quantity: 1,
        unit_cost: "",
        reference_type: 1,
        reference_id: "",
        notes: "",
        created_by: session?.user?.id || 1
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        variant: "danger",
        title: "Failed to reserve stock",
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell open={open} onClose={onClose} title="Update Stock">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Product"
          options={products}
          value={form.product_code}
          onChange={(v) => {
            if (v !== null) setForm({ ...form, product_code: v });
          }}
          placeholder="Select a product"
          searchable
        />
        <Select
          label="Warehouse"
          options={warehouses}
          value={String(form.warehouse_id)}
          onChange={(v) => setForm({ ...form, warehouse_id: Number(v) })}
          placeholder="Select a warehouse"
        />
        <Select
          label="Movement Type"
          options={movementOptions}
          value={String(form.movement_type)}
          onChange={(v) => setForm({ ...form, movement_type: Number(v) })}
          placeholder="Select movement type"
        />
        <Select
          label="Reference Type"
          options={referenceOptions}
          value={String(form.reference_type)}
          onChange={(v) => setForm({ ...form, reference_type: Number(v) })}
          placeholder="Select reference type"
        />
        <Input
          label="Quantity"
          name="quantity"
          placeholder="Quantity"
          value={form.quantity}
          type="number"
          onChange={handleChange}
        />
        <Input
          label="Notes"
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={handleChange}
          required
        />
        <Select
          label="Updated By"
          options={users}
          value={String(form.created_by)}
          onChange={(v) => setForm({ ...form, created_by: Number(v) })}
          placeholder="Select a user"
          disabled
        />
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </ModalShell>
  );
}
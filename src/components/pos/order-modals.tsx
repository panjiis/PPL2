"use client";

import { Modal } from "@/components/ui/modal";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "../ui/use-toast";
import { useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchOrderByID } from "@/lib/utils/api";
import { Order } from "@/lib/types/pos/orders";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { formatCurrency } from "../ui/input";
import { toDateTimeSeconds } from "@/lib/utils/string";

function ModalShell({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
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

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[hsl(var(--foreground))]/10 ${className ?? ""}`}
    />
  );
}


export function OrderDetailModal({
  open,
  onClose,
  id
}: {
  open: boolean;
  onClose: () => void;
  id?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<Order>();
  const { session } = useSession();
  const { toast } = useToast();

    useEffect(() => {
        if (!session?.token || !open || id == null) return;

        const loadOrder = async () => {
            setLoading(true);
            try {
            const res = await fetchOrderByID(session.token, id);
            setOrder(res);
            } catch (err) {
            toast({
                variant: "danger",
                title: "Failed to load order",
                description: err instanceof Error ? err.message : "Unknown error",
            });
            } finally {
            setLoading(false);
            }
        };

        loadOrder();
    }, [session?.token, open, id, toast]);

    useEffect(() => {
        if (!open) {
            setOrder(undefined);
            setLoading(false);
        }
    }, [open]);

    if (loading) {
        return (
            <ModalShell open={open} onClose={onClose}>
                <div className="space-y-4">
                    <Skeleton className="h-6 w-1/3" />      {/* title */}
                    <br />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            </ModalShell>
        );
    }

  return (
    <ModalShell open={open} onClose={onClose} title={`Order ${order?.document_number}`}>
        <Card>
            <Table className="border-none">
                <TableBody>
                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))] w-1/3">ID</TableCell>
                    <TableCell>{order?.id}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">Date</TableCell>
                    <TableCell>{toDateTimeSeconds(order?.orders_date)}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">Subtotal</TableCell>
                    <TableCell>{formatCurrency(Number(order?.subtotal))}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">
                        Tax (10%)
                    </TableCell>
                    <TableCell>{formatCurrency(Number(order?.tax_amount))}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">Discount</TableCell>
                    <TableCell>- {formatCurrency(Number(order?.discount_amount))}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">
                        Service Fee ({order?.payment_type?.payment_name})
                    </TableCell>
                    <TableCell>
                        {order?.additional_info
                        ? order?.additional_info.match(/Payment Fee:\s([\d.]+)/)?.[1]
                            ? formatCurrency(
                                Number(order?.additional_info.match(/Payment Fee:\s([\d.]+)/)?.[1])
                            )
                            : "-"
                        : "-"}
                    </TableCell>
                    </TableRow>

                    <TableRow className="font-bold">
                    <TableCell>Total</TableCell>
                    <TableCell>{formatCurrency(Number(order?.total_amount))}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">
                        Payment Method
                    </TableCell>
                    <TableCell>{order?.payment_type?.payment_name}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">Notes</TableCell>
                    <TableCell>{order?.notes || "-"}</TableCell>
                    </TableRow>

                    <TableRow>
                    <TableCell className="text-[hsl(var(--muted-foreground))]">
                        Additional Info
                    </TableCell>
                    <TableCell>{order?.additional_info || "-"}</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Card>
        <Card className="mt-4">
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {order?.order_items.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                        {item.product?.product_name ?? item.product_code}
                        </TableCell>

                        <TableCell className="text-center">
                        {item.quantity}
                        </TableCell>

                        <TableCell className="text-right">
                        {formatCurrency(Number(item.line_total))}
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Card>
        <div className="mt-6 flex justify-end">
            <Button variant="outline" onClick={onClose}>
            Close
            </Button>
        </div>
    </ModalShell>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "@/lib/context/session";
import {
  approveCommission,
  bulkApproveCommissions,
  fetchCommissions,
  recalculateCommission,
  rejectCommission,
} from "@/lib/utils/api/";
import { CommissionCalculation, getCommissionStatusLabel } from "@/lib/types/commission/commissions";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  RotateCcwIcon,
  CheckIcon,
  XIcon,
  WalletIcon,
  CalculatorIcon,
  BadgeCheckIcon,
  ClockIcon,
  DollarSignIcon,
  XCircleIcon,
} from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DataView } from "@/components/ui/data-view";
import { ColumnDef } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/string";
import { Select, SelectOption } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  BulkCalculateCommissionModal,
  CalculateCommissionModal,
  PayCommissionModal,
} from "@/components/commissions/commission-modals";
import { Badge } from "@/components/ui/badge";

export default function CommissionsPage() {
  const { session, isLoading } = useSession();
  const [commissions, setCommissions] = useState<CommissionCalculation[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toLocaleString("en-US", { month: "long" }).toLowerCase()
  );
  const [selectedRows, setSelectedRows] = useState<CommissionCalculation[]>([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedCommissionId, setSelectedCommissionId] = useState<number | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const monthOptions: SelectOption[] = [
    { value: "january", label: "January" },
    { value: "february", label: "February" },
    { value: "march", label: "March" },
    { value: "april", label: "April" },
    { value: "may", label: "May" },
    { value: "june", label: "June" },
    { value: "july", label: "July" },
    { value: "august", label: "August" },
    { value: "september", label: "September" },
    { value: "october", label: "October" },
    { value: "november", label: "November" },
    { value: "december", label: "December" },
  ];

  // Load commissions once when session token is available
  useEffect(() => {
    if (!session?.token) return;

    const fetchData = async () => {
      try {
        const data = await fetchCommissions(session.token);

        // hard guard — normalize invalid values
        setCommissions(Array.isArray(data) ? data : []);
      } catch (err) {
        toast({
          variant: "danger",
          title: "Failed to fetch commissions",
          description: err instanceof Error ? err.message : "Unknown error",
        });

        setCommissions([]); // ensure non-null on failure
      }
    };

    fetchData();
  }, [session?.token, toast]);

  // Filter by month
  const filteredCommissions = useMemo(() => {
    return commissions.filter((item) => {
      const date = new Date(item.calculation_period_start);
      const monthName = date
        .toLocaleString("en-US", { month: "long" })
        .toLowerCase();
      return monthName === selectedMonth.toLowerCase();
    });
  }, [commissions, selectedMonth]);

  const disabledMonths = useMemo(() => {
    const uniqueMonths = new Set(
      commissions.map((c) =>
        new Date(c.calculation_period_start).toISOString().slice(5, 7)
      )
    );
    return Array.from(uniqueMonths);
  }, [commissions]);

  // --- ACTION HANDLERS ---
  const handleRecalculate = async (id: number) => {
    if (!session) return;
    setLoadingAction(true);
    try {
      const payload = {
        recalculated_by: session.user.id,
        notes: `Commission recalculated by ${session.user.firstname} ${session.user.lastname} on ${new Date().toISOString().split('T')[0]}`,
      };

      await recalculateCommission(session.token, id, payload);

      toast({
        title: "Recalculated",
        description: "Commission successfully recalculated.",
      });

      const data = await fetchCommissions(session.token);
      setCommissions(data);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!session) return;
    setLoadingAction(true);
    try {
      const payload = {
        approved_by: session.user.id,
        approval_notes: `Commission calculation verified and approved by ${session.user.firstname} ${session.user.lastname} on ${new Date().toISOString().split('T')[0]}`,
      };
      
      await approveCommission(session.token, id, payload);
      toast({ title: "Approved", description: "Commission approved successfully." });
      const data = await fetchCommissions(session.token);
      setCommissions(data);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReject = async (id: number) => {
    if (!session) return;
    setLoadingAction(true);
    try {
      const payload = {
        rejected_by: session.user.id,
        rejection_reason: `unspecified`,
      };

      await rejectCommission(session.token, id, payload);
      toast({ title: "Rejected", description: "Commission rejected." });
      const data = await fetchCommissions(session.token);
      setCommissions(data);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleBulkApprove = async () => {
    if (!session) return;
    if (selectedRows.length === 0) {
      toast({
        variant: "warning",
        title: "No selections",
        description: "Please select at least one commission.",
      });
      return;
    }

    setLoadingAction(true);
    try {
      const payload = {
        commission_calculation_ids: selectedRows.map((c) => c.id),
        approved_by: session.user.id,
        approval_notes: `Commission calculation verified and approved by ${session.user.firstname} ${session.user.lastname} on ${new Date().toISOString().split('T')[0]}.`,
      };
      await bulkApproveCommissions(session.token, payload);
      toast({
        variant: "success",
        title: "Bulk Approved",
        description: `${payload.commission_calculation_ids.length} selected commissions approved.`,
      });
      const data = await fetchCommissions(session.token);
      setCommissions(data);
    } finally {
      setLoadingAction(false);
    }
  };

  // --- TABLE COLUMNS ---
  const columns: ColumnDef<CommissionCalculation>[] = [
    { accessorKey: "employee.employee_name", header: "Employee" },
    {
      accessorKey: "total_sales",
      header: "Total Sales",
      cell: ({ row }) => <div>{formatCurrency(Number(row.original.total_sales))}</div>,
    },
    {
      accessorKey: "total_commission",
      header: "Total Commission",
      cell: ({ row }) => <div>{formatCurrency(Number(row.original.total_commission))}</div>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        let variant: "default" | "secondary" | "destructive" | "outline" = "secondary";
        let statusStyle = ""
        let icon = null;
        
        switch(status) {
          case 1: // CommissionStatus.COMMISSION_STATUS_DRAFT
            variant = "destructive";
            icon = <XCircleIcon size={12} />;
            break;
          case 2: // CommissionStatus.COMMISSION_STATUS_CALCULATED
            variant = "outline";
            icon = <ClockIcon size={12} />;
            break;
          case 3: // CommissionStatus.COMMISSION_STATUS_APPROVED
            variant = "secondary";
            icon = <BadgeCheckIcon size={12} />;
            break;
          case 4: // CommissionStatus.COMMISSION_STATUS_PAID
            variant = "default";
            icon = <DollarSignIcon size={12} />;;
            statusStyle = "bg-[hsl(var(--success-background))] hover:bg-[hsl(var(--success-background))]/80 text-[hsl(var(--success-foreground))]";
            break;
          default:
            variant = "secondary";
            icon = null;
        }
        
        return (
          <Badge 
            variant={variant}
            className={statusStyle} 
            icon={icon}
          >
            {getCommissionStatusLabel(status)}
          </Badge>
        );
      },
    },
    { accessorKey: "calculated_by_name", header: "Calculated by" },
    { accessorKey: "notes", header: "Notes" },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/personnel/commissions/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleRecalculate(row.original.id)}>
              <RotateCcwIcon className="mr-2 h-4 w-4" /> Recalculate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleApprove(row.original.id)}>
              <CheckIcon className="mr-2 h-4 w-4" /> Approve
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleReject(row.original.id)}>
              <XIcon className="mr-2 h-4 w-4" /> Reject
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedCommissionId(row.original.id);
                setPayModalOpen(true);
              }}
            >
              <WalletIcon className="mr-2 h-4 w-4" /> Pay
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) return null;

  return (
    <div>
      <Breadcrumbs />

      <CalculateCommissionModal
        open={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        onCalculated={async () => {
          if (!session?.token) return;
          const data = await fetchCommissions(session.token);
          setCommissions(data);
        }}
        disabledMonths={disabledMonths}
      />

      <BulkCalculateCommissionModal
        open={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onCalculated={async () => {
          if (!session?.token) return;
          const data = await fetchCommissions(session.token);
          setCommissions(data);
        }}
      />

      <PayCommissionModal
        open={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        onPaid={async () => {
          if (!session?.token) return;
          const data = await fetchCommissions(session.token);
          setCommissions(data);
        }}
        commissionCalculationId={selectedCommissionId}
      />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Monthly Commissions</h1>
          <p className="text-[hsl(var(--muted-foreground))]">
            Manage, calculate, and approve commissions by month.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <Select
            className="w-[180px]"
            options={monthOptions}
            value={selectedMonth}
            onChange={(val) => setSelectedMonth(String(val ?? "january"))}
          />
          <Button variant="outline" onClick={() => setShowBulkModal(true)} disabled={loadingAction}>
            <CalculatorIcon className="mr-2 h-4 w-4" /> Bulk Calculate
          </Button>
          <Button variant="outline" onClick={handleBulkApprove} disabled={loadingAction}>
            <CheckIcon className="mr-2 h-4 w-4" /> Bulk Approve
          </Button>
          <Button variant="outline" onClick={() => setShowCalcModal(true)} disabled={loadingAction}>
            <CalculatorIcon className="mr-2 h-4 w-4" /> Calculate
          </Button>
        </div>
      </div>

      <DataView
        data={filteredCommissions}
        columns={columns}
        searchableColumn="employee.employee_name"
        enableSelection
        onSelectionChange={setSelectedRows}
        caption={`Commissions for ${selectedMonth.charAt(0).toUpperCase() + selectedMonth.slice(1)}.`}
        renderListItem={(item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/personnel/commissions/${item.id}`)}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex justify-between hover:bg-accent cursor-pointer"
          >
            <div>
              <p className="font-semibold">{item.employee.employee_name}</p>
              <p className="text-sm text-muted-foreground">
                Total {formatCurrency(Number(item.total_commission))} · Status {getCommissionStatusLabel(item.status)}
              </p>
            </div>
          </div>
        )}
        renderGridItem={(item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/personnel/commissions/${item.id}`)}
            className="border border-[hsl(var(--border))] rounded-lg p-4 hover:bg-accent cursor-pointer"
          >
            <h3 className="font-bold">{item.employee.employee_name}</h3>
            <p className="text-sm text-muted-foreground">
              Total: {formatCurrency(Number(item.total_commission))}
            </p>
            <p className="text-xs text-muted-foreground">
              Status: {getCommissionStatusLabel(item.status)}
            </p>
          </div>
        )}
      />
    </div>
  );
}

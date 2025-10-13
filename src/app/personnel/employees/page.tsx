"use client";

import { useEffect, useState } from "react";
import { fetchEmployees } from "@/lib/utils/api";
import { Employee } from "@/lib/types/employees";
import { useSession } from "@/lib/context/session";
import { Button } from "@/components/ui/button";
import { CreateEmployeeModal } from "@/components/users/create-employee-modal";
import { UpdateEmployeeModal } from "@/components/users/update-employee-modal";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { DataView } from "@/components/ui/data-view";
import { formatCurrency } from "@/lib/utils/string";
import { ColumnDef } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown";

export default function EmployeesPage() {
  const { session } = useSession();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    if (!session?.token) return;
    fetchEmployees(session.token)
      .then((res) => setEmployees(res))
      .catch((err) => console.error(err));
  }, [session]);

  const handleEmployeeCreated = (newEmp: Employee) => {
    setEmployees((prev) => [...prev, newEmp]);
  };

  const handleEmployeeUpdated = (updated: Employee) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === updated.id ? updated : e))
    );
    setEditingEmployee(null);
  };

  const employeeColumns: ColumnDef<Employee>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "employee_name", header: "Name" },
    { accessorKey: "position", header: "Position" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "address", header: "Address" },
    { accessorKey: "hire_date", header: "Date Hired" },
    {
      accessorKey: "base_salary",
      header: "Base Salary",
      cell: ({ row }) => <div>{formatCurrency(Number(row.original.base_salary))}</div>,
    },
    {
      accessorKey: "commission_type",
      header: "Commission Type",
      cell: ({ row }) =>
        <div>{row.original.commission_type === 1 ? "Percentage" : "Fixed"}</div>,
    },
    {
      accessorKey: "commission_rate",
      header: "Commission Rate",
      cell: ({ row }) => <div>{row.original.commission_rate}%</div>,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/employees/${row.original.id}`)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setEditingEmployee(row.original);
                setEditModalOpen(true);
              }}
            >
              Edit Employee
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div>
      <CreateEmployeeModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={handleEmployeeCreated}
      />

      <UpdateEmployeeModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingEmployee(null);
        }}
        onUpdated={handleEmployeeUpdated}
        employee={editingEmployee}
      />

      <Breadcrumbs />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Employee Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your employees here.</p>
        </div>
        <Button size="icon" onClick={() => setCreateModalOpen(true)}>
          <PlusIcon />
        </Button>
      </div>

      <DataView
        data={employees}
        columns={employeeColumns}
        searchableColumn="employee_name"
        caption="List of employees in system."
        onCreate={() => setCreateModalOpen(true)}
        renderListItem={(employee) => (
          <div
            key={employee.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-between hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/employees/${employee.id}`)}
          >
            <div className="flex items-center gap-4">
              <span className={`h-2 w-2 rounded-full ${employee.is_active ? "bg-green-500" : "bg-red-500"}`} />
              <div>
                <p className="font-semibold">{employee.employee_name} <span className="font-normal text-[hsl(var(--muted-foreground))]">{employee.position}</span></p>
                { employee.phone || employee.email && (
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">{employee.phone} {employee.email && ('&middot;')} {employee.email}</p>
                )}
              </div>
            </div>
          </div>
        )}
        renderGridItem={(employee) => (
          <div
            key={employee.id}
            className="border border-[hsl(var(--border))] rounded-lg p-4 flex flex-col justify-between gap-4 bg-card hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/inventory/employees/${employee.id}`)}
          >
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${employee.is_active ? "bg-green-500" : "bg-red-500"}`} />
                <h3 className="font-bold text-lg">{employee.employee_name} <span className="font-normal text-[hsl(var(--muted-foreground))]">{employee.position}</span></h3>
              </div>
              { employee.phone || employee.email && (
                <p className="text-sm font-mono bg-[hsl(var(--foreground))]/5 px-2 py-1 rounded w-fit max-w-full mt-2 truncate">{employee.phone} {employee.email && ('&middot;')} {employee.email}</p>
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}

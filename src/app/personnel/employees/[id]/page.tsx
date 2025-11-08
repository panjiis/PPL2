"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchEmployeeById } from "@/lib/utils/api";
import type { Employee } from "@/lib/types/user/employees";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import { UpdateEmployeeModal } from "@/components/users/update-employee-modal";

export default function EmployeePage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = use(params);
  const { session } = useSession();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    fetchEmployeeById(session.token, id).then(setEmployee);
  }, [session, id]);

  if (!employee) return <div>Loading...</div>;

  const handleEmployeeUpdated = (updated: Employee) => {
    setEmployee(updated)
  };

  return (
    <div>
      <Breadcrumbs />

      <UpdateEmployeeModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        onUpdated={handleEmployeeUpdated}
        employee={employee}
      />

      <div className="flex items-center justify-center md:justify-start w-full mt-8 md:mt-16 mb-10">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <div className="relative overflow-hidden rounded-xl w-full aspect-square md:h-full">
            <Image src={`https://placehold.co/512?text=${employee.employee_name}`} alt="Employee Image" fill className="object-cover"/>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">{employee.employee_name} <span className="text-[hsl(var(--muted-foreground))] font-normal">{employee.position}</span></h1>
                <p className="text-[hsl(var(--muted-foreground))] font-mono">{employee.phone} &middot; {employee.email}</p>
              </div>
              <Button size="icon" onClick={() => setEditModalOpen(true)}>
                <SquarePenIcon />
              </Button>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}

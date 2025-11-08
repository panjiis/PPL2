"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchRoleById } from "@/lib/utils/api";
import type { Role } from "@/lib/types/user/roles";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
// import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import { UpdateRoleModal } from "@/components/users/update-role-modal";

export default function RolePage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = use(params);
  const { session } = useSession();
  const [role, setRole] = useState<Role | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    fetchRoleById(session.token, id).then(setRole);
  }, [session, id]);

  if (!role) return <div>Loading...</div>;

  const handleRoleUpdated = (updated: Role) => {
    setRole(updated)
  };

  return (
    <div>
      <Breadcrumbs />

      <UpdateRoleModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        onUpdated={handleRoleUpdated}
        role={role}
      />

      <div className="flex items-center justify-center md:justify-start w-full mt-8 md:mt-16 mb-10">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          {/* <div className="relative overflow-hidden rounded-xl w-full aspect-square md:h-full">
            <Image src={`https://placehold.co/512?text=${role.role_name}`} alt="Role Image" fill className="object-cover"/>
          </div> */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">{role.role_name}<span className="text-[hsl(var(--muted-foreground))] font-normal"> &middot; Access Level {role.access_level}</span></h1>
              </div>
              <Button size="icon" onClick={() => setEditModalOpen(true)}>
                <SquarePenIcon />
              </Button>
            </div>
          </div>
          <div>

          </div>
        </div>
      </div>
      
    </div>
  );
}

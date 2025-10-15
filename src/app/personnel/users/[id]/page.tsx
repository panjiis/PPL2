"use client";

import { use, useEffect, useState } from "react";
import { useSession } from "@/lib/context/session";
import { fetchUserById } from "@/lib/utils/api";
import type { User } from "@/lib/types/users";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";
import { UpdateUserModal } from "@/components/users/update-user-modal";

export default function UserPage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = use(params);
  const { session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (!session?.token) return;
    fetchUserById(session.token, id).then(setUser);
  }, [session, id]);

  if (!user) return <div>Loading...</div>;

  const handleUserUpdated = (updated: User) => {
    setUser(updated)
  };

  return (
    <div>
      <Breadcrumbs />

      <UpdateUserModal
        open={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
        }}
        onUpdated={handleUserUpdated}
        user={user}
      />

      <div className="flex items-center justify-center md:justify-start w-full mt-8 md:mt-16 mb-10">
        <div className="grid md:grid-cols-2 gap-8 w-full">
          <div className="relative overflow-hidden rounded-xl w-full aspect-square md:h-full">
            <Image src={`https://placehold.co/512?text=${user.firstname + ' ' + user.lastname}`} alt="User Image" fill className="object-cover"/>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <div>
                <h1 className="text-2xl font-bold">{user.firstname} {user.lastname} <span className="text-[hsl(var(--muted-foreground))] font-normal">{user.role?.role_name}</span></h1>
                <p className="text-[hsl(var(--muted-foreground))] font-mono">{user.username} &middot; {user.email}</p>
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

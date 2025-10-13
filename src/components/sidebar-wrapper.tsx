/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarHeader, SidebarContent, SidebarItem, SidebarFooter } from "@/components/ui/sidebar";
import { Menu, Home, Settings, LogOut, UsersIcon, PaletteIcon, IdCardLanyard, IdCard, ShieldUserIcon, ArchiveIcon, PackageIcon, WarehouseIcon, BoxesIcon, HandshakeIcon, TagsIcon, Code2Icon, ConstructionIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "@/lib/context/session";


interface Route {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: Route[];
}

export function SidebarWrapper({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const { session, signOut } = useSession();
  const pathname = usePathname();

  const ROUTES: Route[] = [
    { label: "Home", path: "/", icon: <Home /> },
    {
      label: "Inventory",
      path: "/inventory",
      icon: <ArchiveIcon />,
      children: [
        { label: "Products", path: "/inventory/products", icon: <PackageIcon /> },
        { label: "Product Types", path: "/inventory/product-types", icon: <TagsIcon /> },
        { label: "Stocks", path: "/inventory/stocks", icon: <BoxesIcon /> },
        { label: "Suppliers", path: "/inventory/suppliers", icon: <HandshakeIcon /> },
        { label: "Warehouses", path: "/inventory/warehouses", icon: <WarehouseIcon /> },
      ],
    },
    {
      label: "Personnel",
      path: "/personnel",
      icon: <UsersIcon />,
      children: [
        { label: "Employees", path: "/personnel/employees", icon: <IdCardLanyard /> },
        { label: "Roles", path: "/personnel/roles", icon: <ShieldUserIcon /> },
        { label: "Users", path: "/personnel/users", icon: <IdCard /> },
      ],
    },
    {
      label: "Settings",
      path: "/settings",
      icon: <Settings />,
      children: [
        { label: "Appearance", path: "/settings/appearance/", icon: <PaletteIcon /> }
      ],
    },
    {
      label: "Development",
      path: "/development",
      icon: <Code2Icon />,
      children: [
        { label: "Playground", path: "/playground", icon: <ConstructionIcon /> }
      ],
    },
  ];

    const renderRoute = (route: Route, depth = 0) => {
        const isActive = pathname === route.path;
        return (
            <div key={route.path} className="relative">
            <Link href={route.path} passHref>
                <SidebarItem
                icon={route.icon}
                active={isActive}
                className={`pl-${4 + depth * 4}`} 
                >
                {route.label}
                </SidebarItem>
            </Link>

            {route.children && (
                <div className="ml-4 border-l border-[hsl(var(--border))]">
                {route.children.map((child) => renderRoute(child, depth + 1))}
                </div>
            )}
            </div>
        );
    };



  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar */}
      {session && (
        <Sidebar
          className={`fixed top-0 left-0 h-full z-1000 w-fit bg-[hsl(var(--background))] transform transition-transform duration-300 ease-in-out
            ${visible ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 md:static md:flex-shrink-0
          `}
        >
          {/* Toggle button attached to sidebar (mobile only) */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-4 -right-14 md:hidden"
            onClick={() => setVisible(!visible)}
          >
            <Menu />
          </Button>

          {/* Sidebar header */}
          <SidebarHeader className="flex gap-2"> 
            <img src="https://placehold.co/48x48" alt="" className="rounded"/> 
            <div className="flex flex-col"> 
                <span className="font-bold text-lg">Ezel Carwash Cilodong</span> 
                <span className="text-sm text-[hsl(var(--muted-foreground))]">Powered by SYNTRA™</span> 
            </div> 
          </SidebarHeader>

          {/* Sidebar content */}
          <SidebarContent>
            {ROUTES.map(renderRoute)}
          </SidebarContent>

          {/* Sidebar footer */}
          <SidebarFooter className="flex-row justify-between items-center">
            <div className="flex flex-col">
                <span className="font-medium">{session.user?.username}</span>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">{session.user?.email}</span>
            </div>
            <Button variant="outline" size="icon" onClick={signOut}>
                <LogOut size={16} />
            </Button>
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Main content */}
      <main className="relative w-full p-4 md:p-8 pt-18 flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300">
        {children}
      </main>
    </div>
  );
}

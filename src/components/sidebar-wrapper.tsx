"use client";

import { useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar, SidebarHeader, SidebarContent, SidebarItem, SidebarFooter, SidebarTreeItem } from "@/components/ui/sidebar";
import { MenuIcon, LogOut, UsersIcon, PaletteIcon, IdCardLanyardIcon, IdCardIcon, ShieldUserIcon, ArchiveIcon, PackageIcon, WarehouseIcon, BoxesIcon, HandshakeIcon, TagsIcon, StoreIcon, TicketPercentIcon, ShoppingCartIcon, CreditCardIcon, ShapesIcon, ReceiptIcon, TruckIcon, MoreHorizontal, Languages, HomeIcon, SettingsIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "@/lib/context/session";
import { fetchStoreById } from "@/lib/utils/api";
import { StoreResponse } from "@/lib/types/user/store";
import Image from "next/image";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown";
import { useTranslation } from "react-i18next";

interface Route {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: Route[];
}

export function SidebarWrapper({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [store, setStore] = useState<StoreResponse>();
  const [imageError, setImageError] = useState(false);
  const { session, isLoading, signOut } = useSession();
  const pathname = usePathname();
  const { i18n, t } = useTranslation('sidebar');

  // Fetch store and apply theme
  useEffect(() => {
    if (isLoading || !session?.token) return;
    
    // Reset image error state when fetching new store data
    setImageError(false);
    
    // Fetch store data and apply theme if available
    const loadStoreAndTheme = async () => {
      try {
        const storeData = await fetchStoreById(session.token, 1);
        
        if (storeData) {
          setStore(storeData);
          
          // Apply theme from management_preferences
          if (storeData.management_preferences) {
            try {
              const themeColors = typeof storeData.management_preferences === 'string' 
                ? JSON.parse(storeData.management_preferences)
                : storeData.management_preferences;
              
              if (themeColors && typeof themeColors === 'object') {
                applyThemeColors(themeColors);
                localStorage.setItem("custom-theme", JSON.stringify(themeColors));
              }
            } catch (err) {
              console.warn("Could not parse theme from management_preferences:", err);
            }
          }
        }
      } catch (err) {
        console.warn("Store fetch failed, using defaults:", err);
        // App continues to work with default theme
      }
    };
    
    loadStoreAndTheme();
  }, [session, isLoading]);

  const applyThemeColors = (colors: Record<string, string>) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  };

  const isLogin = pathname === "/login";

  const ROUTES: Route[] = [
    { label: t("sidebar.home"), path: "/", icon: <HomeIcon size={16} /> },
    {
      label: t("sidebar.inventory"),
      path: "/inventory",
      icon: <ArchiveIcon size={16} />,
      children: [
        { label: t("sidebar.products"), path: "/inventory/products", icon: <PackageIcon size={16} /> },
        { label: t("sidebar.productTypes"), path: "/inventory/product-types", icon: <TagsIcon size={16} /> },
        { label: t("sidebar.stocks"), path: "/inventory/stocks", icon: <BoxesIcon size={16} /> },
        { label: t("sidebar.stockMovements"), path: "/inventory/stock-movements", icon: <TruckIcon size={16} /> },
        { label: t("sidebar.suppliers"), path: "/inventory/suppliers", icon: <HandshakeIcon size={16} /> },
        { label: t("sidebar.warehouses"), path: "/inventory/warehouses", icon: <WarehouseIcon size={16} /> },
      ],
    },
    {
      label: t("sidebar.personnel"),
      path: "/personnel",
      icon: <UsersIcon size={16} />,
      children: [
        { label: t("sidebar.commissions"), path: "/personnel/commissions", icon: <ReceiptIcon size={16} /> },
        { label: t("sidebar.employees"), path: "/personnel/employees", icon: <IdCardLanyardIcon size={16} /> },
        { label: t("sidebar.roles"), path: "/personnel/roles", icon: <ShieldUserIcon size={16} /> },
        { label: t("sidebar.users"), path: "/personnel/users", icon: <IdCardIcon size={16} /> },
      ],
    },
    {
      label: t("sidebar.pos"),
      path: "/pos",
      icon: <StoreIcon size={16} />,
      children: [
        { label: t("sidebar.discounts"), path: "/pos/discounts", icon: <TicketPercentIcon size={16} /> },
        { label: t("sidebar.orders"), path: "/pos/orders", icon: <ShoppingCartIcon size={16} /> },
        { label: t("sidebar.paymentTypes"), path: "/pos/payment-types", icon: <CreditCardIcon size={16} /> },
        { label: t("sidebar.products"), path: "/pos/products", icon: <PackageIcon size={16} /> },
        { label: t("sidebar.productGroups"), path: "/pos/product-groups", icon: <ShapesIcon size={16} /> },
      ],
    },
    {
      label: t("sidebar.settings"),
      path: "/settings",
      icon: <SettingsIcon size={16} />,
      children: [
        { label: t("sidebar.appearance"), path: "/settings/appearance/", icon: <PaletteIcon size={16} /> }
      ],
    },
  ];

  // Recursive function to render routes as tree items
  const renderTreeItem = (route: Route, depth = 0) => {
    const isActive = pathname === route.path;
    
    if (route.children && route.children.length > 0) {
      // Parent item with children
      return (
        <SidebarTreeItem
          key={route.path}
          label={route.label}
          icon={route.icon}
          defaultOpen={pathname.startsWith(route.path) && depth === 0}
          path={route.path}
          currentPath={pathname}
        >
          {route.children.map(child => renderTreeItem(child, depth + 1))}
        </SidebarTreeItem>
      );
    } else {
      // Leaf item without children
      return (
        <Link href={route.path} key={route.path} passHref>
          <SidebarItem
            icon={route.icon}
            active={isActive}
            className={`pl-${4 + depth * 4}`}
          >
            {route.label}
          </SidebarItem>
        </Link>
      );
    }
  };

  return (
    <div className="flex w-full h-screen overflow-hidden">
      {/* Sidebar */}
      {session && (
        <Sidebar
          className={`fixed top-0 left-0 h-full z-100 w-fit bg-[hsl(var(--background))] transform transition-transform duration-300 ease-in-out
            ${visible ? "translate-x-0" : "-translate-x-full"} 
            md:translate-x-0 md:static md:flex-shrink-0
          `}
        >
          {/* Toggle button attached to sidebar (mobile only) */}
          <Button
            variant="outline"
            size="icon"
            className="absolute top-5 -right-14 md:hidden"
            onClick={() => setVisible(!visible)}
          >
            <MenuIcon size={16} />
          </Button>

          {/* Sidebar header */}
          <SidebarHeader className="flex gap-2 items-center">
            {store?.image_url && !imageError ? (
              <Image
                src={store.image_url}
                alt={store.name || "Store Image"}
                width={40}
                height={40}
                className="rounded object-cover"
                onError={() => setImageError(true)}
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-primary-foreground" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-lg">{store?.name || "John Managerial"}</span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">Powered by SYNTRA™</span>
            </div>
          </SidebarHeader>

          {/* Sidebar content */}
          <SidebarContent>
            {ROUTES.map(renderTreeItem)}
          </SidebarContent>

          {/* Sidebar footer */}
          <SidebarFooter className="flex-row justify-between items-center">
            <div className="flex flex-col">
              <span className="font-medium">{session.user?.username}</span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{session.user?.email}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("sidebar.openMenu")}</span>
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" position="right">
                <DropdownMenuItem onClick={signOut}>
                  <LogOut size={16} className="mr-2" /> {t("sidebar.logout")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => void (async () => {
                    try {
                      const newLang = i18n.language === "en" ? "id" : "en";
                      await i18n.changeLanguage(newLang);
                    } catch (err) {
                      console.error("Language change failed:", err);
                    }
                  })()}
                >
                  <Languages size={16} className="mr-2" />
                  {i18n.language === "en" ? t("sidebar.changeToIndonesian") : t("sidebar.changeToEnglish")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
      )}

      {/* Main content */}
      <main
        className={`relative w-full flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300
          ${/* janky login padding removal for mobile layout */ isLogin ? "p-0" : "p-4 md:p-8 pt-18"}`}
      >
        {children}
      </main>
    </div>
  );
}
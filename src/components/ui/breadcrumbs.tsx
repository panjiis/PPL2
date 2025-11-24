"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useTranslation } from "react-i18next";

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumbs({ className }: BreadcrumbProps) {
  const pathname = usePathname();
  const { t } = useTranslation("common"); // use common.json namespace
  const segments = pathname?.split("/").filter(Boolean) || [];

  const items = [
    { label: t("breadcrumbs.home"), href: "/" },
    ...segments.map((seg, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/");
      const label = t(`breadcrumbs.${seg}`, { defaultValue: seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) });
      return { label, href };
    }),
  ];

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-[hsl(var(--muted-foreground))]", className)}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={item.href}>
            {!isLast ? (
              <Link href={item.href} className="hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-[hsl(var(--foreground))]">{item.label}</span>
            )}
            {!isLast && <ChevronRight className="w-4 h-4 mx-2" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

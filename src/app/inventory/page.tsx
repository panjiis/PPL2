"use client"
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarehouseIcon, ExternalLinkIcon, PackageIcon, BoxesIcon, HandshakeIcon, TagsIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function InventoryPage() {
    const router = useRouter();
    const { t } = useTranslation("inventory/index");

    return (
        <div>
            <Breadcrumbs />

            <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">{t("title")}</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">{t("description")}</p>
                </div>
            </div>

            <div className="h-full grid md:grid-cols-4 md:grid-rows-4 gap-4">
                <Card className="relative overflow-hidden">
                    <PackageIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.products.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory/products')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.products.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <TagsIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.productTypes.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory/product-types')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.productTypes.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <BoxesIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.stocks.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory/stocks')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.stocks.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <HandshakeIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.suppliers.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory/suppliers')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.suppliers.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <WarehouseIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.warehouses.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory/warehouses')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.warehouses.description")}</CardContent>
                </Card>
            </div>
        </div>
    );
}

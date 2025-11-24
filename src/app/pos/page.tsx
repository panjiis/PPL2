"use client"
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLinkIcon, PackageIcon, TicketPercentIcon, ShoppingCartIcon, CreditCardIcon, ShapesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function POSPage() {
    const router = useRouter();
    const { t } = useTranslation("pos");

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
                    <TicketPercentIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.discounts.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/pos/discounts')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.discounts.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <ShoppingCartIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.orders.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/pos/orders')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.orders.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <CreditCardIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.payments.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/pos/payments')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.payments.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <PackageIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.products.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/pos/products')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.products.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <ShapesIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.productGroups.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/pos/product-groups')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.productGroups.description")}</CardContent>
                </Card>
            </div>
        </div>
    );
}

"use client"
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLinkIcon, IdCardIcon, IdCardLanyardIcon, ReceiptIcon, ShieldUserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export default function PersonnelPage() {
    const router = useRouter();
    const { t } = useTranslation("personnel");

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
                    <ReceiptIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.commissions.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/personnel/commissions')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.commissions.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <IdCardLanyardIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.employees.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/personnel/employees')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.employees.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <ShieldUserIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.roles.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/personnel/roles')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.roles.description")}</CardContent>
                </Card>

                <Card className="relative overflow-hidden">
                    <IdCardIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                            {t("cards.users.title")}
                            <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/personnel/users')}>
                                <ExternalLinkIcon />
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">{t("cards.users.description")}</CardContent>
                </Card>
            </div>
        </div>
    );
}

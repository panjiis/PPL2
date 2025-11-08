"use client"
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExternalLinkIcon, PackageIcon, TicketPercentIcon, ShoppingCartIcon, CreditCardIcon, ShapesIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function POSPage() {
    const router = useRouter();
    return (
        <div>
            <Breadcrumbs />
            
            <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold">Point of Sale Hub</h1>
                    <p className="text-[hsl(var(--muted-foreground))]">Manage your point of sale here.</p>
                </div>
            </div>

            <div className="h-full grid md:grid-cols-4 md:grid-rows-4 gap-4">
                <Card className="relative overflow-hidden">
                    <TicketPercentIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                        Discounts
                        <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => (router.push('/pos/discounts'))}>
                            <ExternalLinkIcon/ >
                        </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">
                        Manage your discounts.
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <ShoppingCartIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                        Orders
                        <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => (router.push('/pos/orders'))}>
                            <ExternalLinkIcon/ >
                        </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">
                        Manage your orders.
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <CreditCardIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                        Payments
                        <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => (router.push('/pos/payments'))}>
                            <ExternalLinkIcon/ >
                        </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">
                        Manage your payments.
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <PackageIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                        Products
                        <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => (router.push('/pos/products'))}>
                            <ExternalLinkIcon/ >
                        </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">
                        Manage your products.
                    </CardContent>
                </Card>
                <Card className="relative overflow-hidden">
                    <ShapesIcon size={128} strokeWidth={0.5} className="shrink-0 absolute right-0 bottom-0 translate-1/5 opacity-5 pointer-events-none" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base md:text-2xl z-1">
                        Product Groups
                        <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => (router.push('/pos/product-groups'))}>
                            <ExternalLinkIcon/ >
                        </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="z-10">
                        Manage your product groups.
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
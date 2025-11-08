import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Package, AlertCircle, DollarSign, ShoppingCart, Clock, WarehouseIcon, TrendingUp, CalendarDays, Crown, CircleX, ExternalLinkIcon } from "lucide-react";
import { BarChart, ResponsiveContainer, XAxis, Tooltip, Bar, LineChart, CartesianGrid, YAxis, Line } from "recharts";
import type { Warehouse } from "@/lib/types/inventory/warehouses";
import { useRouter } from "next/navigation";

type AppRouterInstance = ReturnType<typeof useRouter>;

interface InventoryData {
  totalProducts: number;
  lowStockItems: number;
  stockByWarehouse: { name: string; value: number }[];
}

interface CommissionData {
  paid: string | number;
  pending: string | number;
  rejected: string | number;
}

interface SalesReportData {
  title: string;
  description: string;
  chartData: { name: string; value: number }[];
  yAxisFormatter: (value: number) => string;
}

interface RevenueData {
  title: string;
  value: string | number;
  trend: string;
}

interface TopProductData {
  title: string;
  name: string;
  unitsSold: string | number;
}

interface TransactionData {
  title: string;
  value: string | number;
  description: string;
}

const InventoryChart = ({ data }: { data: { name: string, value: number }[] }) => {
  return (
    <div className="w-full h-32">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'hsl(var(--muted))' }}
            contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))", borderRadius: "var(--radius)" }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SalesChart = ({ data, yAxisFormatter }: { data: { name: string, value: number }[], yAxisFormatter: (value: number) => string }) => {
  return (
    <div className="w-full h-64">
       <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickFormatter={yAxisFormatter} />
          <Tooltip
            contentStyle={{ background: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
          />
          <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InventoryWidget({ data, router }: { data: InventoryData, router: AppRouterInstance }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <Archive className="shrink-0"/>
          Inventory Summary
          <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory')}>
            <ExternalLinkIcon />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <Package className="h-6 w-6 mx-auto mb-1 text-primary"/>
            <p className="text-2xl font-bold">{data.totalProducts}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Total Product</p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <AlertCircle className="h-6 w-6 mx-auto mb-1 text-destructive"/>
            <p className="text-2xl font-bold">{data.lowStockItems}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">Low Stock</p>
          </div>
        </div>
        <div>
          <h2 className="font-semibold text-md mb-2">Stock by Warehouse</h2>
          <InventoryChart data={data.stockByWarehouse} />
        </div>
      </CardContent>
    </Card>
  );
}

export function WarehouseWidget({ warehouses, router }: { warehouses: Warehouse[], router: AppRouterInstance }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <WarehouseIcon className="shrink-0" />
          Warehouse Status
          <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory/warehouses')}>
            <ExternalLinkIcon />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {warehouses.length > 0 ? (
            warehouses.map((warehouse) => (
              <li key={warehouse.warehouse_code} className="flex justify-between">
                <span>{warehouse.warehouse_name}</span>
                <span className={`font-medium ${warehouse.is_active ? 'text-[hsl(var(--success-background))]' : 'text-[hsl(var(--danger-background))]'}`}>
                  {warehouse.is_active ? "Active" : "Inactive"}
                </span>
              </li>
            ))
          ) : (
            <p className="text-center text-[hsl(var(--muted-foreground))]">No warehouse data available.</p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export function CommissionWidget({ data, router }: { data: CommissionData, router: AppRouterInstance }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <DollarSign className="shrink-0"/>
          Commission Summary
          <Button variant="outline" size="icon" className="ml-auto gap-2" onClick={() => router.push('/inventory')}>
            <ExternalLinkIcon />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg">
          <ShoppingCart className="h-6 w-6 mb-1 text-[hsl(var(--success-background))]"/>
          <p className="font-bold text-lg">{data.paid}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Paid</p>
        </div>
        <div className="rounded-lg">
          <Clock className="h-6 w-6 mb-1 text-[hsl(var(--warning-background))]"/>
          <p className="font-bold text-lg">{data.pending}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Pending Approval</p>
        </div>
        <div className="rounded-lg">
          <CircleX className="h-6 w-6 mb-1 text-[hsl(var(--danger-background))]"/>
          <p className="font-bold text-lg">{data.rejected}</p>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Rejected</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function SalesReportWidget({ data }: { data: SalesReportData }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <TrendingUp/> {data.title}
        </CardTitle>
        <CardDescription>{data.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <SalesChart data={data.chartData} yAxisFormatter={data.yAxisFormatter}/>
      </CardContent>
    </Card>
  );
}

export function RevenueWidget({ data }: { data: RevenueData }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays size={18}/> {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{data.value}</p>
        <p className="text-xs text-[hsl(var(--foreground))]">{data.trend}</p>
      </CardContent>
    </Card>
  );
}

export function TopProductWidget({ data }: { data: TopProductData }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown size={18}/> {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{data.name}</p>
        <p className="text-sm text-[hsl(var(--foreground))]">{data.unitsSold}</p>
      </CardContent>
    </Card>
  );
}

export function TransactionsWidget({ data }: { data: TransactionData }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart size={18}/> {data.title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{data.value}</p>
        <p className="text-xs text-[hsl(var(--foreground))]">{data.description}</p>
      </CardContent>
    </Card>
  );
}

"use client"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Archive, Package, AlertCircle, DollarSign, ShoppingCart, Clock, WarehouseIcon, TrendingUp, CalendarDays, Crown, CircleX, ExternalLinkIcon, MedalIcon, TrophyIcon, BarChart3 } from "lucide-react";
import { BarChart, ResponsiveContainer, XAxis, Tooltip, Bar, LineChart, CartesianGrid, YAxis, Line } from "recharts";
import type { Warehouse } from "@/lib/types/inventory/warehouses";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/utils/string";
import { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';

type AppRouterInstance = ReturnType<typeof useRouter>;

interface InventoryData {
  title: string;
  totalProducts: number;
  lowStockItems: number;
  lowStockProducts: { name: string; stock: number }[];
}

interface CommissionData {
  paid: string | number;
  pending: string | number | undefined;
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

export interface TransactionData {
  title: string;
  value: string | number;
  itemsSold: string | number;
}

interface TransactionsWidgetProps {
  data: TransactionData;
}

type Performer = {
  employee_id: number;
  employee_name: string;
  total_sales: string | number;
}

type LeaderboardData = {
  title: string;
  topPerformers: Performer[];
}

type HourlyData = {
  hour: string;
  total_revenue: string;
  transaction_count?: number;
};

type PeakHoursDay = {
  day_of_week: number;
  hourly_data: HourlyData[];
};

type PeakHoursData = PeakHoursDay[];

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

export function InventoryWidget({
  data,
  router,
  limit = 5,
}: {
  data: InventoryData;
  router: AppRouterInstance;
  limit?: number;
}) {
  const lowStockList = data.lowStockProducts.slice(0, limit);
  const { t } = useTranslation("dashboard");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <Archive className="shrink-0" />
          {data.title}
          <Button
            variant="outline"
            size="icon"
            className="ml-auto gap-2"
            onClick={() => router.push("/inventory")}
          >
            <ExternalLinkIcon />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="p-4 bg-muted rounded-lg">
            <Package className="h-6 w-6 mx-auto mb-1 text-primary" />
            <p className="text-2xl font-bold">{data.totalProducts}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t("widgets.inventory.totalProducts")}
            </p>
          </div>
          <div className="p-4 bg-muted rounded-lg">
            <AlertCircle className="h-6 w-6 mx-auto mb-1 text-destructive" />
            <p className="text-2xl font-bold">{data.lowStockItems}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              {t("widgets.inventory.lowStockItems")}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="font-semibold text-md mb-2">{t("widgets.inventory.lowStockTitle")}</h2>
          {lowStockList.length > 0 ? (
            <>
              <ul className="space-y-2 text-sm">
                {lowStockList.map((item, i) => (
                  <li
                    key={i}
                    className="flex justify-between border-b border-[hsl(var(--border))] pb-1"
                  >
                    <Button variant="link" size="sm" className="p-0">{item.name}</Button>
                    <span className="font-medium text-[hsl(var(--color-danger-background))]">{item.stock}</span>
                  </li>
                ))}
              </ul>

              {data.lowStockProducts.length > limit && (
                <Button
                  variant="link"
                  onClick={() => router.push("/inventory/stocks")}
                  size="sm"
                  className="p-0 w-fit ml-auto"
                >
                  {t("widgets.inventory.andMore", { count: data.lowStockProducts.length - limit })}
                </Button>
              )}
            </>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              All products are sufficiently stocked.
            </p>
          )}
        </div>

      </CardContent>
    </Card>
  );
}

export function WarehouseWidget({
  warehouses,
  router,
}: {
  warehouses: Warehouse[] | null | undefined;
  router: AppRouterInstance;
}) {
  const { t } = useTranslation("dashboard");

  const list = Array.isArray(warehouses) ? warehouses : [];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <WarehouseIcon className="shrink-0" />
          {t("widgets.warehouse.title")}
          <Button
            variant="outline"
            size="icon"
            className="ml-auto gap-2"
            onClick={() => router.push('/inventory/warehouses')}
          >
            <ExternalLinkIcon />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {list.length > 0 ? (
            list.map((warehouse) => (
              <li
                key={warehouse.warehouse_code}
                className="flex justify-between"
              >
                <span>{warehouse.warehouse_name}</span>
                <span
                  className={`font-medium ${
                    warehouse.is_active
                      ? 'text-[hsl(var(--success-background))]'
                      : 'text-[hsl(var(--danger-background))]'
                  }`}
                >
                  {warehouse.is_active
                    ? t("widgets.warehouse.active")
                    : t("widgets.warehouse.inactive")}
                </span>
              </li>
            ))
          ) : (
            <p className="text-center text-[hsl(var(--muted-foreground))]">
              {t("widgets.warehouse.noData")}
            </p>
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
  const isPositive = parseFloat(data.trend) >= 0; // assuming trend is a string like "5%" or "-3%"
  const { t } = useTranslation("dashboard");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays size={18} /> {t("widgets.revenue.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{data.value}</p>
        <p
          className={`text-xs ${isPositive ? "text-green-600" : "text-red-600"}`}
        >
          {data.trend}
        </p>
      </CardContent>
    </Card>
  );
}

export function TopProductWidget({ data }: { data: TopProductData }) {
  const { t } = useTranslation("dashboard");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Crown size={18}/> {t("widgets.topProduct.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xl font-bold">{data.name}</p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">{data.unitsSold}</p>
      </CardContent>
    </Card>
  );
}

export function TransactionsWidget({ data }: TransactionsWidgetProps) {
  const { t } = useTranslation("dashboard");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShoppingCart size={18} /> {t("widgets.transactions.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold">{data.value}</p>
        <p className="text-xs text-[hsl(var(--muted-foreground))]">
          {t("widgets.transactions.description", {
            count: typeof data.itemsSold === "number" ? data.itemsSold : 0,
          })}
        </p>
      </CardContent>
    </Card>
  );
}

export function TopPerformersWidget({
  data,
  router,
  limit = 5,
}: {
  data: LeaderboardData;
  router: AppRouterInstance;
  limit?: number;
}) {
  const topList = data.topPerformers.slice(0, limit);

  const rankIcon = (rank: number) => {
    if (rank === 1) return <TrophyIcon className="text-yellow-500 h-4 w-4" />;
    if (rank === 2) return <MedalIcon className="text-gray-400 h-4 w-4" />;
    if (rank === 3) return <MedalIcon className="text-amber-600 h-4 w-4" />;
    return <span className="w-4 text-center text-[hsl(var(--muted-foreground))]">{rank}</span>;
  };

  const { t } = useTranslation("dashboard");

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <TrophyIcon className="shrink-0" />
            {t("widgets.topPerformers.title")}
          <Button
            variant="outline"
            size="icon"
            className="ml-auto gap-2"
            onClick={() => router.push("/employees")}
          >
            <ExternalLinkIcon />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {topList.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {topList.map((p, i) => (
              <li
                key={p.employee_id}
                className="flex justify-between items-center border-b border-[hsl(var(--border))] pb-1"
              >
                <div className="flex items-center gap-2">
                  {rankIcon(i + 1)}
                  <Button variant="link" size="sm" className="p-0" onClick={() => router.push(`/personnel/employees/${p.employee_id}`)}>{`${p.employee_name}`}</Button>
                </div>
                <span className="font-medium text-primary">
                  {formatCurrency(Number(p.total_sales))}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            {t("widgets.topPerformers.noData")}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function PeakHoursWidget({
  data,
  router,
}: {
  data: PeakHoursData;
  router: AppRouterInstance;
}) {
  const { t, i18n } = useTranslation("dashboard");

  // Get current day in English to match your data
  // const todayIndex = new Date().getDay(); // 0=Sunday, 6=Saturday
  // const englishWeekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  // const today = englishWeekdays[todayIndex];
  const today = new Date().getDay();
  const todayNormalized = today === 0 ? 7 : today;

  // Find initial day data
  // const initialDay =
  //   data.find(d => d.day_of_week.toLowerCase() === today.toLowerCase())?.day_of_week
  //   || data[0]?.day_of_week
  //   || "";
  const initialDay =
    data.find(d => d.day_of_week === todayNormalized)?.day_of_week ??
    data[0]?.day_of_week ??
    0;

  const [selectedDay, setSelectedDay] = useState<number>(initialDay);

  const dayData = useMemo(
    () => data.find(d => d.day_of_week === selectedDay)?.hourly_data || [],
    [data, selectedDay]
  );

  const formattedData = dayData.map(d => ({
    hour: d.hour,
    transaction_count: d.transaction_count ?? 0, // default to 0 if null or undefined
  }));

  // Get localized short day name
  // const getShortDay = (day: string) => {
  //   const index = englishWeekdays.findIndex(d => d.toLowerCase() === day.toLowerCase());
  //   if (index === -1) return day;
  //   // Use a date with that weekday (first week of 1970)
  //   const refDate = new Date(1970, 0, 4 + index); // Jan 4, 1970 = Sunday
  //   return refDate.toLocaleDateString(i18n.language, { weekday: "short" });
  // };
  const getShortDay = (dayNum: number) => {
    // Sunday of 1970-01-04 + dayNum
    const ref = new Date(1970, 0, 4 + dayNum);
    return ref.toLocaleDateString(i18n.language, { weekday: "short" });
  };


  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base md:text-2xl">
          <BarChart3 className="shrink-0" />
          {t("widgets.peakHours.title")}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {/* {data.map(d => (
            <Button
              key={d.day_of_week}
              size="sm"
              variant={selectedDay === d.day_of_week ? "default" : "outline"}
              onClick={() => setSelectedDay(d.day_of_week)}
            >
              {getShortDay(d.day_of_week)}
            </Button>
          ))} */}
          {data.map(d => (
            <Button
              key={d.day_of_week}
              size="sm"
              variant={selectedDay === d.day_of_week ? "default" : "outline"}
              onClick={() => setSelectedDay(d.day_of_week)}
            >
              {getShortDay(d.day_of_week)}
            </Button>
          ))}
        </div>

        <div className="h-64 w-full">
          {formattedData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={(hour) => hour.split('+')[0]}/>
                <YAxis
                  tickFormatter={v => v.toString()}
                  width={60}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    background: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  labelFormatter={(hour) => hour.split('+')[0]}
                  formatter={(v: number) => v.toString()}
                />
                <Line
                  type="monotone"
                  dataKey="transaction_count"
                  name="Transaction Count"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              {t("widgets.peakHours.noData", { day: selectedDay })}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
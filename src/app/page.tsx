'use client'
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { Select, type SelectOption } from "@/components/ui/select";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { fetchWarehouses, fetchDashboard } from "@/lib/utils/api";
import { type Warehouse } from "@/lib/types/inventory/warehouses";
import { mockApi, inventoryOverview } from "@/lib/data/mock-data";
import {
  InventoryWidget,
  WarehouseWidget,
  CommissionWidget,
  SalesReportWidget,
  RevenueWidget,
  TopProductWidget,
  TransactionsWidget,
  TopPerformersWidget,
  PeakHoursWidget
} from "@/components/dashboard/widgets";
import { DraggableWidget } from "@/components/dashboard/draggable-widget";
import { DashboardResponse, LowStockAlert, TopProduct } from "@/lib/types/analytics/dashboard";
import { formatCurrency } from "@/lib/utils/string";
import { PeakHoursResponse } from "@/lib/types/analytics/customer";
import { fetchPeakHours } from "@/lib/utils/api/analytics/customers";
import { useTranslation } from 'react-i18next';

const timeRangeOptions: SelectOption[] = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
  { value: "allTime", label: "All Time" },
];

type WidgetId = 'inventory' | 'warehouse' | 'commission' | 'peakHours' | 'salesReport' | 'revenue' | 'topProduct' | 'topPerformers' |'transactions';

interface WidgetLayout {
  id: WidgetId;
  gridClass: string;
}

export default function Home() {
  const { session, isLoading } = useSession();
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [timeRange, setTimeRange] = useState("today");
  const [analyticsData, setAnalyticsData] = useState(() => mockApi.getAnalyticsData(timeRange));
  const [dashboardData, setDashboardData] = useState<DashboardResponse["data"] | null>(null);
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursResponse["data"] | null>(null);
  const [activeId, setActiveId] = useState<WidgetId | null>(null);
  
  const topProducts = dashboardData?.top_products_today ?? [];
  const lowStockAlerts = dashboardData?.low_stock_alerts ?? [];

  const { t } = useTranslation('dashboard');

  const [topWidgets, setTopWidgets] = useState<WidgetLayout[]>([
    { id: 'inventory', gridClass: 'lg:col-span-2 lg:row-span-2' },
    { id: 'warehouse', gridClass: 'lg:col-span-2' },
    { id: 'topPerformers', gridClass: 'lg:col-span-2' },
  ]);

  const [bottomWidgets, setBottomWidgets] = useState<WidgetLayout[]>([
    { id: 'peakHours', gridClass: 'lg:col-span-2 lg:row-span-2' },
    { id: 'revenue', gridClass: '' },
    { id: 'topProduct', gridClass: '' },
    { id: 'transactions', gridClass: '' },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const newData = mockApi.getAnalyticsData(timeRange);
    setAnalyticsData(newData);
  }, [timeRange]);

  useEffect(() => {
    if (isLoading || !session) return;
    (async () => {
      try {
        const [warehousesRes, dashboardRes, customerRes] = await Promise.all([
          fetchWarehouses(session.token),
          fetchDashboard(session.token),
          fetchPeakHours(session.token),
        ]);
        setWarehouses(warehousesRes);
        setDashboardData(dashboardRes.data);
        setPeakHoursData(customerRes.data);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [session, isLoading]);

  useEffect(() => {
    if (!isLoading && !session) {
      router.push("/login");
    }
  }, [session, isLoading, router]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as WidgetId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const isTopWidget = topWidgets.some(w => w.id === active.id);
    const isOverTopWidget = topWidgets.some(w => w.id === over.id);

    if (isTopWidget && isOverTopWidget) {
      setTopWidgets((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    } else if (!isTopWidget && !isOverTopWidget) {
      setBottomWidgets((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    setActiveId(null);
  };

  // const renderWidget = (id: WidgetId) => {
  //   switch (id) {
  //     case 'inventory':
  //       return <InventoryWidget data={inventoryOverview} router={router} />;
  //     case 'warehouse':
  //       return <WarehouseWidget warehouses={warehouses} router={router} />;
  //     case 'commission':
  //       return <CommissionWidget data={analyticsData.commissionOverview} router={router} />;
  //     case 'salesReport':
  //       return <SalesReportWidget data={analyticsData.salesReport} />;
  //     case 'revenue':
  //       return <RevenueWidget data={analyticsData.revenueWidget} />;
  //     case 'topProduct':
  //       return <TopProductWidget data={analyticsData.topProductWidget} />;
  //     case 'transactions':
  //       return <TransactionsWidget data={analyticsData.transactionsWidget} />;
  //   }
  // };
  const renderWidget = (id: WidgetId) => {
    if (!dashboardData) return null;
    switch (id) {
      case 'inventory': {
        const parseAlert = (alert: LowStockAlert) => {
          if (typeof alert === "string") {
            const m = alert.match(/^(.*)\s*\(\s*Left:\s*([0-9]+)\s*,\s*Limit:\s*([0-9]+)\s*\)\s*$/i);
            if (m) {
              return { name: m[1].trim(), stock: parseInt(m[2], 10), limit: parseInt(m[3], 10) };
            }
            return { name: alert, stock: null, limit: null };
          }

          return {
            name: alert.product_name ?? alert.name ?? `Product ${alert.product_id ?? ""}`.trim(),
            stock: alert.remaining_quantity ?? alert.left ?? null,
            limit: alert.limit ?? alert.limit_value ?? null,
          };
        };

        const lowStockProducts = (dashboardData.low_stock_alerts || []).map(parseAlert).map(p => ({
          name: p.name,
          stock: p.stock ?? 0,
          limit: p.limit ?? undefined,
        }));

        return (
          <InventoryWidget
            data={{
              title: t('widgets.inventory.title'),
              totalProducts: Array.isArray(dashboardData.top_products_today) ? dashboardData.top_products_today.length : 0,
              lowStockItems: Array.isArray(dashboardData.low_stock_alerts) ? dashboardData.low_stock_alerts.length : 0,
              lowStockProducts,
            }}
            router={router}
            limit={5}
          />
        );
      }
      case 'warehouse':
        return <WarehouseWidget warehouses={warehouses} router={router} />;
      case 'commission':
        return (
          <CommissionWidget
            data={{
              paid: dashboardData.today_profit,
              pending: dashboardData.pending_commissions_count,
              rejected: 0,
            }}
            router={router}
          />
        );
      case 'salesReport':
        return (
          <SalesReportWidget
            data={{
              title: "Today's Performance",
              description: "Revenue and transaction summary",
              chartData: [
                { name: "Revenue", value: parseFloat(dashboardData.today_revenue) },
                { name: "Profit", value: parseFloat(dashboardData.today_profit) },
              ],
              yAxisFormatter: (v) => `Rp${v.toLocaleString()}`,
            }}
          />
        );
      case 'revenue':
        return (
          <RevenueWidget
            data={{
              title: "Today's Revenue",
              value: formatCurrency(Number(dashboardData.today_revenue)),
              trend: `${dashboardData.revenue_change_percentage}%`,
            }}
          />
        );
      case 'topProduct':
        return (
          <TopProductWidget
            data={{
              title: "This Month's Top Product",
              name: topProducts[0]?.product_code
                ? `Product #${topProducts[0].product_code}`
                : "N/A",

              unitsSold: topProducts[0]?.net_sales != null
                ? formatCurrency(Number(topProducts[0].net_sales))
                : "N/A",
            }}
          />
        );
      case 'transactions':
        return (
          <TransactionsWidget
            data={{
              title: "Today's Transactions",
              value: dashboardData.today_transactions ?? "N/A",
              itemsSold: dashboardData.today_items_sold ?? "N/A",
            }}
          />
        );

      case "topPerformers":
        return (
          <TopPerformersWidget
            data={{
              title: "Today's Performance",
              topPerformers: dashboardData.top_performers_today || [],
            }}
            router={router}
            limit={5}
          />
        );

      case "peakHours":
        return (
          <PeakHoursWidget
            data={peakHoursData ?? []}
            router={router}
          />
        );
        
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="font-mono">{t('loadingSession')}</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="font-mono">{t('redirectingLogin')}</p>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-4 bg-background">
      <Breadcrumbs />
      <div className="flex flex-col md:flex-row justify-between space-y-2 mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-nowrap">{t('welcome', { username: session.user.username })}</h1>
          <p className="text-[hsl(var(--muted-foreground))]">{t('description')}</p>
        </div>
        {/* <Select
          className="w-[180px] md:ml-auto"
          options={timeRangeOptions}
          value={timeRange}
          onChange={(selectedValue) => setTimeRange(selectedValue ?? "today")}
        /> */}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={topWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {topWidgets.map((widget) => (
              <DraggableWidget key={widget.id} id={widget.id} gridClass={widget.gridClass}>
                {renderWidget(widget.id)}
              </DraggableWidget>
            ))}
          </div>
        </SortableContext>

        <div className="flex items-center justify-between space-y-2 mt-8">
          <h2 className="text-2xl font-bold tracking-tight">Business Analytics</h2>
        </div>

        <SortableContext items={bottomWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bottomWidgets.map((widget) => (
              <DraggableWidget key={widget.id} id={widget.id} gridClass={widget.gridClass}>
                {renderWidget(widget.id)}
              </DraggableWidget>
            ))}
          </div>
        </SortableContext>

        <DragOverlay>
          {activeId ? (
            <div className="opacity-50">
              {renderWidget(activeId)}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </main>
  );
}

'use client'
import React, { useState, useEffect } from "react";
import { useSession } from "@/lib/context/session";
import { useRouter } from "next/navigation";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragOverlay, type DragEndEvent, type DragStartEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from '@dnd-kit/sortable';
import { Select, type SelectOption } from "@/components/ui/select";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { fetchWarehouses } from "@/lib/utils/api";
import { type Warehouse } from "@/lib/types/inventory/warehouses";
import { mockApi, inventoryOverview } from "@/lib/data/mock-data";
import {
  InventoryWidget,
  WarehouseWidget,
  CommissionWidget,
  SalesReportWidget,
  RevenueWidget,
  TopProductWidget,
  TransactionsWidget
} from "@/components/dashboard/widgets";
import { DraggableWidget } from "@/components/dashboard/draggable-widget";

const timeRangeOptions: SelectOption[] = [
  { value: "today", label: "Today" },
  { value: "thisWeek", label: "This Week" },
  { value: "thisMonth", label: "This Month" },
  { value: "thisYear", label: "This Year" },
  { value: "allTime", label: "All Time" },
];

type WidgetId = 'inventory' | 'warehouse' | 'commission' | 'salesReport' | 'revenue' | 'topProduct' | 'transactions';

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
  const [activeId, setActiveId] = useState<WidgetId | null>(null);

  const [topWidgets, setTopWidgets] = useState<WidgetLayout[]>([
    { id: 'inventory', gridClass: 'lg:col-span-2 lg:row-span-2' },
    { id: 'warehouse', gridClass: 'lg:col-span-2' },
    { id: 'commission', gridClass: 'lg:col-span-2' },
  ]);

  const [bottomWidgets, setBottomWidgets] = useState<WidgetLayout[]>([
    { id: 'salesReport', gridClass: 'lg:col-span-2 lg:row-span-2' },
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
        const fetched = await fetchWarehouses(session.token);
        setWarehouses(fetched);
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

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case 'inventory':
        return <InventoryWidget data={inventoryOverview} router={router} />;
      case 'warehouse':
        return <WarehouseWidget warehouses={warehouses} router={router} />;
      case 'commission':
        return <CommissionWidget data={analyticsData.commissionOverview} router={router} />;
      case 'salesReport':
        return <SalesReportWidget data={analyticsData.salesReport} />;
      case 'revenue':
        return <RevenueWidget data={analyticsData.revenueWidget} />;
      case 'topProduct':
        return <TopProductWidget data={analyticsData.topProductWidget} />;
      case 'transactions':
        return <TransactionsWidget data={analyticsData.transactionsWidget} />;
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="font-mono">Loading session...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center">
        <p className="font-mono">Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 space-y-4 bg-background">
      <Breadcrumbs />
      <div className="flex flex-col md:flex-row justify-between space-y-2 mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-nowrap">Welcome, {session.user.username || 'User'}.</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Here is your business summary.</p>
        </div>
        <Select
          className="w-[180px] md:ml-auto"
          options={timeRangeOptions}
          value={timeRange}
          onChange={(selectedValue) => setTimeRange(selectedValue ?? "today")}
        />
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

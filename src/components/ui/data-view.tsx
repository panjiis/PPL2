"use client";

import React, { useState, useMemo } from "react";
import {
    Column,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  TableIcon,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpAZ,
  ArrowDownAZ,
  ArrowUp10,
  ArrowDown10,
  ArrowUpDown,
  PlusIcon,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toTitleCase } from "@/lib/utils/string";

type ViewType = "table" | "list" | "grid";

interface DataViewProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  renderListItem: (item: TData) => React.ReactNode;
  renderGridItem: (item: TData) => React.ReactNode;
  searchableColumn: keyof TData;
  initialView?: ViewType;
  itemsPerPage?: number;
  onCreate?: () => void;
  caption?: string;
}

export function DataView<TData, TValue>({
  data,
  columns,
  renderListItem,
  renderGridItem,
  searchableColumn,
  initialView = "table",
  itemsPerPage = 10,
  onCreate,
  caption
}: DataViewProps<TData, TValue>) {
  const [viewType, setViewType] = useState<ViewType>(initialView);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);

  const searchKey = useMemo(() => String(searchableColumn), [searchableColumn]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const value = row.getValue(searchKey);
      return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: itemsPerPage } },
  });

  const paginatedData = table.getRowModel().rows.map((row) => row.original);

  const handleViewChange = (value: string | string[]) => {
    if (typeof value === "string" && value) setViewType(value as ViewType);
  };

  const visibleColumnCount = table
  .getHeaderGroups()[0]?.headers.length ?? columns.length;

  // Helper to render correct arrow per column type
  const renderSortIcon = (column: Column<TData, unknown>) => {
    const sorted = column.getIsSorted();

    // Infer type from first row
    const firstValue = table.getRowModel().rows[0]?.getValue(column.id);
    const type = typeof firstValue === "number" ? "number" : "string";

    if (sorted === "asc")
        return type === "string" ? <ArrowUpAZ className="h-4 w-4" /> : <ArrowUp10 className="h-4 w-4" />;
    if (sorted === "desc")
        return type === "string" ? <ArrowDownAZ className="h-4 w-4" /> : <ArrowDown10 className="h-4 w-4" />;
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  const renderSortableToolbar = () => (
    <div className="flex gap-2 mb-2 flex-wrap">
      {table.getHeaderGroups()[0]?.headers
        .filter((header) => header.column.id.toLowerCase() !== "actions")
        .map((header) => (
          <Button
            key={header.id}
            variant="outline"
            size="sm"
            onClick={header.column.getToggleSortingHandler()}
            className="flex items-center gap-1"
          >
            {flexRender(header.column.columnDef.header, header.getContext())}
            {renderSortIcon(header.column)}
          </Button>
        ))}
    </div>
  );

  const renderCurrentView = () => {
    if (paginatedData.length === 0)
      return (
        <div className="text-center py-10 text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] rounded-md">
            No results found.
        </div>
      );

    switch (viewType) {
      case "grid":
        return (
          <div className="flex flex-col">
            {renderSortableToolbar()}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedData.map((item, index) => (
                <React.Fragment key={index}>{renderGridItem(item)}</React.Fragment>
              ))}
            {onCreate && (
                <div
                    onClick={onCreate}
                    className="border-dashed border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-[hsl(var(--foreground))]/5"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span className="font-semibold text-[hsl(var(--muted-foreground))]">Create New</span>
                </div>
            )}
            </div>
          </div>
        );
      case "list":
        return (
          <div className="flex flex-col">
            {renderSortableToolbar()}
            <div className="flex flex-col gap-3">
              {paginatedData.map((item, index) => (
                <React.Fragment key={index}>{renderListItem(item)}</React.Fragment>
              ))}
              {onCreate && (
                <div
                    onClick={onCreate}
                    className="border-dashed border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-[hsl(var(--foreground))]/5"
                >
                    <PlusIcon className="h-5 w-5" />
                    <span className="font-semibold text-[hsl(var(--muted-foreground))]">Create New</span>
                </div>
              )}
            </div>
          </div>
        );
      case "table":
      default:
        return (
          <div className="rounded-md border border-[hsl(var(--border))]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : header.column.id !== "actions" ? (
                          <Button
                            variant="ghost"
                            onClick={header.column.getToggleSortingHandler()}
                            className="flex items-center gap-1"
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {renderSortIcon(header.column)}
                          </Button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {onCreate && (
                    <TableRow className="border-dashed border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--foreground))]/5" onClick={onCreate}>
                    <TableCell colSpan={visibleColumnCount} className="text-center py-4 text-[hsl(var(--muted-foreground))] font-semibold">
                        <PlusIcon size={20} className="inline-block mr-2" />Create New
                    </TableCell>
                    </TableRow>
                )}
              </TableBody>
              <TableCaption>{caption ?? `List of ${toTitleCase(searchKey)} in system.`}</TableCaption>
            </Table>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center justify-between">
        <Input
          placeholder={`Search by ${toTitleCase(searchKey)}...`}
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="max-w-sm"
        />
        <ToggleGroup type="single" variant="outline" value={viewType} onValueChange={handleViewChange}>
          <ToggleGroupItem value="table" aria-label="Table view">
            <TableIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="list" aria-label="List view">
            <List className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {renderCurrentView()}

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-[hsl(var(--muted-foreground))]">{table.getFilteredRowModel().rows.length} row(s) found.</div>
        <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

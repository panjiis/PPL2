"use client";

import React, { useState, useMemo } from "react";
// CHANGED: Import Image for icons
import Image from "next/image";
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
  Row,
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

import { AdvancedSearch, SearchOption } from "@/components/ui/advanced-search"; // Adjust path

type ViewType = "table" | "list" | "grid";

interface DataViewProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  renderListItem?: (item: TData) => React.ReactNode;
  renderGridItem?: (item: TData) => React.ReactNode;
  searchableColumn?: keyof TData | string;
  initialView?: ViewType;
  itemsPerPage?: number;
  onCreate?: () => void;
  caption?: string;
  enableSelection?: boolean;
  onSelectionChange?: (selected: TData[]) => void;
  enableAdvancedSearch?: boolean;
  searchableGroup?: keyof TData | string; // CHANGED: New prop for grouping
  searchableIcon?: keyof TData | string; // CHANGED: New prop for icons
}

function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
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
  caption,
  enableSelection,
  onSelectionChange,
  enableAdvancedSearch = false,
  searchableGroup, // CHANGED
  searchableIcon, // CHANGED
}: DataViewProps<TData, TValue>) {
  const [viewType, setViewType] = useState<ViewType>(initialView);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState({});

  const searchKey = useMemo(() => 
    searchableColumn ? String(searchableColumn) : null, 
    [searchableColumn]
  );
  // CHANGED: Add groupKey and iconKey
  const groupKey = useMemo(() => 
    searchableGroup ? String(searchableGroup) : null,
    [searchableGroup]
  );
  const iconKey = useMemo(() => 
    searchableIcon ? String(searchableIcon) : null,
    [searchableIcon]
  );

  const searchLabel = useMemo(() => {
    return searchKey ? `by ${toTitleCase(searchKey)}` : "all fields";
  }, [searchKey]);
  
  const safeData = useMemo(() => data ?? [], [data]);

  // CHANGED: Simplified logic
  const useAdvancedSearch = enableAdvancedSearch;
  const hasGroups = useAdvancedSearch && !!groupKey && !!searchKey;
  const showIcons = useAdvancedSearch && !!iconKey && !!searchKey;

  // CHANGED: Updated advancedSearchOptions to support groups and icons
  const advancedSearchOptions = useMemo((): SearchOption[] => {
    if (!useAdvancedSearch) return [];

    const uniqueValues = new Map<string, SearchOption>();

    (safeData ?? []).forEach((item) => {
      if (searchKey) {
        // **Grouped/Specific Search Mode (Requires searchKey)**
        const value = getNestedValue(item, searchKey);
        const stringValue = (value !== undefined && value !== null) ? String(value) : "";
        
        if (stringValue.trim() && !uniqueValues.has(stringValue.toLowerCase())) {
          const group = groupKey ? getNestedValue(item, groupKey) : undefined;
          const iconUrl = iconKey ? getNestedValue(item, iconKey) : undefined;
          
          uniqueValues.set(stringValue.toLowerCase(), {
            value: stringValue,
            label: stringValue,
            group: group ? String(group) : undefined,
            icon: (showIcons && iconUrl) ? (
              <Image 
                src={String(iconUrl)} 
                alt={stringValue} 
                width={16} 
                height={16} 
                className="rounded-sm" 
              />
            ) : undefined,
          });
        }
      } else {
        // **Global Search Mode (No searchKey)**
        if (isRecord(item)) {
          for (const key in item) {
            const value = item[key];
            if (typeof value === "string" || typeof value === "number") {
              const stringValue = String(value);
              if (stringValue.trim() && !uniqueValues.has(stringValue.toLowerCase())) {
                uniqueValues.set(stringValue.toLowerCase(), {
                  value: stringValue,
                  label: stringValue,
                });
              }
            }
          }
        }
      }
    });
    return Array.from(uniqueValues.values());
  }, [safeData, useAdvancedSearch, searchKey, groupKey, iconKey, showIcons]);

  const table = useReactTable({
    data: safeData,
    columns,
    state: { sorting, globalFilter, ...(enableSelection ? { rowSelection } : {}), },
    enableRowSelection: !!enableSelection,
    onRowSelectionChange: enableSelection ? setRowSelection : undefined,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    
    globalFilterFn: (row: Row<TData>, _columnId: string, filterValue: string) => {
      const lowerCaseFilter = String(filterValue).toLowerCase();

      if (searchKey) {
        // **Specified Column Search**
        const raw = row.original as Record<string, unknown>;
        const value = getNestedValue(raw, searchKey);
        if (value === undefined || value === null) return false;
        
        return String(value).toLowerCase().includes(lowerCaseFilter);
      } else {
        // **Global Search**
        return row.getAllCells().some(cell => {
          const value = cell.getValue();
          if (value === undefined || value === null) return false;
          
          return String(value).toLowerCase().includes(lowerCaseFilter);
        });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: itemsPerPage } },
  });

  const rows = table.getRowModel()?.rows ?? [];
  const paginatedData = rows.map((r) => r.original);

  const selectedRows = useMemo(() => {
    return enableSelection
      ? table.getSelectedRowModel().rows.map((r) => r.original)
      : [];
  }, [enableSelection, table]);


  const prevSelectedRef = React.useRef<TData[] | null>(null);

  React.useEffect(() => {
    if (!enableSelection || !onSelectionChange) return;

    const prev = prevSelectedRef.current;
    const hasChanged =
      !prev ||
      prev.length !== selectedRows.length ||
      prev.some((r, i) => r !== selectedRows[i]);

    if (hasChanged) {
      prevSelectedRef.current = selectedRows;
      onSelectionChange(selectedRows);
    }
  }, [enableSelection, selectedRows, onSelectionChange]);

  const handleViewChange = (v: string | string[]) => {
    if (typeof v === "string" && v) setViewType(v as ViewType);
  };

  const visibleColumnCount =
    table.getHeaderGroups()[0]?.headers.length ?? columns.length;

  // Sorting icons
  const renderSortIcon = (column: Column<TData, unknown>) => {
    const sorted = column.getIsSorted();
    const firstValue = table.getRowModel().rows[0]?.getValue(column.id);
    const type = typeof firstValue === 'number' ? "number" : "string";
    if (sorted === "asc")
      return type === "string" ? (
        <ArrowUpAZ className="h-4 w-4" />
      ) : (
        <ArrowUp10 className="h-4 w-4" />
      );
    if (sorted === "desc")
      return type === "string" ? (
        <ArrowDownAZ className="h-4 w-4" />
      ) : (
        <ArrowDown10 className="h-4 w-4" />
      );
    return <ArrowUpDown className="h-4 w-4 opacity-50" />;
  };

  const renderSortableToolbar = () => (
    <div className="flex gap-2 mb-2 flex-wrap">
      {table
        .getHeaderGroups()[0]
        ?.headers.filter((h) => h.column.id.toLowerCase() !== "actions" && h.column.id.toLowerCase() !== "select")
        .map((h) => (
          <Button
            key={h.id}
            variant="outline"
            size="sm"
            onClick={h.column.getToggleSortingHandler()}
            className="flex items-center gap-1"
          >
            {flexRender(h.column.columnDef.header, h.getContext())}
            {renderSortIcon(h.column)}
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
        return renderGridItem ? (
          <div className="flex flex-col">
            {renderSortableToolbar()}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {paginatedData.map((item, i) => (
                <React.Fragment key={i}>{renderGridItem(item)}</React.Fragment>
              ))}
              {onCreate && (
                <div
                  onClick={onCreate}
                  className="border-dashed border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-[hsl(var(--foreground))]/5"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="font-semibold text-[hsl(var(--muted-foreground))]">
                    Create New
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null;
      case "list":
        return renderListItem ? (
          <div className="flex flex-col">
            {renderSortableToolbar()}
            <div className="flex flex-col gap-3">
              {paginatedData.map((item, i) => (
                <React.Fragment key={i}>{renderListItem(item)}</React.Fragment>
              ))}
              {onCreate && (
                <div
                  onClick={onCreate}
                  className="border-dashed border border-[hsl(var(--border))] rounded-lg p-4 flex items-center justify-center gap-2 cursor-pointer hover:bg-[hsl(var(--foreground))]/5"
                >
                  <PlusIcon className="h-5 w-5" />
                  <span className="font-semibold text-[hsl(var(--muted-foreground))]">
                    Create New
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : null;
      default:
        return (
          <div className="rounded-md border border-[hsl(var(--border))]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((hg) => (
                  <TableRow key={hg.id}>
                    {enableSelection && (
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={table.getIsAllPageRowsSelected()}
                          onChange={table.getToggleAllPageRowsSelectedHandler()}
                        />
                      </TableHead>
                    )}
                    {hg.headers.map((h) => (
                      <TableHead key={h.id}>
                        {h.isPlaceholder ? null : h.column.id !== "actions" ? (
                          <Button
                            variant="ghost"
                            onClick={h.column.getToggleSortingHandler()}
                            className="flex items-center gap-1"
                          >
                            {flexRender(h.column.columnDef.header, h.getContext())}
                            {renderSortIcon(h.column)}
                          </Button>
                        ) : (
                          flexRender(h.column.columnDef.header, h.getContext())
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                      key={row.id}
                      data-state={enableSelection && row.getIsSelected() ? "selected" : undefined}
                    >
                    {enableSelection && (
                      <TableCell className="w-12">
                        <input
                          type="checkbox"
                          checked={row.getIsSelected()}
                          disabled={!row.getCanSelect()}
                          onChange={row.getToggleSelectedHandler()}
                        />
                      </TableCell>
                    )}
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {onCreate && (
                  <TableRow
                    className="border-dashed border border-[hsl(var(--border))] cursor-pointer hover:bg-[hsl(var(--foreground))]/5"
                    onClick={onCreate}
                  >
                    <TableCell
                      colSpan={visibleColumnCount}
                      className="text-center py-4 text-[hsl(var(--muted-foreground))] font-semibold"
                    >
                      <PlusIcon size={20} className="inline-block mr-2" />
                      Create New
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableCaption>
                {caption ?? `List of items in system.`}
              </TableCaption>
            </Table>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 items-center justify-between">
        
        {/* === CHANGED: Updated props passed to AdvancedSearch === */}
        {useAdvancedSearch ? (
          <AdvancedSearch
            options={advancedSearchOptions}
            placeholder={`Search ${searchLabel}...`}
            className="max-w-sm w-full"
            value={globalFilter ?? ""}
            onValueChange={setGlobalFilter}
            groups={hasGroups}
            showIcons={showIcons}
          />
        ) : (
          <Input
            placeholder={`Search ${searchLabel}...`}
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
          />
        )}
        {/* === END OF CHANGED PART === */}

        <ToggleGroup
          type="single"
          variant="outline"
          value={viewType}
          onValueChange={handleViewChange}
        >
          <ToggleGroupItem value="table" aria-label="Table view">
            <TableIcon className="h-4 w-4" />
          </ToggleGroupItem>
          {renderListItem && (
            <ToggleGroupItem value="list" aria-label="List view">
              <List className="h-4 w-4" />
            </ToggleGroupItem>
          )}
          {renderGridItem && (
            <ToggleGroupItem value="grid" aria-label="Grid view">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
          )}
        </ToggleGroup>
      </div>

      {renderCurrentView()}

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-[hsl(var(--muted-foreground))]">
          {table.getFilteredRowModel().rows.length} row(s) found.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Table,
} from "lucide-react";

// Define the shape of a column
export interface Column<T> {
  accessor: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

// Props for the individual view components
interface ViewProps<T> {
  data: T[];
}

interface TableViewProps<T> extends ViewProps<T> {
  columns: Column<T>[];
  handleSort: (key: keyof T) => void;
  sortConfig: { key: keyof T; direction: "asc" | "desc" } | null;
}

// Props for the DataTable component
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey: keyof T;
  // View components
  TableView: React.FC<TableViewProps<T>>;
  GridView: React.FC<ViewProps<T>>;
  ListView: React.FC<ViewProps<T>>;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  TableView,
  GridView,
  ListView,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T;
    direction: "asc" | "desc";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewType, setViewType] = useState<"table" | "grid" | "list">("table");
  const itemsPerPage = 10;

  // Memoized filtered and sorted data
  const processedData = useMemo(() => {
    const filteredData = data.filter((item) =>
      String(item[searchKey])
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filteredData;
  }, [data, searchTerm, sortConfig, searchKey]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedData.slice(startIndex, startIndex + itemsPerPage);
  }, [processedData, currentPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage);

  const handleSort = (key: keyof T) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const renderView = () => {
    switch (viewType) {
      case "grid":
        return <GridView data={paginatedData} />;
      case "list":
        return <ListView data={paginatedData} />;
      case "table":
      default:
        return (
          <TableView
            data={paginatedData}
            columns={columns}
            handleSort={handleSort}
            sortConfig={sortConfig}
          />
        );
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          placeholder={`Search by ${String(searchKey)}...`}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Button
            variant={viewType === "table" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewType("table")}
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewType("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewType === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewType("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {renderView()}

      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          Page {currentPage} of {totalPages || 1}
        </span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages || totalPages === 0}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
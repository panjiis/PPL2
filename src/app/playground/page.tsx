"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MoreHorizontal, PlusIcon } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";

import { DataView } from "@/components/ui/data-view";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown";
import { formatCurrency } from "@/lib/utils/string";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

// 1. Define the data structure
type Product = {
  id: string;
  name: string;
  category: "Electronics" | "Books" | "Home Goods" | "Clothing";
  price: number;
  stock: number;
  rating: number;
  imageUrl: string;
};

// 2. Mock data
const mockProducts: Product[] = [
  { id: "PROD-001", name: "Wireless Noise-Cancelling Headphones", category: "Electronics", price: 3490000, stock: 45, rating: 5, imageUrl: "https://placehold.co/400/5186db/ffffff?text=Headphones" },
  { id: "PROD-002", name: "The Alchemist by Paulo Coelho", category: "Books", price: 120000, stock: 150, rating: 4, imageUrl: "https://placehold.co/400/e0d8c3/444444?text=Book" },
  { id: "PROD-003", name: "Smart LED Desk Lamp", category: "Home Goods", price: 390000, stock: 8, rating: 5, imageUrl: "https://placehold.co/400/f5f5f5/333333?text=Lamp" },
  { id: "PROD-004", name: "Organic Cotton T-Shirt", category: "Clothing", price: 250000, stock: 200, rating: 4, imageUrl: "https://placehold.co/400/7d8a9c/ffffff?text=T-Shirt" },
  { id: "PROD-005", name: "4K Ultra HD Smart TV", category: "Electronics", price: 7990000, stock: 22, rating: 5, imageUrl: "https://placehold.co/400/2c2c2c/ffffff?text=Smart+TV" },
  { id: "PROD-006", name: "A Brief History of Time", category: "Books", price: 150000, stock: 0, rating: 5, imageUrl: "https://placehold.co/400/1a1a2e/ffffff?text=Book" },
  { id: "PROD-007", name: "Ergonomic Office Chair", category: "Home Goods", price: 2500000, stock: 15, rating: 4, imageUrl: "https://placehold.co/400/6b7280/ffffff?text=Chair" },
  { id: "PROD-008", name: "Men's Classic Denim Jacket", category: "Clothing", price: 890000, stock: 55, rating: 5, imageUrl: "https://placehold.co/400/3b82f6/ffffff?text=Jacket" },
  { id: "PROD-009", name: "Portable Bluetooth Speaker", category: "Electronics", price: 590000, stock: 90, rating: 4, imageUrl: "https://placehold.co/400/f97316/ffffff?text=Speaker" },
  { id: "PROD-010", name: "Scented Soy Wax Candle", category: "Home Goods", price: 180000, stock: 120, rating: 4, imageUrl: "https://placehold.co/400/fce7f3/831843?text=Candle" },
  { id: "PROD-011", name: "Women's Running Shoes", category: "Clothing", price: 1200000, stock: 30, rating: 5, imageUrl: "https://placehold.co/400/a855f7/ffffff?text=Shoes" },
  { id: "PROD-012", name: "To Kill a Mockingbird", category: "Books", price: 90000, stock: 300, rating: 5, imageUrl: "https://placehold.co/400/dcdcdc/000000?text=Book" },
];

// 3. Columns definition
const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex items-center gap-4">
          <Image
            src={product.imageUrl}
            alt={product.name}
            width={40}
            height={40}
            className="rounded-sm object-cover"
          />
          <span className="font-semibold">{product.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => <Badge variant="secondary">{row.original.category}</Badge>,
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => <div>{formatCurrency(row.original.price)}</div>
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }) => {
      const stock = row.original.stock;
      return (
        <div className={stock === 0 ? "text-red-600" : stock < 25 ? "text-yellow-600" : ""}>
          {stock > 0 ? `${stock} in stock` : "Out of stock"}
        </div>
      );
    },
  },
];

export default function ProductDisplayPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto">
      <Breadcrumbs />

      <div className="flex items-center justify-between w-full mt-8 md:mt-16 mb-10">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Manage your products here.</p>
        </div>
        <Button size="icon">
          <PlusIcon />
        </Button>
      </div>
      
      <DataView<Product, unknown>
        data={mockProducts}
        columns={[
          ...columns,
          {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/products/${row.original.id}`)}>
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/products/${row.original.id}/edit`)}>
                    Edit Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          },
        ]}
        searchableColumn="name"
        itemsPerPage={10}
        initialView="table"
        onCreate={() => alert('a')}

        renderListItem={(product) => (
          <div
            className="flex items-center justify-between p-3 border border-[hsl(var(--border))] rounded-lg gap-4 hover:bg-[hsl(var(--foreground))]/5 cursor-pointer"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <div className="flex items-center gap-4">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={56}
                height={56}
                className="rounded-md object-cover"
              />
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">{product.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-lg">{formatCurrency(product.price)}</p>
              <div className={`text-sm ${product.stock === 0 ? "text-red-600" : product.stock < 25 ? "text-yellow-600" : ""}`}>
                {product.stock > 0 ? `${product.stock} left` : "Out of stock"}
              </div>
            </div>
          </div>
        )}

        renderGridItem={(product) => (
          <Card
            className="flex flex-col cursor-pointer"
            onClick={() => router.push(`/products/${product.id}`)}
          >
            <CardHeader className="p-0">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={400}
                height={400}
                className="w-full rounded-t-lg object-cover aspect-square"
              />
            </CardHeader>
            <CardContent className="pt-4 flex-grow">
              <Badge variant="secondary" className="mb-2">{product.category}</Badge>
              <h3 className="font-semibold line-clamp-2">{product.name}</h3>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <p className="font-semibold text-lg">{formatCurrency(product.price)}</p>
              <div className={product.stock === 0 ? "text-red-600" : product.stock < 25 ? "text-yellow-600" : ""}>
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </div>
            </CardFooter>
          </Card>
        )}
      />
    </div>
  );
}

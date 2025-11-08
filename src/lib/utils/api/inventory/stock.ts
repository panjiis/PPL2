// === Stocks ===

import { Stock, StocksResponse, StockResponse, ReserveStockResponse, ReleaseStockResponse, StockMovement, UpdateStockResponse, TransferStockResponse } from "@/lib/types/inventory/stocks";
import { BASE_URL } from "../config";
import { handleResponse } from "../utils";

// export async function fetchStocks(token: string, id: number, warehouse_id: number): Promise<Stock[]> {
//   const res = await fetch(`${BASE_URL}/inventory/stocks?id=${id}&warehouse_id=${warehouse_id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   const json = await handleResponse<StocksResponse>(res);
//   console.log(json.data);
//   return json.data;
// }

export async function fetchStocks(token: string): Promise<Stock[]> {
  const res = await fetch(`${BASE_URL}/inventory/stocks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<StocksResponse>(res);
  return json.data;
}

export async function fetchStockByCode(token: string, product_code: string): Promise<Stock | null> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/${product_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<StockResponse>(res);
  return json.data;
}

export async function fetchStocksLow(token: string): Promise<Stock[]> {
  const res = await fetch(`${BASE_URL}/inventory/stocks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<StocksResponse>(res);
  return json.data;
}

export async function checkStock(token: string, stock: Partial<Stock>): Promise<Stock> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/check`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });
  const json = await handleResponse<StockResponse>(res);
  return json.data;
}

export async function reserveStock(token: string, stock: Partial<Stock>): Promise<Stock> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/reserve`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });
  const json = await handleResponse<ReserveStockResponse>(res);
  return json.data;
}

export async function releaseStock(token: string, stock: Partial<Stock>): Promise<Stock> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/release`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });
  const json = await handleResponse<ReleaseStockResponse>(res);
  return json.data;
}

export async function updateStock(token: string, stock: Partial<Stock>): Promise<{  
  updated_stock: Stock;
  stock_movement: StockMovement;
  }> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/update`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });
  const json = await handleResponse<UpdateStockResponse>(res);
  return json.data;
}

export async function transferStock(token: string, stock: Partial<Stock>): Promise<{  
  source_stock: Stock;
  destination_stock: Stock;
  stock_movements: StockMovement[];
  }> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/transfer`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(stock),
  });
  const json = await handleResponse<TransferStockResponse>(res);
  return json.data;
}

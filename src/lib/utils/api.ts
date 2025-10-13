import { LoginResponse, LoginResponseSchema, Session } from "@/lib/types/auth";
import type { User, UsersResponse, UserResponse } from "@/lib/types/users";
import { Role, RoleResponse, RolesResponse } from "@/lib/types/roles";
import { Employee, EmployeeResponse, EmployeesResponse } from "@/lib/types//employees";
import { Warehouse, WarehouseResponse, WarehousesResponse } from "@/lib/types//warehouses";
import { Product, ProductResponse, ProductsResponse } from "@/lib/types//products";
import { Supplier, SupplierResponse, SuppliersResponse } from "../types/suppliers";
import { ProductType, ProductTypesResponse, ProductTypeResponse } from "../types/product-types";
import { Stock, StocksResponse, StockResponse } from "../types/stocks";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function handleResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Response is not valid JSON");
  }

  if (!response.ok) {
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
    ) {
      throw new Error((parsed as { message: string }).message);
    }
    throw new Error("API request failed");
  }

  return parsed as T;
}

// === Auth ===

export async function login(username: string, password: string): Promise<Session> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const raw = await response.text();
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new Error("Response is not valid JSON");
  }

  if (!response.ok) {
    const message =
      typeof parsed === "object" &&
      parsed !== null &&
      "message" in parsed &&
      typeof (parsed as { message: unknown }).message === "string"
        ? (parsed as { message: string }).message
        : "Login failed";
    throw new Error(message);
  }

  const validated = LoginResponseSchema.parse(parsed) as LoginResponse;

  if (!validated.data.token) {
    throw new Error("Login response missing token");
  }

  const expiresAt = validated.data.expires_at
    ? validated.data.expires_at.seconds * 1000
    : Date.now() + 60 * 60 * 1000;

  return {
    token: validated.data.token,
    user: validated.data.user,
    expiresAt,
  };
}

// === Users ===

export async function fetchUsers(token: string): Promise<User[]> {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<UsersResponse>(res);
  return json.data;
}

export async function fetchUserById(token: string, id: number): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<UserResponse>(res);
  return json.data;
}

export async function createUser(token: string, user: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  const json = await handleResponse<UserResponse>(res);
  return json.data;
}

export async function updateUserById(token: string, id: number, payload: Partial<User>): Promise<User> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<UserResponse>(res);
  return json.data;
}

// === Roles ===

export async function fetchRolesData(token: string): Promise<Role[]> {
  const res = await fetch(`${BASE_URL}/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<RolesResponse>(res);
  return json.data;
}

export async function createRole(token: string, role: Partial<Role>): Promise<Role> {
  const res = await fetch(`${BASE_URL}/roles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(role),
  });
  const json = await handleResponse<RoleResponse>(res);
  return json.data;
}

// === Employees ===

export async function fetchEmployees(token: string): Promise<Employee[]> {
  const res = await fetch(`${BASE_URL}/employees`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<EmployeesResponse>(res);
  return json.data;
}

export async function fetchEmployeeById(token: string, id: number): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<EmployeeResponse>(res);
  return json.data;
}

export async function createEmployee(token: string, payload: Omit<Employee, "id">): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/employees`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<EmployeeResponse>(res);
  return json.data;
}

export async function updateEmployee(
  token: string,
  id: number,
  payload: Partial<Employee>
): Promise<Employee> {
  const res = await fetch(`${BASE_URL}/employees/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await handleResponse<EmployeeResponse>(res);
  return json.data;
}

// === Product ===

export async function fetchProducts(token: string): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/inventory/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductsResponse>(res);
  return json.data;
}

export async function fetchProductById(token: string, product_id: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${product_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductResponse>(res);
  return json.data;
}

export async function fetchProductByCode(token: string, product_code: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/code/${product_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductResponse>(res);
  return json.data;
}

export async function createProduct(token: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<ProductResponse>(res);
  return json.data;
}

export async function updateProductById(token: string, product_id: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${product_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<ProductResponse>(res);
  return json.data;
}

// === Product Type ===

export async function fetchProductTypes(token: string): Promise<ProductType[]> {
  const res = await fetch(`${BASE_URL}/inventory/product-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductTypesResponse>(res);
  return json.data;
}

export async function fetchProductTypeById(token: string, product_type_id: number): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/inventory/product-types/${product_type_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductTypeResponse>(res);
  return json.data;
}

export async function fetchProductTypeByCode(token: string, product_type_code: string): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/inventory/product-types/code/${product_type_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductTypeResponse>(res);
  return json.data;
}

export async function createProductType(token: string, product_type: Partial<ProductType>): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/inventory/product-types`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product_type),
  });
  const json = await handleResponse<ProductTypeResponse>(res);
  return json.data;
}

export async function updateProductTypeById(token: string, product_type_id: number, product_type: Partial<ProductType>): Promise<ProductType> {
  const res = await fetch(`${BASE_URL}/inventory/product-types/${product_type_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product_type),
  });
  const json = await handleResponse<ProductTypeResponse>(res);
  return json.data;
}

// === Stocks ===

export async function fetchStocks(token: string, product_id: number, warehouse_id: number): Promise<Stock[]> {
  const res = await fetch(`${BASE_URL}/inventory/stocks?product_id=${product_id}&warehouse_id=${warehouse_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<StocksResponse>(res);
  console.log(json.data);
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
  const json = await handleResponse<StockResponse>(res);
  return json.data;
}

export async function releaseStock(token: string, stock: Partial<Stock>): Promise<Stock> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/reserve`, {
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

export async function updateStock(token: string, stock: Partial<Stock>): Promise<Stock> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/udpate`, {
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

export async function transferStock(token: string, stock: Partial<Stock>): Promise<Stock> {
  const res = await fetch(`${BASE_URL}/inventory/stocks/transfer`, {
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

// === Suppliers ===

export async function fetchSuppliers(token: string): Promise<Supplier[]> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<SuppliersResponse>(res);
  return json.data;
}

export async function fetchSupplierById(token: string, supplier_id: string): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function fetchSupplierByCode(token: string, supplier_code: string): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function createSupplier(token: string, supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function updateSupplierById(token: string, supplier_id: string, supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

export async function updateSupplierByCode(token: string, supplier_code: string, supplier: Partial<Supplier>): Promise<Supplier> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers/${supplier_code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(supplier),
  });
  const json = await handleResponse<SupplierResponse>(res);
  return json.data;
}

// === Warehouses ===

export async function fetchWarehouses(token: string): Promise<Warehouse[]> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<WarehousesResponse>(res);
  return json.data;
}

export async function fetchWarehouseByCode(token: string, warehouse_code: string): Promise<Warehouse> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses/${warehouse_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<WarehouseResponse>(res);
  return json.data;
}

export async function createWarehouse(token: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouse),
  });
  const json = await handleResponse<WarehouseResponse>(res);
  return json.data;
}

export async function updateWarehouseByCode(token: string, warehouse_code: string, warehouse: Partial<Warehouse>): Promise<Warehouse> {
  const res = await fetch(`${BASE_URL}/inventory/warehouses/${warehouse_code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(warehouse),
  });
  const json = await handleResponse<WarehouseResponse>(res);
  return json.data;
}
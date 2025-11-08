import { LoginResponse, LoginResponseSchema, Session } from "@/lib/types/auth";
import type { User, UsersResponse, UserResponse } from "@/lib/types/user/users";
import { Role, RoleResponse, RolesResponse } from "@/lib/types/user/roles";
import { Employee, EmployeeResponse, EmployeesResponse } from "@/lib/types/user/employees";
import { Warehouse, WarehouseResponse, WarehousesResponse } from "@/lib/types/inventory/warehouses";
import { Product, ProductResponse, ProductsResponse } from "@/lib/types/inventory/products";
import { Supplier, SupplierResponse, SuppliersResponse } from "../types/inventory/suppliers";
import { ProductType, ProductTypesResponse, ProductTypeResponse } from "../types/inventory/product-types";
import { Stock, StocksResponse, StockResponse, ReserveStockResponse, ReleaseStockResponse, UpdateStockResponse, TransferStockResponse, StockMovement } from "../types/inventory/stocks";
import { POSProduct, POSProductResponse, POSProductsResponse } from "../types/pos/products";
import { Discount, DiscountRequest, DiscountResponse, DiscountsResponse } from "../types/pos/discounts";
import { POSProductGroup, POSProductGroupsResponse, POSProductGroupResponse } from "../types/pos/product-groups";
import { Order, OrdersResponse } from "../types/pos/orders";
import { PaymentType, PaymentTypeResponse, PaymentTypesResponse } from "../types/pos/payment-types";

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

export async function fetchRoles(token: string): Promise<Role[]> {
  const res = await fetch(`${BASE_URL}/roles`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<RolesResponse>(res);
  return json.data;
}

export async function fetchRoleById(token: string, role_id: number): Promise<Role> {
  const res = await fetch(`${BASE_URL}/roles/${role_id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const json = await handleResponse<RoleResponse>(res);
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

export async function updateRoleById(token: string, role_id: number, role: Partial<Role>): Promise<Role> {
  const res = await fetch(`${BASE_URL}/roles/${role_id}`, {
    method: "PUT",
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

export async function fetchProductByCode(token: string, product_code: string): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${product_code}`, {
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
// DEPRECATED
// export async function updateProductById(token: string, id: number, product: Partial<Product>): Promise<Product> {
//   const res = await fetch(`${BASE_URL}/inventory/products/${id}`, {
//     method: "PUT",
//     headers: {
//       Authorization: `Bearer ${token}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(product),
//   });
//   const json = await handleResponse<ProductResponse>(res);
//   return json.data;
// }

export async function updateProductByCode(token: string, product_code: string, product: Partial<Product>): Promise<Product> {
  const res = await fetch(`${BASE_URL}/inventory/products/${product_code}`, {
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

// export async function fetchProductTypeById(token: string, product_type_id: number): Promise<ProductType> {
//   const res = await fetch(`${BASE_URL}/inventory/product-types/${product_type_id}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });
//   const json = await handleResponse<ProductTypeResponse>(res);
//   return json.data;
// }

export async function fetchProductsByProductTypeId(token: string, product_type_id: number): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/inventory/product-types/${product_type_id}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<ProductsResponse>(res);
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

// === Suppliers ===

export async function fetchSuppliers(token: string): Promise<Supplier[]> {
  const res = await fetch(`${BASE_URL}/inventory/suppliers`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<SuppliersResponse>(res);
  return json.data;
}

export async function fetchSupplierById(token: string, supplier_id: number): Promise<Supplier> {
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

export async function updateSupplierById(token: string, supplier_id: number, supplier: Partial<Supplier>): Promise<Supplier> {
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

// === Product (POS) ===

export async function fetchPOSProducts(token: string): Promise<POSProduct[]> {
  const res = await fetch(`${BASE_URL}/pos/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductsResponse>(res);
  return json.data;
}

export async function fetchPOSProductByCode(token: string, product_code: string): Promise<POSProduct> {
  const res = await fetch(`${BASE_URL}/pos/products/${product_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductResponse>(res);
  return json.data;
}

export async function createPOSProduct(token: string, product: Partial<POSProduct>): Promise<POSProduct> {
  const res = await fetch(`${BASE_URL}/pos/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductResponse>(res);
  return json.data;
}

export async function updatePOSProductByCode(token: string, code: string, product: Partial<POSProduct>): Promise<POSProduct> {
  const res = await fetch(`${BASE_URL}/pos/products/${code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductResponse>(res);
  return json.data;
}

// === Product Groups (POS) ===

export async function fetchPOSProductGroups(token: string): Promise<POSProductGroup[]> {
  const res = await fetch(`${BASE_URL}/pos/product-groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductGroupsResponse>(res);
  return json.data;
}

export async function fetchPOSProductGroupByCode(token: string, product_code: string): Promise<POSProductGroup> {
  const res = await fetch(`${BASE_URL}/pos/product-groups/${product_code}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<POSProductGroupResponse>(res);
  return json.data;
}

export async function createPOSProductGroup(token: string, product: Partial<POSProductGroup>): Promise<POSProductGroup> {
  const res = await fetch(`${BASE_URL}/pos/product-groups`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductGroupResponse>(res);
  return json.data;
}

export async function updatePOSProductGroupById(token: string, id: number, product: Partial<POSProductGroup>): Promise<POSProductGroup> {
  const res = await fetch(`${BASE_URL}/pos/product-groups/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(product),
  });
  const json = await handleResponse<POSProductGroupResponse>(res);
  return json.data;
}

// === Discounts ===

export async function fetchDiscounts(token: string): Promise<Discount[]> {
  const res = await fetch(`${BASE_URL}/pos/discounts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<DiscountsResponse>(res);
  return json.data;
}

export async function fetchDiscountById(token: string, id: number): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}

export async function createDiscount(token: string, discount: DiscountRequest): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(discount),
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}

export async function updateDiscountById(token: string, id: number, discount: DiscountRequest): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(discount),
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}

export async function deleteDiscountById(token: string, id: number): Promise<Discount> {
  const res = await fetch(`${BASE_URL}/pos/discounts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    }
  });
  const json = await handleResponse<DiscountResponse>(res);
  return json.data;
}

// === Orders ===

export async function fetchOrders(token: string): Promise<Order[]> {
  const res = await fetch(`${BASE_URL}/pos/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<OrdersResponse>(res);
  return json.data;
}

// === Payment Types ===

export async function fetchPaymentTypes(token: string): Promise<PaymentType[]> {
  const res = await fetch(`${BASE_URL}/pos/payment-types`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await handleResponse<PaymentTypesResponse>(res);
  return json.data;
}

export async function createPaymentType(token: string, payment_type: Partial<PaymentType>): Promise<PaymentType> {
  const res = await fetch(`${BASE_URL}/pos/payment-types`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment_type),
  });
  const json = await handleResponse<PaymentTypeResponse>(res);
  return json.data;
}

export async function updatePaymentTypeById(token: string, id: number, payment_type: Partial<PaymentType>): Promise<PaymentType> {
  const res = await fetch(`${BASE_URL}/pos/payment-types/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payment_type),
  });
  const json = await handleResponse<PaymentTypeResponse>(res);
  return json.data;
}
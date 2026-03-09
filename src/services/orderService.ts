import { apiClient } from "@/lib/apiClient";

export interface ApiOrderProduct {
  productId: string | null;
  productName: string;
  productNameAr: string;
  sku: string;
  quantity: number;
  size: string | null;
  unitPrice: number;
  discount: number;
  subtotal: number;
  productImage: string;
}

export interface ApiOrder {
  _id: string;
  orderNumber: string;
  customerId: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  sellerId: string | null;
  items: ApiOrderProduct[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "refunded";
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "returned"
    | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export async function getOrders(token?: string): Promise<ApiOrder[]> {
  try {
    const res = await apiClient({
      endpoint: "/orders",
      method: "GET",
      token,
    });
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    if (Array.isArray(data)) return data;
    return [];
  } catch (err) {
    console.error("getOrders failed:", err);
    return [];
  }
}

export async function getOrderById(id: string, token?: string): Promise<ApiOrder | null> {
  try {
    const res = await apiClient({
      endpoint: `/orders/${id}`,
      method: "GET",
      token,
    });
    const data = (res as any)?.data || res;
    return data as ApiOrder;
  } catch (err) {
    console.error("getOrderById failed:", err);
    return null;
  }
}

export async function updateOrder(id: string, payload: Partial<ApiOrder>, token?: string) {
  return apiClient({
    endpoint: `/orders/${id}`,
    method: "PATCH",
    body: payload as any,
    token,
  });
}

export async function updateOrderStatus(id: string, status: string, token?: string) {
  return apiClient({
    endpoint: `/orders/${id}/status`,
    method: "PATCH",
    body: { status },
    token,
  });
}

export async function deleteOrder(id: string, token?: string) {
  return apiClient({
    endpoint: `/orders/${id}`,
    method: "DELETE",
    token,
  });
}


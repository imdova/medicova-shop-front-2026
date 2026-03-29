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
  _id: string; // Internal MongoDB ID
  orderId: string; // Business Order ID (e.g. 69c6...)
  orderNumber?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image?: string;
  };
  name?: string;
  email?: string;
  phoneNumber?: string;
  address?: {
    addressName: string;
    addressDetails: string;
    city: string;
    area: string;
    addressType: string;
    isDefault: boolean;
  };
  sellerId: string | null;
  items: ApiOrderProduct[];
  units?: any[];
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  tax: number;
  total: number;
  totalPrice?: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "refunded";
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "returned"
    | "cancelled";
  orderStatus?: string;
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
    if (Array.isArray(data)) {
      return data.map((o: any) => ({
        ...o,
        _id: (o as any).orderId || o._id || o.id || "unknown",
      })) as ApiOrder[];
    }
    return [];
  } catch (err) {
    console.error("getOrders failed:", err);
    return [];
  }
}

export async function getSellerOrders(token?: string): Promise<ApiOrder[]> {
  try {
    const res = await apiClient({
      endpoint: "/orders/seller/my-orders",
      method: "GET",
      token,
    });
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    if (Array.isArray(data)) {
      return data.map((o: any) => ({
        ...o,
        _id: (o as any).orderId || o._id || o.id || "unknown",
      })) as ApiOrder[];
    }
    return [];
  } catch (err) {
    console.error("getSellerOrders failed:", err);
    return [];
  }
}

export async function getCustomerOrders(token?: string): Promise<ApiOrder[]> {
  try {
    const res = await apiClient({
      endpoint: "/orders/customer/my-orders",
      method: "GET",
      token,
    });
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    if (Array.isArray(data)) {
      return data.map((o: any) => ({
        ...o,
        _id: (o as any).orderId || o._id || o.id || "unknown",
      })) as ApiOrder[];
    }
    return [];
  } catch (err) {
    console.error("getCustomerOrders failed:", err);
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
    let data = (res as any)?.data || res;
    
    // Handle nested data: { status: "success", data: { data: [...] } } or { data: {...} }
    if (data && data.data) {
      if (Array.isArray(data.data)) {
        // Find the specific order in the array
        const order = data.data.find(
          (o: any) => o.orderId === id || o.id === id || o._id === id,
        );
        if (order) {
          order._id = order._id || order.id || order.orderId || id;
          return order as ApiOrder;
        }
        // Fallback to first item if not found by ID (sometimes the API filters by ID already)
        const first = data.data[0];
        if (first) first._id = first._id || first.id || first.orderId || id;
        return first as ApiOrder;
      }
      data = data.data;
    }
    if (data) {
      data._id = data._id || data.id || data.orderId || id;
    }

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

export interface CreateOrderPayload {
  customerId: string;
  sellerId?: string | null;
  items: Array<{
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
  }>;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: "paid" | "pending" | "refunded";
}

export async function createOrder(payload: CreateOrderPayload, token?: string) {
  return apiClient({
    endpoint: "/orders",
    method: "POST",
    body: payload as any,
    token,
  });
}
export interface CreateOrderWithDetailsPayload {
  userId: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: {
    addressName: string;
    addressDetails: string;
    area: string;
    city: string;
    addressType: "home" | "office" | "other";
    isDefault: boolean;
  };
  productId: string[];
  quantity: number;
  units: Array<{
    productId: string;
    quantity: number;
    variant_1?: string;
    variant_2?: string;
  }>;
  couponCode?: string;
  paymentMethod: "credit_card" | "wallet" | "cash_on_delivery";
  sellerId?: string | null;
  totalPrice: number;
}

export async function createOrderWithDetails(payload: CreateOrderWithDetailsPayload, token?: string) {
  return apiClient<{ status: string; data: any; message: string }>({
    endpoint: "/orders/create-with-details",
    method: "POST",
    body: payload as any,
    token,
  });
}
  // return apiClient<{ status: string; data: any; message: string }>({
  //   endpoint: "/orders/create-with-details",
  //   method: "POST",
  //   body: payload as any,
  //   token,
  // });
export async function requestReturn(payload: { orderId: string; productId: string; description: string }, token?: string) {
  return apiClient({
    endpoint: "/orders/returns",
    method: "POST",
    body: payload as any,
    token,
  });
}

export async function getCustomerReturns(token?: string): Promise<any[]> {
  try {
    const res = await apiClient<any>({
      endpoint: "/orders/all-returns",
      method: "GET",
      token,
    });
    // According to user: "Get returns endpoint rows"
    // Usually res.data or res.data.data or res
    return (res as any)?.data?.data || (res as any)?.data || res || [];
  } catch (err) {
    console.error("getCustomerReturns failed:", err);
    return [];
  }
}

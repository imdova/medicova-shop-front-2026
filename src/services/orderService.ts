import { apiClient } from "@/lib/apiClient";
import { ApiProduct } from "./productService";

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
  orderId: string; 
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

export interface ApiReturn {
  _id: string;
  orderId: string;
  order?: ApiOrder;
  productId: string;
  product?: ApiProduct;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  sellerId?: string;
  seller?: {
    _id: string;
    name: string;
  };
  quantity?: number;
  reason?: string;
  description?: string;
  status: "pending" | "approved" | "refunded" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export async function getOrders(token?: string, params?: { sellerId?: string }): Promise<ApiOrder[]> {
  try {
    let endpoint = "/orders";
    if (params?.sellerId) {
      endpoint += `?sellerId=${params.sellerId}`;
    }
    const res = await apiClient({
      endpoint,
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

export async function getReturns(token?: string): Promise<ApiReturn[]> {
  try {
    // 1. Primary Attempt: Standard returns listing endpoint
    const res = await apiClient<any>({
      endpoint: "/orders/returns", // Changed from all-returns to avoid Cast error
      method: "GET",
      token,
      suppressErrorLog: true,
    });
    const data = (res as any)?.data?.data || (res as any)?.data || res;
    if (Array.isArray(data)) {
      return data;
    }
    
    // If not an array, it might be a redirected response or single object, proceed to fallback
    throw new Error("Invalid returns data format");
  } catch (err: any) {

    try {
      const ordersRes = await apiClient<any>({
        endpoint: "/orders",
        method: "GET",
        token,
      });
      
      const allOrders = (ordersRes as any)?.data?.data || (ordersRes as any)?.data || ordersRes || [];
      if (Array.isArray(allOrders)) {
        return allOrders
          .filter((o: any) => o.status === "returned" || o.paymentStatus === "refunded")
          .map((o: any) => {
            const its = o.items || o.units || [];
            const firstItem = its[0] || {};
            return {
              _id: o._id || o.id || "unknown",
              orderId: o.orderId || o._id || "unknown",
              productId: firstItem.productId || firstItem.sku || "unknown",
              userId: o.user?.id || o.userId || "unknown",
              sellerId: o.sellerId || "unknown",
              amount: o.total || o.totalPrice || 0,
              reason: "Return requested",
              description: "Status: " + (o.status || "Returned"),
              status: o.status === "returned" ? "approved" : "pending",
              createdAt: o.createdAt || new Date().toISOString(),
              updatedAt: o.updatedAt || new Date().toISOString(),
              user: o.user || { name: "Customer", email: "" },
              seller: { _id: o.sellerId || "", name: o.sellerName || "Seller" },
              product: { 
                _id: firstItem.productId || "", 
                nameEn: firstItem.productName || "Product", 
                nameAr: firstItem.productNameAr || "منتج",
                image: firstItem.productImage || "",
                sku: firstItem.sku || "",
                price: firstItem.unitPrice || 0,
                finalPrice: firstItem.unitPrice || 0,
                approved: true,
                totalQuantity: firstItem.quantity || 0,
              } as any,
              order: o
            };
          });
      }
      return [];
    } catch (fallbackErr) {
      console.error("Returns lookup failed entirely:", fallbackErr);
      return [];
    }
  }
}

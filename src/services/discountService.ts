import { Discount } from "@/types/product";

const BASE_URL = "https://shop-api.medicova.net/api/v1/coupons";

export interface CreateDiscountPayload {
  sellerId: string;
  discountName: string;
  method: "automatic_discount" | "discount_code";
  discountCode: string;
  discountType: "fixed" | "percentage" | "shipping";
  discountValue: number;
  appliesTo: "all_products" | "specific_products" | "specific_categories" | "specific_subcategories" | "minimum_amount" | string;
  productIds: string[];
  categoryIds: string[];
  subcategoryIds: string[];
  availableOnAllSalesChannels: boolean;
  eligibility: "all_customers" | "specific_customer_segments" | "specific_customers";
  customerSegmentIds: string[];
  customerIds: string[];
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  active: boolean;
  status: "active" | "inactive" | "expired" | string;
}



export interface ApiDiscountsResponse {
  status: string;
  data: {
    discounts: any[];
    total: number;
    page: number;
    limit: number;
    next: boolean;
    previous: boolean;
  };
  message: string;
}

export const getDiscounts = async (token: string): Promise<Discount[]> => {
  const response = await fetch(BASE_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch discounts");
  }

  const result: ApiDiscountsResponse = await response.json();
  
  return result.data.discounts.map(mapDiscount);
};

export const createDiscount = async (
  payload: CreateDiscountPayload,
  token: string
): Promise<Discount> => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create discount");
  }

  const result = await response.json();
  return mapDiscount(result.data.discount || result.data);
};

export const updateDiscount = async (
  id: string,
  payload: Partial<CreateDiscountPayload>,
  token: string
): Promise<Discount> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update discount");
  }

  const result = await response.json();
  return mapDiscount(result.data.discount || result.data);
};

export const getDiscount = async (id: string, token: string): Promise<Discount> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch discount");
  }

  const result = await response.json();
  return mapDiscount(result.data.discount || result.data);
};

export const deleteDiscount = async (id: string, token: string): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete discount");
  }
};

const mapDiscount = (apiDiscount: any): Discount => {
  return {
    ...apiDiscount,
    id: apiDiscount._id,
    // Keep compatibility fields
    couponCode: apiDiscount.discountCode,
    type: apiDiscount.method === "automatic_discount" ? "promotion" : "coupon",
    value: apiDiscount.discountValue,
    description: apiDiscount.discountName,
    store: apiDiscount.sellerId?.brandName || "System",
  };
};

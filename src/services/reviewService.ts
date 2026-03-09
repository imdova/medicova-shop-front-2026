import { ReviewType } from "@/types/product";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://shop-api.medicova.net/api/v1";

export interface ApiReview {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  comment: string;
  images: string[];
  status: "published" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  product?: {
    _id: string;
    nameEn: string;
    nameAr: string;
  };
}

export const getAllReviews = async (token: string, productId?: string): Promise<ReviewType[]> => {
  const url = productId 
    ? `${BASE_URL}/reviews/product/${productId}` 
    : `${BASE_URL}/reviews`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch reviews");
  }

  const data = await response.json();
  const reviews = data.data.reviews || data.data || [];

  return reviews.map((r: any) => ({
    id: r._id,
    product: {
      id: r.productId,
      title: {
        en: r.product?.nameEn || "Product",
        ar: r.product?.nameAr || "منتج",
      },
      images: [], // We might need to fetch full product details if needed
    },
    user: {
      id: r.userId,
      firstName: r.user?.firstName || "Customer",
      lastName: r.user?.lastName || "",
      email: "", // Not always provided in summary
      image: r.user?.profileImage || "",
    },
    rating: r.rating,
    comment: r.comment,
    images: r.images || [],
    status: {
      en: r.status.charAt(0).toUpperCase() + r.status.slice(1),
      ar: r.status === "published" ? "منشور" : r.status === "pending" ? "قيد الانتظار" : "مرفوض",
    },
    createdAt: r.createdAt,
  }));
};

export const createReview = async (data: any, token: string) => {
  const response = await fetch(`${BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create review");
  }

  return response.json();
};

export const updateReview = async (id: string, data: any, token: string) => {
  const response = await fetch(`${BASE_URL}/reviews/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update review");
  }

  return response.json();
};

export const deleteReview = async (id: string, token: string) => {
  const response = await fetch(`${BASE_URL}/reviews/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete review");
  }

  return response.json();
};

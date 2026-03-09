import { ReviewType } from "@/types/product";
import { getProductById } from "./productService";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://shop-api.medicova.net/api/v1";

export interface ApiReview {
  _id: string;
  productId: string;
  userId: string;
  rate: number;
  descriptionEn: string;
  descriptionAr: string;
  images: string[];
  status: "published" | "pending" | "rejected" | "manual";
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    userName?: string;
    userEmail?: string;
    userImage?: string;
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
  const reviewsData = data.data.reviews || data.data || [];
  const reviews = Array.isArray(reviewsData) ? reviewsData : (reviewsData.data || []);

  return reviews.map((r: any) => ({
    id: r._id,
    product: {
      id: String(r.productId?._id || r.productId || ""),
      title: {
        en: r.product?.nameEn || r.product?.title?.en || "Product",
        ar: r.product?.nameAr || r.product?.title?.ar || "منتج",
      },
      images: r.product?.media?.featuredImages ? [r.product.media.featuredImages] : (r.product?.images || []),
      price: r.product?.pricing?.salePrice || r.product?.price || 0,
    },
    user: {
      id: r.userId,
      firstName: r.user?.firstName || r.userName || "Customer",
      lastName: r.user?.lastName || "",
      email: r.userEmail || "", 
      avatar: r.user?.profileImage || r.userImage || "",
    },
    rating: r.rate || r.rating || 0,
    comment: r.descriptionEn || r.comment || "",
    images: r.images || [],
    status: {
      en: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "Pending",
      ar: r.status === "published" ? "منشور" : r.status === "pending" ? "قيد الانتظار" : "مرفوض",
    },
    createdAt: r.createdAt,
    reviewType: r.status === "manual" ? "manual" : "system",
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
    console.error("API Error in createReview:", JSON.stringify(errorData, null, 2));
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

export const getReviewById = async (id: string, token: string): Promise<ReviewType> => {
  const response = await fetch(`${BASE_URL}/reviews/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch review");
  }

  const data = await response.json();
  const r = data.data;

  // Determine Product ID
  let productId = "";
  if (typeof r.productId === "string") productId = r.productId;
  else if (r.productId?._id) productId = String(r.productId._id);
  else if (r.product?._id) productId = String(r.product._id);

  // Initial Product Info from review data
  let productInfo = {
    id: productId,
    title: {
      en: r.product?.nameEn || r.product?.title?.en || "Product",
      ar: r.product?.nameAr || r.product?.title?.ar || "منتج",
    },
    images: r.product?.media?.featuredImages 
      ? [r.product.media.featuredImages] 
      : (Array.isArray(r.product?.images) ? r.product.images : []),
    price: r.product?.pricing?.salePrice || r.product?.price || 0,
  };

  // If missing critical info, fetch full product
  if (productId && (productInfo.images.length === 0 || productInfo.title.en === "Product" || !productInfo.price)) {
    try {
      const fullProduct = await getProductById(productId, token);
      if (fullProduct) {
        productInfo.title = {
          en: fullProduct.nameEn || (fullProduct as any).title?.en || productInfo.title.en,
          ar: fullProduct.nameAr || (fullProduct as any).title?.ar || productInfo.title.ar,
        };
        productInfo.images = fullProduct.media?.featuredImages 
          ? [fullProduct.media.featuredImages] 
          : (fullProduct.media?.galleryImages || (fullProduct as any).images || []);
        productInfo.price = fullProduct.pricing?.salePrice || fullProduct.price || 0;
      }
    } catch (err) {
      console.error("Failed to fetch full product info for review:", err);
    }
  }

  return {
    id: r._id,
    product: productInfo,
    user: {
      id: String(r.userId?._id || r.userId || ""),
      firstName: r.user?.firstName || r.userName || "Customer",
      lastName: r.user?.lastName || "",
      email: r.UserEmail || r.user?.email || "", 
      avatar: r.userImage || r.user?.profileImage || "",
    },
    rating: r.rate || r.rating || 0,
    comment: r.descriptionEn || r.descriptionAr || r.comment || "",
    images: Array.isArray(r.images) ? r.images : [],
    status: {
      en: r.status ? (r.status.charAt(0).toUpperCase() + r.status.slice(1)) : "Pending",
      ar: r.status === "published" ? "منشور" : r.status === "pending" ? "قيد الانتظار" : "مرفوض",
    },
    createdAt: r.createdAt,
    reviewType: r.status === "manual" ? "manual" : "system",
  };
};

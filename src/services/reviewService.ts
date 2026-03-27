import { apiClient } from "@/lib/apiClient";
import { ReviewType } from "@/types/product";
import { getProductById } from "./productService";

export interface ApiReview {
  _id: string;
  productId: string;
  userId: string;
  rate: number;
  descriptionEn: string;
  descriptionAr: string;
  images: string[];
  status: "published" | "pending" | "rejected" | "manual";
  approved: boolean;
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

export const getAllReviews = async (
  token: string,
  productId?: string,
): Promise<{ reviews: ReviewType[]; totalRate: number }> => {
  const endpoint = productId
    ? `/reviews/product/${productId}?populate=productId,userId`
    : `/reviews?populate=productId,userId`;

  let res: any;
  try {
    res = await apiClient<any>({
      endpoint,
      method: "GET",
      token,
      suppressErrorLog: true,
      suppressAutoLogout: true,
    });
  } catch (err) {
    console.warn("getAllReviews failed (suppressed):", err);
    return { reviews: [], totalRate: 0 };
  }

  const data = res.data || res;
  const reviewsData =
    data.reviews || (Array.isArray(data) ? data : data.data || []);
  const totalRate = data.total_rate || 0;

  const reviews = Array.isArray(reviewsData)
    ? reviewsData.filter((r: any) => r.productId)
    : [];

  const mappedReviews = reviews.map((r: any) => ({
    id: r._id,
    product: {
      id: String(r.productId?._id || r.productId || ""),
      title: {
        en:
          r.product?.nameEn ||
          r.product?.title?.en ||
          r.productId?.nameEn ||
          r.productId?.title?.en ||
          r.productNameEn ||
          r.nameEn ||
          r.productName ||
          r.name ||
          "Product",
        ar:
          r.product?.nameAr ||
          r.product?.title?.ar ||
          r.productId?.nameAr ||
          r.productId?.title?.ar ||
          r.productNameAr ||
          r.nameAr ||
          r.productName ||
          r.name ||
          "منتج",
      },
      images: r.product?.media?.featuredImages
        ? [r.product.media.featuredImages]
        : r.product?.images || [],
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
      en: r.status
        ? r.status.charAt(0).toUpperCase() + r.status.slice(1)
        : "Pending",
      ar:
        r.status === "published"
          ? "منشور"
          : r.status === "pending"
            ? "قيد الانتظار"
            : "مرفوض",
    },
    approved: r.approved || false,
    createdAt: r.createdAt,
    reviewType: (r.status === "manual" ? "manual" : "system") as "manual" | "system",
  }));

  return { reviews: mappedReviews, totalRate };
};

export const createReview = async (data: any, token: string) => {
  return apiClient({
    endpoint: "/reviews",
    method: "POST",
    body: data,
    token,
  });
};

export const updateReview = async (id: string, data: any, token: string) => {
  return apiClient({
    endpoint: `/reviews/${id}`,
    method: "PATCH",
    body: data,
    token,
  });
};

export const deleteReview = async (id: string, token: string) => {
  return apiClient({
    endpoint: `/reviews/${id}`,
    method: "DELETE",
    token,
  });
};

export const getReviewById = async (id: string, token: string): Promise<ReviewType> => {
  const res = await apiClient<any>({
    endpoint: `/reviews/${id}`,
    method: "GET",
    token,
  });

  const r = res.data || res;

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
    approved: r.approved || false,
    createdAt: r.createdAt,
    reviewType: r.status === "manual" ? "manual" : "system",
  };
};

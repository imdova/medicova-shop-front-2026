import { ApiProduct } from "@/services/productService";
import { Seller } from "@/services/sellerService";
import { LanguageType } from "@/util/translations";

export type ProductManagementMode = "admin" | "seller";

export type ProductViewMode = "list" | "grid";

export type ProductApprovalFilter = "" | "approved" | "pending";

export type ProductPublishFilter = "" | "Published" | "Draft";

export type ProductDateFilter = "" | "7" | "30" | "90" | "no-date";

export interface ProductLookupMaps {
  categoryMap: Record<string, { en: string; ar: string }>;
  subCategoryMap: Record<string, { en: string; ar: string }>;
  childCategoryMap: Record<string, { en: string; ar: string }>;
  sellerMap: Record<string, string>;
  sellersList: Seller[];
}

export interface ProductFilterState {
  searchQuery: string;
  sellerFilter: string;
  categoryFilter: string;
  subCategoryFilter: string;
  childCategoryFilter: string;
  approvalFilter: ProductApprovalFilter;
  publishFilter: ProductPublishFilter;
  dateFilter: ProductDateFilter;
}

export interface ProductComputedStats {
  totalProducts: number;
  pendingCount: number;
  outOfStockCount: number;
  topCategory: string;
}

export interface ProductRouteBuilder {
  createPath: string;
  detailsPath: (id: string) => string;
  editPath: (id: string) => string;
}

export interface ProductManagementViewState {
  locale: LanguageType;
  isAr: boolean;
  mode: ProductManagementMode;
  loading: boolean;
  products: ApiProduct[];
  filteredProducts: ApiProduct[];
  paginatedProducts: ApiProduct[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  viewMode: ProductViewMode;
  approvingId: string | null;
  isDeleting: boolean;
  productToDelete: ApiProduct | null;
  showDeleteConfirm: boolean;
  publishStatus: Record<string, "Published" | "Draft">;
  filters: ProductFilterState;
  lookups: ProductLookupMaps;
  stats: ProductComputedStats;
  routes: ProductRouteBuilder;
}

export interface ProductManagementActions {
  setViewMode: (mode: ProductViewMode) => void;
  setSearchQuery: (value: string) => void;
  setSellerFilter: (value: string) => void;
  setCategoryFilter: (value: string) => void;
  setSubCategoryFilter: (value: string) => void;
  setChildCategoryFilter: (value: string) => void;
  setApprovalFilter: (value: ProductApprovalFilter) => void;
  setPublishFilter: (value: ProductPublishFilter) => void;
  setDateFilter: (value: ProductDateFilter) => void;
  clearAllFilters: () => void;
  setPublishValue: (id: string, value: "Published" | "Draft") => void;
  requestDelete: (product: ApiProduct) => void;
  closeDeleteModal: () => void;
  confirmDelete: () => Promise<void>;
  toggleApprove: (product: ApiProduct) => Promise<void>;
}

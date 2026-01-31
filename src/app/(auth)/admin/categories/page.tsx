"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PencilIcon, Search, TrashIcon, Plus } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import Image from "next/image";
import ImageUpload from "@/components/UI/ImageUpload";
import StatusToggle from "@/components/UI/Buttons/StatusToggle";
import { LocalizedTitle } from "@/types/language";
import { useLanguage } from "@/contexts/LanguageContext";

// --- Type Definitions ---

// type FormData = {
//   name_en: string;
//   name_ar: string;
//   parentCategory: string; // Used for sub-categories
//   priority: number;
//   logo: FileList | null;
// };

type BrandFormData = {
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  priority: number;
  logo: FileList | null;
};

type Category = {
  id: string;
  image: string;
  name: LocalizedTitle;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

type SubCategory = {
  id: string;
  name: LocalizedTitle;
  parentCategory: LocalizedTitle;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

type Brand = {
  id: string;
  logo: string;
  name: LocalizedTitle;
  date: string;
  products: number;
  orders: number;
  totalSales: LocalizedTitle;
  status: "active" | "inactive";
  isActive: boolean;
};

type TranslationValue = string | { [key: string]: TranslationValue };

// --- Translations ---
const translations: Record<"en" | "ar", TranslationValue> = {
  en: {
    categories: "Categories",
    subCategories: "Sub Categories",
    brands: "Brands",
    categorySetup: "Category Setup",
    subCategorySetup: "Sub Category Setup",
    brandSetup: "Brand Setup",
    allCategories: "All Categories",
    allSubCategories: "All Sub Categories",
    allBrands: "All Brands",
    categoryName: "Category Name",
    subCategoryName: "Sub Category Name",
    brandName: "Brand Name",
    parentCategory: "Parent Category",
    priority: "Priority",
    categoryLogo: "Category Logo",
    brandLogo: "Brand Logo",
    submit: "Submit",
    reset: "Reset",
    searchPlaceholder: "Search by name...",
    search: "Search",
    download: "Download",
    edit: "Edit",
    delete: "Delete",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    products: "Products",
    orders: "Orders",
    totalSales: "Total Sales",
    date: "Date",
    categoryImage: "Category Image",
    brandImage: "Brand Image",
    requiredField: "This field is required",
    chooseParent: "Choose Parent Category",
    nameEn: "Name (English)",
    nameAr: "Name (Arabic)",
    nameEnPlaceholder: "Enter name in English",
    nameArPlaceholder: "Enter name in Arabic",
    slugEn: "Slug (English)",
    slugAr: "Slug (Arabic)",
    slugEnPlaceholder: "Enter slug in English",
    slugArPlaceholder: "Enter slug in Arabic",
    create: "Create",
  },
  ar: {
    categories: "الفئات",
    subCategories: "الفئات الفرعية",
    brands: "العلامات التجارية",
    categorySetup: "إعداد الفئة",
    subCategorySetup: "إعداد الفئة الفرعية",
    brandSetup: "إعداد العلامة التجارية",
    allCategories: "جميع الفئات",
    allSubCategories: "جميع الفئات الفرعية",
    allBrands: "جميع العلامات التجارية",
    categoryName: "اسم الفئة",
    subCategoryName: "اسم الفئة الفرعية",
    brandName: "اسم العلامة التجارية",
    parentCategory: "الفئة الرئيسية",
    priority: "الأولوية",
    categoryLogo: "شعار الفئة",
    brandLogo: "شعار العلامة التجارية",
    submit: "إرسال",
    reset: "إعادة تعيين",
    searchPlaceholder: "البحث بالاسم...",
    search: "بحث",
    download: "تحميل",
    edit: "تعديل",
    delete: "حذف",
    status: "الحالة",
    active: "نشط",
    inactive: "غير نشط",
    products: "المنتجات",
    orders: "الطلبات",
    totalSales: "إجمالي المبيعات",
    date: "التاريخ",
    categoryImage: "صورة الفئة",
    brandImage: "صورة العلامة التجارية",
    requiredField: "هذا الحقل مطلوب",
    chooseParent: "اختر الفئة الرئيسية",
    nameEn: "الاسم (الإنجليزية)",
    nameAr: "الاسم (العربية)",
    nameEnPlaceholder: "أدخل الاسم بالإنجليزية",
    nameArPlaceholder: "أدخل الاسم بالعربية",
    slugEn: "الرابط (الإنجليزية)",
    slugAr: "الرابط (العربية)",
    slugEnPlaceholder: "أدخل الرابط بالإنجليزية",
    slugArPlaceholder: "أدخل الرابط بالعربية",
    create: "إنشاء",
  },
};

const getTranslation = (key: string, locale: "en" | "ar"): string => {
  const keys = key.split(".");
  let result: TranslationValue = translations[locale];

  for (const k of keys) {
    if (typeof result === "string") return key; // Not navigable
    result = result[k];
    if (result === undefined) return key;
  }

  return typeof result === "string" ? result : key;
};

// --- Main Component ---
const CategoryBrandSetup = () => {
  const { language: locale } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<
    "categories" | "subCategories" | "brands"
  >("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Populate data on component mount
  useEffect(() => {
    const sampleCategories: Category[] = [
      {
        id: "1",
        image: "/images/landau.jpg",
        name: { en: "Electronics", ar: "إلكترونيات" },
        date: "15/5/2025",
        products: 450,
        orders: 500,
        totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
        status: "active",
        isActive: true,
      },
      {
        id: "2",
        image: "/images/landau.jpg",
        name: { en: "Clothing", ar: "ملابس" },
        date: "15/5/2025",
        products: 450,
        orders: 500,
        totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
        status: "active",
        isActive: true,
      },
      {
        id: "3",
        image: "/images/landau.jpg",
        name: { en: "Home & Garden", ar: "المنزل والحديقة" },
        date: "15/5/2025",
        products: 450,
        orders: 500,
        totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
        status: "active",
        isActive: true,
      },
    ];

    const sampleSubCategories: SubCategory[] = [
      {
        id: "1",
        name: { en: "Smartphones", ar: "هواتف ذكية" },
        parentCategory: { en: "Electronics", ar: "إلكترونيات" },
        date: "15/5/2025",
        products: 120,
        orders: 150,
        totalSales: { en: "50K EGP", ar: "٥٠ ألف جنيه" },
        status: "active",
        isActive: true,
      },
      {
        id: "2",
        name: { en: "Laptops", ar: "أجهزة كمبيوتر محمولة" },
        parentCategory: { en: "Electronics", ar: "إلكترونيات" },
        date: "15/5/2025",
        products: 80,
        orders: 90,
        totalSales: { en: "40K EGP", ar: "٤٠ ألف جنيه" },
        status: "active",
        isActive: false,
      },
      {
        id: "3",
        name: { en: "Men's Wear", ar: "ملابس رجالية" },
        parentCategory: { en: "Clothing", ar: "ملابس" },
        date: "15/5/2025",
        products: 200,
        orders: 180,
        totalSales: { en: "60K EGP", ar: "٦٠ ألف جنيه" },
        status: "active",
        isActive: false,
      },
    ];

    const sampleBrands: Brand[] = [
      {
        id: "1",
        logo: "/images/landau.jpg",
        name: { en: "Landau", ar: "لانداو" },
        date: "15/5/2025",
        products: 450,
        orders: 500,
        totalSales: { en: "150K EGP", ar: "١٥٠ ألف جنيه" },
        status: "active",
        isActive: true,
      },
      {
        id: "2",
        logo: "/images/landau.jpg",
        name: { en: "Nike", ar: "نايك" },
        date: "15/5/2025",
        products: 320,
        orders: 400,
        totalSales: { en: "120K EGP", ar: "١٢٠ ألف جنيه" },
        status: "active",
        isActive: true,
      },
      {
        id: "3",
        logo: "/images/landau.jpg",
        name: { en: "Apple", ar: "آبل" },
        date: "15/5/2025",
        products: 280,
        orders: 350,
        totalSales: { en: "200K EGP", ar: "٢٠٠ ألف جنيه" },
        status: "active",
        isActive: false,
      },
    ];

    setCategories(sampleCategories);
    setSubCategories(sampleSubCategories);
    setBrands(sampleBrands);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // Implement actual search filtering logic here based on activeTab and searchQuery
  };

  // --- Column Definitions for DynamicTable ---
  const categoryColumns = [
    {
      key: "image",
      header: getTranslation("categoryImage", locale),
      render: (item: Category) => (
        <Image
          width={200}
          height={200}
          src={item.image}
          alt={item.name[locale]}
          className="h-10 w-10 rounded-md object-cover"
        />
      ),
    },
    {
      key: "name",
      header: getTranslation("categoryName", locale),
      render: (item: Category) => item.name[locale],
    },
    {
      key: "date",
      header: getTranslation("date", locale),
    },
    {
      key: "products",
      header: getTranslation("products", locale),
    },
    {
      key: "orders",
      header: getTranslation("orders", locale),
    },
    {
      key: "totalSales",
      header: getTranslation("totalSales", locale),
      render: (item: Category) => item.totalSales[locale],
    },
    {
      key: "status",
      header: getTranslation("status", locale),
      sortable: true,
      render: (item: Category) => {
        const currentStatus = item.isActive;
        const handleStatusChange = (newStatus: boolean) => {
          console.log(
            `Category ID: ${item.id}, Status changed to: ${newStatus ? "Active" : "Inactive"}`,
          );
          setCategories((prevCategories) =>
            prevCategories.map((cat) =>
              cat.id === item.id
                ? {
                    ...cat,
                    isActive: newStatus,
                    status: newStatus ? "active" : "inactive",
                  }
                : cat,
            ),
          );
        };
        return (
          <StatusToggle
            initialStatus={currentStatus}
            onToggle={handleStatusChange}
          />
        );
      },
    },
  ];

  const subCategoryColumns = [
    {
      key: "name",
      header: getTranslation("subCategoryName", locale),
      render: (item: SubCategory) => item.name[locale],
    },
    {
      key: "parentCategory",
      header: getTranslation("parentCategory", locale),
      render: (item: SubCategory) => item.parentCategory[locale],
    },
    {
      key: "date",
      header: getTranslation("date", locale),
    },
    {
      key: "products",
      header: getTranslation("products", locale),
    },
    {
      key: "orders",
      header: getTranslation("orders", locale),
    },
    {
      key: "totalSales",
      header: getTranslation("totalSales", locale),
      render: (item: SubCategory) => item.totalSales[locale],
    },
    {
      key: "status",
      header: getTranslation("status", locale),
      sortable: true,
      render: (item: SubCategory) => {
        const currentStatus = item.isActive;
        const handleStatusChange = (newStatus: boolean) => {
          console.log(
            `SubCategory ID: ${item.id}, Status changed to: ${newStatus ? "Active" : "Inactive"}`,
          );
          setSubCategories((prevSubCategories) =>
            prevSubCategories.map((subCat) =>
              subCat.id === item.id
                ? {
                    ...subCat,
                    isActive: newStatus,
                    status: newStatus ? "active" : "inactive",
                  }
                : subCat,
            ),
          );
        };
        return (
          <StatusToggle
            initialStatus={currentStatus}
            onToggle={handleStatusChange}
          />
        );
      },
    },
  ];

  const brandColumns = [
    {
      key: "logo",
      header: getTranslation("brandImage", locale),
      render: (item: Brand) => (
        <Image
          width={200}
          height={200}
          src={item.logo}
          alt={item.name[locale]}
          className="h-10 w-10 rounded-md object-cover"
        />
      ),
    },
    {
      key: "name",
      header: getTranslation("brandName", locale),
      render: (item: Brand) => item.name[locale],
    },
    {
      key: "date",
      header: getTranslation("date", locale),
    },
    {
      key: "products",
      header: getTranslation("products", locale),
    },
    {
      key: "orders",
      header: getTranslation("orders", locale),
    },
    {
      key: "totalSales",
      header: getTranslation("totalSales", locale),
      render: (item: Brand) => item.totalSales[locale],
    },
    {
      key: "status",
      header: getTranslation("status", locale),
      sortable: true,
      render: (item: Brand) => {
        const currentStatus = item.isActive;
        const handleStatusChange = (newStatus: boolean) => {
          console.log(
            `Brand ID: ${item.id}, Status changed to: ${newStatus ? "Active" : "Inactive"}`,
          );
          setBrands((prevBrands) =>
            prevBrands.map((brand) =>
              brand.id === item.id
                ? {
                    ...brand,
                    isActive: newStatus,
                    status: newStatus ? "active" : "inactive",
                  }
                : brand,
            ),
          );
        };
        return (
          <StatusToggle
            initialStatus={currentStatus}
            onToggle={handleStatusChange}
          />
        );
      },
    },
  ];

  // --- React Hook Form Setups ---
  // const {
  //   register: registerCategory,
  //   handleSubmit: handleCategorySubmit,
  //   reset: resetCategoryForm,
  //   formState: { errors: categoryErrors },
  // } = useForm<FormData>();

  // const {
  //   register: registerSubCategory,
  //   handleSubmit: handleSubCategorySubmit,
  //   reset: resetSubCategoryForm,
  //   formState: { errors: subCategoryErrors },
  // } = useForm<FormData>();

  const {
    register: registerBrand,
    handleSubmit: handleBrandSubmit,
    reset: resetBrandForm,
    formState: { errors: brandErrors },
  } = useForm<BrandFormData>();

  // --- Form Submission Handlers ---
  // const onSubmitCategory = (data: FormData) => {
  //   console.log("Category submitted:", data);
  //   const newCategory: Category = {
  //     id: String(categories.length + 1),
  //     image:
  //       data.logo && data.logo.length > 0
  //         ? URL.createObjectURL(data.logo[0])
  //         : "/images/placeholder.jpg",
  //     name: { en: data.name_en, ar: data.name_ar },
  //     date: new Date().toLocaleDateString("en-GB"),
  //     products: 0,
  //     orders: 0,
  //     totalSales: { en: "0 EGP", ar: "٠ جنيه" },
  //     status: "active",
  //     isActive: true,
  //   };
  //   setCategories((prev) => [...prev, newCategory]);
  //   resetCategoryForm();
  // };

  // const onSubmitSubCategory = (data: FormData) => {
  //   console.log("Sub Category submitted:", data);
  //   const parentCat = categories.find((cat) => cat.id === data.parentCategory);
  //   const newSubCategory: SubCategory = {
  //     id: String(subCategories.length + 1),
  //     name: { en: data.name_en, ar: data.name_ar },
  //     parentCategory: parentCat
  //       ? parentCat.name
  //       : { en: "Unknown", ar: "غير معروف" },
  //     date: new Date().toLocaleDateString("en-GB"),
  //     products: 0,
  //     orders: 0,
  //     totalSales: { en: "0 EGP", ar: "٠ جنيه" },
  //     status: "active",
  //     isActive: true,
  //   };
  //   setSubCategories((prev) => [...prev, newSubCategory]);
  //   resetSubCategoryForm();
  // };

  const onSubmitBrand = (data: BrandFormData) => {
    console.log("Brand submitted:", data);
    const newBrand: Brand = {
      id: String(brands.length + 1),
      logo:
        data.logo && data.logo.length > 0
          ? URL.createObjectURL(data.logo[0])
          : "/images/placeholder.jpg",
      name: { en: data.name_en, ar: data.name_ar },
      date: new Date().toLocaleDateString("en-GB"),
      products: 0,
      orders: 0,
      totalSales: { en: "0 EGP", ar: "٠ جنيه" },
      status: "active",
      isActive: true,
    };
    setBrands((prev) => [...prev, newBrand]);
    resetBrandForm();
  };

  return (
    <div
      className={`rounded-lg border border-gray-200 bg-white px-2 py-4 shadow-sm ${
        locale === "ar" ? "text-right" : "text-left"
      }`}
    >
      <div className="mb-8">
        <div className="flex justify-start border-b border-gray-200">
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "categories"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("categories")}
          >
            {getTranslation("categories", locale)}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "subCategories"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("subCategories")}
          >
            {getTranslation("subCategories", locale)}
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === "brands"
                ? "border-b-2 border-green-500 text-green-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("brands")}
          >
            {getTranslation("brands", locale)}
          </button>
        </div>
      </div>

      {/* --- Category Setup Tab --- */}
      {activeTab === "categories" && (
        <>
          {/* Categories Table */}
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200 p-3">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium">
                    {getTranslation("allCategories", locale)}
                  </h3>
                  <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">
                    {categories.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-3 sm:flex-row">
                  <div className="flex flex-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={getTranslation(
                          "searchPlaceholder",
                          locale,
                        )}
                        className={`w-full rounded-s-md border ${locale === "ar" ? "border-l-0" : "border-r-0"} border-gray-300 px-3 py-1.5 text-sm outline-none placeholder:text-sm ${
                          locale === "ar" ? "pl-3 pr-10" : "pl-10 pr-3"
                        }`}
                      />
                      <Search
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-600 ${
                          locale === "ar" ? "right-4" : "left-4"
                        }`}
                        size={15}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="rounded-e-md bg-primary px-3 py-1.5 text-sm text-white hover:brightness-90"
                    >
                      {getTranslation("search", locale)}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/admin/product-settings/categories/create"
                      className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-fit"
                    >
                      <Plus size={16} /> {getTranslation("create", locale)}
                    </Link>
                    <button className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none sm:w-fit">
                      {getTranslation("download", locale)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <DynamicTable
                data={categories}
                columns={categoryColumns}
                minWidth={800}
                pagination={true}
                itemsPerPage={5}
                actions={[
                  {
                    label: getTranslation("edit", locale),
                    onClick: (item) =>
                      router.push(
                        `/admin/product-settings/categories/edit/${item.id}`,
                      ),
                    className:
                      "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50",
                    icon: <PencilIcon className="h-4 w-4" />,
                  },
                  {
                    label: getTranslation("delete", locale),
                    onClick: (item) => console.log("Delete category:", item),
                    className:
                      "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50",
                    icon: <TrashIcon className="h-4 w-4" />,
                  },
                ]}
                solidActions={[
                  {
                    onClick: (item) =>
                      router.push(
                        `/admin/product-settings/categories/edit/${item.id}`,
                      ),
                    icon: <PencilIcon className="h-4 w-4" />,
                    color: "#2563eb",
                  },
                  {
                    onClick: (item) =>
                      console.log("Delete category (solid):", item),
                    color: "#dc2626",
                    icon: <TrashIcon className="h-4 w-4" />,
                  },
                ]}
                locale={locale}
              />
            </div>
          </div>
        </>
      )}

      {/* --- Sub Category Setup Tab --- */}
      {activeTab === "subCategories" && (
        <>
          {/* Sub Categories Table */}
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200 p-3">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium">
                    {getTranslation("allSubCategories", locale)}
                  </h3>
                  <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">
                    {subCategories.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-3 sm:flex-row">
                  <div className="flex flex-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={getTranslation(
                          "searchPlaceholder",
                          locale,
                        )}
                        className={`w-full rounded-s-md border ${locale === "ar" ? "border-l-0" : "border-r-0"} border-gray-300 px-3 py-1.5 text-sm outline-none placeholder:text-sm ${
                          locale === "ar" ? "pl-3 pr-10" : "pl-10 pr-3"
                        }`}
                      />
                      <Search
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-600 ${
                          locale === "ar" ? "right-4" : "left-4"
                        }`}
                        size={15}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="rounded-e-md bg-primary px-3 py-1.5 text-sm text-white hover:brightness-90"
                    >
                      {getTranslation("search", locale)}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href="/admin/product-settings/sub-categories/create"
                      className="flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:w-fit"
                    >
                      <Plus size={16} /> {getTranslation("create", locale)}
                    </Link>
                    <button className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none sm:w-fit">
                      {getTranslation("download", locale)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <DynamicTable
                data={subCategories}
                columns={subCategoryColumns}
                minWidth={800}
                pagination={true}
                itemsPerPage={5}
                actions={[
                  {
                    label: getTranslation("edit", locale),
                    onClick: (item) =>
                      router.push(
                        `/admin/product-settings/sub-categories/edit/${item.id}`,
                      ),
                    className:
                      "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50",
                    icon: <PencilIcon className="h-4 w-4" />,
                  },
                  {
                    label: getTranslation("delete", locale),
                    onClick: (item) =>
                      console.log("Delete sub-category:", item),
                    className:
                      "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50",
                    icon: <TrashIcon className="h-4 w-4" />,
                  },
                ]}
                solidActions={[
                  {
                    onClick: (item) =>
                      router.push(
                        `/admin/product-settings/sub-categories/edit/${item.id}`,
                      ),
                    icon: <PencilIcon className="h-4 w-4" />,
                    color: "#2563eb",
                  },
                  {
                    onClick: (item) =>
                      console.log("Delete sub-category (solid):", item),
                    color: "#dc2626",
                    icon: <TrashIcon className="h-4 w-4" />,
                  },
                ]}
                locale={locale}
              />
            </div>
          </div>
        </>
      )}

      {/* --- Brands Setup Tab --- */}
      {activeTab === "brands" && (
        <>
          <div className="mb-8">
            <div className="flex items-center gap-2 p-3">
              <Image
                className="w-6"
                src="/icons/category.png"
                width={200}
                height={200}
                alt="category icon"
              />
              <h2 className="text-xl font-semibold">
                {getTranslation("brandSetup", locale)}
              </h2>
            </div>
            <div className="p-3">
              <form onSubmit={handleBrandSubmit(onSubmitBrand)}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-6">
                  <div className="md:col-span-3">
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {getTranslation("nameEn", locale)}*
                      </label>
                      <input
                        type="text"
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                          brandErrors.name_en
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={getTranslation(
                          "nameEnPlaceholder",
                          locale,
                        )}
                        {...registerBrand("name_en", {
                          required: getTranslation("requiredField", locale),
                        })}
                      />
                      {brandErrors.name_en && (
                        <p className="mt-1 text-sm text-red-600">
                          {brandErrors.name_en.message}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {getTranslation("nameAr", locale)}*
                      </label>
                      <input
                        type="text"
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                          brandErrors.name_ar
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={getTranslation(
                          "nameArPlaceholder",
                          locale,
                        )}
                        {...registerBrand("name_ar", {
                          required: getTranslation("requiredField", locale),
                        })}
                      />
                      {brandErrors.name_ar && (
                        <p className="mt-1 text-sm text-red-600">
                          {brandErrors.name_ar.message}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {getTranslation("slugEn", locale)}
                      </label>
                      <input
                        type="text"
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                          brandErrors.slug_en
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={getTranslation("slugEnPlaceholder", locale)}
                        {...registerBrand("slug_en", {
                          required: getTranslation("requiredField", locale),
                        })}
                      />
                      {brandErrors.slug_en && (
                        <p className="mt-1 text-sm text-red-600">
                          {brandErrors.slug_en.message}
                        </p>
                      )}
                    </div>
                    <div className="mb-4">
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {getTranslation("slugAr", locale)}
                      </label>
                      <input
                        type="text"
                        className={`w-full rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none ${
                          brandErrors.slug_ar
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        placeholder={getTranslation("slugArPlaceholder", locale)}
                        {...registerBrand("slug_ar", {
                          required: getTranslation("requiredField", locale),
                        })}
                      />
                      {brandErrors.slug_ar && (
                        <p className="mt-1 text-sm text-red-600">
                          {brandErrors.slug_ar.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        {getTranslation("priority", locale)}
                      </label>
                      <input
                        type="number"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none"
                        placeholder={getTranslation("priority", locale)}
                        {...registerBrand("priority", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </div>

                  <div className="md:col-span-3">
                    <ImageUpload
                      name="logo"
                      register={registerBrand}
                      errors={brandErrors}
                      label={getTranslation("brandLogo", locale)}
                      required={true}
                      aspectRatio="1:1"
                      maxSizeMB={2}
                      locale={locale}
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => resetBrandForm()}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none"
                  >
                    {getTranslation("reset", locale)}
                  </button>
                  <button
                    type="submit"
                    className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none"
                  >
                    {getTranslation("submit", locale)}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Brands Table */}
          <div className="border-t border-gray-200">
            <div className="border-b border-gray-200 p-3">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-medium">
                    {getTranslation("allBrands", locale)}
                  </h3>
                  <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-white">
                    {brands.length}
                  </span>
                </div>
                <div className="flex flex-1 flex-col items-center gap-3 sm:flex-row">
                  <div className="flex flex-1">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={getTranslation(
                          "searchPlaceholder",
                          locale,
                        )}
                        className={`w-full rounded-s-md border ${locale === "ar" ? "border-l-0" : "border-r-0"} border-gray-300 px-3 py-1.5 text-sm outline-none placeholder:text-sm ${
                          locale === "ar" ? "pl-3 pr-10" : "pl-10 pr-3"
                        }`}
                      />
                      <Search
                        className={`absolute top-1/2 -translate-y-1/2 text-gray-600 ${
                          locale === "ar" ? "right-4" : "left-4"
                        }`}
                        size={15}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      className="rounded-e-md bg-primary px-3 py-1.5 text-sm text-white hover:brightness-90"
                    >
                      {getTranslation("search", locale)}
                    </button>
                  </div>

                  <button className="w-full rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none sm:w-fit">
                    {getTranslation("download", locale)}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <DynamicTable
                data={brands}
                columns={brandColumns}
                minWidth={800}
                pagination={true}
                itemsPerPage={5}
                actions={[
                  {
                    label: getTranslation("edit", locale),
                    onClick: (item) => console.log("Edit brand:", item),
                    className:
                      "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50",
                    icon: <PencilIcon className="h-4 w-4" />,
                  },
                  {
                    label: getTranslation("delete", locale),
                    onClick: (item) => console.log("Delete brand:", item),
                    className:
                      "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50",
                    icon: <TrashIcon className="h-4 w-4" />,
                  },
                ]}
                solidActions={[
                  {
                    onClick: (item) => console.log("Edit brand (solid):", item),
                    icon: <PencilIcon className="h-4 w-4" />,
                    color: "#2563eb",
                  },
                  {
                    onClick: (item) =>
                      console.log("Delete brand (solid):", item),
                    color: "#dc2626",
                    icon: <TrashIcon className="h-4 w-4" />,
                  },
                ]}
                locale={locale}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryBrandSetup;

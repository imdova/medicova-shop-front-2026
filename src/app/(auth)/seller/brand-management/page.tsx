"use client";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import BrandApprovalModal from "../components/BrandApprovalModal";
import { useLanguage } from "@/contexts/LanguageContext";

type Brand = {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

const BrandsPage = () => {
  const { language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [brandCheckInput, setBrandCheckInput] = useState("");
  const [brandCheckResult, setBrandCheckResult] = useState<
    "exists" | "not-exists" | null
  >(null);

  const [searchParams, setSearchParams] = useState({ search: "", status: "" });

  useEffect(() => {
    const getParams = () => {
      const params = new URLSearchParams(window.location.search);
      return {
        search: params.get("search") || "",
        status: params.get("status") || "",
      };
    };

    setSearchParams(getParams());
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const getParams = () => {
        const params = new URLSearchParams(window.location.search);
        return {
          search: params.get("search") || "",
          status: params.get("status") || "",
        };
      };

      setSearchParams(getParams());
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      const mockBrands: Brand[] = [
        { id: "1", name: "Nike", status: "approved", createdAt: "2023-01-15" },
        {
          id: "2",
          name: "Adidas",
          status: "approved",
          createdAt: "2023-02-20",
        },
        { id: "3", name: "Puma", status: "pending", createdAt: "2023-03-10" },
        {
          id: "4",
          name: "Reebok",
          status: "rejected",
          createdAt: "2023-04-05",
        },
        {
          id: "5",
          name: "Under Armour",
          status: "pending",
          createdAt: "2023-05-12",
        },
      ];
      setBrands(mockBrands);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    const { search, status } = searchParams;
    let result = brands;

    if (search) {
      const term = search.toLowerCase();
      result = result.filter((brand) =>
        brand.name.toLowerCase().includes(term),
      );
    }

    if (status) {
      result = result.filter((brand) => brand.status === status);
    }

    setFilteredBrands(result);
  }, [brands, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchValue = formData.get("search") as string;

    const params = new URLSearchParams(window.location.search);
    if (searchValue) {
      params.set("search", searchValue);
    } else {
      params.delete("search");
    }

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    window.dispatchEvent(new Event("popstate"));
  };

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newStatus === "all") {
      params.delete("status");
    } else {
      params.set("status", newStatus);
    }

    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}?${params.toString()}`,
    );
    window.dispatchEvent(new Event("popstate"));
  };

  const handleBrandCheck = () => {
    if (!brandCheckInput.trim()) {
      setBrandCheckResult(null);
      return;
    }

    const exists = brands.some(
      (b) => b.name.toLowerCase() === brandCheckInput.trim().toLowerCase(),
    );

    setBrandCheckResult(exists ? "exists" : "not-exists");
  };

  const statusLabels: Record<Brand["status"], { en: string; ar: string }> = {
    pending: { en: "Pending", ar: "قيد الانتظار" },
    approved: { en: "Approved", ar: "معتمد" },
    rejected: { en: "Rejected", ar: "مرفوض" },
  };

  const columns = [
    {
      key: "name",
      header: { en: "Brand Name", ar: "اسم العلامة" }[language],
      sortable: true,
    },
    {
      key: "status",
      header: { en: "Status", ar: "الحالة" }[language],
      render: (item: Brand) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            item.status === "approved"
              ? "bg-green-100 text-green-800"
              : item.status === "pending"
                ? "bg-yellow-100 text-yellow-800"
                : "bg-red-100 text-red-800"
          }`}
        >
          {statusLabels[item.status][language]}
        </span>
      ),
    },
    {
      key: "createdAt",
      header: { en: "Created At", ar: "تاريخ الإنشاء" }[language],
      sortable: true,
    },
  ];

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          {language === "ar" ? "إدارة العلامات التجارية" : "Brand Management"}
        </h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          {language === "ar" ? "إنشاء علامة" : "Create Brand"}
        </button>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-800">
          {language === "ar"
            ? "تحقق مما إذا كانت العلامة موجودة بالفعل في قائمة نون"
            : "Check if the brand you want to create already exists in Noon Brands list"}
        </h2>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 p-2.5 outline-none sm:text-sm"
              placeholder={
                language === "ar" ? "تحقق من العلامة" : "Check brand"
              }
              value={brandCheckInput}
              onChange={(e) => {
                setBrandCheckInput(e.target.value);
                setBrandCheckResult(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleBrandCheck();
                }
              }}
            />
          </div>
          <button
            onClick={handleBrandCheck}
            className="inline-flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 sm:w-auto"
          >
            {language === "ar" ? "تحقق" : "Check"}
          </button>
        </div>
        {brandCheckResult === "exists" && (
          <p className="mt-2 flex items-center text-sm text-red-600">
            <XCircle className="mr-1 h-4 w-4" />
            {language === "ar"
              ? `العلامة "${brandCheckInput}" موجودة بالفعل.`
              : `Brand "${brandCheckInput}" already exists.`}
          </p>
        )}
        {brandCheckResult === "not-exists" && (
          <p className="mt-2 flex items-center text-sm text-green-600">
            <CheckCircle className="mr-1 h-4 w-4" />
            {language === "ar"
              ? `العلامة "${brandCheckInput}" متاحة.`
              : `Brand "${brandCheckInput}" is available.`}
          </p>
        )}
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <form
          onSubmit={handleSearch}
          className="mb-0 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div className="relative w-full rounded-lg border border-gray-200 md:max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="search"
              defaultValue={searchParams.search}
              className="w-full rounded-md border-gray-300 p-2 pl-10 outline-none sm:text-sm"
              placeholder={
                language === "ar" ? "ابحث عن علامة..." : "Search brands..."
              }
            />
          </div>
          <select
            value={searchParams.status || "all"}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="rounded-md border-gray-300 py-2 pl-3 pr-8 text-sm focus:border-green-500 focus:outline-none focus:ring-green-500"
          >
            <option value="all">
              {language === "ar" ? "كل الحالات" : "All Statuses"}
            </option>
            <option value="pending">{statusLabels.pending[language]}</option>
            <option value="approved">{statusLabels.approved[language]}</option>
            <option value="rejected">{statusLabels.rejected[language]}</option>
          </select>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <DynamicTable
          data={filteredBrands}
          columns={columns}
          pagination
          itemsPerPage={5}
          selectable
          locale={language}
          emptyMessage={
            isLoading
              ? {
                  en: "Loading brands...",
                  ar: "جارٍ تحميل العلامات...",
                }
              : {
                  en: "No brands found matching your criteria",
                  ar: "لا توجد علامات تطابق معايير البحث",
                }
          }
          actions={[
            {
              label: { en: "Edit", ar: "تعديل" },
              onClick: () => console.log("Edited"),
              className:
                "bg-white text-gray-700 hover:text-blue-700 hover:bg-blue-50",
              icon: <PencilIcon className="h-4 w-4" />,
            },
            {
              label: { en: "Delete", ar: "حذف" },
              onClick: () => console.log("Deleted"),
              className:
                "bg-white text-gray-700 hover:text-red-700 hover:bg-red-50",
              icon: <TrashIcon className="h-4 w-4" />,
            },
          ]}
        />
      </div>

      <BrandApprovalModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        locale={language}
      />
    </div>
  );
};

export default BrandsPage;

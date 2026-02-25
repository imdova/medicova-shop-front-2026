"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Star, MessageSquare, ShieldCheck, Activity } from "lucide-react";

// Types & Data
import { ReviewType } from "@/types/product";
import { dummyReviews } from "@/constants/reviews";
import { DynamicFilterItem } from "@/types/filters";
import { productFilters } from "@/constants/drawerFilter";

// Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/Tabs";
import DynamicFilter from "@/components/features/filter/DynamicFilter";
import ReviewFilters from "./components/ReviewFilters";
import ReviewTableContainer from "./components/ReviewTableContainer";

interface ExtendedReviewType extends ReviewType {
  reviewType: "manual" | "system";
}

export default function ReviewsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  // Mix of manual and system reviews for dummy data
  const extendedReviews: ExtendedReviewType[] = useMemo(
    () =>
      dummyReviews.map((review, index) => ({
        ...review,
        reviewType: index % 3 === 0 ? "system" : "manual",
      })),
    [],
  );

  const filteredReviews = useMemo(() => {
    return extendedReviews.filter((review) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        review.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.user.firstName
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        review.product.title[locale]
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      if (activeTab === "manual") return review.reviewType === "manual";
      if (activeTab === "system") return review.reviewType === "system";

      return true;
    });
  }, [extendedReviews, searchQuery, activeTab, locale]);

  const reviewTypeCounts = useMemo(
    () =>
      extendedReviews.reduce(
        (acc, review) => {
          acc[review.reviewType] = (acc[review.reviewType] || 0) + 1;
          return acc;
        },
        { manual: 0, system: 0 },
      ),
    [extendedReviews],
  );

  const statusCounts = useMemo(
    () =>
      extendedReviews.reduce((acc: Record<string, number>, review) => {
        const status = review.status[locale];
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
    [extendedReviews, locale],
  );

  const predefinedFilters: DynamicFilterItem[] = [
    {
      id: "status",
      label: { en: "Status", ar: "الحالة" },
      type: "dropdown",
      options: [
        { id: "published", name: { en: "Published", ar: "منشور" } },
        { id: "pending", name: { en: "Pending", ar: "قيد الانتظار" } },
        { id: "rejected", name: { en: "Rejected", ar: "مرفوض" } },
      ],
      visible: true,
    },
    {
      id: "rating",
      label: { en: "Rating", ar: "التقييم" },
      type: "dropdown",
      options: [
        { id: "5", name: { en: "5 Stars", ar: "5 نجوم" } },
        { id: "4", name: { en: "4 Stars", ar: "4 نجوم" } },
        { id: "3", name: { en: "3 Stars", ar: "3 نجوم" } },
        { id: "2", name: { en: "2 Stars", ar: "2 نجوم" } },
        { id: "1", name: { en: "1 Star", ar: "1 نجمة" } },
      ],
      visible: true,
    },
  ];

  const handleReset = () => {
    setSearchQuery("");
    setActiveTab("all");
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <Star className="fill-yellow-400 text-yellow-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("reviews")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              {t("moderateReviews")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <ShieldCheck size={10} />
              Active Guard
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Moderation Speed: <span className="text-gray-900">0.4s</span>
            </span>
          </div>
        </div>
      </div>

      <DynamicFilter
        t={{
          filters: t("filters"),
          reset: t("reset"),
          showData: t("showData"),
        }}
        isOpen={isOpen}
        onToggle={() => setIsOpen(false)}

        isRTL={isArabic}
        drawerFilters={productFilters}
        statusCounts={statusCounts}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        filters={predefinedFilters}
      />

      <ReviewFilters

        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onToggleFilters={() => setIsOpen(true)}
        onReset={handleReset}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="w-fit rounded-2xl border border-white/60 bg-gray-100/50 p-1.5 backdrop-blur-sm">
            <TabsTrigger
              value="all"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Activity className="size-4" />
              {t("allReviews")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {extendedReviews.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <MessageSquare className="size-4" />
              {t("manualReviews")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {reviewTypeCounts.manual}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Activity className="size-4" />
              {t("systemReviews")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {reviewTypeCounts.system}
              </span>
            </TabsTrigger>
          </TabsList>

          <p className="rounded-xl border border-white/60 bg-white/50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-sm">
            {filteredReviews.length} {t("reviews")} {t("found")}
          </p>
        </div>

        <TabsContent value="all" className="mt-0 focus-visible:outline-none">
          <ReviewTableContainer
            data={filteredReviews}

            onApprove={(r) => console.log("approve", r.id)}
            onReject={(r) => console.log("reject", r.id)}
            onDelete={(r) => console.log("delete", r.id)}
            onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
          />
        </TabsContent>
        <TabsContent value="manual" className="mt-0 focus-visible:outline-none">
          <ReviewTableContainer
            data={filteredReviews}

            onApprove={(r) => console.log("approve", r.id)}
            onReject={(r) => console.log("reject", r.id)}
            onDelete={(r) => console.log("delete", r.id)}
            onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
          />
        </TabsContent>
        <TabsContent value="system" className="mt-0 focus-visible:outline-none">
          <ReviewTableContainer
            data={filteredReviews}

            onApprove={(r) => console.log("approve", r.id)}
            onReject={(r) => console.log("reject", r.id)}
            onDelete={(r) => console.log("delete", r.id)}
            onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

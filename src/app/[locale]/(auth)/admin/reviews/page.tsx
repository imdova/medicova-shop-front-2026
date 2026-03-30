"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  Star,
  ShieldCheck,
  Activity,
  Loader2,
  Trash2,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { useSession } from "next-auth/react";
import {
  getAllReviews,
  updateReview,
  deleteReview,
} from "@/services/reviewService";
import toast from "react-hot-toast";

// Types & Data
import { ReviewType } from "@/types/product";
import { dummyReviews } from "@/constants/reviews";

// Components
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/shared/Tabs";
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

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [reviews, setReviews] = useState<ExtendedReviewType[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const fetchReviews = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { reviews: data } = await getAllReviews(token);
      setReviews(data as ExtendedReviewType[]);
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
      toast.error(isArabic ? "فشل تحميل التقييمات" : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchReviews();
  }, [token]);

  const handleApprove = async (id: string) => {
    if (!token) return;
    try {
      await updateReview(id, { approved: true }, token);
      toast.success(isArabic ? "تم قبول التقييم" : "Review approved");
      fetchReviews();
    } catch (err) {
      toast.error(isArabic ? "فشل قبول التقييم" : "Failed to approve review");
    }
  };

  const handleReject = async (id: string) => {
    if (!token) return;
    try {
      await updateReview(id, { approved: false }, token);
      toast.success(isArabic ? "تم رفض التقييم" : "Review rejected");
      fetchReviews();
    } catch (err) {
      toast.error(isArabic ? "فشل رفض التقييم" : "Failed to reject review");
    }
  };

  const handleDelete = (id: string) => {
    if (!token) return;

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "animate-enter" : "animate-leave"
          } pointer-events-auto flex w-full max-w-md rounded-2xl border border-rose-100 bg-white shadow-2xl shadow-rose-200/50 ring-1 ring-black ring-opacity-5`}
        >
          <div className="w-0 flex-1 p-5">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                  <Trash2 size={20} />
                </div>
              </div>
              <div className={isArabic ? "mr-4" : "ml-4"}>
                <p className="text-sm font-black text-gray-900">
                  {isArabic ? "تأكيد الحذف" : "Confirm Deletion"}
                </p>
                <p className="mt-1 text-xs font-bold text-gray-400">
                  {isArabic
                    ? "هل أنت متأكد من حذف هذا التقييم؟ لا يمكن التراجع عن هذا الإجراء."
                    : "Are you sure you want to delete this review? This action cannot be undone."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col border-l border-gray-100 font-bold uppercase tracking-widest text-[10px]">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteReview(id, token);
                  toast.success(isArabic ? "تم حذف التقييم" : "Review deleted");
                  fetchReviews();
                } catch (err) {
                  toast.error(
                    isArabic ? "فشل حذف التقييم" : "Failed to delete review",
                  );
                }
              }}
              className="flex w-full flex-1 items-center justify-center rounded-none border-b border-gray-100 px-6 py-3 text-rose-500 transition-colors hover:bg-rose-50/50 focus:outline-none"
            >
              {isArabic ? "حذف" : "Delete"}
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex w-full flex-1 items-center justify-center rounded-none px-6 py-3 text-gray-400 transition-colors hover:bg-gray-50 focus:outline-none"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: isArabic ? "top-left" : "top-right",
      },
    );
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
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

      // Tab filter (Status & Type based)
      if (activeTab === "pending") return !review.approved;
      if (activeTab === "approved") return review.approved;
      if (activeTab === "manual") return review.reviewType === "manual";
      if (activeTab === "system") return review.reviewType === "system";

      return true;
    });
  }, [reviews, searchQuery, activeTab, locale]);

  const counts = useMemo(
    () =>
      reviews.reduce(
        (acc, review) => {
          if (review.approved) acc.approved++;
          else acc.pending++;
          
          if (review.reviewType === "manual") acc.manual++;
          else if (review.reviewType === "system") acc.system++;
          
          return acc;
        },
        { pending: 0, approved: 0, manual: 0, system: 0 },
      ),
    [reviews],
  );


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

      <ReviewFilters
        locale={locale}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <TabsList className="w-fit rounded-2xl border border-white/60 bg-gray-100/50 p-1.5 backdrop-blur-sm overflow-x-auto">
            <TabsTrigger
              value="all"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Activity className="size-4" />
              {t("allReviews")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {reviews.length}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Loader2 className="size-4" />
              {t("pending")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {counts.pending}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="approved"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <CheckCircle className="size-4 text-emerald-500" />
              {t("approved")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {counts.approved}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <MessageSquare className="size-4" />
              {t("manualReviews")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {counts.manual}
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="system"
              className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold transition-all duration-500 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-lg"
            >
              <Activity className="size-4" />
              {t("systemReviews")}
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px]">
                {counts.system}
              </span>
            </TabsTrigger>
          </TabsList>

        </div>

        <TabsContent value="all" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReviewTableContainer
              locale={locale}
              data={filteredReviews}
              onApprove={(r) => handleApprove(r.id)}
              onReject={(r) => handleReject(r.id)}
              onDelete={(r) => handleDelete(r.id)}
              onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
            />
          )}
        </TabsContent>
        <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReviewTableContainer
              locale={locale}
              data={filteredReviews}
              onApprove={(r) => handleApprove(r.id)}
              onReject={(r) => handleReject(r.id)}
              onDelete={(r) => handleDelete(r.id)}
              onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
            />
          )}
        </TabsContent>
        <TabsContent value="approved" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReviewTableContainer
              locale={locale}
              data={filteredReviews}
              onApprove={(r) => handleApprove(r.id)}
              onReject={(r) => handleReject(r.id)}
              onDelete={(r) => handleDelete(r.id)}
              onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
            />
          )}
        </TabsContent>
        <TabsContent value="manual" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReviewTableContainer
              locale={locale}
              data={filteredReviews}
              onApprove={(r) => handleApprove(r.id)}
              onReject={(r) => handleReject(r.id)}
              onDelete={(r) => handleDelete(r.id)}
              onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
            />
          )}
        </TabsContent>
        <TabsContent value="system" className="mt-0 focus-visible:outline-none">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReviewTableContainer
              locale={locale}
              data={filteredReviews}
              onApprove={(r) => handleApprove(r.id)}
              onReject={(r) => handleReject(r.id)}
              onDelete={(r) => handleDelete(r.id)}
              onView={(r) => router.push(`/${locale}/admin/reviews/${r.id}`)}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Star } from "lucide-react";
import React, { useState } from "react";
import Avatar from "@/components/shared/Avatar";
import { useTranslations } from "next-intl";
import { LanguageType } from "@/util/translations";

type Review = {
  id: string;
  rating: number;
  content?: string;
  author: {
    id: string;
    name: string;
    imgUrl: string;
  };
  date: string;
};

type ProductReviewsProps = {
  reviews: Review[];
  locale?: LanguageType;
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews = [] }) => {
  const t = useTranslations("product");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const initialReviewsToShow = 3; // Number of reviews to show initially

  // Calculate which reviews to display
  const displayedReviews = showAllReviews
    ? reviews
    : reviews.slice(0, initialReviewsToShow);

  // Calculate average rating
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  // Calculate rating distribution
  const ratingDistribution = {
    5: reviews.filter((review) => review.rating === 5).length,
    4: reviews.filter((review) => review.rating === 4).length,
    3: reviews.filter((review) => review.rating === 3).length,
    2: reviews.filter((review) => review.rating === 2).length,
    1: reviews.filter((review) => review.rating === 1).length,
  };

  const totalReviews = reviews.length;

  const renderStars = (rating: number, size: number = 4) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${star <= rating ? "fill-primary text-primary" : "text-gray-300"}`}
          />
        ))}
      </div>
    );
  };

  const calculatePercentage = (count: number) => {
    return totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
  };

  return (
    <div className="bg-transparent">
      <div className="flex flex-wrap items-stretch gap-8">
        {/* Rating Summary Section */}
        <section className="min-w-[320px] flex-1 space-y-6 lg:max-w-sm">
          <div className="animate-in fade-in slide-in-from-left-4 rounded-3xl border border-white/40 bg-white/40 p-6 shadow-xl backdrop-blur-xl duration-1000">
            <h2 className="mb-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {t("overallRating")}
            </h2>
            <div className="flex items-end gap-4">
              <div className="text-6xl font-black tracking-tighter text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <div className="pb-2">
                {renderStars(Math.round(averageRating), 20)}
                <p className="mt-1 text-xs font-bold text-gray-400">
                  {t("basedOnRatings", { count: totalReviews })}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const percentage = calculatePercentage(
                  ratingDistribution[rating as keyof typeof ratingDistribution],
                );
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="flex w-6 items-center gap-1 text-xs font-bold text-gray-600">
                      {rating} <Star size={10} className="fill-current" />
                    </span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100/50">
                      <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-[10px] font-bold text-gray-400">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Info Panels */}
          <div className="animate-in fade-in slide-in-from-bottom-4 grid grid-cols-1 gap-4 delay-300 duration-700">
            <div className="rounded-2xl border border-white/40 bg-white/30 p-4 backdrop-blur-md transition-all hover:bg-white/50">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
                  <Star size={12} fill="currentColor" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {t("howToReview")}
                </h3>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-gray-500">
                {t("howToReviewDescription")}
              </p>
            </div>
            <div className="rounded-2xl border border-white/40 bg-white/30 p-4 backdrop-blur-md transition-all hover:bg-white/50">
              <div className="mb-2 flex items-center gap-2 text-emerald-600">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Star size={12} fill="currentColor" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  {t("verifiedSource")}
                </h3>
              </div>
              <p className="text-[11px] font-medium leading-relaxed text-gray-500">
                {t("verifiedSourceDescription")}
              </p>
            </div>
          </div>
        </section>

        {/* Reviews List Section */}
        <section className="min-w-[320px] flex-[2] space-y-6">
          <div className="animate-in fade-in slide-in-from-right-4 rounded-3xl border border-white/40 bg-white/20 p-8 shadow-xl backdrop-blur-xl duration-1000">
            <div className="mb-8 flex items-center justify-between border-b border-gray-100/50 pb-6">
              <h2 className="text-xl font-bold tracking-tight text-gray-900">
                {t("customerReviews")}
              </h2>
              <div className="text-xs font-bold uppercase tracking-widest text-primary">
                {totalReviews} {t("reviews")}
              </div>
            </div>

            {reviews.length > 0 ? (
              <div className="space-y-6">
                {displayedReviews.map((review) => (
                  <div
                    key={review.id}
                    className="group border-b border-gray-100/50 pb-6 transition-all last:border-0 last:pb-0"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="relative">
                          <Avatar
                            name={review.author.name}
                            imageUrl={review.author.imgUrl}
                            className="h-12 w-12 rounded-2xl shadow-sm transition-transform group-hover:scale-105"
                            RandomColor
                          />
                          <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[8px] text-white ring-2 ring-white">
                            ✓
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-800">
                            {review.author.name}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {review.date}
                          </span>
                          <div className="mt-1">
                            {renderStars(review.rating, 10)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {review.content && (
                      <div className="mt-4 rounded-2xl bg-white/40 p-4 text-sm font-medium leading-relaxed text-gray-600 transition-colors group-hover:bg-white/60">
                        {review.content}
                      </div>
                    )}
                  </div>
                ))}

                {reviews.length > initialReviewsToShow && (
                  <div className="pt-6">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white/50 py-4 text-sm font-bold text-primary transition-all hover:bg-white hover:shadow-lg active:scale-[0.98]"
                    >
                      {showAllReviews
                        ? t("showLess")
                        : t("viewAllReviews", { count: reviews.length })}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
                  <Star size={32} />
                </div>
                <p className="font-bold tracking-tight">{t("noReviewsYet")}</p>
                <p className="mt-1 text-xs">{t("beTheFirst")}</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductReviews;

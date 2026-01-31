import { Star } from "lucide-react";
import React, { useState } from "react";
import Avatar from "./Avatar";
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
  locale: LanguageType;
};

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews, locale }) => {
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
    <div className="bg-white">
      <main className="grid grid-cols-1 gap-6 md:grid-cols-8">
        <section className="col-span-1 md:col-span-3">
          <section className="mb-8 mt-4">
            <h2 className="mb-2 text-xl font-bold text-gray-600">
              {locale === "ar" ? "التقييم العام" : "Overall Rating"}
            </h2>
            <div className="flex flex-col gap-2">
              <div className="text-4xl font-bold">
                {averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(averageRating), 20)}
                <p className="text-xs text-gray-600">
                  {locale === "ar" ? (
                    <>
                      بناءً على {totalReviews}{" "}
                      {totalReviews === 1 ? "تقييم" : "تقييمات"}
                    </>
                  ) : (
                    <>
                      Based on {totalReviews}{" "}
                      {totalReviews === 1 ? "rating" : "ratings"}
                    </>
                  )}
                </p>
              </div>
            </div>
          </section>
          <div className="mb-8">
            <div className="grid grid-cols-1">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const percentage = calculatePercentage(
                    ratingDistribution[
                      rating as keyof typeof ratingDistribution
                    ],
                  );

                  const getColorClass = () => {
                    switch (rating) {
                      case 5:
                        return "bg-green-600 text-green-600";
                      case 4:
                        return "bg-lime-500 text-lime-500";
                      case 3:
                        return "bg-yellow-500 text-yellow-500";
                      case 2:
                        return "bg-orange-500 text-orange-500";
                      case 1:
                        return "bg-red-500 text-red-500";
                      default:
                        return "bg-yellow-500 text-yellow-500";
                    }
                  };

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span
                        className={`flex ${locale === "ar" && "flex-row-reverse"} w-8 items-center font-semibold text-gray-700`}
                      >
                        {rating}
                        <Star
                          size={14}
                          className={`ml-1 ${rating <= rating ? "fill-current" : ""} ${getColorClass().replace("bg-", "")}`}
                        />
                      </span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full ${getColorClass()} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="w-10 text-right text-xs font-semibold text-gray-600">
                        {percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="col-span-1 md:col-span-5">
          <div className="my-4 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="p-2">
              <div className="mb-2 flex gap-2">
                <div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-green-50 text-primary">
                    <Star size={13} />
                  </span>
                </div>
                <h3 className="font-semibold">
                  {locale === "ar"
                    ? "كيف أقيم هذا المنتج؟"
                    : "How do I review this product?"}
                </h3>
              </div>
              <p className="text-xs text-gray-600">
                {locale === "ar" ? (
                  <>
                    إذا كنت قد اشتريت هذا المنتج مؤخرًا من نون، يمكنك الذهاب إلى
                    صفحة الطلبات الخاصة بك والنقر على زر إرسال التقييم.
                  </>
                ) : (
                  <>
                    If you recently purchased this product from noon, you can go
                    to your Orders page and click on the Submit Review button.
                  </>
                )}
              </p>
            </div>
            <div className="p-2">
              <div className="mb-2 flex gap-2">
                <div>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-primary bg-green-50 text-primary">
                    <Star size={13} />
                  </span>
                </div>
                <h3 className="font-semibold">
                  {locale === "ar"
                    ? "من أين تأتي التقييمات؟"
                    : "Where do the reviews come from"}
                </h3>
              </div>
              <p className="text-xs text-gray-600">
                {locale === "ar"
                  ? "تقييماتنا تأتي من عملاء نون الذين اشتروا المنتج وقدموا مراجعة."
                  : "Our reviews are from noon customers who purchased the product and submitted a review."}
              </p>
            </div>
          </div>
          {reviews.length > 0 ? (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                {locale === "ar" ? "مراجعات العملاء" : "Customer Reviews"}
              </h2>
              <div className="space-y-6">
                {displayedReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 p-4">
                    <div className="mb-2 flex justify-between">
                      <div className="flex gap-2">
                        <Avatar
                          name={review.author.name}
                          imageUrl={review.author.imgUrl}
                          className="h-10 w-10"
                          RandomColor
                        />
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-medium">
                            {review.author.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {review.date}
                          </span>
                          {renderStars(review.rating, 12)}
                        </div>
                      </div>
                    </div>
                    {review.content && (
                      <p className="text-sm text-gray-700">{review.content}</p>
                    )}
                  </div>
                ))}

                {reviews.length > initialReviewsToShow && (
                  <div className="flex justify-center">
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {locale === "ar"
                        ? showAllReviews
                          ? "عرض أقل"
                          : `عرض جميع التقييمات (${reviews.length})`
                        : showAllReviews
                          ? "Show Less"
                          : `View All Reviews (${reviews.length})`}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-8">
              <p className="text-sm text-gray-600">
                This product doesnt have any reviews yet.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProductReviews;

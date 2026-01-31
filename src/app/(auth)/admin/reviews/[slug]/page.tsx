"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Textarea } from "@/components/UI/textarea";
import { Badge } from "@/components/Badge";
import {
  Star,
  Calendar,
  User,
  Mail,
  Package,
  MessageSquare,
  Trash2,
  Reply,
} from "lucide-react";
import Image from "next/image";
import Loading from "@/app/loading";
import { dummyReviews } from "@/constants/reviews";
import { formatFullName, getTimeAgo } from "@/util";
import { ReviewType } from "@/types/product";
import { formatDate } from "@/util/dateUtils";
import NotFound from "@/app/not-found";

// Define the proper interfaces based on your ReviewType

interface Reply {
  id: string;
  admin_name: string;
  comment: string;
  created_at: string;
}

// ---------------- Component ----------------
export default function ViewReviewPage() {
  const { language } = useLanguage();
  const params = useParams();
  const reviewSlug = params.slug as string;

  const [review, setReview] = useState<ReviewType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Fetch review data when component mounts or slug changes
  useEffect(() => {
    const loadReviewData = async () => {
      if (!reviewSlug) return;

      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundReview = dummyReviews.find((r) => r.id === reviewSlug);
        setReview(foundReview ?? null);
      } catch (error) {
        console.error("Failed to load review data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReviewData();
  }, [reviewSlug]);

  const handleSubmitReply = async () => {
    if (!replyText.trim() || !review) return;

    setIsSubmittingReply(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newReply: Reply = {
        id: Date.now().toString(),
        admin_name: "Admin",
        comment: replyText,
        created_at: new Date().toDateString(),
      };

      setReview({
        ...review,
        replies: [...(review.replies ?? []), newReply],
      });

      setReplyText("");
      console.log("Reply submitted successfully");
    } catch (error) {
      console.error("Failed to submit reply:", error);
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!review) return;

    if (confirm("Are you sure you want to delete this review?")) {
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Review deleted successfully");
        // In a real app, you would redirect to reviews list
        window.history.back();
      } catch (error) {
        console.error("Failed to delete review:", error);
      }
    }
  };

  const t = {
    en: {
      title: "View Review",
      back: "Back to Reviews",
      review_details: "Review Details",
      customer: "Customer",
      product: "Product",
      rating: "Rating",
      comment: "Comment",
      status: "Status",
      created_at: "Created At",
      images: "Images",
      replies: "Replies",
      reply_to_review: "Reply to review",
      write_reply: "Write your reply...",
      submit_reply: "Submit Reply",
      delete_review: "Delete",
      publish: "Publish",
      unpublished: "Unpublished",
      no_images: "No images",
      no_replies: "No replies yet",
      loading: "Loading...",
      delete_confirmation: "Are you sure you want to delete this review?",
    },
    ar: {
      title: "عرض التقييم",
      back: "العودة إلى التقييمات",
      review_details: "تفاصيل التقييم",
      customer: "العميل",
      product: "المنتج",
      rating: "التقييم",
      comment: "التعليق",
      status: "الحالة",
      created_at: "تاريخ الإنشاء",
      images: "الصور",
      replies: "الردود",
      reply_to_review: "الرد على التقييم",
      write_reply: "اكتب ردك...",
      submit_reply: "إرسال الرد",
      delete_review: "حذف",
      publish: "منشور",
      unpublished: "غير منشور",
      no_images: "لا توجد صور",
      no_replies: "لا توجد ردود بعد",
      loading: "جاري التحميل...",
      delete_confirmation: "هل أنت متأكد من حذف هذا التقييم؟",
    },
  }[language];

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <Loading />
      </div>
    );
  }

  if (!review) {
    return <NotFound />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{t.title}</h1>
            <p className="text-sm text-gray-600">
              {formatFullName(
                review.user.firstName,
                review.user.lastName,
                language,
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-6">
        {/* Left Column - Review Content */}
        <div className="space-y-6 xl:col-span-4">
          {/* Review Card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex-shrink-0">
                  <Image
                    src={review.user.avatar ?? "/images/placholder.png"}
                    alt={review.user.firstName}
                    width={60}
                    height={60}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="mb-2 flex flex-wrap items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {formatFullName(
                          review.user.firstName,
                          review.user.lastName,
                          language,
                        )}{" "}
                        ({review.user.email})
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        <span>{getTimeAgo(review.createdAt)}</span>
                        <span>•</span>
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="mb-4 text-gray-700">{review.comment}</p>

                  {/* Review Images */}
                  {review.images.length > 0 ? (
                    <div className="mb-4 flex gap-2">
                      {review.images.map((image: string, index: number) => (
                        <Image
                          key={index}
                          src={image}
                          alt={`Review image ${index + 1}`}
                          width={80}
                          height={80}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="mb-4 text-sm text-gray-500">{t.no_images}</p>
                  )}

                  {/* Product Info */}
                  <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
                    <Image
                      src={review.product.images[0]}
                      alt={review.product.title[language]}
                      width={50}
                      height={50}
                      className="h-16 w-16 rounded-md object-cover"
                    />
                    <div>
                      <h4 className="font-medium">
                        {review.product.title[language]}
                      </h4>
                      <p className="text-sm text-gray-600">
                        ${review.product.price}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDeleteReview}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t.delete_review}
                    </Button>
                    <Button variant="outline">
                      {review.status["en"] === "Published"
                        ? t.unpublished
                        : t.publish}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reply Section */}
          <Card>
            <CardHeader className="pb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <Reply className="h-5 w-5" />
                {t.reply_to_review}
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder={t.write_reply}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyText.trim() || isSubmittingReply}
                >
                  {isSubmittingReply ? t.loading : t.submit_reply}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Replies */}
          {review.replies?.length && review.replies.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <MessageSquare className="h-5 w-5" />
                  {t.replies} ({review.replies.length})
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                {review.replies.map((reply: Reply) => (
                  <div
                    key={reply.id}
                    className="flex gap-4 rounded-lg bg-gray-50 p-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                        <User className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">{reply.admin_name}</h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-gray-700">{reply.comment}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6 xl:col-span-2">
          {/* Review Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">{t.review_details}</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-gray-600">
                  {t.status}
                </label>
                <Badge className="mt-1">
                  {review.status["en"] === "Published"
                    ? t.publish
                    : t.unpublished}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  {t.created_at}
                </label>
                <p className="mt-1 text-xs">{formatDate(review.createdAt)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  {t.customer}
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-xs">
                    {formatFullName(
                      review.user.firstName,
                      review.user.lastName,
                      language,
                    )}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-xs">{review.user.email}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  {t.product}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  <Package className="h-4 w-4 text-gray-400" />
                  <span className="text-xs">
                    {review.product.title[language]}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  {t.rating}
                </label>
                <div className="mt-1 flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm">({review.rating}/5)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

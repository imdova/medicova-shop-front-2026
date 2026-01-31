"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Badge } from "@/components/Badge";
import { Phone, Store, CheckCircle, XCircle, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Loading from "@/app/loading";
import NotFound from "@/app/not-found";
import { dummyVendors } from "@/constants/vendors";
import { VendorType } from "@/types/customers";
import { dummyReviews } from "@/constants/reviews";

// Translation dictionary
const translations = {
  en: {
    title: "Vendor Details",
    back: "Back to Vendors",
    vendorInformation: "Vendor Information",
    emailVerified: "Email Verified",
    vendorVerified: "Vendor Verified",
    status: "Status",
    dateOfBirth: "Date of Birth",
    createdAt: "Created At",
    vendorVerifiedAt: "Vendor Verified At",
    totalOrders: "Total Orders",
    totalSpent: "Total Spent",
    editVendor: "Edit Vendor",
    addresses: "Addresses",
    storeProducts: "STORE PRODUCTS",
    withdrawals: "WITHDRAWALS",
    storeOrders: "STORE ORDERS",
    pendingWithdrawals: "PENDING WITHDRAWALS",
    totalRevenue: "TOTAL REVENUE",
    balance: "BALANCE",
    totalEarnings: "TOTAL EARNINGS",
    completedOrders: "COMPLETED ORDERS",
    recentReviews: "Recent Reviews",
    viewAll: "View All",
    active: "Active",
    inactive: "Inactive",
    verified: "Verified",
    unverified: "Unverified",
    contact: "Contact",
    revenue: "Revenue",
    products: "Products",
    orders: "Orders",
  },
  ar: {
    title: "تفاصيل البائع",
    back: "العودة إلى البائعين",
    vendorInformation: "معلومات البائع",
    emailVerified: "البريد الإلكتروني موثق",
    vendorVerified: "البائع موثق",
    status: "الحالة",
    dateOfBirth: "تاريخ الميلاد",
    createdAt: "تاريخ الإنشاء",
    vendorVerifiedAt: "تاريخ توثيق البائع",
    totalOrders: "إجمالي الطلبات",
    totalSpent: "إجمالي الإنفاق",
    editVendor: "تعديل البائع",
    addresses: "العناوين",
    storeProducts: "منتجات المتجر",
    withdrawals: "السحوبات",
    storeOrders: "طلبات المتجر",
    pendingWithdrawals: "السحوبات المعلقة",
    totalRevenue: "إجمالي الإيرادات",
    balance: "الرصيد",
    totalEarnings: "إجمالي الأرباح",
    completedOrders: "الطلبات المكتملة",
    recentReviews: "المراجعات الأخيرة",
    viewAll: "عرض الكل",
    active: "نشط",
    inactive: "غير نشط",
    verified: "موثق",
    unverified: "غير موثق",
    contact: "اتصال",
    revenue: "الإيرادات",
    products: "المنتجات",
    orders: "الطلبات",
  },
};

export default function ViewVendorPage() {
  const { language } = useLanguage();
  const params = useParams();
  const vendorSlug = params.slug as string;

  const [vendor, setVendor] = useState<VendorType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch vendor data when component mounts or slug changes
  useEffect(() => {
    const loadVendorData = async () => {
      if (!vendorSlug) return;

      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        const foundVendor = dummyVendors.find((v) => v.id === vendorSlug);
        setVendor(foundVendor ?? null);
      } catch (error) {
        console.error("Failed to load vendor data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVendorData();
  }, [vendorSlug]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "en" ? "en-US" : "ar-EG",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center p-6">
        <Loading />
      </div>
    );
  }

  if (!vendor) {
    return <NotFound />;
  }

  const t = translations[language];
  const isRTL = language === "ar";

  return (
    <div dir={isRTL ? "rtl" : "ltr"}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-10">
        {/* Left Column - Vendor Information */}
        <div className="space-y-6 sm:col-span-4 xl:col-span-3">
          {/* Vendor Information Card */}
          <Card>
            <CardHeader className="border-b">
              <h3 className="text-lg font-semibold">{t.vendorInformation}</h3>
            </CardHeader>
            <CardContent className="p-3">
              <div className="flex flex-col items-center gap-6">
                {/* Vendor Avatar and Basic Info */}
                <div className="flex-shrink-0">
                  <div className="relative h-24 w-24 overflow-hidden rounded-full">
                    <Image
                      src={vendor.avatar}
                      alt={vendor.name}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/avatars/default-vendor.jpg";
                      }}
                    />
                  </div>
                </div>

                {/* Vendor Details */}
                <div className="w-full flex-1 space-y-4">
                  <div className="flex flex-1 flex-col items-center gap-3">
                    <h2 className="text-xl font-bold">{vendor.name}</h2>
                    <div className="mt-2 flex flex-col items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {vendor.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {vendor.storePhone}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Store className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-primary">
                          {vendor.storeName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="grid grid-cols-1 justify-center gap-4 md:grid-cols-2">
                    <div
                      className={`flex items-center justify-center gap-2 rounded-md px-2 py-1 text-white ${vendor.verified ? "bg-primary" : "bg-destructive"}`}
                    >
                      {vendor.verified ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span className="text-xs">{t.vendorVerified}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 rounded-md bg-primary px-2 py-1 text-white">
                      <CheckCircle className="h-3 w-3" />
                      <span className="text-xs">{t.emailVerified}</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 gap-2 border-t pt-4">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-gray-600">
                        {t.status}
                      </label>
                      <Badge
                        className={`mt-1 text-white ${vendor.status === "active" ? "bg-primary" : "bg-destructive"}`}
                      >
                        {vendor.status === "active" ? t.active : t.inactive}
                      </Badge>
                    </div>
                    {vendor.dateOfBirth && (
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-gray-800">
                          {t.dateOfBirth}
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(vendor.dateOfBirth)}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-gray-800">
                        {t.createdAt}
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(vendor.joinDate)}
                      </p>
                    </div>
                    {vendor.vendorVerifiedAt && (
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-gray-800">
                          {t.vendorVerifiedAt}
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatDate(vendor.vendorVerifiedAt)}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium text-gray-800">
                        {t.totalOrders}
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        {vendor.totalOrders}
                      </p>
                    </div>
                    {vendor.totalSpent && (
                      <div className="flex items-center justify-between gap-2">
                        <label className="text-sm font-medium text-gray-800">
                          {t.totalSpent}
                        </label>
                        <p className="mt-1 text-sm text-gray-500">
                          {formatCurrency(vendor.totalSpent)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Edit vendor button */}
                  <div className="border-t pt-4">
                    <Button className="w-full font-semibold">
                      {t.editVendor}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{t.addresses}</h3>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 p-3">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                <div className="flex-1 text-sm">
                  <p className="text-gray-600">
                    {vendor.country} {vendor.address} {vendor.city},{" "}
                    {vendor.state} {vendor.zipCode}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {vendor.storePhone}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats and Actions */}
        <div className="space-y-6 sm:col-span-6 xl:col-span-7">
          {/* Stats Cards */}
          <div className="space-y-2">
            <div className="grid gap-3 lg:grid-cols-3 xl:grid-cols-4">
              {/* Store Products */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.storeProducts}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {vendor.products}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Withdrawals */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.withdrawals}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(vendor.pendingWithdrawals)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Store Orders */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.storeOrders}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {vendor.totalOrders}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pending Withdrawals */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.pendingWithdrawals}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(vendor.pendingWithdrawals)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Revenue */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.totalRevenue}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(vendor.totalRevenue)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Balance */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.balance}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(vendor.balance)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Earnings */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.totalEarnings}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {formatCurrency(vendor.totalEarnings)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Completed Orders */}
              <Card className="py-0">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {t.completedOrders}
                      </p>
                      <p className="text-lg font-bold text-gray-800">
                        {vendor.completedOrders}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Recent Products Card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  {t.recentReviews} ({dummyReviews.length})
                </h3>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {dummyReviews.map((review) => (
                  <div
                    key={review.id}
                    className="flex flex-col gap-4 border-b pb-4 last:border-b-0 md:flex-row md:items-center"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-md">
                      <Image
                        src={review.product.images[0]}
                        alt={review.product.title[language]}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {review.product.title[language]}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">
                            {review.rating.toFixed(2)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({review.rating}/5)
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{review.comment}</p>
                    </div>
                    <p className="text-right text-xs text-secondary">
                      1 month ago
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

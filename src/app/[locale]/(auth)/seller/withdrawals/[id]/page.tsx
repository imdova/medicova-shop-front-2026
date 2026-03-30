"use client";

import React, { useState, useEffect, use } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { getWithdrawalDetails, SellerWithdrawal } from "@/services/financeService";
import { 
  Loader2, 
  ArrowLeft, 
  WalletCards, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  UserRound, 
  CalendarDays,
  Receipt
} from "lucide-react";
import { Link } from "@/i18n/navigation";

export default function WithdrawalDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { id } = use(params);
  const router = useRouter();

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [withdrawal, setWithdrawal] = useState<SellerWithdrawal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      if (!token) return;
      setLoading(true);
      const res = await getWithdrawalDetails(token, id as string);
      setWithdrawal(res as SellerWithdrawal);
      setLoading(false);
    }
    fetchDetails();
  }, [token, id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const statusMap = {
    pending: { label: isArabic ? "قيد الانتظار" : "Pending", color: "text-amber-700 bg-amber-50 ring-amber-200", icon: Clock },
    approved: { label: isArabic ? "مقبول" : "Approved", color: "text-emerald-700 bg-emerald-50 ring-emerald-200", icon: CheckCircle2 },
    rejected: { label: isArabic ? "مرفوض" : "Rejected", color: "text-rose-700 bg-rose-50 ring-rose-200", icon: XCircle }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!withdrawal) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-4">
        <div className="rounded-full bg-slate-100 p-4 shrink-0">
          <WalletCards className="h-8 w-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          {isArabic ? "لم يتم العثور على السحب" : "Withdrawal not found"}
        </h2>
        <Link 
          href="/seller/withdrawals" 
          className="text-sm font-semibold text-emerald-600 hover:underline"
        >
          {isArabic ? "العودة للسحوبات" : "Back to Withdrawals"}
        </Link>
      </div>
    );
  }

  const s = statusMap[withdrawal.status || "pending"];
  const StatusIcon = s.icon;

  return (
    <div className="animate-in fade-in space-y-8 duration-700 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
        <button 
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className={`h-5 w-5 ${isArabic ? 'rotate-180' : ''}`} />
        </button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900">
              {isArabic ? "تفاصيل السحب" : "Withdrawal Details"}
            </h1>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-black ring-1 ring-inset ${s.color}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {s.label}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-slate-500 font-mono">
            #{withdrawal._id}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Info */}
        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            {isArabic ? "المعلومات الأساسية" : "Primary Info"}
          </h2>
          
          <div className="space-y-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {isArabic ? "المبلغ" : "Amount"}
              </p>
              <p className="mt-1 text-4xl font-black text-emerald-600">
                {formatCurrency(withdrawal.amount)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-slate-50/50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <Building2 className="h-4 w-4" />
                  {isArabic ? "وسيلة الدفع" : "Method"}
                </div>
                <p className="font-semibold text-slate-900 capitalize">
                  {withdrawal.method?.replace("_", " ")}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50/50 border border-slate-100 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
                  <CalendarDays className="h-4 w-4" />
                  {isArabic ? "تاريخ الطلب" : "Request Date"}
                </div>
                <p className="font-semibold text-slate-900">
                  {new Date(withdrawal.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <UserRound className="h-4 w-4" />
            {isArabic ? "معلومات الحساب" : "Account Info"}
          </h2>
          
          <div className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase">
                {isArabic ? "تفاصيل الدفع المقدمة" : "Provided Details"}
              </p>
              <div className="text-sm font-medium text-slate-700 whitespace-pre-wrap break-all bg-white p-3 rounded-xl border border-slate-200">
                {withdrawal.details?.accountInfo || withdrawal.details || (isArabic ? "لا توجد تفاصيل" : "No details provided.")}
              </div>
            </div>
            
            {(withdrawal.status === "rejected" && withdrawal.details?.reason) && (
              <div className="rounded-2xl bg-rose-50 p-4 border border-rose-100">
                <p className="text-xs font-bold text-rose-700 mb-2 flex items-center gap-1.5 uppercase">
                  <XCircle className="h-4 w-4" />
                  {isArabic ? "سبب الرفض" : "Rejection Reason"}
                </p>
                <p className="text-sm font-semibold text-rose-800">
                  {withdrawal.details.reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

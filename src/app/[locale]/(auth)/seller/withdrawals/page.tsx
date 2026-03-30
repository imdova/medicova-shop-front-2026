"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { useSession } from "next-auth/react";
import { getSellerWithdrawals, SellerWithdrawal } from "@/services/financeService";
import { 
  Loader2, 
  WalletCards, 
  Plus, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight 
} from "lucide-react";
import RequestWithdrawalModal from "./components/RequestWithdrawalModal";
import { Link } from "@/i18n/navigation";

export default function SellerWithdrawalsPage() {
  const t = useTranslations("admin"); // Can update if using 'seller' namespace
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [withdrawals, setWithdrawals] = useState<SellerWithdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const fetchWithdrawals = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await getSellerWithdrawals(token, {
        page,
        limit,
        status: status === "all" ? "" : status
      });
      setWithdrawals(res.withdrawals);
      setTotal(res.total);
    } catch (err) {
      console.error("Failed to fetch seller withdrawals:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [token, page, status]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD"
    }).format(amount);
  };

  const statusMap = {
    pending: { label: isArabic ? "قيد الانتظار" : "Pending", color: "text-amber-700 bg-amber-50 ring-amber-100", icon: Clock },
    approved: { label: isArabic ? "مقبول" : "Approved", color: "text-emerald-700 bg-emerald-50 ring-emerald-100", icon: CheckCircle2 },
    rejected: { label: isArabic ? "مرفوض" : "Rejected", color: "text-rose-700 bg-rose-50 ring-rose-100", icon: XCircle }
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <WalletCards className="text-emerald-600" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {isArabic ? "سحوباتي" : "My Withdrawals"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {isArabic ? "إدارة طلبات السحب والحصول على أرباحك" : "Manage your payout requests and track earnings"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
        >
          <Plus className="h-4 w-4" />
          {isArabic ? "طلب سحب جديد" : "Request Payout"}
        </button>
      </div>

      {/* Content */}
      <div className="rounded-3xl border border-slate-200/60 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black uppercase tracking-wider text-slate-900">
              {isArabic ? "سجل السحوبات" : "Withdrawal History"}
            </span>
            <span className="flex h-6 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-600">
              {total}
            </span>
          </div>
          
          <select
            value={status}
            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            className="rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-3 pr-8 text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="all">{isArabic ? "الكل" : "All"}</option>
            <option value="pending">{isArabic ? "قيد الانتظار" : "Pending"}</option>
            <option value="approved">{isArabic ? "مقبول" : "Approved"}</option>
            <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">{isArabic ? "المبلغ" : "Amount"}</th>
                <th className="px-6 py-4">{isArabic ? "وسيلة الدفع" : "Method"}</th>
                <th className="px-6 py-4">{isArabic ? "التاريخ" : "Date"}</th>
                <th className="px-6 py-4">{isArabic ? "الحالة" : "Status"}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                  </td>
                </tr>
              ) : !Array.isArray(withdrawals) || withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400 font-medium">
                    {isArabic ? "لا توجد طلبات سحب" : "No withdrawal requests found"}
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const s = statusMap[w.status || "pending"];
                  const Icon = s.icon;
                  return (
                    <tr key={w._id} className="hover:bg-slate-50/50 transition relative group">
                      <td className="px-6 py-5 font-black text-slate-900 text-lg">
                        {formatCurrency(w.amount)}
                      </td>
                      <td className="px-6 py-5 capitalize font-bold text-slate-600">
                        {w.method?.replace("_", " ")}
                      </td>
                      <td className="px-6 py-5 text-slate-500 font-medium">
                        {new Date(w.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        })}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ring-1 ring-inset ${s.color}`}>
                          <Icon className="h-3 w-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <Link 
                          href={`/seller/withdrawals/${w._id}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-emerald-50 hover:ring-emerald-200"
                        >
                          <ArrowRight className={`h-4 w-4 ${isArabic ? 'rotate-180' : ''}`} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/30 px-6 py-4">
            <p className="text-xs font-bold text-slate-500">
              {isArabic ? "صفحة" : "Page"} {page} {isArabic ? "من" : "of"} {totalPages}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black shadow-sm disabled:opacity-50"
              >
                {isArabic ? "السابق" : "Previous"}
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-black shadow-sm disabled:opacity-50"
              >
                {isArabic ? "التالي" : "Next"}
              </button>
            </div>
          </div>
        )}
      </div>

      <RequestWithdrawalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {
          setPage(1);
          fetchWithdrawals();
        }} 
      />
    </div>
  );
}

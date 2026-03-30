"use client";

import React, { useState, useEffect } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { 
  getAdminWithdrawals, 
  getAdminWithdrawalStats, 
  AdminWithdrawal, 
  AdminWithdrawalStats 
} from "@/services/financeService";
import { useSession } from "next-auth/react";
import { 
  Loader2, 
  Search, 
  ChevronDown, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowDownToLine 
} from "lucide-react";

export default function WithdrawalsPanel() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [withdrawals, setWithdrawals] = useState<AdminWithdrawal[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<AdminWithdrawalStats | null>(null);
  
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const limit = 20;
  const totalPages = Math.ceil(total / limit) || 1;

  useEffect(() => {
    async function fetchStats() {
      if (!token) return;
      const res = await getAdminWithdrawalStats(token);
      setStats(res);
    }
    fetchStats();
  }, [token]);

  useEffect(() => {
    async function fetchData() {
      if (!token) return;
      setLoading(true);
      try {
        const res = await getAdminWithdrawals(token, {
          page,
          limit,
          status: status === "all" ? "" : status,
          search: q
        });
        setWithdrawals(res.withdrawals);
        setTotal(res.total);
      } catch (err) {
        console.error("fetch withdrawals failed:", err);
      } finally {
        setLoading(false);
      }
    }
    const timer = setTimeout(fetchData, q ? 500 : 0);
    return () => clearTimeout(timer);
  }, [token, page, status, q]);

  const formatCurrency = (amt: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(amt);
  };

  const statusMap = {
    pending: {
      label: isArabic ? "قيد الانتظار" : "Pending",
      color: "text-amber-700 bg-amber-50 ring-amber-100",
      icon: Clock
    },
    approved: {
      label: isArabic ? "مقبول" : "Approved",
      color: "text-emerald-700 bg-emerald-50 ring-emerald-100",
      icon: CheckCircle2
    },
    rejected: {
      label: isArabic ? "مرفوض" : "Rejected",
      color: "text-rose-700 bg-rose-50 ring-rose-100",
      icon: XCircle
    }
  };

  return (
    <div className="animate-in fade-in space-y-6 duration-700">
      {/* Mini Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: isArabic ? "إجمالي المسحوبات" : "Total Requested", value: stats?.totalRequested || 0, color: "text-slate-900" },
          { label: isArabic ? "مقبول" : "Approved", value: stats?.totalApproved || 0, color: "text-emerald-600" },
          { label: isArabic ? "قيد الانتظار" : "Pending", value: stats?.totalPending || 0, color: "text-amber-600" },
          { label: isArabic ? "مرفوض" : "Rejected", value: stats?.totalRejected || 0, color: "text-rose-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{s.label}</p>
            <p className={`mt-2 text-2xl font-black ${s.color}`}>{s.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input 
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
              placeholder={isArabic ? "بحث باسم البائع..." : "Search by seller..."}
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-sm font-medium focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
          
          <div className="relative">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="h-10 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-bold text-slate-700 focus:border-emerald-500 focus:outline-none"
            >
              <option value="all">{isArabic ? "كل الحالات" : "All Status"}</option>
              <option value="pending">{isArabic ? "قيد الانتظار" : "Pending"}</option>
              <option value="approved">{isArabic ? "مقبول" : "Approved"}</option>
              <option value="rejected">{isArabic ? "مرفوض" : "Rejected"}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-slate-200/60 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-black uppercase tracking-widest text-slate-500">
                <th className="px-6 py-4">{isArabic ? "البائع" : "Seller"}</th>
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
                  <td colSpan={6} className="py-20 text-center text-slate-400">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-emerald-600" />
                  </td>
                </tr>
              ) : !Array.isArray(withdrawals) || withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-slate-400 font-medium">
                    {isArabic ? "لا توجد طلبات سحب" : "No withdrawal requests found"}
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const s = statusMap[w.status || "pending"];
                  const Icon = s.icon;
                  return (
                    <tr key={w._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{w.sellerId?.brandName || "Unknown Seller"}</div>
                        <div className="text-[10px] text-slate-400">{w.sellerId?._id}</div>
                      </td>
                      <td className="px-6 py-4 font-black text-slate-900">{formatCurrency(w.amount)}</td>
                      <td className="px-6 py-4 capitalize font-semibold text-slate-600">{w.method?.replace("_", " ")}</td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        {new Date(w.createdAt).toLocaleDateString(isArabic ? "ar-EG" : "en-US", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-black ring-1 ring-inset ${s.color}`}>
                          <Icon className="h-3 w-3" />
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition">
                          <ArrowDownToLine className="h-4 w-4" />
                        </button>
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
    </div>
  );
}

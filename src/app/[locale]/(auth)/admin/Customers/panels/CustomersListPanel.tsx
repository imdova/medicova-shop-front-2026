"use client";

import { LanguageType } from "@/util/translations";
import Avatar from "@/components/shared/Avatar";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Eye, Filter, Pencil, Search, Users, X, ShoppingBag, DollarSign, Package, Calendar, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getAllUsers, deleteUser } from "@/services/userService";
import { getOrders, ApiOrder } from "@/services/orderService";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

interface UserRelationOrder {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

interface UserRelationProduct {
  id: string;
  nameEn: string;
  nameAr: string;
  sku: string;
  sellerId: string;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  profileImage: string | null;
  role: string;
  active: boolean;
  createdAt: string;
  totalOrders: number;
  totalSpend: number;
  totalProducts: number;
  relations: {
    orders: UserRelationOrder[];
    products: UserRelationProduct[];
  };
}

function formatCurrency(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc, {
    style: "currency",
    currency: "EGP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number, locale: string) {
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.NumberFormat(loc).format(value);
}

export default function CustomersListPanel({ locale }: { locale: LanguageType }) {
  const isAr = locale === "ar";
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const statusFilter = searchParams.get("status") || "all";
  const page = Number(searchParams.get("page") || "1") || 1;
  const [q, setQ] = useState(searchParams.get("q") || "");

  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        // Fetch both users and orders in parallel
        const [usersData, ordersData] = await Promise.all([
          getAllUsers(token),
          getOrders(token),
        ]);

        if (usersData && usersData.users) {
          setUsers(usersData.users);
        }
        if (ordersData) {
          setOrders(ordersData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const counts = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        acc.total += 1;
        if (u.active) acc.active += 1;
        else acc.inactive += 1;
        return acc;
      },
      { total: 0, active: 0, inactive: 0 },
    );
  }, [users]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users.filter((u) => {
      if (statusFilter === "active" && !u.active) return false;
      if (statusFilter === "inactive" && u.active) return false;
      if (!query) return true;
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      return (
        name.includes(query) ||
        (u.email && u.email.toLowerCase().includes(query)) ||
        (u.phone && u.phone.includes(query))
      );
    });
  }, [users, q, statusFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * itemsPerPage;
  const pageRows = filtered.slice(startIndex, startIndex + itemsPerPage);

  const setParam = (key: string, value?: string) => {
    const p = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") p.delete(key);
    else p.set(key, value);
    router.replace(`${pathname}?${p.toString()}`, { scroll: false });
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy", { locale: isAr ? ar : enUS });
    } catch (e) {
      return dateStr;
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(isAr ? `هل أنت متأكد من حذف ${name}؟` : `Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      toast.success(isAr ? "تم حذف المستخدم بنجاح" : "User deleted successfully");
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (error: any) {
      console.error("Failed to delete user:", error);
      toast.error(error.message || (isAr ? "فشل في حذف المستخدم" : "Failed to delete user"));
    }
  };

  return (
    <div className="relative space-y-5">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          {
            title: isAr ? "إجمالي العملاء" : "Total Customers",
            value: formatNumber(counts.total, locale),
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: isAr ? "عملاء نشطون" : "Active Customers",
            value: formatNumber(counts.active, locale),
            icon: Users,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            title: isAr ? "إجمالي الطلبات" : "Total Orders",
            value: formatNumber(
              orders.filter((o) => o.paymentStatus === "paid" || o.paymentMethod === "cash_on_delivery" || o.paymentMethod === "cod").length,
              locale
            ),
            icon: ShoppingBag,
            color: "text-amber-600",
            bg: "bg-amber-50",
          },
        ].map((c, i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {c.title}
                </p>
                <h3 className="mt-1 text-2xl font-black text-slate-900">
                  {c.value}
                </h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${c.bg} ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + status tabs */}
      <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={isAr ? "ابحث بالاسم، البريد أو الهاتف..." : "Search by name, email or phone..."}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/40 pl-10 pr-4 text-sm font-semibold text-slate-800 outline-none ring-emerald-100 focus:bg-white focus:ring-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-2xl bg-slate-50 p-1 ring-1 ring-slate-200">
              {[
                { id: "all", label: isAr ? "الكل" : "All" },
                { id: "active", label: isAr ? "نشط" : "Active" },
                { id: "inactive", label: isAr ? "غير نشط" : "Inactive" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setParam("status", t.id)}
                  className={[
                    "inline-flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-extrabold transition",
                    statusFilter === t.id
                      ? "bg-[#2F6B3A] text-white shadow-sm"
                      : "text-slate-500 hover:bg-white hover:text-slate-700",
                  ].join(" ")}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="bg-slate-50/60 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                <th className="px-5 py-4">{isAr ? "العميل" : "Customer"}</th>
                <th className="px-5 py-4">{isAr ? "التواصل" : "Contact"}</th>
                <th className="px-5 py-4">{isAr ? "الدور" : "Role"}</th>
                <th className="px-5 py-4">{isAr ? "الطلبات / الإنفاق" : "Orders / Spend"}</th>
                <th className="px-5 py-4">{isAr ? "الحالة" : "Status"}</th>
                <th className="px-5 py-4">{isAr ? "تاريخ الانضمام" : "Joined"}</th>
                <th className="px-5 py-4">{isAr ? "إجراءات" : "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-5 py-4">
                      <div className="h-12 w-full rounded-xl bg-slate-50" />
                    </td>
                  </tr>
                ))
              ) : pageRows.length > 0 ? (
                pageRows.map((u) => (
                  <tr
                    key={u._id}
                    onClick={() => router.push(`/admin/Customers/${u._id}`)}
                    className="group cursor-pointer transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          className="h-10 w-10 rounded-2xl border-2 border-white shadow-sm ring-1 ring-slate-100"
                          imageUrl={u.profileImage || undefined}
                          name={u.fullName || `${u.firstName} ${u.lastName}`}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-black text-slate-900 group-hover:text-[#2F6B3A]">
                            {u.fullName || `${u.firstName} ${u.lastName}`}
                          </p>
                          <p className="text-[11px] font-medium text-slate-400">
                            ID: {u._id.slice(-8).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col text-xs font-semibold text-slate-600">
                        <span>{u.email || "-"}</span>
                        <span className="text-slate-400">{u.phone || "-"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-600">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-col">
                        {(() => {
                          const userOrders = orders.filter(o => 
                            (o.user?.id === u._id || (o as any).customerId === u._id) &&
                            (o.paymentStatus === 'paid' || 
                             o.paymentMethod === 'cash_on_delivery' || 
                             o.paymentMethod === 'cod')
                          );
                          const totalOrdersCount = userOrders.length;
                          const totalOrdersSpend = userOrders.reduce((sum, o) => sum + (o.total || (o as any).totalPrice || 0), 0);
                          
                          return (
                            <>
                              <span className="text-sm font-bold text-slate-900">
                                {formatNumber(totalOrdersCount, locale)} {isAr ? "طلبات" : "Orders"}
                              </span>
                              <span className="text-xs font-medium text-[#2F6B3A]">
                                {formatCurrency(totalOrdersSpend, locale)}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ${
                          u.active
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-slate-50 text-slate-500 ring-1 ring-slate-200"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${u.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        {u.active ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-500">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => router.push(`/admin/Customers/${u._id}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u._id, u.fullName || `${u.firstName} ${u.lastName}`)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-400 transition hover:bg-rose-100 hover:text-rose-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <Users size={48} className="opacity-20" />
                      <p className="text-sm font-bold">{isAr ? "لا يوجد عملاء مطابقين" : "No matching customers found"}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-white px-5 py-4">
          <p className="text-xs font-bold text-slate-400">
            {isAr
              ? `عرض ${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, filtered.length)} من ${filtered.length}`
              : `Showing ${startIndex + 1} - ${Math.min(startIndex + itemsPerPage, filtered.length)} of ${filtered.length}`}
          </p>
          <div className="flex gap-2">
            <button
              disabled={safePage === 1}
              onClick={() => setParam("page", (safePage - 1).toString())}
              className="flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isAr ? "السابق" : "Prev"}
            </button>
            <button
              disabled={safePage === totalPages}
              onClick={() => setParam("page", (safePage + 1).toString())}
              className="flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isAr ? "التالي" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2F6B3A] border-t-transparent" />
        </div>
      )}
    </div>
  );
}

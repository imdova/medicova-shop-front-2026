"use client";

import { use, useEffect, useState, useMemo } from "react";
import { 
  Calendar, 
  DollarSign, 
  Mail, 
  Package, 
  Phone, 
  ShieldCheck, 
  ShoppingBag,
  ArrowLeft,
  Trash2,
  Copy,
  Clock,
  User as UserIcon,
  BadgeCheck
} from "lucide-react";

import Avatar from "@/components/shared/Avatar";
import { Link, useRouter } from "@/i18n/navigation";
import { useAppLocale } from "@/hooks/useAppLocale";
import { getUserById, deleteUser } from "@/services/userService";
import { getOrders, ApiOrder } from "@/services/orderService";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import { toast } from "react-hot-toast";

export default function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const locale = useAppLocale();
  const isAr = locale === "ar";
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const [userData, ordersData] = await Promise.all([
          getUserById(slug, token),
          getOrders(token),
        ]);
        
        setUser(userData);
        if (ordersData) {
          // Filter orders for this specific user and apply Paid/COD logic
          const filtered = ordersData.filter(o => 
            (o.user?.id === slug || (o as any).customerId === slug) &&
            (o.paymentStatus === 'paid' || 
             o.paymentMethod === 'cash_on_delivery' || 
             o.paymentMethod === 'cod')
          );
          setOrders(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch customer data:", error);
        toast.error(isAr ? "فشل في تحميل بيانات العميل" : "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, token, isAr]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatNum = (value: number) => {
    return new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en-US").format(value);
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM dd, yyyy", { locale: isAr ? ar : enUS });
    } catch (e) {
      return dateStr;
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    if (!confirm(isAr ? `هل أنت متأكد من حذف هذا العميل؟` : `Are you sure you want to delete this customer?`)) {
      return;
    }

    try {
      await deleteUser(user._id, token);
      toast.success(isAr ? "تم حذف العميل بنجاح" : "Customer deleted successfully");
      router.push("/admin/Customers");
    } catch (error: any) {
      console.error("Failed to delete customer:", error);
      toast.error(error.message || (isAr ? "فشل في حذف العميل" : "Failed to delete customer"));
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F3F6F4]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2F6B3A] border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F3F6F4] p-4 text-center">
        <UserIcon size={64} className="mb-4 text-slate-300" />
        <h2 className="text-2xl font-black text-slate-900">{isAr ? "العميل غير موجود" : "Customer Not Found"}</h2>
        <Link href="/admin/Customers" className="mt-4 text-sm font-bold text-[#2F6B3A] hover:underline">
          {isAr ? "العودة لقائمة العملاء" : "Back to customers list"}
        </Link>
      </div>
    );
  }

  const totalSpend = orders.reduce((sum, o) => sum + (o.total || (o as any).totalPrice || 0), 0);

  return (
    <div className="animate-in fade-in min-h-screen bg-[#F3F6F4] p-4 duration-700 md:p-8">
      <div className="mx-auto max-w-[1440px] space-y-6">
        {/* Navigation & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin/Customers"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <ArrowLeft size={20} className={isAr ? "rotate-180" : ""} />
            </Link>
            <div className="text-xs font-semibold text-slate-500">
              <Link href="/admin/Customers" className="hover:underline">
                {isAr ? "العملاء" : "Customers"}
              </Link>{" "}
              <span className="mx-1">›</span>
              <span className="text-slate-700">{user.fullName || `${user.firstName} ${user.lastName}`}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleDelete}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-100 bg-white px-4 text-xs font-extrabold text-rose-600 shadow-sm transition hover:bg-rose-50"
            >
              <Trash2 size={16} />
              {isAr ? "حذف العميل" : "Delete Customer"}
            </button>
          </div>
        </div>

        {/* Profile Header */}
        <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col items-center gap-6 text-center md:flex-row md:text-left lg:text-right">
              <div className="relative">
                <Avatar
                  className="h-24 w-24 rounded-3xl border-4 border-white shadow-xl ring-1 ring-slate-100"
                  imageUrl={user.profileImage}
                  name={user.fullName || `${user.firstName} ${user.lastName}`}
                />
                <span className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-4 border-white shadow-sm ${user.active ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              </div>
              <div>
                <div className="flex flex-col items-center gap-2 md:flex-row md:gap-3">
                  <h1 className="text-2xl font-black text-slate-900 md:text-3xl">
                    {user.fullName || `${user.firstName} ${user.lastName}`}
                  </h1>
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${user.active ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100'}`}>
                    {user.active ? (isAr ? "نشط" : "Active") : (isAr ? "غير نشط" : "Inactive")}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm font-bold text-slate-500 md:justify-start">
                  <span className="flex items-center gap-1.5">
                    <Mail size={16} className="text-slate-400" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone size={16} className="text-slate-400" />
                    {user.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BadgeCheck size={16} className="text-emerald-500" />
                    {isAr ? user.role === 'user' ? 'عميل' : user.role : user.role === 'user' ? 'Customer' : user.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 lg:border-none lg:pt-0">
              <div className="rounded-2xl bg-[#F0F7F1] p-5 text-center transition-transform hover:scale-[1.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#2F6B3A] opacity-60">
                  {isAr ? "إجمالي الطلبات" : "Total Orders"}
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <ShoppingBag size={20} className="text-[#2F6B3A]" />
                  <p className="text-3xl font-black text-[#2F6B3A]">{orders.length}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-[#FFF9F2] p-5 text-center transition-transform hover:scale-[1.02]">
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 opacity-60">
                  {isAr ? "إجمالي الإنفاق" : "Total Spend"}
                </p>
                <div className="mt-2 flex items-center justify-center gap-1">
                  <DollarSign size={20} className="text-amber-600" />
                  <p className="text-2xl font-black text-amber-600 truncate">{formatCurrency(totalSpend)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Info */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm shadow-slate-200/50">
              <h3 className="mb-6 flex items-center gap-2 text-sm font-black text-slate-900">
                <ShieldCheck size={18} className="text-[#2F6B3A]" />
                {isAr ? "معلومات الحساب" : "Account Info"}
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isAr ? "معرف المستخدم" : "User ID"}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-900">{user._id}</span>
                    <button className="text-slate-400 transition hover:text-[#2F6B3A]"><Copy size={14} /></button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isAr ? "تاريخ الانضمام" : "Joined Date"}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Calendar size={16} className="text-slate-400" />
                    {formatDate(user.createdAt)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isAr ? "آخر تحديث" : "Last Updated"}</p>
                  <div className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-900">
                    <Clock size={16} className="text-slate-400" />
                    {formatDate(user.updatedAt)}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isAr ? "اللغة المفضلة" : "Language"}</p>
                  <div className="mt-1 text-sm font-bold text-slate-900 uppercase">
                    {user.language || 'ar'}
                  </div>
                </div>
              </div>
            </div>


          </div>

          {/* Right: Orders History */}
          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-black text-slate-900">
                    <Package size={20} className="text-slate-400" />
                    {isAr ? "سجل الطلبات" : "Order History"}
                  </h3>
                  <p className="mt-1 text-xs font-bold text-slate-400">
                    {isAr ? `عرض الطلبات المدفوعة و COD فقط (${orders.length})` : `Viewing Paid & COD orders only (${orders.length})`}
                  </p>
                </div>
              </div>

              {orders.length > 0 ? (
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-right md:text-left">
                    <thead>
                      <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th className="px-6 py-4">{isAr ? "الطلب" : "Order"}</th>
                        <th className="px-6 py-4 text-left">{isAr ? "المبلغ" : "Amount"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <tr 
                          key={order._id} 
                          onClick={() => router.push(`/admin/orders/${order.orderId}`)}
                          className="group hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="px-6 py-4">
                            <p className="text-sm font-black text-slate-900 group-hover:text-[#2F6B3A] transition-colors">{order.orderNumber || order.orderId}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{order.paymentMethod}</span>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <span className="text-sm font-black text-[#2F6B3A]">{formatCurrency(order.total || (order as any).totalPrice || 0)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-100 py-16 text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-50 text-slate-200">
                    <ShoppingBag size={40} />
                  </div>
                  <h4 className="text-base font-black text-slate-900">{isAr ? "لا توجد طلبات مدفوعة" : "No Paid Orders Yet"}</h4>
                  <p className="mt-1 text-xs font-bold text-slate-400 max-w-[200px]">
                    {isAr ? "هذا العميل لم يكمل أي طلبات مدفوعة أو بنظام الدفع عند الاستلام بعد." : "This customer hasn't completed any paid or COD orders yet."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";
import {
  CheckCircle2,
  ChevronRight,
  Clipboard,
  Search,
  ShieldCheck,
  ExternalLink,
  RotateCcw,
  Send,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { getCustomers, ApiCustomer } from "@/services/customerService";
import { getOrders, ApiOrder, requestReturn, getOrderById } from "@/services/orderService";
import { useSession } from "next-auth/react";
import { NextAuthProvider } from "@/NextAuthProvider";

function formatDateLabel(dateStr: string, locale: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  const loc = locale === "ar" ? "ar-EG" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}

export default function CreateReturnRequestPage() {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  // Step 1: User & Order lookup
  const [users, setUsers] = useState<ApiCustomer[]>([]);
  const [selectedUser, setSelectedUser] = useState<ApiCustomer | null>(null);
  const [userOrders, setUserOrders] = useState<ApiOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null);
  
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [customerSearch, setCustomerSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Return Details (simplified)
  const [primaryReason, setPrimaryReason] = useState("damaged");
  const [notes, setNotes] = useState("");

  // Fetch all customers on mount
  useEffect(() => {
    if (!token) return;
    async function fetchAllUsers() {
      setLoadingUsers(true);
      const data = await getCustomers(token);
      setUsers(data);
      setLoadingUsers(false);
    }
    fetchAllUsers();
  }, [token]);

  // Fetch orders when user is selected
  useEffect(() => {
    if (!token || !selectedUser) {
      setUserOrders([]);
      return;
    }
    async function fetchUserOrders() {
      setLoadingOrders(true);
      const allOrders = await getOrders(token);
      const filtered = allOrders.filter(o => {
        if (!selectedUser) return false;
        const isThisUser = o.user?.id === selectedUser._id || (o as any).userId === selectedUser._id;
        const method = String(o.paymentMethod || "").toLowerCase();
        const status = String(o.paymentStatus || "").toLowerCase();
        const isPaidOrCod = status === "paid" || method === "cash_on_delivery" || method === "cod";
        return isThisUser && isPaidOrCod;
      });
      setUserOrders(filtered);
      setLoadingOrders(false);
    }
    fetchUserOrders();
  }, [token, selectedUser]);

  const handleReset = () => {
    setSelectedUser(null);
    setSelectedOrder(null);
    setNotes("");
    setCustomerSearch("");
    setUserOrders([]);
  };

  const handleUnselectOrder = () => {
    setSelectedOrder(null);
  };

  const handleReturnSubmission = async () => {
    if (!token || !selectedOrder) return;
    try {
      setSubmitting(true);
      
      // Fetch full order to get products if missing in list view
      const fullOrder = await getOrderById(selectedOrder._id, token);
      const items = (fullOrder as any)?.items || (fullOrder as any)?.units || 
                   (selectedOrder as any)?.items || (selectedOrder as any)?.units || [];
      
      if (items.length === 0) {
        throw new Error(isArabic ? "لا توجد منتجات في هذا الطلب" : "No items found in this order");
      }

      const promises = items.map((item: any) => 
        requestReturn({
          orderId: selectedOrder._id,
          productId: item.productId || item.sku || item.id || item._id,
          description: `Full Order Return (${primaryReason}): ${notes}`.trim()
        }, token)
      );

      await Promise.all(promises);
      toast.success(isArabic ? "تم إرسال طلب المرتجع بنجاح!" : "Return request submitted successfully!");
      handleReset();
    } catch (err: any) {
      toast.error(err.message || (isArabic ? "فشل إرسال الطلب" : "Failed to submit request"));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!customerSearch) return users;
    return users.filter(u => 
      u.firstName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(customerSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(customerSearch.toLowerCase())
    );
  }, [users, customerSearch]);

  const getBrandedId = (id: string) => {
    if (!id) return "";
    return `#HM-${id.slice(-6).toUpperCase()}`;
  };

  return (
    <NextAuthProvider session={session}>
      <div
        className="animate-in fade-in min-h-screen bg-[#F8FAFC] p-4 duration-700 md:p-8"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="mx-auto max-w-[1200px]">
          {/* Breadcrumbs */}
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Link href="/admin/returns" className="hover:text-slate-700">
              {isArabic ? "المرتجعات" : "Returns"}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>{isArabic ? "إضافة مرتجع" : "Add New Return"}</span>
          </div>

          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {isArabic ? "إنشاء طلب مرتجع" : "Create Return Request"}
              </h1>
              <p className="mt-1 max-w-2xl text-sm font-medium text-slate-500">
                {isArabic
                  ? "ابدأ ووثّق طلب إرجاع جديد للمستخدم المختار."
                  : "Initiate and document a new return for the selected user."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Step 1: User Selection */}
            <section className="rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-100 p-5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">
                  1
                </div>
                <div className="text-sm font-extrabold text-slate-900">
                  {isArabic ? "اختيار المستخدم" : "User Selection"}
                </div>
              </div>

              <div className="p-5">
                <div className="relative mb-4">
                  <div className="mb-1 text-[12px] font-semibold text-slate-600">
                    {isArabic ? "ابحث عن عميل (الاسم أو البريد)" : "Search for Customer (Name or Email)"}
                  </div>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={customerSearch}
                      onFocus={() => setIsDropdownOpen(true)}
                      onClick={() => setIsDropdownOpen(true)}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setIsDropdownOpen(true);
                        if (selectedUser) setSelectedUser(null);
                      }}
                      placeholder={isArabic ? "ابحث هنا..." : "Search here..."}
                      className="h-11 rounded-xl border-slate-200 bg-white pl-10 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  {isDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 z-20 mt-2 max-h-[300px] overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                        {loadingUsers ? (
                          <div className="p-4 text-center text-sm text-slate-500 animate-pulse">
                            {isArabic ? "جاري تحميل العملاء..." : "Loading customers..."}
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-sm text-slate-500 italic">
                            {isArabic ? "لا يوجد نتائج" : "No results found"}
                          </div>
                        ) : (
                          filteredUsers.map(user => (
                            <div
                              key={user._id}
                              onClick={() => {
                                setSelectedUser(user);
                                setCustomerSearch(`${user.firstName} ${user.lastName}`);
                                setIsDropdownOpen(false);
                              }}
                              className={`flex cursor-pointer items-center justify-between rounded-lg p-3 transition-colors hover:bg-emerald-50/50 ${selectedUser?._id === user._id ? 'bg-emerald-50 ring-1 ring-emerald-100' : ''}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-emerald-700 ring-1 ring-slate-100">
                                  <Clipboard className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="text-sm font-extrabold text-slate-900">{user.firstName} {user.lastName}</div>
                                  <div className="text-[11px] font-semibold text-slate-500">{user.email}</div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Step 2: Order Selection */}
            {selectedUser && (
              <section className="animate-in fade-in slide-in-from-top-4 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm duration-500">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-xs font-extrabold text-white">2</div>
                    <div className="text-sm font-extrabold text-slate-900">{isArabic ? "اختيار الطلب" : "Order Selection"}</div>
                  </div>
                  {selectedOrder && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleUnselectOrder}
                      className="h-8 gap-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-50 hover:text-rose-600"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      {isArabic ? "تغيير الطلب" : "Change Order"}
                    </Button>
                  )}
                </div>

                <div className="p-5">
                  {loadingOrders ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {[1, 2, 3, 4].map(i => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-50 ring-1 ring-slate-100" />)}
                    </div>
                  ) : userOrders.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 py-12 text-center">
                      <div className="mb-3 flex justify-center"><div className="rounded-full bg-slate-100 p-3 text-slate-400"><Clipboard className="h-6 w-6" /></div></div>
                      <div className="text-sm font-extrabold text-slate-900">{isArabic ? "لا توجد طلبات" : "No orders found"}</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {userOrders.map(order => {
                        const isSelected = selectedOrder?._id === order._id;
                        const shouldHide = selectedOrder && !isSelected;
                        if (shouldHide) return null;

                        return (
                          <div
                            key={order._id}
                            className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all ${isSelected ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-500/20 shadow-lg shadow-emerald-500/5' : 'border-slate-100 bg-slate-50/10 hover:border-emerald-200 hover:bg-emerald-50/30'}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ${isSelected ? 'text-emerald-700 ring-emerald-100' : 'text-slate-400 ring-slate-100'}`}>
                                <ShieldCheck className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="truncate text-sm font-extrabold text-slate-900">{getBrandedId(order.orderId || order._id)}</div>
                                  <div className="text-[11px] font-extrabold text-emerald-700">
                                    {(order as any).totalPrice || order.total || (order as any).grandTotal || 0} {isArabic ? "جنيه" : "EGP"}
                                  </div>
                                </div>
                                <div className="mt-1 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                                  <span>{formatDateLabel(order.createdAt, locale)}</span>
                                  <span className="capitalize">{order.status}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/admin/orders/${order.orderId || order._id}`, '_blank')}
                                className="h-9 flex-1 gap-1.5 rounded-xl border-slate-200 bg-white text-[11px] font-extrabold text-slate-700 hover:bg-slate-50"
                              >
                                <ExternalLink className="h-3 w-3" />
                                {isArabic ? "التفاصيل" : "Details"}
                              </Button>
                              {!isSelected ? (
                                <Button
                                  size="sm"
                                  onClick={() => setSelectedOrder(order)}
                                  className={`h-9 flex-1 gap-1.5 rounded-xl text-[11px] font-extrabold bg-slate-900 text-white hover:bg-slate-800`}
                                >
                                  {isArabic ? "اختيار" : "Select"}
                                </Button>
                              ) : (
                                 <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleUnselectOrder}
                                  className={`h-9 flex-1 gap-1.5 rounded-xl text-[11px] font-extrabold border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100`}
                                >
                                  {isArabic ? "إلغاء الاختيار" : "Unselect"}
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* New Final Step: Return Action */}
            {selectedOrder && (
              <section className="animate-in fade-in slide-in-from-top-4 rounded-3xl border border-emerald-200 bg-white p-8 shadow-xl shadow-emerald-500/5 duration-500">
                <div className="flex items-center gap-5 mb-8">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                     <AlertCircle className="h-7 w-7" />
                  </div>
                  <div>
                     <h2 className="text-xl font-extrabold text-slate-900">
                        {isArabic ? "إرسال طلب مرتجع نهائي" : "Final Return Request"}
                     </h2>
                     <p className="text-sm font-semibold text-slate-500 mt-1">
                        {isArabic ? "سيتم إرسال طلب مرتجع لجميع محتويات الطلب:" : "Submitting return for the entire order contents:"} 
                        <span className="text-emerald-600 ml-1">{getBrandedId(selectedOrder.orderId || selectedOrder._id)}</span>
                     </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                  <div>
                    <label className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wider">{isArabic ? "سبب المرتجع" : "Return Reason"}</label>
                    <select value={primaryReason} onChange={(e) => setPrimaryReason(e.target.value)} className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all">
                      <option value="damaged">{isArabic ? "تلف / عيب" : "Damaged / Defective"}</option>
                      <option value="wrong">{isArabic ? "منتج خاطئ" : "Wrong Item"}</option>
                      <option value="other">{isArabic ? "أخرى" : "Other"}</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                     <label className="mb-2 block text-xs font-extrabold text-slate-700 uppercase tracking-wider">{isArabic ? "ملاحظات إضافية" : "Additional Notes"}</label>
                     <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full min-h-[100px] rounded-xl border border-slate-200 bg-white p-4 text-sm font-bold focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all" placeholder={isArabic ? "اكتب ملاحظات الفحص هنا..." : "Write inspection notes here..."} />
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-8">
                   <button onClick={handleReset} className="text-sm font-bold text-slate-400 hover:text-slate-800 transition-colors uppercase tracking-widest">{isArabic ? "إعادة تعيين" : "Reset Flow"}</button>
                   <Button onClick={handleReturnSubmission} disabled={submitting} className="h-14 rounded-2xl bg-emerald-600 px-12 text-sm font-extrabold text-white shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 hover:-translate-y-0.5 transition-all">
                      {submitting ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-5 w-5" />
                          <span>{isArabic ? "إرسال طلب المرتجع" : "Submit Return Request"}</span>
                        </div>
                      )}
                   </Button>
                </div>
              </section>
            )}

            {/* Empty Selection Placeholder */}
            {!selectedUser && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                 <Clipboard className="h-12 w-12 mb-4 opacity-20" />
                 <p className="text-sm font-extrabold uppercase tracking-widest">{isArabic ? "ابدأ باختيار مستخدم" : "Start by selecting a user"}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </NextAuthProvider>
  );
}

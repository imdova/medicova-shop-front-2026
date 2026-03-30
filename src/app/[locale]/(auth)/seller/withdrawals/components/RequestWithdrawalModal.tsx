import { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Loader2, AlertCircle } from "lucide-react";
import { createSellerWithdrawal } from "@/services/financeService";
import { useSession } from "next-auth/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RequestWithdrawalModal({ isOpen, onClose, onSuccess }: Props) {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [amount, setAmount] = useState<string>("");
  const [method, setMethod] = useState<"bank_transfer" | "paypal" | "instapay">("bank_transfer");
  const [details, setDetails] = useState<string>("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const withdrawAmount = parseFloat(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError(isArabic ? "يرجى إدخال مبلغ صحيح" : "Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await createSellerWithdrawal(token, {
        amount: withdrawAmount,
        method,
        details: { accountInfo: details }
      });

      if (res.success) {
        onSuccess();
        onClose();
        setAmount("");
        setDetails("");
      } else {
        setError(res.message || (isArabic ? "تعذر إنشاء طلب السحب" : "Failed to create withdrawal request"));
      }
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div 
        className="w-full max-w-md animate-in zoom-in-95 rounded-2xl bg-white shadow-xl"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="border-b border-slate-100 p-6">
          <h2 className="text-xl font-black text-slate-900">
            {isArabic ? "طلب سحب جديد" : "Request Withdrawal"}
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {isArabic ? "أدخل تفاصيل السحب الخاصة بك" : "Enter your withdrawal details"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-sm font-bold text-rose-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {isArabic ? "المبلغ المطلوب" : "Withdrawal Amount"} <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className={`absolute top-1/2 -translate-y-1/2 text-slate-400 font-bold ${isArabic ? 'right-4' : 'left-4'}`}>
                $
              </span>
              <input
                type="number"
                step="0.01"
                min="10"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10 ${isArabic ? 'pr-8' : 'pl-8'}`}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {isArabic ? "طريقة الدفع" : "Payment Method"} <span className="text-rose-500">*</span>
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-semibold text-slate-700 transition focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            >
              <option value="bank_transfer">{isArabic ? "تحويل بنكي" : "Bank Transfer"}</option>
              <option value="paypal">{isArabic ? "باي بال" : "PayPal"}</option>
              <option value="instapay">{isArabic ? "انستا باي" : "InstaPay"}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">
              {isArabic ? "تفاصيل الحساب" : "Account Details"} <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder={isArabic ? "أدخل رقم الحساب أو البريد الإلكتروني (PayPal)..." : "Enter IBAN, Account #, or PayPal Email..."}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm font-medium transition placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3 text-sm font-bold text-white shadow-md transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isArabic ? "تأكيد الطلب" : "Confirm Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

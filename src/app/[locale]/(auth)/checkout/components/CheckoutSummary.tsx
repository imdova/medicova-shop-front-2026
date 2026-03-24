"use client";

import { ShieldCheck, Info } from "lucide-react";
import { LanguageType } from "@/util/translations";

interface CheckoutSummaryProps {
  productsCount: number;
  subtotal: number;
  shippingFee: number;
  paymentFee: number;
  total: number;
  discountAmount?: number;
  appliedCoupon?: string;
  disabled: boolean;
  locale: LanguageType;
}

export default function CheckoutSummary({
  productsCount,
  subtotal,
  shippingFee,
  paymentFee,
  total,
  discountAmount = 0,
  appliedCoupon = "",
  disabled,
  locale,
}: CheckoutSummaryProps) {
  const isAr = locale === "ar";

  return (
    <div className="sticky top-24 space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg backdrop-blur-lg">
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          {isAr ? "ملخص الطلب" : "Order Summary"}
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-500">
              {isAr
                ? `المجموع الفرعي (${productsCount} عنصر)`
                : `Subtotal (${productsCount} item${productsCount !== 1 ? "s" : ""})`}
            </span>
            <span className="font-bold text-gray-900">
              {subtotal.toFixed(2)} {isAr ? "جنيه" : "EGP"}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="font-medium text-gray-500">
              {isAr ? "رسوم الشحن" : "Shipping Fee"}
            </span>
            {shippingFee === 0 ? (
              <span className="text-[10px] font-bold italic text-gray-400">
                {isAr ? "يحدد بعد العنوان" : "Calculated after address"}
              </span>
            ) : (
              <span className="font-bold text-gray-900">
                {shippingFee.toFixed(2)} {isAr ? "جنيه" : "EGP"}
              </span>
            )}
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-500">
                {isAr ? `خصم (${appliedCoupon})` : `Discount (${appliedCoupon})`}
              </span>
              <span className="font-bold text-primary">
                -{discountAmount.toFixed(2)} {isAr ? "جنيه" : "EGP"}
              </span>
            </div>
          )}

          {paymentFee > 0 && (
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-500">
                {isAr ? "رسوم الدفع (Cash)" : "Payment Fee (COD)"}
              </span>
              <span className="font-bold text-gray-900">
                {paymentFee.toFixed(2)} {isAr ? "جنيه" : "EGP"}
              </span>
            </div>
          )}

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-base font-black text-gray-900">
                {isAr ? "الإجمالي" : "Total"}
              </span>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">
                  {total.toFixed(2)} {isAr ? "جنيه" : "EGP"}
                </span>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {isAr ? "شامل ضريبة القيمة المضافة" : "Including VAT"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="shadow-primary/20 hover:shadow-primary/30 group relative w-full overflow-hidden rounded-xl bg-primary py-4 text-sm font-black text-white shadow-xl transition-all hover:bg-green-700 hover:shadow-2xl active:scale-[0.98] disabled:bg-gray-200 disabled:shadow-none disabled:active:scale-100"
          >
            <span className="relative z-10">
              {isAr ? "تأكيد الطلب الآن" : "PLACE ORDER NOW"}
            </span>
          </button>

          <div className="bg-primary/5 border-primary/10 flex items-center gap-2 rounded-xl border p-3">
            <ShieldCheck className="h-5 w-5 flex-shrink-0 text-primary" />
            <p className="text-[10px] font-bold leading-tight text-primary">
              {isAr
                ? "تسوق آمن 100%. بياناتك مشفرة ومحمية بالكامل."
                : "100% Secure Checkout. Your data is encrypted and protected."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
        <div className="mb-3 flex gap-2">
          <Info className="h-4 w-4 flex-shrink-0 text-gray-400" />
          <p className="text-[10px] font-medium leading-relaxed text-gray-500">
            {isAr
              ? "بالنقر على تأكيد الطلب، فإنك توافق على شروط البيع وسياسة الخصوصية الخاصة بميديكوفا."
              : "By clicking Place Order, you agree to Medicova's Terms of Sale and Privacy Policy."}
          </p>
        </div>

        <p className="text-center text-[9px] font-bold uppercase tracking-widest text-gray-400">
          © 2026 Medicova Store •{" "}
          {isAr ? "كل الحقوق محفوظة" : "All Rights Reserved"}
        </p>
      </div>
    </div>
  );
}

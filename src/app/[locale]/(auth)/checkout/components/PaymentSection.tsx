"use client";

import { CreditCard, Banknote, CheckCircle2 } from "lucide-react";
import { LanguageType } from "@/util/translations";

interface PaymentSectionProps {
  paymentMethod: "card" | "cod";
  onSelectMethod: (method: "card" | "cod") => void;
  locale: LanguageType;
}

export default function PaymentSection({
  paymentMethod,
  onSelectMethod,
  locale,
}: PaymentSectionProps) {
  const isAr = locale === "ar";

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
      <div className="p-6">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
          <span className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-primary">
            3
          </span>
          {isAr ? "طريقة الدفع" : "Payment Method"}
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Card Option */}
          <div
            className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all duration-300 ${
              paymentMethod === "card"
                ? "bg-primary/5 border-primary shadow-inner"
                : "hover:border-primary/30 hover:bg-primary/5 border-gray-100 bg-white"
            }`}
            onClick={() => onSelectMethod("card")}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`rounded-lg p-2 ${paymentMethod === "card" ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-white"}`}
              >
                <CreditCard className="h-5 w-5" />
              </div>
              {paymentMethod === "card" && (
                <CheckCircle2 className="fill-primary/10 h-5 w-5 text-primary" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-bold ${paymentMethod === "card" ? "text-primary" : "text-gray-800"}`}
              >
                {isAr ? "بطاقة ائتمان / خصم" : "Debit/Credit Card"}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-gray-500">
                {isAr
                  ? "خطط التقسيط الشهرية متوفرة للدفع الآمن"
                  : "Secure payment with monthly installments available"}
              </p>
            </div>
          </div>

          {/* COD Option */}
          <div
            className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all duration-300 ${
              paymentMethod === "cod"
                ? "bg-primary/5 border-primary shadow-inner"
                : "hover:border-primary/30 hover:bg-primary/5 border-gray-100 bg-white"
            }`}
            onClick={() => onSelectMethod("cod")}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`rounded-lg p-2 ${paymentMethod === "cod" ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-white"}`}
              >
                <Banknote className="h-5 w-5" />
              </div>
              {paymentMethod === "cod" && (
                <CheckCircle2 className="fill-primary/10 h-5 w-5 text-primary" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-bold ${paymentMethod === "cod" ? "text-primary" : "text-gray-800"}`}
              >
                {isAr ? "الدفع عند الاستلام" : "Cash On Delivery"}
              </p>
              <p className="mt-1 text-[10px] leading-tight text-gray-500">
                {isAr
                  ? "قد يتم فرض رسوم إضافية بقيمة 9.00 جنيه"
                  : "Extra charge of EGP 9.00 applies for this method"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

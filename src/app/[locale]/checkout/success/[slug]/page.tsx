"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function OrderSuccessPage() {
  const params = useParams();
  const locale = params.locale as string;
  const orderId = params.orderId as string;
  const isAr = locale === "ar";

  return (
    <div
      className={`flex min-h-[80vh] items-center justify-center p-4 ${isAr ? "rtl" : "ltr"}`}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl"
      >
        {/* Header with Background Gradient */}
        <div className="relative flex h-32 items-center justify-center bg-gradient-to-r from-primary to-green-600">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="absolute -bottom-10 rounded-full bg-white p-2 shadow-xl"
          >
            <CheckCircle2 className="h-16 w-16 text-primary" />
          </motion.div>
        </div>

        <div className="px-8 pb-10 pt-16 text-center">
          <h1 className="mb-2 text-3xl font-black text-gray-900">
            {isAr ? "شكراً لطلبك!" : "Thank You For Your Order!"}
          </h1>
          <p className="mb-8 font-medium text-gray-500">
            {isAr
              ? "تم استلام طلبك بنجاح. نحن نعمل الآن على تجهيزه ليصلك في أسرع وقت."
              : "Your order has been placed successfully. We are now processing it for delivery."}
          </p>


          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href={`/${locale}/user/orders`}
              className="btn-primary shadow-primary/20 group flex flex-1 items-center justify-center gap-2 rounded-xl py-4 font-black shadow-xl transition-all hover:shadow-2xl active:scale-[0.98]"
            >
              <ShoppingBag className="h-5 w-5 transition-transform group-hover:-translate-y-1" />
              {isAr ? "متابعة الطلبات" : "My Orders"}
            </Link>

            <Link
              href={`/${locale}`}
              className="hover:border-primary/30 flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-gray-100 bg-white py-4 font-bold text-gray-700 transition-all hover:text-primary active:scale-[0.98]"
            >
              {isAr ? "الرئيسية" : "Home"}
              <ArrowRight
                className={`h-5 w-5 ${isAr ? "rotate-180" : ""} transition-transform group-hover:translate-x-1`}
              />
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="border-t border-gray-50 bg-gray-50/50 py-4 text-center">
          <p className="text-[10px] font-bold text-gray-400">
            {isAr
              ? "سوف نرسل لك رسالة تأكيد عبر البريد الإلكتروني قريباً."
              : "A confirmation email has been sent to your address."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

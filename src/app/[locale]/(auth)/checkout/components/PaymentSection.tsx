import { CreditCard, Banknote, CheckCircle2, Wallet, Smartphone } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { PaymobMethod } from "@/services/paymentService";

interface PaymentSectionProps {
  paymentMethod: string;
  onSelectMethod: (method: string) => void;
  locale: LanguageType;
  paymobMethods: PaymobMethod[];
}

export default function PaymentSection({
  paymentMethod,
  onSelectMethod,
  locale,
  paymobMethods,
}: PaymentSectionProps) {
  const isAr = locale === "ar";

  const getIcon = (type: string) => {
    switch (type) {
      case "card":
        return <CreditCard className="h-5 w-5" />;
      case "ewallet":
      case "wallet":
        return <Wallet className="h-5 w-5" />;
      case "kiosk":
        return <Smartphone className="h-5 w-5" />;
      case "cash_on_delivery":
        return <Banknote className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

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
          {/* COD Option */}
          <div
            className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all duration-300 ${
              paymentMethod === "cash_on_delivery"
                ? "bg-primary/5 border-primary shadow-inner"
                : "hover:border-primary/30 hover:bg-primary/5 border-gray-100 bg-white"
            }`}
            onClick={() => onSelectMethod("cash_on_delivery")}
          >
            <div className="mb-3 flex items-center justify-between">
              <div
                className={`rounded-lg p-2 ${paymentMethod === "cash_on_delivery" ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-white"}`}
              >
                <Banknote className="h-5 w-5" />
              </div>
              {paymentMethod === "cash_on_delivery" && (
                <CheckCircle2 className="fill-primary/10 h-5 w-5 text-primary" />
              )}
            </div>

            <div>
              <p
                className={`text-sm font-bold ${paymentMethod === "cash_on_delivery" ? "text-primary" : "text-gray-800"}`}
              >
                {isAr ? "الدفع عند الاستلام" : "Cash On Delivery"}
              </p>
            </div>
          </div>

          {/* Paymob Methods */}
          {paymobMethods.filter(m => m.enabled).map((method) => (
            <div
              key={method.type}
              className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all duration-300 ${
                paymentMethod === method.type
                  ? "bg-primary/5 border-primary shadow-inner"
                  : "hover:border-primary/30 hover:bg-primary/5 border-gray-100 bg-white"
              }`}
              onClick={() => onSelectMethod(method.type)}
            >
              <div className="mb-3 flex items-center justify-between">
                <div
                  className={`rounded-lg p-2 ${paymentMethod === method.type ? "bg-primary text-white" : "bg-gray-50 text-gray-400 group-hover:bg-white"}`}
                >
                  {getIcon(method.type)}
                </div>
                {paymentMethod === method.type && (
                  <CheckCircle2 className="fill-primary/10 h-5 w-5 text-primary" />
                )}
              </div>

              <div>
                <p
                  className={`text-sm font-bold ${paymentMethod === method.type ? "text-primary" : "text-gray-800"}`}
                >
                  {method.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

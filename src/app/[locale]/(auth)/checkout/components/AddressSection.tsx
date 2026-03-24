import { Phone, User, MapPin, Loader2 } from "lucide-react";
import { Address } from "@/types";
import { LanguageType } from "@/util/translations";
import { UseFormRegister, UseFormWatch, FieldErrors } from "react-hook-form";
import { CheckoutFormData } from "../hooks/useCheckoutPage";

interface AddressSectionProps {
  selectedAddress: Address | null;
  onLocateMe: () => void;
  isLocating: boolean;
  locationError: string;
  locale: LanguageType;
  register: UseFormRegister<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
}

export default function AddressSection({
  selectedAddress,
  onLocateMe,
  isLocating,
  locationError,
  locale,
  register,
  watch,
  errors,
}: AddressSectionProps) {
  const isAr = locale === "ar";

  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
      <div className="p-5">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-800">
          <span className="bg-primary/10 flex h-7 w-7 items-center justify-center rounded-full text-xs text-primary">
            1
          </span>
          {isAr ? "بيانات الشحن" : "Shipping Details"}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              {isAr ? "الاسم بالكامل" : "Full Name"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
              <input
                {...register("fullName", { required: true })}
                type="text"
                placeholder={isAr ? "أدخل اسمك بالكامل" : "Enter your full name"}
                className={`w-full rounded-lg border ${errors.fullName ? "border-red-300 ring-4 ring-red-50" : "border-gray-100"} bg-gray-50/50 py-2.5 ${isAr ? "pr-3 pl-9 text-right" : "pl-9 pr-3"} text-sm focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all`}
              />
            </div>
          </div>

          {/* Phone Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              {isAr ? "رقم الهاتف" : "Phone Number"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
              <input
                {...register("phoneNumber", {
                  required: true,
                  onChange: (e) => {
                    let val = e.target.value;
                    if (!val.startsWith("+")) {
                      val = "+" + val.replace(/\D/g, "");
                    } else {
                      val = "+" + val.substring(1).replace(/\D/g, "");
                    }
                    if (val.length > 13) val = val.substring(0, 13);
                    e.target.value = val;
                  },
                  validate: (val) => val.length === 13 || (isAr ? "يجب أن يكون 12 رقماً" : "Must be 12 digits")
                })}
                type="tel"
                placeholder="+201234567890"
                className={`w-full rounded-lg border ${errors.phoneNumber ? "border-red-300 ring-4 ring-red-50" : "border-gray-100"} bg-gray-50/50 py-2.5 ${isAr ? "pr-3 pl-9 text-right" : "pl-9 pr-3"} text-sm focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all`}
              />
            </div>
          </div>

          {/* Address Input & Actions */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-gray-700">
                {isAr ? "العنوان بالتفصيل" : "Detailed Address"} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={onLocateMe}
                  disabled={isLocating}
                  className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-bold text-gray-600 transition-all hover:border-primary/30 hover:bg-primary/5 disabled:opacity-50"
                >
                  {isLocating ? (
                    <Loader2 className="h-2.5 w-2.5 animate-spin" />
                  ) : (
                    <MapPin className="h-2.5 w-2.5 text-primary" />
                  )}
                  {isAr ? "الموقع (GPS)" : "GPS"}
                </button>
              </div>
            </div>

            <textarea
              {...register("shippingAddress", { required: true })}
              rows={2}
              placeholder={isAr ? "اكتب عنوانك بالتفصيل (رقم الشارع، رقم المبنى، الدور...)" : "Enter your address details (Street, Building, Floor...)"}
              className={`w-full resize-none rounded-lg border ${errors.shippingAddress ? "border-red-300 ring-4 ring-red-50" : "border-gray-100"} bg-gray-50/50 py-2.5 px-3 text-sm focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all ${isAr ? "text-right" : ""}`}
            />

            {locationError && (
              <p className="mt-1 text-xs text-red-500">{locationError}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

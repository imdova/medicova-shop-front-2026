import { Phone, User, MapPin, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
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
  isNewUser?: boolean;
  isLoggedIn?: boolean;
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
  isNewUser,
  isLoggedIn,
}: AddressSectionProps) {
  const isAr = locale === "ar";
  const [showPassword, setShowPassword] = useState(false);

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
          {!isLoggedIn && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                {isAr ? "الاسم بالكامل" : "Full Name"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                <input
                  {...register("fullName", { required: !isLoggedIn })}
                  type="text"
                  placeholder={isAr ? "أدخل اسمك بالكامل" : "Enter your full name"}
                  className={`w-full rounded-lg border ${errors.fullName ? "border-red-300 ring-4 ring-red-50" : "border-gray-100"} bg-gray-50/50 py-2.5 ${isAr ? "pr-3 pl-9 text-right" : "pl-9 pr-3"} text-sm focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all`}
                />
              </div>
            </div>
          )}

          {/* Phone Input */}
          {!isLoggedIn && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                {isAr ? "رقم الهاتف" : "Phone Number"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-3.5 w-3.5 text-gray-400" />
                <input
                  {...register("phoneNumber", {
                    required: !isLoggedIn ? (isAr ? "رقم الهاتف مطلوب" : "Phone number is required") : false,
                    pattern: {
                      value: /^[0-9]{11}$/,
                      message: isAr ? "يجب أن يكون الرقم 11 رقماً" : "Must be 11 digits"
                    }
                  })}
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className={`w-full rounded-lg border ${errors.phoneNumber ? "border-red-300 ring-4 ring-red-50" : "border-gray-100"} bg-gray-50/50 py-2.5 ${isAr ? "pr-3 pl-9 text-right" : "pl-9 pr-3"} text-sm focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="mt-1 text-[10px] text-red-500">{errors.phoneNumber.message}</p>
              )}
            </div>
          )}

          {/* Password Input (Only for new users AND NOT logged in) */}
          {isNewUser && !isLoggedIn && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">
                {isAr ? "كلمة المرور" : "Password"} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  {...register("password", {
                    required: isNewUser && !isLoggedIn ? (isAr ? "كلمة المرور مطلوبة" : "Password is required") : false,
                    minLength: {
                      value: 6,
                      message: isAr ? "يجب أن تكون 6 أحرف على الأقل" : "Must be at least 6 characters"
                    }
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`w-full rounded-lg border ${errors.password ? "border-red-300 ring-4 ring-red-50" : "border-gray-100"} bg-gray-50/50 py-2.5 px-3 text-sm focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all ${isAr ? "pl-9" : "pr-9"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute bottom-2.5 top-2.5 h-4 w-4 text-gray-400 hover:text-primary ${
                    isAr ? "left-3" : "right-3"
                  }`}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {errors.password && (
                  <p className="mt-1 text-[10px] text-red-500">{errors.password.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Governorate Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">
              {isAr ? "المحافظة" : "Governorate"} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                {...register("governorate", { required: isAr ? "المحافظة مطلوبة" : "Governorate is required" })}
                className={`w-full appearance-none rounded-lg border ${errors.governorate ? "border-red-300 ring-4 ring-red-50" : "border-gray-100"} bg-gray-50/50 py-2.5 px-3 text-sm focus:border-primary/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/5 transition-all ${isAr ? "text-right" : ""}`}
              >
                <option value="">{isAr ? "اختر المحافظة" : "Select Governorate"}</option>
                <option value="Cairo">{isAr ? "القاهرة" : "Cairo"}</option>
                <option value="Giza">{isAr ? "الجيزة" : "Giza"}</option>
                <option value="Alexandria">{isAr ? "الإسكندرية" : "Alexandria"}</option>
                <option value="Al Qalyūbīyah">{isAr ? "القليوبية" : "Qalyubia"}</option>
                <option value="Al Gharbīyah">{isAr ? "الغربية" : "Gharbia"}</option>
                <option value="Ash Sharqīyah">{isAr ? "الشرقية" : "Sharqia"}</option>
                <option value="Ad Daqahlīyah">{isAr ? "الدقهلية" : "Dakahlia"}</option>
                <option value="Al Buḩayrah">{isAr ? "البحيرة" : "Beheira"}</option>
                <option value="Kafr ash Shaykh">{isAr ? "كفر الشيخ" : "Kafr el-Sheikh"}</option>
                <option value="Al Minūfīyah">{isAr ? "المنوفية" : "Monufia"}</option>
                <option value="Dumyāţ">{isAr ? "دمياط" : "Damietta"}</option>
                <option value="Suez">{isAr ? "السويس" : "Suez"}</option>
                <option value="Port Said">{isAr ? "بور سعيد" : "Port Said"}</option>
                <option value="Al Ismā‘īlīyah">{isAr ? "الإسماعيلية" : "Ismailia"}</option>
                <option value="Al Fayyūm">{isAr ? "الفيوم" : "Fayyum"}</option>
                <option value="Banī Suwayf">{isAr ? "بني سويف" : "Beni Suef"}</option>
                <option value="Al Minyā">{isAr ? "المنيا" : "Minya"}</option>
                <option value="Asyūţ">{isAr ? "أسيوط" : "Asyut"}</option>
                <option value="Sūhāj">{isAr ? "سوهاج" : "Sohag"}</option>
                <option value="Qinā">{isAr ? "قنا" : "Qena"}</option>
                <option value="Al Uqşur">{isAr ? "الأقصر" : "Luxor"}</option>
                <option value="Aswān">{isAr ? "أسوان" : "Aswan"}</option>
                <option value="Al Baḩr al Aḩmar">{isAr ? "البحر الأحمر" : "Red Sea"}</option>
                <option value="Al Wādī al Jadīd">{isAr ? "الوادي الجديد" : "New Valley"}</option>
                <option value="Maţrūḩ">{isAr ? "مطروح" : "Matrouh"}</option>
                <option value="Shamāl Sīnā’">{isAr ? "شمال سيناء" : "North Sinai"}</option>
                <option value="Janūb Sīnā’">{isAr ? "جنوب سيناء" : "South Sinai"}</option>
              </select>
            </div>
            {errors.governorate && (
              <p className="mt-1 text-[10px] text-red-500">{errors.governorate.message}</p>
            )}
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

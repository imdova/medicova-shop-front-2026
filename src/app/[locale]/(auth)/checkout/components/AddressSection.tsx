"use client";

import Image from "next/image";
import { ChevronRight, MapPin } from "lucide-react";
import { Address } from "@/types";
import { LanguageType } from "@/util/translations";

interface AddressSectionProps {
  selectedAddress: Address | null;
  onShowModal: () => void;
  locale: LanguageType;
}

export default function AddressSection({
  selectedAddress,
  onShowModal,
  locale,
}: AddressSectionProps) {
  const isAr = locale === "ar";

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-gray-100 bg-white/70 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <span className="bg-primary/10 flex h-8 w-8 items-center justify-center rounded-full text-sm text-primary">
              1
            </span>
            {isAr ? "عنوان الشحن" : "Shipping Address"}
          </h2>
          <button
            type="button"
            onClick={onShowModal}
            className="text-sm font-semibold text-primary transition-colors hover:text-green-700"
          >
            {isAr ? "تغيير" : "Change"}
          </button>
        </div>

        <div
          className="hover:border-primary/30 hover:bg-primary/5 group relative flex cursor-pointer items-center justify-between rounded-xl border border-gray-100 p-5 transition-all"
          onClick={onShowModal}
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 transition-colors group-hover:bg-white">
              <Image
                className="h-8 w-8 object-contain"
                src="/icons/pin.gif"
                alt="map-pin"
                width={32}
                height={32}
                unoptimized
              />
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  {isAr ? "العنوان الأساسي" : "Primary Address"}
                </span>
                <span className="bg-secondary/10 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-secondary">
                  {isAr ? "المنزل" : "Home"}
                </span>
              </div>

              {selectedAddress ? (
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-gray-700">
                    {selectedAddress.details}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedAddress.area}, {selectedAddress.city}
                  </p>
                </div>
              ) : (
                <p className="text-sm italic text-gray-400">
                  {isAr ? "لم يتم اختيار عنوان بعد" : "No address selected yet"}
                </p>
              )}
            </div>
          </div>
          <ChevronRight
            className={`h-5 w-5 text-gray-300 transition-transform group-hover:translate-x-1 ${isAr ? "rotate-180 group-hover:-translate-x-1" : ""}`}
          />
        </div>
      </div>
    </div>
  );
}

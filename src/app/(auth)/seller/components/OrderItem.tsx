import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { LanguageType } from "@/util/translations";
import { Order } from "../../user/types/account";

const translations = {
  status: {
    completed: { en: "Completed", ar: "مكتمل" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
    processing: { en: "Processing", ar: "قيد المعالجة" },
    shipped: { en: "Shipped", ar: "تم الشحن" },
  },
  on: {
    en: "on",
    ar: "في",
  },
  orderId: {
    en: "Order ID",
    ar: "رقم الطلب",
  },
};

const OrderItem: React.FC<{ order: Order; locale?: LanguageType }> = ({
  order,
  locale = "en",
}) => {
  const statusColors = {
    completed: "text-green-800",
    cancelled: "text-red-800",
    processing: "text-yellow-800",
    shipped: "text-blue-800",
  };

  return (
    <Link
      href={"#"}
      className="relative block rounded-lg border border-gray-200 bg-white p-3 hover:border-gray-600"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex flex-col gap-1 sm:flex-row">
            <span
              className={`rounded-full py-1 text-xs font-semibold ${statusColors[order.status]}`}
            >
              {translations.status[order.status]?.[locale]}
            </span>
            <div className="flex items-center gap-1">
              <p className="text-sm text-gray-500">
                {translations.on[locale]} {order.date} {order.time}
              </p>
            </div>
          </div>

          <div className="my-3 flex gap-2">
            <Image
              className="h-[100px] w-[100px] rounded-md object-cover"
              src={order.productImage}
              width={300}
              height={300}
              alt={order.productName}
            />
            <div>
              <h3 className="mt-1 font-medium text-gray-800">
                {order.productName}
              </h3>
              {order.productBrand && (
                <p className="text-sm text-gray-600">{order.productBrand}</p>
              )}
            </div>
          </div>

          {order.productDescription && (
            <p className="mt-1 text-sm text-gray-500">
              {order.productDescription}
            </p>
          )}
        </div>
      </div>

      <div className="mt-2">
        <p className="text-xs text-gray-500">
          {translations.orderId[locale]}: {order.orderId}
        </p>
      </div>

      <div className="absolute right-4 top-1/2 -translate-y-1/2">
        <ChevronRight size={18} className="text-secondary" />
      </div>
    </Link>
  );
};

export default OrderItem;

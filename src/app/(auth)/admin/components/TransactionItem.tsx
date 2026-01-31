import React from "react";
import PlatformIcon from "./PlatformIcon";
import { LanguageType } from "@/util/translations";

type TransactionType = "payment" | "refund" | "purchase";

interface TransactionItemProps {
  id: string;
  platform: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: Date;
  locale?: LanguageType;
}

const TransactionItem: React.FC<TransactionItemProps> = ({
  platform,
  description,
  amount,
  type,
}) => {
  const getIconColor = () => {
    switch (platform.toLowerCase()) {
      case "paypal":
        return "bg-blue-100 text-blue-600";
      case "paytm":
        return "bg-blue-100 text-blue-600";
      case "stripe":
        return "bg-purple-100 text-purple-600";
      case "razorpay":
        return "bg-indigo-100 text-indigo-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${getIconColor()}`}
        >
          <PlatformIcon platform={platform} className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{platform}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <div
        className={`font-medium ${type === "payment" || type === "purchase" ? "text-red-500" : "text-green-500"}`}
      >
        {type === "payment" || type === "purchase" ? "-" : "+"}$
        {Math.abs(amount).toLocaleString()}
      </div>
    </div>
  );
};

export default TransactionItem;

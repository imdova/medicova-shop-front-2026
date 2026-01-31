import React from "react";
import OrderItem from "./OrderItem";
import { LanguageType } from "@/util/translations";
import { Order } from "../../user/types/account";

interface OrderListProps {
  orders: Order[];
  filter?: string;
  locale?: LanguageType;
}

const translations = {
  noOrders: {
    en: "No orders found",
    ar: "لم يتم العثور على طلبات",
  },
};

const OrderList: React.FC<OrderListProps> = ({
  orders,
  filter,
  locale = "en",
}) => {
  const filteredOrders = filter
    ? orders.filter((order) => order.status === filter)
    : orders;

  if (filteredOrders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">{translations.noOrders[locale]}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderItem key={order.orderId} order={order} locale={locale} />
        ))}
      </div>
    </div>
  );
};

export default OrderList;

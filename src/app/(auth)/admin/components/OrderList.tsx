import React from "react";
import OrderItem from "./OrderItem";
import { Order } from "../../user/types/account";

interface OrderListProps {
  orders: Order[];
  filter?: string;
}

const OrderList: React.FC<OrderListProps> = ({ orders, filter }) => {
  const filteredOrders = filter
    ? orders.filter((order) => order.status === filter)
    : orders;

  if (filteredOrders.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <OrderItem key={order.orderId} order={order} />
        ))}
      </div>
    </div>
  );
};

export default OrderList;

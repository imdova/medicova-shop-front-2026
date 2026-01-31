import { Shipment } from "@/types/product";
import { products } from "./products";
import { dummyCustomers } from "./customers";

export const dummyShipments: Shipment[] = [
  {
    id: "1",
    orderId: "SF-10000001",
    customer: dummyCustomers[0],
    products: [...products.slice(1, 2)],
    shippingCompany: { en: "FastExpress", ar: "" },
    trackingId: "JJD0042730001",
    trackingLink: "https://tracking.fast-express.com/JJD0042730001",
    estimateDateShipped: "2024-01-20",
    note: { en: "", ar: "" },
    shippingStatus: { en: "pending", ar: "" },
    shippingMethod: "Express",
    shippingFee: 45.0,
    createdAt: "2024-01-15T10:30:00Z",
    history: [
      {
        action: "Shipping was created from order #SF-10000001",
        timestamp: "2024-01-15 10:30:00",
        by: "System",
      },
      {
        action: "Changed status of shipping to: Delivered",
        timestamp: "2024-01-20 12:00:00",
        by: "System",
      },
    ],
    shippingAmount: 0,
    status: { en: "Pending", ar: "" },
    codStatus: { en: "Pending", ar: "" },
  },
  {
    id: "2",
    orderId: "SF-10000002",
    customer: dummyCustomers[1],
    products: [...products.slice(2, 4)],
    shippingCompany: { en: "QuickShip", ar: "" },
    trackingId: "JJD0042730002",
    trackingLink: "https://tracking.quickship.com/JJD0042730002",
    estimateDateShipped: "2024-01-22",
    note: { en: "", ar: "" },
    shippingStatus: { en: "approved", ar: "" },
    shippingMethod: "Standard",
    shippingFee: 60.0,
    createdAt: "2024-01-16T14:20:00Z",
    history: [
      {
        action: "Shipping was created from order #SF-10000002",
        timestamp: "2024-01-16 14:20:00",
        by: "System",
      },
      {
        action: "Changed status of shipping to: Shipped",
        timestamp: "2024-01-22 09:15:00",
        by: "System",
      },
    ],
    shippingAmount: 0,
    status: { en: "Pending", ar: "" },
    codStatus: { en: "Pending", ar: "" },
  },
];

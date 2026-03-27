import { userType } from "@/types/next-auth";
import { User } from "next-auth";

export interface Order {
  id: string;
  status: "completed" | "cancelled" | "processing" | "shipped";
  paymentMethod: string;
  paymentStatus: string;
  date: string;
  time: string;
  productName: string;
  productImage: string;
  productBrand?: string;
  productDescription?: string;
  orderId: string;
  createdAt: number;
}


export interface SidebarItem {
  title: string;
  icon?: React.ReactNode;
  href: string;
  subItems?: SidebarItem[];
}
interface HeaderUser extends User {
  role: userType;
}

export interface ReturnItem {
  id: string;
  name: { en: string; ar: string };
  image: string;
  price: number;
  quantity: number;
  reason: { en: string; ar: string };
  status: {
    en: "Requested" | "Approved" | "In Transit" | "Delivered" | "Rejected";
    ar: string;
  };
  returnOption: { en: string; ar: string };
  refundAmount?: number;
  estimatedRefundDate?: string;
}

export interface ReturnOrder {
  id: string;
  orderId: string;
  date: string;
  items: ReturnItem[];
  status: {
    en: "Requested" | "Approved" | "In Transit" | "Delivered" | "Rejected";
    ar: string;
  };
  totalRefund: number;
  trackingNumber?: string;
  carrier?: string;
}

export interface AccountPageProps {
  user: HeaderUser;
  orders?: Order[];
  returns?: ReturnOrder[];
  activeSection?: string;
}

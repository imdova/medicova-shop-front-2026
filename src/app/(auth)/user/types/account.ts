import { userType } from "@/types/next-auth";
import { User } from "next-auth";

export interface Order {
  id: string;
  status: "completed" | "cancelled" | "processing" | "shipped";
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

export interface AccountPageProps {
  user: HeaderUser;
  orders?: Order[];
  activeSection?: string;
}

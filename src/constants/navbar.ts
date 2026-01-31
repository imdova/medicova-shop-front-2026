import { GroupNavLink } from "@/types";
import {
  Home,
  Grid,
  User,
  ShoppingCart,
  Package,
  Settings,
  Users,
  LayoutDashboard,
} from "lucide-react";

export const NavbarLinks: GroupNavLink = {
  user: [
    { name: { en: "Home", ar: "الرئيسية" }, path: "/", icon: Home },
    {
      name: { en: "Categories", ar: "الفئات" },
      path: "/categories",
      icon: Grid,
    },
    {
      name: { en: "Account", ar: "الحساب" },
      path: "/user/profile",
      icon: User,
    },
    { name: { en: "Cart", ar: "السلة" }, path: "/cart", icon: ShoppingCart },
  ],
  seller: [
    { name: { en: "Home", ar: "الرئيسية" }, path: "/", icon: Home },
    {
      name: { en: "Products", ar: "المنتجات" },
      path: "/seller/products",
      icon: Package,
    },
    {
      name: { en: "Dashboard", ar: "لوحة التحكم" },
      path: "/seller",
      icon: LayoutDashboard,
    },
    {
      name: { en: "Settings", ar: "الإعدادات" },
      path: "/seller/settings",
      icon: Settings,
    },
  ],
  admin: [
    {
      name: { en: "Dashboard", ar: "لوحة التحكم" },
      path: "/admin",
      icon: Home,
    },
    {
      name: { en: "Users", ar: "المستخدمين" },
      path: "/admin/users",
      icon: Users,
    },
    {
      name: { en: "Account", ar: "الحساب" },
      path: "/account/profile",
      icon: User,
    },
    {
      name: { en: "Settings", ar: "الإعدادات" },
      path: "/admin/settings",
      icon: Settings,
    },
  ],
};

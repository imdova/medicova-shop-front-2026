import { MenuGroup } from "@/types";
import { userType } from "@/types/next-auth";
import {
  Settings,
  Bookmark,
  Users,
  BarChart2,
  SendToBack,
  Undo2,
  Heart,
  UserRound as UserRoundPen,
  MapPin,
  WalletCards,
  Bell,
  Shield as ShieldUser,
  LayoutDashboard,
  Box,
} from "lucide-react";

export const menuGroups: { [key in userType]: MenuGroup[] } = {
  user: [
    {
      items: [
        {
          title: { en: "Orders", ar: "الطلبات" },
          href: "/user/orders",
          icon: SendToBack,
        },
        {
          title: { en: "Returns", ar: "المرتجعات" },
          href: "/user/returns",
          icon: Undo2,
        },
        {
          title: { en: "Wishlist", ar: "المفضلة" },
          href: "/wishlist",
          icon: Heart,
        },
      ],
    },
    {
      title: { en: "My Account", ar: "حسابي" },
      items: [
        {
          title: { en: "Profile", ar: "الملف الشخصي" },
          href: "/user/profile",
          icon: UserRoundPen,
        },
        {
          title: { en: "Addresses", ar: "العناوين" },
          href: "/user/addresses",
          icon: MapPin,
        },
        {
          title: { en: "Payments", ar: "طرق الدفع" },
          href: "/user/payments",
          icon: WalletCards,
        },
      ],
    },
    {
      title: { en: "Others", ar: "أخرى" },
      items: [
        {
          title: { en: "Notifications", ar: "الإشعارات" },
          href: "/user/notifications",
          icon: Bell,
        },
        {
          title: { en: "Security Settings", ar: "إعدادات الأمان" },
          href: "/user/security",
          icon: ShieldUser,
        },
      ],
    },
  ],
  seller: [
    {
      items: [
        {
          title: { en: "Dashboard", ar: "لوحة التحكم" },
          href: "/seller",
          icon: LayoutDashboard,
        },
        {
          title: { en: "Products", ar: "المنتجات" },
          href: "/seller/products",
          icon: Box,
        },
      ],
    },
    {
      title: { en: "My Account", ar: "حسابي" },
      items: [
        {
          title: { en: "Profile", ar: "الملف الشخصي" },
          href: "/seller/profile",
          icon: UserRoundPen,
        },
        {
          title: { en: "Addresses", ar: "العناوين" },
          href: "/seller/addresses",
          icon: MapPin,
        },
        {
          title: { en: "Payments", ar: "طرق الدفع" },
          href: "/seller/payments",
          icon: WalletCards,
        },
        {
          title: { en: "Wishlist", ar: "المفضلة" },
          href: "/wishlist",
          icon: Heart,
        },
      ],
    },
    {
      title: { en: "Others", ar: "أخرى" },
      items: [
        {
          title: { en: "Notifications", ar: "الإشعارات" },
          href: "/seller/notifications",
          icon: Bell,
        },
        {
          title: { en: "Security Settings", ar: "إعدادات الأمان" },
          href: "/seller/security",
          icon: ShieldUser,
        },
      ],
    },
  ],
  admin: [
    {
      title: { en: "Admin Dashboard", ar: "لوحة تحكم المشرف" },
      items: [
        {
          title: { en: "Dashboard", ar: "لوحة التحكم" },
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: { en: "User Management", ar: "إدارة المستخدمين" },
          href: "/admin/users",
          icon: Users,
        },
        {
          title: { en: "System Settings", ar: "إعدادات النظام" },
          href: "/admin/settings",
          icon: Settings,
        },
      ],
    },
    {
      title: { en: "Reports", ar: "التقارير" },
      items: [
        {
          title: { en: "Sales Analytics", ar: "تحليلات المبيعات" },
          href: "/admin/analytics",
          icon: BarChart2,
        },
        {
          title: { en: "Activity Logs", ar: "سجلات النشاط" },
          href: "/admin/logs",
          icon: Bookmark,
        },
      ],
    },
  ],
};

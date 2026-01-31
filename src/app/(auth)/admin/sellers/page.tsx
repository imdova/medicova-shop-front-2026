"use client";
import { TabWithIcon } from "@/components/UI/TabWithIcon";
import { Eye, List, Plus } from "lucide-react";
import OverviewPanel from "./panels/OverviewPanel";
import SellersListPanel from "./panels/SellersListPanel";
import { useState } from "react";
import AddSellerModal from "../components/AddSellerModal";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SellersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language, isArabic } = useLanguage();

  const tabs = [
    {
      label: isArabic ? "نظرة عامة على البائعين" : "Sellers Overview",
      icon: Eye,
      content: <OverviewPanel locale={language} />,
    },
    {
      label: isArabic ? "قائمة البائعين" : "Sellers List",
      icon: List,
      content: <SellersListPanel locale={language} />,
    },
  ];

  return (
    <main>
      <TabWithIcon
        leftbutton={
          <button
            className="flex w-full items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 lg:w-fit"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={15} />
            {isArabic ? "إضافة بائع جديد" : "Add New Seller"}
          </button>
        }
        tabs={tabs}
      />
      <AddSellerModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        locale={language}
      />
    </main>
  );
}

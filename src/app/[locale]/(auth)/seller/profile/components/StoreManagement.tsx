"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  Plus,
  Store,
  MapPin,
  Phone,
  Mail,
  Edit,
  Trash2,
  X,
  UploadCloud,
  ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

import DynamicButton from "@/components/shared/Buttons/DynamicButton";
import Modal from "@/components/shared/Modals/DynamicModal";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image?: string;
  createdAt: string;
}

export const StoreManagement = () => {
  const t = useTranslations("seller_profile.stores");
  const [stores, setStores] = useState<StoreItem[]>([
    {
      id: "1",
      name: "MediCove Main",
      description: "Our primary pharmacy outlet.",
      address: "123 Healthcare Ave, Cairo",
      phone: "+20 123 456 789",
      email: "main@medicove.com",
      image:
        "https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=800&auto=format&fit=crop",
      createdAt: "2023-10-01",
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);

  const handleOpenModal = (store: StoreItem | null = null) => {
    setEditingStore(store);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-black tracking-tight text-gray-900">
            {t("title")}
          </h2>
          <p className="text-sm font-medium text-gray-500">{t("subtitle")}</p>
        </div>
        <DynamicButton
          variant="primary"
          onClick={() => handleOpenModal()}
          label={t("addStore")}
          icon={<Plus size={18} strokeWidth={3} />}
          className="rounded-2xl bg-gray-900 px-8 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] hover:bg-black active:scale-[0.98]"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <motion.div
            key={store.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="hover:shadow-primary/5 group relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/70 p-6 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl transition-all"
          >
            <div className="mb-6 h-40 w-full overflow-hidden rounded-[2rem] bg-gray-100">
              {store.image ? (
                <Image
                  src={store.image}
                  alt={store.name}
                  width={400}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-400">
                  <Store size={48} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-gray-900">
                  {store.name}
                </h3>
                <p className="line-clamp-2 text-xs font-medium leading-relaxed text-gray-500">
                  {store.description}
                </p>
              </div>

              <div className="space-y-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-primary" />
                  <span className="truncate">{store.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-primary" />
                  <span>{store.phone}</span>
                </div>
              </div>
            </div>

            <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                onClick={() => handleOpenModal(store)}
                className="rounded-xl bg-white/90 p-2 text-gray-600 shadow-lg backdrop-blur-md transition-all hover:bg-white hover:text-black"
              >
                <Edit size={16} />
              </button>
              <button className="rounded-xl bg-rose-50/90 p-2 text-rose-500 shadow-lg backdrop-blur-md transition-all hover:bg-rose-500 hover:text-white">
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {stores.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-gray-100 py-20 text-center">
          <div className="mb-4 rounded-full bg-gray-50 p-6 text-gray-300">
            <Store size={48} />
          </div>
          <p className="max-w-xs text-sm font-bold text-gray-400">
            {t("empty")}
          </p>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <div className="p-8">
          <h2 className="mb-8 text-2xl font-black tracking-tight text-gray-900">
            {editingStore ? t("modal.edit") : t("modal.add")}
          </h2>
          {/* Modal Form Content would go here - keeping it concise for now */}
          <div className="flex justify-end gap-3 pt-6">
            <DynamicButton
              variant="outline"
              label={t("modal.cancel")}
              onClick={() => setIsModalOpen(false)}
              className="rounded-2xl px-6 py-3 font-black uppercase tracking-widest text-gray-400"
            />
            <DynamicButton
              variant="primary"
              label={editingStore ? t("modal.update") : t("modal.create")}
              className="rounded-2xl bg-gray-900 px-8 py-3 font-black uppercase tracking-widest text-white shadow-xl shadow-black/10"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

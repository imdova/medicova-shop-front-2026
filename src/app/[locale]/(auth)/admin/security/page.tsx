"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import {
  Shield,
  ShieldAlert,
  Key,
  Trash2,
  Smartphone,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import Modal from "@/components/shared/Modals/DynamicModal";
import { Button } from "@/components/shared/button";
import { Input } from "@/components/shared/input";

type PasswordFormInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function SecuritySettingsPage() {
  const t = useTranslations("admin");
  const locale = useAppLocale();
  const isRTL = locale === "ar";

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormInputs>();

  const onSubmit = (data: PasswordFormInputs) => {
    alert(t("save") + " " + t("success"));
    setShowPasswordModal(false);
    reset();
  };

  const handleAccountDeletion = () => {
    alert(t("accountDeletion") + " " + t("pending"));
    setShowDeleteConfirmation(false);
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-700">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-xl shadow-gray-200/50">
            <Shield className="text-emerald-500" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-gray-900">
              {t("securitySettings")}
            </h1>
            <p className="mt-1 font-medium text-gray-400">
              Advanced Security & Account Privacy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-emerald-500">
              <ShieldAlert size={10} />
              High Protection
            </span>
            <span className="mt-1 text-[10px] font-bold text-gray-400">
              Encryption: <span className="text-gray-900">AES-256 Enabled</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Password Card */}
        <div className="group relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-[0.99]">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-emerald-500/5 transition-transform duration-700 group-hover:scale-150" />

          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-inner transition-transform duration-500 group-hover:rotate-12">
              <Key size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">
                {t("changePassword")}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Credentials Management
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-6">
            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-tighter text-gray-400">
                Current Password
              </p>
              <p className="text-sm font-black tracking-[0.3em] text-gray-900">
                ••••••••
              </p>
            </div>
            <Button
              onClick={() => setShowPasswordModal(true)}
              variant="outline"
              className="h-10 rounded-xl border-emerald-100 px-6 font-bold text-emerald-600 transition-all hover:bg-emerald-50 active:scale-95"
            >
              {t("edit")}
            </Button>
          </div>
        </div>

        {/* Delete Account Card */}
        <div className="group relative overflow-hidden rounded-[32px] border border-white/60 bg-white/70 p-8 shadow-xl shadow-gray-200/40 backdrop-blur-xl transition-all duration-500 hover:shadow-2xl hover:shadow-rose-500/10 active:scale-[0.99]">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-rose-500/5 transition-transform duration-700 group-hover:scale-150" />

          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 shadow-inner transition-transform duration-500 group-hover:scale-110">
              <Trash2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-gray-900">
                {t("accountDeletion")}
              </h3>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Universal Account Access
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-100/50 bg-rose-50/30 p-6">
            <p className="mb-4 text-xs font-bold text-gray-400">
              {t("deleteNote")}
            </p>
            <Button
              onClick={() => setShowDeleteConfirmation(true)}
              className="h-11 w-full rounded-xl bg-rose-500 font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-[0.98]"
            >
              {t("deleteAccount")}
            </Button>
          </div>
        </div>
      </div>

      {/* Multi-Factor Authentication (Coming Soon / Stylized) */}
      <div className="shadow-3xl relative overflow-hidden rounded-[32px] border border-white/60 bg-indigo-900 p-10">
        <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-indigo-500/20 to-transparent" />
        <div className="relative z-10 flex flex-col justify-between gap-8 md:flex-row md:items-center">
          <div className="flex items-center gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-400/30 bg-indigo-500/20 text-indigo-200 ring-8 ring-indigo-500/10">
              <Smartphone size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">
                Multi-Factor Authentication
              </h3>
              <p className="mt-1 text-sm font-medium text-indigo-200/60">
                Enhance your login security with an extra layer of verification.
              </p>
            </div>
          </div>
          <button className="rounded-2xl bg-white px-8 py-3 text-sm font-black uppercase tracking-widest text-indigo-900 shadow-xl shadow-black/20 transition-all hover:scale-105 active:scale-95">
            Setup Now
          </button>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={t("changePassword")}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
              {t("currentPassword")}
            </label>
            <Input
              type="password"
              {...register("currentPassword", { required: true })}
              className="h-12 rounded-2xl border-none bg-gray-50 transition-all focus:ring-4 focus:ring-emerald-500/5"
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
              {t("newPassword")}
            </label>
            <Input
              type="password"
              {...register("newPassword", { required: true, minLength: 6 })}
              className="h-12 rounded-2xl border-none bg-gray-50 transition-all focus:ring-4 focus:ring-emerald-500/5"
            />
          </div>

          <div className="space-y-2">
            <label className="ml-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
              {t("confirmNewPassword")}
            </label>
            <Input
              type="password"
              {...register("confirmPassword", {
                required: true,
                validate: (v) => v === watch("newPassword"),
              })}
              className="h-12 rounded-2xl border-none bg-gray-50 transition-all focus:ring-4 focus:ring-emerald-500/5"
            />
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="h-12 flex-1 rounded-2xl border-gray-100 font-bold text-gray-400"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              className="h-12 flex-1 rounded-2xl bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-[0.98]"
            >
              {t("save")}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        title={t("accountDeletion")}
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-rose-100 bg-rose-50 text-rose-500 ring-8 ring-rose-50">
            <AlertTriangle size={40} />
          </div>
          <div>
            <h4 className="mb-2 text-lg font-black text-gray-900">
              {t("confirmDelete")}
            </h4>
            <p className="px-4 text-xs font-medium text-gray-400">
              This action is permanent and will remove all your data from our
              servers.
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={() => setShowDeleteConfirmation(false)}
              variant="outline"
              className="h-12 flex-1 rounded-2xl border-gray-100 font-bold text-gray-400"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleAccountDeletion}
              className="h-12 flex-1 rounded-2xl bg-rose-500 font-bold text-white shadow-lg shadow-rose-500/20 transition-all hover:bg-rose-600 active:scale-[0.98]"
            >
              {t("confirm")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

"use client";

import Modal from "@/components/shared/Modals/DynamicModal";
import { useAppLocale } from "@/hooks/useAppLocale";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { updateMyPassword } from "@/services/userService";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type PasswordFormInputs = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const translations = {
  en: {
    title: "Security Settings",
    sectionTitle: "Security",
    password: "Password",
    changePassword: "CHANGE PASSWORD",
    accountDeletion: "Account Deletion",
    confirmDeleteMsg:
      "Are you sure you want to delete your account? This action cannot be undone.",
    deleteBtn: "Delete your account",
    cancelBtn: "Cancel",
    confirmBtn: "Confirm Deletion",
    deleteNote: "We are sad to see you go, but hope to see you again!",
    changePasswordTitle: "Change Password",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm New Password",
    saveChanges: "Save Changes",
    errors: {
      current: "Current password is required",
      new: "New password is required",
      newLength: "Password must be at least 8 characters",
      newComplexity: "Password must contain uppercase, lowercase, number, and special character",
      confirm: "Please confirm your new password",
      mismatch: "Passwords do not match",
    },
  },
  ar: {
    title: "إعدادات الأمان",
    sectionTitle: "الأمان",
    password: "كلمة المرور",
    changePassword: "تغيير كلمة المرور",
    accountDeletion: "حذف الحساب",
    confirmDeleteMsg:
      "هل أنت متأكد أنك تريد حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء.",
    deleteBtn: "احذف حسابك",
    cancelBtn: "إلغاء",
    confirmBtn: "تأكيد الحذف",
    deleteNote: "نأسف لرؤيتك تغادر، ونأمل أن نراك مجددًا!",
    changePasswordTitle: "تغيير كلمة المرور",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور الجديدة",
    saveChanges: "حفظ التغييرات",
    errors: {
      current: "كلمة المرور الحالية مطلوبة",
      new: "كلمة المرور الجديدة مطلوبة",
      newLength: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
      newComplexity: "يجب أن تحتوي كلمة المرور على حرف كبير، حرف صغير، رقم ورمز خاص",
      confirm: "يرجى تأكيد كلمة المرور الجديدة",
      mismatch: "كلمتا المرور غير متطابقتين",
    },
  },
};

const SecuritySettingsPage = () => {
  const locale = useAppLocale();
  const t = translations[locale];
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PasswordFormInputs>();

  const onSubmit = async (data: PasswordFormInputs) => {
    if (!token) return;
    try {
      setLoading(true);
      await updateMyPassword({ 
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmPassword
      }, token);
      
      toast.success(locale === "ar" ? "تم تغيير كلمة المرور بنجاح" : "Password changed successfully");
      setShowPasswordModal(false);
      reset();
    } catch (err: any) {
      toast.error(err.message || (locale === "ar" ? "حدث خطأ ما" : "An error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const handleAccountDeletion = () => {
    window.alert("Account deletion request submitted");
    setShowDeleteConfirmation(false);
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">{t.title}</h1>
      </div>

      <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {t.sectionTitle}
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{t.password}</p>
            <p className="text-sm text-gray-500">••••••••</p>
          </div>
          <button
            onClick={() => setShowPasswordModal(true)}
            className="rounded-md bg-green-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-green-700"
          >
            {t.changePassword}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-800">
          {t.accountDeletion}
        </h2>
        {!showDeleteConfirmation ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-gray-600">{t.deleteNote}</p>
            <button
              onClick={() => setShowDeleteConfirmation(true)}
              className="mt-4 rounded-md bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-700 sm:mt-0"
            >
              {t.deleteBtn}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">{t.confirmDeleteMsg}</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                {t.cancelBtn}
              </button>
              <button
                onClick={handleAccountDeletion}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                {t.confirmBtn}
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={t.changePasswordTitle}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.currentPassword}
            </label>
            <input
              type="password"
              {...register("currentPassword", {
                required: t.errors.current,
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.newPassword}
            </label>
            <input
              type="password"
              {...register("newPassword", {
                required: t.errors.new,
                minLength: { value: 8, message: t.errors.newLength },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                  message: t.errors.newComplexity,
                }
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            {errors.newPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              {t.confirmPassword}
            </label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: t.errors.confirm,
                validate: (value) =>
                  value === watch("newPassword") || t.errors.mismatch,
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/20"
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setShowPasswordModal(false);
                reset();
              }}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {t.cancelBtn}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-md bg-green-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.saveChanges}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};

export default SecuritySettingsPage;

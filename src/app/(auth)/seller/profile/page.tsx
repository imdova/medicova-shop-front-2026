"use client";

import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useLanguage } from "@/contexts/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/UI/Tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/UI/dialog";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Button } from "@/components/UI/button";
import { UploadCloud, X, Image as ImageIcon, CheckCircle2, XCircle, Clock } from "lucide-react";
import Image from "next/image";
import { CountryDropdown } from "@/components/UI/CountryDropdown";
import Dropdown from "@/components/UI/DropDownMenu";
import PhoneInput from "@/components/Forms/formFields/PhoneInput";
import { User, Store, Settings, ShieldCheck, Shield, Plus, Edit, Trash2, MapPin, Phone, Mail } from "lucide-react";
import { PasswordInput } from "@/components/UI/input";
import { Country } from "@/types";

// Constants for countries and cities (you can move these to a constants file)
const DEFAULT_COUNTRIES: Country[] = [
  { id: "SA", code: "sa", name: { en: "Saudi Arabia", ar: "السعودية" } },
  { id: "AE", code: "ae", name: { en: "United Arab Emirates", ar: "الإمارات" } },
  { id: "EG", code: "eg", name: { en: "Egypt", ar: "مصر" } },
  { id: "JO", code: "jo", name: { en: "Jordan", ar: "الأردن" } },
  { id: "KW", code: "kw", name: { en: "Kuwait", ar: "الكويت" } },
  { id: "QA", code: "qa", name: { en: "Qatar", ar: "قطر" } },
  { id: "BH", code: "bh", name: { en: "Bahrain", ar: "البحرين" } },
  { id: "OM", code: "om", name: { en: "Oman", ar: "عُمان" } },
  { id: "US", code: "us", name: { en: "United States", ar: "الولايات المتحدة" } },
  { id: "GB", code: "gb", name: { en: "United Kingdom", ar: "المملكة المتحدة" } },
];

const EGYPT_CITIES = [
  { id: "EG-cairo", name: { en: "Cairo", ar: "القاهرة" } },
  { id: "EG-alex", name: { en: "Alexandria", ar: "الإسكندرية" } },
  { id: "EG-giza", name: { en: "Giza", ar: "الجيزة" } },
  { id: "EG-mansoura", name: { en: "Mansoura", ar: "المنصورة" } },
  { id: "EG-tanta", name: { en: "Tanta", ar: "طنطا" } },
];

interface ProfileFormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  image: FileList;
}

interface SettingsFormData {
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface VerificationFormData {
  phoneCode: string;
  emailCode: string;
  idFront: FileList;
  idBack: FileList;
}

interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image?: string;
  createdAt: string;
}

interface StoreFormData {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  image: FileList;
}

const translations = {
  profile: { en: "Profile", ar: "الملف الشخصي" },
  stores: { en: "Stores", ar: "المتاجر" },
  settings: { en: "Settings", ar: "الإعدادات" },
  verification: { en: "Verification", ar: "التحقق" },
  fullName: { en: "Full Name", ar: "الاسم الكامل" },
  email: { en: "Email", ar: "البريد الإلكتروني" },
  phone: { en: "Phone Number", ar: "رقم الهاتف" },
  country: { en: "Country", ar: "الدولة" },
  state: { en: "State", ar: "الولاية/المحافظة" },
  city: { en: "City", ar: "المدينة" },
  profileImage: { en: "Profile Image", ar: "صورة الملف الشخصي" },
  save: { en: "Save Changes", ar: "حفظ التغييرات" },
  saving: { en: "Saving...", ar: "جاري الحفظ..." },
  required: { en: "is required", ar: "مطلوب" },
  minLength: { en: "Minimum 2 characters", ar: "الحد الأدنى حرفان" },
  // Settings translations
  loginInformation: { en: "Login Information", ar: "معلومات تسجيل الدخول" },
  updateEmailPhone: { en: "Update your email address and phone number", ar: "قم بتحديث عنوان بريدك الإلكتروني ورقم هاتفك" },
  emailHint: { en: "This email is used for login and notifications.", ar: "يستخدم هذا البريد الإلكتروني لتسجيل الدخول والإشعارات." },
  updateEmail: { en: "Update Email", ar: "تحديث البريد الإلكتروني" },
  passwordManagement: { en: "Password Management", ar: "إدارة كلمة المرور" },
  updatePasswordAuth: { en: "Update your password or enable two-factor authentication", ar: "قم بتحديث كلمة المرور أو تفعيل المصادقة الثنائية" },
  currentPassword: { en: "Current Password", ar: "كلمة المرور الحالية" },
  newPassword: { en: "New Password", ar: "كلمة المرور الجديدة" },
  confirmPassword: { en: "Confirm Password", ar: "تأكيد كلمة المرور" },
  updatePassword: { en: "Update Password", ar: "تحديث كلمة المرور" },
  passwordRequirements: { en: "Password Requirements", ar: "متطلبات كلمة المرور" },
  req8Chars: { en: "At least 8 characters long", ar: "8 أحرف على الأقل" },
  reqUppercase: { en: "Contains at least one uppercase letter", ar: "يحتوي على حرف كبير واحد على الأقل" },
  reqLowercase: { en: "Contains at least one lowercase letter", ar: "يحتوي على حرف صغير واحد على الأقل" },
  reqNumber: { en: "Contains at least one number", ar: "يحتوي على رقم واحد على الأقل" },
  reqSpecial: { en: "Contains at least one special character", ar: "يحتوي على حرف خاص واحد على الأقل" },
  // Verification translations
  verifyPhone: { en: "Verify Phone Number", ar: "التحقق من رقم الهاتف" },
  verifyEmail: { en: "Verify Email", ar: "التحقق من البريد الإلكتروني" },
  uploadGovernmentID: { en: "Upload Government ID", ar: "تحميل بطاقة الهوية الحكومية" },
  phoneVerification: { en: "Phone Verification", ar: "التحقق من الهاتف" },
  emailVerification: { en: "Email Verification", ar: "التحقق من البريد الإلكتروني" },
  governmentID: { en: "Government ID", ar: "بطاقة الهوية الحكومية" },
  sendCode: { en: "Send Verification Code", ar: "إرسال رمز التحقق" },
  verifying: { en: "Verifying...", ar: "جاري التحقق..." },
  verificationCode: { en: "Verification Code", ar: "رمز التحقق" },
  enterCode: { en: "Enter the verification code", ar: "أدخل رمز التحقق" },
  verify: { en: "Verify", ar: "تحقق" },
  verified: { en: "Verified", ar: "تم التحقق" },
  notVerified: { en: "Not Verified", ar: "غير محقق" },
  pending: { en: "Pending", ar: "قيد الانتظار" },
  uploadID: { en: "Upload Government ID", ar: "تحميل بطاقة الهوية" },
  idHint: { en: "Upload a clear image of your government-issued ID (front and back)", ar: "قم بتحميل صورة واضحة لبطاقة الهوية الصادرة عن الحكومة (الوجه الأمامي والخلفي)" },
  idFront: { en: "ID Front Side", ar: "الوجه الأمامي للهوية" },
  idBack: { en: "ID Back Side", ar: "الوجه الخلفي للهوية" },
  // Stores translations
  addStore: { en: "Add Store", ar: "إضافة متجر" },
  editStore: { en: "Edit Store", ar: "تعديل المتجر" },
  deleteStore: { en: "Delete Store", ar: "حذف المتجر" },
  storeName: { en: "Store Name", ar: "اسم المتجر" },
  storeDescription: { en: "Store Description", ar: "وصف المتجر" },
  storeAddress: { en: "Store Address", ar: "عنوان المتجر" },
  storePhone: { en: "Store Phone", ar: "هاتف المتجر" },
  storeEmail: { en: "Store Email", ar: "بريد المتجر الإلكتروني" },
  storeImage: { en: "Store Image", ar: "صورة المتجر" },
  noStores: { en: "No stores yet. Add your first store!", ar: "لا توجد متاجر بعد. أضف متجرك الأول!" },
  confirmDelete: { en: "Are you sure you want to delete this store?", ar: "هل أنت متأكد من حذف هذا المتجر؟" },
  cancel: { en: "Cancel", ar: "إلغاء" },
  delete: { en: "Delete", ar: "حذف" },
  create: { en: "Create", ar: "إنشاء" },
  update: { en: "Update", ar: "تحديث" },
  creating: { en: "Creating...", ar: "جاري الإنشاء..." },
  updating: { en: "Updating...", ar: "جاري التحديث..." },
};

const ProfilePage: React.FC = () => {
  const { language: locale, direction } = useLanguage();
  const { data: session } = useSession();
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const safeUser = {
    id: session?.user?.id || "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    image: session?.user?.image || "",
    role: session?.user?.role,
  };

  const [previewImage, setPreviewImage] = useState<string | null>(safeUser.image || null);

  const t = (key: keyof typeof translations) => translations[key][locale];

  // Handle image change for circular uploader
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert(locale === "ar" ? "الرجاء تحميل ملف صورة" : "Please upload an image file");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(locale === "ar" ? "يجب أن يكون حجم الصورة أقل من 2 ميجابايت" : "Image size should be less than 2MB");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setPreviewImage(previewUrl);
    }
  };

  const removeImage = () => {
    if (previewImage && previewImage.startsWith("blob:")) {
      URL.revokeObjectURL(previewImage);
    }
    setPreviewImage(null);
    const input = document.getElementById("profile-image") as HTMLInputElement | null;
    if (input) input.value = "";
  };

  const methods = useForm<ProfileFormData>({
    defaultValues: {
      fullName: safeUser.name || "",
      email: safeUser.email || "",
      phone: "",
      country: "",
      state: "",
      city: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);
    try {
      console.log("Form Data:", data);
      // TODO: Call API to update profile
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      alert(
        locale === "ar"
          ? "تم تحديث الملف الشخصي بنجاح!"
          : "Profile updated successfully!",
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(
        locale === "ar"
          ? "حدث خطأ أثناء تحديث الملف الشخصي"
          : "Error updating profile",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Profile Tab Content
  const ProfileTabContent = () => (
    <FormProvider {...methods}>
      <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
        {/* Profile Image Upload - Circular */}
        <div className="flex flex-col items-center">
          <Label className="mb-2 text-sm font-medium text-gray-700">
            {t("profileImage")}
          </Label>
          <div className="relative">
            <label
              htmlFor="profile-image"
              className={`group relative flex h-32 w-32 cursor-pointer items-center justify-center rounded-full border-2 border-dashed transition-all ${
                previewImage
                  ? "border-transparent"
                  : isDragging
                    ? "border-green-600 bg-green-50"
                    : "border-gray-300 hover:border-green-600"
              } ${errors.image ? "border-red-500" : ""}`}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) {
                  if (!file.type.startsWith("image/")) {
                    alert(locale === "ar" ? "الرجاء تحميل ملف صورة" : "Please upload an image file");
                    return;
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    alert(locale === "ar" ? "يجب أن يكون حجم الصورة أقل من 2 ميجابايت" : "Image size should be less than 2MB");
                    return;
                  }
                  const previewUrl = URL.createObjectURL(file);
                  setPreviewImage(previewUrl);
                }
              }}
            >
              {previewImage ? (
                <>
                  <div className="relative h-32 w-32 overflow-hidden rounded-full">
                    <Image
                      width={128}
                      height={128}
                      src={previewImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <UploadCloud className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      removeImage();
                    }}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all hover:bg-red-600"
                    aria-label={locale === "ar" ? "إزالة الصورة" : "Remove image"}
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="mb-2 rounded-full bg-gray-100 p-4 text-gray-500 transition-all group-hover:bg-green-100 group-hover:text-green-600">
                    {isDragging ? <UploadCloud size={24} /> : <ImageIcon size={24} />}
                  </div>
                  <p className="text-xs text-gray-500">
                    {locale === "ar" ? "انقر للتحميل" : "Click to upload"}
                  </p>
                </div>
              )}
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                className="sr-only"
                {...register("image", {
                  onChange: handleImageChange,
                })}
              />
            </label>
          </div>
          {errors.image && (
            <p className="mt-2 text-sm text-red-500">{errors.image.message}</p>
          )}
        </div>

        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">{t("fullName")}</Label>
          <Input
            id="fullName"
            type="text"
            placeholder={locale === "ar" ? "أدخل الاسم الكامل" : "Enter your full name"}
            {...register("fullName", {
              required: `${t("fullName")} ${t("required")}`,
              minLength: {
                value: 2,
                message: t("minLength"),
              },
            })}
            className="w-full"
          />
          {errors.fullName && (
            <p className="text-sm text-red-500">{errors.fullName.message}</p>
          )}
        </div>

        {/* Email and Phone Number in One Row */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={locale === "ar" ? "أدخل البريد الإلكتروني" : "Enter your email"}
              {...register("email", {
                required: `${t("email")} ${t("required")}`,
              })}
              className="w-full"
              disabled
            />
            <p className="text-xs text-gray-500">
              {locale === "ar"
                ? "لا يمكن تغيير البريد الإلكتروني"
                : "Email cannot be changed"}
            </p>
          </div>

          {/* Phone Number */}
          <div className="space-y-2">
            {/* <Label htmlFor="phone">{t("phone")}</Label> */}
            <PhoneInput
              name="phone"
              required
              defaultValue=""
              locale={locale}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            {locale === "ar" ? "العنوان" : "Address"}
          </h3>

          {/* Address Fields in One Row */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country">{t("country")}</Label>
              <Controller
                name="country"
                control={control}
                rules={{ required: `${t("country")} ${t("required")}` }}
                render={({ field }) => (
                  <CountryDropdown
                    options={DEFAULT_COUNTRIES}
                    selected={field.value || ""}
                    onSelect={field.onChange}
                    locale={locale}
                  />
                )}
              />
              {errors.country && (
                <p className="text-sm text-red-500">{errors.country.message}</p>
              )}
            </div>

            {/* State */}
            <div className="space-y-2">
              <Label htmlFor="state">{t("state")}</Label>
              <Input
                id="state"
                type="text"
                placeholder={locale === "ar" ? "أدخل الولاية/المحافظة" : "Enter state/province"}
                {...register("state", {
                  required: `${t("state")} ${t("required")}`,
                })}
                className="w-full"
              />
              {errors.state && (
                <p className="text-sm text-red-500">{errors.state.message}</p>
              )}
            </div>

            {/* City */}
            <div className="space-y-2">
              <Label htmlFor="city">{t("city")}</Label>
              <Controller
                name="city"
                control={control}
                rules={{ required: `${t("city")} ${t("required")}` }}
                render={({ field }) => (
                  <Dropdown
                    options={EGYPT_CITIES}
                    selected={field.value || ""}
                    onSelect={field.onChange}
                    locale={locale}
                    placeholder={locale === "ar" ? "اختر المدينة" : "Select city"}
                  />
                )}
              />
              {errors.city && (
                <p className="text-sm text-red-500">{errors.city.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? t("saving") : t("save")}
          </Button>
        </div>
        </form>
      </div>
    </FormProvider>
  );

  // Stores Tab Content
  const StoresTabContent = () => {
    const [stores, setStores] = useState<Store[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStore, setEditingStore] = useState<Store | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [storeImagePreview, setStoreImagePreview] = useState<string | null>(null);

    const storeMethods = useForm<StoreFormData>({
      defaultValues: {
        name: "",
        description: "",
        address: "",
        phone: "",
        email: "",
      },
    });

    const {
      register: registerStore,
      handleSubmit: handleSubmitStore,
      formState: { errors: storeErrors },
      reset: resetStoreForm,
      watch: watchStore,
    } = storeMethods;

    // Watch image to show preview
    const imageFile = watchStore("image");

    React.useEffect(() => {
      if (imageFile && imageFile.length > 0) {
        const file = imageFile[0];
        if (file.type.startsWith("image/")) {
          const previewUrl = URL.createObjectURL(file);
          setStoreImagePreview(previewUrl);
        }
      } else if (editingStore?.image) {
        setStoreImagePreview(editingStore.image);
      } else {
        setStoreImagePreview(null);
      }
    }, [imageFile, editingStore]);

    const openAddDialog = () => {
      setEditingStore(null);
      resetStoreForm();
      setStoreImagePreview(null);
      setIsDialogOpen(true);
    };

    const openEditDialog = (store: Store) => {
      setEditingStore(store);
      resetStoreForm({
        name: store.name,
        description: store.description,
        address: store.address,
        phone: store.phone,
        email: store.email,
      });
      setStoreImagePreview(store.image || null);
      setIsDialogOpen(true);
    };

    const closeDialog = () => {
      setIsDialogOpen(false);
      setEditingStore(null);
      resetStoreForm();
      setStoreImagePreview(null);
    };

    const handleCreateStore = async (data: StoreFormData) => {
      try {
        // TODO: Call API to create store
        console.log("Creating store:", data);
        const newStore: Store = {
          id: Date.now().toString(),
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          image: storeImagePreview || undefined,
          createdAt: new Date().toISOString(),
        };
        setStores([...stores, newStore]);
        closeDialog();
        alert(
          locale === "ar"
            ? "تم إنشاء المتجر بنجاح"
            : "Store created successfully!",
        );
      } catch (error) {
        console.error("Error creating store:", error);
        alert(
          locale === "ar"
            ? "حدث خطأ أثناء إنشاء المتجر"
            : "Error creating store",
        );
      }
    };

    const handleUpdateStore = async (data: StoreFormData) => {
      if (!editingStore) return;
      try {
        // TODO: Call API to update store
        console.log("Updating store:", editingStore.id, data);
        setStores(
          stores.map((store) =>
            store.id === editingStore.id
              ? {
                  ...store,
                  name: data.name,
                  description: data.description,
                  address: data.address,
                  phone: data.phone,
                  email: data.email,
                  image: storeImagePreview || store.image,
                }
              : store,
          ),
        );
        closeDialog();
        alert(
          locale === "ar"
            ? "تم تحديث المتجر بنجاح"
            : "Store updated successfully!",
        );
      } catch (error) {
        console.error("Error updating store:", error);
        alert(
          locale === "ar"
            ? "حدث خطأ أثناء تحديث المتجر"
            : "Error updating store",
        );
      }
    };

    const handleDeleteStore = async (storeId: string) => {
      if (!confirm(t("confirmDelete"))) return;
      setIsDeleting(storeId);
      try {
        // TODO: Call API to delete store
        console.log("Deleting store:", storeId);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setStores(stores.filter((store) => store.id !== storeId));
        alert(
          locale === "ar"
            ? "تم حذف المتجر بنجاح"
            : "Store deleted successfully!",
        );
      } catch (error) {
        console.error("Error deleting store:", error);
        alert(
          locale === "ar"
            ? "حدث خطأ أثناء حذف المتجر"
            : "Error deleting store",
        );
      } finally {
        setIsDeleting(null);
      }
    };

    return (
      <div className="space-y-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{t("stores")}</h2>
            <p className="mt-1 text-sm text-gray-500">
              {locale === "ar"
                ? "إدارة متاجرك وإضافة متاجر جديدة"
                : "Manage your stores and add new ones"}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={openAddDialog}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("addStore")}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingStore ? t("editStore") : t("addStore")}
                </DialogTitle>
              </DialogHeader>
              <FormProvider {...storeMethods}>
                <form
                  onSubmit={handleSubmitStore(
                    editingStore ? handleUpdateStore : handleCreateStore,
                  )}
                  className="space-y-4"
                >
                  {/* Store Image */}
                  <div className="space-y-2">
                    <Label>{t("storeImage")}</Label>
                    <label
                      htmlFor="storeImage"
                      className={`group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                        storeImagePreview
                          ? "border-transparent"
                          : "border-gray-300 hover:border-green-600"
                      }`}
                    >
                      {storeImagePreview ? (
                        <>
                          <div className="relative h-full w-full overflow-hidden rounded-lg">
                            <Image
                              width={300}
                              height={200}
                              src={storeImagePreview}
                              alt="Store preview"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                              <UploadCloud className="h-6 w-6 text-white" />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (storeImagePreview.startsWith("blob:")) {
                                URL.revokeObjectURL(storeImagePreview);
                              }
                              setStoreImagePreview(null);
                              const input = document.getElementById("storeImage") as HTMLInputElement | null;
                              if (input) input.value = "";
                            }}
                            className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center px-4 text-center">
                          <div className="mb-2 rounded-full bg-gray-100 p-4 text-gray-500 transition-all group-hover:bg-green-100 group-hover:text-green-600">
                            <ImageIcon size={24} />
                          </div>
                          <p className="text-xs text-gray-500">
                            {locale === "ar" ? "انقر للتحميل" : "Click to upload"}
                          </p>
                        </div>
                      )}
                      <input
                        id="storeImage"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        {...registerStore("image")}
                      />
                    </label>
                  </div>

                  {/* Store Name */}
                  <div className="space-y-2">
                    <Label htmlFor="storeName">{t("storeName")}</Label>
                    <Input
                      id="storeName"
                      type="text"
                      placeholder={locale === "ar" ? "أدخل اسم المتجر" : "Enter store name"}
                      {...registerStore("name", {
                        required: `${t("storeName")} ${t("required")}`,
                        minLength: {
                          value: 2,
                          message: t("minLength"),
                        },
                      })}
                      className="w-full"
                    />
                    {storeErrors.name && (
                      <p className="text-sm text-red-500">
                        {storeErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Store Description */}
                  <div className="space-y-2">
                    <Label htmlFor="storeDescription">
                      {t("storeDescription")}
                    </Label>
                    <textarea
                      id="storeDescription"
                      rows={4}
                      placeholder={locale === "ar" ? "أدخل وصف المتجر" : "Enter store description"}
                      {...registerStore("description", {
                        required: `${t("storeDescription")} ${t("required")}`,
                      })}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none focus:ring-1 focus:ring-green-600"
                    />
                    {storeErrors.description && (
                      <p className="text-sm text-red-500">
                        {storeErrors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Store Address */}
                  <div className="space-y-2">
                    <Label htmlFor="storeAddress">{t("storeAddress")}</Label>
                    <Input
                      id="storeAddress"
                      type="text"
                      placeholder={locale === "ar" ? "أدخل عنوان المتجر" : "Enter store address"}
                      {...registerStore("address", {
                        required: `${t("storeAddress")} ${t("required")}`,
                      })}
                      className="w-full"
                    />
                    {storeErrors.address && (
                      <p className="text-sm text-red-500">
                        {storeErrors.address.message}
                      </p>
                    )}
                  </div>

                  {/* Store Phone and Email in one row */}
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {/* Store Phone */}
                    <div className="space-y-2">
                      <Label htmlFor="storePhone">{t("storePhone")}</Label>
                      <Input
                        id="storePhone"
                        type="tel"
                        placeholder={locale === "ar" ? "أدخل رقم الهاتف" : "Enter phone number"}
                        {...registerStore("phone", {
                          required: `${t("storePhone")} ${t("required")}`,
                        })}
                        className="w-full"
                      />
                      {storeErrors.phone && (
                        <p className="text-sm text-red-500">
                          {storeErrors.phone.message}
                        </p>
                      )}
                    </div>

                    {/* Store Email */}
                    <div className="space-y-2">
                      <Label htmlFor="storeEmail">{t("storeEmail")}</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        placeholder={locale === "ar" ? "أدخل البريد الإلكتروني" : "Enter email address"}
                        {...registerStore("email", {
                          required: `${t("storeEmail")} ${t("required")}`,
                        })}
                        className="w-full"
                      />
                      {storeErrors.email && (
                        <p className="text-sm text-red-500">
                          {storeErrors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                    >
                      {t("cancel")}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {editingStore ? t("update") : t("create")}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stores Grid */}
        {stores.length === 0 ? (
          <div className="rounded-lg border border-gray-300 bg-white p-12 text-center shadow-sm">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-600">
              {t("noStores")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <div
                key={store.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                {/* Store Image */}
                {store.image && (
                  <div className="relative h-48 w-full overflow-hidden">
                    <Image
                      width={400}
                      height={200}
                      src={store.image}
                      alt={store.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Store Content */}
                <div className="p-6">
                  <div className="mb-2 flex items-start justify-between">
                    <h3 className="text-xl font-bold text-gray-800">
                      {store.name}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditDialog(store)}
                        className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-green-600"
                        title={t("editStore")}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStore(store.id)}
                        disabled={isDeleting === store.id}
                        className="rounded-full p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-red-600 disabled:opacity-50"
                        title={t("deleteStore")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                    {store.description}
                  </p>

                  {/* Store Details */}
                  <div className="space-y-2 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="line-clamp-1">{store.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{store.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="line-clamp-1">{store.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Settings Tab Content
  const SettingsTabContent = () => {
    const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    const settingsMethods = useForm<SettingsFormData>({
      defaultValues: {
        email: safeUser.email || "",
        phone: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    });

    const {
      register: registerSettings,
      handleSubmit: handleSubmitSettings,
      formState: { errors: settingsErrors },
      watch,
    } = settingsMethods;

    const newPassword = watch("newPassword");

    const handleUpdateEmail = async (data: { email: string; phone: string }) => {
      setIsUpdatingEmail(true);
      try {
        console.log("Update email/phone:", data);
        // TODO: Call API to update email/phone
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert(
          locale === "ar"
            ? "تم تحديث البريد الإلكتروني ورقم الهاتف بنجاح!"
            : "Email and phone updated successfully!",
        );
      } catch (error) {
        console.error("Error updating email/phone:", error);
        alert(
          locale === "ar"
            ? "حدث خطأ أثناء التحديث"
            : "Error updating email/phone",
        );
      } finally {
        setIsUpdatingEmail(false);
      }
    };

    const handleUpdatePassword = async (data: SettingsFormData) => {
      if (data.newPassword !== data.confirmPassword) {
        alert(
          locale === "ar"
            ? "كلمات المرور غير متطابقة"
            : "Passwords do not match",
        );
        return;
      }
      setIsUpdatingPassword(true);
      try {
        console.log("Update password");
        // TODO: Call API to update password
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert(
          locale === "ar"
            ? "تم تحديث كلمة المرور بنجاح!"
            : "Password updated successfully!",
        );
        settingsMethods.reset({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } catch (error) {
        console.error("Error updating password:", error);
        alert(
          locale === "ar"
            ? "حدث خطأ أثناء تحديث كلمة المرور"
            : "Error updating password",
        );
      } finally {
        setIsUpdatingPassword(false);
      }
    };

    return (
      <FormProvider {...settingsMethods}>
        <div className="space-y-6">
          {/* Login Information Section */}
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {t("loginInformation")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("updateEmailPhone")}
              </p>
            </div>

            <form
              onSubmit={handleSubmitSettings((data) =>
                handleUpdateEmail({ email: data.email, phone: data.phone }),
              )}
              className="space-y-4"
            >
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="settings-email">{t("email")}</Label>
                <Input
                  id="settings-email"
                  type="email"
                  placeholder={locale === "ar" ? "أدخل البريد الإلكتروني" : "Enter your email"}
                  {...registerSettings("email", {
                    required: `${t("email")} ${t("required")}`,
                  })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">{t("emailHint")}</p>
                {settingsErrors.email && (
                  <p className="text-sm text-red-500">
                    {settingsErrors.email.message}
                  </p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <PhoneInput
                  name="phone"
                  required={false}
                  defaultValue=""
                  locale={locale}
                />
              </div>

              {/* Update Email Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingEmail}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUpdatingEmail
                    ? locale === "ar"
                      ? "جاري التحديث..."
                      : "Updating..."
                    : t("updateEmail")}
                </Button>
              </div>
            </form>
          </div>

          {/* Password Management Section */}
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-800">
                {t("passwordManagement")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("updatePasswordAuth")}
              </p>
            </div>

            <form
              onSubmit={handleSubmitSettings(handleUpdatePassword)}
              className="space-y-4"
            >
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                <PasswordInput
                  id="currentPassword"
                  placeholder={locale === "ar" ? "كلمة المرور" : "Password"}
                  {...registerSettings("currentPassword", {
                    required: `${t("currentPassword")} ${t("required")}`,
                  })}
                  className="w-full"
                />
                {settingsErrors.currentPassword && (
                  <p className="text-sm text-red-500">
                    {settingsErrors.currentPassword.message}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">{t("newPassword")}</Label>
                <PasswordInput
                  id="newPassword"
                  placeholder={locale === "ar" ? "كلمة المرور" : "Password"}
                  {...registerSettings("newPassword", {
                    required: `${t("newPassword")} ${t("required")}`,
                    minLength: {
                      value: 8,
                      message:
                        locale === "ar"
                          ? "يجب أن تكون كلمة المرور 8 أحرف على الأقل"
                          : "Password must be at least 8 characters",
                    },
                  })}
                  className="w-full"
                />
                {settingsErrors.newPassword && (
                  <p className="text-sm text-red-500">
                    {settingsErrors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder={locale === "ar" ? "كلمة المرور" : "Password"}
                  {...registerSettings("confirmPassword", {
                    required: `${t("confirmPassword")} ${t("required")}`,
                    validate: (value) =>
                      value === newPassword ||
                      (locale === "ar"
                        ? "كلمات المرور غير متطابقة"
                        : "Passwords do not match"),
                  })}
                  className="w-full"
                />
                {settingsErrors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {settingsErrors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Update Password Button */}
              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUpdatingPassword
                    ? locale === "ar"
                      ? "جاري التحديث..."
                      : "Updating..."
                    : t("updatePassword")}
                </Button>
              </div>
            </form>

            {/* Password Requirements */}
            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-800">
                  {t("passwordRequirements")}
                </h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{t("req8Chars")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{t("reqUppercase")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{t("reqLowercase")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{t("reqNumber")}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>{t("reqSpecial")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </FormProvider>
    );
  };

  // Verification Tab Content
  const VerificationTabContent = () => {
    const [phoneVerified, setPhoneVerified] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [idVerified, setIdVerified] = useState(false);
    const [phoneCodeSent, setPhoneCodeSent] = useState(false);
    const [emailCodeSent, setEmailCodeSent] = useState(false);
    const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isUploadingID, setIsUploadingID] = useState(false);
    const [idFrontPreview, setIdFrontPreview] = useState<string | null>(null);
    const [idBackPreview, setIdBackPreview] = useState<string | null>(null);

    const verificationMethods = useForm<VerificationFormData>({
      defaultValues: {
        phoneCode: "",
        emailCode: "",
      },
    });

    const {
      register: registerVerification,
      handleSubmit: handleSubmitVerification,
      formState: { errors: verificationErrors },
    } = verificationMethods;

    const handleSendPhoneCode = async () => {
      try {
        // TODO: Call API to send phone verification code
        console.log("Sending phone verification code");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPhoneCodeSent(true);
        alert(
          locale === "ar"
            ? "تم إرسال رمز التحقق إلى رقم هاتفك"
            : "Verification code sent to your phone",
        );
      } catch (error) {
        console.error("Error sending phone code:", error);
      }
    };

    const handleSendEmailCode = async () => {
      try {
        // TODO: Call API to send email verification code
        console.log("Sending email verification code");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEmailCodeSent(true);
        alert(
          locale === "ar"
            ? "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
            : "Verification code sent to your email",
        );
      } catch (error) {
        console.error("Error sending email code:", error);
      }
    };

    const handleVerifyPhone = async (data: { phoneCode: string }) => {
      setIsVerifyingPhone(true);
      try {
        // TODO: Call API to verify phone code
        console.log("Verifying phone code:", data.phoneCode);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setPhoneVerified(true);
        setPhoneCodeSent(false);
        alert(
          locale === "ar"
            ? "تم التحقق من رقم الهاتف بنجاح"
            : "Phone number verified successfully!",
        );
        verificationMethods.resetField("phoneCode");
      } catch (error) {
        console.error("Error verifying phone:", error);
        alert(
          locale === "ar"
            ? "رمز التحقق غير صحيح"
            : "Invalid verification code",
        );
      } finally {
        setIsVerifyingPhone(false);
      }
    };

    const handleVerifyEmail = async (data: { emailCode: string }) => {
      setIsVerifyingEmail(true);
      try {
        // TODO: Call API to verify email code
        console.log("Verifying email code:", data.emailCode);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setEmailVerified(true);
        setEmailCodeSent(false);
        alert(
          locale === "ar"
            ? "تم التحقق من البريد الإلكتروني بنجاح"
            : "Email verified successfully!",
        );
        verificationMethods.resetField("emailCode");
      } catch (error) {
        console.error("Error verifying email:", error);
        alert(
          locale === "ar"
            ? "رمز التحقق غير صحيح"
            : "Invalid verification code",
        );
      } finally {
        setIsVerifyingEmail(false);
      }
    };

    const handleIDFrontChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert(locale === "ar" ? "الرجاء تحميل ملف صورة" : "Please upload an image file");
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        setIdFrontPreview(previewUrl);
      }
    };

    const handleIDBackChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          alert(locale === "ar" ? "الرجاء تحميل ملف صورة" : "Please upload an image file");
          return;
        }
        const previewUrl = URL.createObjectURL(file);
        setIdBackPreview(previewUrl);
      }
    };

    const handleUploadID = async (data: VerificationFormData) => {
      setIsUploadingID(true);
      try {
        // TODO: Call API to upload government ID
        console.log("Uploading government ID", data);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        setIdVerified(true);
        alert(
          locale === "ar"
            ? "تم تحميل بطاقة الهوية بنجاح. سيتم مراجعتها قريباً"
            : "Government ID uploaded successfully. It will be reviewed soon.",
        );
      } catch (error) {
        console.error("Error uploading ID:", error);
        alert(
          locale === "ar"
            ? "حدث خطأ أثناء تحميل بطاقة الهوية"
            : "Error uploading government ID",
        );
      } finally {
        setIsUploadingID(false);
      }
    };

    const VerificationStatus = ({
      verified,
      pending,
    }: {
      verified: boolean;
      pending?: boolean;
    }) => (
      <div className="flex items-center gap-2">
        {verified ? (
          <CheckCircle2 className="h-5 w-5 text-green-600" />
        ) : pending ? (
          <Clock className="h-5 w-5 text-yellow-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
        <span
          className={`text-sm font-medium ${
            verified
              ? "text-green-600"
              : pending
                ? "text-yellow-600"
                : "text-red-600"
          }`}
        >
          {verified
            ? t("verified")
            : pending
              ? t("pending")
              : t("notVerified")}
        </span>
      </div>
    );

    return (
      <FormProvider {...verificationMethods}>
        <div className="space-y-6">
          {/* Phone Verification Section */}
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {t("phoneVerification")}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("verifyPhone")}
                </p>
              </div>
              <VerificationStatus verified={phoneVerified} />
            </div>

            {!phoneVerified && (
              <div className="space-y-4">
                {!phoneCodeSent ? (
                  <Button
                    type="button"
                    onClick={handleSendPhoneCode}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {t("sendCode")}
                  </Button>
                ) : (
                  <form
                    onSubmit={handleSubmitVerification((data) =>
                      handleVerifyPhone({ phoneCode: data.phoneCode }),
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="phoneCode">{t("verificationCode")}</Label>
                      <Input
                        id="phoneCode"
                        type="text"
                        placeholder={locale === "ar" ? "أدخل رمز التحقق" : "Enter verification code"}
                        maxLength={6}
                        {...registerVerification("phoneCode", {
                          required: `${t("verificationCode")} ${t("required")}`,
                          minLength: {
                            value: 4,
                            message:
                              locale === "ar"
                                ? "يجب أن يكون رمز التحقق 4 أحرف على الأقل"
                                : "Verification code must be at least 4 characters",
                          },
                        })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">{t("enterCode")}</p>
                      {verificationErrors.phoneCode && (
                        <p className="text-sm text-red-500">
                          {verificationErrors.phoneCode.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isVerifyingPhone}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isVerifyingPhone ? t("verifying") : t("verify")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPhoneCodeSent(false);
                          verificationMethods.resetField("phoneCode");
                        }}
                      >
                        {locale === "ar" ? "إلغاء" : "Cancel"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Email Verification Section */}
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {t("emailVerification")}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("verifyEmail")}
                </p>
              </div>
              <VerificationStatus verified={emailVerified} />
            </div>

            {!emailVerified && (
              <div className="space-y-4">
                {!emailCodeSent ? (
                  <Button
                    type="button"
                    onClick={handleSendEmailCode}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {t("sendCode")}
                  </Button>
                ) : (
                  <form
                    onSubmit={handleSubmitVerification((data) =>
                      handleVerifyEmail({ emailCode: data.emailCode }),
                    )}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="emailCode">{t("verificationCode")}</Label>
                      <Input
                        id="emailCode"
                        type="text"
                        placeholder={locale === "ar" ? "أدخل رمز التحقق" : "Enter verification code"}
                        maxLength={6}
                        {...registerVerification("emailCode", {
                          required: `${t("verificationCode")} ${t("required")}`,
                          minLength: {
                            value: 4,
                            message:
                              locale === "ar"
                                ? "يجب أن يكون رمز التحقق 4 أحرف على الأقل"
                                : "Verification code must be at least 4 characters",
                          },
                        })}
                        className="w-full"
                      />
                      <p className="text-xs text-gray-500">{t("enterCode")}</p>
                      {verificationErrors.emailCode && (
                        <p className="text-sm text-red-500">
                          {verificationErrors.emailCode.message}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        disabled={isVerifyingEmail}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isVerifyingEmail ? t("verifying") : t("verify")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEmailCodeSent(false);
                          verificationMethods.resetField("emailCode");
                        }}
                      >
                        {locale === "ar" ? "إلغاء" : "Cancel"}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Government ID Upload Section */}
          <div className="rounded-lg border border-gray-300 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {t("governmentID")}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("uploadGovernmentID")}
                </p>
              </div>
              <VerificationStatus
                verified={idVerified}
                pending={idVerified}
              />
            </div>

            <form
              onSubmit={handleSubmitVerification(handleUploadID)}
              className="space-y-6"
            >
              <p className="text-sm text-gray-600">{t("idHint")}</p>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* ID Front Side */}
                <div className="space-y-2">
                  <Label>{t("idFront")}</Label>
                  <label
                    htmlFor="idFront"
                    className={`group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                      idFrontPreview
                        ? "border-transparent"
                        : "border-gray-300 hover:border-green-600"
                    }`}
                  >
                    {idFrontPreview ? (
                      <>
                        <div className="relative h-full w-full overflow-hidden rounded-lg">
                          <Image
                            width={300}
                            height={200}
                            src={idFrontPreview}
                            alt="ID Front preview"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                            <UploadCloud className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (idFrontPreview.startsWith("blob:")) {
                              URL.revokeObjectURL(idFrontPreview);
                            }
                            setIdFrontPreview(null);
                            const input = document.getElementById("idFront") as HTMLInputElement | null;
                            if (input) input.value = "";
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 text-center">
                        <div className="mb-2 rounded-full bg-gray-100 p-4 text-gray-500 transition-all group-hover:bg-green-100 group-hover:text-green-600">
                          <ImageIcon size={24} />
                        </div>
                        <p className="text-xs text-gray-500">
                          {locale === "ar" ? "انقر للتحميل" : "Click to upload"}
                        </p>
                      </div>
                    )}
                    <input
                      id="idFront"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      {...registerVerification("idFront", {
                        required: `${t("idFront")} ${t("required")}`,
                        onChange: handleIDFrontChange,
                      })}
                    />
                  </label>
                  {verificationErrors.idFront && (
                    <p className="text-sm text-red-500">
                      {verificationErrors.idFront.message}
                    </p>
                  )}
                </div>

                {/* ID Back Side */}
                <div className="space-y-2">
                  <Label>{t("idBack")}</Label>
                  <label
                    htmlFor="idBack"
                    className={`group relative flex h-48 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all ${
                      idBackPreview
                        ? "border-transparent"
                        : "border-gray-300 hover:border-green-600"
                    }`}
                  >
                    {idBackPreview ? (
                      <>
                        <div className="relative h-full w-full overflow-hidden rounded-lg">
                          <Image
                            width={300}
                            height={200}
                            src={idBackPreview}
                            alt="ID Back preview"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 rounded-lg" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                            <UploadCloud className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (idBackPreview.startsWith("blob:")) {
                              URL.revokeObjectURL(idBackPreview);
                            }
                            setIdBackPreview(null);
                            const input = document.getElementById("idBack") as HTMLInputElement | null;
                            if (input) input.value = "";
                          }}
                          className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1.5 text-white shadow-lg transition-all hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center px-4 text-center">
                        <div className="mb-2 rounded-full bg-gray-100 p-4 text-gray-500 transition-all group-hover:bg-green-100 group-hover:text-green-600">
                          <ImageIcon size={24} />
                        </div>
                        <p className="text-xs text-gray-500">
                          {locale === "ar" ? "انقر للتحميل" : "Click to upload"}
                        </p>
                      </div>
                    )}
                    <input
                      id="idBack"
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      {...registerVerification("idBack", {
                        required: `${t("idBack")} ${t("required")}`,
                        onChange: handleIDBackChange,
                      })}
                    />
                  </label>
                  {verificationErrors.idBack && (
                    <p className="text-sm text-red-500">
                      {verificationErrors.idBack.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isUploadingID || idVerified}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isUploadingID
                    ? locale === "ar"
                      ? "جاري التحميل..."
                      : "Uploading..."
                    : idVerified
                      ? t("verified")
                      : t("uploadID")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </FormProvider>
    );
  };

  return (
    <div dir={direction} className="w-full">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="size-4" />
            {t("profile")}
          </TabsTrigger>
          <TabsTrigger value="stores">
            <Store className="size-4" />
            {t("stores")}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="size-4" />
            {t("settings")}
          </TabsTrigger>
          <TabsTrigger value="verification">
            <ShieldCheck className="size-4" />
            {t("verification")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4">
          <ProfileTabContent />
        </TabsContent>

        <TabsContent value="stores" className="mt-4">
          <StoresTabContent />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <SettingsTabContent />
        </TabsContent>

        <TabsContent value="verification" className="mt-4">
          <VerificationTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

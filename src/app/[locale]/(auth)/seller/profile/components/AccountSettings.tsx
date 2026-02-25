import { useForm, FormProvider } from "react-hook-form";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  KeyRound,
  ShieldCheck,
  Mail,
  Phone,
  Lock,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/shared/input";
import { Label } from "@/components/shared/label";
import DynamicButton from "@/components/shared/Buttons/DynamicButton";

export const AccountSettings = () => {
  const t = useTranslations("seller_profile.settings");
  const [isUpdating, setIsUpdating] = useState(false);

  const methods = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: any) => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 1500));
    console.log("Password updated:", data);
    setIsUpdating(false);
    methods.reset();
  };

  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <h2 className="text-xl font-black tracking-tight text-gray-900">
          {t("title")}
        </h2>
        <p className="text-sm font-medium text-gray-500">{t("subtitle")}</p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <section className="rounded-[2.5rem] border border-white/60 bg-white/70 p-8 shadow-2xl shadow-gray-200/40 backdrop-blur-2xl">
            <div className="mb-8 flex items-center gap-3">
              <div className="rounded-2xl bg-gray-900 p-3 text-white">
                <KeyRound size={20} />
              </div>
              <h3 className="text-lg font-black leading-none text-gray-900">
                {t("password.title")}
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t("password.current")}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    {...register("currentPassword", { required: true })}
                    type="password"
                    className="focus:ring-primary/10 rounded-2xl border-gray-100 bg-gray-50/50 p-6 pl-12 font-bold focus:bg-white focus:ring-4"
                  />
                </div>
              </div>

              <div className="space-y-2 lg:col-start-1">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t("password.new")}
                </Label>
                <Input
                  {...register("newPassword", { required: true, minLength: 8 })}
                  type="password"
                  className="focus:ring-primary/10 rounded-2xl border-gray-100 bg-gray-50/50 p-6 font-bold focus:bg-white focus:ring-4"
                />
              </div>

              <div className="space-y-2 lg:col-start-2">
                <Label className="text-xs font-black uppercase tracking-widest text-gray-400">
                  {t("password.confirm")}
                </Label>
                <Input
                  {...register("confirmPassword", { required: true })}
                  type="password"
                  className="focus:ring-primary/10 rounded-2xl border-gray-100 bg-gray-50/50 p-6 font-bold focus:bg-white focus:ring-4"
                />
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
              <p className="flex items-center gap-2 text-xs font-bold text-amber-600">
                <ShieldCheck size={14} />
                {t("password.requirements")}
              </p>
            </div>

            <div className="mt-10 flex justify-end border-t border-gray-100 pt-8">
              <DynamicButton
                variant="primary"
                type="submit"
                disabled={isUpdating}
                label={isUpdating ? "Updating..." : t("password.update")}
                className="rounded-2xl bg-gray-900 px-10 py-4 font-black uppercase tracking-widest text-white shadow-xl shadow-black/10 transition-all hover:scale-[1.02] hover:bg-black"
              />
            </div>
          </section>
        </form>
      </FormProvider>
    </div>
  );
};

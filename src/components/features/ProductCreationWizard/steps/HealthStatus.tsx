import { Check, AlertTriangle, Info } from "lucide-react";
import { useTranslations } from "next-intl";
import { ProductFormData } from "@/lib/validations/product-schema";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/shared/card";
import { Badge } from "@/components/shared/badge";
import { Separator } from "@/components/shared/separator";
import { Progress } from "@/components/shared/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shared/Tooltip";

interface HealthStatusProps {
  product: ProductFormData;
  className?: string;
}

export const HealthStatus = ({
  product,
  className = "",
}: HealthStatusProps) => {
  const t = useTranslations("create_product.health");
  const commonT = useTranslations("create_product.actions");

  const checks = [
    {
      key: "categorybrand",
      value:
        !!product.classification.category && !!product.classification.brand,
      label: t("categorybrand"),
    },
    {
      key: "identity",
      value:
        !!product.identity.sku &&
        product.identity.sku.length >= 3 &&
        !!product.slugEn &&
        !!product.slugAr,
      label: t("identity"),
    },
    {
      key: "details",
      value:
        !!product.title?.en &&
        !!product.title?.ar &&
        !!product.descriptions?.descriptionEn &&
        !!product.descriptions?.descriptionAr &&
        (product.highlightsEn?.length ?? 0) > 0 &&
        (product.highlightsAr?.length ?? 0) > 0,
      label: t("details"),
    },
    {
      key: "pricingstock",
      value:
        !!product.pricing.originalPrice &&
        product.pricing.originalPrice > 0 &&
        !!product.inventory.stockQuantity &&
        product.inventory.stockQuantity > 0,
      label: t("pricingstock"),
    },
    {
      key: "media",
      value: product.images && product.images.length > 0,
      label: t("media"),
    },
    {
      key: "settings",
      value: (product.specifications?.length ?? 0) > 0,
      label: t("settings"),
    },
  ];

  const healthScore = Math.round(
    (checks.filter((c) => c.value).length / checks.length) * 100,
  );
  const allValid = healthScore === 100;

  return (
    <Card
      className={`overflow-hidden rounded-3xl border-none bg-white/40 shadow-2xl backdrop-blur-xl ${className}`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500">
            {t("title")}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-tighter text-gray-400">
              Score
            </span>
            <span className="text-xl font-black text-gray-900">
              {healthScore}%
            </span>
          </div>
          <Progress
            value={healthScore}
            className="h-2 bg-gray-100 [&>div]:bg-gray-900"
          />
        </div>

        <Separator className="bg-gray-100/50" />

        <div className="space-y-4">
          {checks.map((check) => (
            <div
              key={check.key}
              className="group flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-lg transition-all ${check.value ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"}`}
                >
                  {check.value ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <AlertTriangle size={14} strokeWidth={3} />
                  )}
                </div>
                <span
                  className={`text-sm font-semibold transition-colors ${check.value ? "text-gray-600" : "text-gray-400"}`}
                >
                  {check.label}
                </span>
              </div>
              {!check.value && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-gray-300 transition-colors hover:text-gray-600">
                        <Info size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="rounded-xl border-none bg-gray-900 text-xs text-white">
                      {t("failed")}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          ))}
        </div>

        {product.identity.sku && (
          <div className="pt-2">
            <div className="rounded-2xl border border-gray-100/50 bg-gray-50/50 p-4">
              <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-gray-400">
                Active SKU
              </span>
              <code className="text-sm font-black text-gray-900">
                {product.identity.sku}
              </code>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// components/product/HealthStatusSidebar.tsx
import { Check, AlertTriangle, Info, Circle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductFormData } from "@/lib/validations/product-schema";

// shadcn/ui imports
import { Card, CardContent, CardHeader, CardTitle } from "@/components/UI/card";
import { Badge } from "@/components/UI/badge";
import { Separator } from "@/components/UI/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/UI/Tooltip";
import { Progress } from "@/components/UI/progress";

interface HealthStatusSidebarProps {
  product: ProductFormData;
  errors?: Record<string, string>;
  className?: string;
}

export const HealthStatus = ({
  product,
  className = "",
}: HealthStatusSidebarProps) => {
  const { language } = useLanguage();

  const t = {
    health: { en: "Health Status", ar: "حالة المنتج" },
    overall: { en: "Overall Health", ar: "الصحة العامة" },
    checks: { en: "Checks", ar: "فحوصات" },
    passed: { en: "Passed", ar: "ناجح" },
    failed: { en: "Failed", ar: "فشل" },
    issue: { en: "Issue", ar: "مشكلة" },
    issues: { en: "Issues", ar: "مشاكل" },
    details: { en: "View Details", ar: "عرض التفاصيل" },
    ready: { en: "Ready to Publish", ar: "جاهز للنشر" },
    notReady: { en: "Needs Fixing", ar: "يحتاج إصلاح" },
    titleMissing: { en: "Title Missing", ar: "العنوان مفقود" },
    priceMissing: { en: "Price Missing", ar: "السعر مفقود" },
    skuMissing: { en: "SKU Missing", ar: "الرمز مفقود" },
    stockMissing: { en: "Stock Missing", ar: "المخزون مفقود" },
    detailsIncomplete: { en: "Details Incomplete", ar: "التفاصيل غير مكتملة" },
  };

  const checks = {
    title: {
      value: !!product.title?.en && !!product.title?.ar,
      label: { en: "Title", ar: "العنوان" },
      error: t.titleMissing[language],
    },
    price: {
      value: !!product.del_price && product.del_price >= 0,
      label: { en: "Price", ar: "السعر" },
      error: t.priceMissing[language],
    },
    sku: {
      value: !!product.sku && product.sku.length >= 3,
      label: { en: "SKU", ar: "الرمز" },
      error: t.skuMissing[language],
    },
    stock: {
      value: !!product.stock && product.stock > 0,
      label: { en: "Stock", ar: "المخزون" },
      error: t.stockMissing[language],
    },
    details: {
      value: !!product.description?.en && !!product.description?.ar,
      label: { en: "Details", ar: "التفاصيل" },
      error: t.detailsIncomplete[language],
    },
  };

  const allValid = Object.values(checks).every((check) => check.value);
  const issuesCount = Object.values(checks).filter(
    (check) => !check.value,
  ).length;
  const healthScore = Math.round(
    (Object.values(checks).filter((check) => check.value).length /
      Object.keys(checks).length) *
      100,
  );

  return (
    <Card className={`h-fit ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            {t.health[language]}
          </CardTitle>
          <Badge
            variant={allValid ? "default" : "destructive"}
            className="text-xs"
          >
            {allValid ? t.ready[language] : t.notReady[language]}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Health Score Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {t.overall[language]}
            </span>
            <span className="text-sm font-bold">{healthScore}%</span>
          </div>
          <Progress value={healthScore} className="h-2" />
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1 text-center">
            <div className="text-lg font-bold">
              {Object.keys(checks).length}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.checks[language]}
            </div>
          </div>
          <div className="space-y-1 text-center">
            <div className="text-lg font-bold text-green-600">
              {Object.values(checks).filter((c) => c.value).length}
            </div>
            <div className="text-xs text-muted-foreground">
              {t.passed[language]}
            </div>
          </div>
          <div className="space-y-1 text-center">
            <div className="text-lg font-bold text-red-600">{issuesCount}</div>
            <div className="text-xs text-muted-foreground">
              {issuesCount === 1 ? t.issue[language] : t.issues[language]}
            </div>
          </div>
        </div>

        {/* Issues List */}
        {issuesCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-medium text-muted-foreground">
                {t.issues[language]}
              </h4>
              <ul className="space-y-1.5">
                {Object.entries(checks)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  .filter(([_, check]) => !check.value)
                  .map(([key, check]) => (
                    <li key={key} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-500" />
                      <span className="text-xs">{check.error}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="ml-auto">
                              <Info className="h-3 w-3 text-muted-foreground" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">
                              {check.label[language]}{" "}
                              {t.issue[language].toLowerCase()}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </li>
                  ))}
              </ul>
            </div>
          </>
        )}

        {/* Check Items */}
        <Separator />
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">
            {t.checks[language]}
          </h4>
          <div className="space-y-1.5">
            {Object.entries(checks).map(([key, check]) => (
              <div
                key={key}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  {check.value ? (
                    <Check className="h-3 w-3 text-green-500" />
                  ) : (
                    <Circle className="h-3 w-3 text-red-500" />
                  )}
                  <span>{check.label[language]}</span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${check.value ? "border-green-200 text-green-700" : "border-red-200 text-red-700"}`}
                >
                  {check.value ? t.passed[language] : t.failed[language]}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* SKU Display */}
        <Separator />
        <div className="space-y-1.5">
          <h4 className="text-xs font-medium text-muted-foreground">
            {t.skuMissing[language].split(" ")[0]}
          </h4>
          <div className="rounded bg-muted px-2 py-1.5">
            <code className="font-mono text-xs">{product.sku || "No SKU"}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Mini version for even smaller sidebar
export const HealthStatusMini = ({
  product,
  className = "",
}: {
  product: ProductFormData;
  className?: string;
}) => {
  const { language } = useLanguage();

  const checks = {
    title: !!product.title?.en && !!product.title?.ar,
    price: !!product.del_price && product.del_price >= 0,
    sku: !!product.sku && product.sku.length >= 3,
    stock: !!product.stock && product.stock > 0,
    details: !!product.description?.en && !!product.description?.ar,
  };

  const allValid = Object.values(checks).every(Boolean);
  const issuesCount = Object.values(checks).filter((check) => !check).length;

  return (
    <div className={`rounded-lg border p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {allValid ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-sm font-medium">
            {language === "en" ? "Health" : "الحالة"}
          </span>
        </div>
        <Badge
          variant={allValid ? "default" : "outline"}
          className={`text-xs ${allValid ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"}`}
        >
          {allValid
            ? language === "en"
              ? "Ready"
              : "جاهز"
            : `${issuesCount} ${language === "en" ? "issue" : "مشكلة"}`}
        </Badge>
      </div>
    </div>
  );
};

// Compact Progress Bar version
export const HealthStatusProgress = ({
  product,
  className = "",
}: {
  product: ProductFormData;
  className?: string;
}) => {
  const { language } = useLanguage();

  const checks = {
    title: !!product.title?.en && !!product.title?.ar,
    price: !!product.del_price && product.del_price >= 0,
    sku: !!product.sku && product.sku.length >= 3,
    stock: !!product.stock && product.stock > 0,
    details: !!product.description?.en && !!product.description?.ar,
  };

  const passedCount = Object.values(checks).filter(Boolean).length;
  const totalCount = Object.keys(checks).length;
  const progress = (passedCount / totalCount) * 100;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">
          {language === "en" ? "Product Health" : "صحة المنتج"}
        </span>
        <span className="text-xs font-bold">{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{language === "en" ? "Checks:" : "فحوصات:"}</span>
        <span>
          {passedCount}/{totalCount}
        </span>
      </div>
    </div>
  );
};

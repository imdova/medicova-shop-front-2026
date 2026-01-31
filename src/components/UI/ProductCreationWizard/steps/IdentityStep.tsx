import { Clipboard } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ProductFormData } from "@/lib/validations/product-schema";

interface IdentityStepProps {
  product: ProductFormData;
  errors: Record<string, string>;
  onUpdate: (updates: Partial<ProductFormData>) => void;
  onValidate: () => void;
  onBack: () => void;
}

const translations = {
  en: {
    productIdentity: "Product Identity",
    manualSkuEntry: "Manual SKU Entry",
    enterSku: "Enter your SKU",
    submit: "Submit",
    or: "or",
    generateSku: "Generate SKU Automatically",
    skuGenerated: "SKU Generated",
    back: "Back",
    nextDetails: "Next: Details",
  },
  ar: {
    productIdentity: "هوية المنتج",
    manualSkuEntry: "إدخال SKU يدويًا",
    enterSku: "أدخل SKU الخاص بك",
    submit: "إرسال",
    or: "أو",
    generateSku: "إنشاء SKU تلقائيًا",
    skuGenerated: "تم إنشاء SKU",
    back: "رجوع",
    nextDetails: "التالي: التفاصيل",
  },
};

export const IdentityStep = ({
  product,
  errors,
  onUpdate,
  onValidate,
  onBack,
}: IdentityStepProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const generateSku = () => {
    const randomPart = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return `PSKU_${randomPart}_${Date.now()}`;
  };

  const handleGenerateSku = () => {
    onUpdate({ sku: generateSku() });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-xl font-semibold">{t.productIdentity}</h2>

      {errors.sku && (
        <div className="mb-4 rounded-md bg-red-50 p-2 text-sm text-red-600">
          {errors.sku}
        </div>
      )}

      {/* Manual SKU Entry */}
      <div className="mb-6">
        <h3 className="mb-2 font-medium">{t.manualSkuEntry}</h3>
        <div className="flex">
          <input
            type="text"
            className={`flex-grow rounded-md border border-gray-300 px-3 py-2 focus:outline-none ${
              language === "ar" ? "rounded-r-md" : "rounded-l-md"
            }`}
            placeholder={t.enterSku}
            value={product.sku || ""}
            onChange={(e) => onUpdate({ sku: e.target.value })}
            dir={language === "ar" ? "rtl" : "ltr"}
          />
          <button
            type="button"
            className={`rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 ${
              language === "ar" ? "rounded-l-md" : "rounded-r-md"
            }`}
            onClick={onValidate}
            disabled={!product.sku}
          >
            {t.submit}
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="my-4 text-center text-gray-500">{t.or}</div>

      {/* Auto Generate SKU */}
      <button
        type="button"
        className="flex w-full flex-col items-center rounded-md border-2 border-dashed border-gray-300 py-3 transition-colors hover:border-green-500 hover:bg-green-50"
        onClick={handleGenerateSku}
      >
        <Clipboard className="mb-2 text-gray-400" size={24} />
        <span className="text-sm text-gray-600">{t.generateSku}</span>
      </button>

      {/* Generated SKU Display */}
      {product.sku && (
        <div className="mt-6 rounded-md border border-green-200 bg-green-50 p-4">
          <div className="font-medium">{t.skuGenerated}</div>
          <div className="mt-1 font-mono text-sm">{product.sku}</div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          onClick={onBack}
        >
          {t.back}
        </button>
        <button
          type="button"
          className="rounded-md bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          disabled={!product.sku}
          onClick={onValidate}
        >
          {t.nextDetails}
        </button>
      </div>
    </div>
  );
};

"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useParams } from "next/navigation";
import { Upload, FileText, CircleDashed, X } from "lucide-react";
import DynamicTable from "@/components/UI/tables/DTable";
import NotFound from "@/app/not-found";
import { importConfigs } from "@/constants/configs";

const translations = {
  en: {
    title: "Import {type}",
    backToImport: "Back to Import",
    import: "Import",
    processing: "Processing...",
    importSuccess: "Import completed successfully",
    example: "Example",
    rules: "Validation Rules",
    dragAndDrop: "Drag and drop your file here or click to upload",
    fileExtensions: "Supported formats: .csv, .xlsx, .xls",
    exportPrompt:
      "If you want to export {type} data, click Export to CSV or Export to Excel.",
  },
  ar: {
    title: "استيراد {type}",
    backToImport: "العودة إلى الاستيراد",
    import: "استيراد",
    processing: "جاري المعالجة...",
    importSuccess: "تم الاستيراد بنجاح",
    example: "مثال",
    rules: "قواعد التحقق",
    dragAndDrop: "اسحب الملف هنا أو اضغط للتحميل",
    fileExtensions: "الصيغ المدعومة: .csv، .xlsx، .xls",
    exportPrompt:
      "إذا كنت تريد تصدير بيانات {type}، يمكنك القيام بذلك بسرعة بالنقر على تصدير إلى CSV أو تصدير إلى Excel.",
  },
};

export default function ImportDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { language } = useLanguage();
  const t = translations[language];
  const config = importConfigs.find((c) => c.id === slug);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!config) {
    return <NotFound />;
  }

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    await new Promise((res) => setTimeout(res, 2000));
    setIsProcessing(false);
    alert(t.importSuccess);
  };

  const exampleColumns = config?.columns?.map((col) => ({
    key: col,
    header: col,
  }));

  const ruleColumns = [
    { key: "column", header: language === "ar" ? "العمود" : "Column" },
    { key: "rule", header: language === "ar" ? "القاعدة" : "Rule" },
  ];

  const titleText = config.title[language as "ar" | "en"];

  return (
    <div className="min-h-screen">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 text-primary">
          {config.icon}
        </div>
        <div>
          <h1 className="font-bold text-gray-900 sm:text-2xl">
            {t.title.replace("{type}", titleText)}
          </h1>
          <p className="text-sm text-gray-600">
            {t.exportPrompt.replace("{type}", titleText)}
          </p>
        </div>
      </div>

      {/* Example Table */}
      <div className="mb-6 rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">{t.example}</h3>
        <DynamicTable
          data={config.exampleData ?? []}
          columns={exampleColumns ?? []}
          pagination={false}
          locale={language}
          minWidth={600}
        />
      </div>

      {/* Rules Table */}
      <div className="mb-6 rounded-lg border bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold">{t.rules}</h3>
        <DynamicTable
          data={config.rules ?? []}
          columns={ruleColumns}
          pagination={false}
          locale={language}
          minWidth={400}
        />
      </div>

      {/* File Upload */}
      <div>
        <label
          htmlFor="file"
          onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add("border-blue-400", "bg-blue-50");
          }}
          onDragLeave={(e) => {
            e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
          }}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) setSelectedFile(file);
            e.currentTarget.classList.remove("border-blue-400", "bg-blue-50");
          }}
          className="flex h-40 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white transition-all duration-200 hover:bg-gray-50"
        >
          <Upload className="mb-2 h-10 w-10 text-primary" />
          <p className="font-medium text-gray-700">{t.dragAndDrop}</p>
          <p className="text-sm text-gray-500">{t.fileExtensions}</p>
          <input
            id="file"
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
          />
        </label>

        {selectedFile && (
          <div className="mt-4 flex items-center justify-between rounded-lg border border-green-200 bg-green-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-gray-800">
                {selectedFile.name}
              </span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm font-medium text-red-500 hover:text-red-600"
            >
              <X size={14} />
            </button>
          </div>
        )}

        <button
          onClick={handleImport}
          disabled={!selectedFile || isProcessing}
          className={`mt-6 w-full rounded-lg py-3 font-semibold text-white transition-all duration-200 ${
            isProcessing || !selectedFile
              ? "cursor-not-allowed bg-gray-400"
              : "bg-primary shadow-md hover:shadow-lg"
          }`}
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <CircleDashed className="h-4 w-4 animate-spin" />
              {t.processing}
            </span>
          ) : (
            t.import
          )}
        </button>
      </div>
    </div>
  );
}

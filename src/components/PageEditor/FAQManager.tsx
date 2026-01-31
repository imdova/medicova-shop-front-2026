import { useState } from "react";
import { Button } from "../UI/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../UI/dialog";
import { BilingualInput } from "./BilingualInput";
import z from "zod";
import { faqSchema } from "@/constants/schemas/BuildPage";

type FAQItem = z.infer<typeof faqSchema>;

// ---------------- FAQ Management Component ----------------
export function FAQManager({
  faqs,
  onFaqsChange,
  language,
}: {
  faqs: FAQItem[];
  onFaqsChange: (faqs: FAQItem[]) => void;
  language: "en" | "ar";
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentFAQ, setCurrentFAQ] = useState<FAQItem>({
    question: { en: "", ar: "" },
    answer: { en: "", ar: "" },
  });

  const t = {
    en: {
      add_faq: "Add FAQ",
      edit_faq: "Edit FAQ",
      question: "Question",
      answer: "Answer",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      add_new_faq: "Add new",
      no_faqs: "No FAQs added yet",
      existing_faqs: "or Select from existing FAQs",
      edit: "Edit",
      at_least_one_language: "At least one language version is required",
    },
    ar: {
      add_faq: "إضافة سؤال",
      edit_faq: "تحرير السؤال",
      question: "السؤال",
      answer: "الإجابة",
      save: "حفظ",
      cancel: "إلغاء",
      delete: "حذف",
      add_new_faq: "إضافة جديد",
      no_faqs: "لا توجد أسئلة مضافة بعد",
      existing_faqs: "أو اختر من الأسئلة الشائعة الموجودة",
      edit: "تعديل",
      at_least_one_language: "مطلوب نسخة لغة واحدة على الأقل",
    },
  }[language];

  const handleSaveFAQ = () => {
    if (
      (!currentFAQ.question.en && !currentFAQ.question.ar) ||
      (!currentFAQ.answer.en && !currentFAQ.answer.ar)
    ) {
      return;
    }

    if (editingIndex !== null) {
      const updatedFaqs = [...faqs];
      updatedFaqs[editingIndex] = currentFAQ;
      onFaqsChange(updatedFaqs);
    } else {
      onFaqsChange([...faqs, currentFAQ]);
    }
    setCurrentFAQ({ question: { en: "", ar: "" }, answer: { en: "", ar: "" } });
    setEditingIndex(null);
    setIsDialogOpen(false);
  };

  const handleEditFAQ = (index: number) => {
    setCurrentFAQ(faqs[index]);
    setEditingIndex(index);
    setIsDialogOpen(true);
  };

  const handleDeleteFAQ = (index: number) => {
    const updatedFaqs = faqs.filter((_, i) => i !== index);
    onFaqsChange(updatedFaqs);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">{t.add_new_faq}</h4>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              {t.add_new_faq}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? t.edit_faq : t.add_faq}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <BilingualInput
                value={{
                  en: currentFAQ?.question?.en ?? "",
                  ar: currentFAQ?.question?.ar ?? "",
                }}
                onChange={(value) =>
                  setCurrentFAQ({ ...currentFAQ, question: value })
                }
                label={t.question}
                placeholder={{
                  en: "Enter question in English",
                  ar: "أدخل السؤال بالعربية",
                }}
                language={language}
                type="textarea"
                required
              />
              <BilingualInput
                value={{
                  en: currentFAQ?.answer?.en ?? "",
                  ar: currentFAQ?.answer?.ar ?? "",
                }}
                onChange={(value) =>
                  setCurrentFAQ({ ...currentFAQ, answer: value })
                }
                label={t.answer}
                placeholder={{
                  en: "Enter answer in English",
                  ar: "أدخل الإجابة بالعربية",
                }}
                language={language}
                type="textarea"
                required
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setCurrentFAQ({
                      question: { en: "", ar: "" },
                      answer: { en: "", ar: "" },
                    });
                    setEditingIndex(null);
                  }}
                >
                  {t.cancel}
                </Button>
                <Button
                  type="button"
                  onClick={handleSaveFAQ}
                  disabled={
                    (!currentFAQ.question.en && !currentFAQ.question.ar) ||
                    (!currentFAQ.answer.en && !currentFAQ.answer.ar)
                  }
                >
                  {t.save}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div>
        <h4 className="mb-2 text-sm text-gray-600">{t.existing_faqs}</h4>
        {faqs.length === 0 ? (
          <p className="text-sm text-gray-500">{t.no_faqs}</p>
        ) : (
          <div className="space-y-2">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium">
                      {language === "en"
                        ? faq.question.en || faq.question.ar
                        : faq.question.ar || faq.question.en}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      {language === "en"
                        ? faq.answer.en || faq.answer.ar
                        : faq.answer.ar || faq.answer.en}
                    </p>
                    <div className="mt-1 flex gap-2 text-xs text-gray-500">
                      <span className={faq.question.en ? "text-green-600" : ""}>
                        EN: {faq.question.en ? "✓" : "✗"}
                      </span>
                      <span className={faq.question.ar ? "text-green-600" : ""}>
                        AR: {faq.question.ar ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>
                  <div className="ml-2 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFAQ(index)}
                    >
                      {t.edit}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFAQ(index)}
                    >
                      {t.delete}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

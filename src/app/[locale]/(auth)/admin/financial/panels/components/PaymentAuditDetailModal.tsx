import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useAppLocale } from "@/hooks/useAppLocale";
import { Loader2, X, FileJson, Copy, CheckCircle2 } from "lucide-react";
import { getAdminPaymentAuditDetails, PaymentAuditLog } from "@/services/financeService";
import { useSession } from "next-auth/react";

interface Props {
  transactionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PaymentAuditDetailModal({ transactionId, isOpen, onClose }: Props) {
  const locale = useAppLocale();
  const isArabic = locale === "ar";
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [details, setDetails] = useState<PaymentAuditLog | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      if (!isOpen || !transactionId || !token) return;
      setLoading(true);
      try {
        const res = await getAdminPaymentAuditDetails(token, transactionId);
        setDetails(res);
      } catch (err) {
        console.error("Failed to fetch audit details", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [transactionId, isOpen, token]);

  const handleCopy = () => {
    if (!details?.providerResponse) return;
    navigator.clipboard.writeText(JSON.stringify(details.providerResponse, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div 
        className="flex w-full max-w-2xl max-h-[90vh] flex-col animate-in zoom-in-95 rounded-2xl bg-white shadow-xl"
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
              <FileJson className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">
                {isArabic ? "تفاصيل سجل الدفع" : "Payment Audit Details"}
              </h2>
              <p className="text-xs font-mono font-medium text-slate-500">
                ID: {transactionId}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : !details ? (
            <div className="flex h-40 items-center justify-center text-sm font-medium text-slate-500">
              {isArabic ? "لم يتم العثور على السجل" : "Audit record not found"}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {isArabic ? "المبلغ" : "Amount"}
                  </p>
                  <p className="font-black text-slate-900">
                    {new Intl.NumberFormat(isArabic ? "ar-EG" : "en-US", { style: "currency", currency: details.currency || "USD" }).format(details.amount)}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {isArabic ? "الحالة" : "Status"}
                  </p>
                  <p className="font-bold text-slate-900 capitalize">
                    {details.status}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {isArabic ? "البوابة" : "Gateway"}
                  </p>
                  <p className="font-bold text-slate-900 capitalize">
                    {details.gateway}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                    {isArabic ? "التاريخ" : "Timestamp"}
                  </p>
                  <p className="font-bold text-slate-900">
                    {new Date(details.createdAt).toLocaleString(isArabic ? "ar-EG" : "en-US")}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 overflow-hidden">
                <div className="flex items-center justify-between bg-slate-50 p-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    {isArabic ? "استجابة مزود الخدمة (Webhook Payload)" : "Provider Response (Webhook Payload)"}
                  </p>
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-200 transition hover:bg-slate-50"
                  >
                    {copied ? (
                      <><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Copied</>
                    ) : (
                      <><Copy className="h-3 w-3" /> Copy JSON</>
                    )}
                  </button>
                </div>
                <div className="bg-slate-900 p-4 overflow-x-auto">
                  <pre className="text-xs font-mono text-emerald-400">
                    {JSON.stringify(details.providerResponse || {}, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

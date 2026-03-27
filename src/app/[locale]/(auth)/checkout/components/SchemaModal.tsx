"use client";

import { X, Copy, Check } from "lucide-react";
import { useState } from "react";

interface SchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: any;
  title?: string;
}

export default function SchemaModal({ isOpen, onClose, schema, title = "Order Schema" }: SchemaModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b p-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-600 transition-colors hover:bg-gray-200"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto p-4 bg-gray-900 text-gray-100 font-mono text-xs leading-relaxed">
          <pre>{JSON.stringify(schema, null, 2)}</pre>
        </div>

        <div className="border-t p-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-black active:scale-[0.98]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

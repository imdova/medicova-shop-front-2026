import { toast } from "react-hot-toast";

export const confirmToast = (message: string, isArabic: boolean = false): Promise<boolean> => {
  return new Promise((resolve) => {
    toast((t) => (
      <div 
        className="flex flex-col gap-3 p-1 w-full max-w-sm" 
        dir={isArabic ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {message}
          </p>
        </div>
        
        <div className="flex gap-2 justify-end w-full">
          <button 
            className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors rounded-xl"
            onClick={() => {
              toast.dismiss(t.id);
              resolve(false);
            }}
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button 
            className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors rounded-xl shadow-sm"
            onClick={() => {
              toast.dismiss(t.id);
              resolve(true);
            }}
          >
            {isArabic ? "تأكيد" : "Confirm"}
          </button>
        </div>
      </div>
    ), { 
      duration: Infinity,
      position: "top-center",
      style: {
        minWidth: '300px',
        maxWidth: '400px',
        padding: '16px',
      }
    });
  });
};

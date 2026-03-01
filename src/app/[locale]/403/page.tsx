import React from "react";
import { useTranslations } from "next-intl";

export default function ForbiddenPage() {
  const t = useTranslations("common");

  return (
    <div className="min-vh-100 flex flex-col items-center justify-center p-4 text-center">
      <h1 className="display-1 fw-bold text-danger">403</h1>
      <h2 className="mb-4">{t("forbiddenTitle")}</h2>
      <p className="lead mb-4">{t("forbiddenDescription")}</p>
      <a href="/" className="btn btn-primary">
        Go Back Home
      </a>
    </div>
  );
}

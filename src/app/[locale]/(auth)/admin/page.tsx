import { redirect } from "next/navigation";

export default function AdminDashboardRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = React.use(params);
  redirect(`/${locale}/admin/financial`);
}

import React from "react";



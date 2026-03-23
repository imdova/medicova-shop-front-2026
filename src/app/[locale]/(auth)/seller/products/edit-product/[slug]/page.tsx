"use client";

import { use } from "react";
import ProductCreationWizard from "@/components/features/ProductCreationWizard/ProductCreationWizard";

export default function SellerEditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  return <ProductCreationWizard productId={slug} />;
}

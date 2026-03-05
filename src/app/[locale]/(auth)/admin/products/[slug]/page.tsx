"use client";
import ProductCreationWizard from "@/components/features/ProductCreationWizard/ProductCreationWizard";
import { use } from "react";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  return <ProductCreationWizard productId={slug} />;
}

"use client";
import { use } from "react";
import ProductDetailView from "./components/ProductDetailView";
import { Product } from "@/types/product";
import { products as allProducts } from "@/data";

interface ProductPageProps {
  params: Promise<{ slug: string; locale: "en" | "ar" }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
  product?: Product;
}

export default function ProductPage({ params, product: initialProduct }: ProductPageProps) {
  const { slug, locale } = use(params);

  // Lookup product by slug if not provided as a prop
  const product = initialProduct || allProducts.find(
    (p) => 
      p.id === slug || 
      p.sku === slug || 
      p.slug?.en === slug || 
      p.slug?.ar === slug
  );

  return <ProductDetailView product={product} locale={locale} />;
}

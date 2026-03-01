import {
  getCategories,
  getSubCategoryChildren,
} from "@/services/categoryService";
import { MultiCategory } from "@/types";
import { notFound } from "next/navigation";
import RenderComponent from "./RenderComponent";

interface CategoryPageProps {
  params: Promise<{ categories?: string[] }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categories: slugs } = await params;
  const allCategories = await getCategories();

  if (!slugs || slugs.length === 0) {
    return notFound();
  }

  let currentLevel = allCategories;
  const categoryPath: MultiCategory[] = [];

  for (let i = 0; i < slugs.length; i++) {
    const slug = slugs[i];
    const lowerSlug = slug.toLowerCase();

    const matches = (cat: MultiCategory) =>
      cat.slug?.toLowerCase() === lowerSlug ||
      cat.slugAr === slug ||
      cat.id === slug ||
      cat.title.en.toLowerCase().replace(/\s+/g, "-") === lowerSlug;

    let foundCategory = currentLevel.find(matches);

    if (!foundCategory && i > 0) {
      const parent = categoryPath[i - 1];

      // If we are looking for level 3, use the public subcategory-child API
      if (i === 2) {
        const children = await getSubCategoryChildren(parent.id);
        foundCategory = children.find(matches);
      }
    }

    if (!foundCategory) return notFound();
    categoryPath.push(foundCategory);
    currentLevel = foundCategory.subCategories ?? [];
  }

  const currentCategory = categoryPath[categoryPath.length - 1];
  if (!currentCategory) return notFound();

  // If we are at level 2 (Sub-category), specifically fetch children from subcategory-child API
  // if they are not already populated from the recursive map.
  if (
    slugs.length === 2 &&
    (!currentCategory.subCategories ||
      currentCategory.subCategories.length === 0)
  ) {
    const children = await getSubCategoryChildren(currentCategory.id);
    if (children.length > 0) {
      currentCategory.subCategories = children;
    }
  }

  return (
    <RenderComponent category={currentCategory} fullPath={slugs.join("/")} />
  );
}

export async function generateStaticParams() {
  const allCategories = await getCategories();
  const paths: { categories: string[] }[] = [];

  function traverseCategories(
    categories: MultiCategory[],
    currentPath: string[],
  ) {
    categories.forEach((category) => {
      if (category.slug) {
        const enPath = [...currentPath, category.slug];
        paths.push({ categories: enPath });
        if (category.subCategories) {
          traverseCategories(category.subCategories, enPath);
        }
      }

      if (category.slugAr && category.slugAr !== category.slug) {
        const arPath = [...currentPath, category.slugAr];
        paths.push({ categories: arPath });
      }
    });
  }

  traverseCategories(allCategories, []);
  return paths;
}

export const revalidate = 3600;

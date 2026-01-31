import { allCategories } from "@/constants/categouries";
import { MultiCategory } from "@/types";
import { notFound } from "next/navigation";
import RenderComponent from "./RenderComponent";

interface CategoryPageProps {
  params: Promise<{ categories?: string[] }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Await params (optional, but a good practice)
  const { categories } = await params;

  // Now use categories safely
  if (!categories || categories.length === 0) {
    return notFound();
  }

  let currentLevel = allCategories;
  const categoryPath: MultiCategory[] = [];

  for (const slug of categories) {
    const foundCategory = currentLevel.find((cat) => cat.slug === slug);
    if (!foundCategory) return notFound();
    categoryPath.push(foundCategory);
    currentLevel = foundCategory.subCategories ?? [];
  }

  const currentCategory = categoryPath[categoryPath.length - 1];
  if (!currentCategory) return notFound();
  return (
    <>
      <RenderComponent category={currentCategory} />
    </>
  );
}

export async function generateStaticParams() {
  const paths: { categories: string[] }[] = [];
  function traverseCategories(
    categories: MultiCategory[],
    currentPath: string[],
  ) {
    categories.forEach((category) => {
      const newPath = [...currentPath, category.slug];
      paths.push({ categories: newPath });
      if (category.subCategories) {
        traverseCategories(category.subCategories, newPath);
      }
    });
  }
  traverseCategories(allCategories, []);
  return paths;
}

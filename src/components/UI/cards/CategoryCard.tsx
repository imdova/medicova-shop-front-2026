import { CategoryType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import LogoLoader from "../LogoLoader";

type CategoryCardProps = {
  loading?: boolean;
  category: CategoryType;
  locale: "ar" | "en";
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  loading,
  category,
  locale = "en",
}) => {
  if (loading) {
    return (
      <div className="flex h-[100px] w-full items-center justify-center md:h-[290px]">
        <LogoLoader className="w-[25px] animate-pulse text-gray-400 md:w-[40px]" />
      </div>
    );
  }
  return (
    <Link href={category.slug} className="p-2">
      <Image
        className="mb-3 h-[80px] w-full rounded-xl object-cover md:h-[150px] lg:h-[250px]"
        src={category.image}
        width={300}
        height={300}
        alt={category.title[locale]}
      />
      <h1 className="text-xs font-bold text-gray-700 md:text-sm">
        {category.title[locale]}
      </h1>
    </Link>
  );
};
export default CategoryCard;

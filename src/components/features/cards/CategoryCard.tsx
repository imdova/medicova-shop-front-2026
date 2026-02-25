import { CategoryType } from "@/types";
import Image from "next/image";
import Link from "next/link";
import LogoLoader from "@/components/layouts/LogoLoader";

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
      <div className="flex w-full flex-col items-center justify-center p-2">
        <div className="flex h-[110px] w-full animate-pulse items-center justify-center rounded-2xl bg-gray-100 md:h-[180px] lg:h-[280px]">
          <LogoLoader className="w-[30px] opacity-20 md:w-[50px]" />
        </div>
        <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-gray-200"></div>
      </div>
    );
  }

  return (
    <Link
      href={category.slug}
      className="group flex flex-col items-center px-2 py-3"
    >
      {/* Premium Card Image Wrapper */}
      <div className="group-hover:ring-primary/20 relative mb-4 w-full overflow-hidden rounded-[20px] bg-white p-1 shadow-sm ring-1 ring-gray-100 transition-all duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-xl">
        <div className="relative h-[80px] w-full overflow-hidden rounded-2xl bg-gray-50 md:h-[150px] lg:h-[250px]">
          <Image
            className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
            src={category.image}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            alt={category.title[locale]}
          />
          {/* Subtle dark gradient overlay at bottom for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </div>

      {/* Category Title */}
      <h3 className="text-center text-xs font-semibold tracking-tight text-gray-800 transition-colors duration-300 group-hover:text-primary md:text-sm lg:text-base">
        {category.title[locale]}
      </h3>
    </Link>
  );
};

export default CategoryCard;

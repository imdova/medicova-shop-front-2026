import Link from "next/link";
import Image from "next/image";
import { Slide } from "@/types";

interface LandingBannersProps {
  bannerSlides: Slide[];
  bannerHeight: string;
}

const LandingBanners = ({
  bannerSlides,
  bannerHeight,
}: LandingBannersProps) => {
  if (bannerSlides.length === 0) return null;

  return (
    <div
      className={`grid grid-cols-1 gap-4 md:grid-cols-${bannerSlides.length}`}
    >
      {bannerSlides.map((banner, index) => (
        <div
          key={index}
          className={`relative mb-3 h-[60px] w-full overflow-hidden sm:mb-0`}
        >
          {banner.url ? (
            <Link href={banner.url} className="relative block h-full w-full">
              <Image
                src={
                  typeof banner.image === "string"
                    ? banner.image
                    : banner.image.src
                }
                alt=""
                fill
                className="h-full w-full"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={false}
                aria-hidden="true"
              />
            </Link>
          ) : (
            <Image
              src={
                typeof banner.image === "string"
                  ? banner.image
                  : banner.image.src
              }
              alt=""
              fill
              className="h-full w-full"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={false}
              aria-hidden="true"
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default LandingBanners;

import { ChevronsLeft, ChevronsRight } from "lucide-react";

interface LandingArrowsProps {
  isRTL: boolean;
  nextSlide: () => void;
  prevSlide: () => void;
}

const LandingArrows = ({ isRTL, nextSlide, prevSlide }: LandingArrowsProps) => {
  return (
    <>
      {/* Prev Button */}
      <button
        onClick={isRTL ? nextSlide : prevSlide}
        className={`group absolute top-0 z-20 hidden h-full items-center md:flex ${
          isRTL ? "-right-11" : "-left-1"
        }`}
      >
        {!isRTL ? (
          <>
            <svg
              width="44"
              height="502"
              viewBox="0 0 44 502"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="duration-400 inline-block h-full w-auto origin-left scale-x-0 transition-transform group-hover:scale-x-[2]"
            >
              <path
                className="fill-white/10 transition duration-200 group-hover:fill-white"
                d="M0.999973 501C32.9999 301.5 42.9999 308 42.9999 252.5C42.9999 197 29.4999 189 1.00002 0.999996L0.999973 501Z"
              />
            </svg>
            <div className="flex h-10 w-10 translate-x-7 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:-translate-x-7 group-hover:bg-transparent group-hover:text-gray-600">
              <ChevronsLeft size={25} />
            </div>
          </>
        ) : (
          <>
            <div className="z-10 flex h-10 w-10 -translate-x-20 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:-translate-x-12 group-hover:bg-transparent group-hover:text-gray-600">
              <ChevronsRight size={25} />
            </div>
            <svg
              width="44"
              height="501"
              viewBox="0 0 44 501"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="duration-400 inline-block h-full w-auto origin-right scale-x-0 transition-transform group-hover:scale-x-[2]"
            >
              <path
                className="fill-white/10 transition duration-200 group-hover:fill-white"
                d="M42.9999 0.5C11 200 1 193.5 1 249C1 304.5 14.5 312.5 42.9999 500.5V0.5Z"
              />
            </svg>
          </>
        )}
      </button>

      {/* Next Button */}
      <button
        onClick={isRTL ? prevSlide : nextSlide}
        className={`group absolute top-0 z-20 hidden h-full items-center md:flex ${
          isRTL ? "-left-11" : "-right-1"
        }`}
      >
        {!isRTL ? (
          <>
            <div className="z-10 flex h-10 w-10 -translate-x-7 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:translate-x-7 group-hover:bg-transparent group-hover:text-gray-600">
              <ChevronsRight size={25} />
            </div>
            <svg
              width="44"
              height="501"
              viewBox="0 0 44 501"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="duration-400 inline-block h-full w-auto origin-right scale-x-0 transition-transform group-hover:scale-x-[2]"
            >
              <path
                className="fill-white/10 transition duration-200 group-hover:fill-white"
                d="M42.9999 0.5C11 200 1 193.5 1 249C1 304.5 14.5 312.5 42.9999 500.5V0.5Z"
              />
            </svg>
          </>
        ) : (
          <>
            <svg
              width="44"
              height="502"
              viewBox="0 0 44 502"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="duration-400 inline-block h-full w-auto origin-left scale-x-0 transition-transform group-hover:scale-x-[2]"
            >
              <path
                className="fill-white/10 transition duration-200 group-hover:fill-white"
                d="M0.999973 501C32.9999 301.5 42.9999 308 42.9999 252.5C42.9999 197 29.4999 189 1.00002 0.999996L0.999973 501Z"
              />
            </svg>
            <div className="flex h-10 w-10 translate-x-20 items-center justify-center rounded-full bg-white/25 text-white transition duration-200 group-hover:translate-x-12 group-hover:bg-transparent group-hover:text-gray-600">
              <ChevronsLeft size={25} />
            </div>
          </>
        )}
      </button>
    </>
  );
};

export default LandingArrows;

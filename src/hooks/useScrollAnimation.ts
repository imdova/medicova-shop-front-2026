"use client";
import { useEffect } from "react";

export function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.classList.contains("fade-in")) {
              entry.target.classList.add("opacity-100");
              entry.target.classList.remove("opacity-0");
            } else if (entry.target.classList.contains("slide-up")) {
              entry.target.classList.add("translate-y-0", "opacity-100");
              entry.target.classList.remove("translate-y-10", "opacity-0");
            } else if (entry.target.classList.contains("slide-left")) {
              entry.target.classList.add("translate-x-0", "opacity-100");
              entry.target.classList.remove("-translate-x-10", "opacity-0");
            } else if (entry.target.classList.contains("zoom-in")) {
              entry.target.classList.add("scale-100", "opacity-100");
              entry.target.classList.remove("scale-75", "opacity-0");
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px" },
    );

    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));

    return () => elements.forEach((el) => observer.unobserve(el));
  }, []);
}

// Example Component
// import React from "react";

// export function AnimatedSection() {
//   useScrollAnimation();

//   return (
//     <div className="space-y-8 p-10">
//       <div className="animate-on-scroll fade-in opacity-0 transition-all duration-700 ease-in-out bg-blue-500 text-white p-6 rounded-xl shadow-lg">
//         Fade In Animation
//       </div>
//       <div className="animate-on-scroll slide-up opacity-0 translate-y-10 transition-all duration-700 ease-in-out bg-green-500 text-white p-6 rounded-xl shadow-lg">
//         Slide Up Animation
//       </div>
//       <div className="animate-on-scroll slide-left opacity-0 -translate-x-10 transition-all duration-700 ease-in-out bg-red-500 text-white p-6 rounded-xl shadow-lg">
//         Slide Left Animation
//       </div>
//       <div className="animate-on-scroll zoom-in opacity-0 scale-75 transition-all duration-700 ease-in-out bg-yellow-500 text-white p-6 rounded-xl shadow-lg">
//         Zoom In Animation
//       </div>
//     </div>
//   );
// }

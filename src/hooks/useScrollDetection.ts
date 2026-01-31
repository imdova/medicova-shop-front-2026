"use client";
import { useState, useEffect } from "react";

const useScrollDetection = (triggerHeight = 2) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      setIsScrolled(window.scrollY >= triggerHeight);
    };

    checkScrollPosition(); // Run immediately on mount
    window.addEventListener("scroll", checkScrollPosition);

    return () => window.removeEventListener("scroll", checkScrollPosition);
  }, [triggerHeight]);

  return isScrolled;
};

export default useScrollDetection;

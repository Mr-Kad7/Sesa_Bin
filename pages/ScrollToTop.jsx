"use client";

import { useEffect, useState } from "react";
import { FaArrowUp } from "react-icons/fa";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () =>
      window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {visible && (
        <button
          onClick={scrollToTop}
          className="
            fixed
            bottom-8
            right-8
            z-50
            w-14
            h-14
            rounded-full
            bg-green-600
            text-white
            shadow-xl
            hover:bg-green-700
            hover:scale-110
            transition-all
            duration-300
          "
        >
          <FaArrowUp className="mx-auto" />
        </button>
      )}
    </>
  );
}
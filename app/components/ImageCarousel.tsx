"use client";

import { useState, MouseEvent } from "react";
import Image from "next/image";

interface ImageCarouselProps {
  images: string[];
  aspect?: "wide" | "square" | "tall";
  rounded?: boolean;
}

export default function ImageCarousel({
  images,
  aspect = "wide",
  rounded = true,
}: ImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const go = (dir: "prev" | "next") => {
    setIndex((prev) => {
      if (dir === "prev") return prev === 0 ? images.length - 1 : prev - 1;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  const handleNavClick = (
    e: MouseEvent<HTMLDivElement>,
    dir: "prev" | "next"
  ) => {
    // IMPORTANT: don't let the parent button (ListingCard) fire
    e.stopPropagation();
    e.preventDefault();
    go(dir);
  };

  const handleDotClick = (e: MouseEvent<HTMLDivElement>, i: number) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex(i);
  };

  const aspectClass =
    aspect === "wide"
      ? "aspect-[4/3]"
      : aspect === "tall"
      ? "aspect-[3/4]"
      : "aspect-square";

  return (
    <div
      className={`relative w-full ${aspectClass} overflow-hidden ${
        rounded ? "rounded-xl" : ""
      }`}
    >
      <Image
        src={images[index]}
        alt="Property photo"
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 400px"
      />

      {images.length > 1 && (
        <>
          {/* Prev */}
          <div
            onClick={(e) => handleNavClick(e, "prev")}
            role="button"
            aria-label="Previous image"
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur select-none"
          >
            ‹
          </div>

          {/* Next */}
          <div
            onClick={(e) => handleNavClick(e, "next")}
            role="button"
            aria-label="Next image"
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-xs text-white backdrop-blur select-none"
          >
            ›
          </div>

          {/* Dots */}
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1">
            {images.map((_, i) => (
              <div
                key={i}
                onClick={(e) => handleDotClick(e, i)}
                role="button"
                className={`h-1.5 w-1.5 rounded-full ${
                  i === index ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
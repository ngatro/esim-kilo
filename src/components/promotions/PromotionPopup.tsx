"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Promotion {
  id: number;
  title: string;
  imageUrl: string;
  link: string | null;
  badge: string | null;
}

export default function PromotionPopup() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if user dismissed previously
    const dismissed = localStorage.getItem("promo_dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Delay show by 2 seconds
    const timer = setTimeout(() => {
      fetch("/api/promotions")
        .then(res => res.json())
        .then(data => {
          if (data.promotions && data.promotions.length > 0) {
            setPromotions(data.promotions);
            setIsVisible(true);
            // Add fade-in animation after a small delay
            setTimeout(() => setIsLoaded(true), 50);
          }
        })
        .catch(() => {});
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsLoaded(false);
    setTimeout(() => {
      setIsVisible(false);
      setIsDismissed(true);
      localStorage.setItem("promo_dismissed", "true");
    }, 300);
  };

  const handleClick = () => {
    if (promotions[currentIndex]?.link) {
      // Check if external link
      if (promotions[currentIndex].link.startsWith("http")) {
        window.location.href = promotions[currentIndex].link;
      } else {
        // Internal link - navigate within website
        router.push(promotions[currentIndex].link);
      }
      // Close popup after clicking
      handleClose();
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  if (!isVisible || isDismissed || promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex];
  if (!currentPromo) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      onClick={handleClose}
    >
      <div 
        className={`relative max-w-md w-full rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 scale-100 ${isLoaded ? 'scale-100' : 'scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/20 hover:bg-white/40 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors"
        >
          ✕
        </button>

        {/* Discount Badge */}
        {currentPromo.badge && (
          <div className="absolute top-0 left-0 z-10">
            <div className="bg-red-500 text-white px-4 py-2 rounded-br-xl font-bold text-sm flex items-center gap-1">
              <span>🎁</span>
              <span>{currentPromo.badge}</span>
            </div>
          </div>
        )}

        {/* Image with gradient overlay */}
        <div 
          className="relative cursor-pointer group"
          onClick={handleClick}
        >
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
          
          {currentPromo.imageUrl ? (
            <Image
              src={currentPromo.imageUrl}
              alt={currentPromo.title}
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
          ) : (
            <div className="bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 p-8 text-center">
              <div className="text-4xl mb-2">🎉</div>
              <h3 className="text-xl font-bold text-white">{currentPromo.title}</h3>
            </div>
          )}
          
          {/* Title overlay at bottom */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">{currentPromo.title}</h3>
            
            {/* CTA Button */}
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-full flex items-center gap-2 transition-colors shadow-lg">
              <span>Shop Now</span>
              <span className="text-lg">→</span>
            </button>
          </div>
        </div>

        {/* Navigation arrows */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              ‹
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-colors"
            >
              ›
            </button>
          </>
        )}

        {/* Dots indicator */}
        {promotions.length > 1 && (
          <div className="flex justify-center gap-2 py-3 bg-slate-900">
            {promotions.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-colors ${idx === currentIndex ? "bg-orange-500" : "bg-slate-600 hover:bg-slate-500"}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion"; // Cần cài framer-motion

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

  useEffect(() => {
    const dismissed = localStorage.getItem("promo_dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    const timer = setTimeout(() => {
      fetch("/api/promotions")
        .then((res) => res.json())
        .then((data) => {
          if (data.promotions?.length > 0) {
            setPromotions(data.promotions);
            setIsVisible(true);
          }
        })
        .catch(() => {});
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("promo_dismissed", "true");
  };

  const handleClick = () => {
    const promo = promotions[currentIndex];
    if (promo?.link) {
      if (promo.link.startsWith("http")) {
        window.open(promo.link, "_blank");
      } else {
        router.push(promo.link);
      }
      handleClose();
    }
  };

  if (!isVisible || isDismissed || promotions.length === 0) return null;

  const currentPromo = promotions[currentIndex];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Overlay mờ nền */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Nội dung Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-[420px] w-full bg-white rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] group"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Nút đóng xịn sò */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-50 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-md text-white rounded-full flex items-center justify-center transition-all duration-200 border border-white/20"
          >
            <span className="text-xl">✕</span>
          </button>

          {/* Badge khuyến mãi */}
          {currentPromo.badge && (
            <div className="absolute top-5 left-0 z-40 bg-gradient-to-r from-red-600 to-orange-500 text-white px-5 py-1.5 rounded-r-full font-bold text-sm shadow-lg uppercase tracking-wider">
              ✨ {currentPromo.badge}
            </div>
          )}

          {/* Khu vực ảnh và nội dung */}
          <div className="relative aspect-[4/5] cursor-pointer" onClick={handleClick}>
            {/* Gradient phủ lên ảnh để nổi bật text */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10" />
            
            {currentPromo.imageUrl ? (
              <Image
                src={currentPromo.imageUrl}
                alt={currentPromo.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center" />
            )}

            {/* Thông tin khuyến mãi */}
            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
              <motion.h3 
                key={currentPromo.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-3xl font-extrabold text-white mb-4 leading-tight drop-shadow-md"
              >
                {currentPromo.title}
              </motion.h3>
              
              <button className="relative overflow-hidden bg-white text-black font-black px-8 py-4 rounded-xl flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-orange-500/40">
                <span>MUA NGAY</span>
                <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">→</span>
              </button>
            </div>
          </div>

          {/* Điều hướng (chỉ hiện khi có > 1 promo) */}
          {promotions.length > 1 && (
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between px-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev - 1 + promotions.length) % promotions.length); }} 
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                ❮
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCurrentIndex(prev => (prev + 1) % promotions.length); }} 
                className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors">
                ❯
              </button>
            </div>
          )}

          {/* Dots Indicator bọc trong khung kính */}
          {promotions.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30 bg-white/10 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? "w-6 bg-orange-500" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
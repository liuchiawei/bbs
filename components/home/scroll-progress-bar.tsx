"use client";
import { useScroll, useTransform, motion } from "motion/react";

export default function ScrollProgressBar() {
  // スクロール進捗を追跡（ページ全体）
  // 追蹤整個頁面的滾動進度
  const { scrollYProgress } = useScroll();

  // scaleY を使用して GPU アクセラレーションを活用
  // 使用 scaleY 以利用 GPU 加速
  const scaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // 透明度アニメーション（最初の10%でフェードイン）
  // 透明度動畫（在前 10% 的滾動中淡入）
  const opacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div
      className="fixed left-12 top-0 h-screen w-[2px] pointer-events-none -z-10 hidden md:block"
      style={{ contain: "layout style paint" }}
    >
      {/* 背景トラック（静的な部分） */}
      {/* 背景軌道（靜態部分） */}
      <div className="absolute inset-0 w-[2px] bg-gradient-to-b from-transparent from-0% via-neutral-200 dark:via-neutral-700 to-transparent " />

      {/* 進捗バー（動的な部分） */}
      {/* 進度條（動態部分） */}
      <motion.div
        style={{
          transformOrigin: "top", // 從頂部開始縮放
          scaleY: scaleY,
          opacity: opacity,
          willChange: "transform",
        }}
        className="absolute top-0 left-0 w-[2px] h-full bg-gradient-to-b from-rose-600 via-orange-500 to-transparent from-0% via-10% rounded-full"
      />
    </div>
  );
};

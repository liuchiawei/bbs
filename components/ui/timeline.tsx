"use client";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

export const Timeline = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setHeight(rect.height);
    }
  }, [ref]);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 10%", "end 75%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={ref} className="absolute top-0 w-full h-full min-h-screen pb-20 z-0">
      <div
        style={{
          height: height + "px",
        }}
        className="absolute md:left-8 left-8 top-0 overflow-hidden w-[2px] bg-[linear-gradient(to_bottom,var(--tw-gradient-stops))] from-transparent from-0% via-neutral-200 dark:via-neutral-700 to-transparent to-99%  [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)] "
      >
        <motion.div
          style={{
            height: heightTransform,
            opacity: opacityTransform,
          }}
          className="absolute inset-x-0 top-0 w-[2px] bg-linear-to-t from-rose-500 via-orange-500 to-transparent from-0% via-10% rounded-full"
        />
      </div>
    </div>
  );
};

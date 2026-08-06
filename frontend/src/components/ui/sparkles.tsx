"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  type: "dot" | "star";
  rotation: number;
}

export const SparklesBackground = ({
  sparkleCount = 40,
  className = "",
}: {
  sparkleCount?: number;
  className?: string;
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSparkles = Array.from({ length: sparkleCount }).map((_, i): Sparkle => {
      const isStar = Math.random() > 0.6; // 40% chance to be a curvy star
      const baseSize = Math.random() * 3 + 1;
      return {
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        size: isStar ? baseSize * 3 + 4 : baseSize, // Stars are bigger
        duration: Math.random() * 4 + 4,
        delay: Math.random() * 5,
        type: (isStar ? "star" : "dot") as "star" | "dot",
        rotation: Math.random() * 360,
      };
    });
    setSparkles(newSparkles as Sparkle[]);
  }, [sparkleCount]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Update cursor glow position
      containerRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
      containerRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

      // Update particles for repulsion
      const wrappers = containerRef.current.querySelectorAll(".sparkle-wrapper");
      wrappers.forEach((wrapper: any) => {
        const particle = wrapper.firstElementChild;
        if (!particle) return;

        const pRect = particle.getBoundingClientRect();
        
        // Remove previous transform to get true position
        const currentPushX = parseFloat(wrapper.dataset.pushX || "0");
        const currentPushY = parseFloat(wrapper.dataset.pushY || "0");
        
        const truePx = pRect.left + pRect.width / 2 - currentPushX;
        const truePy = pRect.top + pRect.height / 2 - currentPushY;
        
        const dx = truePx - e.clientX;
        const dy = truePy - e.clientY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const maxDist = 140; // Repel radius
        let pushX = 0;
        let pushY = 0;
        
        if (dist < maxDist && dist > 0) {
          const force = Math.pow((maxDist - dist) / maxDist, 1.2); 
          pushX = (dx / dist) * force * 60; // push up to 60px away
          pushY = (dy / dist) * force * 60;
        }

        wrapper.style.transform = `translate(${pushX}px, ${pushY}px)`;
        wrapper.dataset.pushX = pushX.toString();
        wrapper.dataset.pushY = pushY.toString();
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="sparkle-wrapper absolute inset-0 transition-transform duration-300 ease-out"
        >
          {/* @ts-ignore framer-motion React 19 typings bug */}
          <motion.div
            className="absolute flex items-center justify-center text-cyan-400 dark:text-cyan-300"
            style={{
              left: `${sparkle.x}%`,
              width: sparkle.size,
              height: sparkle.size,
            }}
            initial={{
              y: `${sparkle.y}vh`,
              opacity: 0,
              scale: 0,
              rotate: sparkle.rotation,
            }}
            animate={{
              y: "120vh", 
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 0.8, 0.2],
              rotate: sparkle.rotation + (sparkle.type === "star" ? 180 : 0), // Gentle spin for stars
            }}
            transition={{
              duration: sparkle.duration,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {sparkle.type === "dot" ? (
              <div 
                className="w-full h-full rounded-full bg-cyan-400 dark:bg-cyan-300"
                style={{ boxShadow: `0 0 ${sparkle.size * 2}px rgba(34, 211, 238, 0.6)` }}
              />
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-full h-full drop-shadow-[0_0_4px_rgba(34,211,238,0.8)]"
              >
                <path d="M12 0C12.5 7 17 11.5 24 12C17 12.5 12.5 17 12 24C11.5 17 7 12.5 0 12C7 11.5 11.5 7 12 0Z" />
              </svg>
            )}
          </motion.div>
        </div>
      ))}
    </div>
  );
};

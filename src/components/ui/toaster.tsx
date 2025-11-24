"use client";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOAST_GAP = 10; // Space between toasts when expanded
const TOAST_CONDENSED_PEEK = 10; // pixels of toast visible when condensed

export type ToastPosition =
  | "top-center"
  | "top-left"
  | "top-right"
  | "bottom-center"
  | "bottom-left"
  | "bottom-right";

const POSITION_MAP: Record<ToastPosition, string> = {
  "top-center": "top-0 left-1/2 -translate-x-1/2",
  "top-left": "top-0 left-0",
  "top-right": "top-0 right-0",
  "bottom-center": "bottom-0 left-1/2 -translate-x-1/2",
  "bottom-left": "bottom-0 left-0",
  "bottom-right": "bottom-0 right-0",
};

const SLIDE_MAP: Record<ToastPosition, { x: number; y: number }> = {
  "top-center": { x: 0, y: -100 },
  "bottom-center": { x: 0, y: 100 },
  "top-left": { x: -100, y: 0 },
  "bottom-left": { x: -100, y: 0 },
  "top-right": { x: 100, y: 0 },
  "bottom-right": { x: 100, y: 0 },
};

export function Toaster({ position = "top-center" }: { position?: ToastPosition }) {
  const { toasts, dismiss, isPaused, setPaused } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const isTop = position.startsWith("top");
  const [heights, setHeights] = useState<Record<string, number>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldExpand = isExpanded;
  
  // For top positions: newest first (index 0)
  // For bottom positions: oldest first (index 0) so newest appears at bottom
  const orderedToasts = isTop ? [...toasts] : [...toasts].reverse();

  function handleLayout(id: string, height: number) {
    setHeights(prev => ({ ...prev, [id]: height }));
  }

  function getOffset(visualIndex: number, expanded: boolean) {
    let offset = 0;

    // Calculate offset based on all toasts that come before this one visually
    for (let i = 0; i < visualIndex; i++) {
      const currentToastId = orderedToasts[i].id;
      const currentHeight = heights[currentToastId] || 60;
      const nextToastId = orderedToasts[i + 1]?.id;
      const nextHeight = nextToastId ? (heights[nextToastId] || 60) : 60;

      if (expanded) {
        offset += currentHeight + TOAST_GAP;
      } else {
        // In condensed mode: we want to show TOAST_CONDENSED_PEEK of the current toast
        // But if the *current* toast (i) is taller than the *next* toast (i+1),
        // we need to offset more to keep the next toast visible.
        // --- FIX: Swapped nextHeight and currentHeight in the subtraction ---
        const peekAmount = Math.max(TOAST_CONDENSED_PEEK, currentHeight - nextHeight + TOAST_CONDENSED_PEEK);
        offset += peekAmount;
      }
    }

    return offset;
  }

  // Calculate total container height
  const totalHeight = (() => {
    if (orderedToasts.length === 0) return 0;
    
    if (shouldExpand) {
      // Sum all toast heights with gaps
      return orderedToasts.reduce((total, toast, index) => {
        const height = heights[toast.id] || 60;
        return total + height + (index < orderedToasts.length - 1 ? TOAST_GAP : 0);
      }, 0);
    } else {
      // Condensed view: calculate based on actual offsets used
      let total = 0;
      
      for (let i = 0; i < orderedToasts.length; i++) {
        if (i === orderedToasts.length - 1) {
          // Last toast: add its full height
          total += heights[orderedToasts[i].id] || 60;
        } else {
          const currentHeight = heights[orderedToasts[i].id] || 60;
          const nextHeight = heights[orderedToasts[i + 1].id] || 60;
          // --- FIX: Swapped nextHeight and currentHeight in the subtraction ---
          const peekAmount = Math.max(TOAST_CONDENSED_PEEK, currentHeight - nextHeight + TOAST_CONDENSED_PEEK);
          total += peekAmount;
        }
      }
      
      return total;
    }
  })();

  return (
    <div
      className={`fixed z-200 p-4 pointer-events-none ${POSITION_MAP[position]}`}
      style={{ width: "20rem" }}
    >
      <div
        ref={containerRef}
        onMouseEnter={() => {
          setIsExpanded(true);
          setPaused(true);
        }}
        onMouseLeave={() => {
          setIsExpanded(false);
          setPaused(false);
        }}
        className="relative pointer-events-auto"
        style={{
          height: `${totalHeight}px`,
          transition: 'height 0.2s ease-out'
        }}
      >
        <AnimatePresence>
          {orderedToasts.map(({ id, title, description, startTime: _startTime, ...props }, visualIndex) => {
            const positionOffset = getOffset(visualIndex, shouldExpand);

            const maxZIndex = toasts.length;
            const zIndex = maxZIndex - visualIndex;
            const scale = shouldExpand ? 1 : Math.max(0.9, 1 - visualIndex * 0.03);

            const positionStyle = isTop
              ? { top: `${positionOffset}px` }
              : { bottom: `${positionOffset}px` };

            return (
              <motion.div
                key={id}
                layoutId={id}
                initial={{
                  opacity: 0,
                  scale: 0.95,
                  x: SLIDE_MAP[position].x,
                  y: SLIDE_MAP[position].y,
                }}
                animate={{
                  opacity: 1,
                  scale,
                  x: 0,
                  y: 0,
                  ...positionStyle,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  x: SLIDE_MAP[position].x * 0.6,
                  y: SLIDE_MAP[position].y * 0.6,
                }}
                style={{
                  position: "absolute",
                  width: "100%",
                  zIndex,
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.5,
                }}
                className="pointer-events-auto"
              >
                <Toast
                  id={id}
                  title={title}
                  description={description}
                  position={position}
                  onClose={() => dismiss(id)}
                  onLayout={handleLayout}
                  isPaused={isPaused}
                  {...props}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
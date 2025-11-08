"use client";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const TOAST_FULL_HEIGHT = 80;
const TOAST_CONDENSED_OVERLAP = 0;

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
      className="fixed top-0 left-1/2 -translate-x-1/2 z-200 p-4 w-full max-w-sm pointer-events-none"
    >
      <div className="flex flex-col-reverse gap-2 pointer-events-auto">
        <AnimatePresence>
          {toasts.map(({ id, title, description, ...props }, index) => {
            const totalToasts = toasts.length;
            // Most recent toast is at index 0, so we calculate from there
            const visualIndex = index;
            const yOffsetCondensed = visualIndex * TOAST_CONDENSED_OVERLAP;
            const y = isExpanded ? 0 : -yOffsetCondensed;
            // Highest z-index for most recent (index 0)
            const zIndex = totalToasts - visualIndex;
            // Most recent toast (index 0) should be largest (scale = 1)
            const scale = isExpanded ? 1 : Math.max(0.9, 1 - visualIndex * 0.03);

            return (
              <motion.div
                key={id}
                layoutId={id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: 1,
                  y: y,
                  scale: scale,
                  zIndex: zIndex,
                  transition: { type: "spring", stiffness: 400, damping: 30, mass: 0.5 },
                }}
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                style={{
                  position: "relative",
                  marginBottom: isExpanded ? "8px" : `${-TOAST_FULL_HEIGHT + TOAST_CONDENSED_OVERLAP + 8}px`,
                }}
                className="w-full"
              >
                <Toast
                  title={title}
                  description={description}
                  onClose={() => dismiss(id)}
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
"use client";
import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Modal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.75 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.75 },
  };

  return (
    <AnimatePresence mode="wait">
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black z-110"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-111 pointer-events-none overflow-y-auto overflow-x-hidden p-4">
            <motion.div
              key="modal"
              className="pointer-events-auto my-auto"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
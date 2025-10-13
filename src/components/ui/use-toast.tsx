"use client";
import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 5; // Max number of toasts to show at once
const TOAST_REMOVE_DELAY = 5000; // 5 seconds

type ToasterToast = ToastProps & {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
};

// --- Actions to manipulate the toast state ---
type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

// --- Helper function to add a toast ---
const addToasts = (state: State, toast: ToasterToast): State => {
  return {
    ...state,
    toasts: [toast, ...state.toasts].slice(0, TOAST_LIMIT),
  };
};

// --- Reducer to manage state transitions ---
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return addToasts(state, action.toast);

    case "DISMISS_TOAST": {
      const { toastId } = action;
      if (toastId) {
        // Clear timeout and remove
        clearTimeout(toastTimeouts.get(toastId));
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      }
      // Dismiss all
      state.toasts.forEach((toast) => {
        clearTimeout(toastTimeouts.get(toast.id));
      });
      return { ...state, toasts: [] };
    }
    
    // Used internally by the timeout
    case "REMOVE_TOAST":
      if (!action.toastId) return state;
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    default:
      return state;
  }
};

// --- React Context and Provider ---
interface ToastContextValue {
  toasts: ToasterToast[];
  toast: (props: Omit<ToasterToast, "id">) => void;
  dismiss: (toastId?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] });

  const toast = React.useCallback((props: Omit<ToasterToast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9); // Generate random ID
    const newToast = { id, ...props };

    dispatch({ type: "ADD_TOAST", toast: newToast });

    // Schedule removal
    const timeout = setTimeout(() => {
      dispatch({ type: "REMOVE_TOAST", toastId: id });
    }, TOAST_REMOVE_DELAY);
    
    toastTimeouts.set(id, timeout);
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
  }, []);

  // This effect runs once on mount to check for a persisted toast
  React.useEffect(() => {
    const shouldShowToast = localStorage.getItem("theme-reset-toast");

    if (shouldShowToast) {
      toast({
        variant: "success",
        title: "Success!",
        description: "Your settings were saved successfully.",
      });
      // Clean up the flag so it doesn't show again
      localStorage.removeItem("theme-reset-toast");
    }
    // The dependency array ensures this runs only when the toast function is created
  }, [toast]);
  
  return (
    <ToastContext.Provider value={{ ...state, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  );
}

// --- Custom hook for easy access ---
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
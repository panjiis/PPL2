"use client";
import * as React from "react";
import type { ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 3; // Max number of toasts to show at once
const TOAST_REMOVE_DELAY = 5000; // 5 seconds (default duration)

type ToasterToast = ToastProps & {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  duration?: number; // Original total duration
  remainingTime: number; // Time left, counts down
  startTime: number; // Date.now() when timer started/resumed
};

// --- Actions to manipulate the toast state ---
type Action =
  | { type: "ADD_TOAST"; toast: ToasterToast }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST"; toastId?: string }
  | { type: "SET_PAUSED"; isPaused: boolean }
  | { type: "UPDATE_REMAINING_TIME"; now: number } // ADDED
  | { type: "UPDATE_START_TIME"; now: number }; // ADDED

interface State {
  toasts: ToasterToast[];
  isPaused: boolean;
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
        toastTimeouts.delete(toastId);
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== toastId),
        };
      }
      // Dismiss all
      state.toasts.forEach((toast) => {
        clearTimeout(toastTimeouts.get(toast.id));
      });
      toastTimeouts.clear();
      return { ...state, toasts: [] };
    }
    
    // Used internally by the timeout
    case "REMOVE_TOAST":
      if (!action.toastId) return state;
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };

    case "SET_PAUSED":
      return {
        ...state,
        isPaused: action.isPaused,
      };

    // ADDED: Update remaining time when pausing
    case "UPDATE_REMAINING_TIME":
      return {
        ...state,
        toasts: state.toasts.map(t => ({
          ...t,
          // Calculate elapsed time and subtract it from remaining time
          remainingTime: t.remainingTime - (action.now - t.startTime),
        })),
      };
      
    // ADDED: Update start time when resuming
    case "UPDATE_START_TIME":
      return {
        ...state,
        toasts: state.toasts.map(t => ({
          ...t,
          startTime: action.now,
        })),
      };

    default:
      return state;
  }
};

// --- React Context and Provider ---
interface ToastContextValue {
  toasts: ToasterToast[];
  // MODIFIED: Omit new internal props from the toast function
  toast: (props: Omit<ToasterToast, "id" | "remainingTime" | "startTime" | "isPaused">) => void;
  dismiss: (toastId?: string) => void;
  isPaused: boolean;
  setPaused: (isPaused: boolean) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [], isPaused: false });

  // MODIFIED: setPaused now dispatches time updates
  const setPaused = React.useCallback((isPaused: boolean) => {
    // Prevent redundant updates
    if (state.isPaused === isPaused) return;

    const now = Date.now();
    if (isPaused) {
      // Pausing: Update remaining time *before* setting paused state
      dispatch({ type: "UPDATE_REMAINING_TIME", now });
      dispatch({ type: "SET_PAUSED", isPaused: true });
    } else {
      // Resuming: Update start time *before* setting unpaused state
      dispatch({ type: "UPDATE_START_TIME", now });
      dispatch({ type: "SET_PAUSED", isPaused: false });
    }
  }, [state.isPaused]); // Dependency on state.isPaused is crucial

  const toast = React.useCallback((props: Omit<ToasterToast, "id" | "remainingTime" | "startTime" | "isPaused">) => {
    const id = Math.random().toString(36).substring(2, 9); // Generate random ID
    
    // MODIFIED: Use provided duration or default
    const duration = props.duration ?? TOAST_REMOVE_DELAY;
    const newToast: ToasterToast = { // MODIFIED: Create full ToasterToast
      id,
      ...props,
      duration,
      remainingTime: duration, // Initially, remaining time is full duration
      startTime: Date.now(), // Set initial start time
    };

    dispatch({ type: "ADD_TOAST", toast: newToast });
  }, []);

  const dismiss = React.useCallback((toastId?: string) => {
    dispatch({ type: "DISMISS_TOAST", toastId });
  }, []);

  // MODIFIED: Effect now uses remainingTime
  React.useEffect(() => {
    const toastIdsInState = new Set(state.toasts.map((t) => t.id));

    if (state.isPaused) {
      // PAUSED: Clear all running timers
      toastTimeouts.forEach((timeout) => clearTimeout(timeout));
      toastTimeouts.clear();
    } else {
      // RESUMED: Start timers for any toasts that don't have one
      state.toasts.forEach((toast) => {
        if (!toastTimeouts.has(toast.id) && toast.remainingTime > 0) {
          // MODIFIED: Use remainingTime for the timeout duration
          const timeout = setTimeout(() => {
            dispatch({ type: "REMOVE_TOAST", toastId: toast.id });
            toastTimeouts.delete(toast.id); // Clean up map on removal
          }, toast.remainingTime); // Use remainingTime
          toastTimeouts.set(toast.id, timeout);
        }
      });
    }

    // CLEANUP: Remove timers for any toasts that were dismissed/removed
    toastTimeouts.forEach((timeout, id) => {
      if (!toastIdsInState.has(id)) {
        clearTimeout(timeout);
        toastTimeouts.delete(id);
      }
    });
  }, [state.toasts, state.isPaused]);


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
    <ToastContext.Provider value={{ ...state, toast, dismiss, setPaused }}>
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
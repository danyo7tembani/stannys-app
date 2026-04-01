import { create } from "zustand";

export type ToastVariant = "success" | "error";

type ToastState = {
  visible: boolean;
  exiting: boolean;
  variant: ToastVariant | null;
  message: string;
  show: (variant: ToastVariant, message: string) => void;
  hide: () => void;
};

let hideTimer: ReturnType<typeof setTimeout> | null = null;
let exitTimer: ReturnType<typeof setTimeout> | null = null;

const DISPLAY_MS = 2600;
const EXIT_MS = 320;

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  exiting: false,
  variant: null,
  message: "",

  show: (variant, message) => {
    if (hideTimer) clearTimeout(hideTimer);
    if (exitTimer) clearTimeout(exitTimer);
    set({ visible: true, exiting: false, variant, message });
    hideTimer = setTimeout(() => {
      hideTimer = null;
      set({ exiting: true });
      exitTimer = setTimeout(() => {
        exitTimer = null;
        set({ visible: false, exiting: false, variant: null, message: "" });
      }, EXIT_MS);
    }, DISPLAY_MS);
  },

  hide: () => {
    if (hideTimer) clearTimeout(hideTimer);
    if (exitTimer) clearTimeout(exitTimer);
    hideTimer = null;
    exitTimer = null;
    set({ visible: false, exiting: false, variant: null, message: "" });
  },
}));

export function showSuccessToast(message: string): void {
  useToastStore.getState().show("success", message);
}

export function showErrorToast(message: string): void {
  useToastStore.getState().show("error", message);
}

import { create } from "zustand";

interface UIState {
  // Toast notifications
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    type: "default" | "success" | "error" | "warning";
  }>;
  
  // Theme
  theme: "system" | "light" | "dark";
  
  // Upload progress
  uploadProgress: number;
  isUploading: boolean;
  
  // Keyboard shortcuts modal
  showKeyboardShortcuts: boolean;
  
  // Actions
  addToast: (toast: Omit<UIState["toasts"][0], "id">) => void;
  removeToast: (id: string) => void;
  setTheme: (theme: UIState["theme"]) => void;
  setUploadProgress: (progress: number) => void;
  setIsUploading: (uploading: boolean) => void;
  toggleKeyboardShortcuts: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  theme: "system",
  uploadProgress: 0,
  isUploading: false,
  showKeyboardShortcuts: false,
  
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    
    // Auto-remove toast after 5 seconds
    setTimeout(() => {
      get().removeToast(id);
    }, 5000);
  },
  
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
  
  setTheme: (theme) => {
    set({ theme });
  },
  
  setUploadProgress: (progress) => {
    set({ uploadProgress: progress });
  },
  
  setIsUploading: (uploading) => {
    set({ isUploading: uploading });
  },
  
  toggleKeyboardShortcuts: () => {
    set((state) => ({ showKeyboardShortcuts: !state.showKeyboardShortcuts }));
  },
}));

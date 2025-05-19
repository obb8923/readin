import { create } from 'zustand';

interface SnackBarState {
  isVisible: boolean;
  text: string;
  buttonText: string;
  onPress: () => void;
  show: (text: string, buttonText: string, onPress: () => void) => void;
  hide: () => void;
}

export const useSnackBarStore = create<SnackBarState>((set) => ({
  isVisible: false,
  text: '',
  buttonText: '',
  onPress: () => {},
  show: (text, buttonText, onPress) => set({ isVisible: true, text, buttonText, onPress }),
  hide: () => set({ isVisible: false }),
}));

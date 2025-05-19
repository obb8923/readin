import { create } from 'zustand';
import { Book, ReviewWithBook } from '../libs/supabase/supabaseOperations';

export type ModalType = 'modifyReview' | 'addReview' | 'addBook';
interface ModalState {
  isVisible: boolean;
  modalType: ModalType; // 여러 종류의 모달을 구분할 수 있음
  reviewWithBook: ReviewWithBook|null;
  book: Book|null;
  show: (type: ModalType, reviewWithBook: ReviewWithBook|null, book: Book|null) => void;
  hide: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isVisible: false,
  modalType: 'addBook',
  reviewWithBook: null,
  book: null,
  show: (type, reviewWithBook, book) => set({ isVisible: true, modalType: type, reviewWithBook: reviewWithBook, book: book }),
  hide: () => set({ isVisible: false, modalType: 'addBook', reviewWithBook: null, book: null }),
}));
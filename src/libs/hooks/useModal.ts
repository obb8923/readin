import { useModalStore } from '../../store/modalStore';

const useModal = () => {
  const show = useModalStore((state) => state.show);
  const hide = useModalStore((state) => state.hide);
  return { show, hide };
};

export default useModal;
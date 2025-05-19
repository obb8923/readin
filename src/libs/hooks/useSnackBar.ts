  import { useSnackBarStore } from '../../store/snackbarStore';

const useSnackBar = () => {
  const show = useSnackBarStore((state) => state.show);
  const hide = useSnackBarStore((state) => state.hide);
  return { show, hide };
};

export default useSnackBar;
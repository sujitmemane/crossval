import { useNavigate } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';
import { paths } from '../routes/paths';

export function useAppNavigate() {
  const navigate = useNavigate();

  return {
    toDashboard: (options?: NavigateOptions) => navigate(paths.dashboard.home, options),
    toSignIn: (options?: NavigateOptions) => navigate(paths.auth.signIn, options),
  };
}

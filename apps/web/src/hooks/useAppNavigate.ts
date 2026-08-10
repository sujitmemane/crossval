import { useNavigate } from 'react-router-dom';
import type { NavigateOptions } from 'react-router-dom';
import { paths } from '../routes/paths';

export function useAppNavigate() {
  const navigate = useNavigate();

  return (selector: (routes: typeof paths) => string, options?: NavigateOptions) => navigate(selector(paths), options);
}

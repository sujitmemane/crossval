import { Outlet } from 'react-router-dom';
import logo from '../..//public/auth-hero.png';
import { CrossvalLogo } from '../components/ui/CrossvalLogo';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-10 lg:w-1/2 lg:px-16 xl:px-24">
        <div className="mx-auto w-full max-w-sm">
          <CrossvalLogo className="mb-10" />
          <Outlet />
        </div>
      </div>

      <div className="relative hidden w-1/2 bg-surfaceMuted lg:block">
        <img src={logo} alt="" className="h-full w-full object-cover" />
      </div>
    </div>
  );
}

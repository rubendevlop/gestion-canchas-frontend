import { Link, Outlet, useLocation } from 'react-router-dom';
import { CalendarRange, Home, LogOut, Search, ShoppingBag, User } from 'lucide-react';
import { logout } from '../auth';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from '../components/BrandLogo';

const NAV = [
  { name: 'Inicio', path: '/portal', icon: Home },
  { name: 'Mis Reservas', path: '/portal/mis-reservas', icon: CalendarRange },
  { name: 'Mis Compras', path: '/portal/mis-compras', icon: ShoppingBag },
  { name: 'Mi Perfil', path: '/portal/perfil', icon: User },
];

export default function PortalLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="theme-shell-dark overflow-hidden font-body text-on_surface">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgb(var(--primary-green-rgb)/0.1),transparent_48%)]" />
        <div className="absolute left-[-6rem] top-[6rem] h-[18rem] w-[18rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <header className="app-shell-header sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link to="/portal" className="app-shell-logo shrink-0">
              <BrandLogo imageClassName="h-9 w-auto sm:h-10" />
            </Link>

            <div className="flex items-center gap-2">
              <div className="app-shell-soft flex items-center gap-2 rounded-full px-2 py-2">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="avatar" className="h-8 w-8 rounded-full" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/18 text-sm font-bold text-primary">
                    {user?.displayName?.charAt(0) || 'U'}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2 text-sm font-medium text-white transition-colors hover:border-primary/25 hover:bg-white/[0.08] hover:text-primary sm:px-4"
                title="Cerrar sesion"
              >
                <LogOut size={15} />
                <span className="hidden lg:inline">Cerrar sesion</span>
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="relative hidden max-w-md flex-1 md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/85" size={16} />
              <input
                type="text"
                placeholder="Buscar un complejo..."
                className="app-shell-input rounded-full py-2.5 pl-11 pr-5"
              />
            </div>

            <div className="overflow-x-auto pb-1">
              <nav className="flex min-w-max items-center gap-2">
                {NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive
                          ? 'app-shell-pill-active app-shell-pill'
                          : 'app-shell-pill hover:border-primary/25 hover:bg-white/[0.08] hover:text-white'
                      }`}
                    >
                      <Icon size={16} className={isActive ? 'text-primary' : 'text-brand_gray'} />
                      <span className="whitespace-nowrap">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}

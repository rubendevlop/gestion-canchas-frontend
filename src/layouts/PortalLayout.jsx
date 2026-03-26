import { Link, Outlet, useLocation } from 'react-router-dom';
import { CalendarRange, Home, LogOut, Search, User } from 'lucide-react';
import { logout } from '../auth';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { name: 'Inicio', path: '/portal', icon: Home },
  { name: 'Mis Reservas', path: '/portal/mis-reservas', icon: CalendarRange },
  { name: 'Mi Perfil', path: '/portal/perfil', icon: User },
];

export default function PortalLayout() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on_surface font-body">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[30rem] bg-[radial-gradient(circle_at_top,rgba(123,207,82,0.1),transparent_48%)]" />
        <div className="absolute left-[-6rem] top-[6rem] h-[18rem] w-[18rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-[22rem] w-[22rem] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <header className="sticky top-0 z-30 border-b border-outline_variant/25 bg-white/84 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/portal" className="shrink-0 text-lg font-display font-semibold tracking-tight text-on_surface">
            Clubes <span className="text-primary">Tucuman</span>
          </Link>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={16} />
            <input
              type="text"
              placeholder="Buscar un complejo..."
              className="w-full rounded-full border border-outline_variant/15 bg-surface_container_high/70 py-2 pl-11 pr-5 text-sm text-on_surface placeholder-outline transition-all focus:border-primary/50 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-1">
              {NAV.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'border border-primary/20 bg-primary/10 text-on_surface'
                        : 'text-on_surface_variant hover:bg-surface_container_low hover:text-on_surface'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:block">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-surface_container px-3 py-2 text-sm text-on_surface_variant transition-colors hover:bg-red-500/10 hover:text-red-500 sm:px-4"
              title="Cerrar sesion"
            >
              <LogOut size={15} />
              <span className="hidden md:inline">Cerrar sesion</span>
            </button>

            <div className="ml-1 flex items-center gap-2 border-l border-outline_variant/20 pl-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="h-8 w-8 rounded-full" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-primary">
                  {user?.displayName?.charAt(0) || 'U'}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}

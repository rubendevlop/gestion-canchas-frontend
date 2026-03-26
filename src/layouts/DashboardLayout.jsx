import { useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  Building2,
  Calendar,
  CheckCircle2,
  Clock3,
  CreditCard,
  Home,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Users,
  X,
} from 'lucide-react';
import { logout } from '../auth';
import { useAuth } from '../contexts/AuthContext';
import { fetchAPI } from '../services/api';
import BrandLogo from '../components/BrandLogo';

const ROLE_META = {
  owner: {
    label: 'Dueno / Admin',
    badgeClass: 'border border-primary/15 bg-primary/10 text-primary',
    eyebrow: 'Panel del complejo',
    searchPlaceholder: 'Buscar reservas, canchas o productos...',
    nav: [
      { name: 'Inicio', path: '/dashboard', icon: Home },
      { name: 'Calendario', path: '/dashboard/reservations', icon: Calendar },
      { name: 'Canchas', path: '/dashboard/courts', icon: LayoutGrid },
      { name: 'Inventario', path: '/dashboard/products', icon: ShoppingBag },
      { name: 'Clientes', path: '/dashboard/customers', icon: Users },
      { name: 'Cobros', path: '/dashboard/collections', icon: CreditCard },
      { name: 'Facturacion', path: '/dashboard/billing', icon: Clock3 },
      { name: 'Ajustes', path: '/dashboard/settings', icon: Settings },
    ],
  },
  superadmin: {
    label: 'Superadmin',
    badgeClass: 'border border-tertiary/15 bg-tertiary/10 text-tertiary_fixed_dim',
    eyebrow: 'Control general',
    searchPlaceholder: 'Buscar owners, usuarios o complejos...',
    nav: [
      { name: 'Resumen', path: '/dashboard', icon: Home },
      { name: 'Usuarios', path: '/dashboard/users', icon: Users },
      { name: 'Complejos', path: '/dashboard/complexes', icon: Building2 },
      { name: 'Pagos', path: '/dashboard/payments', icon: CreditCard },
    ],
  },
};

function getOwnerApprovalStorageKey(uid) {
  return `owner-approved-notification-read:${uid}`;
}

function isOwnerApprovalUnread(role, ownerStatus, ownerApprovedSeen) {
  return role === 'owner' && ownerStatus === 'APPROVED' && !ownerApprovedSeen;
}

export default function DashboardLayout({ children = null }) {
  const { user, role, ownerStatus, ownerBilling } = useAuth();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ownerApprovedSeen, setOwnerApprovedSeen] = useState(false);
  const [pendingOwnersCount, setPendingOwnersCount] = useState(0);

  const meta = ROLE_META[role] ?? ROLE_META.owner;

  useEffect(() => {
    setSidebarOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!user?.uid) {
      setOwnerApprovedSeen(false);
      return;
    }

    setOwnerApprovedSeen(localStorage.getItem(getOwnerApprovalStorageKey(user.uid)) === '1');
  }, [user?.uid]);

  useEffect(() => {
    if (role !== 'superadmin') {
      setPendingOwnersCount(0);
      return;
    }

    let active = true;

    fetchAPI('/users?role=owner&ownerStatus=PENDING')
      .then((users) => {
        if (!active) return;
        setPendingOwnersCount(Array.isArray(users) ? users.length : 0);
      })
      .catch(() => {
        if (!active) return;
        setPendingOwnersCount(0);
      });

    return () => {
      active = false;
    };
  }, [location.pathname, role]);

  const notifications = useMemo(() => {
    const items = [];

    if (role === 'owner' && ownerStatus === 'APPROVED') {
      items.push({
        id: 'owner-approved',
        title: 'Cuenta aprobada',
        description: 'Ya fuiste validado por un superadmin. Ya podes administrar tu complejo desde el panel.',
        icon: CheckCircle2,
        tone: 'border border-emerald-200 bg-emerald-50 text-emerald-700',
      });
    }

    if (role === 'owner' && ownerBilling?.status === 'GRACE') {
      items.push({
        id: 'owner-billing-grace',
        title: 'Pago mensual pendiente',
        description: `Tenes hasta ${new Date(ownerBilling.blockAt).toLocaleDateString('es-AR')} para pagar. Si no, se bloquea el panel y tu complejo deja de aceptar reservas y compras.`,
        icon: CreditCard,
        tone: 'border border-amber-200 bg-amber-50 text-amber-700',
        path: '/dashboard/billing',
      });
    }

    if (role === 'owner' && ownerBilling?.status !== 'GRACE' && ownerBilling?.hasAccess && ownerBilling?.accessEndsAt) {
      const expiresAt = new Date(ownerBilling.accessEndsAt);
      const diffDays = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

      items.push({
        id: 'owner-billing',
        title: diffDays <= 5 ? 'Mensualidad por vencer' : 'Acceso activo',
        description:
          diffDays <= 5
            ? `Tu acceso vence el ${expiresAt.toLocaleDateString('es-AR')}. Cuando termine el periodo se te va a pedir un nuevo pago mensual.`
            : `Tu acceso como owner esta activo hasta el ${expiresAt.toLocaleDateString('es-AR')}.`,
        icon: CreditCard,
        tone:
          diffDays <= 5
            ? 'border border-amber-200 bg-amber-50 text-amber-700'
            : 'border border-emerald-200 bg-emerald-50 text-emerald-700',
        path: '/dashboard/billing',
      });
    }

    if (role === 'superadmin' && pendingOwnersCount > 0) {
      items.push({
        id: 'pending-owners',
        title: 'Validaciones pendientes',
        description: `Tenes ${pendingOwnersCount} solicitud${pendingOwnersCount !== 1 ? 'es' : ''} de owner esperando aprobacion.`,
        icon: Clock3,
        tone: 'border border-amber-200 bg-amber-50 text-amber-700',
        path: '/dashboard/users',
      });
    }

    return items;
  }, [ownerBilling, ownerStatus, pendingOwnersCount, role]);

  const hasUnreadNotifications =
    isOwnerApprovalUnread(role, ownerStatus, ownerApprovedSeen) ||
    (role === 'superadmin' && pendingOwnersCount > 0);

  const isActivePath = (path) => {
    if (path === '/dashboard') {
      return location.pathname === path;
    }

    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const currentPageTitle = meta.nav.find((item) => isActivePath(item.path))?.name ?? meta.label;

  const handleLogout = async () => {
    await logout();
  };

  const handleNotificationsToggle = () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);

    if (nextOpen && isOwnerApprovalUnread(role, ownerStatus, ownerApprovedSeen) && user?.uid) {
      localStorage.setItem(getOwnerApprovalStorageKey(user.uid), '1');
      setOwnerApprovedSeen(true);
    }
  };

  const renderNavItems = (mobile = false) =>
    meta.nav.map((item) => {
      const Icon = item.icon;
      const isActive = isActivePath(item.path);

      return (
        <Link
          key={item.name + item.path}
          to={item.path}
          onClick={() => mobile && setSidebarOpen(false)}
          className={`group flex items-center gap-4 rounded-2xl border px-4 py-3.5 transition-all duration-200 ${
            isActive
              ? 'border-primary/15 bg-primary/10 text-on_surface shadow-[0_16px_34px_-22px_rgba(31,143,73,0.24)]'
              : 'border-transparent bg-transparent text-on_surface_variant hover:border-outline_variant/20 hover:bg-white/80 hover:text-on_surface'
          }`}
        >
          <Icon
            size={20}
            className={`shrink-0 transition-colors ${
              isActive ? 'text-primary' : 'text-outline group-hover:text-primary'
            }`}
          />
          <span className={`font-medium tracking-[0.01em] ${mobile ? 'text-[0.95rem]' : 'text-sm'}`}>
            {item.name}
          </span>
        </Link>
      );
    });

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-on_surface font-body lg:flex">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-[-7rem] h-[24rem] w-[24rem] rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute right-[-6rem] top-[10rem] h-[18rem] w-[18rem] rounded-full bg-tertiary/8 blur-3xl" />
        <div className="absolute bottom-[-10rem] right-[-6rem] h-[24rem] w-[24rem] rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Cerrar menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-[#102014]/58 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-[min(20rem,88vw)] flex-col border-r border-outline_variant/30 bg-[linear-gradient(180deg,#fcfef9_0%,#f2f7ec_100%)] shadow-[12px_0_34px_-18px_rgba(20,32,22,0.22)] transition-transform duration-300 lg:static lg:w-72 lg:translate-x-0 lg:z-20 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline_variant/18 px-6 pb-5 pt-6 sm:px-8">
          <div className="min-w-0">
            <div className="inline-flex rounded-[1.75rem] border border-outline_variant/20 bg-white/80 px-4 py-3 shadow-[0_16px_30px_-24px_rgba(20,32,22,0.2)]">
              <BrandLogo imageClassName="h-14 w-auto" />
            </div>
            <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-outline">
              {meta.eyebrow}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-2xl border border-outline_variant/20 bg-white/80 p-2.5 text-on_surface_variant transition-colors hover:bg-white hover:text-on_surface"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-3 pt-5 sm:px-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-outline">Menu</p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {renderNavItems(true)}
        </nav>

        <div className="mt-auto border-t border-outline_variant/15 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:p-6">
          <div className="rounded-[1.5rem] border border-outline_variant/15 bg-white/82 p-4 shadow-[0_20px_34px_-28px_rgba(20,32,22,0.28)]">
            <div className="mb-4 flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="h-11 w-11 rounded-full ring-2 ring-surface_container_highest" />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface_container_highest text-primary">
                  <span className="font-display font-medium">{user?.displayName?.charAt(0) || 'U'}</span>
                </div>
              )}
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-on_surface">{user?.displayName}</p>
                <p className="truncate text-xs text-on_surface_variant">{user?.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-widest ${meta.badgeClass}`}>
                {meta.label}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-outline_variant/15 bg-surface_container_low py-3 text-sm font-semibold text-on_surface transition-colors hover:border-error/20 hover:bg-error/10 hover:text-error"
            >
              <LogOut size={16} /> Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 min-w-0 flex-1 flex flex-col">
        <header className="sticky top-0 z-10 border-b border-outline_variant/25 bg-white/78 backdrop-blur-xl">
          <div className="px-4 sm:px-6 lg:px-10 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                aria-label="Abrir menu"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-surface_container_low text-on_surface_variant hover:bg-surface_container_highest hover:text-on_surface transition-colors"
              >
                <Menu size={18} />
              </button>

              <div className="min-w-0 lg:hidden">
                <p className="text-xs uppercase tracking-widest text-outline">{meta.eyebrow}</p>
                <p className="text-sm font-medium text-on_surface truncate">{meta.label}</p>
              </div>

              <div className="relative hidden sm:block flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline_variant" size={18} />
                <input
                  type="text"
                  placeholder={meta.searchPlaceholder}
                  className="w-full bg-surface_container border border-outline_variant/10 rounded-full py-2.5 pl-12 pr-6 text-sm text-on_surface placeholder-outline focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={handleNotificationsToggle}
                  className="relative rounded-full bg-surface_container_low p-2.5 text-on_surface_variant transition-colors hover:bg-surface_container_highest"
                >
                  <Bell size={20} />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-background" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-3xl border border-outline_variant/25 bg-white shadow-[0_24px_60px_-30px_rgba(24,36,24,0.24)]">
                    <div className="px-5 py-4 border-b border-outline_variant/10">
                      <p className="text-sm font-semibold text-on_surface">Notificaciones</p>
                      <p className="text-xs text-outline mt-1">
                        {notifications.length === 0 ? 'No hay novedades por ahora.' : 'Estado de tu cuenta y acciones pendientes.'}
                      </p>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-sm text-on_surface_variant text-center">
                        No tenes notificaciones nuevas.
                      </div>
                    ) : (
                      <div className="p-3 space-y-2">
                        {notifications.map((notification) => {
                          const Icon = notification.icon;
                          const content = (
                            <div className="flex items-start gap-3 rounded-2xl px-4 py-4 bg-surface_container_low hover:bg-surface_container transition-colors">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${notification.tone}`}>
                                <Icon size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-on_surface">{notification.title}</p>
                                <p className="text-sm text-on_surface_variant mt-1">{notification.description}</p>
                              </div>
                            </div>
                          );

                          if (notification.path) {
                            return (
                              <Link
                                key={notification.id}
                                to={notification.path}
                                onClick={() => setNotificationsOpen(false)}
                              >
                                {content}
                              </Link>
                            );
                          }

                          return <div key={notification.id}>{content}</div>;
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface_container_low px-3 py-2.5 text-sm text-on_surface_variant transition-colors hover:bg-error/10 hover:text-error sm:px-4"
                title="Cerrar sesion"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Cerrar sesion</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 sm:px-6 lg:px-10 pb-10 pt-5 sm:pt-6 lg:pb-12">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}

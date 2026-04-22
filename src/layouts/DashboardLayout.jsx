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
  Package,
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
      { name: 'Pedidos', path: '/dashboard/orders', icon: Package },
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
              ? 'border-primary/15 bg-primary/10 text-on_surface shadow-[0_16px_34px_-22px_rgb(var(--primary-green-rgb)/0.24)]'
              : mobile
                ? 'border-transparent bg-white/[0.04] text-brand_white hover:border-white/10 hover:bg-white/[0.08]'
                : 'border-transparent bg-transparent text-brand_gray hover:border-white/10 hover:bg-white/[0.07] hover:text-white'
          }`}
        >
          <Icon
            size={20}
            className={`shrink-0 transition-colors ${
              isActive ? 'text-primary' : 'text-brand_gray group-hover:text-primary'
            }`}
          />
          <span className={`font-medium tracking-[0.01em] ${mobile ? 'text-[0.95rem]' : 'text-sm'}`}>
            {item.name}
          </span>
        </Link>
      );
    });

  return (
    <div className="theme-shell-dark overflow-hidden text-on_surface font-body lg:flex">
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
          className="fixed inset-0 z-40 bg-brand_bg/58 backdrop-blur-[1px] lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-[60] isolate flex w-[min(20rem,88vw)] flex-col overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,rgb(var(--bg-main-rgb)/0.98),rgb(var(--bg-main-rgb)/0.9))] shadow-[18px_0_42px_-18px_rgb(var(--bg-main-rgb)/0.42)] transition-transform duration-300 lg:static lg:z-20 lg:w-72 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgb(var(--primary-green-rgb)/0.1),transparent_28%)]" />

        <div className="relative flex items-start justify-between gap-4 border-b border-white/10 px-6 pb-5 pt-6 sm:px-8">
          <div className="min-w-0">
            <div className="app-shell-logo inline-flex px-4 py-3">
              <BrandLogo imageClassName="h-14 w-auto" />
            </div>
            <p className="mt-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand_gray/70">
              {meta.eyebrow}
            </p>
          </div>
          <button
            type="button"
            aria-label="Cerrar menu"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-white transition-colors hover:bg-white/[0.08]"
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative px-6 pb-3 pt-5 sm:px-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-brand_gray/70">Menu</p>
        </div>

        <nav className="relative flex-1 space-y-2 overflow-y-auto px-4 pb-4">
          {renderNavItems(true)}
        </nav>

        <div className="relative mt-auto border-t border-white/10 p-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)] sm:p-6">
          <div className="app-shell-panel p-4">
            <div className="mb-4 flex items-center gap-3">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Avatar" className="h-11 w-11 rounded-full ring-2 ring-surface_container_highest" />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/18 text-primary">
                  <span className="font-display font-medium">{user?.displayName?.charAt(0) || 'U'}</span>
                </div>
              )}
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate text-sm font-semibold text-white">{user?.displayName}</p>
                <p className="truncate text-xs text-brand_gray">{user?.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <span className={`inline-flex rounded-full px-3 py-1 text-[0.68rem] font-bold uppercase tracking-widest ${meta.badgeClass}`}>
                {meta.label}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] py-3 text-sm font-semibold text-white transition-colors hover:border-primary/25 hover:bg-white/[0.08] hover:text-primary"
            >
              <LogOut size={16} /> Cerrar sesion
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 min-w-0 flex-1 flex flex-col">
        <header className="app-shell-header sticky top-0 z-20 shadow-[0_12px_28px_-24px_rgb(var(--bg-main-rgb)/0.28)]">
          <div className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 lg:px-10">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button
                type="button"
                aria-label="Abrir menu"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-2xl border border-white/10 bg-white/[0.05] p-2.5 text-white transition-colors hover:bg-white/[0.08]"
              >
                <Menu size={18} />
              </button>

              <div className="min-w-0 lg:hidden">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-brand_gray/70">{meta.label}</p>
                <p className="truncate text-sm font-semibold text-white">{currentPageTitle}</p>
              </div>

              <div className="relative hidden md:block flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/85" size={18} />
                <input
                  type="text"
                  placeholder={meta.searchPlaceholder}
                  className="app-shell-input rounded-full py-2.5 pl-12 pr-6"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <button
                  type="button"
                  onClick={handleNotificationsToggle}
                  className="relative rounded-full border border-white/10 bg-white/[0.05] p-2.5 text-white transition-colors hover:bg-white/[0.08]"
                >
                  <Bell size={20} />
                  {hasUnreadNotifications && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-background" />
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 top-full mt-3 w-[min(22rem,calc(100vw-1rem))] max-w-sm overflow-hidden rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgb(var(--bg-main-rgb)/0.98),rgb(var(--bg-main-rgb)/0.92))] shadow-[0_24px_60px_-30px_rgb(var(--bg-main-rgb)/0.42)]">
                    <div className="px-5 py-4 border-b border-white/10">
                      <p className="text-sm font-semibold text-white">Notificaciones</p>
                      <p className="mt-1 text-xs text-brand_gray">
                        {notifications.length === 0 ? 'No hay novedades por ahora.' : 'Estado de tu cuenta y acciones pendientes.'}
                      </p>
                    </div>

                    {notifications.length === 0 ? (
                      <div className="px-5 py-8 text-sm text-brand_gray text-center">
                        No tenes notificaciones nuevas.
                      </div>
                    ) : (
                      <div className="max-h-[56vh] space-y-2 overflow-y-auto p-3">
                        {notifications.map((notification) => {
                          const Icon = notification.icon;
                          const content = (
                            <div className="flex items-start gap-3 rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-4 transition-colors hover:bg-white/[0.08]">
                              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${notification.tone}`}>
                                <Icon size={18} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white">{notification.title}</p>
                                <p className="text-sm text-brand_gray mt-1">{notification.description}</p>
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
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white transition-colors hover:border-primary/25 hover:bg-white/[0.08] hover:text-primary sm:px-4"
                title="Cerrar sesion"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Cerrar sesion</span>
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto px-4 pb-12 pt-4 sm:px-6 sm:pt-6 lg:px-10 lg:pb-12">
          {children ?? <Outlet />}
        </div>
      </main>
    </div>
  );
}

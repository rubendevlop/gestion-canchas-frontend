import { useAuth } from '../../contexts/AuthContext';
import { logout } from '../../firebase';
import { LogOut, Mail } from 'lucide-react';

export default function PortalProfile() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-10 font-display text-3xl font-bold text-on_surface">Mi perfil</h1>

      <div className="mb-6 rounded-3xl border border-outline_variant/20 bg-white p-8 text-center shadow-[0_18px_38px_-28px_rgba(24,36,24,0.18)]">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="mx-auto mb-4 h-20 w-20 rounded-full ring-2 ring-primary/25" />
        ) : (
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/12">
            <span className="text-3xl font-bold text-primary">{user?.displayName?.charAt(0) || 'U'}</span>
          </div>
        )}
        <h2 className="text-xl font-semibold text-on_surface">{user?.displayName}</h2>
        <p className="mt-1 flex items-center justify-center gap-2 text-sm text-on_surface_variant">
          <Mail size={13} />
          {user?.email}
        </p>
        <span className="mt-3 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary">
          Cliente
        </span>
      </div>

      <button
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-outline_variant/25 py-4 text-sm font-medium text-on_surface_variant transition-all hover:border-error/30 hover:text-error"
      >
        <LogOut size={16} />
        Cerrar sesion
      </button>
    </div>
  );
}

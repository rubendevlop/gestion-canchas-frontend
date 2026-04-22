import { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const ICONS = {
  error: AlertTriangle,
  success: CheckCircle2,
  info: Info,
};

const TONE_STYLES = {
  error: {
    badge: 'bg-red-400/10 text-red-500',
    primary: 'bg-red-500 text-white hover:bg-red-600',
    secondary: 'border-red-400/20 text-red-500 hover:bg-red-400/10',
  },
  success: {
    badge: 'bg-green-400/10 text-green-600',
    primary: 'bg-primary text-on_primary hover:brightness-110',
    secondary: 'border-outline_variant/20 text-on_surface_variant hover:bg-surface_container_low',
  },
  info: {
    badge: 'bg-primary/10 text-primary',
    primary: 'bg-primary text-on_primary hover:brightness-110',
    secondary: 'border-outline_variant/20 text-on_surface_variant hover:bg-surface_container_low',
  },
};

export default function AppModal({
  open = false,
  title = '',
  description = '',
  tone = 'info',
  onClose,
  actions = [],
  children = null,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const normalizedTone = TONE_STYLES[tone] ? tone : 'info';
  const toneStyles = TONE_STYLES[normalizedTone];
  const Icon = ICONS[normalizedTone] || ICONS.info;
  const resolvedActions =
    actions.length > 0
      ? actions
      : [{ label: 'Cerrar', onClick: onClose, variant: 'primary', autoFocus: true }];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div className="relative w-full max-w-lg rounded-[2rem] border border-outline_variant/20 bg-white p-6 shadow-[0_30px_80px_-34px_rgb(var(--bg-main-rgb)/0.24)] sm:p-7">
        <button
          type="button"
          onClick={() => onClose?.()}
          className="absolute right-4 top-4 rounded-full p-2 text-outline transition-colors hover:bg-surface_container_low hover:text-on_surface"
          aria-label="Cerrar modal"
        >
          <X size={18} />
        </button>

        <div className="mb-5 flex items-start gap-4 pr-10">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${toneStyles.badge}`}>
            <Icon size={22} />
          </div>
          <div>
            <h3 className="text-xl font-display font-semibold text-on_surface">{title}</h3>
            {description ? (
              <p className="mt-2 text-sm leading-6 text-on_surface_variant">{description}</p>
            ) : null}
          </div>
        </div>

        {children ? <div className="mb-6">{children}</div> : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          {resolvedActions.map((action, index) => {
            const variant = action.variant === 'secondary' ? 'secondary' : 'primary';
            const classes =
              variant === 'primary'
                ? toneStyles.primary
                : toneStyles.secondary;

            return (
              <button
                key={`${action.label}-${index}`}
                type="button"
                onClick={action.onClick}
                disabled={action.disabled}
                autoFocus={action.autoFocus}
                className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                  variant === 'primary'
                    ? `${classes} border-transparent`
                    : `${classes} border`
                }`}
              >
                {action.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

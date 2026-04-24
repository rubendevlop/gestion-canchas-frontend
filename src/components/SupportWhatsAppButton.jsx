import { MessageCircleMore } from 'lucide-react';
import { buildWhatsAppUrl } from '../utils/whatsapp';

const SUPPORT_WHATSAPP_PHONE =
  import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER ||
  import.meta.env.VITE_SUPPORT_WHATSAPP ||
  '';

export default function SupportWhatsAppButton({
  message = 'Hola, quiero hacer una consulta sobre Clubes Tucuman.',
}) {
  const href = buildWhatsAppUrl(SUPPORT_WHATSAPP_PHONE, message);

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 rounded-full bg-[#25D366] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_-16px_rgba(37,211,102,0.55)] transition hover:scale-[1.02] hover:brightness-105"
      aria-label="Consultar por WhatsApp"
    >
      <MessageCircleMore size={20} />
      <span className="hidden sm:inline">Consultar por WhatsApp</span>
      <span className="sm:hidden">WhatsApp</span>
    </a>
  );
}

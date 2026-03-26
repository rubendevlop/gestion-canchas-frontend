import brandLogo from '../IMG/logo-brand.png';

export default function BrandLogo({
  className = '',
  imageClassName = 'h-12 w-auto',
}) {
  return (
    <div
      className={`inline-flex items-center rounded-[1.35rem] bg-[linear-gradient(135deg,#12311a,#1c4c22)] px-3 py-2 shadow-[0_18px_36px_-24px_rgba(18,49,26,0.45)] ${className}`}
    >
      <img src={brandLogo} alt="Clubes Tucuman" className={`block ${imageClassName}`} />
    </div>
  );
}

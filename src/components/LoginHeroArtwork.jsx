export default function LoginHeroArtwork({ className = '' }) {
  return (
    <div className={`pointer-events-none select-none ${className}`.trim()} aria-hidden="true">
      <svg viewBox="0 0 920 620" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grassBand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9acb5a" stopOpacity="0" />
            <stop offset="42%" stopColor="#6ea83a" stopOpacity="0.78" />
            <stop offset="100%" stopColor="#163f1f" />
          </linearGradient>
          <linearGradient id="grassBlade" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#a7d567" />
            <stop offset="100%" stopColor="#2a6b2f" />
          </linearGradient>
          <linearGradient id="laptopShell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#dde7de" />
            <stop offset="100%" stopColor="#95a89b" />
          </linearGradient>
          <linearGradient id="screenGlow" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f4fbf1" />
            <stop offset="100%" stopColor="#d9ecd4" />
          </linearGradient>
          <linearGradient id="phoneShell" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d1114" />
            <stop offset="100%" stopColor="#2f3436" />
          </linearGradient>
          <radialGradient id="ballShine" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dfe5df" />
          </radialGradient>
          <filter id="shadowSoft" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#17311b" floodOpacity="0.18" />
          </filter>
          <filter id="shadowWide" x="-20%" y="-20%" width="160%" height="160%">
            <feDropShadow dx="0" dy="26" stdDeviation="24" floodColor="#17311b" floodOpacity="0.22" />
          </filter>
        </defs>

        <ellipse cx="408" cy="508" rx="268" ry="42" fill="#18331b" fillOpacity="0.12" />
        <ellipse cx="745" cy="520" rx="132" ry="28" fill="#18331b" fillOpacity="0.12" />

        <rect x="0" y="490" width="920" height="130" fill="url(#grassBand)" />

        <g opacity="0.92">
          <path d="M22 522C74 470 137 543 176 504C219 463 280 546 334 500C381 459 433 541 482 508C531 475 589 541 646 503C694 470 741 535 793 511C835 492 874 525 920 508V620H0V532C7 529 14 526 22 522Z" fill="url(#grassBlade)" />
          <path d="M0 543C59 520 104 560 161 545C223 529 275 577 346 545C401 520 454 561 521 547C581 534 637 569 691 548C753 523 816 560 920 540V620H0V543Z" fill="#3e8f37" fillOpacity="0.58" />
        </g>

        <g filter="url(#shadowWide)">
          <g transform="translate(186 196)">
            <path d="M30 262H420L370 316H92L30 262Z" fill="url(#laptopShell)" />
            <path d="M10 244H438C447 244 454 251 454 260C454 269 447 276 438 276H10C4 276 0 271 0 265V260C0 251 4 244 10 244Z" fill="#bac6bd" />
            <rect x="48" y="0" width="348" height="236" rx="22" fill="#182426" />
            <rect x="62" y="14" width="320" height="208" rx="14" fill="url(#screenGlow)" />
            <circle cx="222" cy="10" r="3.5" fill="#4d5753" />

            <rect x="74" y="28" width="210" height="180" rx="10" fill="#eaf5e7" />
            <path d="M86 66C120 38 160 43 196 66C225 84 254 80 270 60V198H86V66Z" fill="#c7e2bf" />
            <path d="M86 118L118 90L152 116L190 82L224 106L270 72V198H86V118Z" fill="#b3d8a8" />
            <path d="M86 150L124 120L154 144L202 106L234 130L270 102V198H86V150Z" fill="#8fc37a" />
            <path d="M128 92C128 80 138 70 150 70C162 70 172 80 172 92C172 105 162 114 150 128C138 114 128 105 128 92Z" fill="#3c8d45" />
            <circle cx="150" cy="92" r="11" fill="#eef8ec" />
            <path d="M198 126C198 116 206 108 216 108C226 108 234 116 234 126C234 137 226 145 216 156C206 145 198 137 198 126Z" fill="#5daa58" />
            <circle cx="216" cy="126" r="9" fill="#eef8ec" />
            <path d="M110 152C110 144 117 137 125 137C133 137 140 144 140 152C140 161 133 168 125 177C117 168 110 161 110 152Z" fill="#86b33f" />
            <circle cx="125" cy="152" r="7" fill="#eef8ec" />

            <rect x="298" y="28" width="72" height="52" rx="10" fill="#f7fbf6" />
            <rect x="306" y="36" width="56" height="20" rx="6" fill="#d9e9d4" />
            <rect x="306" y="61" width="40" height="8" rx="4" fill="#8fb77f" />

            <rect x="298" y="92" width="72" height="50" rx="10" fill="#f7fbf6" />
            <rect x="306" y="100" width="56" height="11" rx="5.5" fill="#e1ede0" />
            <rect x="306" y="118" width="34" height="16" rx="8" fill="#4a9b49" />
            <rect x="344" y="118" width="18" height="16" rx="8" fill="#d8ead2" />

            <rect x="298" y="154" width="72" height="54" rx="10" fill="#f7fbf6" />
            <rect x="306" y="164" width="56" height="10" rx="5" fill="#dcebd7" />
            <rect x="306" y="182" width="48" height="8" rx="4" fill="#99c08a" />
          </g>
        </g>

        <g transform="translate(56 210) rotate(-6 110 180)" filter="url(#shadowWide)">
          <rect x="0" y="0" width="178" height="322" rx="34" fill="url(#phoneShell)" />
          <rect x="10" y="10" width="158" height="302" rx="28" fill="#ffffff" />
          <rect x="62" y="20" width="54" height="10" rx="5" fill="#14181b" />
          <circle cx="89" cy="24.5" r="2.5" fill="#2d3433" />
          <rect x="24" y="48" width="22" height="22" rx="11" fill="#5bb85b" fillOpacity="0.18" />
          <path d="M28 58C28 52 33 47 39 47C45 47 50 52 50 58C50 64 45 68 39 76C33 68 28 64 28 58Z" fill="#4f9f53" />
          <rect x="54" y="50" width="78" height="10" rx="5" fill="#182426" fillOpacity="0.8" />
          <rect x="24" y="82" width="130" height="18" rx="9" fill="#dfe9db" />
          <rect x="24" y="110" width="130" height="18" rx="9" fill="#eef4ec" />
          <rect x="24" y="150" width="130" height="36" rx="10" fill="#fbfcfb" stroke="#dce8d7" />
          <rect x="24" y="194" width="130" height="56" rx="12" fill="#ffffff" stroke="#dce8d7" />
          <rect x="34" y="206" width="48" height="32" rx="8" fill="#edf6ea" />
          <rect x="90" y="206" width="52" height="10" rx="5" fill="#d9e8d4" />
          <rect x="90" y="222" width="36" height="8" rx="4" fill="#96be8a" />
          <rect x="24" y="258" width="130" height="34" rx="10" fill="#43a047" />
          <rect x="55" y="301" width="68" height="4" rx="2" fill="#dbe6d7" />
        </g>

        <g transform="translate(650 404)" filter="url(#shadowSoft)">
          <circle cx="76" cy="76" r="76" fill="url(#ballShine)" />
          <path d="M76 8L102 28L92 60H60L50 28L76 8Z" fill="#223231" />
          <path d="M50 28L28 52L38 84L60 60L50 28Z" fill="#223231" />
          <path d="M102 28L126 52L114 84L92 60L102 28Z" fill="#223231" />
          <path d="M60 60H92L102 100L76 120L50 100L60 60Z" fill="#223231" />
          <path d="M28 52L16 92L38 116L50 100L38 84L28 52Z" fill="#223231" />
          <path d="M126 52L136 92L114 116L102 100L114 84L126 52Z" fill="#223231" />
          <path d="M38 116L54 146L76 136L50 100L38 116Z" fill="#223231" />
          <path d="M114 116L98 146L76 136L102 100L114 116Z" fill="#223231" />
          <circle cx="52" cy="44" r="7" fill="#ffffff" fillOpacity="0.85" />
        </g>
      </svg>
    </div>
  );
}

// =============================================================
//  NOVELYA LOGO — N monogram + kıvılcım
//  size: kare kenar uzunluğu (px)
// =============================================================
export function LogoMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Novelya"
    >
      <defs>
        <linearGradient id="nv-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="12" fill="url(#nv-g)" />
      <path
        d="M13 35 V14 L33 35 V14"
        stroke="#fff"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M37.5 7 l1.8 4 4 1.8 -4 1.8 -1.8 4 -1.8 -4 -4 -1.8 4 -1.8 z" fill="#fff" />
    </svg>
  );
}

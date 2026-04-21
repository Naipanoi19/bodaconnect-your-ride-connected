interface LogoProps {
  size?: number;
  variant?: "yellow" | "white" | "black";
  className?: string;
}

export function Logo({ size = 48, variant = "yellow", className }: LogoProps) {
  const fill = variant === "yellow" ? "#FFCA28" : variant === "white" ? "#FFFFFF" : "#000000";
  const inner = variant === "yellow" ? "#000000" : "#000000";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="BodaVert logo"
    >
      <circle cx="32" cy="26" r="14" fill={fill} />
      <path d="M16 44h32l-5 12H21z" fill={fill} />
      <circle cx="32" cy="25" r="6" fill={inner} />
    </svg>
  );
}
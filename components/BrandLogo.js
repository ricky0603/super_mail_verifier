const sizeTokens = {
  sm: {
    icon: 24,
    text: "text-xl",
    gap: "gap-2",
    pill: "px-1 py-0",
    wordGap: "ml-0.5",
  },
  md: {
    icon: 30,
    text: "text-2xl",
    gap: "gap-2.5",
    pill: "px-1.5 py-0.5",
    wordGap: "ml-0.5",
  },
  lg: {
    icon: 40,
    text: "text-3xl",
    gap: "gap-3",
    pill: "px-2 py-0.5",
    wordGap: "ml-0.5",
  },
};

export default function BrandLogo({
  size = "md",
  dark = false,
  iconOnly = false,
  className = "",
}) {
  const token = sizeTokens[size] || sizeTokens.md;
  const ringColor = dark ? "#FFD900" : "#D9B800";
  const checkColor = dark ? "#FFFFFF" : "#0F172A";

  return (
    <span className={`inline-flex items-center ${token.gap} ${className}`}>
      <svg
        width={token.icon}
        height={token.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r="22"
          stroke={ringColor}
          strokeWidth="4"
          strokeDasharray="4 2"
        />
        <path
          d="M14 24L21 31L34 17"
          stroke={checkColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {!iconOnly && (
        <span className={`leading-none font-black tracking-tighter ${token.text}`}>
          <span className={dark ? "text-white" : "text-base-content"}>Ree</span>
          {dark ? (
            <span className="text-primary">verify</span>
          ) : (
            <span className={`${token.wordGap} rounded bg-primary text-slate-950 ${token.pill}`}>verify</span>
          )}
        </span>
      )}
    </span>
  );
}

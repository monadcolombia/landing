"use client";

import { useTextScramble } from "@/hooks/useTextScramble";

interface ScrambleLinkProps {
  text: string;
  href?: string;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  children?: React.ReactNode;
}

export default function ScrambleLink({
  text,
  href,
  className = "",
  onClick,
  onMouseEnter,
  onMouseLeave,
  children,
}: ScrambleLinkProps) {
  const { display, scramble, reset } = useTextScramble(text);

  const handleMouseEnter = () => {
    scramble();
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    reset();
    onMouseLeave?.();
  };

  if (!href) {
    // Without a destination this is a control, not a link. Crawlers and screen
    // readers treat <a> without href as broken.
    return (
      <button
        type="button"
        className={className}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onClick={onClick}
      >
        <span>{display}</span>
        {children}
      </button>
    );
  }

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      <span>{display}</span>
      {children}
    </a>
  );
}

import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  tone?: "default" | "light";
  className?: string;
  dotClassName?: string;
};

export function BrandMark({ href = "/", className = "", dotClassName = "" }: BrandMarkProps) {
  return (
    <Link href={href} className={`brand-mark text-foreground ${className}`}>
      <span>ideator</span>
      <span className={`brand-mark__dot ${dotClassName}`} aria-hidden="true" />
      <span className="text-foreground">dev</span>
    </Link>
  );
}

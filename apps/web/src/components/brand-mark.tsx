import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  tone?: "default" | "light";
  className?: string;
  dotClassName?: string;
};

export function BrandMark({ href = "/", tone = "default", className = "", dotClassName = "" }: BrandMarkProps) {
  const textClass = tone === "light" ? "text-white" : "text-foreground";

  return (
    <Link href={href} className={`brand-mark ${textClass} ${className}`}>
      <span>ideator</span>
      <span className={`brand-mark__dot ${dotClassName}`} aria-hidden="true" />
      <span className={tone === "light" ? "text-white" : "text-foreground"}>dev</span>
    </Link>
  );
}

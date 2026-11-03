import { Award, Briefcase, CalendarDays, ShoppingBag, Truck, Warehouse } from "lucide-react";
import type { SectionKey } from "@/lib/market-sections";
import { HorseshoeIcon } from "@/components/brand-logo";

type IconProps = { className?: string; strokeWidth?: number };

/** The forged horseshoe from the HorseMart logo (stands for "Horses"). */
export function HorseIcon({ className }: IconProps) {
  return <HorseshoeIcon className={className} />;
}

const icons = {
  transport: Truck,
  event: CalendarDays,
  job: Briefcase,
  shop: ShoppingBag,
  farm: Warehouse,
  stud: Award,
} as const;

/** Line icon for a section (or "horse" for the horses section). */
export function SectionIcon({ section, className = "size-5", strokeWidth = 1.75 }: IconProps & { section: SectionKey | "horse" }) {
  if (section === "horse") return <HorseIcon className={className} strokeWidth={strokeWidth} />;
  const Icon = icons[section];
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}

/** Icon in a soft brand-tinted square, used as a section badge. */
export function SectionBadge({ section, size = "md" }: { section: SectionKey | "horse"; size?: "sm" | "md" | "lg" }) {
  const box = size === "lg" ? "size-14 rounded-2xl" : size === "sm" ? "size-9 rounded-lg" : "size-11 rounded-xl";
  const icon = size === "lg" ? "size-7" : size === "sm" ? "size-[18px]" : "size-5";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center bg-primary/[0.08] text-primary ring-1 ring-inset ring-primary/15 ${box}`}
    >
      <SectionIcon section={section} className={icon} />
    </span>
  );
}

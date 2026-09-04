"use client";

import type { ReactNode } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Headphones,
  PackageSearch,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { categoryTone } from "./utils";

export type RivaIconName = "home" | "grid" | "user" | "wallet" | "search" | "settings";

export function RivaIcon({ name, size = 22, className = "" }: { name: RivaIconName; size?: number; className?: string }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: `riva-icon ${className}`.trim(), "aria-hidden": true };
  if (name === "user") return <svg {...common}><circle cx="12" cy="7.5" r="3.5"/><path d="M5 21c0-4 3.1-7 7-7s7 3 7 7"/></svg>;
  if (name === "wallet") return <svg {...common}><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 14h2.5"/></svg>;
  if (name === "search") return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>;
  if (name === "settings") return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="11" cy="18" r="2"/></svg>;
  if (name === "grid") return <svg {...common}><circle cx="7" cy="7" r="3.1"/><circle cx="17" cy="7" r="3.1"/><circle cx="7" cy="17" r="3.1"/><circle cx="17" cy="17" r="3.1"/></svg>;
  return <svg {...common}><path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 12 4-3"/><circle cx="12" cy="12" r="1.4"/><path d="M7 16h10"/></svg>;
}

export function BrandIcon({ id, size = 52 }: { id: string; size?: number }) {
  const tone = categoryTone(id);
  const style = { width: size, height: size, background: tone.soft, color: tone.accent };

  if (id === "telegram") {
    return <span className="brand-icon" style={style}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 4.1 3.7 10.6c-1.2.5-1.2 1.1-.2 1.4l4.3 1.3 1.7 5.1c.2.6.1.8.8.8.5 0 .8-.2 1-.4l2.1-2 4.4 3.2c.8.5 1.4.2 1.6-.8l2.8-13.3c.3-1.2-.5-1.8-1.6-1.4ZM9.4 13l8.5-5.4c.4-.2.8-.1.5.2l-7 6.4-.3 3.2-1.7-4.4Z" fill="currentColor"/></svg></span>;
  }
  if (id === "instagram") {
    return <span className="brand-icon" style={style}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="2"/><circle cx="17.2" cy="6.9" r="1.1" fill="currentColor"/></svg></span>;
  }
  if (id === "youtube") {
    return <span className="brand-icon" style={style}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="4" fill="currentColor"/><path d="m10 9 5 3-5 3V9Z" fill="#fff"/></svg></span>;
  }
  if (id === "tiktok") {
    return <span className="brand-icon" style={style}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4v10.2a4.2 4.2 0 1 1-3.2-4.1v2.4a1.9 1.9 0 1 0 1 1.7V4h2.2c.5 2.1 1.8 3.4 4 3.8V10c-1.7-.2-3-.8-4-1.8V4Z" fill="currentColor"/></svg></span>;
  }
  if (id === "ai") {
    return <span className="brand-icon" style={style}><Sparkles size={Math.round(size * .5)} strokeWidth={1.75}/></span>;
  }
  if (id === "digital") {
    return <span className="brand-icon" style={style}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4-4h8l4 4-8 12L4 8Zm4.8-2-2 2h10.4l-2-2H8.8ZM7.4 10 12 17.1 16.6 10H7.4Z" fill="currentColor"/></svg></span>;
  }
  return <span className="brand-icon" style={style}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="8" cy="9" r="3" fill="currentColor"/><circle cx="16" cy="8" r="2.5" fill="currentColor" opacity=".72"/><path d="M3.5 19c.4-3.6 2-5.4 4.5-5.4s4.2 1.8 4.5 5.4h-9Zm8.3 0c.3-2.9 1.6-4.4 4-4.4 2.1 0 3.6 1.5 3.9 4.4h-7.9Z" fill="currentColor"/></svg></span>;
}

export function SectionHeading({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && onAction && <button className="text-action" onClick={onAction}>{action}<ChevronLeft size={17}/></button>}
    </div>
  );
}

export function EmptyState({ icon = "empty", title, description, action, onAction }: { icon?: "empty" | "search" | "support"; title: string; description?: string; action?: string; onAction?: () => void }) {
  const Icon = icon === "search" ? Search : icon === "support" ? Headphones : PackageSearch;
  return (
    <div className="empty-state">
      <span className="empty-state-icon"><Icon size={29} strokeWidth={1.75}/></span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && onAction && <button className="button button-primary" onClick={onAction}>{action}<ArrowLeft size={16}/></button>}
    </div>
  );
}

export function TrustPoint({ children }: { children: ReactNode }) {
  return <span className="trust-point"><CheckCircle2 size={16}/>{children}</span>;
}

export function InfoBadge({ children }: { children: ReactNode }) {
  return <span className="info-badge"><ShieldCheck size={15}/>{children}</span>;
}

export function HelpHint({ children }: { children: ReactNode }) {
  return <div className="help-hint"><CircleHelp size={18}/><span>{children}</span></div>;
}

export function RailArrows({ onPrev, onNext }: { onPrev: () => void; onNext: () => void }) {
  return <div className="rail-arrows"><button onClick={onPrev} aria-label="قبلی"><ChevronRight size={19}/></button><button onClick={onNext} aria-label="بعدی"><ChevronLeft size={19}/></button></div>;
}

"use client";
import { useEffect } from "react";

/** Keep keyboard focus in the top dialog, then return it to its opener. */
export function useOverlayFocus(active: string) {
  useEffect(() => {
    if (!active) return;
    const opener = document.activeElement as HTMLElement | null;
    const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]');
    const dialog = dialogs[dialogs.length - 1];
    if (!dialog) return;
    const focusables = () => Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(node => node.getClientRects().length > 0);
    const frame = requestAnimationFrame(() => {
      if (!dialog.contains(document.activeElement)) (focusables()[0] || dialog).focus();
    });
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const items = focusables();
      if (!items.length) { event.preventDefault(); return; }
      const first = items[0], last = items[items.length - 1];
      if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault(); (event.shiftKey ? last : first).focus();
      } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", trap);
    return () => { cancelAnimationFrame(frame); document.removeEventListener("keydown", trap); if (opener?.isConnected) opener.focus(); };
  }, [active]);
}

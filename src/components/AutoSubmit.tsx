"use client";

import { useRef } from "react";

/** Wraps a GET form so changes to selects/checkboxes submit immediately. Works without JS too. */
export function AutoSubmitForm({ action, children, className }: { action: string; children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form
      ref={ref}
      action={action}
      method="get"
      className={className}
      onChange={(e) => {
        const t = e.target as HTMLElement;
        if (t.tagName === "SELECT" || (t as HTMLInputElement).type === "checkbox" || (t as HTMLInputElement).type === "radio") {
          ref.current?.requestSubmit();
        }
      }}
    >
      {children}
    </form>
  );
}

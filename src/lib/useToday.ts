"use client";

import { useSyncExternalStore } from "react";
import { todayISO } from "./filters";

const subscribe = () => () => {};

/**
 * Today's date as YYYY-MM-DD, known only in the browser. Returns null during server rendering and hydration,
 * so static HTML never shows a "days left" that could disagree with the visitor's clock.
 */
export function useToday(): string | null {
  return useSyncExternalStore(subscribe, () => todayISO(), () => null);
}

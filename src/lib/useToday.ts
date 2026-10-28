"use client";

import { useSyncExternalStore } from "react";
import { todayISO } from "./filters";

const BUILD_TODAY = todayISO();
const subscribe = () => () => {};

/** Today's date as YYYY-MM-DD, computed in the browser so static pages never show stale "days left". */
export function useToday(): string {
  return useSyncExternalStore(subscribe, () => todayISO(), () => BUILD_TODAY);
}

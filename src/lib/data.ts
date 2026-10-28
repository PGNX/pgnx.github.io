// Server-only data loading (uses the filesystem). Client code must import from "@/lib/filters".
import fs from "node:fs";
import path from "node:path";
import type { Category, Dataset, Programme } from "./filters";

export * from "./filters";

let cache: Dataset | null = null;

export function getData(): Dataset {
  if (!cache) {
    const file = path.join(process.cwd(), "src", "data", "programs.json");
    cache = JSON.parse(fs.readFileSync(file, "utf8")) as Dataset;
  }
  return cache;
}

export function getProgrammes(): Programme[] {
  return getData().programmes;
}

export function getProgrammeBySlug(slug: string): Programme | undefined {
  return getProgrammes().find((p) => p.slug === slug);
}

export function getCategories(): Category[] {
  return getData().categories;
}

export function categoryName(id: string): string {
  return getCategories().find((c) => c.id === id)?.name ?? "Other";
}


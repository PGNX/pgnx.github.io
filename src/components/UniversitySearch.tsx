"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export interface UniOption { name: string; count: number }

/**
 * University-only search with suggestions. Lives inside a GET form: on pick it sets the hidden
 * `uni` field and submits the form. Shows a few popular universities as quick picks.
 */
export function UniversitySearch({ universities, quickPicks, selected }: { universities: UniOption[]; quickPicks: UniOption[]; selected: string[] }) {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const formRef = useRef<HTMLFormElement | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    function onDoc(e: MouseEvent) { if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const matches = useMemo(() => {
    const q = text.trim().toLowerCase();
    const pool = universities.filter((u) => !selected.includes(u.name));
    if (!q) return quickPicks.filter((u) => !selected.includes(u.name));
    const starts: UniOption[] = [], word: UniOption[] = [], contains: UniOption[] = [];
    for (const u of pool) {
      const n = u.name.toLowerCase();
      if (n.startsWith(q)) starts.push(u);
      else if (n.split(/[\s\-–(]+/).some((w) => w.startsWith(q))) word.push(u);
      else if (n.includes(q)) contains.push(u);
    }
    return [...starts, ...word, ...contains].slice(0, 8);
  }, [text, universities, quickPicks, selected]);

  /** Submit the surrounding form with the given university list. */
  function submitWith(list: string[]) {
    const form = formRef.current ?? wrap.current?.closest("form");
    if (!form) return;
    form.querySelectorAll<HTMLInputElement>("input[name='uni']").forEach((el) => el.remove());
    for (const name of list) {
      const el = document.createElement("input");
      el.type = "hidden"; el.name = "uni"; el.value = name;
      form.appendChild(el);
    }
    form.requestSubmit();
  }

  function pick(name: string) {
    setText("");
    setOpen(false);
    submitWith([...selected, name]);
  }

  function remove(name: string) {
    submitWith(selected.filter((x) => x !== name));
  }

  return (
    <div ref={wrap} className="relative">
      {selected.map((name) => <input key={name} type="hidden" name="uni" value={name} readOnly />)}
      {selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((name) => (
            <li key={name}>
              <button type="button" onClick={() => remove(name)} className="chip chip-green hover:bg-green hover:text-white" title="Remove">
                {shortName(name)}
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="relative">
        <input
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          value={text}
          placeholder={selected.length ? "Add another university" : "e.g. Paderborn"}
          autoComplete="off"
          className="control pr-8"
          onFocus={() => { setOpen(true); setActive(0); }}
          onChange={(e) => { setText(e.target.value); setOpen(true); setActive(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, matches.length - 1)); }
            else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
            else if (e.key === "Enter") { e.preventDefault(); if (matches[active]) pick(matches[active].name); }
            else if (e.key === "Escape") setOpen(false);
          }}
        />
      </div>

      {open && matches.length > 0 && (
        <ul id={listId} role="listbox" className="absolute z-20 mt-1 w-full max-h-72 overflow-auto card shadow-md py-1 text-sm">
          {!text.trim() && <li className="px-3 py-1.5 eyebrow">{selected.length ? "Add another" : "Popular"}</li>}
          {matches.map((u, i) => (
            <li
              key={u.name}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(u.name); }}
              className={`px-3 py-2 cursor-pointer flex justify-between gap-3 ${i === active ? "bg-green-soft" : ""}`}
            >
              <span className="truncate">{highlight(u.name, text)}</span>
              <span className="text-muted tabular-nums shrink-0">{u.count}</span>
            </li>
          ))}
        </ul>
      )}
      {open && text.trim() && matches.length === 0 && (
        <div className="absolute z-20 mt-1 w-full card shadow-md px-3 py-2 text-sm text-muted">No university matches &ldquo;{text}&rdquo;</div>
      )}

      {selected.length === 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {quickPicks.map((u) => (
            <button key={u.name} type="button" onClick={() => pick(u.name)} className="chip hover:border-green-mid hover:text-green" title={`${u.count} programmes`}>
              {shortName(u.name)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function highlight(name: string, q: string) {
  const t = q.trim();
  if (!t) return name;
  const i = name.toLowerCase().indexOf(t.toLowerCase());
  if (i < 0) return name;
  return <>{name.slice(0, i)}<mark className="bg-gold-soft text-ink rounded-[2px]">{name.slice(i, i + t.length)}</mark>{name.slice(i + t.length)}</>;
}

function shortName(name: string) {
  return name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim().slice(0, 34);
}

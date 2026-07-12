"use client";

import { useEffect, useRef, useState } from "react";

export type Option = { value: string; label: string };

// Styled dropdown that matches our design (no native browser select chrome).
// Writes to a hidden input named `name` so it submits inside plain GET/POST forms.
export default function Select({
  name,
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
}: {
  name?: string;
  value: string;
  onChange?: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(v: string) {
    onChange?.(v);
    setOpen(false);
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg border border-[var(--line)] text-[14px] text-left bg-white outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all hover:border-[var(--blue-mid)]"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-[var(--ink)] truncate" : "text-[var(--ink-faint)] truncate"}>
          {selected?.label ?? placeholder}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={`text-[var(--ink-faint)] flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1.5 w-full max-h-64 overflow-auto bg-white border border-[var(--line)] rounded-xl shadow-[0_16px_40px_rgba(16,26,38,0.14)] py-1.5"
        >
          {options.map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => pick(o.value)}
                className={`w-full text-left px-3.5 py-2 text-[13.5px] transition-colors ${
                  o.value === value ? "bg-[var(--blue-soft)] text-[var(--blue-dark)] font-semibold" : "text-[var(--ink)] hover:bg-[var(--bg2)]"
                }`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

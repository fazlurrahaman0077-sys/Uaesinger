"use client";

import { useRef, useState } from "react";

// Search box over a server-rendered list. The rows stay server components —
// they hold server-action <form>s, and converting the whole list to a client
// component just to filter it would mean threading every action through props.
// Instead each row carries a lowercased data-search attribute and this toggles
// `hidden` on the misses.
// ponytail: DOM filtering, safe because `children` never re-renders (the term
// lives in state here, not in the rows). Lift it into React state if these
// lists ever paginate or update live.
export default function FilterRows({
  placeholder,
  children,
}: {
  placeholder: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [term, setTerm] = useState("");
  const [empty, setEmpty] = useState(false);

  function filter(value: string) {
    setTerm(value);
    const needle = value.trim().toLowerCase();
    const rows = ref.current?.querySelectorAll<HTMLElement>("[data-search]") ?? [];
    let shown = 0;
    rows.forEach((row) => {
      const hit = !needle || (row.dataset.search ?? "").includes(needle);
      row.hidden = !hit;
      if (hit) shown++;
    });
    setEmpty(needle !== "" && shown === 0);
  }

  return (
    <>
      <input
        type="search"
        value={term}
        onChange={(e) => filter(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full mb-3 bg-white border border-[var(--line)] rounded-lg px-3.5 py-2 text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)] transition-all"
      />
      <div ref={ref}>{children}</div>
      {empty && (
        <p className="px-5 py-8 text-center text-[13px] text-[var(--ink-dim)]">
          Nothing matches &ldquo;{term}&rdquo;.
        </p>
      )}
    </>
  );
}

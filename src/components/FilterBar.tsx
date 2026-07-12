"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "@/components/Select";
import { EMIRATES, GENDERS } from "@/lib/artists";

// Browse search + filters. Builds a shareable /artists?… URL on submit.
export default function FilterBar({
  category,
  subcategory,
  defaultQ = "",
  defaultCity = "",
  defaultGender = "",
}: {
  category?: string;
  subcategory?: string;
  defaultQ?: string;
  defaultCity?: string;
  defaultGender?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(defaultQ);
  const [city, setCity] = useState(defaultCity);
  const [gender, setGender] = useState(defaultGender);

  function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (subcategory) p.set("subcategory", subcategory);
    if (q.trim()) p.set("q", q.trim());
    if (city) p.set("city", city);
    if (gender) p.set("gender", gender);
    router.push(`/artists${p.toString() ? `?${p}` : ""}`);
  }

  return (
    <form onSubmit={submit} className="flex flex-col md:flex-row gap-2.5">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, style or keyword — e.g. Arabic singer, belly dancer"
        className="flex-1 px-4 py-3 rounded-xl border border-[var(--line)] text-[14px] bg-white outline-none focus:border-[var(--blue)] focus:ring-2 focus:ring-[var(--blue-soft)]"
      />
      <div className="flex gap-2.5">
        <Select
          value={city}
          onChange={setCity}
          placeholder="All Emirates"
          options={[{ value: "", label: "All Emirates" }, ...EMIRATES.map((e) => ({ value: e, label: e }))]}
          className="w-[150px]"
        />
        <Select
          value={gender}
          onChange={setGender}
          placeholder="Anyone"
          options={[{ value: "", label: "Anyone" }, ...GENDERS]}
          className="w-[130px]"
        />
        <button className="px-6 py-3 rounded-xl bg-[var(--blue)] text-white text-[14px] font-semibold hover:bg-[var(--blue-dark)] transition-all whitespace-nowrap">
          Search
        </button>
      </div>
    </form>
  );
}

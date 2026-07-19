"use client";

import { useEffect } from "react";

// Fires once per day per browser. Being client-side is the point: this only runs
// where JS runs, which is what makes the count organic rather than crawler noise.
// localStorage throttles the request; the (visitor_id, day) primary key is the
// real dedupe guard.
export default function VisitBeacon() {
  useEffect(() => {
    const day = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem("v_day") === day) return;
      localStorage.setItem("v_day", day);
    } catch {
      // Private mode / storage blocked — still count, the PK dedupes.
    }
    fetch("/api/visit", { method: "POST", keepalive: true }).catch(() => {});
  }, []);

  return null;
}

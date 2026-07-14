"use client";

import { useFormStatus } from "react-dom";

// Submit button that disables itself while the server action runs, so a slow
// submit can't be double-clicked into duplicate rows.
export default function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Sending…" : children}
    </button>
  );
}

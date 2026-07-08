// Subscription tiers. `quota` = number of artist contacts you can unlock;
// null = unlimited. Enforced in the reveal action + DB.
export type PlanId = "basic" | "standard" | "premium";

export type Plan = {
  id: PlanId;
  label: string;
  price: string;
  per: string;
  quota: number | null;
  contactsLabel: string;
  tagline: string;
  perks: string[];
  highlight?: boolean;
};

export const PLANS: Plan[] = [
  {
    id: "basic",
    label: "Basic",
    price: "AED 99",
    per: "/ month",
    quota: 5,
    contactsLabel: "5 artist contacts",
    tagline: "For a single event.",
    perks: ["Unlock 5 artist contacts", "Message artists directly", "Cancel anytime"],
  },
  {
    id: "standard",
    label: "Standard",
    price: "AED 249",
    per: "/ month",
    quota: 15,
    contactsLabel: "15 artist contacts",
    tagline: "For busy planners.",
    perks: ["Unlock 15 artist contacts", "Message artists directly", "Priority booking support"],
    highlight: true,
  },
  {
    id: "premium",
    label: "Premium",
    price: "AED 599",
    per: "/ month",
    quota: null,
    contactsLabel: "Unlimited contacts",
    tagline: "For agencies & venues.",
    perks: ["Unlimited artist contacts", "Message artists directly", "Priority booking support", "Early access to new talent"],
  },
];

export function getPlan(id: string | null | undefined): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}

export function quotaFor(planId: string | null | undefined): number | null {
  return getPlan(planId)?.quota ?? 0;
}

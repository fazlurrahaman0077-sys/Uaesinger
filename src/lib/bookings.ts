import { createClient } from "@/lib/supabase/server";

export type BookingStatus = "new" | "contacted" | "confirmed" | "declined";

export const BOOKING_STATUSES: BookingStatus[] = ["new", "contacted", "confirmed", "declined"];

export type Enquiry = {
  id: string;
  artistId: string;
  artistName: string;
  artistSlug: string;
  eventDate: string | null;
  message: string | null;
  status: BookingStatus;
  createdAt: string;
  hirerName: string | null;
  hirerPhone: string | null;
  sharedCard: { phone?: string | null; whatsapp?: string | null; email?: string | null } | null;
};

type Row = {
  id: string;
  artist_id: string;
  event_date: string | null;
  message: string | null;
  status: BookingStatus;
  created_at: string;
  hirer_name: string | null;
  hirer_phone: string | null;
  shared_card: { phone?: string | null; whatsapp?: string | null; email?: string | null } | null;
  artists: { name: string; slug: string } | null;
};

const COLS =
  "id, artist_id, event_date, message, status, created_at, hirer_name, hirer_phone, shared_card, artists ( name, slug )";

function toEnquiry(r: Row): Enquiry {
  return {
    id: r.id,
    artistId: r.artist_id,
    artistName: r.artists?.name ?? "Artist",
    artistSlug: r.artists?.slug ?? "",
    eventDate: r.event_date,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
    hirerName: r.hirer_name,
    hirerPhone: r.hirer_phone,
    sharedCard: r.shared_card,
  };
}

// Enquiries the current hirer has sent.
export async function listMyEnquiries(): Promise<Enquiry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from("bookings")
    .select(COLS)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as Row[]).map(toEnquiry);
}

// Enquiries sent to artists the current creator owns.
export async function listIncomingEnquiries(): Promise<Enquiry[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  const { data: owned } = await supabase.from("artists").select("id").eq("owner_id", user.id);
  const ids = (owned ?? []).map((a) => a.id);
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from("bookings")
    .select(COLS)
    .in("artist_id", ids)
    .order("created_at", { ascending: false });
  return ((data ?? []) as unknown as Row[]).map(toEnquiry);
}

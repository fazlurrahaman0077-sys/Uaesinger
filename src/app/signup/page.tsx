import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Create account | UAESinger",
  description: "Create a UAESinger account to book talent or list your act across the UAE.",
};

export default function SignUpPage() {
  return <AuthForm mode="signup" />;
}

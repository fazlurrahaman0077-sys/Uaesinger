import type { Metadata } from "next";
import AuthForm from "@/components/AuthForm";

export const metadata: Metadata = {
  title: "Sign in | UAESinger",
  description: "Sign in to your UAESinger account to manage bookings and contact talent.",
};

export default function SignInPage() {
  return <AuthForm mode="signin" />;
}

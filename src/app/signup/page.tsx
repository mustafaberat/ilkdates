import { AuthForm } from "@/components/AuthForm";
import { tr } from "@/i18n/tr";

export const metadata = {
  title: `${tr.signup} · ${tr.brand}`,
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}

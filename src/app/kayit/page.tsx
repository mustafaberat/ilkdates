import { AuthForm } from "@/components/AuthForm";
import { tr } from "@/i18n/tr";

export const metadata = {
  title: tr.signup,
};

export default function KayitPage() {
  return <AuthForm mode="signup" />;
}

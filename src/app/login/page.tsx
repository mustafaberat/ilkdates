import { AuthForm } from "@/components/AuthForm";
import { tr } from "@/i18n/tr";

export const metadata = {
  title: `${tr.login} · ${tr.brand}`,
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}

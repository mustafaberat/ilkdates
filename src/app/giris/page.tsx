import { AuthForm } from "@/components/AuthForm";
import { tr } from "@/i18n/tr";

export const metadata = {
  title: tr.login,
};

export default function GirisPage() {
  return <AuthForm mode="login" />;
}

import { AccountPage } from "@/components/AccountPage";
import { tr } from "@/i18n/tr";

export const metadata = {
  title: tr.accountTitle,
};

export default function HesapRoute() {
  return <AccountPage />;
}

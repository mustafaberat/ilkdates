import { renderHomeOg, ogSize } from "@/lib/og";
import { tr } from "@/i18n/tr";

export const alt = tr.metaTitle;
export const size = ogSize;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return renderHomeOg();
}

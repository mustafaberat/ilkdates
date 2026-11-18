export const tr = {
  brand: "İlkler",
  tagline: "İlklerinizi kaydedin.",
  metaDescription:
    "İlk el tutma, ilişki başlangıcı ve diğer ilk tarihlerinizi kaydedin. Giriş yapmadan da kullanabilirsiniz.",

  guestBanner:
    "Veriler sadece bu tarayıcıda, kayıt ol ki kaybolmasın.",
  guestBannerCta: "Kayıt ol",

  login: "Giriş yap",
  signup: "Kayıt ol",
  logout: "Çıkış",
  username: "Kullanıcı adı",
  password: "Şifre",
  usernameHint: "3–32 karakter, harf, rakam, nokta, _ veya -",
  passwordHint: "En az 8 karakter",
  loginSubmit: "Giriş yap",
  signupSubmit: "Hesap oluştur",
  hasAccount: "Hesabın var mı?",
  noAccount: "Hesabın yok mu?",
  backHome: "Takvime dön",
  loginLead: "Hesabına gir, ilklerin güvende kalsın.",
  signupLead: "Kayıt ol, tarayıcıdaki ilklerin hesabına taşınsın.",

  todayLabel: "Bugün",
  allFirsts: "Tüm ilkler",
  emptyMonth: "Bu günde henüz bir ilk yok.",
  emptyAll: "Henüz bir ilk eklemedin. Takvimden bir gün seçip ekleyebilirsin.",
  addEvent: "İlk ekle",
  editEvent: "İlki düzenle",
  save: "Kaydet",
  cancel: "Vazgeç",
  delete: "Sil",
  deleteConfirm: "Bu ilki silmek istiyor musun?",
  title: "Başlık",
  titlePlaceholder: "İlk el tutma, ilişki başlangıcı…",
  date: "Tarih",
  emoji: "Emoji",
  category: "Kategori",
  categoryPlaceholder: "İsteğe bağlı",
  note: "Not",
  notePlaceholder: "İsteğe bağlı bir not",
  recurrence: "Tekrar",
  recurrenceNone: "Yok",
  recurrenceMonthly: "Aylık",
  recurrenceYearly: "Yıllık",
  close: "Kapat",
  selectedDay: "Seçilen gün",
  prevMonth: "Önceki ay",
  nextMonth: "Sonraki ay",
  daysCount: "{n}. gün",
  monthsCount: "{n}. ay",
  yearsCount: "{n}. yıl",
  todayStart: "Bugün «{title}» başladı.",
  todayDay: "Bugün «{title}» için {n}. gün.",
  todayYearly: "Bugün «{title}» günü · {n}. yıl.",
  todayMonthly: "Bugün «{title}» günü · {n}. ay.",
  migrated: "{n} yerel ilk hesabına aktarıldı.",
  loading: "Yükleniyor…",
  futureDay: "İleriki günlere ilk eklenemez.",
  futureDate: "Tarih bugünden sonra olamaz.",
  errorGeneric: "Bir hata oluştu. Lütfen tekrar dene.",
  invalidCredentials: "Kullanıcı adı veya şifre yanlış.",
  usernameTaken: "Bu kullanıcı adı alınmış.",
  invalidUsername: "Kullanıcı adı 3–32 karakter olmalı; harf, rakam, nokta, _ veya - kullan.",
  invalidPassword: "Şifre en az 8 karakter olmalı.",
  invalidTitle: "Başlık 1–80 karakter olmalı.",
  invalidDate: "Geçerli bir tarih gir.",
  authUnavailable:
    "Hesap özelliği henüz bağlı değil. Takvimi giriş yapmadan kullanmaya devam edebilirsin.",
  weekMon: "Pt",
  weekTue: "Sa",
  weekWed: "Ça",
  weekThu: "Pe",
  weekFri: "Cu",
  weekSat: "Ct",
  weekSun: "Pz",
  monthNames:
    "Ocak,Şubat,Mart,Nisan,Mayıs,Haziran,Temmuz,Ağustos,Eylül,Ekim,Kasım,Aralık",
} as const;

export type TrKey = keyof typeof tr;

export function t(
  template: string,
  vars: Record<string, string | number> = {},
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key]),
  );
}

export const weekdays = [
  tr.weekMon,
  tr.weekTue,
  tr.weekWed,
  tr.weekThu,
  tr.weekFri,
  tr.weekSat,
  tr.weekSun,
] as const;

export const monthNames = tr.monthNames.split(",");

export function formatMonthYear(year: number, month: number): string {
  return `${monthNames[month - 1]} ${year}`;
}

export function formatLongDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${monthNames[m - 1]} ${y}`;
}

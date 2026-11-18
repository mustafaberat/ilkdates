# İlkler

İlişkideki ilkleri (ilk el tutma, ilişki başlangıcı, ilk randevu…) tarihlerle kaydeden minimal bir web uygulaması.

Giriş yapmadan tarayıcıda (`localStorage`) kullanılabilir. Kayıt olunca yerel kayıtlar hesaba aktarılır.

Geçici klasör/uygulama adı: **ilkler**. İsim henüz kesin değil; yeniden adlandırması kolay olsun diye seçildi.

## Çalıştırma (yerel, veritabanı yok)

Node 24 gerekir (`.nvmrc`).

```bash
cd ~/Projects/personal-proj/websites/ilkler
nvm use
npm install
npm run dev
```

Tarayıcı: [http://localhost:3005](http://localhost:3005)

Misafir kipinde takvim, geçmiş/bugünkü günlere ilk ekleme, gün sayacı ve aylık/yıllık yıldönümü vurguları çalışır. Giriş/kayıt için `DATABASE_URL` ve `SESSION_SECRET` gerekir.

## Komutlar

| Komut | Ne yapar |
| --- | --- |
| `npm run dev` | Geliştirme sunucusu, port 3005 |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run test` | Vitest (gün sayacı / yıldönümü) |
| `npm run build` | Üretim derlemesi |
| `npm run db:generate` | Drizzle migration üretir |
| `npm run db:migrate` | Migration'ı Neon'a uygular |

## Vercel Postgres + yayın (henüz yapılmadı)

Bunlar onayınla yapılacak işler. Bu repoda Vercel projesi, veritabanı, GitHub remote veya push yok.

1. GitHub'da bir repo açıp `main`'i push'la (onayın gerekir).
2. [Vercel](https://vercel.com) hesabında projeyi import et: `vercel` veya dashboard → Add New → Project.
3. Storage → **Create Database** → **Neon** (Vercel Postgres). Projeye bağla. Vercel şunları yazar:
   - `DATABASE_URL`
   - `DATABASE_URL_UNPOOLED`
   - `POSTGRES_URL` (ve gerekirse `POSTGRES_URL_NON_POOLING`)
4. Environment Variables'a ekle:
   ```bash
   openssl rand -hex 32
   ```
   Çıktıyı `SESSION_SECRET` olarak Production / Preview / Development'a koy.
5. Migration'ı uygula, iki yoldan biri:
   ```bash
   # Yerelde (DATABASE_URL dolu .env.local ile)
   npm run db:migrate
   ```
   veya Neon SQL Editor'de `drizzle/0000_init.sql` dosyasını çalıştır.
6. Deploy et (`vercel --prod` veya git push sonrası otomatik deploy).
7. İstersen `vercel env pull .env.local` ile yerel giriş testini aç.

## Tasarım

Renk, yazı tipi, boşluk ve yarıçaplar `src/styles/tokens.css` içinde. Seçilen mockup sonra bu değişkenlerle uygulanabilir. Arayüz metinleri `src/i18n/tr.ts` dosyasında.

## Notlar

- V1'de tekrar alanı (`none` / `monthly` / `yearly`) saklanır; takvim senkronu veya bildirim yoktur.
- Tarihler `YYYY-MM-DD` olarak tutulur. "Bugün" tarayıcıda `Europe/Istanbul` dilimine göre hesaplanır.
- Düzen 320×568 ekrana sığacak şekilde kuruldu.

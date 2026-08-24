# Omborxona hisobi — ishga tushirish qo'llanmasi

## 1. Supabase sozlash
1. `sql/schema.sql` faylini Supabase Dashboard → SQL Editor'da to'liq ishga tushiring (agar hali qilmagan bo'lsangiz).
2. Xodim qo'shish: Authentication → Users → Add user (email + parol). Kerak bo'lsa Table Editor → profiles jadvalida `role` ni `admin` ga o'zgartiring.

## 2. GitHub'ga yuklash
1. github.com'da yangi repository yarating (masalan `omborxona-hisobi`), Public yoki Private — farqi yo'q.
2. Shu papkadagi barcha fayllarni o'sha repository'ga yuklang (GitHub saytida "uploading an existing file" orqali ham, yoki `git` orqali ham mumkin).
   ⚠️ `.env.local` faylini HECH QACHON yuklamang (u avtomatik `.gitignore`da yashiringan).

## 3. Vercel'da joylashtirish
1. vercel.com'ga GitHub hisobingiz bilan kiring.
2. "Add New Project" → GitHub repository'ngizni tanlang.
3. "Environment Variables" bo'limida ikkita o'zgaruvchi qo'shing:
   - `VITE_SUPABASE_URL` = `https://dsfsiregcubqiovncrcr.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = sizning publishable (anon) kalitingiz
4. "Deploy" tugmasini bosing. Bir necha daqiqadan so'ng sizga haqiqiy havola beriladi (masalan `omborxona-hisobi.vercel.app`).

## Muhim eslatma
- `sb_secret_...` bilan boshlanadigan kalitni HECH QAYERDA (kod, GitHub, Vercel) ishlatmang — bu faqat administrator uchun maxfiy kalit.
- Faqat `sb_publishable_...` (anon) kalitni frontendda ishlatish xavfsiz.

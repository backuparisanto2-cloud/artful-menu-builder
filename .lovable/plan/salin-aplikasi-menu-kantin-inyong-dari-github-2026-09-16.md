# Salin aplikasi Menu Kantin Inyong dari GitHub

Menyalin seluruh aplikasi dari repositori `my-menu-canvas-art` ke proyek ini: halaman menu publik, halaman login, dan panel admin lengkap dengan databasenya.

## Yang akan dibuat

**Halaman menu (halaman depan)**
- Daftar halaman menu berurutan, gambar tampil bertahap agar cepat dibuka
- Tombol favorit per halaman dan filter "hanya favorit"
- Tampilan gambar layar penuh dengan gesek/geser antar halaman
- Tombol bagikan gambar, unduh menu, tombol WhatsApp, dan tombol kembali ke atas
- Judul dan deskripsi halaman untuk pencarian Google

**Login dan panel admin**
- Halaman masuk untuk pemilik
- Panel admin: unggah gambar menu, ubah judul/subjudul, ubah urutan, hapus halaman
- Hanya akun dengan peran admin yang bisa mengubah data

**Penyimpanan data**
- Menyalakan Lovable Cloud lalu menerapkan struktur database dari repositori: daftar halaman menu, nomor versi situs, tabel peran pengguna, serta tempat penyimpanan gambar dengan izin yang sama seperti aslinya

## Gambar menu

Gambar dari proyek lama tidak terbawa. Setelah bagian di atas selesai, kirimkan 9 file gambar menu di chat; saya masukkan ke proyek ini dan daftarkan urutannya. Sebelum gambar masuk, halaman menu tampil kosong dengan pesan singkat.

## Akun admin

Setelah Cloud aktif, buat akun lewat halaman masuk, lalu beri tahu saya alamat emailnya supaya saya tandai sebagai admin.

## Catatan teknis

- Repositori memakai stack yang sama (TanStack Start + Tailwind v4 + shadcn), jadi berkas disalin apa adanya: `src/routes` (`index.tsx`, `auth.tsx`, `_authenticated/route.tsx`, `_authenticated/admin.tsx`, `api/public/menu-image/$.ts`), `src/components/menu-lightbox.tsx`, `whatsapp-icon.tsx`, komponen ui yang belum ada, `src/data/menu-pages.ts`, `src/hooks/use-favorites.ts`, dan pustaka di `src/lib` (export html/zip, share, preload, webp-encode, `menu.functions.ts`).
- `src/integrations/supabase/*` tidak disalin dari repo; dipakai berkas yang dihasilkan saat Lovable Cloud diaktifkan, dan `src/start.ts` disesuaikan agar token ikut terkirim untuk fungsi yang butuh login.
- Dependensi tambahan yang dipasang: `@supabase/supabase-js`, `jszip`, komponen radix/embla/sonner/vaul dan pendukung shadcn sesuai daftar di repo.
- Tiga migrasi SQL dari repo diterapkan sebagai satu migrasi baru (tabel, grant, RLS, fungsi `has_role`/`reorder_menu_pages`/`bump_site_version`, bucket `menu-images` + policy storage). Baris data menu tidak ada di repo, jadi terisi saat gambar diunggah.
- Gaya warna cokelat/krem dari `src/styles.css` repo dipindahkan ke token desain proyek ini.

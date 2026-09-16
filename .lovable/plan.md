# Rapikan Halaman Pengelolaan Menu

Halaman pengelola di `/admin` sudah bisa menambah, mengubah, mengurutkan, dan menghapus halaman menu. Rencana ini melengkapi bagian yang masih terasa kurang saat dipakai.

## Yang akan diperbaiki

1. **Keadaan kosong dan proses muat**
   - Saat belum ada halaman menu, tampil kotak sambutan: "Belum ada halaman menu" plus tombol besar "Tambah halaman".
   - Saat data sedang dimuat, tampil kerangka daftar, bukan halaman kosong.

2. **Formulir per halaman yang jelas**
   - Setiap kartu mendapat tombol "Simpan" sendiri untuk judul dan keterangan, jadi tidak perlu menyimpan semuanya sekaligus.
   - Kartu yang belum disimpan diberi tanda "belum disimpan", dan peringatan muncul kalau pengguna mau menutup halaman dengan perubahan yang tertinggal.

3. **Menambah halaman lebih rapi**
   - Setelah foto diunggah, judul langsung bisa diisi (tidak lagi otomatis "Halaman baru" saja) dan kartu barunya digulirkan ke tampilan.
   - Tampil indikator kemajuan saat mengunggah beberapa foto sekaligus.

4. **Hapus yang lebih aman**
   - Kotak konfirmasi bawaan peramban diganti dialog di dalam aplikasi yang menyebut judul halaman dan mengingatkan bahwa fotonya ikut terhapus.

5. **Urutan langsung tersimpan**
   - Tombol naik/turun langsung menyimpan urutan baru, sehingga urutan tidak hilang kalau lupa menekan "Simpan perubahan".

6. **Pesan status yang lebih ramah**
   - Pesan berhasil/gagal muncul sebagai notifikasi singkat, bukan baris teks yang menumpuk.
   - Pesan kegagalan ditulis dalam bahasa sehari-hari (mis. berkas terlalu besar, tidak ada akses pengelola).

7. **Pintu masuk pengelola**
   - Tautan halus "Kelola" di bagian bawah halaman utama untuk pemilik, sehingga tidak perlu menghafal alamat `/admin`.

## Catatan teknis

- Semua perubahan di `src/routes/_authenticated/admin.tsx`, ditambah komponen dialog konfirmasi kecil dan pemakaian `sonner` (`<Toaster />` didaftarkan sekali di `src/routes/__root.tsx`).
- Simpan per kartu memakai `update` pada tabel `menu_pages` untuk baris tersebut, lalu `bump_site_version`; urutan tetap memakai `reorder_menu_pages`.
- Tanpa perubahan basis data: struktur `menu_pages`, aturan akses, dan penyimpanan foto tetap seperti sekarang.
- Tautan "Kelola" pada halaman utama hanya berupa tautan biasa ke `/admin`; penjagaan akses tetap di lapis pengelola.

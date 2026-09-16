# Splash Screen Kantin Inyong

## Hasil yang akan dibuat
- Splash screen satu layar penuh dengan nama **Kantin Inyong** sebagai fokus utama.
- Tampilan mengikuti warna restoran saat ini: latar krem hangat, cokelat tua, dan aksen hijau.
- Gaya progressive minimalist dan eksklusif: tipografi bersih, garis aksen halus, tanpa ornamen ramai atau gambar berat.
- Animasi masuk lembut, jeda singkat, lalu transisi keluar menuju halaman menu.

## Perilaku
- Muncul hanya sekali selama tab/sesi browser masih aktif.
- Durasi total sekitar 1 detik agar terasa cepat dan tidak menghambat pengunjung.
- Halaman menu tetap disiapkan di belakang sehingga langsung siap setelah splash selesai.
- Animasi dinonaktifkan atau dipersingkat bagi pengguna yang memilih pengurangan gerakan.
- Splash tidak akan muncul di halaman login atau pengelolaan menu.

## Teknis
- Tambahkan komponen splash khusus pada halaman depan dengan penanda sesi browser.
- Tambahkan token warna dan animasi splash pada sistem gaya global, selaras dengan tema restoran.
- Cegah kedipan tampilan dan interaksi tidak sengaja selama splash aktif.
- Lengkapi metadata halaman depan yang diwajibkan dan pertahankan fungsi menu, favorit, berbagi, serta menu samping tanpa perubahan.

## Pemeriksaan
- Uji pada layar ponsel dan desktop.
- Pastikan kunjungan pertama menampilkan splash, sedangkan pemuatan ulang dalam sesi yang sama langsung menampilkan menu.
- Pastikan tidak ada pergeseran tampilan, tumpang tindih, atau error pada konsol.

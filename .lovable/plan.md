# Samakan HTML statis dengan halaman depan

## Hasil yang akan dibuat
- Menyamakan susunan halaman, jarak antar gambar, warna latar, sudut gambar, dan tampilan ukuran ponsel/desktop.
- Menyamakan tombol favorit: bentuk bulat, posisi kanan atas, warna hati aktif, efek tekan, dan penyimpanan favorit selama satu jam.
- Memindahkan tombol WhatsApp ke kanan di bawah tombol favorit, memakai bentuk, ukuran, bayangan, animasi memantul, dan cara berbagi gambar yang sama.
- Menambahkan tombol menu di kiri atas beserta panel samping, lapisan penutup, animasi buka/tutup, daftar halaman, filter favorit, dan navigasi gulir ke gambar terpilih.
- Menyamakan tombol kembali ke atas yang muncul setelah pengguna menggulir cukup jauh.
- Mempertahankan tampilan layar penuh dengan favorit, WhatsApp, geser halaman, zoom, tombol kembali perangkat, keyboard, dan animasi yang selaras dengan halaman depan.
- Menambahkan bagian bawah halaman yang sama, tetapi tanpa tautan pengelola karena berkas statis tidak terhubung ke halaman admin.

## Teknis
- Perubahan dipusatkan pada pembuat `index.html` statis agar hasil unduhan ZIP tetap mandiri dan dapat dibuka tanpa aplikasi utama.
- Ikon menu, tutup, hati, panah, dan WhatsApp akan ditanam langsung di HTML agar tidak membutuhkan internet atau berkas tambahan selain folder gambar.
- Perilaku animasi akan menghormati pengaturan perangkat untuk mengurangi gerakan.
- Hasil akan diperiksa pada ukuran ponsel dan desktop, termasuk menu samping, favorit, berbagi, layar penuh, dan tombol kembali ke atas.

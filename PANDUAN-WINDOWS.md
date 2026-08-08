# Panduan Menjalankan Sistem Laporan DKBPP di Komputer (Windows)

Sistem ini berjalan sendiri di komputer anda. **Semua data (peraku, bangsa, dll.)
disimpan kekal** dalam fail `data/pencalonan.json` di dalam folder ini —
tidak hilang walaupun tutup pelayar atau matikan komputer.

---

## Langkah 1 — Pasang Node.js (sekali sahaja)

1. Pergi ke **https://nodejs.org**
2. Muat turun versi **LTS** (butang hijau di sebelah kiri).
3. Buka fail yang dimuat turun, klik **Next → Next → Install** sehingga siap.

*(Node.js ialah "enjin" yang menjalankan sistem. Pasang sekali sahaja.)*

---

## Langkah 2 — Letak folder sistem di Desktop

1. Muat turun sistem sebagai ZIP dari GitHub *(pautan diberi oleh pembangun)*.
2. **Extract / unzip** kandungannya ke:
   ```
   C:\Users\mhdzh\OneDrive\Desktop\SISTEM LAPORAN DKBPP
   ```
   Pastikan fail `mula-sistem.bat` dan `server.js` berada **terus** dalam folder itu
   (bukan dalam folder lain di dalamnya).

---

## Langkah 3 — Mula guna

1. Buka folder **SISTEM LAPORAN DKBPP**.
2. **Klik dua kali** fail **`mula-sistem.bat`**.
   - Kali pertama: ia akan memuat turun keperluan (1–2 minit, perlu internet).
   - Selepas itu: pelayar akan terbuka sendiri di halaman pencalonan.
3. Guna sistem seperti biasa di **http://localhost:3000/pencalonan**

> ⚠️ **Biarkan tetingkap hitam (Command Prompt) terbuka** semasa menggunakan sistem.
> Untuk menutup sistem, tutup tetingkap hitam itu.

Kali seterusnya, cukup klik dua kali `mula-sistem.bat` sahaja.

---

## Soalan Lazim

**Data saya tersimpan di mana?**
Dalam fail `data/pencalonan.json` di dalam folder ini. Anda boleh salin folder ini
ke tempat lain sebagai sandaran (backup).

**Perlukah internet?**
Hanya kali pertama (untuk pasang keperluan). Selepas itu boleh guna tanpa internet.
*(Nota: paparan paling kemas jika ada internet, kerana sebahagian gaya dimuat dari
talian.)*

**"Windows protected your PC" muncul semasa buka .bat?**
Klik **More info → Run anyway**. Ini normal untuk fail .bat yang dimuat turun.

**Gambar calon tak keluar?**
Pastikan folder `public/gambar` (berisi gambar) turut ter-extract bersama.

**Nak buka di komputer lain?**
Salin seluruh folder ini ke komputer itu, pasang Node.js, dan klik `mula-sistem.bat`.

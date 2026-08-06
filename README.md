# Sistem Laporan DKBPP

Sistem web untuk pendaftaran dan senarai penerima **Darjah Kebesaran, Bintang dan Pingat Persekutuan**,
serta sistem pelaporan **pencalonan** DKBPP.

## Ciri-ciri

### Penerima

- Pendaftaran penerima (nama, no. KP, jenis anugerah, gelaran/pangkat, tahun, negeri/institusi, catatan)
- Senarai penerima dengan carian dan tapisan (jenis anugerah, tahun, negeri/institusi)
- Kemaskini dan padam rekod
- Jana laporan untuk cetak (guna "Print to PDF" pada pelayar)
- Eksport senarai ke CSV (boleh dibuka di Excel)

### Pencalonan (`/pencalonan`)

- Senarai calon disusun mengikut kementerian/jabatan, dengan carian dan tapisan
  (kementerian, kategori pencalonan, anugerah, skim)
- Setiap laman calon mempunyai butang **PERAKU** — apabila calon diperaku, rekod
  bertukar status dan dipaparkan di `/pencalonan/diperaku` (Senarai Diperaku),
  juga disusun mengikut kementerian
- Kemaskini maklumat tambahan (bangsa, skim perkhidmatan) pada laman calon
- Statistik keseluruhan di `/pencalonan/statistik`: jumlah calon, jumlah
  diperaku/belum diperaku, serta pecahan mengikut skim, bangsa, kementerian
  dan kategori pencalonan
- Data pencalonan awal (`data/pencalonan.json`) diekstrak daripada laporan
  pencalonan DKBPP (Kategori B: Sektor Awam/PBT/Badan Berkanun, Kategori C:
  Swasta/Persatuan/Sukarela/Sukan). Medan **bangsa** tiada dalam sumber asal
  dan perlu diisi secara manual melalui laman calon; medan **skim** dianggarkan
  daripada gred gaji dan boleh dibetulkan.

## Menjalankan sistem

```bash
npm install
npm start
```

Kemudian buka `http://localhost:3000` di pelayar.

## Struktur data

Data disimpan dalam `data/penerima.json`. Untuk pengeluaran (production) sebenar,
gantikan lapisan storan di `lib/db.js` dengan pangkalan data seperti PostgreSQL/MySQL.

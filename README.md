# Sistem Laporan DKBPP

Sistem web untuk pendaftaran dan senarai penerima **Darjah Kebesaran, Bintang dan Pingat Persekutuan**.

## Ciri-ciri

- Pendaftaran penerima (nama, no. KP, jenis anugerah, gelaran/pangkat, tahun, negeri/institusi, catatan)
- Senarai penerima dengan carian dan tapisan (jenis anugerah, tahun, negeri/institusi)
- Kemaskini dan padam rekod
- Jana laporan untuk cetak (guna "Print to PDF" pada pelayar)
- Eksport senarai ke CSV (boleh dibuka di Excel)

## Menjalankan sistem

```bash
npm install
npm start
```

Kemudian buka `http://localhost:3000` di pelayar.

## Struktur data

Data disimpan dalam `data/penerima.json`. Untuk pengeluaran (production) sebenar,
gantikan lapisan storan di `lib/db.js` dengan pangkalan data seperti PostgreSQL/MySQL.

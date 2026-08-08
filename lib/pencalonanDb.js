const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'pencalonan.json');

function readAll() {
  const raw = fs.readFileSync(DB_FILE, 'utf8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeAll(records) {
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2));
}

// Susunan tetap 6 kategori rasmi (untuk header sidebar).
const KATEGORI_URUTAN = [
  'Perkhidmatan Awam',
  'Badan Berkanun/PBT',
  'Swasta/Persatuan/Sukan',
  'Warganegara Asing (Kehormat)',
  'Perkhidmatan Angkatan Tentera Malaysia (ATM)',
  'Perkhidmatan Polis DiRaja Malaysia (PDRM)',
];

function kategoriIndex(k) {
  const i = KATEGORI_URUTAN.indexOf(k);
  return i === -1 ? 999 : i;
}

function list(filters = {}) {
  let records = readAll();
  if (filters.kategori) {
    records = records.filter((r) => r.kategori === filters.kategori);
  }
  if (filters.kementerian) {
    records = records.filter((r) => r.kementerian === filters.kementerian);
  }
  if (filters.anugerah) {
    records = records.filter((r) => r.anugerah === filters.anugerah);
  }
  if (filters.skim) {
    records = records.filter((r) => r.skim === filters.skim);
  }
  if (filters.status) {
    records = records.filter((r) => r.status === filters.status);
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    records = records.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.noKadPengenalan.toLowerCase().includes(q) ||
        r.jawatan.toLowerCase().includes(q)
    );
  }
  return records;
}

// Kumpul rekod: kategori -> kementerian -> calon (untuk paparan laporan).
function groupByKategori(records) {
  const byKat = {};
  records.forEach((r) => {
    const k = r.kategori || 'Lain-lain';
    (byKat[k] = byKat[k] || []).push(r);
  });
  return Object.keys(byKat)
    .sort((a, b) => kategoriIndex(a) - kategoriIndex(b) || a.localeCompare(b))
    .map((kategori) => {
      const rows = byKat[kategori];
      const byKem = {};
      rows.forEach((r) => { (byKem[r.kementerian] = byKem[r.kementerian] || []).push(r); });
      const kementerianGroups = Object.keys(byKem)
        .sort((a, b) => a.localeCompare(b))
        .map((kementerian) => ({
          kementerian,
          calon: byKem[kementerian].sort((a, b) => a.nama.localeCompare(b.nama)),
        }));
      return { kategori, jumlah: rows.length, kementerianGroups };
    });
}

// Struktur kategori (6 header) + kementerian untuk navigasi sisi kiri.
// statusFilter: 'diperaku' | 'belum_diperaku' | undefined (semua)
function kategoriStructure(statusFilter) {
  let records = readAll();
  if (statusFilter) records = records.filter((r) => r.status === statusFilter);
  const byKat = {};
  records.forEach((r) => {
    const k = r.kategori || 'Lain-lain';
    if (!byKat[k]) byKat[k] = { jumlah: 0, kem: {} };
    byKat[k].jumlah += 1;
    byKat[k].kem[r.kementerian] = (byKat[k].kem[r.kementerian] || 0) + 1;
  });
  return Object.keys(byKat)
    .sort((a, b) => kategoriIndex(a) - kategoriIndex(b) || a.localeCompare(b))
    .map((kategori) => ({
      kategori,
      jumlah: byKat[kategori].jumlah,
      kementerian: Object.keys(byKat[kategori].kem)
        .sort((a, b) => a.localeCompare(b))
        .map((kementerian) => ({ kementerian, jumlah: byKat[kategori].kem[kementerian] })),
    }));
}

function count(statusFilter) {
  let records = readAll();
  if (statusFilter) records = records.filter((r) => r.status === statusFilter);
  return records.length;
}

function get(id) {
  return readAll().find((r) => r.id === Number(id));
}

function distinctValues(field) {
  const records = readAll();
  return [...new Set(records.map((r) => r[field]).filter(Boolean))].sort();
}

function peraku(id, diperakuOleh) {
  const records = readAll();
  const idx = records.findIndex((r) => r.id === Number(id));
  if (idx === -1) return null;
  records[idx].status = 'diperaku';
  records[idx].diperakuOleh = (diperakuOleh || '').trim();
  records[idx].tarikhPeraku = new Date().toISOString();
  records[idx].updatedAt = new Date().toISOString();
  writeAll(records);
  return records[idx];
}

function batalPeraku(id) {
  const records = readAll();
  const idx = records.findIndex((r) => r.id === Number(id));
  if (idx === -1) return null;
  records[idx].status = 'belum_diperaku';
  records[idx].diperakuOleh = '';
  records[idx].tarikhPeraku = '';
  records[idx].updatedAt = new Date().toISOString();
  writeAll(records);
  return records[idx];
}

function updateMaklumatTambahan(id, data) {
  const records = readAll();
  const idx = records.findIndex((r) => r.id === Number(id));
  if (idx === -1) return null;
  if (typeof data.bangsa === 'string') records[idx].bangsa = data.bangsa.trim();
  if (typeof data.skim === 'string' && data.skim.trim()) records[idx].skim = data.skim.trim();
  records[idx].updatedAt = new Date().toISOString();
  writeAll(records);
  return records[idx];
}

function statistik() {
  const records = readAll();
  const total = records.length;
  const diperaku = records.filter((r) => r.status === 'diperaku').length;
  const belumDiperaku = total - diperaku;

  function tally(field) {
    const counts = {};
    records.forEach((r) => {
      const key = r[field] || 'Tidak Dinyatakan';
      if (!counts[key]) counts[key] = { jumlah: 0, diperaku: 0 };
      counts[key].jumlah += 1;
      if (r.status === 'diperaku') counts[key].diperaku += 1;
    });
    return Object.keys(counts)
      .sort((a, b) => counts[b].jumlah - counts[a].jumlah)
      .map((key) => ({ label: key, ...counts[key] }));
  }

  return {
    total,
    diperaku,
    belumDiperaku,
    ikutSkim: tally('skim'),
    ikutBangsa: tally('bangsa'),
    ikutKementerian: tally('kementerian'),
    ikutKategori: tally('kategori'),
    ikutAnugerah: tally('anugerah'),
  };
}

module.exports = {
  KATEGORI_URUTAN,
  list,
  groupByKategori,
  get,
  distinctValues,
  kategoriStructure,
  count,
  peraku,
  batalPeraku,
  updateMaklumatTambahan,
  statistik,
};

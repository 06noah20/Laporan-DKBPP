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

function list(filters = {}) {
  let records = readAll();
  if (filters.kementerian) {
    records = records.filter((r) => r.kementerian === filters.kementerian);
  }
  if (filters.kategoriPencalonan) {
    records = records.filter((r) => r.kategoriPencalonan === filters.kategoriPencalonan);
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

function groupByKementerian(records) {
  const groups = {};
  records.forEach((r) => {
    if (!groups[r.kementerian]) groups[r.kementerian] = [];
    groups[r.kementerian].push(r);
  });
  return Object.keys(groups)
    .sort((a, b) => a.localeCompare(b))
    .map((kementerian) => ({
      kementerian,
      calon: groups[kementerian].sort((a, b) => a.nama.localeCompare(b.nama)),
    }));
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
    ikutKategori: tally('kategoriPencalonan'),
    ikutAnugerah: tally('anugerah'),
  };
}

module.exports = {
  list,
  groupByKementerian,
  get,
  distinctValues,
  peraku,
  batalPeraku,
  updateMaklumatTambahan,
  statistik,
};

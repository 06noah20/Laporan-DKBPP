const fs = require('fs');
const path = require('path');

const DB_FILE = path.join(__dirname, '..', 'data', 'penerima.json');

function readAll() {
  const raw = fs.readFileSync(DB_FILE, 'utf8').trim();
  return raw ? JSON.parse(raw) : [];
}

function writeAll(records) {
  fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2));
}

function nextId(records) {
  return records.reduce((max, r) => Math.max(max, r.id), 0) + 1;
}

function list(filters = {}) {
  let records = readAll();
  if (filters.jenisAnugerah) {
    records = records.filter((r) => r.jenisAnugerah === filters.jenisAnugerah);
  }
  if (filters.tahun) {
    records = records.filter((r) => String(r.tahun) === String(filters.tahun));
  }
  if (filters.negeriInstitusi) {
    records = records.filter(
      (r) => r.negeriInstitusi.toLowerCase() === filters.negeriInstitusi.toLowerCase()
    );
  }
  if (filters.q) {
    const q = filters.q.toLowerCase();
    records = records.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.noKp.toLowerCase().includes(q) ||
        r.gelaran.toLowerCase().includes(q)
    );
  }
  return records.sort((a, b) => b.tahun - a.tahun || a.nama.localeCompare(b.nama));
}

function get(id) {
  return readAll().find((r) => r.id === Number(id));
}

function create(data) {
  const records = readAll();
  const now = new Date().toISOString();
  const record = {
    id: nextId(records),
    nama: data.nama.trim(),
    noKp: data.noKp.trim(),
    jenisAnugerah: data.jenisAnugerah,
    gelaran: data.gelaran.trim(),
    tahun: Number(data.tahun),
    negeriInstitusi: data.negeriInstitusi.trim(),
    catatan: (data.catatan || '').trim(),
    createdAt: now,
    updatedAt: now,
  };
  records.push(record);
  writeAll(records);
  return record;
}

function update(id, data) {
  const records = readAll();
  const idx = records.findIndex((r) => r.id === Number(id));
  if (idx === -1) return null;
  records[idx] = {
    ...records[idx],
    nama: data.nama.trim(),
    noKp: data.noKp.trim(),
    jenisAnugerah: data.jenisAnugerah,
    gelaran: data.gelaran.trim(),
    tahun: Number(data.tahun),
    negeriInstitusi: data.negeriInstitusi.trim(),
    catatan: (data.catatan || '').trim(),
    updatedAt: new Date().toISOString(),
  };
  writeAll(records);
  return records[idx];
}

function remove(id) {
  const records = readAll();
  const filtered = records.filter((r) => r.id !== Number(id));
  writeAll(filtered);
  return filtered.length !== records.length;
}

function distinctValues(field) {
  const records = readAll();
  return [...new Set(records.map((r) => r[field]).filter(Boolean))].sort();
}

module.exports = { list, get, create, update, remove, distinctValues };

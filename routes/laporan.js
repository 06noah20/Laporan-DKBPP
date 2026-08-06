const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { JENIS_ANUGERAH } = require('../lib/constants');

function getFilters(req) {
  return {
    jenisAnugerah: req.query.jenisAnugerah || '',
    tahun: req.query.tahun || '',
    negeriInstitusi: req.query.negeriInstitusi || '',
    q: req.query.q || '',
  };
}

function csvEscape(value) {
  const str = String(value ?? '');
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Paparan cetak (boleh guna "Print to PDF" pada pelayar)
router.get('/cetak', (req, res) => {
  const filters = getFilters(req);
  const records = db.list(filters);
  res.render('cetak', { records, filters, tarikh: new Date() });
});

// Eksport CSV (boleh dibuka dalam Excel)
router.get('/eksport.csv', (req, res) => {
  const filters = getFilters(req);
  const records = db.list(filters);
  const header = [
    'Nama',
    'No. Kad Pengenalan',
    'Jenis Anugerah',
    'Gelaran/Pangkat',
    'Tahun',
    'Negeri/Institusi',
    'Catatan',
  ];
  const rows = records.map((r) => [
    r.nama,
    r.noKp,
    r.jenisAnugerah,
    r.gelaran,
    r.tahun,
    r.negeriInstitusi,
    r.catatan,
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n');
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename="laporan-dkbpp.csv"');
  res.send('﻿' + csv);
});

module.exports = router;

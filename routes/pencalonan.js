const express = require('express');
const os = require('os');
const router = express.Router();
const multer = require('multer');
const db = require('../lib/pencalonanDb');
const { processDocuments } = require('../lib/process-upload');
const { BANGSA } = require('../lib/constants');

const upload = multer({ dest: os.tmpdir(), limits: { fileSize: 60 * 1024 * 1024 } });

function filtersFromQuery(req) {
  return {
    kategori: req.query.kategori || '',
    kementerian: req.query.kementerian || '',
    anugerah: req.query.anugerah || '',
    skim: req.query.skim || '',
    q: req.query.q || '',
  };
}

function filterLists() {
  return {
    kategoriList: db.distinctValues('kategori'),
    anugerahList: db.distinctValues('anugerah'),
    skimList: db.distinctValues('skim'),
  };
}

// Homepage: muat naik dokumen + ringkasan
router.get('/', (req, res) => {
  res.render('pencalonan/home', {
    title: 'Sistem Laporan Pencalonan DKBPP',
    jumlah: db.count(),
    jumlahDiperaku: db.count('diperaku'),
    jumlahBelum: db.count('belum_diperaku'),
    struktur: db.kategoriStructure(),
    mesej: req.query.mesej || '',
    ralat: req.query.ralat || '',
  });
});

// Muat naik dokumen -> jana laporan
router.post('/muat-naik', upload.array('dokumen', 20), async (req, res) => {
  const fs = require('fs');
  const files = req.files || [];
  if (files.length === 0) {
    return res.redirect('/pencalonan?ralat=' + encodeURIComponent('Sila pilih sekurang-kurangnya satu fail PDF.'));
  }
  try {
    const buffers = files.map((f) => fs.readFileSync(f.path));
    const all = await processDocuments(buffers);
    files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });
    res.redirect('/pencalonan?mesej=' + encodeURIComponent(all.length + ' calon berjaya dijana daripada ' + files.length + ' dokumen.'));
  } catch (err) {
    console.error('Ralat memproses dokumen:', err);
    files.forEach((f) => { try { fs.unlinkSync(f.path); } catch (_) {} });
    res.redirect('/pencalonan?ralat=' + encodeURIComponent('Gagal memproses dokumen. Pastikan ia PDF laporan DKBPP yang sah.'));
  }
});

// Laporan penuh: calon disusun ikut kategori -> kementerian
router.get('/senarai', (req, res) => {
  const filters = { ...filtersFromQuery(req), status: 'belum_diperaku' };
  const groups = db.groupByKategori(db.list(filters));
  res.render('pencalonan/senarai', {
    title: 'Senarai Pencalonan - Sistem Laporan DKBPP',
    groups,
    filters,
    jumlah: db.list(filters).length,
    struktur: db.kategoriStructure('belum_diperaku'),
    aktifKategori: filters.kategori,
    aktifKementerian: filters.kementerian,
    baseUrl: '/pencalonan/senarai',
    ...filterLists(),
  });
});

// Senarai diperaku
router.get('/diperaku', (req, res) => {
  const filters = { ...filtersFromQuery(req), status: 'diperaku' };
  const groups = db.groupByKategori(db.list(filters));
  res.render('pencalonan/diperaku', {
    title: 'Senarai Diperaku - Sistem Laporan DKBPP',
    groups,
    filters,
    jumlah: db.list(filters).length,
    struktur: db.kategoriStructure('diperaku'),
    aktifKategori: filters.kategori,
    aktifKementerian: filters.kementerian,
    baseUrl: '/pencalonan/diperaku',
    ...filterLists(),
  });
});

// Statistik
router.get('/statistik', (req, res) => {
  res.render('pencalonan/statistik', {
    title: 'Statistik Pencalonan - Sistem Laporan DKBPP',
    stat: db.statistik(),
  });
});

// Butiran satu calon
router.get('/:id', (req, res) => {
  const record = db.get(req.params.id);
  if (!record) return res.status(404).send('Calon tidak dijumpai.');
  res.render('pencalonan/detail', {
    title: record.nama + ' - Sistem Laporan DKBPP',
    record,
    BANGSA,
  });
});

router.post('/:id/maklumat', (req, res) => {
  const record = db.updateMaklumatTambahan(req.params.id, req.body);
  if (!record) return res.status(404).send('Calon tidak dijumpai.');
  res.redirect('/pencalonan/' + req.params.id);
});

router.post('/:id/peraku', (req, res) => {
  const record = db.peraku(req.params.id, req.body.diperakuOleh);
  if (!record) return res.status(404).send('Calon tidak dijumpai.');
  res.redirect(req.body.kembali || '/pencalonan/senarai');
});

router.post('/:id/batal-peraku', (req, res) => {
  const record = db.batalPeraku(req.params.id);
  if (!record) return res.status(404).send('Calon tidak dijumpai.');
  res.redirect(req.body.kembali || '/pencalonan/diperaku');
});

module.exports = router;

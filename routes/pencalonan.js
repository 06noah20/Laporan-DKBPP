const express = require('express');
const router = express.Router();
const db = require('../lib/pencalonanDb');
const { BANGSA } = require('../lib/constants');

function filtersFromQuery(req) {
  return {
    kementerian: req.query.kementerian || '',
    kategoriPencalonan: req.query.kategoriPencalonan || '',
    anugerah: req.query.anugerah || '',
    skim: req.query.skim || '',
    q: req.query.q || '',
  };
}

function filterLists() {
  return {
    kementerianList: db.distinctValues('kementerian'),
    kategoriList: db.distinctValues('kategoriPencalonan'),
    anugerahList: db.distinctValues('anugerah'),
    skimList: db.distinctValues('skim'),
  };
}

// Senarai calon disusun ikut kementerian
router.get('/', (req, res) => {
  const filters = { ...filtersFromQuery(req), status: 'belum_diperaku' };
  const records = db.list(filters);
  const groups = db.groupByKementerian(records);
  res.render('pencalonan/index', {
    title: 'Senarai Pencalonan - Sistem Laporan DKBPP',
    groups,
    filters,
    jumlah: records.length,
    kementerianCounts: db.kementerianCounts('belum_diperaku'),
    aktifKementerian: filters.kementerian,
    baseUrl: '/pencalonan',
    ...filterLists(),
  });
});

// Senarai calon yang telah diperaku, disusun ikut kementerian
router.get('/diperaku', (req, res) => {
  const filters = { ...filtersFromQuery(req), status: 'diperaku' };
  const records = db.list(filters);
  const groups = db.groupByKementerian(records);
  res.render('pencalonan/diperaku', {
    title: 'Senarai Diperaku - Sistem Laporan DKBPP',
    groups,
    filters,
    jumlah: records.length,
    kementerianCounts: db.kementerianCounts('diperaku'),
    aktifKementerian: filters.kementerian,
    baseUrl: '/pencalonan/diperaku',
    ...filterLists(),
  });
});

// Statistik
router.get('/statistik', (req, res) => {
  const stat = db.statistik();
  res.render('pencalonan/statistik', {
    title: 'Statistik Pencalonan - Sistem Laporan DKBPP',
    stat,
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

// Kemaskini maklumat tambahan (bangsa/skim)
router.post('/:id/maklumat', (req, res) => {
  const record = db.updateMaklumatTambahan(req.params.id, req.body);
  if (!record) return res.status(404).send('Calon tidak dijumpai.');
  res.redirect('/pencalonan/' + req.params.id);
});

// PERAKU calon
router.post('/:id/peraku', (req, res) => {
  const record = db.peraku(req.params.id, req.body.diperakuOleh);
  if (!record) return res.status(404).send('Calon tidak dijumpai.');
  res.redirect('/pencalonan/diperaku');
});

// Batal peraku
router.post('/:id/batal-peraku', (req, res) => {
  const record = db.batalPeraku(req.params.id);
  if (!record) return res.status(404).send('Calon tidak dijumpai.');
  res.redirect('/pencalonan/' + req.params.id);
});

module.exports = router;

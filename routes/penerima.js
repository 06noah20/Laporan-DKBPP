const express = require('express');
const router = express.Router();
const db = require('../lib/db');
const { JENIS_ANUGERAH } = require('../lib/constants');

function validate(body) {
  const errors = [];
  if (!body.nama || !body.nama.trim()) errors.push('Nama wajib diisi.');
  if (!body.noKp || !body.noKp.trim()) errors.push('No. Kad Pengenalan wajib diisi.');
  if (!JENIS_ANUGERAH.includes(body.jenisAnugerah)) errors.push('Jenis anugerah tidak sah.');
  if (!body.gelaran || !body.gelaran.trim()) errors.push('Gelaran/pangkat anugerah wajib diisi.');
  if (!body.tahun || isNaN(Number(body.tahun))) errors.push('Tahun anugerah wajib diisi dengan nombor.');
  if (!body.negeriInstitusi || !body.negeriInstitusi.trim())
    errors.push('Negeri/institusi pencalon wajib diisi.');
  return errors;
}

// Senarai + carian/tapis
router.get('/', (req, res) => {
  const filters = {
    jenisAnugerah: req.query.jenisAnugerah || '',
    tahun: req.query.tahun || '',
    negeriInstitusi: req.query.negeriInstitusi || '',
    q: req.query.q || '',
  };
  const records = db.list(filters);
  const tahunList = db.distinctValues('tahun');
  const negeriList = db.distinctValues('negeriInstitusi');
  res.render('index', {
    records,
    filters,
    JENIS_ANUGERAH,
    tahunList,
    negeriList,
  });
});

// Borang tambah
router.get('/tambah', (req, res) => {
  res.render('form', { record: null, errors: [], JENIS_ANUGERAH });
});

router.post('/tambah', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) {
    return res.render('form', { record: req.body, errors, JENIS_ANUGERAH });
  }
  db.create(req.body);
  res.redirect('/');
});

// Borang edit
router.get('/:id/edit', (req, res) => {
  const record = db.get(req.params.id);
  if (!record) return res.status(404).send('Rekod tidak dijumpai.');
  res.render('form', { record, errors: [], JENIS_ANUGERAH });
});

router.post('/:id/edit', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) {
    return res.render('form', {
      record: { ...req.body, id: req.params.id },
      errors,
      JENIS_ANUGERAH,
    });
  }
  const updated = db.update(req.params.id, req.body);
  if (!updated) return res.status(404).send('Rekod tidak dijumpai.');
  res.redirect('/');
});

// Padam
router.post('/:id/padam', (req, res) => {
  db.remove(req.params.id);
  res.redirect('/');
});

// Butiran satu rekod
router.get('/:id', (req, res) => {
  const record = db.get(req.params.id);
  if (!record) return res.status(404).send('Rekod tidak dijumpai.');
  res.render('detail', { record });
});

module.exports = router;

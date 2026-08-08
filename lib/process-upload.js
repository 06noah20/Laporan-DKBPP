// Proses satu atau lebih dokumen PDF laporan pencalonan menjadi dataset penuh
// (rekod calon + gambar), kemudian simpan ke data/pencalonan.json + public/gambar.

const fs = require('fs');
const path = require('path');
const { extractPdfBuffer } = require('./extract-pdf');

const DATA_FILE = path.join(__dirname, '..', 'data', 'pencalonan.json');
const GAMBAR_DIR = path.join(__dirname, '..', 'public', 'gambar');

function deriveSkim(g) {
  g = (g || '').trim();
  if (!g) return 'Swasta / Bukan Kumpulan Perkhidmatan Awam';
  const m = g.match(/^([A-Za-z]+)/);
  const prefix = (m ? m[1] : g).toUpperCase();
  const map = {
    N: 'Skim N (Tadbir & Diplomatik/Pentadbiran)', J: 'Skim J (Kejuruteraan)',
    L: 'Skim L (Undang-undang)', M: 'Skim M (Perkhidmatan Pengurusan)',
    W: 'Skim W (Kewangan)', G: 'Skim G (Sains)', H: 'Skim H (Kesihatan)',
    U: 'Skim U (Pendidikan)', VU: 'Skim VU (Pengurusan Tertinggi)', F: 'Skim F (Pertanian)',
    S: 'Skim S (Sains Sosial)', D: 'Skim D (Pendidikan/Latihan)', T: 'Skim T (Teknikal)',
    E: 'Skim E (Ekonomi)', C: 'Skim C (Perakaunan)', KP: 'Skim KP (Kastam)',
    A: 'Skim A (Am/Pentadbiran Am)', B: 'Skim B (Am Rendah)', R: 'Skim R (Am Rendah)',
    Q: 'Skim Q (Penyelidikan)', WA: 'Skim WA (Kewangan)', LL: 'Skim LL',
  };
  return map[prefix] || ('Skim ' + prefix);
}

// buffers: array of PDF Buffer. Menggantikan keseluruhan dataset & gambar.
async function processDocuments(buffers) {
  fs.rmSync(GAMBAR_DIR, { recursive: true, force: true });
  fs.mkdirSync(GAMBAR_DIR, { recursive: true });

  let all = [];
  let start = 1;
  for (const buf of buffers) {
    const recs = await extractPdfBuffer(buf, { gambarDir: GAMBAR_DIR, startId: start });
    start += recs.length;
    all = all.concat(recs);
  }

  const now = new Date().toISOString();
  all = all.map((r) => ({
    ...r,
    skim: deriveSkim(r.gredGaji),
    bangsa: '',
    status: 'belum_diperaku',
    diperakuOleh: '',
    tarikhPeraku: '',
    createdAt: now,
    updatedAt: now,
  }));

  fs.writeFileSync(DATA_FILE, JSON.stringify(all, null, 2));
  return all;
}

module.exports = { processDocuments, deriveSkim };

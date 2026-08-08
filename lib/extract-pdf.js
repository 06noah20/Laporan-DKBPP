// Ekstrak dokumen laporan pencalonan DKBPP (PDF) kepada rekod calon + gambar,
// menggunakan Node tulen (pdfjs-dist + jpeg-js) — tiada Python/poppler diperlukan.

const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

// Sempadan lajur (dalam titik/points) mengikut templat rasmi laporan DKBPP.
const COL = {
  bil: [0, 55],
  kod: [55, 91],
  gambar: [91, 170],
  nama: [170, 290],
  umur: [290, 332],
  jawatan: [332, 458],
  gred: [458, 498],
  lantikan1: [498, 563],
  lantikan2: [563, 628],
  anugerah: [628, 1000],
};

function inCol(x, c) { return x >= COL[c][0] && x < COL[c][1]; }

// Petakan teks subkategori mentah kepada 6 kategori rasmi.
function mapKategori(raw) {
  const s = (raw || '').toUpperCase();
  if (/POLIS|PDRM/.test(s)) return 'Perkhidmatan Polis DiRaja Malaysia (PDRM)';
  if (/TENTERA|\bATM\b|ANGKATAN/.test(s)) return 'Perkhidmatan Angkatan Tentera Malaysia (ATM)';
  if (/ASING|KEHORMAT|WARGANEGARA/.test(s)) return 'Warganegara Asing (Kehormat)';
  if (/SWASTA|PERSATUAN|SUKARELA|SUKAN/.test(s)) return 'Swasta/Persatuan/Sukan';
  if (/BADAN BERKANUN|BERKUASA TEMPATAN|\bPBT\b/.test(s)) return 'Badan Berkanun/PBT';
  if (/PERKHIDMATAN AWAM/.test(s)) return 'Perkhidmatan Awam';
  return raw || 'Lain-lain';
}

function mul(m1, m2) {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

function getImage(page, name) {
  return new Promise((resolve) => {
    try { page.objs.get(name, (img) => resolve(img)); }
    catch (_) { resolve(null); }
  });
}

function encodeJpeg(img) {
  const { width, height, kind, data } = img;
  const rgba = Buffer.alloc(width * height * 4);
  if (kind === 3) { // RGBA
    data.copy ? data.copy(rgba) : rgba.set(data);
  } else if (kind === 2) { // RGB
    for (let i = 0, j = 0; i < width * height; i++) {
      rgba[j++] = data[i * 3]; rgba[j++] = data[i * 3 + 1];
      rgba[j++] = data[i * 3 + 2]; rgba[j++] = 255;
    }
  } else if (kind === 1) { // grayscale 1bpp — jarang untuk gambar; abaikan
    return null;
  } else { return null; }
  return jpeg.encode({ data: rgba, width, height }, 82).data;
}

async function extractPdfBuffer(buffer, opts) {
  const gambarDir = opts.gambarDir;
  let idc = opts.startId || 1;
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const OPS = pdfjs.OPS;
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(buffer), disableWorker: true });
  const doc = await loadingTask.promise;

  const records = [];
  let curAnugerah = null, curKategoriRaw = null, curKementerian = null;

  for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
    const page = await doc.getPage(pageNo);
    const tc = await page.getTextContent();
    const items = tc.items
      .filter((it) => it.str && it.str.trim() !== '')
      .map((it) => ({ x: it.transform[4], y: it.transform[5], str: it.str.trim() }))
      .filter((it) => !/^\d+\s*\/\s*\d+$/.test(it.str)); // buang nombor halaman "1 / 52"

    // Baris tajuk (BIL row)
    const bilHeader = items.find((it) => it.str === 'BIL');
    if (!bilHeader) continue;
    const headerY = bilHeader.y;

    // Header konteks: baris di atas headerY, ikut y menurun
    const above = items.filter((it) => it.y > headerY + 2)
      .sort((a, b) => b.y - a.y);
    // kumpulkan ikut baris (toleransi y)
    const headLines = [];
    above.forEach((it) => {
      const last = headLines[headLines.length - 1];
      if (last && Math.abs(last.y - it.y) < 4) last.parts.push(it);
      else headLines.push({ y: it.y, parts: [it] });
    });
    const lineText = (l) => l.parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(' ').trim();
    if (headLines[0]) curAnugerah = lineText(headLines[0]);
    if (headLines[1]) curKategoriRaw = lineText(headLines[1]);
    if (headLines[2]) curKementerian = headLines.slice(2).map(lineText).join(' ');

    // Calon: item nombor dalam lajur BIL, di bawah headerY
    const bilCells = items
      .filter((it) => it.y < headerY - 2 && inCol(it.x, 'bil') && /^\d+$/.test(it.str))
      .sort((a, b) => b.y - a.y);
    if (bilCells.length === 0) continue;

    // Kedudukan gambar (operator list + jejak CTM)
    const ops = await page.getOperatorList();
    let ctm = [1, 0, 0, 1, 0, 0];
    const stack = [];
    const pageImages = [];
    for (let i = 0; i < ops.fnArray.length; i++) {
      const fn = ops.fnArray[i], a = ops.argsArray[i];
      if (fn === OPS.save) stack.push(ctm.slice());
      else if (fn === OPS.restore) ctm = stack.pop() || ctm;
      else if (fn === OPS.transform) ctm = mul(ctm, a);
      else if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject) {
        const ix = ctm[4], iy = ctm[5], iw = ctm[0], ih = Math.abs(ctm[3]);
        const cx = ix + iw / 2;
        if (cx >= COL.gambar[0] && cx <= COL.gambar[1] && ih >= 40 && iw >= 40) {
          pageImages.push({ name: a[0], yCenter: iy + ih / 2 });
        }
      }
    }

    for (let r = 0; r < bilCells.length; r++) {
      const topY = bilCells[r].y + 8;
      const botY = (r + 1 < bilCells.length) ? bilCells[r + 1].y + 8 : -Infinity;
      const inBand = (it) => it.y < topY && it.y >= botY;

      const cellText = (col, joiner) => items
        .filter((it) => inBand(it) && inCol(it.x, col))
        .sort((a, b) => (b.y - a.y) || (a.x - b.x))
        .map((it) => it.str).join(joiner).trim();

      const kod = cellText('kod', ' ');
      const umur = cellText('umur', ' ').replace(/[^\d]/g, '');
      const jawatan = cellText('jawatan', ' ');
      const gred = cellText('gred', ' ');
      const lp = cellText('lantikan1', ' ');
      const ls = cellText('lantikan2', ' ');
      const anugerahDiterima = items
        .filter((it) => inBand(it) && inCol(it.x, 'anugerah'))
        .sort((a, b) => (b.y - a.y) || (a.x - b.x))
        .map((it) => it.str).join('\n').trim();

      // blok nama
      const nameLines = [];
      const grouped = [];
      items.filter((it) => inBand(it) && inCol(it.x, 'nama'))
        .sort((a, b) => b.y - a.y)
        .forEach((it) => {
          const last = grouped[grouped.length - 1];
          if (last && Math.abs(last.y - it.y) < 4) last.parts.push(it);
          else grouped.push({ y: it.y, parts: [it] });
        });
      grouped.forEach((g) => nameLines.push(g.parts.sort((a, b) => a.x - b.x).map((p) => p.str).join(' ')));
      let noKp = '', refA = '';
      const namaParts = [];
      nameLines.forEach((x) => {
        if (/^\d{6}-\d{2}-\d{4}$/.test(x)) noKp = x;
        else if (/^A\d+$/.test(x)) refA = x;
        else namaParts.push(x);
      });
      const nama = namaParts.join(' ');
      if (!nama) continue;

      const id = idc++;

      // padan gambar ikut kedudukan y
      let gambar = '';
      const bandTop = bilCells[r].y + 8, bandBot = botY;
      const match = pageImages.find((im) => im.yCenter <= bandTop && im.yCenter >= bandBot);
      if (match && gambarDir) {
        const img = await getImage(page, match.name);
        if (img && img.data) {
          const jpg = encodeJpeg(img);
          if (jpg) {
            fs.writeFileSync(path.join(gambarDir, id + '.jpg'), jpg);
            gambar = '/gambar/' + id + '.jpg';
          }
        }
      }

      records.push({
        id,
        anugerah: curAnugerah,
        kategori: mapKategori(curKategoriRaw),
        kategoriRaw: curKategoriRaw,
        kementerian: curKementerian || '(Tiada Kementerian)',
        bil: bilCells[r].str,
        kod, nama, noKadPengenalan: noKp, noRujukanA: refA,
        umur: umur ? Number(umur) : null,
        jawatan, gredGaji: gred,
        tempohLantikanPertama: lp, tempohLantikanSekarang: ls,
        anugerahDiterima,
        gambar,
        halamanSumber: pageNo,
      });
    }
  }
  try { await loadingTask.destroy(); } catch (_) {}
  return records;
}

module.exports = { extractPdfBuffer, mapKategori };

// Menyusun teks "Anugerah Yang Diterima" (mentah dari PDF) kepada entri kemas.
// Masalah sumber: PDF memecahkan ayat di tengah baris, jadi kita cantumkan
// baris sambungan dan asingkan label tahun supaya boleh dijajarkan ke kiri.

function isNewEntry(l) {
  return (
    /^\d{4}(\s*[-–]\s*\d{4})?\s*:/.test(l) || // 2020:  atau 2023-2025:
    /^\d{4}\s*&\s*\d{4}\s*:/.test(l) ||        // 2002 & 2011 :
    /^APC\b/i.test(l) ||
    /^CALON\b/i.test(l) ||
    /^BERSARA\b/i.test(l) ||
    /^[A-Z][A-Z.()A-Za-z]*\s*[-–]\s*\d{4}/.test(l) // A.M.N. - 2015 / B.C.K.(Kedah) - 2010
  );
}

function splitEntry(text) {
  var m = text.match(/^(\d{4}(?:\s*[-–]\s*\d{4})?|\d{4}\s*&\s*\d{4})\s*:\s*([\s\S]*)$/);
  if (m) return { tahun: m[1].replace(/\s+/g, ''), teks: m[2].trim() };
  return { tahun: '', teks: text.trim() };
}

function parseAnugerah(raw) {
  if (!raw) return { anugerah: [], nota: [] };
  var lines = String(raw)
    .split('\n')
    .map(function (s) { return s.trim(); })
    .filter(Boolean);

  var anugerah = [];
  var nota = [];
  var target = anugerah;
  var cur = null;

  lines.forEach(function (l) {
    if (/^Nota:?$/i.test(l)) { target = nota; cur = null; return; }
    if (l === 'Tiada') { target.push({ tahun: '', teks: 'Tiada' }); cur = null; return; }
    if (isNewEntry(l)) { cur = { raw: l }; target.push(cur); }
    else if (cur) { cur.raw += ' ' + l; }
    else { cur = { raw: l }; target.push(cur); }
  });

  var finalize = function (arr) {
    return arr.map(function (e) {
      return e.teks !== undefined ? e : splitEntry(e.raw);
    });
  };

  return { anugerah: finalize(anugerah), nota: finalize(nota) };
}

module.exports = { parseAnugerah };

const express = require('express');
const path = require('path');

const penerimaRoutes = require('./routes/penerima');
const laporanRoutes = require('./routes/laporan');
const pencalonanRoutes = require('./routes/pencalonan');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Helper dikongsi ke semua templat
app.locals.parseAnugerah = require('./lib/notes').parseAnugerah;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/laporan', laporanRoutes);
app.use('/pencalonan', pencalonanRoutes);
app.use('/', penerimaRoutes);

app.use((req, res) => {
  res.status(404).send('Halaman tidak dijumpai.');
});

app.listen(PORT, () => {
  console.log(`Sistem Laporan DKBPP berjalan di http://localhost:${PORT}`);
});

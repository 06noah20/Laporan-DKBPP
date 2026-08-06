const express = require('express');
const path = require('path');

const penerimaRoutes = require('./routes/penerima');
const laporanRoutes = require('./routes/laporan');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/laporan', laporanRoutes);
app.use('/', penerimaRoutes);

app.use((req, res) => {
  res.status(404).send('Halaman tidak dijumpai.');
});

app.listen(PORT, () => {
  console.log(`Sistem Laporan DKBPP berjalan di http://localhost:${PORT}`);
});

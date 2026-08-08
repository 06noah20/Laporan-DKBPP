@echo off
chcp 65001 >nul
title Sistem Laporan DKBPP
cd /d "%~dp0"

echo ============================================
echo    SISTEM LAPORAN DKBPP
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js belum dipasang pada komputer ini.
  echo.
  echo     Sila pasang Node.js dahulu ^(versi LTS^):
  echo     https://nodejs.org
  echo.
  echo     Selepas pasang, jalankan semula fail ini.
  echo.
  pause
  exit /b
)

if not exist node_modules (
  echo [*] Pemasangan kali pertama - memuat turun keperluan...
  echo     ^(Perlu internet. Tunggu 1-2 minit.^)
  echo.
  call npm install
  echo.
)

echo [*] Sistem sedang dimulakan...
echo.
echo     Buka pelayar ke:  http://localhost:3000/pencalonan
echo.
echo     ^>^>^> BIARKAN tetingkap ini TERBUKA semasa guna sistem. ^<^<^<
echo     ^>^>^> Untuk tutup sistem: tutup tetingkap ini.        ^<^<^<
echo.

start "" http://localhost:3000/pencalonan
node server.js

pause

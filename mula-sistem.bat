@echo off
chcp 65001 >nul
title Sistem Laporan Pencalonan DKBPP
cd /d "%~dp0"

echo ============================================
echo    SISTEM LAPORAN PENCALONAN DKBPP
echo ============================================
echo.

rem --- Kemas kini automatik dari GitHub (kekalkan data anda) ---
where powershell >nul 2>nul
if not errorlevel 1 (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kemaskini.ps1"
) else (
  echo ^(Langkau kemas kini automatik - PowerShell tidak dijumpai^)
)
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [!] Node.js belum dipasang pada komputer ini.
  echo     Sila pasang Node.js ^(versi LTS^): https://nodejs.org
  echo     Selepas pasang, jalankan semula fail ini.
  echo.
  pause
  exit /b
)

echo [*] Menyediakan keperluan sistem...
call npm install

echo.
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

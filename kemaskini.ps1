# Kemas kini automatik: muat turun kod terkini dari GitHub, kekalkan data & gambar pengguna.
$ErrorActionPreference = 'Stop'
try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 } catch {}
$root = $PSScriptRoot

try {
  Write-Host 'Menyemak kemas kini terkini...'
  $url = 'https://github.com/06noah20/Laporan-DKBPP/archive/refs/heads/claude/dkbpp-nomination-reporting-system-1oalr0.zip'
  $tmp = Join-Path $env:TEMP ('dkbpp_' + [System.Guid]::NewGuid().ToString('N'))
  New-Item -ItemType Directory -Path $tmp | Out-Null
  $zip = Join-Path $tmp 'src.zip'
  Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing
  Expand-Archive -Path $zip -DestinationPath $tmp -Force
  $src = (Get-ChildItem -Path $tmp -Directory | Select-Object -First 1).FullName

  # Seed data + gambar HANYA kali pertama (jika belum ada).
  $destData = Join-Path $root 'data\pencalonan.json'
  if (-not (Test-Path $destData)) {
    New-Item -ItemType Directory -Force -Path (Join-Path $root 'data') | Out-Null
    Copy-Item (Join-Path $src 'data\pencalonan.json') $destData -Force -ErrorAction SilentlyContinue
    Copy-Item (Join-Path $src 'public\gambar') (Join-Path $root 'public') -Recurse -Force -ErrorAction SilentlyContinue
  }

  # Salin kod terkini — KEKALKAN data pengguna (data\, public\gambar\, node_modules\).
  $xd1 = Join-Path $src 'data'
  $xd2 = Join-Path $src 'public\gambar'
  $xd3 = Join-Path $src 'node_modules'
  robocopy $src $root /E /XD $xd1 $xd2 $xd3 /R:1 /W:1 /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null

  Remove-Item $tmp -Recurse -Force -ErrorAction SilentlyContinue
  Write-Host 'Kemas kini selesai.'
} catch {
  Write-Host ('Tiada internet / gagal kemas kini — teruskan dengan versi sedia ada.')
}
exit 0

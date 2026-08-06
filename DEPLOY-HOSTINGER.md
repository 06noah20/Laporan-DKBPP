# Panduan Deploy ke Hostinger (subdomain `dkbpp.pkskmy.com`)

Sistem ini aplikasi **Node.js (Express)**. Portal utama `www.pkskmy.com` anda **tidak
terganggu** — sistem ini diletak pada subdomain berasingan di bawah domain yang sama.

Kelebihan Hostinger: cakera **kekal**, jadi fail data `data/pencalonan.json` (peraku,
bangsa, dsb.) **tersimpan berterusan** — tak perlu pangkalan data.

---

## LANGKAH 0 — Semak sama ada pelan anda menyokong Node.js

1. Log masuk **hPanel** Hostinger.
2. Pada bar carian hPanel, taip **"Node.js"**.
   - **Ada "Node.js" / "Setup Node.js App"** → ikut **Cara A** di bawah. (Pelan Business,
     Cloud, atau VPS biasanya ada.)
   - **Tiada** (pelan Single/Premium asas) → Node.js tak boleh jalan terus di Hostinger.
     Ikut **Cara B** (hos di Render percuma + tuding subdomain). Data tetap milik anda.

---

## CARA A — Node.js terus di Hostinger (disyorkan)

### 1. Cipta subdomain
hPanel → **Domains → Subdomains** → cipta **`dkbpp`** untuk `pkskmy.com`.
Catat folder yang dibuat, cth: `domains/dkbpp.pkskmy.com/public_html`.

### 2. Dapatkan kod ke folder itu
**Pilihan mudah — Git:**
hPanel → **Advanced → GIT** → sambung repo
`https://github.com/06noah20/Laporan-DKBPP` (branch: `claude/rebuild-star-rating-system-w77us4`),
deploy ke folder subdomain tadi.

*(Atau muat turun repo sebagai ZIP dan naik melalui File Manager.)*

### 3. Sediakan aplikasi Node.js
hPanel → **Node.js → Setup Node.js App** (atau "Create Application"):
- **Node version:** 18 atau lebih tinggi
- **Application root:** folder subdomain (cth `domains/dkbpp.pkskmy.com/public_html`)
- **Application URL:** `dkbpp.pkskmy.com`
- **Application startup file:** `server.js`

### 4. Pasang pakej & mula
- Klik **Run NPM Install** (atau buka terminal: `npm install`).
- Klik **Start / Restart** aplikasi.

Buka **https://dkbpp.pkskmy.com/pencalonan** — siap. Data akan kekal.

### ⚠️ Nota penting selepas go-live
Jika anda deploy semula melalui Git, fail `data/pencalonan.json` dalam repo akan
**menimpa** data langsung di pelayan. Selepas mula guna sebenar, elakkan pull/deploy
yang menimpa fail itu — atau beritahu saya, saya boleh alih storan data ke luar folder
repo supaya deploy tak sentuh data anda.

---

## CARA B — Hos di Render (percuma) + tuding subdomain Hostinger

Guna ini jika pelan Hostinger anda tiada Node.js.

1. Daftar di https://render.com (percuma) → **New → Web Service** → sambung repo GitHub
   `06noah20/Laporan-DKBPP`.
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
2. Render beri URL cth `laporan-dkbpp.onrender.com`. Uji ia berjalan.
3. Di Render → **Settings → Custom Domain** → tambah `dkbpp.pkskmy.com`. Render beri satu
   nilai **CNAME**.
4. Di hPanel Hostinger → **Domains → DNS Zone** → tambah rekod:
   - **Type:** CNAME · **Name:** `dkbpp` · **Target:** (nilai dari Render)
5. Tunggu DNS merebak (~10–30 min). Buka **https://dkbpp.pkskmy.com/pencalonan**.

⚠️ Pelan **percuma** Render mengeset semula cakera bila app restart — untuk simpanan
kekal, beritahu saya, saya naik taraf storan ke pangkalan data percuma (Postgres Render).

---

## Perlukan bantuan?
Beritahu saya keputusan **Langkah 0** (ada Node.js atau tidak) — saya akan pandu anda
langkah demi langkah, dan sediakan sebarang perubahan kod yang perlu.

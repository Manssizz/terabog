# Terabox Web UI - Downloader & Streamer

Web UI modern untuk streaming dan download file dari Terabox menggunakan API v18.js.

## Fitur

- ✅ Interface web yang modern dan responsif
- ✅ Streaming video langsung di browser
- ✅ Download file dengan mudah
- ✅ Support berbagai format file (video, audio, dokumen, dll)
- ✅ Menampilkan informasi file (nama, ukuran)
- ✅ Auto-detect format video untuk streaming

## Instalasi

1. Install dependencies:
```bash
npm install
```

## Cara Menggunakan

1. Jalankan server:
```bash
npm start
```

2. Buka browser dan akses:
```
http://localhost:3000
```

3. Masukkan URL Terabox (contoh: `https://www.terabox.com/s/...`)

4. Klik "Cari File" untuk mendapatkan daftar file

5. Pilih:
   - **Stream** - untuk streaming video langsung di browser
   - **Download** - untuk mengunduh file

## API Endpoints

### POST `/api/download`
Mendapatkan informasi file dari URL Terabox.

**Request:**
```json
{
  "url": "https://www.terabox.com/s/..."
}
```

**Response:**
```json
{
  "success": true,
  "list": [
    {
      "name": "filename.mp4",
      "size": 12345678,
      "url": "https://..."
    }
  ]
}
```

### GET `/api/stream?url=...`
Streaming file video.

### GET `/api/download-file?url=...&filename=...`
Download file.

## Port

Default port: `3000`

Untuk mengubah port, set environment variable:
```bash
PORT=8080 npm start
```

## Teknologi

- Node.js + Express
- v18.js API untuk Terabox
- Vanilla JavaScript (no framework)
- Modern CSS dengan gradient design

# terabog

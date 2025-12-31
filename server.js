import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import TeraDownloader from './v18.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, 'public')));

// API endpoint untuk mendapatkan info file
app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Parameter URL diperlukan'
      });
    }

    const api = new TeraDownloader();
    const data = await api.download({ url });
    
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat memproses URL'
    });
  }
});

// API endpoint untuk streaming file
app.get('/api/stream', async (req, res) => {
  try {
    const { url: fileUrl } = req.query;
    
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'Parameter URL diperlukan'
      });
    }

    // Set headers untuk streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'no-cache');
    
    // Proxy request ke file URL
    const axios = (await import('axios')).default;
    const response = await axios.get(fileUrl, {
      responseType: 'stream',
      headers: {
        'Referer': 'https://www.terabox.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    response.data.pipe(res);
  } catch (error) {
    console.error('Streaming error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat streaming'
    });
  }
});

// API endpoint untuk download file
app.get('/api/download-file', async (req, res) => {
  try {
    const { url: fileUrl, filename } = req.query;
    
    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'Parameter URL diperlukan'
      });
    }

    const axios = (await import('axios')).default;
    const response = await axios.get(fileUrl, {
      responseType: 'stream',
      headers: {
        'Referer': 'https://www.terabox.com/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    // Set headers untuk download
    res.setHeader('Content-Disposition', `attachment; filename="${filename || 'download'}"`);
    res.setHeader('Content-Type', response.headers['content-type'] || 'application/octet-stream');
    
    response.data.pipe(res);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Terjadi kesalahan saat download'
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});


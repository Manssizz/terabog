// Browser-compatible version of v18.js
// Using CDN libraries and browser APIs

class TeraDownloaderBrowser {
  constructor() {
    this.salt = "xR9$kL7#mN2@pQ5!vT8&wY4*";
  }

  log(m) {
    console.log(`[${new Date().toISOString()}] ${m}`);
  }

  async dkr(v) {
    try {
      const { ks, xd } = v;
      const part = ks?.split(".")?.[1] || "";
      if (!part) return null;
      
      // Browser-compatible base64 decode
      const decoded = atob(part);
      const time = parseInt(decoded, 10) ^ 32570;
      const keyStr = this.salt + time;
      
      // Use CryptoJS from CDN
      const h1 = CryptoJS.MD5(keyStr).toString().substring(0, 16);
      const h2 = CryptoJS.SHA1(keyStr).toString().substring(0, 16);
      const key = h1 + h2;
      
      const bytes = CryptoJS.AES.decrypt(xd, key);
      const decStr = bytes.toString(CryptoJS.enc.Utf8);
      return decStr ? JSON.parse(decStr) : null;
    } catch (e) {
      this.log("Gagal dekripsi: " + e.message);
      return null;
    }
  }

  async download({ url, ...rest }) {
    this.log(`Memulai proses: ${url}`);
    try {
      // Use CORS proxy to fetch from 1024teradownloader.com
      // Try multiple proxy options for reliability
      const targetUrl = `https://1024teradownloader.com/?url=${encodeURIComponent(url)}`;
      let html = '';
      let proxyError = null;
      
      // Try allorigins.win first
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
        const homeResponse = await fetch(proxyUrl);
        const homeData = await homeResponse.json();
        html = homeData.contents;
      } catch (e) {
        proxyError = e;
        // Try alternative proxy
        try {
          const proxyUrl2 = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
          const homeResponse2 = await fetch(proxyUrl2);
          html = await homeResponse2.text();
        } catch (e2) {
          throw new Error(`CORS proxy error: ${e.message}. Pastikan koneksi internet stabil.`);
        }
      }
      
      this.log("Mengekstrak variabel script...");
      
      // Extract variables from script
      const vars = {
        ks: html.match(/window\._kS='(.*?)'/)?.[1],
        xd: html.match(/window\._xD='(.*?)'/)?.[1],
        et: html.match(/window\._eT='(.*?)'/)?.[1],
        st: html.match(/window\._sT='(.*?)'/)?.[1]
      };
      
      const apiData = await this.dkr(vars) || {};
      const endpoint = apiData?.worker || "https://stream-api.iteraplay.workers.dev";
      const token = apiData?.token || "";
      const ts = apiData?.t || "";
      
      if (!token) throw new Error("Gagal mendapatkan API Token");
      
      this.log(`Memanggil API Worker: ${endpoint}`);
      
      const formData = new URLSearchParams();
      formData.append("url", url);
      
      const res = await fetch(`${endpoint}?token=${token}&t=${ts}`, {
        method: 'POST',
        headers: {
          "content-type": "application/x-www-form-urlencoded",
          origin: "https://1024teradownloader.com"
        },
        body: formData
      });
      
      const finalData = await res.json() || { status: "error" };
      
      if (finalData.status === "success") {
        this.log(`Berhasil: ${finalData?.list?.length || 0} file ditemukan`);
      } else {
        this.log(`API Respon: ${finalData?.message || "Gagal"}`);
      }
      
      return {
        success: finalData?.status === "success" ? true : false,
        ...finalData
      };
    } catch (err) {
      this.log(`Error: ${err.message}`);
      return {
        success: false,
        error: err.message
      };
    }
  }
}

// Make it available globally
window.TeraDownloaderBrowser = TeraDownloaderBrowser;


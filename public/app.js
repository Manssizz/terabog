// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing...');
    initializeApp();
});

function initializeApp() {
    const teraboxUrlInput = document.getElementById('teraboxUrl');
    const fetchBtn = document.getElementById('fetchBtn');
    const loading = document.getElementById('loading');
    const error = document.getElementById('error');
    const results = document.getElementById('results');
    const fileList = document.getElementById('fileList');

    if (!teraboxUrlInput || !fetchBtn) {
        console.error('Form elements not found!');
        return;
    }

    console.log('Form elements found, setting up event listeners...');
    
    // Make functions available globally
    window.teraboxUrlInput = teraboxUrlInput;
    window.fetchBtn = fetchBtn;
    window.loading = loading;
    window.error = error;
    window.results = results;
    window.fileList = fileList;
    
    // Set up event listeners
    setupEventListeners();
}

function setupEventListeners() {
    const teraboxUrlInput = window.teraboxUrlInput;
    const fetchBtn = window.fetchBtn;

    // Event listeners
    fetchBtn.addEventListener('click', fetchFiles);

    teraboxUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            fetchFiles();
        }
    });

    console.log('Event listeners set up successfully');
}

// Format file size
function formatFileSize(bytes) {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Get file icon based on extension
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'mp4': '🎬',
        'avi': '🎬',
        'mkv': '🎬',
        'mov': '🎬',
        'wmv': '🎬',
        'flv': '🎬',
        'mp3': '🎵',
        'wav': '🎵',
        'flac': '🎵',
        'aac': '🎵',
        'pdf': '📄',
        'doc': '📝',
        'docx': '📝',
        'xls': '📊',
        'xlsx': '📊',
        'ppt': '📊',
        'pptx': '📊',
        'zip': '📦',
        'rar': '📦',
        '7z': '📦',
        'jpg': '🖼️',
        'jpeg': '🖼️',
        'png': '🖼️',
        'gif': '🖼️',
        'txt': '📃',
        'exe': '⚙️',
        'apk': '📱'
    };
    return iconMap[ext] || '📄';
}

// Check if file is video
function isVideo(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    return ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'].includes(ext);
}

// Hide error message
function hideError() {
    const errorEl = window?.error || document.getElementById('error');
    if (errorEl) {
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }
}

// Show error message
function showError(message) {
    const errorEl = window?.error || document.getElementById('error');
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    } else {
        console.error('Error element not found:', message);
        alert(message);
    }
}

// Fetch files from Terabox URL
async function fetchFiles() {
    const input = window?.teraboxUrlInput || document.getElementById('teraboxUrl');
    const btn = window?.fetchBtn || document.getElementById('fetchBtn');
    const loadingEl = window?.loading || document.getElementById('loading');
    const errorEl = window?.error || document.getElementById('error');
    const resultsEl = window?.results || document.getElementById('results');
    const fileListEl = window?.fileList || document.getElementById('fileList');
    
    if (!input) {
        console.error('Input element not found!');
        return;
    }
    
    const url = input.value.trim();
    
    if (!url) {
        showError('Silakan masukkan URL Terabox');
        return;
    }

    // Validate URL
    if (!url.includes('terabox.com')) {
        showError('URL harus dari Terabox (terabox.com)');
        return;
    }

    // Reset UI
    if (errorEl) hideError();
    if (resultsEl) resultsEl.style.display = 'none';
    if (loadingEl) loadingEl.style.display = 'block';
    if (btn) {
        btn.disabled = true;
        const btnText = btn.querySelector('.btn-text');
        const btnLoader = btn.querySelector('.btn-loader');
        if (btnText) btnText.textContent = 'Memproses...';
        if (btnLoader) btnLoader.style.display = 'inline';
    }

    try {
        // Check if we're on GitHub Pages (no backend) or local server
        let data;
        
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Use backend API if available
            try {
                const response = await fetch('/api/download', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ url })
                });
                data = await response.json();
            } catch (e) {
                // Fallback to browser version
                const api = new window.TeraDownloaderBrowser();
                data = await api.download({ url });
            }
        } else {
            // Use browser-compatible version for GitHub Pages
            if (!window.TeraDownloaderBrowser) {
                throw new Error('TeraDownloaderBrowser tidak tersedia. Pastikan v18-browser.js dimuat.');
            }
            const api = new window.TeraDownloaderBrowser();
            data = await api.download({ url });
        }

        if (data.success && data.list && data.list.length > 0) {
            displayFiles(data.list);
        } else {
            showError(data.message || data.error || 'Gagal mendapatkan file. Pastikan URL valid.');
        }
    } catch (err) {
        console.error('Error:', err);
        showError('Terjadi kesalahan: ' + err.message);
    } finally {
        if (loadingEl) loadingEl.style.display = 'none';
        if (btn) {
            btn.disabled = false;
            const btnText = btn.querySelector('.btn-text');
            const btnLoader = btn.querySelector('.btn-loader');
            if (btnText) btnText.textContent = 'Cari File';
            if (btnLoader) btnLoader.style.display = 'none';
        }
    }
}

// Display files in the UI
function displayFiles(files) {
    const fileListEl = window?.fileList || document.getElementById('fileList');
    const resultsEl = window?.results || document.getElementById('results');
    
    if (!fileListEl) {
        console.error('File list element not found!');
        return;
    }
    
    fileListEl.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        const fileName = file.name || file.filename || `File ${index + 1}`;
        const fileSize = file.size || 0;
        const fileUrl = file.url || file.direct_link || file.link;
        
        if (!fileUrl) {
            console.warn('File tanpa URL:', file);
            return;
        }

        const isVideoFile = isVideo(fileName);
        
        fileItem.innerHTML = `
            <div class="file-header">
                <div class="file-icon">${getFileIcon(fileName)}</div>
                <div class="file-info">
                    <div class="file-name">${fileName}</div>
                    <div class="file-size">${formatFileSize(fileSize)}</div>
                </div>
            </div>
            <div class="file-actions">
                ${isVideoFile ? `
                    <button class="btn btn-success" onclick="streamFile('${fileUrl}', '${fileName.replace(/'/g, "\\'")}')">
                        ▶️ Stream
                    </button>
                ` : ''}
                <button class="btn btn-primary" onclick="downloadFile('${fileUrl}', '${fileName.replace(/'/g, "\\'")}')">
                    ⬇️ Download
                </button>
            </div>
            ${isVideoFile ? `
                <div id="player-${index}" class="video-player" style="display: none;">
                    <video controls>
                        <source src="${fileUrl}" type="video/mp4">
                        Browser Anda tidak mendukung video player.
                    </video>
                </div>
            ` : ''}
        `;
        
        fileListEl.appendChild(fileItem);
    });
    
    if (resultsEl) resultsEl.style.display = 'block';
}

// Stream video file
function streamFile(url, filename) {
    const fileListEl = window?.fileList || document.getElementById('fileList');
    const resultsEl = window?.results || document.getElementById('results');
    
    if (!fileListEl) return;
    
    // Find the player element for this file
    const fileItems = fileListEl.querySelectorAll('.file-item');
    let playerElement = null;
    
    fileItems.forEach((item, index) => {
        const player = item.querySelector(`#player-${index}`);
        if (player) {
            // Hide all players first
            player.style.display = 'none';
            const video = player.querySelector('video');
            if (video) {
                video.pause();
                video.src = '';
            }
            
            // Check if this is the file we want to stream
            const fileNameEl = item.querySelector('.file-name');
            if (fileNameEl && fileNameEl.textContent === filename) {
                playerElement = player;
            }
        }
    });
    
    // Use direct URL for streaming (works in browser)
    const videoUrl = url;
    
    if (playerElement) {
        const video = playerElement.querySelector('video');
        if (video) {
            video.src = videoUrl;
            playerElement.style.display = 'block';
            video.load();
            video.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    } else {
        // Create new player if not found
        const playerDiv = document.createElement('div');
        playerDiv.className = 'video-player';
        playerDiv.innerHTML = `
            <video controls autoplay>
                <source src="${videoUrl}" type="video/mp4">
                Browser Anda tidak mendukung video player.
            </video>
        `;
        
        // Insert after results
        if (resultsEl) {
            resultsEl.appendChild(playerDiv);
            playerDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }
}

// Download file
function downloadFile(url, filename) {
    // Use direct URL for download (works in browser)
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Make functions globally available for onclick handlers
window.streamFile = streamFile;
window.downloadFile = downloadFile;
window.fetchFiles = fetchFiles;


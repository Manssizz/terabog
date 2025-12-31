const teraboxUrlInput = document.getElementById('teraboxUrl');
const fetchBtn = document.getElementById('fetchBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const results = document.getElementById('results');
const fileList = document.getElementById('fileList');

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
    error.style.display = 'none';
    error.textContent = '';
}

// Show error message
function showError(message) {
    error.textContent = message;
    error.style.display = 'block';
}

// Fetch files from Terabox URL
async function fetchFiles() {
    const url = teraboxUrlInput.value.trim();
    
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
    hideError();
    results.style.display = 'none';
    loading.style.display = 'block';
    fetchBtn.disabled = true;
    fetchBtn.querySelector('.btn-text').textContent = 'Memproses...';
    fetchBtn.querySelector('.btn-loader').style.display = 'inline';

    try {
        const response = await fetch('/api/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.success && data.list && data.list.length > 0) {
            displayFiles(data.list);
        } else {
            showError(data.message || data.error || 'Gagal mendapatkan file. Pastikan URL valid.');
        }
    } catch (err) {
        console.error('Error:', err);
        showError('Terjadi kesalahan: ' + err.message);
    } finally {
        loading.style.display = 'none';
        fetchBtn.disabled = false;
        fetchBtn.querySelector('.btn-text').textContent = 'Cari File';
        fetchBtn.querySelector('.btn-loader').style.display = 'none';
    }
}

// Display files in the UI
function displayFiles(files) {
    fileList.innerHTML = '';
    
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
                        <source src="/api/stream?url=${encodeURIComponent(fileUrl)}" type="video/mp4">
                        Browser Anda tidak mendukung video player.
                    </video>
                </div>
            ` : ''}
        `;
        
        fileList.appendChild(fileItem);
    });
    
    results.style.display = 'block';
}

// Stream video file
function streamFile(url, filename) {
    // Find the player element for this file
    const fileItems = fileList.querySelectorAll('.file-item');
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
    
    if (playerElement) {
        const video = playerElement.querySelector('video');
        if (video) {
            video.src = `/api/stream?url=${encodeURIComponent(url)}`;
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
                <source src="/api/stream?url=${encodeURIComponent(url)}" type="video/mp4">
                Browser Anda tidak mendukung video player.
            </video>
        `;
        
        // Insert after results
        results.appendChild(playerDiv);
        playerDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Download file
function downloadFile(url, filename) {
    const downloadUrl = `/api/download-file?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// Event listeners
fetchBtn.addEventListener('click', fetchFiles);

teraboxUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchFiles();
    }
});

// Make functions globally available for onclick handlers
window.streamFile = streamFile;
window.downloadFile = downloadFile;


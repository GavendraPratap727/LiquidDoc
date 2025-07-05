// User dashboard JavaScript

class UserDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.files = FileManager.getAll();
    this.currentFilter = 'all';
    this.currentView = 'grid';
    this.init();
  }
  
  init() {
    // Check authentication
    Session.requireAuth();
    const user = Session.getUser();
    
    if (user.role === 'admin') {
      window.location.href = 'admin.html';
      return;
    }
    
    this.updateUserInfo(user);
    this.initEventListeners();
    this.initDragAndDrop();
    this.updateStats();
    this.populateRecentFiles();
    this.populateFiles();
  }
  
  updateUserInfo(user) {
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userEmail = document.getElementById('userEmail');
    
    if (userName) {
      userName.textContent = user.name || user.email.split('@')[0];
    }
    
    if (userAvatar) {
      userAvatar.textContent = (user.name || user.email).charAt(0).toUpperCase();
    }
    
    if (userEmail) {
      userEmail.value = user.email;
    }
  }
  
  initEventListeners() {
    // Navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const section = item.getAttribute('data-section');
        this.switchSection(section);
      });
    });
    
    // Global search
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
      globalSearch.addEventListener('input', Utils.debounce((e) => {
        this.handleGlobalSearch(e.target.value);
      }, 300));
    }
    
    // Public search
    const publicSearch = document.getElementById('publicSearch');
    if (publicSearch) {
      publicSearch.addEventListener('input', Utils.debounce((e) => {
        this.searchPublicFiles(e.target.value);
      }, 300));
    }
    
    // File input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        this.handleFileSelect(e);
      });
    }
    
    // Filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.setFilter(tab.getAttribute('data-filter'));
      });
    });
    
    // View controls
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.setView(btn.getAttribute('data-view'));
      });
    });
  }
  
  initDragAndDrop() {
    const uploadZone = document.getElementById('uploadZone');
    if (!uploadZone) return;
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, this.preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.add('dragover');
      }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, () => {
        uploadZone.classList.remove('dragover');
      }, false);
    });
    
    uploadZone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      this.handleFiles(files);
    }, false);
  }
  
  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  switchSection(sectionName) {
    // Update navigation
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Update content
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionName + 'Section').classList.add('active');
    
    // Update page title
    const titles = {
      dashboard: 'Dashboard',
      upload: 'Upload Files',
      files: 'My Files',
      search: 'Search Files',
      settings: 'Settings'
    };
    
    const subtitles = {
      dashboard: 'Welcome back to your workspace',
      upload: 'Upload and organize your files',
      files: 'Manage your document collection',
      search: 'Discover public files',
      settings: 'Customize your preferences'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionName];
    document.getElementById('pageSubtitle').textContent = subtitles[sectionName];
    
    this.currentSection = sectionName;
    
    // Refresh content if needed
    if (sectionName === 'files') {
      this.populateFiles();
    }
  }
  
  handleFileSelect(event) {
    const files = event.target.files;
    this.handleFiles(files);
  }
  
  handleFiles(files) {
    if (files.length === 0) return;
    
    Array.from(files).forEach(file => {
      this.uploadFile(file);
    });
  }
  
  async uploadFile(file) {
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const uploadPercent = document.getElementById('uploadPercent');
    const uploadFilesList = document.getElementById('uploadFilesList');
    
    // Show upload progress
    uploadProgress.classList.remove('hidden');
    
    // Add file to upload list
    const fileItem = document.createElement('div');
    fileItem.className = 'upload-file-item';
    fileItem.innerHTML = `
      <div class="upload-file-info">
        <div class="upload-file-icon">${Utils.getFileIcon(file.type)}</div>
        <div class="upload-file-details">
          <div class="upload-file-name">${file.name}</div>
          <div class="upload-file-size">${Utils.formatFileSize(file.size)}</div>
        </div>
      </div>
      <div class="upload-file-progress">
        <div class="upload-file-bar">
          <div class="upload-file-fill" style="width: 0%"></div>
        </div>
        <span class="upload-file-percent">0%</span>
      </div>
    `;
    
    uploadFilesList.appendChild(fileItem);
    
    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        
        // Add file to storage
        const isPrivate = document.getElementById('privateToggle').checked;
        const newFile = FileManager.add({
          name: file.name,
          size: file.size,
          type: file.type,
          privacy: isPrivate ? 'private' : 'public'
        });
        
        // Update UI
        this.updateStats();
        this.populateRecentFiles();
        this.populateFiles();
        
        // Hide upload progress after delay
        setTimeout(() => {
          uploadProgress.classList.add('hidden');
          uploadFilesList.innerHTML = '';
        }, 1500);
      }
      
      // Update progress bars
      const fileFill = fileItem.querySelector('.upload-file-fill');
      const filePercent = fileItem.querySelector('.upload-file-percent');
      
      fileFill.style.width = progress + '%';
      filePercent.textContent = Math.round(progress) + '%';
      
      progressFill.style.width = progress + '%';
      uploadPercent.textContent = Math.round(progress) + '%';
    }, 100);
  }
  
  updateStats() {
    const files = FileManager.getAll();
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    const privateFiles = files.filter(file => file.privacy === 'private').length;
    const publicFiles = files.filter(file => file.privacy === 'public').length;
    
    document.getElementById('totalFiles').textContent = files.length;
    document.getElementById('totalStorage').textContent = Utils.formatFileSize(totalSize);
    document.getElementById('privateFiles').textContent = privateFiles;
    document.getElementById('publicFiles').textContent = publicFiles;
  }
  
  populateRecentFiles() {
    const recentFilesList = document.getElementById('recentFilesList');
    const files = FileManager.getAll()
      .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
      .slice(0, 5);
    
    if (files.length === 0) {
      recentFilesList.innerHTML = `
        <div class="empty-message">
          <p>No files uploaded yet</p>
        </div>
      `;
      return;
    }
    
    recentFilesList.innerHTML = files.map(file => `
      <div class="file-item" onclick="previewFile('${file.id}')">
        <div class="file-item-icon">${Utils.getFileIcon(file.type)}</div>
        <div class="file-item-info">
          <div class="file-item-name">${file.name}</div>
          <div class="file-item-meta">
            ${Utils.formatFileSize(file.size)} • ${Utils.formatDate(file.uploadDate)} • ${file.privacy}
          </div>
        </div>
        <div class="file-item-actions">
          <button class="file-action-btn" onclick="event.stopPropagation(); downloadFile('${file.id}')">
            📥
          </button>
        </div>
      </div>
    `).join('');
  }
  
  populateFiles() {
    const filesGrid = document.getElementById('filesGrid');
    const emptyState = document.getElementById('emptyState');
    
    let files = FileManager.getAll();
    
    // Apply filter
    if (this.currentFilter !== 'all') {
      files = FileManager.filter(this.currentFilter);
    }
    
    if (files.length === 0) {
      filesGrid.style.display = 'none';
      emptyState.classList.remove('hidden');
      return;
    }
    
    emptyState.classList.add('hidden');
    filesGrid.style.display = 'grid';
    
    // Apply view mode
    if (this.currentView === 'list') {
      filesGrid.classList.add('list-view');
    } else {
      filesGrid.classList.remove('list-view');
    }
    
    filesGrid.innerHTML = files.map((file, index) => `
      <div class="file-card ${file.privacy}" data-file-id="${file.id}" onclick="previewFile('${file.id}')" style="animation-delay: ${index * 0.1}s">
        <div class="file-card-icon">${Utils.getFileIcon(file.type)}</div>
        <div class="file-card-name">${file.name}</div>
        <div class="file-card-meta">
          <span>${Utils.formatFileSize(file.size)}</span>
          <span>${Utils.formatDate(file.uploadDate)}</span>
        </div>
        <div class="file-card-actions">
          <button class="file-action-btn" onclick="event.stopPropagation(); downloadFile('${file.id}')">
            Download
          </button>
          <button class="file-action-btn danger" onclick="event.stopPropagation(); deleteFile('${file.id}')">
            Delete
          </button>
        </div>
      </div>
    `).join('');
  }
  
  setFilter(filter) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    this.currentFilter = filter;
    this.populateFiles();
  }
  
  setView(view) {
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-view="${view}"]`).classList.add('active');
    
    this.currentView = view;
    this.populateFiles();
  }
  
  handleGlobalSearch(query) {
    if (!query.trim()) return;
    
    const results = FileManager.search(query);
    console.log('Search results:', results);
    
    // Switch to files section and filter
    this.switchSection('files');
    // You could implement a search filter here
  }
  
  searchPublicFiles(query = '') {
    const searchResults = document.getElementById('searchResults');
    
    if (!query.trim()) {
      searchResults.innerHTML = `
        <div class="search-placeholder">
          <div class="search-placeholder-icon">🔍</div>
          <h3>Search Public Files</h3>
          <p>Enter keywords to find files shared by other users</p>
        </div>
      `;
      return;
    }
    
    // Simulate public file search
    const mockPublicFiles = [
      { id: 'pub1', name: 'Project Proposal.pdf', owner: 'John Doe', size: 2048000, type: 'application/pdf', uploadDate: new Date().toISOString() },
      { id: 'pub2', name: 'Marketing Strategy.docx', owner: 'Jane Smith', size: 1536000, type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', uploadDate: new Date().toISOString() },
      { id: 'pub3', name: 'Budget Analysis.xlsx', owner: 'Mike Johnson', size: 1024000, type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', uploadDate: new Date().toISOString() }
    ];
    
    const results = mockPublicFiles.filter(file => 
      file.name.toLowerCase().includes(query.toLowerCase())
    );
    
    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="no-results">
          <div class="no-results-icon">📭</div>
          <h3>No files found</h3>
          <p>Try different keywords or check your spelling</p>
        </div>
      `;
      return;
    }
    
    searchResults.innerHTML = `
      <div class="search-results-header">
        <h3>Found ${results.length} file${results.length !== 1 ? 's' : ''}</h3>
      </div>
      <div class="search-results-grid">
        ${results.map(file => `
          <div class="search-result-card" onclick="previewPublicFile('${file.id}')">
            <div class="result-icon">${Utils.getFileIcon(file.type)}</div>
            <div class="result-info">
              <div class="result-name">${file.name}</div>
              <div class="result-meta">
                <span>By ${file.owner}</span>
                <span>${Utils.formatFileSize(file.size)}</span>
                <span>${Utils.formatDate(file.uploadDate)}</span>
              </div>
            </div>
            <div class="result-actions">
              <button class="result-action-btn" onclick="event.stopPropagation(); downloadPublicFile('${file.id}')">
                Download
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }
}

// Global functions
function switchSection(sectionName) {
  if (window.userDashboard) {
    window.userDashboard.switchSection(sectionName);
  }
}

function previewFile(fileId) {
  const file = FileManager.get(fileId);
  if (!file) return;
  
  const modal = document.getElementById('previewModal');
  const previewTitle = document.getElementById('previewTitle');
  const previewContent = document.getElementById('previewContent');
  
  previewTitle.textContent = file.name;
  previewContent.innerHTML = `
    <div class="file-preview">
      <div class="preview-icon">${Utils.getFileIcon(file.type)}</div>
      <div class="preview-details">
        <h4>${file.name}</h4>
        <div class="preview-meta">
          <p><strong>Type:</strong> ${file.type}</p>
          <p><strong>Size:</strong> ${Utils.formatFileSize(file.size)}</p>
          <p><strong>Privacy:</strong> ${file.privacy}</p>
          <p><strong>Uploaded:</strong> ${Utils.formatDate(file.uploadDate)}</p>
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  modal.classList.add('show');
  
  // Store current file for download
  window.currentPreviewFile = file;
}

function previewPublicFile(fileId) {
  // Simulate public file preview
  alert(`Preview for public file: ${fileId}`);
}

function downloadFile(fileId) {
  const file = FileManager.get(fileId);
  if (!file) return;
  
  // Simulate download
  const link = document.createElement('a');
  link.download = file.name;
  link.href = '#';
  link.click();
  
  // Show success message
  showToast(`Downloaded: ${file.name}`, 'success');
}

function downloadPublicFile(fileId) {
  // Simulate public file download
  showToast(`Downloaded public file: ${fileId}`, 'success');
}

function downloadCurrentFile() {
  if (window.currentPreviewFile) {
    downloadFile(window.currentPreviewFile.id);
    closePreviewModal();
  }
}

function deleteFile(fileId) {
  if (!confirm('Are you sure you want to delete this file?')) return;
  
  const fileCard = document.querySelector(`[data-file-id="${fileId}"]`);
  if (fileCard) {
    fileCard.style.animation = 'deleteFile 0.5s ease-out forwards';
    
    setTimeout(() => {
      FileManager.remove(fileId);
      if (window.userDashboard) {
        window.userDashboard.updateStats();
        window.userDashboard.populateRecentFiles();
        window.userDashboard.populateFiles();
      }
    }, 500);
  }
}

function closePreviewModal() {
  const modal = document.getElementById('previewModal');
  modal.classList.remove('show');
  
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

function searchPublicFiles() {
  const query = document.getElementById('publicSearch').value;
  if (window.userDashboard) {
    window.userDashboard.searchPublicFiles(query);
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-icon">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Initialize user dashboard
document.addEventListener('DOMContentLoaded', () => {
  window.userDashboard = new UserDashboard();
  
  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closePreviewModal();
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'u':
          e.preventDefault();
          document.getElementById('fileInput').click();
          break;
        case 'f':
          e.preventDefault();
          document.getElementById('globalSearch').focus();
          break;
      }
    }
    
    if (e.key === 'Escape') {
      closePreviewModal();
    }
  });
  
  // Add CSS for animations and components
  const style = document.createElement('style');
  style.textContent = `
    @keyframes deleteFile {
      0% {
        transform: scale(1) rotate(0deg);
        opacity: 1;
      }
      50% {
        transform: scale(1.1) rotate(5deg);
        opacity: 0.5;
      }
      100% {
        transform: scale(0) rotate(45deg);
        opacity: 0;
      }
    }
    
    .upload-file-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      margin-bottom: 0.5rem;
    }
    
    .upload-file-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }
    
    .upload-file-icon {
      font-size: 1.5rem;
    }
    
    .upload-file-name {
      font-weight: 500;
      color: var(--text-primary);
      font-size: 0.9rem;
    }
    
    .upload-file-size {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .upload-file-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 100px;
    }
    
    .upload-file-bar {
      width: 60px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    
    .upload-file-fill {
      height: 100%;
      background: var(--primary-color);
      border-radius: 2px;
      transition: width 0.3s ease;
    }
    
    .upload-file-percent {
      font-size: 0.8rem;
      color: var(--text-muted);
      min-width: 30px;
    }
    
    .search-placeholder,
    .no-results {
      text-align: center;
      padding: 4rem 2rem;
      color: var(--text-muted);
    }
    
    .search-placeholder-icon,
    .no-results-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    
    .search-results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1rem;
      margin-top: 1rem;
    }
    
    .search-result-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .search-result-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px var(--glass-shadow);
    }
    
    .result-icon {
      font-size: 2rem;
    }
    
    .result-info {
      flex: 1;
    }
    
    .result-name {
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }
    
    .result-meta {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .result-meta span {
      margin-right: 0.5rem;
    }
    
    .result-action-btn {
      padding: 0.5rem 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.3s ease;
    }
    
    .result-action-btn:hover {
      background: var(--secondary-color);
    }
    
    .toast {
      position: fixed;
      top: 2rem;
      right: 2rem;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      padding: 1rem 1.5rem;
      transform: translateX(400px);
      opacity: 0;
      transition: all 0.4s ease;
      z-index: 1000;
      max-width: 300px;
    }
    
    .toast.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .toast-success {
      border-left: 4px solid var(--success-color);
    }
    
    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .toast-icon {
      font-size: 1.2rem;
      color: var(--success-color);
    }
    
    .toast-message {
      color: var(--text-primary);
      font-weight: 500;
    }
    
    .files-grid.list-view {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .files-grid.list-view .file-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
    }
    
    .files-grid.list-view .file-card-icon {
      font-size: 1.5rem;
      margin-bottom: 0;
    }
    
    .files-grid.list-view .file-card-name {
      flex: 1;
      margin-bottom: 0;
    }
    
    .files-grid.list-view .file-card-meta {
      margin-bottom: 0;
    }
  `;
  document.head.appendChild(style);
});
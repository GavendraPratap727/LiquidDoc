// Admin dashboard JavaScript

class AdminDashboard {
  constructor() {
    this.currentSection = 'dashboard';
    this.files = FileManager.getAll();
    this.users = this.generateMockUsers();
    this.activities = this.generateMockActivities();
    this.init();
  }
  
  init() {
    // Check authentication
    Session.requireAuth();
    const user = Session.getUser();
    
    if (user.role !== 'admin') {
      window.location.href = 'user.html';
      return;
    }
    
    this.updateAdminInfo(user);
    this.initEventListeners();
    this.updateStats();
    this.populateActivities();
    this.populateFiles();
    this.populateUsers();
  }
  
  updateAdminInfo(user) {
    const adminName = document.getElementById('adminName');
    if (adminName) {
      adminName.textContent = user.name || 'Administrator';
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
    
    // Admin search
    const adminSearch = document.getElementById('adminSearch');
    if (adminSearch) {
      adminSearch.addEventListener('input', Utils.debounce((e) => {
        this.handleAdminSearch(e.target.value);
      }, 300));
    }
    
    // File filter
    const fileFilter = document.getElementById('fileFilter');
    if (fileFilter) {
      fileFilter.addEventListener('change', (e) => {
        this.filterFiles(e.target.value);
      });
    }
  }
  
  generateMockUsers() {
    return [
      { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        role: 'user', 
        lastActive: '2024-01-15', 
        filesCount: 23,
        storageUsed: 45000000,
        joinDate: '2023-06-15'
      },
      { 
        id: 2, 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        role: 'user', 
        lastActive: '2024-01-14', 
        filesCount: 45,
        storageUsed: 78000000,
        joinDate: '2023-08-22'
      },
      { 
        id: 3, 
        name: 'Mike Johnson', 
        email: 'mike@example.com', 
        role: 'user', 
        lastActive: '2024-01-13', 
        filesCount: 12,
        storageUsed: 23000000,
        joinDate: '2023-11-10'
      },
      { 
        id: 4, 
        name: 'Sarah Wilson', 
        email: 'sarah@example.com', 
        role: 'user', 
        lastActive: '2024-01-12', 
        filesCount: 67,
        storageUsed: 120000000,
        joinDate: '2023-04-03'
      }
    ];
  }
  
  generateMockActivities() {
    return [
      { 
        icon: '📤', 
        title: 'New file uploaded', 
        description: 'Project Report.pdf by John Doe',
        time: '2 minutes ago', 
        type: 'upload'
      },
      { 
        icon: '👤', 
        title: 'New user registered', 
        description: 'Sarah Wilson joined the platform',
        time: '15 minutes ago', 
        type: 'user'
      },
      { 
        icon: '🗑️', 
        title: 'File deleted', 
        description: 'Old backup.zip by Jane Smith',
        time: '1 hour ago', 
        type: 'delete'
      },
      { 
        icon: '🔒', 
        title: 'File made private', 
        description: 'Confidential.docx by Mike Johnson',
        time: '2 hours ago', 
        type: 'privacy'
      },
      { 
        icon: '📊', 
        title: 'Analytics report generated', 
        description: 'Monthly usage report created',
        time: '3 hours ago', 
        type: 'system'
      }
    ];
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
      files: 'File Management',
      users: 'User Management',
      analytics: 'Analytics',
      settings: 'System Settings'
    };
    
    const subtitles = {
      dashboard: 'Welcome to the admin control center',
      files: 'View, preview, and manage all user files',
      users: 'Manage user accounts and permissions',
      analytics: 'System performance and usage statistics',
      settings: 'Configure system preferences and security'
    };
    
    document.getElementById('pageTitle').textContent = titles[sectionName];
    document.getElementById('pageSubtitle').textContent = subtitles[sectionName];
    
    this.currentSection = sectionName;
    
    // Refresh content if needed
    if (sectionName === 'files') {
      this.populateFiles();
    } else if (sectionName === 'users') {
      this.populateUsers();
    }
  }
  
  updateStats() {
    const files = FileManager.getAll();
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    
    // Animate numbers
    this.animateNumber('totalFilesAdmin', files.length);
    this.animateNumber('totalUsers', this.users.length);
    
    document.getElementById('totalStorageAdmin').textContent = Utils.formatFileSize(totalSize);
  }
  
  animateNumber(elementId, target) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current);
    }, 16);
  }
  
  populateActivities() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;
    
    activityList.innerHTML = this.activities.map(activity => `
      <div class="activity-item">
        <div class="activity-icon">${activity.icon}</div>
        <div class="activity-content">
          <div class="activity-title">${activity.title}</div>
          <div class="activity-description">${activity.description}</div>
          <div class="activity-time">${activity.time}</div>
        </div>
      </div>
    `).join('');
  }
  
  populateFiles() {
    const filesTableBody = document.getElementById('filesTableBody');
    if (!filesTableBody) return;
    
    const files = FileManager.getAll();
    
    if (files.length === 0) {
      filesTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No files found
          </td>
        </tr>
      `;
      return;
    }
    
    filesTableBody.innerHTML = files.map(file => `
      <tr>
        <td>
          <div class="file-info">
            <div class="file-icon">${Utils.getFileIcon(file.type)}</div>
            <div class="file-details">
              <div class="file-name">${file.name}</div>
              <div class="file-type">${file.type}</div>
            </div>
          </div>
        </td>
        <td>User ${file.id.slice(-3)}</td>
        <td>${Utils.formatFileSize(file.size)}</td>
        <td>
          <span class="privacy-badge ${file.privacy}">${file.privacy}</span>
        </td>
        <td>${Utils.formatDate(file.uploadDate)}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" onclick="previewAdminFile('${file.id}')" title="Preview">
              👁️
            </button>
            <button class="table-action-btn danger" onclick="deleteAdminFile('${file.id}')" title="Delete">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  populateUsers() {
    const usersGrid = document.getElementById('usersGrid');
    if (!usersGrid) return;
    
    usersGrid.innerHTML = this.users.map(user => `
      <div class="user-card glass-card">
        <div class="user-header">
          <div class="user-avatar">${user.name.charAt(0)}</div>
          <div class="user-info">
            <h4>${user.name}</h4>
            <div class="user-email">${user.email}</div>
          </div>
        </div>
        <div class="user-stats">
          <div class="user-stat">
            <div class="user-stat-number">${user.filesCount}</div>
            <div class="user-stat-label">Files</div>
          </div>
          <div class="user-stat">
            <div class="user-stat-number">${Utils.formatFileSize(user.storageUsed)}</div>
            <div class="user-stat-label">Storage</div>
          </div>
        </div>
        <div class="user-meta">
          <div class="user-meta-item">
            <strong>Role:</strong> ${user.role}
          </div>
          <div class="user-meta-item">
            <strong>Joined:</strong> ${Utils.formatDate(user.joinDate)}
          </div>
          <div class="user-meta-item">
            <strong>Last Active:</strong> ${Utils.formatDate(user.lastActive)}
          </div>
        </div>
        <div class="user-actions">
          <button class="user-action-btn" onclick="editUser(${user.id})">Edit</button>
          <button class="user-action-btn" onclick="suspendUser(${user.id})">Suspend</button>
        </div>
      </div>
    `).join('');
  }
  
  filterFiles(filter) {
    let files = FileManager.getAll();
    
    switch (filter) {
      case 'public':
        files = files.filter(file => file.privacy === 'public');
        break;
      case 'private':
        files = files.filter(file => file.privacy === 'private');
        break;
      case 'recent':
        files = files.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)).slice(0, 10);
        break;
    }
    
    // Update table with filtered files
    this.populateFilteredFiles(files);
  }
  
  populateFilteredFiles(files) {
    const filesTableBody = document.getElementById('filesTableBody');
    if (!filesTableBody) return;
    
    if (files.length === 0) {
      filesTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 2rem; color: var(--text-muted);">
            No files match the current filter
          </td>
        </tr>
      `;
      return;
    }
    
    filesTableBody.innerHTML = files.map(file => `
      <tr>
        <td>
          <div class="file-info">
            <div class="file-icon">${Utils.getFileIcon(file.type)}</div>
            <div class="file-details">
              <div class="file-name">${file.name}</div>
              <div class="file-type">${file.type}</div>
            </div>
          </div>
        </td>
        <td>User ${file.id.slice(-3)}</td>
        <td>${Utils.formatFileSize(file.size)}</td>
        <td>
          <span class="privacy-badge ${file.privacy}">${file.privacy}</span>
        </td>
        <td>${Utils.formatDate(file.uploadDate)}</td>
        <td>
          <div class="table-actions">
            <button class="table-action-btn" onclick="previewAdminFile('${file.id}')" title="Preview">
              👁️
            </button>
            <button class="table-action-btn danger" onclick="deleteAdminFile('${file.id}')" title="Delete">
              🗑️
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }
  
  handleAdminSearch(query) {
    if (!query.trim()) {
      this.populateFiles();
      return;
    }
    
    const results = FileManager.search(query);
    this.populateFilteredFiles(results);
  }
}

// Global functions
function previewAdminFile(fileId) {
  const file = FileManager.get(fileId);
  if (!file) return;
  
  const modal = document.getElementById('filePreviewModal');
  const previewFileName = document.getElementById('previewFileName');
  const filePreviewContent = document.getElementById('filePreviewContent');
  
  previewFileName.textContent = file.name;
  filePreviewContent.innerHTML = `
    <div class="admin-file-preview">
      <div class="preview-header">
        <div class="preview-icon">${Utils.getFileIcon(file.type)}</div>
        <div class="preview-info">
          <h4>${file.name}</h4>
          <div class="preview-meta">
            <span class="privacy-badge ${file.privacy}">${file.privacy}</span>
          </div>
        </div>
      </div>
      <div class="preview-details">
        <div class="detail-row">
          <strong>File Type:</strong> ${file.type}
        </div>
        <div class="detail-row">
          <strong>File Size:</strong> ${Utils.formatFileSize(file.size)}
        </div>
        <div class="detail-row">
          <strong>Upload Date:</strong> ${Utils.formatDate(file.uploadDate)}
        </div>
        <div class="detail-row">
          <strong>Privacy:</strong> ${file.privacy}
        </div>
        <div class="detail-row">
          <strong>File ID:</strong> ${file.id}
        </div>
      </div>
    </div>
  `;
  
  modal.classList.remove('hidden');
  modal.classList.add('show');
  
  // Store current file for deletion
  window.currentAdminFile = file;
}

function deleteAdminFile(fileId) {
  if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
    return;
  }
  
  const row = document.querySelector(`tr:has(button[onclick*="${fileId}"])`);
  if (row) {
    row.style.animation = 'fadeOut 0.5s ease-out forwards';
    
    setTimeout(() => {
      FileManager.remove(fileId);
      if (window.adminDashboard) {
        window.adminDashboard.updateStats();
        window.adminDashboard.populateFiles();
      }
      showAdminToast('File deleted successfully', 'success');
    }, 500);
  }
}

function deleteCurrentFile() {
  if (window.currentAdminFile) {
    deleteAdminFile(window.currentAdminFile.id);
    closeFilePreview();
  }
}

function closeFilePreview() {
  const modal = document.getElementById('filePreviewModal');
  modal.classList.remove('show');
  
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

function refreshFiles() {
  if (window.adminDashboard) {
    window.adminDashboard.populateFiles();
    showAdminToast('Files refreshed', 'info');
  }
}

function editUser(userId) {
  const user = window.adminDashboard.users.find(u => u.id === userId);
  if (user) {
    alert(`Edit user: ${user.name}\nEmail: ${user.email}\nRole: ${user.role}`);
  }
}

function suspendUser(userId) {
  const user = window.adminDashboard.users.find(u => u.id === userId);
  if (user && confirm(`Are you sure you want to suspend ${user.name}?`)) {
    showAdminToast(`User ${user.name} has been suspended`, 'warning');
  }
}

function showAddUserModal() {
  alert('Add User functionality would open a modal here');
}

function showSystemInfo() {
  const info = `
System Information:
- Version: 1.0.0
- Uptime: 99.9%
- Total Storage: 1TB
- Available Storage: 750GB
- Active Users: ${window.adminDashboard.users.length}
- Total Files: ${FileManager.getAll().length}
  `;
  alert(info);
}

function exportData() {
  const data = {
    files: FileManager.getAll(),
    users: window.adminDashboard.users,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `liquiddocs-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showAdminToast('Data exported successfully', 'success');
}

function showAdminToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast-${type}`;
  
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  toast.innerHTML = `
    <div class="admin-toast-content">
      <span class="admin-toast-icon">${icons[type]}</span>
      <span class="admin-toast-message">${message}</span>
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

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
  window.adminDashboard = new AdminDashboard();
  
  // Close modal when clicking outside
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeFilePreview();
    }
  });
  
  // Add CSS for admin-specific components
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeOut {
      to {
        opacity: 0;
        transform: translateX(-20px);
      }
    }
    
    .admin-file-preview {
      text-align: left;
    }
    
    .preview-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--glass-border);
    }
    
    .preview-icon {
      font-size: 3rem;
    }
    
    .preview-info h4 {
      margin-bottom: 0.5rem;
      color: var(--text-primary);
    }
    
    .preview-details {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
    }
    
    .detail-row strong {
      color: var(--text-primary);
    }
    
    .user-meta {
      margin: 1rem 0;
      font-size: 0.85rem;
    }
    
    .user-meta-item {
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }
    
    .user-meta-item strong {
      color: var(--text-primary);
    }
    
    .admin-toast {
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
    
    .admin-toast.show {
      transform: translateX(0);
      opacity: 1;
    }
    
    .admin-toast-success {
      border-left: 4px solid var(--success-color);
    }
    
    .admin-toast-error {
      border-left: 4px solid var(--error-color);
    }
    
    .admin-toast-warning {
      border-left: 4px solid var(--warning-color);
    }
    
    .admin-toast-info {
      border-left: 4px solid var(--primary-color);
    }
    
    .admin-toast-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    
    .admin-toast-icon {
      font-size: 1.2rem;
      font-weight: bold;
    }
    
    .admin-toast-success .admin-toast-icon {
      color: var(--success-color);
    }
    
    .admin-toast-error .admin-toast-icon {
      color: var(--error-color);
    }
    
    .admin-toast-warning .admin-toast-icon {
      color: var(--warning-color);
    }
    
    .admin-toast-info .admin-toast-icon {
      color: var(--primary-color);
    }
    
    .admin-toast-message {
      color: var(--text-primary);
      font-weight: 500;
    }
  `;
  document.head.appendChild(style);
});
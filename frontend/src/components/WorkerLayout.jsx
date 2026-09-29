import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './WorkerLayout.css';

const WorkerLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || null;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { path: '/worker-dashboard', label: 'Worker Profile',   icon: 'fas fa-user-circle' },
    { path: '/worker-reporting', label: 'Worker Reporting', icon: 'fas fa-file-alt' },
    { path: '/worker-payment',   label: 'Worker Payment',   icon: 'fas fa-wallet' },
    { path: '/worker-settings',  label: 'Settings',         icon: 'fas fa-cog' },
  ];

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  if (!user) {
    return (
      <div className="wl-container">
        <div className="wl-main">
          <div className="wl-content">
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Please log in to access the worker portal.</p>
              <button className="btn btn-primary" onClick={() => navigate('/login')}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wl-container">
      {/* Sidebar */}
      <aside className="wl-sidebar">
        <div className="wl-sidebar-brand">
          <div className="wl-brand-badge">C2S</div>
          <div className="wl-brand-info">
            <h1>C2S Worker</h1>
            <p>Worker Portal v2.0</p>
          </div>
        </div>

        {/* Worker avatar in sidebar */}
        <div className="wl-worker-card">
          <div className="wl-worker-avatar">
            {(user.full_name || 'W').charAt(0).toUpperCase()}
          </div>
          <div className="wl-worker-meta">
            <span className="wl-worker-name">{user.full_name || 'Worker'}</span>
            <span className="wl-worker-role">Factory Worker</span>
          </div>
        </div>

        <nav className="wl-nav">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                className={`wl-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <i className={item.icon}></i>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="wl-sidebar-footer">
          <button className="wl-logout-btn" onClick={handleLogout}>
            <i className="fas fa-sign-out-alt"></i>
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="wl-main">
        {/* Header */}
        <header className="wl-header">
          <div className="wl-header-left">
            <span className="wl-header-title">
              {navItems.find(n => n.path === location.pathname)?.label || 'Worker Portal'}
            </span>
          </div>
          <div className="wl-header-right">
            <div className="wl-header-pill">
              <i className="fas fa-calendar-day"></i>
              <span>{currentDate}</span>
            </div>
            <div className="wl-header-pill">
              <i className="fas fa-clock"></i>
              <span>Morning Shift (08:00 – 17:00)</span>
            </div>
            <div className="wl-user-chip">
              <div className="wl-user-avatar-sm">
                {(user.full_name || 'W').charAt(0).toUpperCase()}
              </div>
              <span>{user.full_name || 'Worker'}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="wl-content">{children}</main>

        {/* Footer */}
        <footer className="wl-footer">
          <span>© 2026 C2S Garments Management System — Worker Portal</span>
          <span>Team The Blueprints • CSE-3411</span>
        </footer>
      </div>
    </div>
  );
};

export default WorkerLayout;

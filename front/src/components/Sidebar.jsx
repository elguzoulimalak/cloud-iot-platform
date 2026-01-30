import React from 'react';
import { SquaresFour, Monitor, ChartLine, Gear, SignOut } from 'phosphor-react';

export default function Sidebar({ onLogout, activeTab, onNavigate }) {
  return (
    <div className="glass-panel" style={{
      width: '240px',
      margin: '20px 0 20px 20px',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', color: '#3b82f6' }}>
        <SquaresFour size={32} weight="fill" />
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>IoT Admin</h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <NavItem
          icon={<SquaresFour />}
          label="Dashboard"
          active={activeTab === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <NavItem
          icon={<Monitor />}
          label="Devices"
          active={activeTab === 'devices'}
          onClick={() => onNavigate('devices')}
        />
        <NavItem
          icon={<ChartLine />}
          label="Analytics"
          active={activeTab === 'analytics'}
          onClick={() => onNavigate('analytics')}
        />
        <NavItem
          icon={<Gear />}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => onNavigate('settings')}
        />
      </nav>

      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '20px' }}>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'transparent',
            color: '#ef4444',
            width: '100%',
            justifyContent: 'flex-start',
            padding: '10px'
          }}
        >
          <SignOut size={20} />
          Logout
        </button>
      </div>
    </div>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px',
        borderRadius: '8px',
        background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        color: active ? '#3b82f6' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontWeight: 500
      }}>
      {React.cloneElement(icon, { size: 20, weight: active ? 'fill' : 'regular' })}
      {label}
    </div>
  )
}

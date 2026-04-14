import React from 'react';
import { SquaresFour, Monitor, ChartLine, Gear, SignOut, Thermometer } from 'phosphor-react';

export default function Sidebar({ onLogout, activeTab, onNavigate }) {
  return (
    <div className="glass-panel" style={{
      width: '260px',
      margin: '24px 0 24px 24px',
      display: 'flex',
      flexDirection: 'column',
      padding: '32px 24px',
      height: 'calc(100vh - 48px)',
      position: 'sticky',
      top: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
        <div style={{ 
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))', 
            padding: '8px', 
            borderRadius: '12px',
            boxShadow: '0 0 20px var(--primary-glow)'
        }}>
            <SquaresFour size={24} weight="fill" color="white" />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>
            CLOUD<span style={{ color: 'var(--primary)' }}>IOT</span>
        </h2>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
          icon={<Thermometer />}
          label="Temperature"
          active={activeTab === 'temperature'}
          onClick={() => onNavigate('temperature')}
        />
        <NavItem
          icon={<ChartLine />}
          label="Analytics"
          active={activeTab === 'analytics'}
          onClick={() => onNavigate('analytics')}
        />
        <div style={{ margin: '16px 0', borderTop: '1px solid var(--border-glass)' }}></div>
        <NavItem
          icon={<Gear />}
          label="Settings"
          active={activeTab === 'settings'}
          onClick={() => onNavigate('settings')}
        />
      </nav>

      <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '24px' }}>
        <button
          onClick={onLogout}
          className="btn-danger"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            justifyContent: 'center',
            padding: '12px',
            fontSize: '0.9rem',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
        >
          <SignOut size={20} weight="bold" />
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
      className={`sidebar-link ${active ? 'active' : ''}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        borderRadius: '12px',
        color: active ? 'var(--primary)' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontWeight: active ? 700 : 500,
        fontSize: '0.95rem'
      }}>
      {React.cloneElement(icon, { size: 22, weight: active ? 'fill' : 'regular' })}
      {label}
    </div>
  )
}

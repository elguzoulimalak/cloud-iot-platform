import React from 'react';
import { Laptop, Desktop, Thermometer, Warning, Trash } from 'phosphor-react';

export default function DeviceCard({ device, onDelete }) {
    const getIcon = (name, type) => {
        const t = (type || '').toLowerCase();
        const n = (name || '').toLowerCase();

        if (t.includes('sensor') || n.includes('temp')) return <Thermometer size={32} weight="duotone" color="#f59e0b" />;
        if (t.includes('alarm')) return <Warning size={32} weight="duotone" color="#ef4444" />;
        if (t.includes('screen')) return <Desktop size={32} weight="duotone" color="#a855f7" />;
        return <Laptop size={32} weight="duotone" color="#3b82f6" />;
    };

    const getStatusClass = (status) => {
        switch (status?.toLowerCase()) {
            case 'active': return 'status-active';
            case 'maintenance': return 'status-maintenance';
            default: return 'status-offline';
        }
    };

    return (
        <div className="glass-panel fade-in" style={{ padding: '20px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '12px' }}>
                    {getIcon(device.name, device.type)}
                </div>
                <div className={`status-badge ${getStatusClass(device.status)}`}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}></span>
                    {device.status || 'Offline'}
                </div>
            </div>

            <h3 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{device.name}</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>{device.type}</p>

            {device.ip_address && (
                <div style={{ marginTop: '15px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    IP: {device.ip_address}
                </div>
            )}

            {/* Telemetry Preview (Mock) */}
            {(device.type === 'Sensor' || device.type === 'WeatherStation') && (
                <div style={{ marginTop: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        {/* We don't have real value in list yet, but structure is ready */}
                        --°C
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Live</span>
                </div>
            )}

            <button
                className="btn-danger"
                onClick={() => onDelete(device.id)}
                style={{ marginTop: '20px', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
            >
                <Trash size={18} />
                Remove Device
            </button>
        </div>
    );
}

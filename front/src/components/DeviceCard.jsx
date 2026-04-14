import React, { useState, useEffect } from 'react';
import { Laptop, Desktop, Thermometer, Warning, Trash, Cpu, Activity, Pencil, CaretDown, CaretUp, HardDrives } from 'phosphor-react';
import SystemGraph from './Dashboard/SystemGraph';

export default function DeviceCard({ device, telemetry, onDelete, onEdit, isExpanded, onToggleExpand }) {
    const [history, setHistory] = useState([]);
    const [settings, setSettings] = useState({ tempThreshold: 50, cpuThreshold: 80 });

    useEffect(() => {
        const loadSettings = () => {
            const saved = localStorage.getItem('iot_settings');
            if (saved) setSettings(JSON.parse(saved));
        };
        loadSettings();
        window.addEventListener('storage', loadSettings);
        return () => window.removeEventListener('storage', loadSettings);
    }, []);

    const t = (device.type || '').toLowerCase();
    const isEndDevice = t.includes('end device') || t.includes('computer') || t.includes('laptop') || t.includes('pc');
    const isIoTDevice = t.includes('iot device') || t.includes('sensor') || t.includes('capteur');

    const showSystem = isEndDevice || (!isIoTDevice && !isEndDevice);
    const showEnv = isIoTDevice || (!isIoTDevice && !isEndDevice);

    const readings = telemetry?.sensor_readings || {};
    const cpu = readings.cpu_usage;
    const ram = readings.ram_usage;
    const temp = readings.temperature;
    const disk = readings.disk_usage;
    const humidity = readings.humidity;

    useEffect(() => {
        if (telemetry?.sensor_readings) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
            const newPoint = {
                time: timeStr,
                cpu: readings.cpu_usage || 0,
                ram: readings.ram_usage || 0,
                disk: readings.disk_usage || 0,
                temp: readings.temperature || 0,
                humidity: readings.humidity || 0
            };
            setHistory(prev => [...prev, newPoint].slice(-20));
        }
    }, [telemetry]);

    const resolvedStatus = (device.status === 'offline' || device.status === 'inactive')
        ? 'offline'
        : (telemetry?.status || device.status || 'offline').toLowerCase();

    const getIcon = () => {
        if (cpu > settings.cpuThreshold || temp > settings.tempThreshold) return <Warning size={28} weight="duotone" color="var(--danger)" />;
        const n = (device.name || '').toLowerCase();
        if (t.includes('sensor') || n.includes('temp')) return <Thermometer size={28} weight="duotone" color="var(--warning)" />;
        if (t.includes('screen')) return <Desktop size={28} weight="duotone" color="var(--secondary)" />;
        return <Laptop size={28} weight="duotone" color="var(--primary)" />;
    };

    const isAlert = (showSystem && cpu > settings.cpuThreshold) || (showEnv && temp > settings.tempThreshold);

    return (
        <div
            className="glass-panel fade-in"
            style={{
                padding: '28px',
                border: isAlert ? '1px solid var(--danger)' : (isExpanded ? '1px solid var(--primary)' : '1px solid var(--border-glass)'),
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                background: isExpanded ? 'var(--bg-glass-heavy)' : 'var(--bg-glass)',
                boxShadow: isAlert ? '0 0 20px rgba(244, 63, 94, 0.2)' : (isExpanded ? '0 0 30px rgba(56, 189, 248, 0.15)' : 'none'),
                alignSelf: 'start'
            }}
            onClick={onToggleExpand}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{
                    padding: '12px',
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid var(--border-glass)'
                }}>
                    {getIcon()}
                </div>
                <div className={`status-badge status-${resolvedStatus}`}>
                    {resolvedStatus}
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800 }}>{device.name}</h3>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{device.type}</p>
            </div>

            {resolvedStatus !== 'offline' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(70px, 1fr))', gap: '8px', marginBottom: '20px' }}>
                    {showSystem && cpu !== undefined && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>CPU</p>
                            <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: cpu > settings.cpuThreshold ? 'var(--danger)' : 'var(--text-main)' }}>{cpu.toFixed(1)}%</p>
                        </div>
                    )}
                    {showSystem && ram !== undefined && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>RAM</p>
                            <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{ram.toFixed(1)}%</p>
                        </div>
                    )}
                    {showSystem && disk !== undefined && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>DISK</p>
                            <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>{disk.toFixed(1)}%</p>
                        </div>
                    )}
                    {showEnv && temp !== undefined && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>TEMP</p>
                            <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: temp > settings.tempThreshold ? 'var(--danger)' : 'var(--warning)' }}>{temp.toFixed(1)}°C</p>
                        </div>
                    )}
                    {showEnv && humidity !== undefined && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '10px', borderRadius: '12px' }}>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>HUM.</p>
                            <p style={{ margin: '4px 0 0', fontSize: '1rem', fontWeight: 700, color: 'var(--primary)' }}>{humidity.toFixed(1)}%</p>
                        </div>
                    )}
                </div>
            ) : (
                <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(244, 63, 94, 0.05)', borderRadius: '12px', color: 'var(--danger)', fontSize: '0.85rem', fontWeight: 600, textAlign: 'center', letterSpacing: '1px' }}>
                    DEVICE IS OFFLINE
                </div>
            )}

            {isExpanded && (
                <div style={{ marginTop: '24px', animation: 'fadeInScale 0.4s ease-out' }} onClick={e => e.stopPropagation()}>
                    {resolvedStatus !== 'offline' && (
                        <div style={{ height: '200px', marginBottom: '24px' }}>
                            <SystemGraph data={history} activeMetrics={isIoTDevice ? ['temp', 'humidity'] : ['cpu', 'ram', 'disk']} />
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn-primary" style={{ flex: 1, padding: '10px' }} onClick={() => onEdit(device)}>
                            <Pencil size={18} weight="bold" />
                        </button>
                        <button className="btn-danger" style={{ flex: 1, padding: '10px' }} onClick={() => onDelete(device.id)}>
                            <Trash size={18} weight="bold" />
                        </button>
                    </div>
                </div>
            )}

            <div style={{
                marginTop: '16px',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
                {isExpanded ? <CaretUp size={14} weight="bold" /> : <CaretDown size={14} weight="bold" />}
                {isExpanded ? 'LESS DETAILS' : (resolvedStatus === 'offline' ? 'ACTIONS' : 'MORE DETAILS')}
            </div>
        </div>
    );
}

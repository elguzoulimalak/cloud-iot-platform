import { useState, useEffect } from 'react';
import { FloppyDisk } from 'phosphor-react';

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        tempThreshold: 50, // Default 50°C
        cpuThreshold: 80,  // Default 80%
        darkMode: true
    });

    useEffect(() => {
        const saved = localStorage.getItem('iot_settings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : Number(value)
        }));
    };

    const handleSave = () => {
        localStorage.setItem('iot_settings', JSON.stringify(settings));
        alert('Settings saved!');

        // Trigger a custom event so other components can react immediately if needed
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <div className="glass-panel fade-in" style={{ padding: '30px', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
                System Preferences
            </h2>

            <div style={{ display: 'grid', gap: '25px' }}>

                {/* Temperature Threshold */}
                <div style={{ display: 'grid', gap: '10px' }}>
                    <label style={{ fontWeight: 600 }}>Max Temperature Alert (°C)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input
                            type="range"
                            name="tempThreshold"
                            min="20"
                            max="100"
                            value={settings.tempThreshold}
                            onChange={handleChange}
                            style={{ flex: 1, accentColor: 'var(--primary)' }}
                        />
                        <span style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            minWidth: '60px',
                            textAlign: 'center'
                        }}>
                            {settings.tempThreshold}°C
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Devices exceeding this temperature will show a warning status.
                    </p>
                </div>

                {/* CPU Threshold */}
                <div style={{ display: 'grid', gap: '10px' }}>
                    <label style={{ fontWeight: 600 }}>Max CPU Usage Alert (%)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <input
                            type="range"
                            name="cpuThreshold"
                            min="10"
                            max="100"
                            value={settings.cpuThreshold}
                            onChange={handleChange}
                            style={{ flex: 1, accentColor: 'var(--primary)' }}
                        />
                        <span style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '5px 10px',
                            borderRadius: '6px',
                            minWidth: '60px',
                            textAlign: 'center'
                        }}>
                            {settings.cpuThreshold}%
                        </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Cpu usage above this level will trigger a performance warning.
                    </p>
                </div>

                {/* Save Button */}
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        onClick={handleSave}
                        className="btn-primary"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FloppyDisk size={20} />
                        Save Settings
                    </button>
                </div>

            </div>
        </div>
    );
}

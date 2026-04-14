import { useState, useEffect } from 'react';
import { createDevice, updateDevice } from '../services/api';
import { DeviceMobile, Monitor, HardDrives, Activity, TextAa } from 'phosphor-react';

export default function DeviceForm({ onDeviceAdded, initialData = null, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'iot device',
        status: 'online',
        ip_address: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                type: initialData.type,
                status: (initialData.status === 'active' || initialData.status === 'online') ? 'online' : 'offline',
                ip_address: initialData.ip_address
            });
        }
    }, [initialData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { ...formData };
            if (!initialData && !payload.ip_address) {
                payload.ip_address = `192.168.1.${Math.floor(Math.random() * 254) + 1}`;
            }

            if (initialData) {
                await updateDevice(initialData.id, payload);
            } else {
                await createDevice(payload);
            }
            if (onDeviceAdded) onDeviceAdded();
        } catch (err) {
            alert(err.response?.data?.detail || 'Operation failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '32px' }}>
            <h2 style={{ margin: '0 0 32px', fontSize: '1.5rem', fontWeight: 800, textAlign: 'center' }}>
                {initialData ? 'Update Entity' : 'Commission New Device'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <div className="input-field">
                    <TextAa size={22} />
                    <input
                        placeholder="Device Name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div
                        className={`type-card ${formData.type === 'iot device' ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'iot device' })}
                    >
                        <DeviceMobile size={32} />
                        <span>IoT Sensor</span>
                    </div>
                    <div
                        className={`type-card ${formData.type === 'end device' ? 'selected' : ''}`}
                        onClick={() => setFormData({ ...formData, type: 'end device' })}
                    >
                        <Monitor size={32} />
                        <span>Workstation</span>
                    </div>
                </div>

                {initialData && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div className="input-field">
                            <Activity size={22} />
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="online">Online</option>
                                <option value="offline">Offline</option>
                            </select>
                        </div>
                        <div className="input-field">
                            <HardDrives size={22} />
                            <input
                                placeholder="IP Address"
                                value={formData.ip_address}
                                onChange={e => setFormData({ ...formData, ip_address: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '16px' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={isLoading}>
                        {isLoading ? 'Processing...' : (initialData ? 'Apply Changes' : 'Register')}
                    </button>
                    <button type="button" className="btn-danger" style={{ flex: 1 }} onClick={onCancel}>
                        Abort
                    </button>
                </div>
            </form>

            <style>{`
                .input-field {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid var(--border-glass);
                    padding: 12px 16px;
                    border-radius: 12px;
                    color: var(--text-muted);
                    transition: all 0.3s ease;
                }
                .input-field:focus-within {
                    border-color: var(--primary);
                    box-shadow: 0 0 15px rgba(56, 189, 248, 0.15);
                    color: var(--primary);
                }
                .input-field input, .input-field select {
                    background: transparent;
                    border: none;
                    color: var(--text-main);
                    width: 100%;
                    outline: none;
                    font-size: 1rem;
                    font-family: inherit;
                }
                .input-field select option {
                    background: var(--bg-dark);
                    color: var(--text-main);
                }
                .type-card {
                    background: rgba(15, 23, 42, 0.4);
                    border: 1px solid var(--border-glass);
                    padding: 20px;
                    border-radius: 16px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 12px;
                    cursor: pointer;
                    transition: all 0.3s;
                    color: var(--text-muted);
                }
                .type-card:hover {
                    background: rgba(255,255,255,0.05);
                    transform: translateY(-4px);
                }
                .type-card.selected {
                    background: rgba(56, 189, 248, 0.1);
                    border-color: var(--primary);
                    color: var(--primary);
                    box-shadow: 0 0 20px rgba(56, 189, 248, 0.1);
                }
                .type-card span {
                    font-size: 0.85rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
            `}</style>
        </div>
    );
}

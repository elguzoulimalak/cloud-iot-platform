import { useEffect, useState } from 'react';
import { getDevices, deleteDevice } from '../services/api';
import DeviceCard from './DeviceCard';
import { ArrowsClockwise } from 'phosphor-react';

export default function DeviceList({ refreshTrigger }) { // Added prop to trigger refresh
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const data = await getDevices();
            setDevices(data);
        } catch (err) {
            console.error('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, [refreshTrigger]); // Refresh when trigger changes

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this device?')) return;
        try {
            await deleteDevice(id);
            setDevices(devices.filter(d => d.id !== id));
        } catch (err) {
            alert('Failed to delete');
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>Overview</h2>
                <button onClick={fetchDevices} style={{ background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '8px', color: 'var(--text-muted)' }}>
                    <ArrowsClockwise size={20} />
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading devices...</div>
            ) : (
                <div className="grid-layout">
                    {devices.map(device => (
                        <DeviceCard key={device.id} device={device} onDelete={handleDelete} />
                    ))}
                </div>
            )}

            {!loading && devices.length === 0 && (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No devices found. Click "Add Device" to get started.
                </div>
            )}
        </div>
    );
}

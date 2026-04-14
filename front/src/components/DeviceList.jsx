import { useEffect, useState } from 'react';
import { getDevices, deleteDevice } from '../services/api';
import DeviceCard from './DeviceCard';
import DeviceForm from './DeviceForm';
import { ArrowsClockwise, MagnifyingGlass, Plus, X } from 'phosphor-react';

export default function DeviceList({ refreshTrigger, telemetryMap = {} }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [expandedDeviceId, setExpandedDeviceId] = useState(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [formKey, setFormKey] = useState(0); // Stable Key for Form Reset

    const handleExpand = (id) => {
        setExpandedDeviceId(prev => (prev === id ? null : id));
    };

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
    }, [refreshTrigger]);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this device?')) return;
        try {
            await deleteDevice(id);
            setDevices(devices.filter(d => d.id !== id));
            if (expandedDeviceId === id) setExpandedDeviceId(null);
        } catch (err) {
            alert('Failed to delete');
        }
    };

    const handleEdit = (device) => {
        setEditingDevice(device);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingDevice(null);
        setFormKey(Date.now()); // Update Key ONLY on open
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        setIsModalOpen(false);
        fetchDevices(); // Refresh list
    };

    const filteredDevices = devices.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.ip_address.includes(searchTerm) ||
        d.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            {/* Header / Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
                <h2 style={{ margin: 0 }}>Overview</h2>

                {/* Search Bar */}
                <div style={{ flex: 1, position: 'relative', maxWidth: '400px' }}>
                    <MagnifyingGlass size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search devices..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border-glass)',
                            borderRadius: '8px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleAddNew}
                        style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 600
                        }}
                    >
                        <Plus size={20} />
                        Add Device
                    </button>

                    <button onClick={fetchDevices} style={{ background: 'transparent', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '10px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <ArrowsClockwise size={20} />
                    </button>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>Loading devices...</div>
            ) : (
                <div className="grid-layout">
                    {filteredDevices.map(device => {
                        const tel = telemetryMap[device.id] || telemetryMap[device.name];
                        return (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                telemetry={tel}
                                onDelete={handleDelete}
                                onEdit={handleEdit}
                                isExpanded={expandedDeviceId === device.id}
                                onToggleExpand={() => handleExpand(device.id)}
                            />
                        );
                    })}
                </div>
            )}

            {!loading && filteredDevices.length === 0 && (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No devices found matching "{searchTerm}".
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 2000,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(5px)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div className="glass-panel" style={{ width: '400px', padding: '0', overflow: 'hidden', position: 'relative' }}>

                        {/* Close Button */}
                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 1 }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ padding: '0' }}>
                            {/* DeviceForm handles its own layout, but we pass props */}
                            <DeviceForm
                                key={editingDevice ? `edit_${editingDevice.id}` : `add_new_${formKey}`}
                                onDeviceAdded={handleSuccess}
                                initialData={editingDevice}
                                onCancel={() => setIsModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

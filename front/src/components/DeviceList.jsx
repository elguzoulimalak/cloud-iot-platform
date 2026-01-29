import { useEffect, useState } from 'react';
import { getDevices, deleteDevice } from '../services/api';

export default function DeviceList({ onEdit }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDevices = async () => {
        try {
            const data = await getDevices();
            setDevices(data);
        } catch (err) {
            setError('Failed to load devices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;
        try {
            await deleteDevice(id);
            setDevices(devices.filter(d => d.id !== id));
        } catch (err) {
            console.error(err);
            alert(`Failed to delete device: ${err.response?.data?.detail || err.message}`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h2>Device List</h2>
            <button onClick={fetchDevices}>Refresh</button>
            <table border="1" cellPadding="5" style={{ width: '100%', marginTop: '10px' }}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>IP Address</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {devices.map(device => (
                        <tr key={device.id}>
                            <td>{device.id}</td>
                            <td>{device.name}</td>
                            <td>{device.type}</td>
                            <td>{device.status}</td>
                            <td>{device.ip_address}</td>
                            <td>
                                <button onClick={() => handleDelete(device.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

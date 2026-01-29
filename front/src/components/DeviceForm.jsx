import { useState } from 'react';
import { createDevice } from '../services/api';

export default function DeviceForm({ onDeviceAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        type: 'sensor',
        status: 'active',
        ip_address: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createDevice(formData);
            setFormData({ name: '', type: 'sensor', status: 'active', ip_address: '' });
            if (onDeviceAdded) onDeviceAdded();
            alert('Device added successfully');
        } catch (err) {
            const message = err.response?.data?.detail || 'Failed to add device';
            alert(message);
        }
    };

    return (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ccc' }}>
            <h3>Add New Device</h3>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '10px' }}>
                    <label>Name: </label>
                    <input name="name" value={formData.name} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Type: </label>
                    <select name="type" value={formData.type} onChange={handleChange}>
                        <option value="sensor">Sensor</option>
                        <option value="actuator">Actuator</option>
                        <option value="gateway">Gateway</option>
                    </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>Status: </label>
                    <select name="status" value={formData.status} onChange={handleChange}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                    </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label>IP Address: </label>
                    <input name="ip_address" value={formData.ip_address} onChange={handleChange} required />
                </div>
                <button type="submit">Add Device</button>
            </form>
        </div>
    );
}

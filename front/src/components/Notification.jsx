import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:8002';

export default function Notification() {
    const [notifications, setNotifications] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const newSocket = io(SOCKET_URL, {
            transports: ['websocket', 'polling']
        });

        newSocket.on('connect', () => {
            console.log('Connected to Monitoring Service');
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Monitoring Service');
            setIsConnected(false);
        });

        newSocket.on('device_event', (data) => {
            console.log('Event received:', data);
            addNotification(data);
        });

        return () => newSocket.close();
    }, []);

    const addNotification = (data) => {
        const id = Date.now();
        const message = `Device ${data.name || data.id} : ${data.status || 'Updated'}`;
        setNotifications(prev => [...prev, { id, message, type: 'info' }]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 5000);
    };

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {/* Connection Status Debugger */}
            <div style={{
                padding: '5px 10px',
                backgroundColor: isConnected ? '#4CAF50' : '#F44336',
                color: 'white',
                borderRadius: '4px',
                fontSize: '12px',
                textAlign: 'center'
            }}>
                {isConnected ? '🟢 WS Connected' : '🔴 WS Disconnected'}
            </div>

            {notifications.map(n => (
                <div key={n.id} style={{
                    padding: '15px',
                    backgroundColor: '#333',
                    color: '#fff',
                    borderRadius: '5px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    minWidth: '250px',
                    animation: 'fadeIn 0.3s ease-in'
                }}>
                    <strong>📢 Alert</strong>
                    <div>{n.message}</div>
                </div>
            ))}
        </div>
    );
}

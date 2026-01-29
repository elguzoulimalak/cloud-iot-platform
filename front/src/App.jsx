import { useState, useEffect } from 'react'
import './App.css'
import DeviceList from './components/DeviceList'
import DeviceForm from './components/DeviceForm'
import Notification from './components/Notification'
import Login from './components/Login'

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginKey, setLoginKey] = useState(0);

  if (!token) {
    return <Login key={loginKey} onLogin={setToken} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setLoginKey(old => old + 1); // Force remount of Login component
  };

  const handleDeviceAdded = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="App">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <h1>IoT Device Management</h1>
        <button onClick={handleLogout} style={{ backgroundColor: '#cc0000', padding: '5px 10px' }}>Logout</button>
      </div>

      <Notification />
      <div style={{ display: 'flex', gap: '2rem', padding: '20px' }}>
        <div style={{ flex: 1 }}>
          <DeviceForm onDeviceAdded={handleDeviceAdded} />
        </div>
        <div style={{ flex: 2 }}>
          <DeviceList key={refreshKey} />
        </div>
      </div>
    </div>
  )
}

export default App

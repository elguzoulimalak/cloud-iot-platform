import { useState } from 'react'
import './App.css'
import DeviceList from './components/DeviceList'
import DeviceForm from './components/DeviceForm'
import Notification from './components/Notification'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import { Plus } from 'phosphor-react'

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginKey, setLoginKey] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!token) {
    return <Login key={loginKey} onLogin={setToken} />;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setLoginKey(old => old + 1);
  };

  const handleDeviceAdded = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="app-container">
      <Sidebar onLogout={handleLogout} activeTab={activeTab} onNavigate={setActiveTab} />

      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 style={{ fontSize: '1.8rem', margin: 0, textTransform: 'capitalize' }}>{activeTab}</h1>
            <p style={{ margin: '5px 0 0', color: 'var(--text-muted)' }}>Manage your IoT Network</p>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            {/* Could put User Profile here */}
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-panel" style={{ padding: '20px' }}>
              <h3 style={{ marginTop: 0 }}>Register New Device</h3>
              <DeviceForm onDeviceAdded={handleDeviceAdded} />
            </div>
            <DeviceList refreshTrigger={refreshKey} />
          </div>
        )}

        {activeTab === 'devices' && (
          <DeviceList refreshTrigger={refreshKey} />
        )}

        {(activeTab === 'analytics' || activeTab === 'settings') && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <h3>Coming Soon</h3>
            <p>This feature is under development.</p>
          </div>
        )}

        <Notification />
      </main>
    </div>
  )
}

export default App

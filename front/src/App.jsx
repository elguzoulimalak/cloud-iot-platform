import { useState, useEffect } from 'react'
import DeviceList from './components/DeviceList'
import Notification from './components/Notification'
import Login from './components/Login'
import Sidebar from './components/Sidebar'
import EnvironmentGraph from './components/Dashboard/EnvironmentGraph'
import TemperaturePage from './components/TemperaturePage'
import { io } from 'socket.io-client'
import SettingsPage from './components/SettingsPage'
import AnalyticsPage from './components/AnalyticsPage'

function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loginKey, setLoginKey] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [telemetryMap, setTelemetryMap] = useState({});
  const [envHistory, setEnvHistory] = useState([]);

  useEffect(() => {
    if (!token) return;
    const socket = io('http://localhost:8080');
    socket.on('device_event', (data) => {
      setTelemetryMap(prev => ({ ...prev, [data.device_id]: data }));
    });
    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const response = await fetch("https://api.open-meteo.com/v1/forecast?latitude=34.03&longitude=-5.00&current=temperature_2m,relative_humidity_2m");
        const data = await response.json();
        if (data.current) {
          const now = new Date();
          const point = {
            time: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m
          };
          setEnvHistory(prev => [...prev, point].slice(-20));
        }
      } catch (error) { console.error(error); }
    };
    fetchWeather();
    const interval = setInterval(fetchWeather, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!token) return <Login key={loginKey} onLogin={setToken} />;

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setLoginKey(old => old + 1);
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-sky-500/30">
      <Sidebar onLogout={handleLogout} activeTab={activeTab} onNavigate={setActiveTab} />

      <main style={{ flex: 1, padding: '40px 60px', overflowY: 'auto', height: '100vh' }}>
        <header style={{ marginBottom: '48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: 0, letterSpacing: '-1.5px', textTransform: 'capitalize' }}>
              {activeTab}
            </h1>
            <p style={{ margin: '8px 0 0', color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.1rem' }}>
              Operational integrity for your distributed edge network.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="status-badge status-active">SYSTEM NOMINAL</div>
          </div>
        </header>

        <div className="fade-in">
          {activeTab === 'dashboard' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
              <EnvironmentGraph data={envHistory} />
              <DeviceList refreshTrigger={refreshKey} telemetryMap={telemetryMap} />
            </div>
          )}

          {activeTab === 'devices' && (
            <DeviceList refreshTrigger={refreshKey} telemetryMap={telemetryMap} />
          )}

          {activeTab === 'temperature' && (
            <TemperaturePage deviceData={envHistory} />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsPage telemetryMap={telemetryMap} />
          )}

          {activeTab === 'settings' && (
            <SettingsPage />
          )}
        </div>

        <Notification />
      </main>

      <style>{`
        .flex { display: flex; }
        .min-h-screen { min-height: 100vh; }
      `}</style>
    </div>
  )
}

export default App

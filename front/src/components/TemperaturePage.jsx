import React, { useState, useEffect } from 'react';
import { MagnifyingGlass, CloudSun } from 'phosphor-react';
import EnvironmentGraph from './Dashboard/EnvironmentGraph';

export default function TemperaturePage({ deviceData }) {
    const [city, setCity] = useState('');
    const [searchedCity, setSearchedCity] = useState(null);
    const [cityWeather, setCityWeather] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!city) return;
        setLoading(true);
        setError(null);
        setCityWeather(null);
        setSearchedCity(null);

        try {
            // 1. Geocoding
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
            const geoData = await geoRes.json();

            if (!geoData.results || geoData.results.length === 0) {
                setError("City not found");
                setLoading(false);
                return;
            }

            const { latitude, longitude, name, country } = geoData.results[0];
            setSearchedCity(`${name}, ${country}`);

            // 2. Weather
            const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`);
            const weatherData = await weatherRes.json();

            setCityWeather({
                temp: weatherData.current.temperature_2m,
                humidity: weatherData.current.relative_humidity_2m,
                unit: weatherData.current_units.temperature_2m
            });
        } catch (err) {
            setError("Failed to fetch weather data");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* 1. Device Graph Section */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <CloudSun size={24} color="#f59e0b" />
                    My Devices (Real-time)
                </h3>
                {/* Reuse the Dashboard Graph */}
                <EnvironmentGraph data={deviceData} />
            </div>

            {/* 2. City Comparison Section */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ marginTop: 0 }}>Check Other Cities</h3>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type="text"
                        placeholder="Enter location (e.g. Paris, Tokyo)"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        style={{
                            flex: 1,
                            padding: '10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)',
                            background: 'rgba(0,0,0,0.2)',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            border: 'none',
                            padding: '0 20px',
                            borderRadius: '8px',
                            cursor: loading ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <MagnifyingGlass size={20} />
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {error && <div style={{ color: '#ef4444', padding: '10px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>{error}</div>}

                {cityWeather && (
                    <div className="fade-in" style={{
                        background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(147,51,234,0.1) 100%)',
                        padding: '20px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{searchedCity}</h2>
                            <p style={{ margin: '5px 0 0', color: 'var(--text-muted)' }}>Current Weather</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                {cityWeather.temp} {cityWeather.unit}
                            </div>
                            <div style={{ color: '#3b82f6' }}>
                                Humidity: {cityWeather.humidity}%
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function EnvironmentGraph({ data }) {
    return (
        <div className="glass-panel fade-in" style={{ padding: '20px', height: '300px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 20px 0' }}>Environmental Conditions (Live)</h3>
            <div style={{ flex: 1, width: '100%', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'rgba(26, 26, 46, 0.9)', border: '1px solid var(--border-glass)', borderRadius: '8px', backdropFilter: 'blur(5px)' }}
                            itemStyle={{ color: '#fff' }}
                        />
                        <Legend />
                        <Area
                            type="monotone"
                            dataKey="temperature"
                            stroke="#f59e0b"
                            fillOpacity={1}
                            fill="url(#colorTemp)"
                            name="Temperature (°C)"
                        />
                        <Area
                            type="monotone"
                            dataKey="humidity"
                            stroke="#3b82f6"
                            fillOpacity={1}
                            fill="url(#colorHum)"
                            name="Humidity (%)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

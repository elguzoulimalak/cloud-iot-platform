import React, { useEffect, useState } from 'react';
import { getDevices } from '../services/api';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { ChartPieSlice, ChartBar, Warning, CheckCircle, Cpu, HardDrive } from 'phosphor-react';

export default function AnalyticsPage({ telemetryMap }) {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getDevices();
                setDevices(data);
            } catch (err) {
                console.error("Failed to fetch devices for analytics");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Process Data
    const deviceData = devices.map(d => {
        const tel = telemetryMap[d.id] || telemetryMap[d.name];
        const status = tel?.status || d.status || 'offline';
        const cpu = tel?.sensor_readings?.cpu_usage || 0;
        const ram = tel?.sensor_readings?.ram_usage || 0;
        const temp = tel?.sensor_readings?.temperature || 0;

        return {
            name: d.name,
            status: status.toLowerCase(),
            cpu: cpu,
            ram: ram,
            temp: temp
        };
    });

    const statusCounts = deviceData.reduce((acc, curr) => {
        const s = curr.status === 'active' ? 'online' : curr.status;
        acc[s] = (acc[s] || 0) + 1;
        return acc;
    }, {});

    const pieData = [
        { name: 'Online', value: statusCounts['online'] || 0, color: 'var(--success)' },
        { name: 'Offline', value: statusCounts['offline'] || 0, color: 'var(--danger)' },
        { name: 'Maintenance', value: statusCounts['maintenance'] || 0, color: 'var(--warning)' }
    ].filter(d => d.value > 0);

    const barData = [...deviceData]
        .sort((a, b) => b.cpu - a.cpu)
        .slice(0, 6);

    if (loading) return <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '50px' }}>Loading analytics...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '40px' }}>

            {/* KPI Cards */}
            <div className="grid-layout" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
                <KPICard 
                    icon={<ChartPieSlice size={28} weight="duotone" />} 
                    label="Total Fleet" 
                    value={devices.length} 
                    color="var(--primary)" 
                />
                <KPICard 
                    icon={<CheckCircle size={28} weight="duotone" />} 
                    label="Operational" 
                    value={statusCounts['online'] || 0} 
                    color="var(--success)" 
                />
                <KPICard 
                    icon={<Warning size={28} weight="duotone" />} 
                    label="Attention Required" 
                    value={(statusCounts['offline'] || 0) + (statusCounts['maintenance'] || 0)} 
                    color="var(--warning)" 
                />
                <KPICard 
                    icon={<Cpu size={28} weight="duotone" />} 
                    label="Avg CPU Load" 
                    value={`${(deviceData.reduce((a, b) => a + b.cpu, 0) / (devices.length || 1)).toFixed(1)}%`} 
                    color="var(--accent)" 
                />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '32px' }}>
                {/* Status Distribution */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '32px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ChartPieSlice size={24} color="var(--primary)" /> Network Health
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%" cy="50%"
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ 
                                    background: 'var(--bg-glass-heavy)', 
                                    border: '1px solid var(--border-glass)', 
                                    borderRadius: '16px',
                                    backdropFilter: 'blur(20px)'
                                }}
                            />
                            <Legend iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Resource Consumption */}
                <div className="glass-panel" style={{ padding: '32px' }}>
                    <h3 style={{ marginTop: 0, marginBottom: '32px', fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <ChartBar size={24} color="var(--accent)" /> Peak Resource Usage
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" stroke="var(--text-muted)" fontSize={12} width={100} axisLine={false} tickLine={false} />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{ 
                                    background: 'var(--bg-glass-heavy)', 
                                    border: '1px solid var(--border-glass)', 
                                    borderRadius: '12px' 
                                }}
                            />
                            <Bar dataKey="cpu" name="CPU %" fill="var(--danger)" radius={[0, 10, 10, 0]} barSize={12} />
                            <Bar dataKey="ram" name="RAM %" fill="var(--primary)" radius={[0, 10, 10, 0]} barSize={12} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function KPICard({ icon, label, value, color }) {
    return (
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ 
                background: `${color}15`, 
                padding: '16px', 
                borderRadius: '16px', 
                color: color,
                border: `1px solid ${color}30`
            }}>
                {icon}
            </div>
            <div>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                <h3 style={{ margin: '4px 0 0', fontSize: '1.8rem', fontWeight: 800 }}>{value}</h3>
            </div>
        </div>
    );
}

import { useState } from 'react';
import axios from 'axios';
import { FingerprintSimple, User, Envelope, Lock, ArrowRight } from 'phosphor-react';

const SIGNING_URL = 'http://localhost:8003/users';

export default function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);

    const [successMsg, setSuccessMsg] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        try {
            if (isLogin) {
                // Login
                const response = await axios.post(`${SIGNING_URL}/auth`, {
                    email: formData.email,
                    password: formData.password
                });
                const token = response.data.token;
                localStorage.setItem('token', token);
                onLogin(token);
            } else {
                // Register
                await axios.post(`${SIGNING_URL}/add`, {
                    email: formData.email,
                    password: formData.password
                });

                // Switch to login, but keep the email and clear password
                setIsLogin(true);
                setFormData(prev => ({ ...prev, password: '' }));
                setSuccessMsg('Registration successful! Please sign in.');
            }
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            setError(detail ? JSON.stringify(detail) : 'Authentication failed');
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at 50% 50%, #1e293b 0%, #0f172a 100%)'
        }}>
            <div className="glass-panel fade-in" style={{ width: '400px', padding: '40px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px', color: '#3b82f6' }}>
                    <FingerprintSimple size={48} weight="duotone" />
                    <h2 style={{ color: 'white', margin: '10px 0 0' }}>IoT Secure Access</h2>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0' }}>
                        {isLogin ? 'Welcome back, Admin' : 'Create new account'}
                    </p>
                </div>

                {successMsg && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {successMsg}
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        padding: '10px',
                        borderRadius: '8px',
                        marginBottom: '20px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    {/* Name field (Visual only for now since backend register only takes email/pass) */}
                    {!isLogin && (
                        <div className="input-group">
                            <User size={20} color="var(--text-muted)" />
                            <input
                                type="text"
                                placeholder="Full Name (Optional)"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <Envelope size={20} color="var(--text-muted)" />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <Lock size={20} color="var(--text-muted)" />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight weight="bold" />
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span
                        style={{ color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}
                        onClick={() => setIsLogin(!isLogin)}
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </span>
                </div>
            </div>

            <style>{`
                .input-group {
                    display: flex;
                    alignItems: center;
                    gap: 10px;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--border-glass);
                    padding: 10px 15px;
                    border-radius: 8px;
                    transition: border-color 0.2s;
                }
                .input-group:focus-within {
                    border-color: #3b82f6;
                }
                .input-group input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    outline: none;
                    font-size: 1rem;
                }
            `}</style>
        </div>
    );
}

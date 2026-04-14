import { useState } from 'react';
import axios from 'axios';
import { FingerprintSimple, Envelope, Lock, ArrowRight, Sparkle } from 'phosphor-react';

const SIGNING_URL = 'http://localhost:8080/auth';

export default function Login({ onLogin }) {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setIsLoading(true);
        try {
            if (isLogin) {
                const response = await axios.post(`${SIGNING_URL}/auth`, {
                    email: formData.email,
                    password: formData.password
                });
                const token = response.data.token;
                localStorage.setItem('token', token);
                onLogin(token);
            } else {
                await axios.post(`${SIGNING_URL}/add`, {
                    email: formData.email,
                    password: formData.password
                });
                setIsLogin(true);
                setFormData(prev => ({ ...prev, password: '' }));
                setSuccessMsg('Registration successful! Please sign in.');
            }
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            setError(detail ? (typeof detail === 'string' ? detail : JSON.stringify(detail)) : 'Authentication failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'radial-gradient(circle at top right, #1e293b, #020617)',
            overflow: 'hidden',
            position: 'relative'
        }}>
            {/* Animated Background Elements */}
            <div style={{
                position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px',
                background: 'var(--primary-glow)', filter: 'blur(100px)', borderRadius: '50%', opacity: 0.3
            }}></div>
            <div style={{
                position: 'absolute', bottom: '10%', right: '10%', width: '400px', height: '400px',
                background: 'rgba(129, 140, 248, 0.2)', filter: 'blur(120px)', borderRadius: '50%', opacity: 0.2
            }}></div>

            <div className="glass-panel fade-in" style={{
                width: '440px',
                padding: '48px',
                position: 'relative',
                zIndex: 1,
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <div style={{
                        display: 'inline-flex',
                        padding: '16px',
                        borderRadius: '24px',
                        background: 'linear-gradient(135deg, var(--bg-dark), rgba(56, 189, 248, 0.1))',
                        marginBottom: '24px',
                        border: '1px solid var(--border-glass)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                    }}>
                        <FingerprintSimple size={40} weight="duotone" color="var(--primary)" />
                    </div>
                    <h2 style={{
                        color: 'white',
                        fontSize: '2rem',
                        fontWeight: 800,
                        letterSpacing: '-1px',
                        margin: '0 0 8px'
                    }}>
                        Cloud<span style={{ color: 'var(--primary)' }}>IoT</span>
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 500 }}>
                        {isLogin ? 'Secure Administrative Access' : 'Create an operator account'}
                    </p>
                </div>

                {successMsg && (
                    <div style={{
                        background: 'rgba(16, 185, 129, 0.05)',
                        border: '1px solid var(--success)',
                        color: 'var(--success)',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textAlign: 'center',
                        display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center'
                    }}>
                        <Sparkle weight="fill" /> {successMsg}
                    </div>
                )}

                {error && (
                    <div style={{
                        background: 'rgba(244, 63, 94, 0.05)',
                        border: '1px solid var(--danger)',
                        color: 'var(--danger)',
                        padding: '12px',
                        borderRadius: '12px',
                        marginBottom: '24px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="input-field">
                        <Envelope size={20} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="input-field">
                        <Lock size={20} />
                        <input
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={isLoading}
                        style={{
                            marginTop: '12px',
                            height: '52px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '12px'
                        }}
                    >
                        {isLoading ? 'Verifying...' : (isLogin ? 'Sign In' : 'Create Account')}
                        {!isLoading && <ArrowRight weight="bold" />}
                    </button>
                </form>

                <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '0.95rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                    </span>
                    <button
                        type="button"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            fontWeight: 700,
                            padding: '4px 8px',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError(null);
                        }}
                    >
                        {isLogin ? 'Register' : 'Login'}
                    </button>
                </div>
            </div>

            <style>{`
                .input-field {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(15, 23, 42, 0.5);
                    border: 1px solid var(--border-glass);
                    padding: 14px 20px;
                    border-radius: 14px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    color: var(--text-muted);
                }
                .input-field:focus-within {
                    border-color: var(--primary);
                    background: rgba(15, 23, 42, 0.8);
                    color: var(--primary);
                    box-shadow: 0 0 0 4px rgba(56, 189, 248, 0.1);
                }
                .input-field input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    outline: none;
                    font-size: 1rem;
                    font-weight: 500;
                }
                .input-field input::placeholder {
                    color: #475569;
                }
            `}</style>
        </div>
    );
}

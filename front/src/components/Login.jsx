import { useState } from 'react';
import axios from 'axios';

const SIGNING_URL = 'http://localhost:8003/users';

export default function Login({ onLogin }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (isRegistering) {
                // Register
                await axios.post(`${SIGNING_URL}/add`, { email, password });
                setSuccess('Registration successful! Please login.');
                setIsRegistering(false);
                setEmail('');
                setPassword('');
            } else {
                // Login
                const response = await axios.post(`${SIGNING_URL}/auth`, { email, password });
                const token = response.data.token;
                localStorage.setItem('token', token);
                onLogin(token);
            }
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            if (Array.isArray(detail)) {
                setError(detail.map(d => `${d.msg} (${d.loc.join('.')})`).join(', '));
            } else if (typeof detail === 'object') {
                setError(JSON.stringify(detail));
            } else {
                setError(detail || 'Authentication failed');
            }
        }
    };

    const toggleMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setSuccess('');
        setEmail('');
        setPassword('');
    };

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            height: '100vh', backgroundColor: '#1a1a1a', color: 'white'
        }}>
            <div style={{ padding: '2rem', border: '1px solid #333', borderRadius: '8px', minWidth: '300px' }}>
                <h2>{isRegistering ? 'Register' : 'Login'}</h2>
                {error && <div style={{ color: 'red', marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>{error}</div>}
                {success && <div style={{ color: 'green', marginBottom: '1rem' }}>{success}</div>}

                {/* Key forces the form to be destroyed and recreated when switching modes */}
                <form key={isRegistering ? 'register' : 'login'} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                        style={{ padding: '0.5rem' }}
                        autoFocus
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        style={{ padding: '0.5rem' }}
                    />
                    <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>
                        {isRegistering ? 'Sign Up' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <button
                        onClick={toggleMode}
                        style={{ background: 'none', border: 'none', color: '#646cff', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                        {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                    </button>
                </div>
            </div>
        </div>
    );
}

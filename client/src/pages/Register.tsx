import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { ApiError, User } from '../types';
import { AxiosError } from 'axios';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const res = await api.post<{ token: string; user: User }>('/api/auth/register', {
        name,
        email,
        password,
      });
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      const e = err as AxiosError<ApiError>;
      setError(e.response?.data?.error?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Create Account</h1>
        <p className="text-muted mt-1">Start tracking your finances</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
          className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-white placeholder-muted focus:outline-none focus:border-primary"
        />

        {error && <p className="text-danger text-sm">{error}</p>}

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-primary text-white font-semibold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create Account'}
        </button>
      </div>

      <p className="text-center text-muted mt-6 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-primary font-medium">
          Sign In
        </Link>
      </p>
    </div>
  );
}

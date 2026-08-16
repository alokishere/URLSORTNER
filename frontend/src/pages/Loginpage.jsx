import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Link2 } from 'lucide-react';
import instance from '../axios';
import { useNavigate, Link } from 'react-router-dom';

const Loginpage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const tempErrors = {};

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Valid email is required';
    }

    if (!password || password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    instance
      .post('/user/login', { email, password })
      .then((response) => {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
      })
      .catch((error) => {
        console.error('Login failed:', error.response ? error.response.data : error.message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] px-4 py-12 text-[#252823]">
      <div className="mx-auto grid max-w-6xl overflow-hidden rounded-[2rem] border border-[#C7D3C0] bg-[#F7F4ED] shadow-xl shadow-[#8FA28A]/10 lg:grid-cols-2">
        <div className="relative flex flex-col justify-between overflow-hidden bg-[#8FA28A] p-8 md:p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%)]" />

          <div className="relative z-10">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F7F4ED]/20 backdrop-blur-sm">
              <Link2 className="h-7 w-7 text-[#F7F4ED]" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#F7F4ED]">Welcome back</p>
            <h1 className="mt-6 text-4xl font-black leading-tight text-[#F7F4ED] md:text-5xl">
              Simplify every share.
            </h1>
            <p className="mt-4 max-w-md text-base text-[#F7F4ED]/80">
              Manage short links, track clicks, and keep your content flowing with a smarter URL workflow.
            </p>
          </div>

          <div className="relative z-10 mt-8 rounded-2xl border border-[#F7F4ED]/25 bg-[#F7F4ED]/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-[#F7F4ED]">Trusted by creators and teams</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex -space-x-2">
                {['A', 'J', 'K'].map((letter, idx) => (
                  <div
                    key={letter}
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#F7F4ED] text-xs font-bold text-[#252823] ${idx === 0 ? 'bg-[#C8A96B]' : idx === 1 ? 'bg-[#C7D3C0]' : 'bg-[#8FA28A]'}`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              <p className="text-sm text-[#F7F4ED]">12k+ active users</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#F7F4ED] p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-[#252823]">Sign in</h2>
              <p className="mt-2 text-sm text-[#5F655D]">Continue to your dashboard</p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-[#252823]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-5 w-5 text-[#5F655D]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full rounded-xl border bg-[#F7F4ED] py-3 pl-11 pr-4 text-[#252823] outline-none transition ${errors.email ? 'border-[#C8A96B]' : 'border-[#C7D3C0] focus:border-[#8FA28A]'}`}
                  />
                </div>
                {errors.email && <p className="mt-2 text-sm text-[#5F655D]">{errors.email}</p>}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#252823]">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-[#5F655D]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border bg-[#F7F4ED] py-3 pl-11 pr-12 text-[#252823] outline-none transition ${errors.password ? 'border-[#C8A96B]' : 'border-[#C7D3C0] focus:border-[#8FA28A]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-[#5F655D] transition hover:text-[#252823]"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-2 text-sm text-[#5F655D]">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C8A96B] px-4 py-3 font-semibold text-[#252823] shadow-lg shadow-[#C8A96B]/20 transition hover:bg-[#b9984f] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isLoading ? 'Loading...' : 'Sign in'}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[#5F655D]">
              Don’t have an account?{' '}
              <Link to="/register" className="font-semibold text-[#8FA28A] hover:text-[#74876f]">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loginpage;

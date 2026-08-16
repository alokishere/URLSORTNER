import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../axios';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const tempErrors = {};

    if (!fullName || fullName.trim().length < 2) {
      tempErrors.fullName = 'Full name is required';
    }

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
      .post('/user/register', { fullName, email, password })
      .then((response) => {
        if (response.data?.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
          navigate('/dashboard');
          return;
        }
        navigate('/login');
      })
      .catch((error) => {
        console.error('Registration failed:', error.response ? error.response.data : error.message);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] px-4 py-12 text-[#252823]">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] border border-[#C7D3C0] bg-[#F7F4ED] shadow-xl shadow-[#8FA28A]/10">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="relative overflow-hidden bg-[#8FA28A] p-8 md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.2),transparent_30%)]" />
            <div className="relative z-10">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#F7F4ED]/25 bg-[#F7F4ED]/10 px-3 py-1.5 text-sm text-[#F7F4ED]">
                <Sparkles className="h-4 w-4 text-[#C8A96B]" />
                Grow your reach
              </div>

              <h1 className="text-4xl font-black leading-tight text-[#F7F4ED] md:text-5xl">
                Create smarter links,
                <span className="mt-2 block text-[#F7F4ED]/90">faster.</span>
              </h1>

              <p className="mt-5 max-w-md text-base text-[#F7F4ED]/80">
                Organize your URLs, track engagement, and build clean branded experiences for every campaign.
              </p>

              <div className="mt-10 space-y-4 text-sm text-[#F7F4ED]/90">
                <div className="flex items-center gap-3 rounded-2xl border border-[#F7F4ED]/15 bg-[#F7F4ED]/10 p-3 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8A96B] text-[#252823] font-bold">1</div>
                  <span>Make a branded short link in seconds.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#F7F4ED]/15 bg-[#F7F4ED]/10 p-3 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8A96B] text-[#252823] font-bold">2</div>
                  <span>Monitor real-time analytics and clicks.</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-[#F7F4ED]/15 bg-[#F7F4ED]/10 p-3 backdrop-blur-sm">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C8A96B] text-[#252823] font-bold">3</div>
                  <span>Share confidently across every channel.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-[#F7F4ED] p-6 md:p-10">
            <div className="w-full max-w-md">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-[#252823]">Create account</h2>
                <p className="mt-2 text-sm text-[#5F655D]">Get started with your free workspace</p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#252823]">Full name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-5 w-5 text-[#5F655D]" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="John Doe"
                      className={`w-full rounded-xl border bg-[#F7F4ED] py-3 pl-11 pr-4 text-[#252823] outline-none transition ${errors.fullName ? 'border-[#C8A96B]' : 'border-[#C7D3C0] focus:border-[#8FA28A]'}`}
                    />
                  </div>
                  {errors.fullName && <p className="mt-2 text-sm text-[#5F655D]">{errors.fullName}</p>}
                </div>

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
                      placeholder="Create a strong password"
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
                  {isLoading ? 'Creating account...' : 'Create account'}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#5F655D]">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-[#8FA28A] hover:text-[#74876f]">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
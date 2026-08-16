import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Link2,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Link2,
      title: 'Smart URL shortening',
      description: 'Turn long links into clean, branded short URLs in seconds.',
    },
    {
      icon: BarChart3,
      title: 'Live analytics',
      description: 'Track clicks and understand what is driving engagement.',
    },
    {
      icon: ShieldCheck,
      title: 'Secure by default',
      description: 'Keep your links protected with a clean and reliable workflow.',
    },
  ];

  return (
    <div className="min-h-screen overflow-hidden bg-[#F7F4ED] text-[#252823]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <header className="glass-panel sticky top-4 z-20 mb-10 rounded-full px-5 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8FA28A] shadow-lg shadow-[#8FA28A]/25">
                <Link2 className="h-5 w-5 text-[#F7F4ED]" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-[0.2em] text-[#5F655D] uppercase">URLSortner</p>
              </div>
            </div>

            <div className="hidden items-center gap-6 text-sm text-[#5F655D] md:flex">
              <span>Features</span>
              <span>Analytics</span>
              <span>Pricing</span>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="rounded-full border border-[#8FA28A] bg-[#F7F4ED] px-4 py-2 text-sm font-medium text-[#252823] transition hover:bg-[#C7D3C0]"
            >
              Login
            </button>
          </div>
        </header>

        <main className="relative">
          <div className="absolute inset-0 -z-10 grid-pattern opacity-40" />

          <section className="grid items-center gap-10 pb-18 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:pt-16">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#8FA28A]/40 bg-[#C7D3C0] px-3 py-1 text-sm text-[#252823]">
                <Sparkles className="h-4 w-4 text-[#C8A96B]" />
                Short links with more impact
              </div>

              <h1 className="max-w-xl text-5xl font-black leading-tight tracking-tight text-[#252823] md:text-6xl">
                Short your long URLs into <span className="text-gradient">memorable</span> links.
              </h1>

              <p className="mt-6 max-w-lg text-lg text-[#5F655D]">
                Create short, memorable links that are easy to share, track, and manage from one clean dashboard.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8FA28A] px-6 py-3.5 text-base font-semibold text-[#F7F4ED] shadow-lg shadow-[#8FA28A]/20 transition hover:bg-[#7f9980]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  onClick={() => navigate('/register')}
                  className="inline-flex items-center justify-center rounded-full border border-[#8FA28A] bg-[#F7F4ED] px-6 py-3.5 text-base font-semibold text-[#252823] transition hover:bg-[#C7D3C0]"
                >
                  Create account
                </button>
              </div>

              <div className="mt-10 flex flex-wrap gap-6 text-sm text-[#5F655D]">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#C8A96B]" />
                  Instant generation
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#8FA28A]" />
                  Trusted links
                </div>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end">
              <div className="float-slow glass-panel relative w-full max-w-md rounded-[2rem] p-5 shadow-xl shadow-[#8FA28A]/10">
                <div className="absolute -left-4 top-14 h-20 w-20 rounded-full bg-[#C8A96B]/25 blur-2xl" />
                <div className="absolute -right-5 bottom-10 h-24 w-24 rounded-full bg-[#8FA28A]/20 blur-2xl" />

                <div className="relative rounded-[1.5rem] border border-[#C7D3C0] bg-[#F7F4ED] p-5">
                  <div className="mb-5 flex items-center justify-between text-[#5F655D]">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <div className="h-2.5 w-2.5 rounded-full bg-[#8FA28A]" />
                      Live URL analytics
                    </div>
                    <span className="rounded-full border border-[#C7D3C0] bg-[#C7D3C0] px-2 py-1 text-xs text-[#252823]">+18.4%</span>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-2xl border border-[#C7D3C0] bg-[#F7F4ED] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#5F655D]">Original</p>
                      <p className="mt-2 truncate text-sm text-[#252823]">https://example.com/very-long-product-page-link</p>
                    </div>

                    <div className="rounded-2xl border border-[#8FA28A]/40 bg-[#C7D3C0]/70 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#252823]">Shortened</p>
                      <p className="mt-2 text-lg font-semibold text-[#252823]">u.sort/7Rk2mA</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-2">
                      <div className="rounded-2xl border border-[#C7D3C0] bg-[#F7F4ED] p-3">
                        <p className="text-xs text-[#5F655D]">Clicks</p>
                        <p className="mt-2 text-2xl font-bold text-[#252823]">2.4k</p>
                      </div>
                      <div className="rounded-2xl border border-[#C7D3C0] bg-[#F7F4ED] p-3">
                        <p className="text-xs text-[#5F655D]">CTR</p>
                        <p className="mt-2 text-2xl font-bold text-[#252823]">68%</p>
                      </div>
                      <div className="rounded-2xl border border-[#C7D3C0] bg-[#F7F4ED] p-3">
                        <p className="text-xs text-[#5F655D]">Reach</p>
                        <p className="mt-2 text-2xl font-bold text-[#252823]">91k</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 pb-16 md:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-panel rounded-3xl p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#C7D3C0] text-[#252823]">
                  <Icon className="h-5 w-5 text-[#C8A96B]" />
                </div>
                <h3 className="text-xl font-bold text-[#252823]">{title}</h3>
                <p className="mt-3 text-[#5F655D]">{description}</p>
              </div>
            ))}
          </section>
        </main>
      </div>
    </div>
  );
};

export default LandingPage;
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, Link2, Sparkles } from 'lucide-react';
import instance from '../axios';

const CreateSortUrl = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    const url = e.target.url.value;

    setLoading(true);

    instance
      .post('/urls/', { url })
      .then((res) => {
        setResult(res.data);
        e.target.reset();
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#F7F4ED] px-4 py-8 text-[#252823] md:px-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#8FA28A]/40 bg-[#C7D3C0] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#252823]">
              <Sparkles className="h-3.5 w-3.5 text-[#C8A96B]" />
              URL tool
            </div>
            <h1 className="text-4xl font-black tracking-tight text-[#252823] md:text-5xl">Create short URL</h1>
            <p className="mt-2 text-[#5F655D]">Turn your long URL into a clean, shareable link.</p>
          </div>

          <button
            onClick={() => (window.location.href = '/dashboard')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#8FA28A] bg-[#F7F4ED] px-4 py-2.5 font-medium text-[#252823] transition hover:bg-[#C7D3C0]"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </button>
        </header>

        <div className="glass-panel rounded-[2rem] p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="url" className="mb-3 block text-lg font-semibold text-[#252823]">
                Enter the long URL
              </label>
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Link2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#5F655D]" />
                  <input
                    type="url"
                    id="url"
                    name="url"
                    required
                    placeholder="https://example.com/very-long-url"
                    className="w-full rounded-2xl border border-[#C7D3C0] bg-[#F7F4ED] py-3 pl-12 pr-4 text-[#252823] outline-none transition focus:border-[#8FA28A]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-[#C8A96B] px-6 py-3 font-semibold text-[#252823] shadow-lg shadow-[#C8A96B]/20 transition hover:bg-[#b9984f] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Creating...' : 'Shorten'}
                </button>
              </div>
            </div>
          </form>

          {result && (
            <div className="mt-8 rounded-[1.5rem] border border-[#8FA28A]/40 bg-[#C7D3C0]/50 p-5 md:p-6">
              <div className="mb-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-[#8FA28A]" />
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#252823]">Short URL Created</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <input
                  value={result.url}
                  readOnly
                  className="flex-1 rounded-2xl border border-[#8FA28A]/40 bg-[#F7F4ED] px-4 py-3 text-[#252823] outline-none"
                />

                <button
                  onClick={() => navigator.clipboard.writeText(result.url)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8FA28A] px-4 py-3 font-semibold text-[#F7F4ED] transition hover:bg-[#7e9380]"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-3 text-sm text-[#5F655D] md:flex-row md:items-center md:justify-between">
                <p>
                  Short ID:
                  <span className="ml-2 font-semibold text-[#252823]">{result.shortID}</span>
                </p>

                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#8FA28A] hover:text-[#74876f]"
                >
                  Open URL →
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateSortUrl;
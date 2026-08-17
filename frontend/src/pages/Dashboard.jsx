import React, { useEffect, useState } from 'react';
import {
  ArrowUpRight,
  BarChart3,
  LogOut,
  Plus,
  Link2,
  TrendingUp,
  ExternalLink,
} from 'lucide-react';
import instance from '../axios';

function Dashboard() {
  const [urls, setUrls] = useState([]);

  useEffect(() => {
    instance
      .get('/urls/')
      .then((res) => {
        setUrls([...res.data].reverse());
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const logoutUser = () => {
    instance
      .post('/user/logout')
      .then(() => {
        localStorage.removeItem('user');
        window.location.href = '/login';
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const totalClicks = urls.reduce((total, url) => total + url.visitHistory.length, 0);
  const activeUrls = urls.filter((url) => url.visitHistory.length > 0).length;

  return (
    <div className="min-h-screen bg-[#F7F4ED] px-4 py-8 text-[#252823] md:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-4xl border border-[#C7D3C0] bg-[#F7F4ED] p-6 shadow-xl shadow-[#8FA28A]/10 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#5F655D]">Overview</p>
            <h1 className="mt-2 text-3xl font-black text-[#252823] md:text-4xl">Dashboard</h1>
            <p className="mt-2 text-[#5F655D]">Manage and track your short URLs.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => logoutUser()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#8FA28A] bg-[#F7F4ED] px-4 py-2.5 font-medium text-[#252823] transition hover:bg-[#C7D3C0]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>

            <button
              onClick={() => (window.location.href = '/create')}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C8A96B] px-4 py-2.5 font-semibold text-[#252823] shadow-lg shadow-[#C8A96B]/20 transition hover:bg-[#b9984f]"
            >
              <Plus className="h-4 w-4" />
              Create Short URL
            </button>
          </div>
        </header>

        <section className="mb-8 grid gap-5 md:grid-cols-3">
          <div className="glass-panel rounded-[1.7rem] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5F655D]">Total URLs</p>
              <div className="rounded-xl bg-[#C7D3C0] p-2 text-[#252823]"><Link2 className="h-4 w-4" /></div>
            </div>
            <h2 className="mt-5 text-4xl font-black text-[#252823]">{urls.length}</h2>
          </div>

          <div className="glass-panel rounded-[1.7rem] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5F655D]">Total Clicks</p>
              <div className="rounded-xl bg-[#C7D3C0] p-2 text-[#252823]"><TrendingUp className="h-4 w-4" /></div>
            </div>
            <h2 className="mt-5 text-4xl font-black text-[#252823]">{totalClicks}</h2>
          </div>

          <div className="glass-panel rounded-[1.7rem] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#5F655D]">Active URLs</p>
              <div className="rounded-xl bg-[#C8A96B]/20 p-2 text-[#252823]"><BarChart3 className="h-4 w-4" /></div>
            </div>
            <h2 className="mt-5 text-4xl font-black text-[#252823]">{activeUrls}</h2>
          </div>
        </section>

        <section className="overflow-hidden rounded-4xl border border-[#C7D3C0] bg-[#F7F4ED] shadow-xl shadow-[#8FA28A]/10">
          <div className="border-b border-[#C7D3C0] px-6 py-5">
            <h2 className="text-xl font-bold text-[#252823]">My Short URLs</h2>
          </div>

          {urls.length === 0 ? (
            <div className="flex min-h-56 flex-col items-center justify-center px-6 py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#C7D3C0] text-[#252823]">
                <Link2 className="h-7 w-7" />
              </div>
              <p className="text-lg font-semibold text-[#252823]">No short URLs found.</p>
              <p className="mt-2 text-[#5F655D]">Create one to start tracking clicks and reach.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#C7D3C0] text-[#252823]">
                  <tr>
                    <th className="px-6 py-4 text-sm font-semibold">Short ID</th>
                    <th className="px-6 py-4 text-sm font-semibold">Short URL</th>
                    <th className="px-6 py-4 text-sm font-semibold">Destination</th>
                    <th className="px-6 py-4 text-sm font-semibold">Clicks</th>
                    <th className="px-6 py-4 text-sm font-semibold">Created</th>
                    <th className="px-6 py-4 text-sm font-semibold">Action</th>
                    <th className="px-6 py-4 text-sm font-semibold">Analytics</th>
                  </tr>
                </thead>

                <tbody>
                  {urls.map((url) => {
                    const shortUrl = `${instance.defaults.baseURL}/${url.shortID}`;
                    const viewurl = `${instance.defaults.redirecturl}/${url.shortID}`;

                    return (
                      <tr key={url._id} className="border-t border-[#C7D3C0] hover:bg-[#C7D3C0]/25">
                        <td className="px-6 py-5">
                          <span className="font-semibold text-[#8FA28A]">{url.shortID}</span>
                        </td>

                        <td className="px-6 py-5">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-55 truncate text-[#252823] hover:text-[#5F655D]"
                          >
                            {viewurl}
                          </a>
                        </td>

                        <td className="px-6 py-5">
                          <a
                            href={url.redirectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block max-w-65 truncate text-[#5F655D] hover:text-[#252823]"
                          >
                            {url.redirectUrl}
                          </a>
                        </td>

                        <td className="px-6 py-5">
                          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${url.visitHistory.length > 0 ? 'bg-[#8FA28A]/15 text-[#252823]' : 'bg-[#C7D3C0] text-[#5F655D]'}`}>
                            {url.visitHistory.length}
                          </span>
                        </td>

                        <td className="px-6 py-5 text-sm text-[#5F655D]">
                          {new Date(url.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-6 py-5">
                          <a
                            href={shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 font-semibold text-[#8FA28A] hover:text-[#74876f]"
                          >
                            Visit
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>

                        <td className="px-6 py-5">
                          <a
                            href={`/analytics/${url.shortID}`}
                            className="inline-flex items-center gap-2 font-semibold text-[#252823] hover:text-[#5F655D]"
                          >
                            Analytics
                            <ArrowUpRight className="h-4 w-4 text-[#C8A96B]" />
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
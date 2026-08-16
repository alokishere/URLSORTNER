import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import instance from '../axios';

const Analytics = () => {
  const { sortid } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    instance
      .get(`/urls/${sortid}/analytics`)
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sortid]);

  const shortUrl = `${instance.defaults.baseURL}/urls/${sortid}`;

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const formatDateTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4ED]">
        <p className="text-lg text-[#5F655D]">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F4ED] p-6 md:p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#5F655D]">
              URL analytics
            </p>

            <h1 className="text-3xl font-black text-[#252823] md:text-4xl">Link analytics</h1>

            <p className="mt-2 text-[#5F655D]">Track visits and performance of your short URL.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border border-[#8FA28A] bg-[#F7F4ED] px-5 py-3 font-semibold text-[#252823] transition hover:bg-[#C7D3C0]"
            >
              ← Dashboard
            </button>

            <button
              onClick={() => navigate('/create')}
              className="rounded-xl bg-[#C8A96B] px-5 py-3 font-semibold text-[#252823] transition hover:bg-[#b9984f]"
            >
              + Shorten New URL
            </button>
          </div>
        </div>

        <div className="mb-6 rounded-[1.7rem] border border-[#C7D3C0] bg-[#F7F4ED] p-6 shadow-xl shadow-[#8FA28A]/10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm text-[#5F655D]">Short URL</p>

              <a
                href={shortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-xl font-semibold text-[#8FA28A] hover:text-[#74876f]"
              >
                {shortUrl}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[#C7D3C0] px-4 py-2 text-sm font-semibold text-[#252823]">
                {sortid}
              </span>

              <button
                onClick={() => navigator.clipboard.writeText(shortUrl)}
                className="rounded-lg border border-[#8FA28A] bg-[#F7F4ED] px-4 py-2 text-sm font-semibold text-[#252823] transition hover:bg-[#C7D3C0]"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-[1.7rem] border border-[#C7D3C0] bg-[#F7F4ED] p-6 shadow-xl shadow-[#8FA28A]/10">
            <p className="text-sm text-[#5F655D]">Total Visits</p>

            <div className="mt-2 flex items-end gap-3">
              <h2 className="text-4xl font-black text-[#252823]">{result?.totalVisits || 0}</h2>
              <span className="mb-1 text-sm font-semibold text-[#8FA28A]">Clicks</span>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-[#C7D3C0] bg-[#F7F4ED] p-6 shadow-xl shadow-[#8FA28A]/10">
            <p className="text-sm text-[#5F655D]">First Visit</p>

            <h2 className="mt-3 text-xl font-bold text-[#252823]">
              {result?.visitHistory?.length ? formatDate(result.visitHistory[0].timestamp) : 'No visits yet'}
            </h2>

            {result?.visitHistory?.length > 0 && (
              <p className="mt-1 text-sm text-[#5F655D]">{formatTime(result.visitHistory[0].timestamp)}</p>
            )}
          </div>

          <div className="rounded-[1.7rem] border border-[#C7D3C0] bg-[#F7F4ED] p-6 shadow-xl shadow-[#8FA28A]/10">
            <p className="text-sm text-[#5F655D]">Last Visit</p>

            <h2 className="mt-3 text-xl font-bold text-[#252823]">
              {result?.visitHistory?.length
                ? formatDate(result.visitHistory[result.visitHistory.length - 1].timestamp)
                : 'No visits yet'}
            </h2>

            {result?.visitHistory?.length > 0 && (
              <p className="mt-1 text-sm text-[#5F655D]">
                {formatTime(result.visitHistory[result.visitHistory.length - 1].timestamp)}
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 overflow-hidden rounded-[1.7rem] border border-[#C7D3C0] bg-[#F7F4ED] shadow-xl shadow-[#8FA28A]/10">
          <div className="border-b border-[#C7D3C0] p-6">
            <h2 className="text-xl font-bold text-[#252823]">Visit Activity</h2>
            <p className="mt-1 text-sm text-[#5F655D]">Complete history of visits to this short URL.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#C7D3C0] bg-[#C7D3C0] text-[#252823]">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">#</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Time</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Visit ID</th>
                </tr>
              </thead>

              <tbody>
                {result?.visitHistory?.length > 0 ? (
                  [...result.visitHistory]
                    .reverse()
                    .map((visit, index) => (
                      <tr key={visit._id} className="border-b border-[#C7D3C0] last:border-none hover:bg-[#C7D3C0]/20">
                        <td className="px-6 py-4">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C7D3C0] text-sm font-semibold text-[#252823]">
                            {index + 1}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-medium text-[#252823]">{formatDate(visit.timestamp)}</td>
                        <td className="px-6 py-4 text-[#5F655D]">{formatTime(visit.timestamp)}</td>

                        <td className="px-6 py-4">
                          <span className="rounded-lg bg-[#C7D3C0] px-3 py-2 font-mono text-xs text-[#252823]">
                            {visit._id}
                          </span>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-12 text-center text-[#5F655D]">
                      No visits yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {result?.visitHistory?.length > 0 && (
          <div className="rounded-[1.7rem] bg-[#8FA28A] p-6 text-[#F7F4ED] shadow-xl shadow-[#8FA28A]/20">
            <p className="text-sm text-[#F7F4ED]/80">Latest Visit</p>

            <div className="mt-2 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h2 className="text-xl font-bold">{formatDateTime(result.visitHistory[result.visitHistory.length - 1].timestamp)}</h2>
              <span className="text-sm text-[#F7F4ED]/90">Total visits: {result.totalVisits}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
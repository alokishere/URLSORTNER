import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import instance from '../axios';

const Analytics = () => {
    const { sortid } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        instance.get(`/urls/${sortid}/analytics`)
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
            year: 'numeric'
        });
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatDateTime = (timestamp) => {
        return new Date(timestamp).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <p className="text-gray-500 text-lg">
                    Loading analytics...
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">

            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">

                    <div>
                        <p className="text-blue-600 font-semibold text-sm mb-2">
                            URL ANALYTICS
                        </p>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Link Analytics
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Track visits and performance of your short URL.
                        </p>
                    </div>

                    <div className="flex gap-3">

                        <button
                            onClick={() => navigate('/')}
                            className="bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 px-5 py-3 rounded-xl font-semibold transition"
                        >
                            ← Dashboard
                        </button>

                        <button
                            onClick={() => navigate('/create')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                        >
                            + Shorten New URL
                        </button>

                    </div>

                </div>


                {/* URL Card */}
                <div className="bg-white border rounded-2xl shadow-sm p-6 mb-6">

                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                        <div>
                            <p className="text-sm text-gray-500 mb-2">
                                Short URL
                            </p>

                            <a
                                href={shortUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xl font-semibold text-blue-600 hover:underline break-all"
                            >
                                {shortUrl}
                            </a>
                        </div>

                        <div className="flex items-center gap-3">

                            <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold">
                                {sortid}
                            </span>

                            <button
                                onClick={() =>
                                    navigator.clipboard.writeText(shortUrl)
                                }
                                className="border border-gray-300 hover:bg-gray-100 px-4 py-2 rounded-lg text-sm font-semibold transition"
                            >
                                Copy
                            </button>

                        </div>

                    </div>

                </div>


                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

                    {/* Total Visits */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6">

                        <p className="text-gray-500 text-sm">
                            Total Visits
                        </p>

                        <div className="flex items-end gap-3 mt-2">
                            <h2 className="text-4xl font-bold text-gray-900">
                                {result?.totalVisits || 0}
                            </h2>

                            <span className="text-green-600 text-sm font-semibold mb-1">
                                Clicks
                            </span>
                        </div>

                    </div>


                    {/* First Visit */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6">

                        <p className="text-gray-500 text-sm">
                            First Visit
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-3">
                            {result?.visitHistory?.length
                                ? formatDate(result.visitHistory[0].timestamp)
                                : 'No visits yet'
                            }
                        </h2>

                        {result?.visitHistory?.length > 0 && (
                            <p className="text-gray-400 text-sm mt-1">
                                {formatTime(result.visitHistory[0].timestamp)}
                            </p>
                        )}

                    </div>


                    {/* Last Visit */}
                    <div className="bg-white border rounded-2xl shadow-sm p-6">

                        <p className="text-gray-500 text-sm">
                            Last Visit
                        </p>

                        <h2 className="text-xl font-bold text-gray-900 mt-3">
                            {result?.visitHistory?.length
                                ? formatDate(
                                    result.visitHistory[
                                        result.visitHistory.length - 1
                                    ].timestamp
                                )
                                : 'No visits yet'
                            }
                        </h2>

                        {result?.visitHistory?.length > 0 && (
                            <p className="text-gray-400 text-sm mt-1">
                                {formatTime(
                                    result.visitHistory[
                                        result.visitHistory.length - 1
                                    ].timestamp
                                )}
                            </p>
                        )}

                    </div>

                </div>


                {/* Visit Activity */}
                <div className="bg-white border rounded-2xl shadow-sm mb-6">

                    <div className="p-6 border-b">

                        <h2 className="text-xl font-bold text-gray-900">
                            Visit Activity
                        </h2>

                        <p className="text-gray-500 text-sm mt-1">
                            Complete history of visits to this short URL.
                        </p>

                    </div>


                    {/* Table */}
                    <div className="overflow-x-auto">

                        <table className="w-full">

                            <thead className="bg-gray-50 border-b">

                                <tr>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        #
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Date
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Time
                                    </th>

                                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">
                                        Visit ID
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {result?.visitHistory?.length > 0 ? (

                                    [...result.visitHistory]
                                        .reverse()
                                        .map((visit, index) => (

                                            <tr
                                                key={visit._id}
                                                className="border-b last:border-none hover:bg-gray-50 transition"
                                            >

                                                <td className="px-6 py-4">

                                                    <span className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                                                        {index + 1}
                                                    </span>

                                                </td>

                                                <td className="px-6 py-4 text-gray-700 font-medium">
                                                    {formatDate(visit.timestamp)}
                                                </td>

                                                <td className="px-6 py-4 text-gray-600">
                                                    {formatTime(visit.timestamp)}
                                                </td>

                                                <td className="px-6 py-4">

                                                    <span className="font-mono text-xs bg-gray-100 text-gray-600 px-3 py-2 rounded-lg">
                                                        {visit._id}
                                                    </span>

                                                </td>

                                            </tr>

                                        ))

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="text-center py-12 text-gray-500"
                                        >
                                            No visits yet.

                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>


                {/* Latest Visit */}
                {result?.visitHistory?.length > 0 && (

                    <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-2xl p-6">

                        <p className="text-blue-100 text-sm">
                            Latest Visit
                        </p>

                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-2">

                            <h2 className="text-xl font-bold">
                                {formatDateTime(
                                    result.visitHistory[
                                        result.visitHistory.length - 1
                                    ].timestamp
                                )}
                            </h2>

                            <span className="text-blue-100 text-sm">
                                Total visits: {result.totalVisits}
                            </span>

                        </div>

                    </div>

                )}

            </div>

        </div>
    )
}

export default Analytics
import React, { useEffect, useState } from 'react'
import instance from '../axios';

function Dashboard() {
    const [urls, setUrls] = useState([]);

    useEffect(() => {
        instance.get('/urls/')
            .then((res) => {
                setUrls([...res.data].reverse());
            })
            .catch((err) => {
                console.log(err);
            })
    }, []);

    const logoutUser= ()=>{
        instance.post('/user/logout')
        .then((res)=>{
            localStorage.removeItem('user');
            window.location.href = "/login";
        })
        .catch((err)=>{
            console.log(err);
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Dashboard
                    </h1>

                    <p className="text-gray-500 mt-1">
                        Manage and track your short URLs
                    </p>
                </div>
                <div className="flex gap-4">
                 <button
                    onClick={() => logoutUser()}
                    className="bg-red-500 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                >
                    Logout →
                </button>
                 <button
                    onClick={() => window.location.href = "/create"}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                >
                    + Create Short URL
                </button>
                </div>
               
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <p className="text-gray-500">Total URLs</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {urls.length}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <p className="text-gray-500">Total Clicks</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {urls.reduce(
                            (total, url) => total + url.visitHistory.length,
                            0
                        )}
                    </h2>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border">
                    <p className="text-gray-500">Active URLs</p>
                    <h2 className="text-3xl font-bold mt-2">
                        {urls.filter(
                            (url) => url.visitHistory.length > 0
                        ).length}
                    </h2>
                </div>

            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">
                        My Short URLs
                    </h2>
                </div>

                <div className="overflow-x-auto">

                    <table className="w-full text-left">

                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                    Short ID
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                    Short URL
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                    Destination
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                    Clicks
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                    Created
                                </th>

                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                    Action
                                </th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">
                                    Analytics
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            {urls.map((url) => {

                                const shortUrl =
                                    `${instance.defaults.baseURL}/urls/${url.shortID}`;

                                return (
                                    <tr
                                        key={url._id}
                                        className="border-b last:border-none hover:bg-gray-50 transition"
                                    >

                                        {/* Short ID */}
                                        <td className="px-6 py-5">
                                            <span className="font-semibold text-blue-600">
                                                {url.shortID}
                                            </span>
                                        </td>

                                        {/* Short URL */}
                                        <td className="px-6 py-5">
                                            <a
                                                href={shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-700 hover:text-blue-600 max-w-55 block truncate"
                                            >
                                                {shortUrl}
                                            </a>
                                        </td>

                                        {/* Original URL */}
                                        <td className="px-6 py-5">
                                            <a
                                                href={url.redirectUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-600 hover:text-blue-600 max-w-62.5 block truncate"
                                            >
                                                {url.redirectUrl}
                                            </a>
                                        </td>

                                        {/* Clicks */}
                                        <td className="px-6 py-5">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    url.visitHistory.length > 0
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                }`}
                                            >
                                                {url.visitHistory.length}
                                            </span>
                                        </td>

                                        {/* Created */}
                                        <td className="px-6 py-5 text-gray-600 text-sm">
                                            {new Date(
                                                url.createdAt
                                            ).toLocaleDateString()}
                                        </td>

                                        {/* Action */}
                                        <td className="px-6 py-5">
                                            <a
                                                href={shortUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 font-semibold hover:underline"
                                            >
                                                Visit →
                                            </a>
                                        </td>
                                        <td className="px-6 py-5">
                                            <a
                                                href={`/analytics/${url.shortID}`}
                                                className="text-blue-600 font-semibold hover:underline"
                                            >
                                                Analytics →
                                            </a>
                                        </td>

                                    </tr>
                                );
                            })
    }
                        </tbody>

                    </table>

                </div>

                {/* Empty state */}
                {urls.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        No short URLs found.
                    </div>
                )}

            </div>

        </div>
    );
}

export default Dashboard;
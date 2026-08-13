import React, { useState } from 'react'
import instance from '../axios';

const CreateSortUrl = () => {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const url = e.target.url.value;

        setLoading(true);

        instance.post('/urls/', { url })
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
        <div className="min-h-screen bg-gray-50 p-8">

            {/* Header */}
            <div className="max-w-3xl mx-auto flex justify-between items-center mb-10">

                <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                        Create Short URL
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Turn your long URL into a simple, shareable link.
                    </p>
                </div>

                <button
                    onClick={() => window.location.href = "/dashboard"}
                    className="bg-white border border-gray-300 hover:bg-gray-100 px-5 py-3 rounded-xl font-semibold transition"
                >
                    ← Dashboard
                </button>

            </div>


            {/* Main Card */}
            <div className="max-w-3xl mx-auto">

                <div className="bg-white border rounded-2xl shadow-sm p-8">

                    <form onSubmit={handleSubmit}>

                        <label
                            htmlFor="url"
                            className="block text-lg font-semibold text-gray-800 mb-3"
                        >
                            Enter your URL
                        </label>

                        <div className="flex gap-3">

                            <input
                                type="url"
                                id="url"
                                name="url"
                                required
                                placeholder="https://example.com/very-long-url"
                                className="flex-1 border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />

                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-xl font-semibold transition"
                            >
                                {loading ? "Creating..." : "Shorten"}
                            </button>

                        </div>

                    </form>


                    {/* Result */}
                    {result && (
                        <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">

                            <p className="text-sm font-semibold text-green-700 mb-2">
                                Short URL Created
                            </p>

                            <div className="flex items-center gap-3">

                                <input
                                    value={result.url}
                                    readOnly
                                    className="flex-1 bg-white border border-green-200 rounded-xl px-4 py-3 text-gray-700"
                                />

                                <button
                                    onClick={() =>
                                        navigator.clipboard.writeText(result.url)
                                    }
                                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl font-semibold transition"
                                >
                                    Copy
                                </button>

                            </div>

                            <div className="mt-4 flex justify-between items-center">

                                <p className="text-sm text-gray-500">
                                    Short ID:
                                    <span className="font-semibold text-gray-700 ml-2">
                                        {result.shortID}
                                    </span>
                                </p>

                                <a
                                    href={result.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    Open URL →
                                </a>

                            </div>

                        </div>
                    )}

                </div>

            </div>

        </div>
    )
}

export default CreateSortUrl
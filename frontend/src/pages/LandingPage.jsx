import React from 'react'
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
  return (
    <div className="flex items-center flex-col pt-10 gap-5">
        {/* tagline */}
        <h1 className="text-3xl font-bold">Short your long URLs into memoriable ones</h1>
        <p>
            Create short, memorable links that are easy to share and remember.
        </p>
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={() => navigate('/dashboard')}>
            Get Started
        </button>
    </div>
  )
}

export default LandingPage
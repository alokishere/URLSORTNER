import React from 'react'
import App from '../App';
import { Route, Routes } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Dashboard from '../pages/Dashboard';
import CreateSortUrl from '../pages/CreateSortUrl';
import Analytics from '../pages/Analytics';

const Mainroute = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage/>} />
      <Route path="/dashboard" element={<Dashboard/>} />
      <Route path="/create" element={<CreateSortUrl/>} />
      <Route path="/analytics/:sortid" element={<Analytics/>} />
    </Routes>
  )
}

export default Mainroute
// src/App.js
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './LoginPage'
import Home      from './Home'
import Results   from './Results'
import ThreeDView from './ThreeDView';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public login screen */}
        <Route path="/"      element={<LoginPage />} />

        {/* After login, main upload/analyze screen */}
        <Route path="/home"  element={<Home />} />

        {/* Final report screen */}
        <Route path="/results" element={<Results />} />
        {/* 3D view screen */}
        <Route path="/3d-view" element={<ThreeDView />} />
      </Routes>
    </Router>
  );
}

export default App;
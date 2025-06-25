// src/ThreeDView.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '@google/model-viewer';

export default function ThreeDView() {
  console.log("🔷 ThreeDView mounted"); // ← test log on mount

  const { state } = useLocation();
  const navigate = useNavigate();
  const stlPath = state?.stlPath;

  useEffect(() => {
    console.log("🔍 ThreeDView got state:", state);
  }, [state]);

  // If no STL path in state, bounce back
  if (!stlPath) {
    console.log("⚠️ No stlPath, redirecting to /home");
    navigate('/home');
    return null;
  }

  // Extract the filename (e.g. "myfile_tumour_mesh.stl")
  const filename = stlPath.split('/').pop();

  return (
    <div style={{
      background: 'linear-gradient(135deg, #001f3f, #004080, #1a75ff)',
      height: '100vh',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column'
    }}>
    
      <nav style={{
        padding: '1rem 2rem',
        background: 'rgba(0,0,0,0.3)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontFamily: 'Tangerine, cursive', fontSize: '2.5rem' }}>
          MedSegment
        </div>
        <div>
          <button onClick={() => navigate('/home')} style={navBtn}>Home</button>
          <button onClick={() => navigate('/results')} style={navBtn}>Results</button>
          <button onClick={() => navigate('/home')} style={navBtn}>Logout</button>
        </div>
      </nav>

      <div style={{ flex: 1, padding: '2rem' }}>
        <model-viewer
          src={`http://127.0.0.1:5000/models/${filename}`}
          alt="3D tumour model"
          camera-controls
          auto-rotate
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}

// simple inline style for nav buttons
const navBtn = {
  background: 'transparent',
  border: 'none',
  color: '#fff',
  fontSize: '1rem',
  marginLeft: '1rem',
  cursor: 'pointer'
};
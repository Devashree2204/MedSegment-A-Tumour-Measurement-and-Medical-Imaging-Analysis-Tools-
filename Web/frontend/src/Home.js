import React, { useState } from 'react';
import { BrowserRouter as Router, Link, useNavigate } from 'react-router-dom';
import './Home.css';
import UploadMRI from './UploadMRI';
import LoadingScreen from './LoadingScreen';


function Home() {
  // State to hold the preview image and prediction
  const [preview, setPreview] = useState('');
  const [prediction, setPrediction] = useState('');
  const [filename, setFilename] = useState(""); // State to hold the filename
  const [loading, setLoading] = useState(false); // State to manage loading screen
  const navigate = useNavigate(); // get navigate function from React Router
  

  // Callback function passed down to UploadMRI to update preview and prediction
  const handlePreviewUpdate = (newPreview, newPrediction, newFilename) => {
    setPreview(newPreview);
    setPrediction(newPrediction);
    setFilename(newFilename); // Update filename state
  };

  // Navigate to /results with state
  // in Home.js, near the top of the component
  const handleSegment = async () => {
    setLoading(true); // Show loading screen
    try {
    // 1) Call segmentation endpoint
    const res = await fetch('http://127.0.0.1:5000/segment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    });
    const data = await res.json();

    if (!res.ok) {
      // Display any errors the server returned
      alert(data.error || 'Segmentation failed');
      return;
    }

    // 2) On success, navigate to /results with everything the Results page will need
    navigate('/results', {
      state: {
        prediction,
        preview: data.best_slice_preview,
        middleSlice: data.middle_slice_preview,
        bestSliceIndex:    data.best_slice_index,
        max2DArea:         data.max_2D_area_mm2,
        volume3D:          data['3D_volume_mm3'],
        surfaceArea:       data.surface_area_mm2,
        saToVolRatio:      data['sa_to_volume_ratio_mm-1'],
        sphericity:        data.sphericity,
        stlPath:           data.stl_path,
        sliceOverlays:  data.slice_overlays,
        sliceAreas:     data.slice_areas
      }
    });
  } catch (err) {
    console.error(err);
    alert('Error connecting to segmentation service');
  } finally {
    setLoading(false); // Hide loading screen
  }
};

  const handleDownloadResults = () => {
    navigate('/results', { state: { preview, prediction } });
  };

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">MedSegment</div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/results">Results</Link></li>
          <li><Link to="/">Logout</Link></li>
        </ul>
      </nav>

      <div className="content">
      {loading ? (
        // While loading, show the facts
        <LoadingScreen />
      ) : (
        // Otherwise, normal Home UI
        <>
        <div className="left-section">
          <h2>AI based tool for brain tumour detection and analysis</h2>
          <UploadMRI onPreviewUpdate={handlePreviewUpdate} />
        </div>

        <div className="right-section">
          <div className="mri-container">
            {prediction && <p className="mri-prediction">{prediction}</p>}
            <img
              src={
                preview
                  ? `data:image/png;base64,${preview}`
                  : require('./assets/placeholder_brain.jpg')
              }
              alt="MRI Slice Preview"
              className="mri-preview"
            />

            {/* Conditional action button */}
            {prediction === 'Tumor' && (
              <button className="upload-btn" onClick={handleSegment}>
                Highlight Tumour
              </button>
            )}
            {prediction === 'Non-Tumor' && (
              <button className="upload-btn" onClick={handleDownloadResults}>
                Download Results
              </button>
            )}
          </div>
        </div>
        </>
      )}
      </div>
    </div>
  );
}

export default Home;
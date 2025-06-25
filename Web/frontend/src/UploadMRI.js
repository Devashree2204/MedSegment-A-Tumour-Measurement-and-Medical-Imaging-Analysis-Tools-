import React, { useState, useRef } from 'react';

function UploadMRI({ onPreviewUpdate }) {
  const [file, setFile] = useState(null);
  const [step, setStep] = useState("upload"); // "upload" or "analyze"
  const [isProcessing, setIsProcessing] = useState(false);
  const hiddenFileInput = useRef(null);

  // Trigger the hidden file input when "Upload File" is clicked.
  const handleClickUpload = () => {
    hiddenFileInput.current.click();
  };

  // When a file is selected, update state.
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // We do NOT automatically change step here; we let the user click the button.
    }
  };

  // Handle the file upload and model inference.
  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first!");
      return;
    }
    setIsProcessing(true); // Start the loading state.
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setIsProcessing(false); // End the loading state.
      if (response.ok) {
        // Pass the preview and prediction data up.
        onPreviewUpdate(data.preview, data.prediction, file.name);
        setStep("analyze");
      } else {
        onPreviewUpdate("", data.error || "An error occurred.", "");
      }
    } catch (err) {
      setIsProcessing(false); // End the loading state on error.
      console.error(err);
      onPreviewUpdate("", "Error connecting to server.");
    }
  };

  // Single button logic: If no file, show "Upload File"; if a file is selected, show "Analyze"
  const handleButtonClick = () => {
    if (!file) {
      handleClickUpload();
    } else {
      handleUpload();
    }
  };

  const buttonText = !file ? "Upload File" : "Analyze";
  const infoText = !file ? "Supported format: .nii.gz" : `uploaded: ${file.name}`;

  return (
    <div style={{ textAlign: 'left' }}>
      {/* Hidden file input */}
      <input
        type="file"
        accept=".nii,.nii.gz"
        ref={hiddenFileInput}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Single button that changes behavior based on whether a file is selected */}
      <button
        type="button"
        className="upload-btn"
        onClick={handleButtonClick}
      >
        {buttonText}
      </button>

      {/* Display info text; if file not selected, shows supported format, else shows filename */}
      <p style={{ marginTop: '0.5rem' }}>{infoText}</p>

      {/* Show loading message while processing */}
      {isProcessing && (
        <p style={{ color: "yellow", fontStyle: "italic" }}>
          Model is working, please wait...
        </p>
      )}
    </div>
  );
}

export default UploadMRI;
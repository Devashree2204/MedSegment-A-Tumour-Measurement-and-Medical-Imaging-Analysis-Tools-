// src/Results.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Home.css';

// pdf‑lib
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';

// helper to turn base64 → Uint8Array
function base64ToUint8Array(base64) {
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) {
    arr[i] = raw.charCodeAt(i);
  }
  return arr;
}

// load blank PDF template
async function loadTemplatePDF() {
  const url = `${process.env.PUBLIC_URL}/data/ReportTemplate.pdf`;
  const buf = await fetch(url).then(r => r.arrayBuffer());
  return PDFDocument.load(buf);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!state?.preview || !state?.prediction) {
      navigate('/home');
    }
  }, [state, navigate]);

  const preview         = state?.preview;      // base64 string
  const prediction      = state?.prediction;   // "Tumor" or "Non-Tumor"
  const middleSliceIndex = state?.middleSliceIndex;
  const bestSlice = state?.bestSlice || state?.preview; // base64 string
  const bestSliceIndex  = state?.bestSliceIndex;
  const middleSlice     = state?.middleSlice;  // base64 string
  const max2DArea       = state?.max2DArea;
  const volume3D        = state?.volume3D;
  const surfaceArea     = state?.surfaceArea;
  const saToVolRatio    = state?.saToVolRatio;
  const sphericity      = state?.sphericity;
  const stlPath         = state?.stlPath;
  const sliceOverlays = state?.sliceOverlays || [];
  const sliceAreas    = state?.sliceAreas    || [];
  const [sliceIndex, setSliceIndex] = useState(0);
  const [brightness, setBrightness] = useState(1.0);
  const [contrast, setContrast]     = useState(1.0);
  const [exposure, setExposure] = useState(1.0);
  const [ambientIntensity, setAmbientIntensity] = useState(1.0);



  const handle3DView = () => {
    navigate('/3d-view', { state: { stlPath } });
  };  

  // **no generics here** – just an empty array
  const [symptoms, setSymptoms] = useState([]);
  const [tips, setTips]         = useState([]);

  // load text files once
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/data/Early Symptoms of a Brain Tumor.txt`)
      .then(r => r.text())
      .then(txt => {
        const lines = txt
          .split('\n')
          .map(l => l.replace(/^\d+[\.\)]\s*/, '').trim())
          .filter(Boolean);
        setSymptoms(shuffle(lines).slice(0, 2));
      });

    fetch(`${process.env.PUBLIC_URL}/data/Tips for Healthy Brain.txt`)
      .then(r => r.text())
      .then(txt => {
        const lines = txt
          .split('\n')
          .map(l => l.replace(/^\d+\.\s*/, '').trim())
          .filter(Boolean);
        setTips(shuffle(lines).slice(0, 4));
      });
  }, []);

// PDF export
const handleDownloadPDF = async () => {
  if (!preview) {
    console.error("Preview image is missing");
    alert("Cannot generate PDF: missing image data");
    return;
  }
  const pdfDoc = await loadTemplatePDF();
  const page   = pdfDoc.getPage(0);
  const helv       = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helvBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvItalic = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  if (prediction === 'Non-Tumor' || prediction === 'Non-Tumour') {
   // Non Tumour Layout 
   // Grab & embed the MRI image
  const cleanBase64 = preview ? preview.replace(/^data:image\/\w+;base64,/, '') : '';  
  const imgBytes = base64ToUint8Array(cleanBase64);
  const pngImage  = await pdfDoc.embedPng(imgBytes);
  const scaled    = pngImage.scale(0.5);
  const imgW      = scaled.width * 1.9;
  const imgH      = scaled.height * 1.9;
  const bulletIndent = 60;
  const wrapWidth    = 612 - bulletIndent - 40;  // pageWidth - indent - rightMargin
  const lineHeight   = 14;                       // a little more than font size

  // 1) Prediction text, just above the MRI:
  const imageTopY = 490 + imgH;     // this is the Y‑coordinate of the top of image
  page.drawText(`Prediction: ${prediction}`, {
    x:     190,
    y:     imageTopY + 10,         // 10 units above the image
    size:  20,
    font:  helvBold,
    color: rgb(0,0,0),
  });

  // 2) MRI slice itself:
  page.drawImage(pngImage, {
    x:     200,
    y:     490,
    width:  imgW,
    height: imgH,
  });

  // 3) Early Symptoms heading & bullets:
  page.drawText('Early Symptoms:', {
    x:     40,
    y:     450,
    size:  18,
    font:  helvBold,
    color: rgb(0,0,0),
  });
  symptoms.forEach((s, i) => {
    page.drawText(`• ${s}`, {
      x:     60,
      y:     420 - i * 36,         // tighten line spacing a bit
      size:  12,
      font:  helvItalic,
      color: rgb(54/255,69/255,79/255),
      maxWidth:  wrapWidth,lineHeight
    });
  });

  // 4) Healthy Brain Tips—moved up to reduce the blank gap:
  page.drawText('Healthy Brain Tips:', {
    x:    40,
    y:    330,                    // was 310; bumped up to 350
    size: 18,
    font: helvBold,
    color: rgb(0,0,0),
  });
  tips.forEach((t, i) => {
    page.drawText(`• ${t}`, {
      x:     60,
      y:     300 - i * 28,         // same tighter spacing
      size:  12,
      font:  helvItalic,
      color: rgb(54/255,69/255,79/255),
      maxWidth:  wrapWidth,lineHeight
    });
  });
  const pdfBytes = await pdfDoc.save();
  saveAs(
    new Blob([pdfBytes], { type:'application/pdf' }),
    `MedSegment_${prediction}_Report.pdf`); 
  
  return;
  }
  
// end of Non-Tumor report
// —— Tumour layout —— //
{
  // A) Original MRI
  const cleanMiddle = middleSlice.replace(/^data:image\/\w+;base64,/, '');
  const middleBytes = base64ToUint8Array(cleanMiddle);
  const middleImg   = await pdfDoc.embedPng(middleBytes);
  const { width: w, height: h } = middleImg.scale(1.0);

  page.drawImage(middleImg, 
    { 
    x:70, 
    y:500, 
    width:w, 
    height:h 
  });
  page.drawText("Original MRI with tumour", 
    { 
    x:80, 
    y:500+h+10, 
    size:14, 
    font:helvBold 
  });
}

{
  // B) Best slice overlay
  const cleanBest = bestSlice.replace(/^data:image\/\w+;base64,/, '');
  const bestBytes = base64ToUint8Array(cleanBest);
  const bestImg   = await pdfDoc.embedPng(bestBytes);
  const { width: w1, height: h1 } = bestImg.scale(1.0);

  page.drawImage(bestImg, 
    { 
      x:320, 
      y:500, 
      width:w1, 
      height:h1 
    });
  page.drawText("Best Slice Overlay with tumour", 
    { 
      x:330, 
      y:500+h1+10, 
      size:14, 
      font:helvBold 
    });
}

// C) Metrics
const mX    =  200;
let   mY    =  460;
const mSize =  14; // font size
const mStep =  50; // vertical spacing
function drawMetric(label, value, unit="") {
  page.drawText(label, 
    { 
      x:mX, 
      y:mY, 
      size:mSize, 
      font:helvBold 
    });
  page.drawText(`${value}${unit}`, 
    { 
      x:mX+100, 
      y:mY, 
      size:mSize, 
      font:helvItalic 
    });
  mY -= mStep;
}
drawMetric("2D Area:",    max2DArea.toFixed(2),   "mm^2");
drawMetric("3D Volume:",  volume3D.toFixed(2),    "mm^3");
drawMetric("Surface Area:",surfaceArea.toFixed(2), "mm^2");
drawMetric("SA/Vol Ratio:",saToVolRatio.toFixed(2),"mm^-1");
drawMetric("Sphericity:", sphericity.toFixed(2));

// 5) Save
  const pdfBytes = await pdfDoc.save();
  saveAs(
    new Blob([pdfBytes], { type:'application/pdf' }),
    `MedSegment_${prediction}_Report.pdf`
  );
};

// 2) HTML export
const handleDownloadHTML = async () => {
  // 2.1) fetch & base64‑encode the template PNG
  const resp = await fetch(`${process.env.PUBLIC_URL}/data/ReportTemplate.png`);
  const arrayBuf = await resp.arrayBuffer();
  const binary = new Uint8Array(arrayBuf)
    .reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  const templateBase64 = btoa(binary);

  // 2.2) build the HTML page string
  let html = '';
  if (prediction === 'Non-Tumor') {
    html = `…non‑tumor layout…`;
    html = `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>MedSegment Report</title>
  <style>
    .page {
      width: 800px; height: 1150px;
      margin: auto;
      position: relative;
      background: url("data:image/png;base64,${templateBase64}") no-repeat center/cover;
      font-family: Verdana, sans-serif;
    }
    .prediction {
      position: absolute; top: 120px; width: 100%;
      text-align: center; font-size: 24px; font-weight: bold;
    }
    .mri {
      position: absolute; top: 170px; left: 50%;
      transform: translateX(-50%);
      width: 320px; height: 320px; border: 2px solid #000;
    }
    .section {
      position: absolute;
      left: 40px; right: 40px;
      font-size: 14px;
    }
    .symptoms { top: 530px; }
    .tips     { top: 690px; }
    .section h2 { margin-bottom: 8px; font-weight: bold; }
    .section ul { padding-left: 1.2em; margin: 0; }
    .section li { margin-bottom: 4px; font-style: italic; color: rgb(54, 69, 79); }
  </style>
</head><body>
  <div class="page">
    <div class="prediction">Prediction: ${prediction}</div>
    <img class="mri" src="data:image/png;base64,${preview}" />
    <div class="section symptoms">
      <h2>Early Symptoms:</h2>
      <ul>${symptoms.map(s => `<li>${s}</li>`).join('')}</ul>
    </div>
    <div class="section tips">
      <h2>Healthy Brain Tips:</h2>
      <ul>${tips.map(t => `<li>${t}</li>`).join('')}</ul>
    </div>
  </div>
</body></html>`;
  }
  else {
    html = `…tumour layout…`;
    html = `
    <!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>MedSegment Report</title>
    <style>
    
    body {
    margin: 0; padding: 0;
    background: url("data:image/png;base64,${templateBase64}") no-repeat center/cover;
    font-family: Verdana, sans-serif;
    position: relative;
    width: 800px; height: 1150px;
    }
    
    .logo {
    text-align: center;
    font-size: 48px;
    margin-top: 20px;
    color: #4A6BAF;
    font-weight: normal;
    }
    
    .images {
    display: flex;
    justify-content: space-around;
    margin: 20px 0 10px;
    }
    
    .images img {
    width: 45%;
    border: 2px solid #000;
    }
    
    .captions {
    display: flex;
    justify-content: space-around;
    font-weight: bold;
    margin-bottom: 30px;
    font-size: 16px;
    }
    
    .metrics {
    width: 80%;
    margin: 0 auto;
    font-size: 16px;
    line-height: 2;
    }
    
    .metrics dt {
    font-weight: bold;
    float: left;
    clear: left;
    width: 35%;
    }
    
    .metrics dd {
    margin: 0 0 0 40%;
    font-style: italic;
    }
    
    .footer {
    position: absolute;
    bottom: 20px;
    width: 100%;
    text-align: center;
    font-size: 14px;
    color: #4A6BAF;
    }
  
  </style>
  </head>
  <body>
  
  <div class="logo">MedSegment</div>
  <div class="images">
  <img src="data:image/png;base64,${middleSlice}" alt="Original MRI with tumour">
  <img src="data:image/png;base64,${bestSlice}"   alt="Best slice overlay">
  </div>
  
  <div class="captions">
  <div>Original MRI with tumour</div>
  <div>Best Slice Overlay with tumour</div>
  </div>

  <dl class="metrics">
  <dt>2D Area:</dt>      <dd>${max2DArea.toFixed(2)} mm²</dd>
  <dt>3D Volume:</dt>    <dd>${volume3D.toFixed(2)} mm³</dd>
  <dt>Surface Area:</dt> <dd>${surfaceArea.toFixed(2)} mm²</dd>
  <dt>SA/Vol Ratio:</dt> <dd>${saToVolRatio.toFixed(2)} mm⁻¹</dd>
  <dt>Sphericity:</dt>   <dd>${sphericity.toFixed(2)}</dd>
  </dl>
  
  <div class="footer">TRANSFORMING MRI DATA INTO ACTIONABLE INSIGHTS</div>
  </body>
  </html>`;
  }

  // 2.3) trigger download
  const blob = new Blob([html], { type: 'text/html' });
  saveAs(blob, `MedSegment_${prediction}.html`);
};

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="logo">MedSegment</div>
        <ul className="nav-links">
          <li><a href="/home">Home</a></li>
          <li><a href="/results">Results</a></li>
          <li><a href="#">Logout</a></li>
        </ul>
      </nav>

      <div className="results-container">
  {prediction === 'Non-Tumor' ? (
    <>
      {/* Non‑Tumor report layout */}
      <div className="non-tumor-layout">
      <div className="results-template">
        <img
          src={`${process.env.PUBLIC_URL}/data/ReportTemplate.png`}
          alt="Template"
          style={{ width: '100%', height: '100%' }}
        />
        <h2 className="results-title">Prediction: {prediction}</h2>
        <img
          className="template-mri"
          src={`data:image/png;base64,${preview}`}
          alt="MRI"
        />

        <div className="symptoms">
          <h4>Early Symptoms:</h4>
          <ul>
            {symptoms.map((s, i) => (
              <li key={i}><em>{s}</em></li>
            ))}
          </ul>
        </div>

        <div className="tips">
          <h4>Healthy Brain Tips:</h4>
          <ul>
            {tips.map((t, i) => (
              <li key={i}><em>{t}</em></li>
            ))}
          </ul>
        </div>

        <div className="results-footer">
          Transforming MRI Data into Actionable Insights
        </div>
      </div>

      <div className="results-buttons">
        <button className="upload-btn" onClick={handleDownloadPDF}>
          Download as PDF
        </button>
        <button className="upload-btn" onClick={handleDownloadHTML}>
          Download as HTML
        </button>
        <button className="upload-btn" onClick={() => navigate('/home')}>
          Upload Another File
        </button>
      </div>
      </div>
      
    </>
  ) : (
    <>
      {/* Tumour report layout */}
      {/* Two panels side-by-side */}
      <div className="visualization-panels">
        <div className="panel">
          {/* Slider controls */}
          <div className="slider-container">
            <input type="range" min={0} max={sliceOverlays.length - 1} value={sliceIndex} onChange={e => setSliceIndex(Number(e.target.value))}/>
            <div style={{ color: '#fff', marginTop: '0.5rem' }}>
              Slice {sliceIndex + 1} of {sliceOverlays.length}
            </div>
          </div>
        {sliceOverlays.length > 0 && (
          <>
           <img src={`data:image/png;base64,${sliceOverlays[sliceIndex]}`} alt={`Slice ${sliceIndex}`} className="overlay-image"/>
          </>
          )}
        </div>

        {/* Right panel: 3D model */}
        <div className="panel">
        <model-viewer src={`http://127.0.0.1:5000/models/${stlPath}`} alt="3D tumour model" camera-controls auto-rotate style={{ width: '100%', height: '100%', filter: `brightness(${brightness}) contrast(${contrast})`  }}/>
        </div>

        {/* 3) Settings sliders */}
        <div className="panel settings-panel">
        <h4 style={{ color: '#fff', marginBottom: '2.5rem' }}>
        3D View Settings
        </h4>
        <label style={{ color: '#fff', width: '100%' }}>
        Brightness: {brightness.toFixed(2)}
        <input type="range" min="0.5" max="2" step="0.05" value={brightness} onChange={e => setBrightness(parseFloat(e.target.value))}/>
        </label>
        <label style={{ color: '#fff', marginTop: '1rem', width: '100%' }}>
        Contrast: {contrast.toFixed(2)}
        <input type="range" min="0.5" max="2" step="0.05" value={contrast} onChange={e => setContrast(parseFloat(e.target.value))}/>
        </label>
        </div>
      </div>

      <div className="metrics-buttons-container">
        {/* Metrics box */}
        <div className="metrics-box">
          <p><strong>2D Area:</strong> {sliceAreas[sliceIndex].toFixed(2)} mm²</p>
          <p><strong>3D Volume:</strong> {volume3D.toFixed(2)} mm³</p>
          <p><strong>Surface Area:</strong> {surfaceArea.toFixed(2)} mm²</p>
          <p><strong>SA/Vol Ratio:</strong> {saToVolRatio.toFixed(2)} mm⁻¹</p>
          <p><strong>Tumour Roundness:</strong> {sphericity.toFixed(2)}</p>
        </div>
      
        {/* Buttons box */}
        <div className="buttons-box">
          <button className="upload-btn" onClick={handleDownloadPDF}>
            Download as PDF
          </button>
          
          <button className="upload-btn" onClick={handleDownloadHTML}>
            Download as HTML
          </button>
          
          <button className="upload-btn" onClick={() => navigate('/home')}>
            Upload Another File
          </button>
        </div>
      </div>
        </>
      )}
      </div>
      </div>
  );
}
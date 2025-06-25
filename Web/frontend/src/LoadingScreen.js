// src/LoadingScreen.js
import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';  // for the blinking cursor and styling
import brainIcon from './assets/icons8-brain-40.png';
const WAIT_MSG = "Please wait, we're analysing your uploaded file further, it may take some time";

// Helper: Fisher–Yates shuffle
function shuffleArray(array) {
  const a = array.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LoadingScreen() {
  const [facts, setFacts]           = useState([]);
  const [idx, setIdx]               = useState(0);
  const [displayed, setDisplayed]   = useState('');
  const totalFacts = facts.length;
  const percentComplete = totalFacts > 0
    ? Math.floor((idx / totalFacts) * 100)
    : 0;

  // 1) Load and shuffle facts once
  useEffect(() => {
    fetch('/data/Brain Facts.txt')
      .then(r => r.text())
      .then(txt => {
        // 1) split & shuffle the facts
        const rawFacts = txt
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);
        const shuffledFacts = shuffleArray(rawFacts);
      
        // 2) interleave WAIT_MSG and each fact
        const interleaved = [];
        shuffledFacts.forEach(fact => {
          interleaved.push(WAIT_MSG, fact);
        });
      
        // 3) cycle through WAIT_MSG, fact, WAIT_MSG, fact, … 
        setFacts(interleaved);
      });      
  }, 
  []);

  // 2) Typewriter effect when idx changes
  useEffect(() => {
    if (!facts.length) return;
    setDisplayed('');
    let charIndex = 0;
    const typingSpeed = 50;
    const typeInterval = setInterval(() => {
      charIndex++;
      setDisplayed(facts[idx].slice(0, charIndex));
      if (charIndex >= facts[idx].length) {
        clearInterval(typeInterval);
      }
    }, typingSpeed);
    return () => clearInterval(typeInterval);
  }, [idx, facts]);

  // 3) After fully typed, wait then move to next
  useEffect(() => {
    if (!facts.length || displayed !== facts[idx]) return;
    const displayDuration = 4000;
    const pauseTimer = setTimeout(() => {
      setIdx(i => (i + 1) % facts.length);
    }, displayDuration);
    return () => clearTimeout(pauseTimer);
  }, [displayed, idx, facts]);

  // 4) If still loading facts
  if (!facts.length) {
    return (
      <div style={containerStyle}>
        <div style={centerStyle}>
          Loading brain facts…
        </div>
      </div>
    );
  }

  // Check if current fact is a waiting message
  const isWaiting = facts[idx] === WAIT_MSG;

  // 5) Render the progress bar and typed text + blinking cursor
  return (
    <div style={containerStyle}>
      <div className="top-progress-container">
        <div className="top-progress-track">
          <div className="top-progress-fill" style={{ width: `${percentComplete}%` }}>
            <img src={brainIcon} alt="Brain Icon" className="brain-progress-icon" />
          </div>
        </div>
        <div className="progress-percentage">{percentComplete}%</div>
      </div>
      
      <div style={centerStyle}>
        <span className={isWaiting ? 'wait-msg' : ''}>
          {displayed}
        </span>
        <span className="cursor">|</span>
      </div>
    </div>
  );  
}

const containerStyle = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
  backgroundColor: '#052659', // Dark blue background like in Image 2
}

const centerStyle = {
  flex: 1,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  fontSize: '1.2rem',
  padding: '1rem',
  textAlign: 'center'
};
// src/LoginPage.js
import React, { useState } from 'react';
import './App.css'; 
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const toggleForm = () => setIsLogin(prev => !prev);

  return (
    <div className="App">
      <video className="background-video" autoPlay loop muted>
      <source src={require('./assets/videos/rotating-brain.mp4')} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
      <header className="App-header">
        <h1 className="site-title">MedSegment</h1>
        <p className="tagline">Transforming MRI Data into Actionable Insights</p>
      </header>
      <div className="form-container">
        <div className="tab">
          <button
            className={isLogin ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={!isLogin ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>
        {isLogin ? (
          <LoginForm onToggle={toggleForm} navigate={navigate} />
        ) : (
          <RegisterForm onToggle={toggleForm} />
        )}
      </div>
    </div>
  );
}

function LoginForm({ onToggle, navigate }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        // Navigate to the Home page upon successful login:
        navigate("/home");
      } else {
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error connecting to server");
    }
  };

  return (
    <form className="form" onSubmit={handleLogin}>
      <div className="input-group">
        <label>Email / Username</label>
        <input 
          type="text" 
          placeholder="Enter your email or username" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input 
          type="password" 
          placeholder="Enter your password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="forgot-password">
        <a href="#">Forgot Password?</a>
      </div>
      <button type="submit" className="btn">Login</button>
      
      <div className="register-link">
        Don’t have an account?{' '}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onToggle(); // Switch to Register form
          }}
        >
          Register
        </a>
      </div>
      {message && <p className="success-message">{message}</p>}
    </form>
  );
}

function RegisterForm({ onToggle }) {
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullname, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        // Clear form fields if desired
        setFullname("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.error || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      setMessage("Error connecting to server");
    }
  };

  return (
    <form className="form" onSubmit={handleRegister}>
      <div className="input-group">
        <label>Full Name</label>
        <input 
          type="text" 
          placeholder="Enter your full name" 
          required 
          value={fullname}
          onChange={(e) => setFullname(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Email / Username</label>
        <input 
          type="email" 
          placeholder="Enter your email or username" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input 
          type="password" 
          placeholder="Enter your password" 
          required 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="input-group">
        <label>Confirm Password</label>
        <input 
          type="password" 
          placeholder="Confirm your password" 
          required 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button type="submit" className="btn">Register</button>
      <div className="register-link">
        Already have an account?{' '}
        <a 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onToggle(); // Switch back to Login form
          }}
        >
          Login
        </a>
      </div>
      {message && <p className="success-message">{message}</p>}
    </form>
  );
}

export default LoginPage;
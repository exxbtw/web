import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Registration from './components/Registration';
import Login from './components/Login';
import VideoUpload from './components/VideoUpload';
import VideoList from './components/VideoList';
import VideoDetail from './components/VideoDetail';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import backgroundImage from './assets/background.jpg';
import logoImage from './assets/logo.png';
import userIcon from './assets/user-icon.png';
import logoutIcon from './assets/logout-icon.png';
import './App.css';

function AppContent() {
  const { isAuthenticated, username, logout } = useContext(AuthContext);
  const navigate = useNavigate(); //Хук для перенаправления

  const handleLogout = () => {
    logout(); 
    navigate('/login'); 
  };

  return (
    <div
      className="app"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundBlendMode: 'overlay',
      }}
    >
      <header>
        <Link to="/" className="logo">
          <h1>ExxTube</h1>
        </Link>
        <nav>
          {!isAuthenticated ? (
            <>
              <Link to="/register">Регистрация</Link>
              <Link to="/login">Вход</Link>
              <Link to="/forgot-password">Забыли пароль?</Link>
            </>
          ) : (
            <>
              <div className="user-info">
                <span className="username">{username || 'Пользователь'}</span>
                <img src={userIcon} alt="User" className="user-icon" />
              </div>
              <Link to="/upload">Загрузить видео</Link>
              <button onClick={handleLogout} className="logout-button">
                <img src={logoutIcon} alt="Logout" className="logout-icon" />
              </button>
            </>
          )}
        </nav>
      </header>
      <Routes>
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<VideoUpload />} />
        <Route path="/" element={<VideoList />} />
        <Route path="/video/:id" element={<VideoDetail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />
      </Routes>
      <img src={logoImage} alt="Logo" className="bottom-left-logo" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
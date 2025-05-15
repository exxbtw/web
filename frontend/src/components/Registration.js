import React, { useState } from 'react';
import axios from 'axios';

function Registration() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://127.0.0.1:8000/api/register/', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      window.location.href = '/login';
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2>Регистрация</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" name="username" placeholder="Имя пользователя" value={formData.username} onChange={handleChange} required />
          <input type="email" name="email" placeholder="Электронная почта" value={formData.email} onChange={handleChange} required />
          <input type="password" name="password" placeholder="Пароль" value={formData.password} onChange={handleChange} required />
          <button type="submit">Зарегистрироваться</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="form-footer">
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>
    </div>
  );
}

export default Registration;
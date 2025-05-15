import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext'; // Импортируем контекст

function Login() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Получаем функцию login из контекста

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/login/', {
        username: formData.username,
        password: formData.password,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Ответ от сервера:', response.data);
      // Сохраняем токен и username через контекст
      login(response.data.access, formData.username);
      navigate('/'); // Перенаправляем на главную страницу
    } catch (err) {
      console.log('Ошибка:', err.response ? err.response.data : err.message);
      setError('Неверные данные или ошибка');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2>Вход</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Имя"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Войти</button>
        </form>
        {error && <p className="error">{error}</p>}
        <p className="form-footer">
          Нет аккаунта? <a href="/register">Зарегистрироваться</a>
        </p>
      </div>
    </div>
  );
}

export default Login;
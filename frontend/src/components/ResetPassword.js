import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function ResetPassword() {
  const { uid, token } = useParams();
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/reset-password/', {
        uid,
        token,
        new_password: password,
      });
      console.log('Ответ сервера:', response.data); // Отладка
      setMessage(response.data.message || 'Пароль успешно изменён.');
      setError('');
      setTimeout(() => (window.location.href = '/login'), 2000);
    } catch (err) {
      console.log('Ошибка:', err.response ? err.response.data : err.message); // Отладка
      setError(err.response?.data?.message || 'Ошибка при сбросе пароля.');
      setMessage('');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2>Сброс пароля</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            name="password"
            placeholder="Новый пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Сбросить пароль</button>
        </form>
        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
        <p className="form-footer">
          Вернуться к <a href="/login">входу</a>
        </p>
      </div>
    </div>
  );
}

export default ResetPassword;
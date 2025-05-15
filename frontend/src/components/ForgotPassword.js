import React, { useState } from 'react';
import axios from 'axios';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/forgot-password/', { email });
      console.log('Ответ сервера:', response.data); // Отладка
      setMessage(response.data.message || 'Инструкции по восстановлению пароля отправлены на ваш email.');
      setError('');
    } catch (err) {
      console.log('Ошибка:', err.response ? err.response.data : err.message); // Отладка
      setError(err.response?.data?.message || 'Ошибка при восстановлении пароля.');
      setMessage('');
    }
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2>Восстановление пароля</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Электронная почта"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">Отправить</button>
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

export default ForgotPassword;
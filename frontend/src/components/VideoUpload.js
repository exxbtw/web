import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function VideoUpload() {
  const [formData, setFormData] = useState({ title: '', description: '', video_file: null });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const textareaRef = useRef(null); // Ссылка на textarea для автоматического расширения

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    if (e.target.name === 'video_file') {
      setFormData({ ...formData, video_file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('video_file', formData.video_file);

    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/upload/', data, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка загрузки видео');
      if (textareaRef.current) textareaRef.current.style.height = 'auto'; // Сбрасываем высоту
    }
  };

  // Функция для автоматического расширения textarea
  const handleTextareaInput = (e) => {
    const textarea = e.target;
    textarea.style.height = 'auto'; // Сбрасываем высоту
    textarea.style.height = `${textarea.scrollHeight}px`; // Устанавливаем высоту по содержимому
  };

  return (
    <div className="form-wrapper">
      <div className="form-container">
        <h2>Загрузить видео</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="title"
            placeholder="Название"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ resize: 'none' }} // Запрещаем изменение размера
          />
          <textarea
            ref={textareaRef}
            name="description"
            placeholder="Описание"
            value={formData.description}
            onChange={handleChange}
            onInput={handleTextareaInput} // Добавляем обработчик для расширения
            style={{
              minHeight: '100px', // Минимальная высота
              resize: 'none', // Запрещаем ручное изменение размера
              overflow: 'hidden', // Убираем скроллбар
            }}
          />
          <input
            type="file"
            name="video_file"
            accept="video/*"
            onChange={handleChange}
            required
          />
          <button type="submit">Загрузить</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default VideoUpload;
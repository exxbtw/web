import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function VideoList() {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/videos/', {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Данные видео:', response.data); //Отладка
        setVideos(response.data);
      } catch (err) {
        console.log('Ошибка:', err.response ? err.response.data : err.message); //Отладка
        setError('Ошибка загрузки видео');
      }
    };
    fetchVideos();
  }, []);

  return (
    <div style={{ padding: '20px', color: 'white', minHeight: '100vh' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Последние видео</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {videos.length > 0 ? (
        <ul
          style={{
            listStyle: 'none',
            padding: '0 20px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(375px, 1fr))', 
            gap: '30px', 
          }}
        >
          {videos.map(video => (
            <li
              key={video.id}
              style={{
                background: '#2a3298',
                padding: '15px',
                borderRadius: '8px', 
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Link to={`/video/${video.id}`} style={{ textDecoration: 'none', width: '100%' }}>
                <div style={{ marginBottom: '15px' }}>
                  <video
                    width="100%"
                    height="auto"
                    controls={false}
                    muted
                    style={{
                      borderRadius: '8px',
                      aspectRatio: '16/9',
                      objectFit: 'cover',
                    }}
                  >
                    <source src={video.video_file} type="video/mp4" />
                    Ваш браузер не поддерживает воспроизведение видео.
                  </video>
                </div>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: 'white' }}>{video.title}</h3>
              </Link>
              <p style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#ccc' }}>
                Автор: {video.owner}
              </p>
              <p style={{ margin: '0', fontSize: '16px', color: '#ccc' }}>
                Загружено: {new Date(video.uploaded_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        !error && <p style={{ textAlign: 'center' }}>Нет доступных видео.</p>
      )}
    </div>
  );
}

export default VideoList;
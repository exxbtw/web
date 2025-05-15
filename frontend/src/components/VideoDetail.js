import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

function VideoDetail() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);

  const refreshToken = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (!refresh) throw new Error('Нет refresh-токена');
      const response = await axios.post('http://127.0.0.1:8000/api/token/refresh/', {
        refresh: refresh,
      });
      const newAccessToken = response.data.access;
      localStorage.setItem('access_token', newAccessToken);
      return newAccessToken;
    } catch (err) {
      console.log('Ошибка обновления токена:', err);
      setError('Сессия истекла. Пожалуйста, войдите снова.');
      return null;
    }
  };

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/videos/${id}/`);
        console.log('Ответ от API:', response.data);
        const data = response.data;
        const likes = parseInt(data.likes, 10) || 0;
        setVideo({ ...data, likes });
        setComments(data.comments && Array.isArray(data.comments) ? data.comments : []);
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const likeResponse = await axios.get(`http://127.0.0.1:8000/api/videos/${id}/is-liked/`, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            setLiked(likeResponse.data.liked || false);
          } catch (err) {
            if (err.response && err.response.status === 401) {
              const newToken = await refreshToken();
              if (newToken) {
                const likeResponse = await axios.get(`http://127.0.0.1:8000/api/videos/${id}/is-liked/`, {
                  headers: { 'Authorization': `Bearer ${newToken}` },
                });
                setLiked(likeResponse.data.liked || false);
              }
            }
          }
        }
      } catch (err) {
        console.log('Ошибка загрузки видео:', err);
        setError('Ошибка загрузки видео');
      }
    };
    fetchVideo();
  }, [id]);

  const handleLike = async () => {
    try {
      let token = localStorage.getItem('access_token');
      if (!token) {
        setError('Пожалуйста, войдите в систему, чтобы поставить/убрать лайк.');
        return;
      }
      let config = { headers: { 'Authorization': `Bearer ${token}` } };

      if (liked) {
        console.log('Отправляем DELETE-запрос на удаление лайка...');
        let response;
        try {
          response = await axios.delete(`http://127.0.0.1:8000/api/videos/${id}/like/`, config);
        } catch (err) {
          if (err.response && err.response.status === 401) {
            token = await refreshToken();
            if (!token) return;
            config = { headers: { 'Authorization': `Bearer ${token}` } };
            response = await axios.delete(`http://127.0.0.1:8000/api/videos/${id}/like/`, config);
          } else {
            throw err;
          }
        }
        console.log('Ответ от удаления лайка:', response.data);
        const newData = await axios.get(`http://127.0.0.1:8000/api/videos/${id}/`, config);
        const likes = parseInt(newData.data.likes, 10) || 0;
        setVideo({ ...newData.data, likes });
        const likeResponse = await axios.get(`http://127.0.0.1:8000/api/videos/${id}/is-liked/`, config);
        setLiked(likeResponse.data.liked || false);
      } else {
        console.log('Отправляем POST-запрос на добавление лайка...');
        let response;
        try {
          response = await axios.post(`http://127.0.0.1:8000/api/videos/${id}/like/`, {}, config);
        } catch (err) {
          if (err.response && err.response.status === 401) {
            token = await refreshToken();
            if (!token) return;
            config = { headers: { 'Authorization': `Bearer ${token}` } };
            response = await axios.post(`http://127.0.0.1:8000/api/videos/${id}/like/`, {}, config);
          } else {
            throw err;
          }
        }
        console.log('Ответ от лайка:', response.data);
        const newData = await axios.get(`http://127.0.0.1:8000/api/videos/${id}/`, config);
        const likes = parseInt(newData.data.likes, 10) || 0;
        setVideo({ ...newData.data, likes });
        const likeResponse = await axios.get(`http://127.0.0.1:8000/api/videos/${id}/is-liked/`, config);
        setLiked(likeResponse.data.liked || false);
      }
    } catch (err) {
      console.log('Ошибка с лайком:', err.response ? err.response.data : err.message);
      setError('Ошибка с лайком: ' + (err.response ? err.response.statusText : err.message));
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      let token = localStorage.getItem('access_token');
      if (!token) {
        setError('Пожалуйста, войдите в систему, чтобы оставить комментарий.');
        return;
      }
      let config = { headers: { 'Authorization': `Bearer ${token}` } };
      let response;
      try {
        response = await axios.post(`http://127.0.0.1:8000/api/videos/${id}/comment/`, { text: commentText }, config);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          token = await refreshToken();
          if (!token) return;
          config = { headers: { 'Authorization': `Bearer ${token}` } };
          response = await axios.post(`http://127.0.0.1:8000/api/videos/${id}/comment/`, { text: commentText }, config);
        } else {
          throw err;
        }
      }
      console.log('Ответ от комментария:', response.data);
      setComments([...comments, response.data]);
      setCommentText('');
    } catch (err) {
      console.log('Ошибка добавления комментария:', err.response ? err.response.data : err.message);
      setError('Ошибка добавления комментария: ' + (err.response ? err.response.statusText : err.message));
    }
  };

  if (!video) return <p style={{ color: 'white', textAlign: 'center' }}>Загрузка...</p>;

  return (
    <div style={{ padding: '20px', color: 'white', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <video
          controls
          style={{ width: '100%', height: 'auto', borderRadius: '10px', marginBottom: '20px' }}
          onError={(e) => console.log('Ошибка воспроизведения видео:', e.target.src, e)}
        >
          <source src={video.video_file} type="video/mp4" />
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
        <h2 style={{ margin: '10px 0', fontSize: '24px' }}>{video.title}</h2>
        <p style={{ margin: '5px 0', fontSize: '16px', color: '#ccc' }}>
          Автор: {video.owner}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
          <button
            onClick={handleLike}
            style={{
              background: 'none',
              border: 'none',
              color: liked ? '#ff0000' : 'white',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ❤️ {parseInt(video.likes, 10) || 0}
          </button>
        </div>
        <p style={{ margin: '10px 0' }}>{video.description}</p>
        <p style={{ margin: '10px 0', fontSize: '14px' }}>Загружено: {new Date(video.uploaded_at).toLocaleString()}</p>

        <h3 style={{ margin: '20px 0 10px' }}>Комментарии</h3>
        {comments.length > 0 ? (
          comments.map(comment => (
            <div
              key={comment.id}
              style={{
                background: '#2a5298',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '10px',
              }}
            >
              <strong style={{ color: '#fff' }}>{comment.user}</strong>: {comment.text}
              <span style={{ fontSize: '12px', color: '#ccc', marginLeft: '10px' }}>
                {new Date(comment.created_at).toLocaleString()}
              </span>
            </div>
          ))
        ) : (
          <p>Пока нет комментариев.</p>
        )}

        {localStorage.getItem('access_token') ? (
          <form onSubmit={handleComment} style={{ marginTop: '20px' }}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Оставьте комментарий..."
              required
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #ccc',
                marginBottom: '10px',
                resize: 'none', // Запрещаем ручное изменение размера
              }}
            />
            <button
              type="submit"
              style={{
                background: '#2a5298',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              Отправить
            </button>
          </form>
        ) : (
          <p style={{ color: '#ccc' }}>Войдите, чтобы оставить комментарий.</p>
        )}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>
    </div>
  );
}

export default VideoDetail;
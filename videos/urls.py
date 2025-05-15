from django.urls import path
from . import views
from .views import RegisterView, VideoUploadView, VideoListView, VideoDetailView, LikeVideoView, CommentVideoView, ForgotPasswordView, IsLikedView, DeleteCommentView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # API
    path('api/register/', RegisterView.as_view(), name='api-register'),
    path('api/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/upload/', VideoUploadView.as_view(), name='video-upload'),
    path('api/videos/', VideoListView.as_view(), name='video-list'),
    path('api/videos/<int:id>/', VideoDetailView.as_view(), name='video-detail'),
    path('api/videos/<int:id>/like/', LikeVideoView.as_view(), name='video-like'),
    path('api/videos/<int:id>/comment/', CommentVideoView.as_view(), name='video-comment'),
    path('api/videos/<int:id>/comment/<int:comment_id>/', DeleteCommentView.as_view(), name='delete-comment'),
    path('api/videos/<int:id>/is-liked/', IsLikedView.as_view(), name='is-liked'),
    path('api/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),

    # HTML
    path('', views.home, name='home'),
    path('upload/', views.upload_video, name='upload_video'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('video/<int:video_id>/', views.video_detail, name='video_detail'),
    path('video/<int:video_id>/like/', views.add_like, name='add_like'),
    path('video/<int:video_id>/comment/', views.add_comment, name='add_comment'),
]
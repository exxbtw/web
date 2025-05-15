from django.shortcuts import render, redirect, get_object_or_404
from rest_framework import generics, permissions, status
from django.contrib.auth.models import User
from .models import Video, Comment, Like
from .serializers import RegisterSerializer, VideoSerializer, CommentSerializer
from .forms import VideoForm
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from rest_framework.views import APIView
from rest_framework.response import Response
import requests
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

# HTML Views
def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        response = requests.post('http://127.0.0.1:8000/api/login/', data={'username': username, 'password': password})
        if response.status_code == 200:
            tokens = response.json()
            request.session['access_token'] = tokens['access']
            return redirect('home')
        else:
            return render(request, 'login.html', {'error': 'Неверные данные или ошибка API'})
    return render(request, 'login.html')

def register_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST.get('email', '')
        password = request.POST['password']
        response = requests.post('http://127.0.0.1:8000/api/register/', data={
            'username': username,
            'email': email,
            'password': password
        })
        if response.status_code == 201:
            return redirect('login')
        else:
            return render(request, 'register.html', {'error': response.json().get('message', 'Ошибка регистрации')})
    return render(request, 'register.html')

def home(request):
    videos = Video.objects.order_by('-uploaded_at')
    return render(request, 'home.html', {'videos': videos})

@login_required(login_url='login')
def upload_video(request):
    if request.method == 'POST':
        form = VideoForm(request.POST, request.FILES)
        if form.is_valid():
            video = form.save(commit=False)
            video.owner = request.user
            access_token = request.session.get('access_token')
            headers = {'Authorization': f'Bearer {access_token}'}
            files = {'video_file': request.FILES['video_file']}
            data = {'title': form.cleaned_data['title'], 'description': form.cleaned_data['description']}
            response = requests.post('http://127.0.0.1:8000/api/upload/', headers=headers, files=files, data=data)
            if response.status_code == 201:
                return redirect('home')
    else:
        form = VideoForm()
    return render(request, 'upload.html', {'form': form})

def video_detail(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    comments = video.comments.all()
    return render(request, 'video_detail.html', {'video': video, 'comments': comments})

@login_required
def add_like(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    if request.method == 'POST':
        like = video.likes.filter(user=request.user).first()
        if like:
            like.delete()
        else:
            video.likes.create(user=request.user)
    return redirect('video_detail', video_id=video_id)

@login_required
def add_comment(request, video_id):
    video = get_object_or_404(Video, id=video_id)
    if request.method == 'POST':
        text = request.POST.get('text')
        if text:
            video.comments.create(user=request.user, text=text)
    return redirect('video_detail', video_id=video_id)

# API Views
class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': 'Пользователь зарегистрирован'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VideoUploadView(generics.CreateAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class VideoListView(generics.ListAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer

class VideoDetailView(generics.RetrieveAPIView):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
    lookup_field = 'id'

class CommentVideoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        video = get_object_or_404(Video, id=id)
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, video=video)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeleteCommentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id, comment_id):
        video = get_object_or_404(Video, id=id)
        comment = get_object_or_404(Comment, id=comment_id, video=video)
        if comment.user != request.user:
            return Response({'message': 'Вы не можете удалить чужой комментарий.'}, status=status.HTTP_403_FORBIDDEN)
        comment.delete()
        return Response({'message': 'Комментарий удалён.'}, status=status.HTTP_200_OK)

# Views for Password Reset
class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
            send_mail(
                subject='Сброс пароля на ExxTube',
                message=f'Перейдите по ссылке для сброса пароля: {reset_link}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
            return Response({'message': 'Инструкции по восстановлению пароля отправлены на ваш email.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'Пользователь с таким email не найден.'}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    def post(self, request):
        uid = request.data.get('uid')
        token = request.data.get('token')
        new_password = request.data.get('new_password')

        try:
            uid = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=uid)
            if default_token_generator.check_token(user, token):
                user.set_password(new_password)
                user.save()
                return Response({'message': 'Пароль успешно изменён.'}, status=status.HTTP_200_OK)
            return Response({'message': 'Недействительная ссылка для сброса пароля.'}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({'message': 'Недействительная ссылка для сброса пароля.'}, status=status.HTTP_400_BAD_REQUEST)

class IsLikedView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        video = get_object_or_404(Video, id=id)
        is_liked = video.likes.filter(user=request.user).exists()
        return Response({'liked': is_liked}, status=status.HTTP_200_OK)

class LikeVideoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        video = get_object_or_404(Video, id=id)
        if not video.likes.filter(user=request.user).exists():
            video.likes.create(user=request.user)
            return Response({'likes': video.likes.count()}, status=status.HTTP_201_CREATED)
        return Response({'message': 'Вы уже поставили лайк'}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id):
        video = get_object_or_404(Video, id=id)
        like = video.likes.filter(user=request.user).first()
        if like:
            like.delete()
            return Response({'likes': video.likes.count()}, status=status.HTTP_200_OK)
        return Response({'message': 'Лайк не найден'}, status=status.HTTP_400_BAD_REQUEST)
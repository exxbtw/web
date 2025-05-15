from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Video, Comment

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password']
        )
        return user

class CommentSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = '__all__'
        read_only_fields = ['user', 'video', 'created_at']

class VideoSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    likes = serializers.SerializerMethodField()
    owner = serializers.CharField(source='owner.username', read_only=True)  

    class Meta:
        model = Video
        fields = ['id', 'title', 'description', 'video_file', 'uploaded_at', 'likes', 'comments', 'owner']  # Добавляем owner в fields

    def get_likes(self, obj):
        return obj.likes.count()

    def get_video_file(self, obj):
        request = self.context.get('request')
        if obj.video_file and request:
            return request.build_absolute_uri(obj.video_file.url)
        return None
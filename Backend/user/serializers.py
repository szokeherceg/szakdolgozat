from rest_framework import serializers
from .models import User, HorseData, UserHorse

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'lang', 'date_joined', 'is_active']

    def create(self, validated_data):
        lang = validated_data.get('lang', 'hu')
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            name=validated_data['name'],
            lang=lang
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(username=email, password=password) # type: ignore
        if user is None:
            raise serializers.ValidationError("Invalid email or password")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled")
        return {"user": user}
    
class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'password', 'lang', 'date_joined', 'is_active']

class HorseDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = HorseData
        fields = ["id","name", "weight","gender", "breed", "age", "image","video", "desc","created_at", "updated_at"]
        
class UserHorseSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    horse = HorseDataSerializer(read_only=True)

    class Meta:
        model = UserHorse
        fields = ['user', 'horse', 'created_at']

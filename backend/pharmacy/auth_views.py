from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view
from rest_framework.response import Response


@api_view(['POST'])
def register_user(request):
    name = request.data.get('name', '').strip()
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    if not name or not email or len(password) < 6:
        return Response({'error': 'Name, email and a 6+ character password are required'}, status=400)
    if User.objects.filter(username=email).exists():
        return Response({'error': 'Account already exists. Please sign in.'}, status=400)
    user = User.objects.create_user(username=email, email=email, password=password, first_name=name)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'name': user.first_name})


@api_view(['POST'])
def login_user(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')
    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'Wrong email or password'}, status=400)
    token, _ = Token.objects.get_or_create(user=user)
    return Response({'token': token.key, 'name': user.first_name})


@api_view(['POST'])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    user = User.objects.filter(username=email).first()
    if user:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        link = f"http://localhost:5173/?uid={uid}&token={token}"
        send_mail(
            'Reset your MediRoyal password',
            f'Click this link to reset your password:\n{link}',
            'noreply@mediroyal.local',
            [email],
        )
    return Response({'message': 'If this email is registered, a reset link has been sent.'})


@api_view(['POST'])
def reset_password(request):
    uid = request.data.get('uid', '')
    token = request.data.get('token', '')
    password = request.data.get('password', '')
    if len(password) < 6:
        return Response({'error': 'Password must be 6+ characters'}, status=400)
    try:
        user = User.objects.get(pk=force_str(urlsafe_base64_decode(uid)))
    except (User.DoesNotExist, ValueError, TypeError, OverflowError):
        return Response({'error': 'Invalid link'}, status=400)
    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Link expired or invalid'}, status=400)
    user.set_password(password)
    user.save()
    return Response({'message': 'Password changed. Please sign in.'})
from django.urls import path
from . import views
from . import auth_views
from . import order_views

urlpatterns = [
    path('search/', views.search_medicine),
    path('scan/', views.scan_prescription),
    path('register/', auth_views.register_user),
    path('login/', auth_views.login_user),
    path('forgot/', auth_views.forgot_password),
    path('reset/', auth_views.reset_password),
    path('orders/place/', order_views.place_order),
    path('orders/', order_views.my_orders),
]